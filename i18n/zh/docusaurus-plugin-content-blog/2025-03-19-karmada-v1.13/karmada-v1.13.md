# Karmada v1.13 版本发布！新增应用优先级调度能力

Karmada 是开放的多云多集群容器编排引擎，旨在帮助用户在多云环境下部署和运维业务应用。凭借兼容 Kubernetes 原生 API 的能力，Karmada 可以平滑迁移单集群工作负载，并且仍可保持与 Kubernetes 周边生态工具链协同。

![karmada](./img/karmada.png)

[Karmada v1.13 版本](https://github.com/karmada-io/karmada/releases/tag/v1.13.0) 现已发布，本版本包含下列新增特性：

- 新增应用优先级调度功能，可用于保证关键作业时效性
- 新增应用调度暂停与恢复功能，可用于构建多集群队列系统
- Karmada Operator 功能持续演进
- Karmada 控制器性能优化提升
- Karmada Dashboard 首个版本发布！开启多云编排可视化新篇章

## 新特性概览

### 应用优先级调度

当前，Karmada 调度器调度负载时遵循 FIFO 策略，按照负载进入调度队列的次序依次调度。但在某些场景，比如AI训练类作业平台，用户希望工作负载能够按照优先级进行调度。这样当高优先级、紧急任务进入调度队列时，可以实现"插队"的效果，从而确保关键业务的时效性与服务质量。

从 v1.13.0 版本起，用户使用 PropagationPolicy 分发负载时可以指定调度优先级(.spec.SchedulePriority字段)。SchedulePriority 会指向用户事先配置的优先级类，Karmada 解析该优先级类并获取对应的优先级数值，值越大，调度优先级越高。

例如，需要在环境中部署 A，B 两种应用，应用A 负责在线交易这类对实时性要求高的业务，而应用B 负责定期日志清理等非紧急且对时间不敏感的业务。为确保在资源紧张时，应用A 能优先被调度，可以给应用A 配置较大的优先级类。

应用A 的优先级类和 PropagationPolicy 配置：

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
   name: high-priority
value: 1000000

---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-a
spec:
   schedulePriority:
      priorityClassSource: KubePriorityClass
      priorityClassName: high-priority
   placement:
      clusterAffinity:
         clusterNames:
            - member1
   resourceSelectors:
      - apiVersion: apps/v1
        kind: Deployment
        name: application-a
```

应用B 的优先级类和 PropagationPolicy 配置：

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
   name: low-priority
value: 1

---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-b
spec:
   schedulePriority:
      priorityClassSource: KubePriorityClass
      priorityClassName: low-priority
   placement:
      clusterAffinity:
         clusterNames:
            - member1
   resourceSelectors:
      - apiVersion: apps/v1
        kind: Deployment
        name: application-b
```

通过上述配置，当调度队列同时存在应用A 和 应用B 的工作负载时，应用A 会被优先调度，即便应用B 先进入队列。

更多有关应用优先级调度的资料请参考：[应用优先级调度](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/binding-priority-preemption)

### 应用调度暂停与恢复

应用从 Karmada 控制面分发到成员集群大致可以分为两个环节：

- **应用调度：** Karmada 调度器根据分发策略为应用选择合适的集群。
- **应用分发：** Karmada 控制器按照调度结果将应用分发到指定的集群。

Karmada 现已支持应用调度及分发过程的启停控制，这一能力为用户提供了灵活的调度管理手段。基于此，用户可根据实际业务需求，构建定制化的高级调度策略。例如，可将其与业务发布流程相结合，实现联邦应用跨集群的滚动升级；也可结合工作负载优先级，达成队列与工作负载的优先级调度。其中应用分发环节的暂停与恢复是在 v1.11.0 版本引入的功能，详细请参考：[应用分发暂停与恢复](https://karmada.io/docs/next/userguide/scheduling/resource-propagating/#suspend-and-resume-of-resource-propagation)。而在 v1.13.0 版本，Karmada 正式引入了应用调度环节的暂停与恢复。

社区在字段 ResourceBinding.Spec.Suspension 中新增了字段 Scheduling，用于控制应用调度的暂停与恢复。当 Suspension.Scheduling 为 true 时，应用调度暂停。当 Suspension.Scheduling 为 false 时，应用调度恢复。此功能可以与第三方系统集成，通过控制 ResourceBinding 的 Suspension.Scheduling 的字段值，实现对应用调度过程的精准控制。例如，在创建 ResourceBinding 时，可通过 webhook 将 Suspension.Scheduling 设置为 true 以暂停调度；随后，可对应用进行优先级排序、容量规划等操作；待相关操作完成后，设置 Suspension.Scheduling 为 false 即可恢复调度，最终实现有序调度/资源配额管理等高级能力。

更多有关应用调度暂停与恢复的资料请参考：[应用调度暂停与恢复能力](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling-suspension)

### Karmada Operator 功能持续演进

本版本持续增强 Karmada Operator，新增以下功能：

- 支持配置 API Server 边车容器：用户可通过此功能为 Karmada API Server 配置边车容器，从而集成辅助服务。例如，可集成 [KMS 插件](https://kubernetes.io/docs/tasks/administer-cluster/kms-provider/)，实现静态数据加密。

    更多有关 API Server 边车容器配置的资料请参考：[支持配置 API Server 边车容器](https://github.com/karmada-io/karmada/tree/master/docs/proposals/karmada-operator/api-server-sidecard-containers)

- 支持配置组件优先级类：用户可通过自定义 Karmada CR 为控制平面组件指定优先级类，确保关键组件以适当的优先级进行调度，从而提升 Karmada 系统的可靠性和稳定性。

    更多有关组件优先级类配置的资料请参考：[如何为 Karmada 控制平面组件配置优先级类](https://karmada.io/docs/administrator/configuration/priority-class-configuration/#how-to-configure-priority-classes-for-karmada-control-plane-components)

以上新特性进一步提升了 Karmada Operator 的可配置性，满足用户多样化需求。

### Karmada 控制器性能优化提升

随着 Karmada 被业界广泛采纳，以及部署的规模不断提升，性能优化也成了 Karmada 关注和发力的重要方向。社区成立了性能优化团队，专门分析和优化 Karmada 关键组件的性能，并已取得了显著的成效。

在版本 v1.13.0，Karmada 的性能优化主要集中在控制器，减少大规模数据部署场景下，控制器重启时的性能开销。为了验证性能优化的成效，社区准备了 12C CPU, 28G RAM 的物理机，并部署了 1000 个 Deployments 和 1000个 Configmaps，共生成 2000 个 ResourceBindings。在重启组件 karmada-controller-manager 后，收集 workqueue 的指标，结果如下：

- **对于 Detector 控制器：** 队列 Reconcile 时间降低了60%。
- **对于 binding-controller 控制器：** 队列 Reconcile 时间降低了25%。

这些指标显示了在版本 v1.13.0，控制器 Detector 和 binding-controller 在重启场景下存量资源重新编排的性能有了显著的提升。

### Karmada Dashboard 首个版本发布

经过数位热心开发者的持续努力，Karmada Dashboard 终于迎来了具有里程碑意义的第一个版本（v0.1.0）！这一版本标志着 Karmada 在可视化管理领域迈出了重要的一步。

Karmada Dashboard 是一款专为 Karmada 用户设计的图形化界面工具，旨在简化多集群管理的操作流程，提升用户体验。通过 Dashboard，用户可以直观地查看集群状态、资源分布以及任务执行情况，同时还能轻松完成配置调整和策略部署。

Karmada Dashboard v0.1.0 主要功能包括：

- 集群管理： 提供集群接入和状态概览，包括健康状态、节点数量等关键指标。
- 资源管理：业务资源配置管理，包括命名空间、工作负载、服务等。
- 策略管理：Karmada 策略管理，包括分发策略、差异化策略等。

更多有关 Karmada Dashboard 的资料请参考：[Karmada Dashboard](https://github.com/karmada-io/dashboard)

## 致谢贡献者

Karmada v1.13 版本包含了来自 41 位贡献者的 205 次代码提交，在此对各位贡献者表示由衷的感谢：


| ^-^                 | ^-^                 | ^-^                |
|---------------------|---------------------|--------------------|
| @adwait-godbole     | @anujagrawal699     | @axif0             |
| @carlory            | @chaosi-zju         | @CharlesQQ         |
| @chouchongYHMing    | @devadapter         | @dongjiang1989     |
| @gabrielsrs         | @guozheng-shen      | @Heylosky          |
| @iawia002           | @jabellard          | @jhnine            |
| @JimDevil           | @LavredisG          | @LeonZh0u          |
| @LiZhenCheng9527    | @ls-2018            | @mohamedawnallah   |
| @Monokaix           | @mszacillo          | @RainbowMango      |
| @sachinparihar      | @samzong            | @seanlaii          |
| @shauvet            | @SkySingh04         | @tiansuo114        |
| @Vacant2333         | @vibgreon           | @warjiang          |
| @whitewindmills     | @XiShanYongYe-Chang | @y1hao             |
| @yashpandey06       | @zach593            | @zhouqunjie-cs     |
| @zhzhuang-zju       | @ZwangaMukwevho     |                    |


![karmada v1.13 contributors](./img/contributors.png)
