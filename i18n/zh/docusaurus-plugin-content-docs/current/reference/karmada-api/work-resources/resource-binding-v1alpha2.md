---
api_metadata:
  apiVersion: "work.karmada.io/v1alpha2"
  import: "github.com/karmada-io/karmada/pkg/apis/work/v1alpha2"
  kind: "ResourceBinding"
content_type: "api_reference"
description: "ResourceBinding represents a binding of a kubernetes resource with a propagation policy."
title: "ResourceBinding v1alpha2"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: work.karmada.io/v1alpha2`

`import "github.com/karmada-io/karmada/pkg/apis/work/v1alpha2"`

## ResourceBinding

ResourceBinding 表示某种 kubernetes 资源与分发策略之间的绑定关系。

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ResourceBinding

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceBindingSpec](../work-resources/resource-binding-v1alpha2#resourcebindingspec))，必选

  Spec 表示规范。

- **status** ([ResourceBindingStatus](../work-resources/resource-binding-v1alpha2#resourcebindingstatus))

  Status 表示 ResourceBinding 的最新状态。

## ResourceBindingSpec

ResourceBindingSpec 表示预期的 ResourceBinding。

<hr/>

- **resource** (ObjectReference)，必选

  Resource 表示要分发的 Kubernetes 资源。

  <a name="ObjectReference"></a>

  *ObjectReference 包含足够的信息以便定位当前集群所引用的资源。*

  - **resource.apiVersion**（string），必选

    **apiVersion**表示所引用资源的 API 版本。

  - **resource.kind**（string），必选

    Kind 表示所引用资源的类别。

  - **resource.name**（string），必选

    Name 表示所引用资源的名称。

  - **resource.namespace**（string）

    Namespace 表示所引用资源所在的命名空间。对于非命名空间范围的资源（例如 ClusterRole），不需要指定命名空间。对于命名空间范围的资源，需要指定命名空间。如果未指定命名空间，则资源不在命名空间范围内。

  - **resource.resourceVersion**（string）

    ResourceVersion 表示所引用资源的内部版本，客户端可用其确定资源的变更时间。

  - **resource.uid**（string）

    UID 表示所引用资源的唯一标识。

- **clusters** ([]TargetCluster)

  Clusters 表示待部署资源的目标成员集群。

  <a name="TargetCluster"></a>

  *TargetCluster 表示成员集群的标识符。*

  - **clusters.name**（string），必选

    Name 表示目标集群的名称。

  - **clusters.replicas**（int32）

    Replicas 表示目标集群中的副本。

- **conflictResolution**（string）

  ConflictResolution 表示当目标集群中已存在正在分发的资源时，处理潜在冲突的方式。

  默认为 Abort，表示停止分发资源以避免意外覆盖。将原集群资源迁移到 Karmada 时，可设置为 Overwrite。此时，冲突是可预测的，且 Karmada 可通过覆盖来接管资源。

- **failover** (FailoverBehavior)

  Failover 表示 Karmada 在故障场景中迁移应用的方式。可直接从所关联的 PropagationPolicy（或 ClusterPropagationPolicy）继承。

  <a name="FailoverBehavior"></a>

  *FailoverBehavior 表示应用或集群的故障转移。*

  - **failover.application** (ApplicationFailoverBehavior)

    Application 表示应用的故障转移。如果值为 nil，则禁用故障转移。如果值不为 nil，则 PropagateDeps 应设置为 true，以便依赖项随应用一起迁移。

    <a name="ApplicationFailoverBehavior"></a>

    *ApplicationFailoverBehavior 表示应用的故障转移。*

    - **failover.application.decisionConditions** (DecisionConditions)，必选

      DecisionConditions 表示执行故障转移的先决条件。只有满足所有条件，才能执行故障转移。当前条件为 TolerationSeconds（可选）。

      <a name="DecisionConditions"></a>

      *DecisionConditions 表示执行故障转移的先决条件。*

      - **failover.application.decisionConditions.tolerationSeconds**（int32）

        TolerationSeconds 表示应用达到预期状态后，Karmada 在执行故障转移之前应等待的时间。如果未指定等待时间，Karmada 将立即执行故障转移。默认为 300 秒。

    - **failover.application.gracePeriodSeconds**（int32）

      GracePeriodSeconds 表示从新集群中删除应用之前的最长等待时间（以秒为单位）。仅当 PurgeMode 设置为 Graciously 且默认时长为 600 秒时，才需要设置该字段。如果新群集中的应用无法达到健康状态，Karmada 将在达到最长等待时间后删除应用。取值必须为正整数。

    - **failover.application.purgeMode**（string）

      PurgeMode 表示原集群中应用的处理方式。取值包括 Immediately、Graciously 和 Never。默认为 Graciously。

- **gracefulEvictionTasks** ([]GracefulEvictionTask)

  GracefulEvictionTasks 表示驱逐任务，预期以优雅方式执行驱逐。工作流程如下：1. 一旦控制器（例如 taint-manager）决定从目标集群中驱逐当前 ResourceBinding 或 ClusterResourceBinding 所引用的资源，就会从 Clusters（.spec.Clusters）中删除副本，并构建一个优雅的驱逐任务。


2. 调度器可以执行重新调度，并可能选择一个替代集群来接管正在驱逐的工作负载（资源）。

3. 优雅驱逐控制器负责优雅驱逐任务，并在替代集群上的工作负载（资源）可用或超过宽限终止期（默认为 10 分钟）后执行最终删除。

<a name="GracefulEvictionTask"></a>

*GracefulEvictionTask 表示优雅驱逐任务。*

- **gracefulEvictionTasks.fromCluster**（string），必选

  FromCluster 表示需要执行驱逐的集群。

- **gracefulEvictionTasks.producer**（string），必选

  Producer 表示触发驱逐的控制器。

- **gracefulEvictionTasks.reason**（string），必选

  Reason 是一个程序标识符，说明驱逐的原因。生产者可以定义该字段的预期值和含义，以及这些值是否可被视为有保障的 API。取值应该是一个 CamelCase 字符串。此字段不能为空。

- **gracefulEvictionTasks.creationTimestamp** (Time)

  CreationTimestamp 是一个时间戳，表示创建对象时服务器上的时间。为避免时间不一致，客户端不得设置此值。它以 RFC3339 形式表示（如 2021-04-25T10:02:10Z），并采用 UTC 时间。

  由系统填充。只读。

  <a name="Time"></a>

  *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

- **gracefulEvictionTasks.gracePeriodSeconds**（int32）

  GracePeriodSeconds 表示对象被删除前的最长等待时间（以秒为单位）。如果新群集中的应用无法达到健康状态，Karmada 将在达到最长等待时间后删除该对象。取值只能为正整数。它不能与 SuppressDeletion 共存。

- **gracefulEvictionTasks.message**（string）

  Message 是有关驱逐的详细信息（人类可读消息）。可以是空字符串。

- **gracefulEvictionTasks.replicas**（int32）

  Replicas 表示应驱逐的副本数量。对于没有副本的资源类型，忽略该字段。

- **gracefulEvictionTasks.suppressDeletion**（boolean）

  SuppressDeletion 表示宽限期将持续存在，直至工具或人工干预为止。它不能与 GracePeriodSeconds 共存。

- **placement** (Placement)

  Placement 表示选定群集以及分发资源的规则。

  <a name="Placement"></a>

  *Placement 表示选定集群的规则。*

  - **placement.clusterAffinities** ([]ClusterAffinityTerm)

    ClusterAffinities表示多个集群组的调度限制（ClusterAffinityTerm 指定每种限制）。

    调度器将按照这些组在规范中出现的顺序逐个评估，不满足调度限制的组将被忽略。除非该组中的所有集群也属于下一个组（同一集群可以属于多个组），否则将不会选择此组中的所有集群。

    如果任何组都不满足调度限制，则调度失败，这意味着不会选择任何集群。

    注意：
    1. ClusterAffinities 不能与 ClusterAffinity 共存。
    2. 如果未同时设置 ClusterAffinities 和 ClusterAffinity，则任何集群都可以作为调度候选集群。

    潜在用例1：本地数据中心的私有集群为主集群组，集群提供商的托管集群是辅助集群组。Karmada 调度器更愿意将工作负载调度到主集群组，只有在主集群组不满足限制（如缺乏资源）的情况下，才会考虑辅助集群组。

    潜在用例2：对于容灾场景，系统管理员可定义主集群组和备份集群组，工作负载将首先调度到主集群组，当主集群组中的集群发生故障（如数据中心断电）时，Karmada 调度器可以将工作负载迁移到备份集群组。

    <a name="ClusterAffinityTerm"></a>

    *ClusterAffinityTerm 选择集群。*

    - **placement.clusterAffinities.affinityName**（string），必选

      AffinityName 是集群组的名称。

    - **placement.clusterAffinities.clusterNames** ([]string)

      ClusterNames 罗列待选择的集群。

    - **placement.clusterAffinities.exclude** ([]string)

      ExcludedClusters 罗列待忽略的集群。

    - **placement.clusterAffinities.fieldSelector** (FieldSelector)

      FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

      <a name="FieldSelector"></a>

      *FieldSelector 是一个字段过滤器。*

      - **placement.clusterAffinities.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

        字段选择器要求列表。

    - **placement.clusterAffinities.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

- **placement.clusterAffinity** (ClusterAffinity)

  ClusterAffinity 表示对某组集群的调度限制。注意：
  1. ClusterAffinity 不能与 ClusterAffinities 共存。
  2. 如果未同时设置 ClusterAffinities 和 ClusterAffinity，则任何集群都可以作为调度候选集群。

  <a name="ClusterAffinity"></a>

  *ClusterAffinity 表示用于选择集群的过滤器。*

  - **placement.clusterAffinity.clusterNames** ([]string)

    ClusterNames 罗列待选择的集群。

  - **placement.clusterAffinity.exclude** ([]string)

    ExcludedClusters 罗列待忽略的集群。

    - **placement.clusterAffinity.fieldSelector** (FieldSelector)

      FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

      <a name="FieldSelector"></a>

      *FieldSelector 是一个字段过滤器。*

      - **placement.clusterAffinity.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

        字段选择器要求列表。

    - **placement.clusterAffinity.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

  - **placement.clusterTolerations** ([]Toleration)

    ClusterTolerations 表示容忍度。

    <a name="Toleration"></a>

    *附加此容忍度的 Pod 能够容忍任何使用匹配运算符 &lt;operator&gt; 匹配三元组 &lt;key,value,effect&gt; 所得到的污点。*

    - **placement.clusterTolerations.effect**（string）

      Effect 表示要匹配的污点效果。留空表示匹配所有污点效果。如果要设置此字段，允许的值为 NoSchedule、PreferNoSchedule 或 NoExecute。

      枚举值包括：
      - `"NoExecute"`：任何不能容忍该污点的 Pod 都会被驱逐。当前由 NodeController 强制执行。
      - `"NoSchedule"`：如果新 pod 无法容忍该污点，不允许新 pod 调度到节点上，但允许由 Kubelet 调度但不需要调度器启动的所有 pod，并允许节点上已存在的 Pod 继续运行。由调度器强制执行。
      - `"PreferNoSchedule"`：和 TaintEffectNoSchedule 相似，不同的是调度器尽量避免将新 Pod 调度到具有该污点的节点上，除非没有其他节点可调度。由调度器强制执行。

    - **placement.clusterTolerations.key**（string）

      Key 是容忍度的污点键。留空表示匹配所有污点键。如果键为空，则运算符必须为 Exist，所有值和所有键都会被匹配。

    - **placement.clusterTolerations.operator**（string）

      Operator 表示一个键与值的关系。有效的运算符包括 Exists 和 Equal。默认为 Equal。Exists 相当于将值设置为通配符，因此一个 Pod 可以容忍特定类别的所有污点。

      枚举值包括：
      - `"Equal"`
      - `"Exists"`

    - **placement.clusterTolerations.tolerationSeconds**（int64）

      TolerationSeconds 表示容忍度容忍污点的时间段（Effect 的取值为 NoExecute，否则忽略此字段）。默认情况下，不设置此字段，表示永远容忍污点（不驱逐）。零和负值将被系统视为 0（立即驱逐）。

    - **placement.clusterTolerations.value**（string）

      Value 是容忍度匹配到的污点值。如果运算符为 Exists，则值应为空，否则就是一个普通字符串。

  - **placement.replicaScheduling** (ReplicaSchedulingStrategy)

    ReplicaScheduling 表示将 spec 中规约的副本资源（例如 Deployments、Statefulsets）分发到成员集群时处理副本数量的调度策略。

    <a name="ReplicaSchedulingStrategy"></a>

    *ReplicaSchedulingStrategy 表示副本的分配策略。*

    - **placement.replicaScheduling.replicaDivisionPreference**（string）

      当 ReplicaSchedulingType 设置为 Divided 时，由 ReplicaDivisionPreference 确定副本的分配策略。取值包括 Aggregated 和 Weighted。Aggregated：将副本分配给尽可能少的集群，同时考虑集群的资源可用性。Weighted：根据 WeightPreference 按权重分配副本。

    - **placement.replicaScheduling.replicaSchedulingType**（string）

      ReplicaSchedulingType 确定 karmada 分发资源副本的调度方式。取值包括 Duplicated 和 Divided。Duplicated：将相同的副本从资源复制到每个候选成员群集。Divided：根据有效候选成员集群的数量分配副本，每个集群的副本由 ReplicaDivisionPreference 确定。

    - **placement.replicaScheduling.weightPreference** (ClusterPreferences)

      WeightPreference 描述每个集群或每组集群的权重。如果 ReplicaDivisionPreference 设置为 Weighted，但 WeightPreference 未设置，调度器将为所有集群设置相同的权重。

      <a name="ClusterPreferences"></a>

      *ClusterPreferences 描述每个集群或每组集群的权重。*

      - **placement.replicaScheduling.weightPreference.dynamicWeight**（string）

        DynamicWeight 指生成动态权重列表的因子。如果指定，StaticWeightList 将被忽略。

      - **placement.replicaScheduling.weightPreference.staticWeightList** ([]StaticClusterWeight)

        StaticWeightList 罗列静态集群权重。

        <a name="StaticClusterWeight"></a>

        *StaticClusterWeight 定义静态集群权重。*

        - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster** (ClusterAffinity)，必选

          TargetCluster 是用于选择集群的过滤条件。

          <a name="ClusterAffinity"></a>

          *ClusterAffinity 是用于选择集群的过滤条件。*

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.clusterNames** ([]string)

            ClusterNames 罗列待选择的集群。

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.exclude** ([]string)

            ExcludedClusters 罗列待忽略的集群。

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector** (FieldSelector)

            FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

            <a name="FieldSelector"></a>

            *FieldSelector 是一个字段过滤器。*

            - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

              字段选择器要求列表。

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

            LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

        - **placement.replicaScheduling.weightPreference.staticWeightList.weight**（int64），必选

          Weight表示优先选择 TargetCluster 指定的集群。

  - **placement.spreadConstraints** ([]SpreadConstraint)

    SpreadConstraints 表示调度约束的列表。

    <a name="SpreadConstraint"></a>

    *SpreadConstraint 表示资源分布的约束。*

    - **placement.spreadConstraints.maxGroups**（int32）

      MaxGroups 表示要选择的集群组的最大数量。

    - **placement.spreadConstraints.minGroups**（int32）

      MinGroups 表示要选择的集群组的最小数量。默认值为 1。

    - **placement.spreadConstraints.spreadByField**（string）

      SpreadByField 是 Karmada 集群 API 中的字段，该 API 用于将成员集群分到不同集群组。资源将被分发到不同的集群组中。可用的字段包括 cluster、region、zone 和 provider。SpreadByField 不能与 SpreadByLabel 共存。如果两个字段都为空，SpreadByField 默认为 cluster。

    - **placement.spreadConstraints.spreadByLabel**（string）

      SpreadByLabel 表示用于将成员集群分到不同集群组的标签键。资源将被分发到不同的集群组中。SpreadByLabel 不能与 SpreadByField 共存。

  - **propagateDeps**（boolean）

    PropagateDeps 表示相关资源是否被自动分发，继承自 PropagationPolicy 或 ClusterPropagationPolicy。默认值为 false。

  - **replicaRequirements** (ReplicaRequirements)

    ReplicaRequirements 表示每个副本的需求。

    <a name="ReplicaRequirements"></a>

    *ReplicaRequirements 表示每个副本的需求。*

  - **replicaRequirements.nodeClaim** (NodeClaim)

    NodeClaim 表示每个副本所需的节点声明 HardNodeAffinity、NodeSelector 和 Tolerations。

    <a name="NodeClaim"></a>

    *NodeClaim 表示每个副本所需的节点声明 HardNodeAffinity、NodeSelector 和 Tolerations。*

    - **replicaRequirements.nodeClaim.hardNodeAffinity** (NodeSelector)

      一个节点选择器可以匹配要调度到一组节点上的一个或多个标签。以节点选择条件形式表示的节点选择器之间是“或”的关系。注意：因为该字段对 Pod 调度有硬性限制，所以此处仅包含 PodSpec.Affinity.NodeAffinity 中 RequiredDuringSchedulingIgnoredDuringExecution。

      <a name="NodeSelector"></a>

      *一个节点选择器可以匹配要调度到一组节点上的一个或多个标签。以节点选择条件为形式的节点选择器之间是“或”的关系。*

      - **replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms** ([]NodeSelectorTerm)，必选

        节点选择条件列表。这些条件之间是“或”的关系。

        <a name="NodeSelectorTerm"></a>

        *如果取值为 null 或留空，不会匹配任何对象。这些条件的要求是“与”的关系。TopologySelectorTerm 类型是 NodeSelectorTerm 的子集。*

        - **replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          按节点标签列出的节点选择器需求列表。

        - **replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms.matchFields** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          按节点字段列出的节点选择器需求列表。

    - **replicaRequirements.nodeClaim.nodeSelector** (map[string]string)

      NodeSelector 取值为 true 时才会认为 Pod 适合在节点上运行。选择器必须与节点的标签匹配，以便在该节点上调度 Pod。

    - **replicaRequirements.nodeClaim.tolerations** ([]Toleration)

      如果设置了此字段，则作为 Pod 的容忍度。

      <a name="Toleration"></a>

      *附加此容忍度的 Pod 能够容忍任何使用匹配运算符 &lt;operator&gt; 匹配三元组 &lt;key,value,effect&gt; 所得到的污点。*

      - **replicaRequirements.nodeClaim.tolerations.effect**（string）

        Effect 表示要匹配的污点效果。留空表示匹配所有污点效果。如果要设置此字段，允许的值为 NoSchedule、PreferNoSchedule 或 NoExecute。

        枚举值包括：
        - `"NoExecute"`：任何不能容忍该污点的 Pod 都会被驱逐。当前由 NodeController 强制执行。
        - `"NoSchedule"`：如果新 pod 无法容忍该污点，不允许新 pod 调度到节点上，但允许由 Kubelet 调度但不需要调度器启动的所有 pod，并允许节点上已存在的 Pod 继续运行。由调度器强制执行。
        - `"PreferNoSchedule"`：和 TaintEffectNoSchedule 相似，不同的是调度器尽量避免将新 Pod 调度到具有该污点的节点上，除非没有其他节点可调度。由调度器强制执行。

      - **replicaRequirements.nodeClaim.tolerations.key**（string）

        Key 是容忍度的污点键。留空表示匹配所有污点键。如果键为空，则运算符必须为 Exist，所有值和所有键都会被匹配。

      - **replicaRequirements.nodeClaim.tolerations.operator**（string）

        Operator 表示一个键与值的关系。有效的运算符为 Exists 和 Equal。默认为 Equal。Exists 相当于将值设置为通配符，因此一个 Pod 可以容忍特定类别的所有污点。

        枚举值包括：
        - `"Equal"`
        - `"Exists"`

      - **replicaRequirements.nodeClaim.tolerations.tolerationSeconds**（int64）

        TolerationSeconds 表示容忍度容忍污点的时间段（Effect 的取值为 NoExecute，否则忽略此字段）。默认情况下，不设置此字段，表示永远容忍污点（不驱逐）。零和负值将被系统视为 0（立即驱逐）。

      - **replicaRequirements.nodeClaim.tolerations.value**（string）

        Value 是容忍度匹配到的污点值。如果运算符为 Exists，则值应为空，否则就是一个普通字符串。

  - **replicaRequirements.resourceRequest** (map[string][Quantity](../common-definitions/quantity#quantity))

    ResourceRequest 表示每个副本所需的资源。

  - **replicas**（int32）

    Replicas 表示引用资源的副本编号。

  - **requiredBy** ([]BindingSnapshot)

    RequiredBy 表示依赖于引用资源的 Bindings 列表。

    <a name="BindingSnapshot"></a>

    *BindingSnapshot 是 ResourceBinding 或 ClusterResourceBinding 的快照。*

    - **requiredBy.name**（string），必选

      Name 表示 Binding 的名称。

    - **requiredBy.clusters** ([]TargetCluster)

      Clusters 表示计划结果。

      <a name="TargetCluster"></a>

      *TargetCluster 是成员集群的标识符。*

      - **requiredBy.clusters.name**（string），必选

        Name 是目标集群的名称。

      - **requiredBy.clusters.replicas**（int32）

        Replicas 表示目标集群中的副本。

    - **requiredBy.namespace**（string）

      Namespace 表示 Binding 的命名空间，是 ResourceBinding 所必需的。如果未指定命名空间，引用为 ClusterResourceBinding。

  - **schedulerName**（string）

    SchedulerName 表示要继续调度的调度器，可直接从所关联的 PropagationPolicy（或 ClusterPropagationPolicy）继承。

## ResourceBindingStatus

ResourceBindingStatus 表示策略及所引用资源的整体状态。

<hr/>

- **aggregatedStatus** ([]AggregatedStatusItem)

  AggregatedStatus 罗列每个成员集群中资源的状态。

  <a name="AggregatedStatusItem"></a>

  *AggregatedStatusItem 表示某个成员集群中资源的状态。*

  - **aggregatedStatus.clusterName**（string），必选

    ClusterName 表示资源所在的成员集群。

  - **aggregatedStatus.applied**（boolean）

    **applied**表示 ResourceBinding 或 ClusterResourceBinding 引用的资源是否成功应用到集群中。

  - **aggregatedStatus.appliedMessage**（string）

    AppliedMessage 是有关应用状态的详细信息（人类可读消息）。通常是应用失败的错误信息。

  - **aggregatedStatus.health**（string）

    Health 表示当前资源的健康状态。可以设置不同规则来保障不同资源的健康。

  - **aggregatedStatus.status** (RawExtension)

    Status 反映当前清单的运行状态。

    <a name="RawExtension"></a>

    *RawExtension 用于在外部版本中保存扩展数据。

    要使用此字段，请生成一个字段，在外部、版本化结构中以 RawExtension 作为其类型，在内部结构中以 Object 作为其类型。此外，还需要注册各个插件类型。

    //内部包：

    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.Object `json:"myPlugin"`
    	]

    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]

    //外部包：

    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.RawExtension `json:"myPlugin"`
    	]

    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]

    //在网络上，JSON 看起来像这样：

    	[
    		"kind":"MyAPIObject",
    		"apiVersion":"v1",
    		"myPlugin": [
    			"kind":"PluginA",
    			"aOption":"foo",
    		],
    	]

    那么会发生什么？解码首先需要使用 JSON 或 YAML 将序列化数据解组到外部 MyAPIObject 中。这会导致原始 JSON 被存储下来，但不会被解包。下一步是复制（使用 pkg/conversion）到内部结构中。runtime 包的 DefaultScheme 安装了转换函数，它将解析存储在 RawExtension 中的 JSON，将其转换为正确的对象类型，并将其存储在对象中。（TODO：如果对象是未知类型，将创建并存储一个 runtime.Unknown 对象。）*

- **conditions** ([]Condition)

  Conditions 包含不同的状况。

  <a name="Condition"></a>

  *Condition 包含此 API 资源当前状态某个方面的详细信息。*

  - **conditions.lastTransitionTime** (Time)，必选

    lastTransitionTime 是最近一次从一种状态转换到另一种状态的时间。这种变化通常出现在下层状况发生变化的时候。如果无法了解下层状况变化，使用 API 字段更改的时间也是可以接受的。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **conditions.message**（string），必选

    Message 是有关转换的详细信息（人类可读消息）。可以是空字符串。

  - **conditions.reason**（string），必选

    reason 是一个程序标识符，表明状况最后一次转换的原因。特定状况类型的生产者可以定义该字段的预期值和含义，以及这些值是否可被视为有保证的 API。取值应该是一个 CamelCase 字符串。此字段不能为空。

  - **conditions.status**（string），必选

    Status 表示状况的状态。取值为 True、False 或 Unknown。

  - **conditions.type**（string），必选

    type 表示 CamelCase 或 foo.example.com/CamelCase 形式的状况类型。

  - **conditions.observedGeneration**（int64）

    **observedGeneration**表示设置状况时所基于的 .metadata.generation。例如，如果 .metadata.generation 为 12，但 .status.conditions[x].observedGeneration 为 9，则状况相对于实例的当前状态已过期。

- **schedulerObservedGeneration**（int64）

  SchedulerObservedGeneration 表示调度器观测到的元数据（.metadata.generation）。如果该字段的值比 .metadata.genation 生成的元数据少，则表示调度器尚未确认调度结果或尚未完成调度。

- **schedulerObservingAffinityName**（string）

  SchedulerObservedAffinityName 表示亲和性规则的名称，是当前调度的基础。

## ResourceBindingList

ResourceBindingList 中包含 ResourceBinding 列表。

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ResourceBindingList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding))，必选

  Items 表示 ResourceBinding 列表。

## 操作

<hr/>

### `get`：查询指定的 ResourceBinding

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceBinding名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

### `get`：查询指定 ResourceBinding 的状态

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceBinding 名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

### `list`：查询全部 ResourceBinding

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **allowWatchBookmarks**（*查询参数*）：boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([ResourceBindingList](../work-resources/resource-binding-v1alpha2#resourcebindinglist)): OK

### `list`：查询全部 ResourceBinding

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha2/resourcebindings

#### 参数

- **allowWatchBookmarks**（*查询参数*）：boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([ResourceBindingList](../work-resources/resource-binding-v1alpha2#resourcebindinglist)): OK

### `create`：创建一个 ResourceBinding

#### HTTP 请求

POST /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

202 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Accepted

### `update`：更新指定的 ResourceBinding

#### HTTP 请求

PUT /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceBinding名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `update`：更新指定 ResourceBinding 的状态

#### HTTP 请求

PUT /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceBinding名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `patch`：更新指定 ResourceBinding 的部分信息

#### HTTP 请求

PATCH /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceBinding 名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force**（*查询参数*）：boolean

  [force](../common-parameter/common-parameters#force)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `patch`：更新指定 ResourceBinding 状态的部分信息

#### HTTP 请求

PATCH /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceBinding 名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force**（*查询参数*）：boolean

  [force](../common-parameter/common-parameters#force)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `delete`：删除一个 ResourceBinding

#### HTTP 请求

DELETE /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceBinding名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds**（*查询参数*）：integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy**（*查询参数*）：string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection`：删除 ResourceBinding 的集合

#### HTTP 请求

DELETE /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)


- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds**（*查询参数*）：integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy**（*查询参数*）：string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status)): OK
