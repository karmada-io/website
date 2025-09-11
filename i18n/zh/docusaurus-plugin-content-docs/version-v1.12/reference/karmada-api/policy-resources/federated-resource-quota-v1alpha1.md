---
api_metadata:
  apiVersion: "policy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
  kind: "FederatedResourceQuota"
content_type: "api_reference"
description: "FederatedResourceQuota sets aggregate quota restrictions enforced per namespace across all clusters."
title: "FederatedResourceQuota v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: policy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"`

## FederatedResourceQuota 

FederatedResourceQuota 用于设置所有集群每个命名空间内强制执行的聚合配额限制。

<hr/>

- **apiVersion**：policy.karmada.io/v1alpha1

- **kind**：FederatedResourceQuota

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([FederatedResourceQuotaSpec](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotaspec))，必选

  Spec 规定预期配额。

- **status** ([FederatedResourceQuotaStatus](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotastatus))

  Status 表示实际的强制配额和已使用配额。

## FederatedResourceQuotaSpec 

FederatedResourceQuotaSpec 定义强制配额的预期硬限制。

<hr/>

- **overall** (map[string][Quantity](../common-definitions/quantity#quantity))，必选

  Overall 是每个命名资源的预期硬限制。

- **staticAssignments** ([]StaticClusterAssignment)

  StaticAssignments 是每个集群的预期硬限制。注意：对于不在此列表中的集群，Karmada 会将其 ResourceQuota 留空，这些集群在引用的命名空间中没有配额。

  <a name="StaticClusterAssignment"></a>

  *StaticClusterAssignment 表示某个指定集群的预期硬限制。*

  - **staticAssignments.clusterName** (string)，必选

    ClusterName 表示将执行限制的集群的名称。

  - **staticAssignments.hard** (map[string][Quantity](../common-definitions/quantity#quantity))，必选

    Hard 表示每个命名资源的预期硬限制。

## FederatedResourceQuotaStatus 

FederatedResourceQuotaStatus 表示强制硬限制和所观测到的使用情况。

<hr/>

- **aggregatedStatus** ([]ClusterQuotaStatus)

  AggregatedStatus 表示每个集群所观测到的配额使用情况。

  <a name="ClusterQuotaStatus"></a>

  *ClusterQuotaStatus 表示某个指定集群的预期限制和所观测到的使用情况。*

  - **aggregatedStatus.clusterName** (string)，必选

    ClusterName 表示将执行限制的集群的名称。

  - **aggregatedStatus.hard** (map[string][Quantity](../common-definitions/quantity#quantity))

    Hard 表示每个命名资源的强制硬限制。更多信息，请浏览 https://kubernetes.io/docs/concepts/policy/resource-quotas/。

  - **aggregatedStatus.used** (map[string][Quantity](../common-definitions/quantity#quantity))

    Used 是当前所观测到的命名空间中资源的总体使用情况。

- **overall** (map[string][Quantity](../common-definitions/quantity#quantity))

  Overall 是每个命名资源的强制硬限制。

- **overallUsed** (map[string][Quantity](../common-definitions/quantity#quantity))

  OverallUsed 是当前所观测到的命名空间中资源的总体使用情况。

## FederatedResourceQuotaList 

FederatedResourceQuotaList 罗列 FederatedResourceQuota。

<hr/>

- **apiVersion**：policy.karmada.io/v1alpha1

- **kind**: FederatedResourceQuotaList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)), required

## 操作

<hr/>

### `get`：查询指定的 FederatedResourceQuota

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedResourceQuota 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：OK

### `get`：查询指定 FederatedResourceQuota 的状态

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`/status

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedResourceQuota 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：OK

### `list`：查询指定命名空间内的所有 FederatedResourceQuota

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **allowWatchBookmarks** （*查询参数*）：boolean

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

- **timeoutSeconds** （查询参数）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([FederatedResourceQuotaList](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotalist))：OK

### `list`：查询所有的 FederatedResourceQuota

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/federatedresourcequotas

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

200 ([FederatedResourceQuotaList](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotalist))：OK

### `create`：创建一个 FederatedResourceQuota

#### HTTP 请求

POST /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：Created

202 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：Accepted

### `update`：更新指定的 FederatedResourceQuota

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedResourceQuota 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：Created

### `update`：更新指定 FederatedResourceQuota 的状态

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`/status

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedResourceQuota 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：Created

### `patch`：更新指定 FederatedResourceQuota 的部分信息

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedResourceQuota 的名称

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

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：Created

### `patch`：更新指定 FederatedResourceQuota 状态的部分信息

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`/status

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedResourceQuota 的名称

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

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota))：Created

### `delete`：删除一个 FederatedResourceQuota

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedResourceQuota的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds**（*查询参数*）：integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy**（*in query*）：string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### 响应

200 ([Status](../common-definitions/status#status))：OK

202 ([Status](../common-definitions/status#status))：Accepted

### `deletecollection`：删除所有 FederatedResourceQuota

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas

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

- **timeoutSeconds** （查询参数）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status))：OK
