---
api_metadata:
  apiVersion: "cluster.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/cluster/v1alpha1"
  kind: "Cluster"
content_type: "api_reference"
description: "Cluster represents the desire state and status of a member cluster."
title: "Cluster v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: cluster.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/cluster/v1alpha1"`

## Cluster 

Cluster 表示成员集群的预期状态和当前状态。

<hr/>

- **apiVersion**: cluster.karmada.io/v1alpha1

- **kind**: Cluster

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ClusterSpec](../cluster-resources/cluster-v1alpha1#clusterspec))，必选

  Spec 表示成员集群的规范。

- **status** ([ClusterStatus](../cluster-resources/cluster-v1alpha1#clusterstatus))

  Status 表示成员集群的状态。

## ClusterSpec 

ClusterSpec 定义成员集群的预期状态。

<hr/>

- **syncMode**（string），必选

  SyncMode 描述集群从 Karmada 控制面同步资源的方式。

- **apiEndpoint** (string)

  成员集群的 API 端点。取值包括 hostname、hostname:port、IP 和 IP:port。

- **id** (string)

  ID 是集群的唯一标识符。它不同于 uid(.metadata.uid)，通常会在注册过程中自动从成员集群收集。

  收集顺序如下：

  1. 如果注册集群启用了 ClusterProperty API 并通过创建名为 cluster.clusterset.k8s.io 的 ClusterProperty 对象来定义集群 ID，则 Karmada 将在 ClusterProperty 对象中获取定义的值。有关 ClusterProperty API 的更多详情，请浏览：https://github.com/kubernetes-sigs/about-api

  2. 在注册集群上获取命名空间 kube-system 的 UID。

  此 UID 有以下用途：
  - 是识别 Karmada 系统中的集群的唯一标识；
  - 组成多集群服务的 DNS 名称。
    一般情况下，不更新此 UID ，请谨慎操作。

- **impersonatorSecretRef** (LocalSecretReference)

  ImpersonatorSecretRef 表示包含用于伪装的令牌的密钥。密钥应包含以下凭据：- secret.data.token

  <a name="LocalSecretReference"></a>

  *LocalSecretReference 是指封闭命名空间内的密钥引用。*

  - **impersonatorSecretRef.name** (string)，必选

    Name 指被引用资源的名称。

  - **impersonatorSecretRef.namespace** (string)，必选

    Namespace 指所引用资源的命名空间。

- **insecureSkipTLSVerification** (boolean)

  InsecureSkipTLSVerification 表示 Karmada 控制平面不应确认其所连接的集群的服务证书的有效性，这样会导致 Karmada 控制面与成员集群之间的 HTTPS 连接不安全。默认值为 false。

- **provider** (string)

  Provider 表示成员集群的云提供商名称。

- **proxyHeader** (map[string]string)

  ProxyHeader 是代理服务器所需的 HTTP 头。其中，键为 HTTP 头键，值为HTTP 头的负载。如果 HTTP 头有多个值，所有的值使用逗号分隔（例如，k1: v1,v2,v3）。

- **proxyURL** (string)

  ProxyURL 是集群的代理URL。如果不为空，则 Karmada 控制面会使用此代理与集群通信。更多详情，请参考：https://github.com/kubernetes/client-go/issues/351

- **region** (string)

  Region 表示成员集群所在的区域。

- **resourceModels** ([]ResourceModel)

  ResourceModels 是集群中资源建模的列表。每个建模配额都可以由用户自定义。建模名称必须是 cpu、memory、storage 或 ephemeral-storage。如果用户未定义建模名称和建模配额，将使用默认模型。默认模型的等级为 0 到 8。当 grade 设置为 0 或 1 时，默认模型的 CPU 配额和内存配额为固定值。当 grade 大于或等于 2 时，每个默认模型的 CPU 配额为：[2^(grade-1), 2^grade), 2 &lt;= grade &lt;= 7。每个默认模型的内存配额为：[2^(grade + 2), 2^(grade + 3)), 2 &lt;= grade &lt;= 7。例如：

  - grade: 0
    ranges:
    - name: "cpu"
      min: 0 C
      max: 1 C
    - name: "memory"
      min: 0 GB
      max: 4 GB

  - grade: 1
    ranges:
    - name: "cpu"
      min: 1 C
      max: 2 C
    - name: "memory"
      min: 4 GB
      max: 16 GB
  
  - grade: 2
    ranges:
    - name: "cpu"
      min: 2 C
      max: 4 C
    - name: "memory"
      min: 16 GB
      max: 32 GB

  - grade: 7
    range:
    - name: "cpu"
      min: 64 C
      max: 128 C
    - name: "memory"
      min: 512 GB
      max: 1024 GB

  如果 grade 为 8，无论设置的 Max 值为多少，该等级中 Max 值的含义都表示无限。因此，可以设置任何大于 Min 值的数字。

- grade: 8
  range:
  - name: "cpu"
    min: 128 C
    max: MAXINT
  - name: "memory"
    min: 1024 GB
    max: MAXINT

<a name="ResourceModel"></a>

*ResourceModel 描述要统计的建模。*

- **resourceModels.grade** (int32)，必选

  Grade 是资源建模的索引。

- **resourceModels.ranges** ([]ResourceModelRange)，必选

  Ranges 描述资源配额范围。

  <a name="ResourceModelRange"></a>

  *ResourceModelRange 描述每个建模配额从 min 到 max 的详细信息。注意：默认情况下，包含 min 值，但不包含 max 值。例如，设置 min = 2，max =10，则间隔为 [2, 10)。此规则能确保所有间隔具有相同的含义。如果最后一个间隔是无限的，肯定无法实现。因此，我们将正确的间隔定义为开放间隔。对于有效的间隔，右侧的值大于左侧的值，即 max 值 必须大于 min 值。建议所有 ResourceModelRanges 的 [Min, Max) 都可以是连续的间隔。*

  - **resourceModels.ranges.max** ([Quantity](../common-definitions/quantity#quantity))，必选

    Max 指定资源的最大数量，由资源名称表示。特别说明，对于最后一个 ResourceModelRange ，无论传递的 Max 值是什么，都表示无限。因为对于最后一项，任何大于 Min 值的 ResourceModelRange 配额都将归为最后一项。任何情况下，Max 的值都大于 Min 的值。

  - **resourceModels.ranges.min** ([Quantity](../common-definitions/quantity#quantity))，必选

    Min 指定资源的最小数量，由资源名称表示。注意：等级 1 的 Min 值（通常为0）始终为零，例如，[1,2)等同于[0, 2)。

  - **resourceModels.ranges.name** (string)，必选

    Name 是要分类的资源的名称。

- **secretRef** (LocalSecretReference)

  SecretRef 表示密钥包含访问成员集群的强制性凭据。取值包括：- secret.data.token - secret.data.caBundle

  <a name="LocalSecretReference"></a>

  *LocalSecretReference 指封闭命名空间内的密钥引用。*

  - **secretRef.name** (string)，必选

    Name 指所引用资源的名称。

  - **secretRef.namespace** (string)，必选

    Namespace 指所引用资源的命名空间。

- **taints** ([]Taint)

  附加到成员集群的污点。集群的污点对任何不容忍该污点的资源都有“影响”。

  <a name="Taint"></a>

  *此污点所在的节点对任何不容忍污点的 Pod 都有“影响”。*

  - **taints.effect** (string)，必选

    必选。污点对不容忍该污点的 Pod 的影响。有效取值包括 NoSchedule、PreferNoSchedule 和 NoExecute。

    枚举值包括：
    - `"NoExecute"`：任何不能容忍该污点的 Pod 都会被驱逐。当前由 NodeController 强制执行。
    - `"NoSchedule"`：如果新 pod 无法容忍该污点，不允许新 pod 调度到节点上，但允许由 Kubelet 调度但不需要调度器启动的所有 pod ，并允许节点上已存在的 Pod 继续运行。由调度器强制执行。
    - `"PreferNoSchedule"`：和 TaintEffectNoSchedule 相似，不同的是调度器尽量避免将新 Pod 调度到具有该污点的节点上，除非没有其他节点可调度。由调度器强制执行。

  - **taints.key** (string)，必选

    必选。应用到节点上的污点的键。

  - **taints.timeAdded** (Time)

    TimeAdded 表示添加污点的时间。仅适用于 NoExecute 的污点。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **taints.value** (string)

    与污点键对应的污点值。

- **zone** (string)

  Zone 表示成员集群所在的区域。Deprecated 表示 Karmada 从未使用过该字段。为了向后兼容，不会从 v1alpha1 中删除该字段，请改用 Zones。

- **zones** ([]string)

  Zones 表示成员集群的故障区域（也称为可用区域）。这些区域以切片的形式显示，这样集群便可跨多个故障区域运行。欲了解在多个区域运行 Kubernetes的更多细节，请浏览：https://kubernetes.io/docs/setup/best-practices/multiple-zones/

## ClusterStatus 

ClusterStatus 包含有关集群当前状态的信息，由集群控制器定期更新。

<hr/>

- **apiEnablements** ([]APIEnablement)

  APIEnablements 表示成员集群的 API 列表。

  <a name="APIEnablement"></a>

  *APIEnablement 表示 API 列表，用于公开特定群组和版本中支持的资源的名称*。

  - **apiEnablements.groupVersion** (string)，必选

    GroupVersion 是此 APIEnablement 的群组和版本。

  - **apiEnablements.resources** ([]APIResource)

    Resources 是 APIResource 的列表。

    <a name="APIResource"></a>

    *APIResource 指定资源的名称和类别。*

    - **apiEnablements.resources.kind** (string)，必选

      Kind 是资源的类别（例如，资源 deployments 的类别是 Deployment）

    - **apiEnablements.resources.name** (string)，必选

      Name 表示资源的复数名称。

- **conditions** ([]Condition)

  Conditions 表示当前集群的状况（数组结构）。

  <a name="Condition"></a>

  *Condition 包含此 API 资源当前状态某个方面的详细信息。*

  - **conditions.lastTransitionTime** (Time)，必选

    lastTransitionTime 是状况最近一次从一种状态转换到另一种状态的时间。这种变化通常出现在下层状况发生变化的时候。如果无法了解下层状况变化，使用 API 字段更改的时间也是可以接受的。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **conditions.message**（string），必选

    message 是有关转换的详细信息（人类可读消息）。可以是空字符串。

  - **conditions.reason**（string），必选

    reason 是一个程序标识符，表明状况最后一次转换的原因。特定状况类型的生产者可以定义该字段的预期值和含义，以及这些值是否可被视为有保证的 API。取值应该是一个 CamelCase 字符串。此字段不能为空。

  - **conditions.status**（string），必选

    status 表示状况的状态。取值为True、False或Unknown。

  - **conditions.type**（string），必选

    type 表示状况的类型，采用 CamelCase 或 foo.example.com/CamelCase 形式。

  - **conditions.observedGeneration** (int64)

    observedGeneration 表示设置状况时所基于的 .metadata.generation。例如，如果 .metadata.generation 为 12，但 .status.conditions[x].observedGeneration 为 9，则状况相对于实例的当前状态已过期。

- **kubernetesVersion** (string)

  KubernetesVersion 表示成员集群的版本。

- **nodeSummary** (NodeSummary)

  NodeSummary 表示成员集群中节点状态的汇总。

  <a name="NodeSummary"></a>

  *NodeSummary 表示特定集群中节点状态的汇总。*

  - **nodeSummary.readyNum** (int32)

    ReadyNum 指集群中就绪节点的数量。

  - **nodeSummary.totalNum** (int32)

    TotalNum 指集群中的节点总数。

- **resourceSummary** (ResourceSummary)

  ResourceSummary 表示成员集群中资源的汇总。

  <a name="ResourceSummary"></a>

  *ResourceSummary 表示成员集群中资源的汇总。*

  - **resourceSummary.allocatable** (map[string][Quantity](../common-definitions/quantity#quantity))

    Allocatable 表示集群中可用于调度的资源，是所有节点上可分配资源的总量。

  - **resourceSummary.allocatableModelings** ([]AllocatableModeling)

    AllocatableModelings 表示统计资源建模。

    <a name="AllocatableModeling"></a>

    *AllocatableModeling 表示特定资源模型等级中可分配资源的节点数。例如，AllocatableModeling[Grade: 2, Count: 10] 表示有 10 个节点属于等级为 2 的资源模型。*

    - **resourceSummary.allocatableModelings.count** (int32)，必选

      Count 统计能使用此建模所划定的资源的节点数。

    - **resourceSummary.allocatableModelings.grade** (int32)，必选

      Grade 是 ResourceModel 的索引。

  - **resourceSummary.allocated** (map[string][Quantity](../common-definitions/quantity#quantity))

    Allocated 表示集群中已调度的资源，是已调度到节点的所有 Pod 所需资源的总和。

  - **resourceSummary.allocating** (map[string][Quantity](../common-definitions/quantity#quantity))

    Allocating 表示集群中待调度的资源，是所有等待调度的 Pod 所需资源的总和。

## ClusterList 

ClusterList 罗列成员集群。

<hr/>

- **apiVersion**: cluster.karmada.io/v1alpha1

- **kind**: ClusterList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][Cluster](../cluster-resources/cluster-v1alpha1#cluster))，必选

  Items 中包含 Cluster 列表。

## 操作

<hr/>

### `get`：查询指定的集群

#### HTTP 请求

GET /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  Cluster 名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

### `get`：查询指定集群的状态

#### HTTP 请求

GET /apis/cluster.karmada.io/v1alpha1/clusters/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  集群的名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

### `list`：查询所有集群

#### HTTP 请求

GET /apis/cluster.karmada.io/v1alpha1/clusters

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

200 ([ClusterList](../cluster-resources/cluster-v1alpha1#clusterlist)): OK

### `create`：创建一个集群

#### HTTP 请求

POST /apis/cluster.karmada.io/v1alpha1/clusters

#### Parameters

- **body**: [Cluster](../cluster-resources/cluster-v1alpha1#cluster)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

202 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Accepted

### `update`：更新指定的集群

#### HTTP 请求

PUT /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  集群的名称

- **body**: [Cluster](../cluster-resources/cluster-v1alpha1#cluster)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `update`：更新指定集群的状态

#### HTTP 请求

PUT /apis/cluster.karmada.io/v1alpha1/clusters/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  集群的名称

- **body**: [Cluster](../cluster-resources/cluster-v1alpha1#cluster)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `patch`：更新指定集群的部分信息

#### HTTP 请求

PATCH /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  集群的名称

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

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `patch`：更新指定集群状态的部分信息

#### HTTP 请求

PATCH /apis/cluster.karmada.io/v1alpha1/clusters/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  集群的名称

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

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `delete`：删除一个集群

#### HTTP 请求

DELETE /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  Cluster 名称

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

### `deletecollection`：删除所有集群

#### HTTP 请求

DELETE /apis/cluster.karmada.io/v1alpha1/clusters

#### 参数

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
