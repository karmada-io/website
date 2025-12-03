---
api_metadata:
  apiVersion: "work.karmada.io/v1alpha2"
  import: "github.com/karmada-io/karmada/pkg/apis/work/v1alpha2"
  kind: "ClusterResourceBinding"
content_type: "api_reference"
description: "ClusterResourceBinding represents a binding of a kubernetes resource with a ClusterPropagationPolicy."
title: "ClusterResourceBinding v1alpha2"
weight: 3
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: work.karmada.io/v1alpha2`

`import "github.com/karmada-io/karmada/pkg/apis/work/v1alpha2"`

## ClusterResourceBinding

ClusterResourceBinding 表示某种 Kubernetes 资源与集群分发策略（ClusterPropagationPolicy）之间的绑定关系。

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ClusterResourceBinding

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceBindingSpec](../work-resources/resource-binding-v1alpha2#resourcebindingspec))，必选

  **spec**表示规范。

- **status** ([ResourceBindingStatus](../work-resources/resource-binding-v1alpha2#resourcebindingstatus))

  **status**表示 ResourceBinding 的最新状态。

## ClusterResourceBindingList

ClusterResourceBindingList 中包含 ClusterResourceBinding 列表。

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ClusterResourceBindingList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding))，必选

  items 表示 ClusterResourceBinding 列表。

## 操作

<hr/>

### `get`：查询指定的 ClusterResourceBinding

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ClusterResourceBinding 名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

### `get`：查询指定 ClusterResourceBinding 的状态

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`/status

#### 参数

- **name**（*路径参数*）：string，必选

  ClusterResourceBinding 名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

### `list`：查询全部 ClusterResourceBinding

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha2/clusterresourcebindings

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

200 ([ClusterResourceBindingList](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebindinglist)): OK

### `create`：创建一个 ClusterResourceBinding

#### HTTP 请求

POST /apis/work.karmada.io/v1alpha2/clusterresourcebindings

#### 参数

- **body**: [ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

202 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Accepted

### `update`：更新指定的 ClusterResourceBinding

#### HTTP 请求

PUT /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ClusterResourceBinding 名称

- **body**: [ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `update`：更新指定 ClusterResourceBinding 的状态

#### HTTP 请求

PUT /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`/status

#### 参数

- **name**（*路径参数*）：string，必选

  ClusterResourceBinding 名称

- **body**: [ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `patch`：更新指定 ClusterResourceBinding 的部分信息

#### HTTP 请求

PATCH /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ClusterResourceBinding 名称

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

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `patch`：更新指定 ClusterResourceBinding 状态的部分信息

#### HTTP 请求

PATCH /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`/status

#### 参数

- **name**（*路径参数*）：string，必选

  ClusterResourceBinding 名称

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

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `delete`：删除一个 ClusterResourceBinding

#### HTTP 请求

DELETE /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ClusterResourceBinding 名称

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

### `deletecollection`：删除 ClusterResourceBinding 的集合

#### HTTP 请求

DELETE /apis/work.karmada.io/v1alpha2/clusterresourcebindings

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
