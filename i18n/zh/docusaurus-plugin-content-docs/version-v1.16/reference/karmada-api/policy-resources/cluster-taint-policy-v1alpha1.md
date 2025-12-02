---
api_metadata:
  apiVersion: "policy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
  kind: "ClusterTaintPolicy"
content_type: "api_reference"
description: "ClusterTaintPolicy 基于声明式条件自动管理 Cluster 对象上的污点。"
title: "ClusterTaintPolicy v1alpha1"
weight: 6
auto_generated: true
---

[//]: # (该文件是从组件的 Go 源代码自动生成的，使用了通用生成器，)
[//]: # (该生成器是从 [reference-docs](https://github.com/kubernetes-sigs/reference-docs) 分叉而来。)
[//]: # (要更新参考内容，请遵循 `reference-api.sh`。)

`apiVersion: policy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"`

## ClusterTaintPolicy 

ClusterTaintPolicy 基于声明式条件自动管理 Cluster 对象上的污点。系统评估 AddOnConditions 来确定何时添加污点，评估 RemoveOnConditions 来确定何时移除污点。AddOnConditions 在 RemoveOnConditions 之前评估。当 ClusterTaintPolicy 被删除时，污点永远不会自动移除。

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: ClusterTaintPolicy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ClusterTaintPolicySpec](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicyspec))，必需

  Spec 表示 ClusterTaintPolicy 的期望行为。

## ClusterTaintPolicySpec 

ClusterTaintPolicySpec 表示 ClusterTaintPolicy 的期望行为。

<hr/>

- **taints** ([]Taint)，必需

  Taints 指定需要在与 TargetClusters 匹配的集群对象上添加或移除的污点。如果 Taints 被修改，系统将在下次条件触发执行期间基于 Taints 的最新值处理污点，无论污点是否已被添加或移除。

  <a name="Taint"></a>

  *Taint 描述需要应用到集群的污点。*

  - **taints.effect** (string)，必需

    Effect 表示要应用到集群的污点效果。
    
    可能的枚举值：
     - `"NoExecute"` 驱逐任何不容忍该污点的已运行 Pod。目前由 NodeController 强制执行。
     - `"NoSchedule"` 不允许新 Pod 调度到节点上，除非它们容忍该污点，但允许所有提交给 Kubelet 而不通过调度器的 Pod 启动，并允许所有已运行的 Pod 继续运行。由调度器强制执行。
     - `"PreferNoSchedule"` 类似于 TaintEffectNoSchedule，但调度器尽量不将新 Pod 调度到节点上，而不是完全禁止新 Pod 调度到节点上。由调度器强制执行。

  - **taints.key** (string)，必需

    Key 表示要应用到集群的污点键。

  - **taints.value** (string)

    Value 表示与污点键对应的污点值。

- **addOnConditions** ([]MatchCondition)

  AddOnConditions 定义触发控制器在集群对象上添加污点的匹配条件。匹配条件使用 AND 逻辑。如果 AddOnConditions 为空，则不会添加污点。

  <a name="MatchCondition"></a>

  *MatchCondition 表示在目标集群上激活故障转移相关污点的条件匹配详情。*

  - **addOnConditions.conditionType** (string)，必需

    ConditionType 指定 ClusterStatus 条件类型。

  - **addOnConditions.operator** (string)，必需

    Operator 表示与一组值的关系。有效的操作符是 In、NotIn。

  - **addOnConditions.statusValues** ([]string)，必需

    StatusValues 是 metav1.ConditionStatus 值的数组。该项指定 ClusterStatus 条件状态。

- **removeOnConditions** ([]MatchCondition)

  RemoveOnConditions 定义触发控制器从集群对象移除污点的匹配条件。匹配条件使用 AND 逻辑。如果 RemoveOnConditions 为空，则不会移除污点。

  <a name="MatchCondition"></a>

  *MatchCondition 表示在目标集群上激活故障转移相关污点的条件匹配详情。*

  - **removeOnConditions.conditionType** (string)，必需

    ConditionType 指定 ClusterStatus 条件类型。

  - **removeOnConditions.operator** (string)，必需

    Operator 表示与一组值的关系。有效的操作符是 In、NotIn。

  - **removeOnConditions.statusValues** ([]string)，必需

    StatusValues 是 metav1.ConditionStatus 值的数组。该项指定 ClusterStatus 条件状态。

- **targetClusters** (ClusterAffinity)

  TargetClusters 指定 ClusterTaintPolicy 需要关注的集群。对于不再匹配 TargetClusters 的集群，污点将保持不变。如果未设置 targetClusters，则可以选择任何集群。

  <a name="ClusterAffinity"></a>

  *ClusterAffinity 表示选择集群的过滤器。*

  - **targetClusters.clusterNames** ([]string)

    ClusterNames 是要选择的集群列表。

  - **targetClusters.exclude** ([]string)

    ExcludedClusters 是要忽略的集群列表。

  - **targetClusters.fieldSelector** (FieldSelector)

    FieldSelector 是按字段选择成员集群的过滤器。匹配表达式的键（字段）应该是 'provider'、'region' 或 'zone'，匹配表达式的操作符应该是 'In' 或 'NotIn'。如果非空且非空，只有匹配此过滤器的集群才会被选择。

    <a name="FieldSelector"></a>

    *FieldSelector 是字段过滤器。*

    - **targetClusters.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

      字段选择器要求列表。

  - **targetClusters.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

    LabelSelector 是按标签选择成员集群的过滤器。如果非空且非空，只有匹配此过滤器的集群才会被选择。

## ClusterTaintPolicyList 

ClusterTaintPolicyList 包含 ClusterTaintPolicy 的列表

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: ClusterTaintPolicyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy))，必需

## 操作 

<hr/>

### `get` 读取指定的 ClusterTaintPolicy

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/`{name}`

#### 参数

- **name** (*路径参数*): string，必需

  ClusterTaintPolicy 的名称

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

### `get` 读取指定 ClusterTaintPolicy 的状态

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/`{name}`/status

#### 参数

- **name** (*路径参数*): string，必需

  ClusterTaintPolicy 的名称

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

### `list` 列出或监视 ClusterTaintPolicy 类型的对象

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/clustertaintpolicies

#### 参数

- **allowWatchBookmarks** (*查询参数*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*查询参数*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*查询参数*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*查询参数*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*查询参数*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*查询参数*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*查询参数*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*查询参数*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*查询参数*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*查询参数*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([ClusterTaintPolicyList](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicylist)): OK

### `create` 创建 ClusterTaintPolicy

#### HTTP 请求

POST /apis/policy.karmada.io/v1alpha1/clustertaintpolicies

#### 参数

- **body**: [ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)，必需

  

- **dryRun** (*查询参数*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*查询参数*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*查询参数*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

202 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Accepted

### `update` 替换指定的 ClusterTaintPolicy

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/`{name}`

#### 参数

- **name** (*路径参数*): string，必需

  ClusterTaintPolicy 的名称

- **body**: [ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)，必需

  

- **dryRun** (*查询参数*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*查询参数*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*查询参数*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `update` 替换指定 ClusterTaintPolicy 的状态

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/`{name}`/status

#### 参数

- **name** (*路径参数*): string，必需

  ClusterTaintPolicy 的名称

- **body**: [ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)，必需

  

- **dryRun** (*查询参数*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*查询参数*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*查询参数*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `patch` 部分更新指定的 ClusterTaintPolicy

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/`{name}`

#### 参数

- **name** (*路径参数*): string，必需

  ClusterTaintPolicy 的名称

- **body**: [Patch](../common-definitions/patch#patch)，必需

  

- **dryRun** (*查询参数*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*查询参数*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*查询参数*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*查询参数*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `patch` 部分更新指定 ClusterTaintPolicy 的状态

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/`{name}`/status

#### 参数

- **name** (*路径参数*): string，必需

  ClusterTaintPolicy 的名称

- **body**: [Patch](../common-definitions/patch#patch)，必需

  

- **dryRun** (*查询参数*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*查询参数*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*查询参数*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*查询参数*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `delete` 删除 ClusterTaintPolicy

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/`{name}`

#### 参数

- **name** (*路径参数*): string，必需

  ClusterTaintPolicy 的名称

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (*查询参数*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (*查询参数*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*查询参数*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*查询参数*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` 删除 ClusterTaintPolicy 集合

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/clustertaintpolicies

#### 参数

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **continue** (*查询参数*): string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun** (*查询参数*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector** (*查询参数*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds** (*查询参数*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*查询参数*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

- **labelSelector** (*查询参数*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*查询参数*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*查询参数*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*查询参数*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion** (*查询参数*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*查询参数*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*查询参数*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*查询参数*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status)): OK