# Karmada v1.3：更优雅 更精准 更高效

Karmada是开放的多云多集群容器编排引擎，旨在帮助用户在多云环境下部署和运维业务应用。凭借兼容Kubernetes原生API的能力，Karmada可以平滑迁移单集群工作负载，并且仍可保持与Kubernetes周边生态工具链协同。

在最新发布的1.3版本中，Karmada重新设计了应用跨集群故障迁移功能，实现了基于污点的故障驱逐机制，并提供平滑的故障迁移过程，可以有效保障服务迁移过程的连续性（不断服）。

本版本新增加的特性：
- 增加了面向多集群的资源代理新特性，通过该代理平台业务方可以在不感知多集群的情况下，以单集群访问姿势直接操纵部署在多集群的工作负载；
- 提供针对集群资源建模能力，通过自定义的集群资源模型，调度器可以更精准地进行资源调度；
- 提供基于Bootstrap令牌来注册Pull模式集群的能力，不仅可以简化集群注册过程，还可以方便地进行权限控制；

此外，基于生产环境的用户反馈，本版本还进行了诸多性能优化，系统运行过程中CPU和内存资源需求大大降低，详细的性能测试报告稍后发布。

与之前版本一样，v1.3与前面的版本仍然保持兼容，前面版本的用户仍可以平滑升级。

<!--truncate-->

## 新特性概览

### 基于污点的优雅驱逐

当集群被判定为故障，并且故障时间超过宽限期（默认5分钟）之后，Karmada将为故障集群添加`NoExecute`污点，随后新引入的taint-manager控制器将开始驱逐该故障集群上的工作负载，接着调度器重新调度被驱逐的工作负载至新的可用集群，如果用户开启了GracefulEviction特性，被驱逐的工作负载并不会被立即删除，而是延迟到新的工作负载运行之后，可以保障驱逐过程中业务不中断。

整体故障迁移过程可以表示成："集群故障判定" → "负载预驱逐" → "重新调度" → "清理冗余负载"。

此处，无论故障判定还是驱逐，用户都可以参过参数来控制：
- `--failover-eviction-timeout`，指定从调度结果中删除故障集群的宽限期，默认5分钟
- `--default-not-ready-toleration-seconds`，指定默认情况下添加到尚未具有`notReady:NoExecute`容忍的传播策略上的容忍时间，默认300秒
- `--default-unreachable-toleration-seconds`，指定默认情况下添加到尚未具有`unreachable:NoExecute`容忍的传播策略上的容忍时间，默认300秒
- `--graceful-eviction-timeout`，指定自工作负载已移动到优雅驱逐任务以来，等待优雅驱逐控制器执行最终删除的超时时间，默认时长10分钟

### 跨多群集资源的全局代理

Karmada在1.2版本中新增了一个`karmada-search`组件，该组件为选装组件，用于缓存集群中部署的资源对象和事件，并通过搜索API对外提供检索服务。

1.3版本中，我们在该组件中引入了一个新的代理功能，允许用户以访问单集群的方式访问多集群中的资源，无论资源是否由Karmada管理，利用代理功能，用户可以统一通过Karmada控制面来操作成员集群中的资源。

用户可以使用ResourceRegistry API来指定缓存的资源类型以及数据源（目标集群），例如以下配置表示从member1 和member2两个集群中缓存Pod与Node资源：

```yaml
apiVersion: search.karmada.io/v1alpha1
kind: ResourceRegistry
metadata:
  name: proxy-sample
  spec:
    targetCluster:
      clusterNames:
      - member1
      - member2
      resourceSelectors:
      - apiVersion: v1
        kind: Pod
      - apiVersion: v1
        kind: Node
```

将该配置提交给karmada-apiserver之后，便可使用URL：`/apis/search.karmada.io/v1alpha1/proxying/karmada/proxy/api/v1/namespaces/default/pods`来进行集群资源访问。该URL中`/apis/search.karmada.io/v1alpha1/proxying/karmada/proxy`为固定前缀，后面部分与Kubernetes原生API路径完全一致。

关于该特性的更多信息可以参考：https://karmada.io/docs/userguide/globalview/proxy-global-resource/

### 基于自定义集群资源模型的调度

在集群调度的过程中，karmada-scheduler会基于一系列的因素来做调度决策，其中一个不可或缺的因素就是集群的可用资源。之前的版本中，Karmada采用了一种通用的资源模型ResourceSummary来抽象集群的可用情况，如下所示：

```yaml
resourceSummary:
  allocatable:
    cpu: "1024"
    memory: 4096Mi
    pods: "110"
  allocated:
    cpu: "512"
    memory: 2048Mi
    pods: "64"
```

但是ResourceSummary机械地累加了集群中所有节点的资源，忽视了节点上的碎片资源，这会导致资源需求较大的Pod无法准确地调度到合适的集群。同时它也忽视了不同用户的集群中节点可分配的资源不完全相同的特点。

1.3版本中Karmada引入了一种新的方式——自定义集群资源模型，来抽象集群的可用资源情况，旨在使调度器调度集群的结果更精确。用户可以启用--CustomizedClusterResourceModeling的特性开关来启用这一特性，开启后，在集群被Karmada所纳管后，Karmada会自动地为集群设置默认的资源模型，这一资源模型将集群中的各个节点分为不同等级的模型，默认的资源模型将根据CPU和内存这两项资源指标把节点分为9个不同的等级，如下所示：

```yaml
resourceModels:
- grade: 0
  ranges:
  - max: "1"
    min: "0"
    name: cpu
  - max: 4Gi
    min: "0"
    name: memory
- grade: 1
  ranges:
  - max: "2"
    min: "1"
    name: cpu
  - max: 16Gi
    min: 4Gi
    name: memory
.....
- grade: 8
  ranges:
  - max: "9223372036854775807"
    min: "128"
    name: cpu
  - max: "9223372036854775807"
    min: 1Ti
    name: memory
```

Cluster-status-controller将会收集集群内的节点、Pod信息计算对应模型节点的数量，与此同时，karmada-scheduler根据将要调度的实例资源请求比较不同集群中满足要求的节点数，并将实例调度到满足要求的节点更多的集群。

同时，在一些场景下，默认的集群资源模型不能满足用户特定集群的需求，现在用户可以通过kubectl edit cluster命令自定义地设置集群的资源模型，使资源模型能够更好地拟合集群的资源拓扑。

### 基于Bootstrap令牌的集群注册

1.3版本中，对于 Pull 模式下的集群，我们提供了一种通过命令行向 Karmada 控制面注册的方式。现在通过karmadactl token命令我们可以轻松的创建Bootstrap启动令牌的token，token的默认有效时长是24小时。

```shell
$ karmadactl token create --print-register-command --kubeconfig /etc/karmada/karmada-apiserver.config
```

```shell
# The example output is shown below
karmadactl register 10.10.x.x:32443 --token t2jgtm.9nybj0526mjw1jbf --discovery-token-ca-cert-hash sha256:f5a5a43869bb44577dba582e794c3e3750f2050d62f1b1dc80fd3d6a371b6ed4
```

通过karmadactl register命令可以在不复制成员集群kubeconfig的情况下非常轻松地完成包括部署karmada-agent在内的注册过程，增强了控制面以Pull模式纳管成员集群的易用性和安全性。

```shell
$ karmadactl register 10.10.x.x:32443 --token t2jgtm.9nybj0526mjw1jbf --discovery-token-ca-cert-hash sha256:f5a5a43869bb44577dba582e794c3e3750f2050d62f1b1dc80fd3d6a371b6ed4

 # The example output is shown below
 [preflight] Running pre-flight checks
 [prefligt] All pre-flight checks were passed
 [karmada-agent-start] Waiting to perform the TLS Bootstrap
 [karmada-agent-start] Waiting to construct karmada-agent kubeconfig
 [karmada-agent-start] Waiting the necessary secret and RBAC
 [karmada-agent-start] Waiting karmada-agent Deployment
 W0825 11:03:12.167027 29336 check.go:52] pod: karmada-agent-5d659b4746-wn754 not ready. status: ContainerCreating
 ......
 I0825 11:04:06.174110 29336 check.go:49] pod: karmada-agent-5d659b4746-wn754 is ready. status: Running

 cluster(member3) is joined successfully
```

### 版本升级

我们验证了从Karmada 1.2版本到1.3版本的升级路径，升级过程平滑，可参考升级文档：https://karmada.io/docs/administrator/upgrading/v1.2-v1.3

## 致谢贡献者

Karmada v1.3版本包含了来自51位贡献者的数百次代码提交，在此对各位贡献者表示由衷的感谢：

贡献者GitHub ID：

@AllenZMC
@calvin0327
@carlory
@CharlesQQ
@Charlie17Li
@chaunceyjiang
@cutezhangq
@dapengJacky
@dddddai
@duanmengkk
@Fish-pro
@Garrybest
@gy95
@halfrost
@hanweisen
@huntsman-li
@ikaven1024
@joengjyu
@JoshuaAndrew
@kerthcet
@kevin-wangzefeng
@kinzhi
@likakuli
@lonelyCZ
@luoMonkeyKing
@maoyangLiu
@mathlsj
@mikeshng
@Momeaking
@mrlihanbo
@my-git9
@nuclearwu
@Poor12
@prodanlabs
@RainbowMango
@suwliang3
@TheStylite
@wawa0210
@weilaaa
@windsonsea
@wlp1153468871
@wuyingjun-lucky
@XiShanYongYe-Chang
@xuqianjins
@xyz2277
@yusank
@yy158775
@zgfh
@zhixian82
@zhuwint
@zirain

## 参考链接

- Release Notes：https://github.com/karmada-io/karmada/releases/tag/v1.3.0
- 集群故障迁移使用指导：https://karmada.io/docs/userguide/failover/#concept
- 多集群资源全局代理使用指导：https://karmada.io/docs/userguide/globalview/proxy-global-resource/
- 集群资源模型使用指导：https://karmada.io/docs/userguide/scheduling/cluster-resources
- 基于Bootstrap令牌的集群注册使用指导：https://karmada.io/docs/userguide/clustermanager/cluster-registration