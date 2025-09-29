---
title: 资源分发
---

Karmada 提供了 [PropagationPolicy](https://github.com/karmada-io/karmada/blob/master/pkg/apis/policy/v1alpha1/propagation_types.go#L13) 和 [ClusterPropagationPolicy](https://github.com/karmada-io/karmada/blob/master/pkg/apis/policy/v1alpha1/propagation_types.go#L292) 两种 API 用于资源分发。关于这两种 API 的区别，可参考 [此处](../../faq/faq.md#what-is-the-difference-between-propagationpolicy-and-clusterpropagationpolicy)。

本文将以 PropagationPolicy 为例，介绍资源分发的具体操作方法。

## 前提条件

请先 [安装 Karmada](../../installation/installation.md)，并准备好 [karmadactl 命令行工具](../../installation/install-cli-tools.md)。

> 注意：在此之前，我们需要将 kubectl 指向 `<karmada-apiserver.config>`，而不是成员集群。

## 部署最简单的多集群 Deployment

### 创建 PropagationPolicy 对象

可通过创建 YAML 文件定义的 PropagationPolicy 对象来分发 Deployment 资源。例如，以下 YAML 文件描述了：需将 default 命名空间下名为 nginx 的 Deployment 对象分发到 member1 集群：

```yaml
# propagationpolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: example-policy # The default namespace is `default`.
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx # If no namespace is specified, the namespace is inherited from the parent object scope.
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

1. 基于上述 YAML 文件创建分发策略:
```shell
kubectl apply -f propagationpolicy.yaml
```
2. 创建名为 nginx 的 Deployment:
```shell
kubectl create deployment nginx --image nginx
```
> 注意：该资源在 Karmada 中仅作为模板存在；分发到成员集群后，其行为与单 Kubernetes 集群中的资源行为一致。
> 
> 注意：资源与分发策略的创建无先后顺序要求。

3. 查看 Deployment 的分发状态:
```shell
karmadactl get deployment
```
输出结果示例如下：
```shell
NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx   member1   1/1     1            1           52s   Y
```

4. 查看该 Deployment 在成员集群中创建的 Pod:
```shell
karmadactl get pod -l app=nginx
```
输出结果示例如下：
```shell
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-s7vv9   member1   1/1     Running   0          52s
```

### 更新分发策略

可通过应用新的 YAML 文件来更新分发策略。例如，以下 YAML 文件将 nginx Deployment 的分发目标修改为 member2 集群：

```yaml
# propagationpolicy-update.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: example-policy
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames: # Modify the selected cluster to propagate the Deployment.
        - member2
```

1. 应用更新后的 YAML 文件:
```shell
kubectl apply -f propagationpolicy-update.yaml
```
2. 更新后，查看 Deployment 信息（输出示例如下）:
```shell
NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx   member2   1/1     1            1           5s    Y
```
3. 查看更新后 Deployment 对应的 Pod（输出示例如下）:
```shell
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-8t8cc   member2   1/1     Running   0          17s
```

### 更新 Deployment

可直接更新 Karmada 中的 Deployment 模板，修改会自动同步到所有成员集群。

1. 将 Deployment 的副本数（replicas）更新为 2
2. 更新后查看 Deployment 信息（输出示例如下）:
```shell
NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE     ADOPTION
nginx   member2   2/2     2            2           7m59s   Y
```
3. 查看更新副本数后对应的 Pod（输出示例如下）:
```shell
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-8t8cc   member2   1/1     Running   0          8m12s
nginx-6799fc88d8-zpl4j   member2   1/1     Running   0          17s
```

### 删除分发策略

通过名称删除分发策略:
```shell
kubectl delete propagationpolicy example-policy
```
> 删除分发策略不会删除已分发到成员集群的 Deployment，需单独在 Karmada 控制平面中删除 Deployment。

在 Karmada 控制平面中删除 nginx Deployment：
```shell
kubectl delete deployment nginx
```

## 将 Deployment 部署到指定的目标集群集合

`PropagationPolicy` 的 `.spec.placement.clusterAffinity` 字段用于定义集群调度约束；若不配置该字段，所有集群均会成为调度候选。

该字段支持以下 4 种配置方式：
- LabelSelector（标签选择器）
- FieldSelector（字段选择器）
- ClusterNames（集群名称列表）
- ExcludeClusters（排除集群列表）

###  LabelSelector（标签选择器）

通过集群标签筛选目标成员集群，使用 `*metav1.LabelSelector` 类型。若配置非空的标签选择器，仅匹配标签的集群会被选中。

配置方式 1：精确匹配标签:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  placement:
    clusterAffinity:
      labelSelector:
        matchLabels:
          location: us
    #...
```

配置方式 2：表达式匹配标签:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  placement:
    clusterAffinity:
      labelSelector:
        matchExpressions:
        - key: location
          operator: In
          values:
          - us
    #...
```
关于 `matchLabels` 和 `matchExpressions` 的详细说明，可参考[支持集合型需求的资源文档](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#resources-that-support-set-based-requirements)。

### FieldSelector（字段选择器）

通过集群字段筛选目标成员集群。若配置非空的字段选择器，仅匹配字段的集群会被选中。

配置示例

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    clusterAffinity:
      fieldSelector:
        matchExpressions:
        - key: provider
          operator: In
          values:
          - huaweicloud
        - key: region
          operator: NotIn
          values:
          - cn-south-1
    #...
```

字段选择器规则

- 若 `fieldSelector` 中指定多个 `matchExpressions`，集群需满足所有表达式才能被选中。
- `matchExpressions` 中的 `key` 目前支持 3 个值：`provider`（对应 Cluster 对象的 `.spec.provider` 字段）、`region`（对应 `.spec.region`）、`zone`（对应 `.spec.zone`）。
- `matchExpressions` 中的 `operator` 目前支持 `In`（在列表内）和 `NotIn`（不在列表内）。

### ClusterNames（集群名称列表）

用户可以直接指定目标集群的名称。

配置示例如下:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
    #...
```

### ExcludeClusters（排除集群列表）

用户可以通过设置 `ExcludeClusters` 字段来指定需要忽略的集群。

分发策略（PropagationPolicy）可按如下方式配置:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    clusterAffinity:
      exclude:
        - member1
        - member3
    #...
```

## 多集群亲和性组

用户可通过设置 ClusterAffinities 字段，在分发策略（PropagationPolicy）中声明多个集群组。调度器会按照配置在 spec 中的顺序，逐一评估这些集群组：

- 不满足调度约束的集群组会被忽略（即该组内所有集群均不会被选中，除非集群同时属于下一个集群组 —— 一个集群可归属多个组）。
- 若所有集群组均不满足调度约束，调度会失败（无任何集群被选中）。

注意事项

1. `ClusterAffinities`（多集群亲和性组）与 `ClusterAffinity`（单集群亲和性）不可同时配置。
2. 若未配置 ClusterAffinity 和 ClusterAffinities，则所有集群均会成为调度候选集群。

潜在应用场景1:
可将本地数据中心的私有集群设为主集群组，将云服务商提供的托管集群设为副集群组。这样，Karmada 调度器会优先将工作负载调度到主集群组；仅当主集群组不满足约束（如资源不足）时，才会考虑副集群组。

分发策略可按如下配置：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  placement:
    clusterAffinities:
      - affinityName: local-clusters
        clusterNames:
          - local-member1
          - local-member2
      - affinityName: cloud-clusters
        clusterNames:
          - public-cloud-member1
          - public-cloud-member2
    #...
```

潜在应用场景2: 
可将集群划分为主集群组和备集群组，工作负载会优先调度到主集群；当主集群发生故障（如数据中心断电）时，Karmada 调度器可将工作负载迁移到备集群。

分发策略可按如下配置：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  placement:
    clusterAffinities:
      - affinityName: primary-clusters
        clusterNames:
          - member1
      - affinityName: backup-clusters
        clusterNames:
          - member1
          - member2
    #...
```

如需了解更详细的设计信息，可参考 [多调度组 文档](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/multi-scheduling-group)。

## 基于污点和容忍的调度

分发策略（PropagationPolicy）的 `.spec.placement.clusterTolerations` 字段用于定义集群容忍规则。与 Kubernetes 类似，容忍规则需与集群上设置的 “污点” 配合使用：
- 若为集群设置了一个或多个污点，默认情况下工作负载无法调度或运行在这些集群上。
- 仅当分发策略明确声明 “容忍” 这些污点时，工作负载才能被调度到对应集群。

目前 Karmada 支持的污点效应（effect）包括 `NoSchedule`（不调度，仅影响新工作负载）和 `NoExecute`（不执行，既影响已运行工作负载，也影响新工作负载）。

你可以通过 `karmadactl taint` 命令为集群添加污点:

```shell
# Update cluster 'foo' with a taint with key 'dedicated' and value 'special-user' and effect 'NoSchedule'
# If a taint with that key and effect already exists, its value is replaced as specified
karmadactl taint clusters foo dedicated=special-user:NoSchedule
```

若需将工作负载调度到上述带污点的集群（如 foo 集群），需在分发策略中声明对应的容忍规则，示例如下：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    clusterTolerations:
    - key: dedicated
      value: special-user
      Effect: NoSchedule 
```

NoExecute 类型的污点还可用于 “多集群故障转移” 场景，详情可参考 [此处](../failover/failover-analysis.md)。

## 多区域高可用支持

通过 “按区域扩散约束”（spread-by-region constraint），用户可将工作负载部署到多个区域。例如，为实现高可用（HA），用户可能希望工作负载始终在不同区域运行。

要实现多区域部署，需先通过以下命令自定义集群的区域配置：

```shell
$ kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver edit cluster/member1

...
spec:
  apiEndpoint: https://172.18.0.4:6443
  id: 257b5c81-dfae-4ae5-bc7c-6eaed9ed6a39
  impersonatorSecretRef:
    name: member1-impersonator
    namespace: karmada-cluster
  region: test
...
```

之后，需限制待选中的集群组数量（最大值和最小值）。假设存在两个区域，且希望在每个区域各选择一个集群部署工作负载，可参考以下配置：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    replicaScheduling:
     replicaSchedulingType: Duplicated  
    spreadConstraints:
      - spreadByField: region
        maxGroups: 2
        minGroups: 2
      - spreadByField: cluster
        maxGroups: 1
        minGroups: 1
```

:::note

若副本分割偏好（`ReplicaDivisionPreference`）设为 `StaticWeightList`（静态权重列表），则扩散约束的声明会被忽略。
若扩散约束中使用了 `SpreadByField`（按字段扩散），则必须包含 `SpreadByFieldCluster`（按集群扩散）。
例如，当使用 `SpreadByFieldRegion`（按区域扩散）指定区域组时，需同时通过 `SpreadByFieldCluster` 指定每个区域应选中的集群数量。

:::

## 副本调度的多种策略

当分发 “spec 字段中包含副本数配置的资源”（如 Deployment、StatefulSet，或可通过[自定义资源解释器](../globalview/customizing-resource-interpreter.md)解析的 CRD）到成员集群时，`.spec.placement.replicaScheduling` 字段用于定义副本数的调度策略。

该字段包含两种 “副本调度类型”（`replicaSchedulingType`），决定 Karmada 分发资源时副本的分配方式：

* `Duplicated（复制式）`：将资源的副本数 “复制” 到每个候选成员集群。例如，资源副本数为 2，若选中 3 个集群，则每个集群均部署 2 个副本。
* `Divided（分割式）`：将资源的副本数 “分割” 到多个候选成员集群，总副本数保持不变。例如，资源副本数为 6，若选中 3 个集群，则 6 个副本会按规则分配到这 3 个集群（具体分配逻辑由 `ReplicaDivisionPreference` 决定）。

副本分割偏好（ReplicaDivisionPreference）仅当 `replicaSchedulingType` 设为 `Divided`（分割式）时生效，用于决定副本的具体分割规则，支持以下两种类型：

* `Aggregated`（聚合式）：在尊重集群资源可用性（如剩余 CPU、内存）的前提下，将副本尽可能分配到少量集群中。详情可参考[基于集群资源建模的调度](./cluster-resources.md)。
* `Weighted`（加权式）：按权重分配副本，需通过 WeightPreference（权重偏好）配置具体规则，支持两种权重配置方式：
  1. `StaticWeightList`（静态权重列表）：基于预设权重将副本分配到目标集群，目标集群可通过 ClusterAffinity（集群亲和性）筛选。
  2. `DynamicWeight`（动态权重）：基于动态因子生成权重列表。若配置动态权重，`StaticWeightList` 会被忽略。目前 Karmada 支持的动态因子为 `AvailableReplicas`（集群可用副本数，即集群剩余资源可支撑的最大副本数）。

下面给出两个配置示例：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - member1
            weight: 1
          - targetCluster:
              clusterNames:
                - member2
            weight: 1
```

上述配置表示：副本会均匀分配到 `member1` 和 `member2` 集群（权重均为 1，各分配 50% 副本）。

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        dynamicWeight: AvailableReplicas 
```

上述配置表示：副本会基于成员集群的 “可用副本数” 动态分配。例如：
1. 调度器选中 3 个集群（A、B、C），需分配的总副本数为 12。
2. 通过集群资源建模得知，A、B、C 的可用副本数分别为 6、12、18。
3. 权重比例计算为 6:12:18 = 1:2:3。
4. 最终副本分配结果：A 集群 2 个（12×1/6）、B 集群 4 个（12×2/6）、C 集群 6 个（12×3/6）。

:::note

若 `ReplicaDivisionPreference` 设为 `Weighted`（加权式），但未配置 `WeightPreference`（权重偏好），则默认策略为 “所有集群平均加权”（即每个集群权重相同）。

:::

## 配置分发策略 / 集群级分发策略优先级
当一个工作负载同时匹配 “分发策略（PropagationPolicy）” 和 “集群级分发策略（ClusterPropagationPolicy）” 时，Karmada 会优先选择 PropagationPolicy（命名空间级策略）。
若多个 PropagationPolicy 匹配同一工作负载，Karmada 会选择优先级最高的策略；ClusterPropagationPolicy 的优先级规则与此完全一致。

以下以 PropagationPolicy 为例，说明优先级配置规则。

### 配置显式优先级（Explicit Priority）
PropagationPolicy 的 `spec.priority` 字段用于配置显式优先级，数值越大，优先级越高。
> 注意：若未配置该字段，默认优先级为 0。

假设有以下 3 个 PropagationPolicy：
```yaml
# highexplicitpriority.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-high-explicit-priority
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  priority: 2
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# lowexplicitpriority.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-low-explicit-priority
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  priority: 1
  placement:
    clusterAffinity:
      clusterNames:
        - member2
---
# defaultexplicitpriority.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-low-explicit-priority
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member3
```
此时，`default` 命名空间下的 `nginx` Deployment 会匹配优先级最高的策略（priority=2），最终分发到 `member1` 集群。

### 配置隐式优先级
分发策略（PropagationPolicy）的 `spec.resourceSelectors`（资源选择器）决定了隐式优先级，优先级从低到高排序如下：
1. 资源选择器的 `name` 和 `labelSelector` 均为空（匹配同一资源类型的所有工作负载）；
2. 资源选择器的 `labelSelector` 非空（通过标签匹配工作负载）；
3. 资源选择器的 `name` 非空（通过名称精确匹配工作负载）。

假设有以下 3 个分发策略:
```yaml
# emptymatch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-emptymatch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# labelselectormatch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-labelselectormatch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member2
---
# namematch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-namematch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member3
```
此时，`default` 命名空间下的 `nginx` Deployment 会匹配隐式优先级最高的策略，最终分发到 `member3` 集群。

### 从同优先级的分发策略中选择

如果多个具有相同显式优先级的分发策略匹配工作负载，则会选择隐式优先级最高的那个。

假设有以下 2 个分发策略:
```yaml
# explicit-labelselectormatch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-explicit-labelselectormatch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# explicit-namematch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-explicit-namematch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member3
```
此时，两个策略显式优先级相同，但 `explicit-namematch.yaml` 的隐式优先级更高，因此 `default` 命名空间下的 `nginx` Deployment 会分发到 `member3` 集群。

若多个分发策略的显式优先级和隐式优先级均相同，则 Karmada 会按策略名称的字母升序选择（例如，优先选择名称为 `xxx-a-xxx` 的策略，而非 `xxx-b-xxx`）。

假设有以下 2 个分发策略：
```yaml
# higher-alphabetical.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-b-higher-alphabetical
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# lower-alphabetical.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-a-lower-alphabetical
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member2
```
此时，两个策略优先级完全相同，但 `propagation-a-lower-alphabetical` 的名称字母序更靠前，因此 `default` 命名空间下的 `nginx` Deployment 会分发到 `member2` 集群。


## 暂停与恢复资源分发

`PropagationPolicy` 和 `ClusterPropagationPolicy` 中的 `.spec.suspension` 字段允许对一个或多个集群的资源分发进行暂停和恢复。

### 暂停向所有集群分发资源

为了暂停向所有成员集群分发资源，您可以使用以下配置：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
 name: nginx-propagation
spec:
 #...
 placement:
  clusterAffinity:
   exclude:
    - member1
    - member3
  #...
  suspension:
    dispatching: true
```

在 Karmada 控制平面上对 `nginx` Deployment 的更新将不会被同步到任何成员集群。

### 暂停向特定集群分发资源

为了暂停向个别的成员集群分发资源，您可以在 `.spec.suspension.clusterNames` 字段中指定集群名称：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
 name: nginx-propagation
spec:
 #...
 placement:
  clusterAffinity:
   exclude:
    - member1
    - member3
  #...
  suspension:
   dispatchingOnClusters:
    clusterNames:
     - member3 # 修改此处的集群名称
```

在 Karmada 控制平面上对 `nginx` Deployment 的更新将不会被同步到 `member3` 集群，但会被同步到所有其他集群。

### 恢复资源分发

为了恢复资源工作，您只需移除 `.spec.suspension` 配置：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
 name: nginx-propagation
spec:
 #...
 placement:
  clusterAffinity:
   exclude:
    - member1
    - member3
  #...
```

Karmada 控制平面中的 nginx Deployment 状态将被同步到所有成员集群，任何后续的更新也将被同步。
