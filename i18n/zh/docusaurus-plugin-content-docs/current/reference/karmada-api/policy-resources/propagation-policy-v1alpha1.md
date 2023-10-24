---
api_metadata:
  apiVersion: "policy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
  kind: "PropagationPolicy"
content_type: "api_reference"
description: "PropagationPolicy represents the policy that propagates a group of resources to one or more clusters."
title: "PropagationPolicy v1alpha1"
weight: 4
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: policy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"`

## PropagationPolicy

PropagationPolicy 表示将一组资源分发到一个或多个集群的策略。

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: PropagationPolicy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** (PropagationSpec)，必选

  Spec 表示 PropagationPolicy 的规范。

  <a name="PropagationSpec"></a>

  *PropagationSpec 表示 PropagationPolicy 的规范。*

  - **spec.resourceSelectors** ([]ResourceSelector)，必选

    ResourceSelectors 用于选择资源。不允许设置为 nil 或者留空。为安全起见，避免 Secret 等敏感资源被无意分发，不会匹配全部的资源。

    <a name="ResourceSelector"></a>

    *ResourceSelector 用于选择资源。*

    - **spec.resourceSelectors.apiVersion**（string），必选

      APIVersion 表示目标资源的 API 版本。

    - **spec.resourceSelectors.kind**（string），必选

      Kind 表示目标资源的种类。

    - **spec.resourceSelectors.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      查询一组资源的标签。如果 name 不为空，labelSelector 会被忽略。

    - **spec.resourceSelectors.name**（string）

      目标资源的名称。默认值为空，意味着所有资源将被选中。

    - **spec.resourceSelectors.namespace**（string）

      目标资源的命名空间。默认值为空，意味着从父对象作用域继承资源。

  - **spec.association**（boolean）

    Association 表示是否自动选择相关资源，例如，被 Deployment 引用的 ConfigMap。默认值为 false。Deprecated 表示改用 PropagateDeps。

  - **spec.conflictResolution**（string）

    ConflictResolution 表示当目标集群中已存在正在分发的资源时，处理潜在冲突的方式。

    默认值为 Abort，表示停止分发资源以避免意外覆盖。将原集群资源迁移到 Karmada 时，可设置为“Overwrite”。此时，冲突是可预测的，且 Karmada 可通过覆盖来接管资源。

  - **spec.dependentOverrides**（[]string）

    DependentOverrides 罗列在当前 PropagationPolicy 生效之前必须出现的覆盖（OverridePolicy）。

    它指明当前 PropagationPolicy 所依赖的覆盖。当用户同时创建 OverridePolicy 和资源时，一般希望可以采用新创建的策略。

    注意：如果当前命名空间中的 OverridePolicy 和 ClusterOverridePolicy 与资源匹配，即使它们不在列表中，仍将被应用于覆盖。

  - **spec.failover** (FailoverBehavior)

    Failover 表示 Karmada 在故障场景中迁移应用的方式。如果值为 nil，则禁用故障转移。

    <a name="FailoverBehavior"></a>

    *FailoverBehavior 表示应用或集群的故障转移。*

    - **spec.failover.application** (ApplicationFailoverBehavior)

      Application 表示应用的故障转移。如果值为 nil，则禁用故障转移。如果值不为 nil，则 PropagateDeps 应设置为 true，以便依赖项随应用一起迁移。

      <a name="ApplicationFailoverBehavior"></a>

      *ApplicationFailoverBehavior 表示应用的故障转移。*

      - **spec.failover.application.decisionConditions** (DecisionConditions)，必选

        DecisionConditions 表示执行故障转移的先决条件。只有满足所有条件，才能执行故障转移。当前条件为 TolerationSeconds（可选）。

        <a name="DecisionConditions"></a>

        *DecisionConditions 表示执行故障转移的先决条件。*

        - **spec.failover.application.decisionConditions.tolerationSeconds**（int32）

          TolerationSeconds 表示应用达到预期状态后，Karmada 在执行故障转移之前应等待的时间。如果未指定等待时间，Karmada 将立即执行故障转移。默认为 300 秒。

      - **spec.failover.application.gracePeriodSeconds**（int32）

        GracePeriodSeconds 表示从新集群中删除应用之前的最长等待时间（以秒为单位）。仅当 PurgeMode 设置为 Graciously 且默认时长为 600 秒时，才需要设置该字段。如果新群集中的应用无法达到健康状态，Karmada 将在达到最长等待时间后删除应用。取值只能为正整数。

      - **spec.failover.application.purgeMode**（string）

        PurgeMode 表示原集群中应用的处理方式。取值包括 Immediately、Graciously 和 Never。默认为 Graciously。

  - **spec.placement** (Placement)

    Placement 表示选择集群以分发资源的规则。

    <a name="Placement"></a>

    *Placement 表示选择集群的规则。*

    - **spec.placement.clusterAffinities** ([]ClusterAffinityTerm)

      ClusterAffinities 表示多个集群组的调度限制（ClusterAffinityTerm 指定每种限制）。

      调度器将按照这些组在规范中出现的顺序逐个评估，不满足调度限制的组将被忽略。除非该组中的所有集群也属于下一个组（同一集群可以属于多个组），否则将不会选择此组中的所有集群。

      如果任何组都不满足调度限制，则调度失败，任何集群都不会被选择。

      注意：
      1. ClusterAffinities 不能与 ClusterAffinity 共存。
      2. 如果未同时设置 ClusterAffinities 和 ClusterAffinity，则任何集群都可以作为调度候选集群。

      潜在用例1：本地数据中心的私有集群为主集群组，集群提供商的托管集群是辅助集群组。Karmada 调度器更愿意将工作负载调度到主集群组，只有在主集群组不满足限制（如缺乏资源）的情况下，才会考虑辅助集群组。

      潜在用例2：对于容灾场景，系统管理员可定义主集群组和备份集群组，工作负载将首先调度到主集群组，当主集群组中的集群发生故障（如数据中心断电）时，Karmada 调度器可以将工作负载迁移到备份集群组。

      <a name="ClusterAffinityTerm"></a>

      *ClusterAffinityTerm 用于选择集群。*

      - **spec.placement.clusterAffinities.affinityName**（string），必选

        AffinityName 是集群组的名称。

      - **spec.placement.clusterAffinities.clusterNames**（[]string）

        ClusterNames 罗列待选择的集群。

      - **spec.placement.clusterAffinities.exclude**（[]string）

        ExcludedClusters 罗列待忽略的集群。

      - **spec.placement.clusterAffinities.fieldSelector** (FieldSelector)

        FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

        <a name="FieldSelector"></a>

        *FieldSelector 是一个字段过滤器。*

        - **spec.placement.clusterAffinities.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          字段选择器要求列表。

      - **spec.placement.clusterAffinities.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

    - **spec.placement.clusterAffinity** (ClusterAffinity)

      ClusterAffinity 表示对某组集群的调度限制。注意：
      1. ClusterAffinity 不能与 ClusterAffinities 共存。
      2. 如果未同时设置 ClusterAffinities 和 ClusterAffinity，则任何集群都可以作为调度候选集群。

      <a name="ClusterAffinity"></a>

      *ClusterAffinity 是用于选择集群的过滤条件。*

      - **spec.placement.clusterAffinity.clusterNames**（[]string）

        ClusterNames 罗列待选择的集群。

      - **spec.placement.clusterAffinity.exclude**（[]string）

        ExcludedClusters 罗列待忽略的集群。

      - **spec.placement.clusterAffinity.fieldSelector** (FieldSelector)

        FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

        <a name="FieldSelector"></a>

        *FieldSelector 是一个字段过滤器。*

        - **spec.placement.clusterAffinity.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          字段选择器要求列表。

      - **spec.placement.clusterAffinity.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

    - **spec.placement.clusterTolerations** ([]Toleration)

      ClusterTolerations 表示容忍度。

      <a name="Toleration"></a>

      *附加此容忍度的 Pod 能够容忍任何使用匹配运算符 &lt;operator&gt; 匹配三元组 &lt;key,value,effect&gt; 所得到的污点。*

      - **spec.placement.clusterTolerations.effect**（string）

        Effect 表示要匹配的污点效果。留空表示匹配所有污点效果。如果要设置此字段，允许的值为 NoSchedule、PreferNoSchedule 或 NoExecute。

        枚举值包括：
        - `"NoExecute"`：任何不能容忍该污点的 Pod 都会被驱逐。当前由 NodeController 强制执行。
        - `"NoSchedule"`：如果新 Pod 无法容忍该污点，不允许新 Pod 调度到节点上，但允许由 Kubelet 调度但不需要调度器启动的所有 Pod，并允许节点上已存在的 Pod 继续运行。由调度器强制执行。
        - `"PreferNoSchedule"`：和 TaintEffectNoSchedule 相似，不同的是调度器尽量避免将新 Pod 调度到具有该污点的节点上，除非没有其他节点可调度。由调度器强制执行。

      - **spec.placement.clusterTolerations.key**（string）

        Key 是容忍度的污点键。留空表示匹配所有污点键。如果键为空，则运算符必须为 Exist，所有值和所有键都会被匹配。

      - **spec.placement.clusterTolerations.operator**（string）

        Operator 表示一个键与值的关系。有效的运算符包括 Exists 和 Equal。默认为 Equal。Exists 相当于将值设置为通配符，因此一个 Pod 可以容忍特定类别的所有污点。

        枚举值包括：
        - `"Equal"`
        - `"Exists"`

      - **spec.placement.clusterTolerations.tolerationSeconds**（int64）

        TolerationSeconds 表示容忍度容忍污点的时间段（Effect 的取值为 NoExecute，否则忽略此字段）。默认情况下，不设置此字段，表示永远容忍污点（不驱逐）。零和负值将被系统视为 0（立即驱逐）。

      - **spec.placement.clusterTolerations.value**（string）

        Value 是容忍度匹配到的污点值。如果运算符为 Exists，则值留空，否则就是一个普通字符串。

    - **spec.placement.replicaScheduling** (ReplicaSchedulingStrategy)

      ReplicaScheduling 表示将 spec 中规约的副本资源（例如 Deployments、Statefulsets）分发到成员集群时处理副本数量的调度策略。

      <a name="ReplicaSchedulingStrategy"></a>

      *ReplicaSchedulingStrategy 表示副本的分配策略。*

      - **spec.placement.replicaScheduling.replicaDivisionPreference**（string）

        当 ReplicaSchedulingType 设置为 Divided 时，由 ReplicaDivisionPreference 确定副本的分配策略。取值包括 Aggregated 和 Weighted。Aggregated：将副本分配给尽可能少的集群，同时考虑集群的资源可用性。Weighted：根据 WeightPreference 按权重分配副本。

      - **spec.placement.replicaScheduling.replicaSchedulingType**（string）

        ReplicaSchedulingType 确定 karmada 分发资源时副本的调度方式。取值包括 Duplicated 和 Divided。Duplicated：将相同的副本从资源复制到每个候选成员群集。Divided：根据有效候选成员集群的数量分配副本，每个集群的副本由 ReplicaDivisionPreference 确定。

      - **spec.placement.replicaScheduling.weightPreference** (ClusterPreferences)

        WeightPreference 描述每个集群或每组集群的权重。如果 ReplicaDivisionPreference 设置为 Weighted，但 WeightPreference 未设置，调度器将为所有集群设置相同的权重。

        <a name="ClusterPreferences"></a>

        *ClusterPreferences 描述每个集群或每组集群的权重。*

        - **spec.placement.replicaScheduling.weightPreference.dynamicWeight**（string）

          DynamicWeight 指生成动态权重列表的因子。如果指定，StaticWeightList 将被忽略。

        - **spec.placement.replicaScheduling.weightPreference.staticWeightList** ([]StaticClusterWeight)

          StaticWeightList 罗列静态集群权重。

          <a name="StaticClusterWeight"></a>

          *StaticClusterWeight 定义静态集群权重。*

          - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster** (ClusterAffinity)，必选

            TargetCluster 是选择集群的过滤器。

            <a name="ClusterAffinity"></a>

            *ClusterAffinity 是用于选择集群的过滤条件。*

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.clusterNames** ([]string)

              ClusterNames 罗列待选择的集群。

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.exclude** ([]string)

              ExcludedClusters 罗列待忽略的集群。

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector** (FieldSelector)

              FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

              <a name="FieldSelector"></a>

              *FieldSelector 是一个字段过滤器。*

              - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

                字段选择器要求列表。

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

              LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

          - **spec.placement.replicaScheduling.weightPreference.staticWeightList.weight**（int64），必选

            Weight 表示优先选择 TargetCluster 指定的集群。

    - **spec.placement.spreadConstraints** ([]SpreadConstraint)

      SpreadConstraints 表示调度约束列表。

      <a name="SpreadConstraint"></a>

      *SpreadConstraint 表示资源分布的约束。*

      - **spec.placement.spreadConstraints.maxGroups**（int32）

        MaxGroups 表示要选择的集群组的最大数量。

      - **spec.placement.spreadConstraints.minGroups**（int32）

        MinGroups 表示要选择的集群组的最小数量。默认值为 1。

      - **spec.placement.spreadConstraints.spreadByField**（string）

        SpreadByField 是 Karmada 集群 API 中的字段，该 API 用于将成员集群分到不同集群组。资源将被分发到不同的集群组中。可用的字段包括 cluster、region、zone 和 provider。SpreadByField 不能与 SpreadByLabel 共存。如果两个字段都为空，SpreadByField 默认为 cluster。

      - **spec.placement.spreadConstraints.spreadByLabel**（string）

        SpreadByLabel 表示用于将成员集群分到不同集群组的标签键。资源将被分发到不同的集群组中。SpreadByLabel 不能与 SpreadByField 共存。

- **spec.preemption**（string）

  Preemption 表示资源抢占。取值包括 Always 和 Never。

  枚举值包括：
  - `"Always"`：允许抢占。如果 Always 应用于 PropagationPolicy，则会根据优先级抢占资源。只要 PropagationPolicy 和 ClusterPropagationPolicy 能匹配 ResourceSelector 中定义的规则，均可用于声明资源。此外，如果资源已被 ClusterPropagationPolicy 声明，PropagationPolicy 仍然可以抢占该资源，无需考虑优先级。如果 Always 应用于 ClusterPropagationPolicy，只有 ClusterPropagationPolicy 能抢占资源。
  - `"Never"`：PropagationPolicy（或 ClusterPropagationPolicy）不抢占资源。

- **spec.priority**（int32）

  Priority 表示策略（PropagationPolicy 或 ClusterPropagationPolicy）的重要性。对于每条策略，如果在资源模板中没有其他优先级更高的策略，则将为匹配的资源模板应用该策略。一旦资源模板被某个策略声明，默认情况下该模板不会被优先级更高的策略抢占。查看 Preemption 字段，了解更多信息。

  如果两条策略有相同的优先级，会使用 ResourceSelector 中有更精确匹配规则的策略。按 name(resourceSelector.name) 匹配的优先级高于按 selector(resourceSelector.labelSelector) 匹配。

  - 按 selector(resourceSelector.labelSelector) 匹配的优先级又高于按 APIVersion(resourceSelector.apiVersion) 或 Kind(resourceSelector.kind) 匹配。

  如果优先级相同，则按字母顺序，会使用字母排名更前的策略，比如，名称以 bar 开头的策略优先级高于以 foo 开头的策略。

  值越大，优先级越高。默认值为 0。

- **spec.propagateDeps**（boolean）

  PropagateDeps 表示相关资源是否被自动分发。以引用 ConfigMap 和 Secret 的 Deployment 为例，当 propagateDeps 为 true 时，resourceSelectors 不引用资源（以减少配置），ConfigMap 和 Secret 将与 Deployment 一起被分发。此外，在故障转移场景中，引用资源也将与 Deployment 一起迁移。

  默认值为 false。

- **spec.schedulerName**（string）

  SchedulerName 表示要继续进行调度的调度器。如果指定，将由指定的调度器调度策略。如果未指定，将由默认调度器调度策略。

## PropagationPolicyList

PropagationPolicyList 罗列 PropagationPolicy。

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: PropagationPolicyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy))，必选

## 操作

<hr/>

### `get`：查询指定的 PropagationPolicy

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  PropagationPolicy 名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

### `get`：查询指定 PropagationPolicy 的状态

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  PropagationPolicy 名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

### `list`：查询全部 PropagationPolicy

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies

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

200 ([PropagationPolicyList](../policy-resources/propagation-policy-v1alpha1#propagationpolicylist)): OK

### `list`：查询全部 PropagationPolicy

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/propagationpolicies

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

200 ([PropagationPolicyList](../policy-resources/propagation-policy-v1alpha1#propagationpolicylist)): OK

### `create`：创建一个 PropagationPolicy

#### HTTP 请求

POST /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

202 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Accepted

### `update`：更新指定的 PropagationPolicy

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  PropagationPolicy 名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `update`：更新指定 PropagationPolicy 的状态

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  PropagationPolicy名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `patch`：更新指定 PropagationPolicy 的部分信息

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  PropagationPolicy 名称

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

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `patch`：更新指定 PropagationPolicy 状态的部分信息

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  PropagationPolicy 名称

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

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `delete`：刪除一个 PropagationPolicy

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  PropagationPolicy 名称

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

### `deletecollection`：删除 PropagationPolicy 的集合

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/propagationpolicies

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
