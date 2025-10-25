---
api_metadata:
  apiVersion: "apps.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/apps/v1alpha1"
  kind: "WorkloadRebalancer"
content_type: "api_reference"
description: "WorkloadRebalancer represents the desired behavior and status of a job which can enforces a resource rebalance."
title: "WorkloadRebalancer v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: apps.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/apps/v1alpha1"`

## WorkloadRebalancer 

WorkloadRebalancer 代表可以对某资源执行重平衡操作的 Job 的预期行为和状态。

<hr/>

- **apiVersion**: apps.karmada.io/v1alpha1

- **kind**: WorkloadRebalancer

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([WorkloadRebalancerSpec](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancerspec)), 必选

  Spec 是 WorkloadRebalancer 的期望行为的规范。

- **status** ([WorkloadRebalancerStatus](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancerstatus))

  Status 是 WorkloadRebalancer 的状态。

## WorkloadRebalancerSpec 

WorkloadRebalancerSpec 代表了重调度的期望行为的规范。

<hr/>

- **workloads** ([]ObjectReference), 必选

  Workloads 用于指定预期资源列表。不允许使用无或空列表。

  <a name="ObjectReference"></a>

  *ObjectReference 预期资源。*

  - **workloads.apiVersion** (string), 必选

    APIVersion 代表目标资源的 API 版本。

  - **workloads.kind** (string), 必选

    Kind 代表目标资源的类别。

  - **workloads.name** (string), 必选

    Name 是目标资源的名称。

  - **workloads.namespace** (string)

    目标资源的命名空间。默认为空，表明其是非命名空间作用域的资源。

- **ttlSecondsAfterFinished** (int32)

  TTLSecondsAfterFinished 限制已执行完成的 WorkloadRebalancer（指每个目标工作负载都以 Successful 或 Failed 的结果执行完成） 的生命周期。如果设置了该字段，WorkloadRebalancer 结束 ttlSecondsAfterFinished 秒后将被自动删除。如果未设置该字段，则不会自动删除 WorkloadRebalancer。如果此字段设置为零，则 WorkloadRebalancer 执行完成后会被立即删除。

## WorkloadRebalancerStatus 

WorkloadRebalancerStatus 包含 WorkloadRebalancer 周期性更新的当前状态信息。

<hr/>

- **finishTime** (Time)

  FinishTime 代表了重平衡的结束时间。

  <a name="Time"></a>

  *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

- **observedGeneration** (int64)

  ObservedGeneration 是控制器观察到的 .metadata.generation。如果 ObservedGeneration 小于元数据中的 generation，则表示控制器尚未确认重平衡结果或尚未进行重平衡。

- **observedWorkloads** ([]ObservedWorkload)

  ObservedWorkloads 包含目标资源的执行状态和信息。

  <a name="ObservedWorkload"></a>

  *ObservedWorkload 被观测的工作负载。*

  - **observedWorkloads.workload** (ObjectReference), 必选

    Workload 被观测的资源。

    <a name="ObjectReference"></a>

    *ObjectReference 预期资源。*

    - **observedWorkloads.workload.apiVersion** (string), 必选

      APIVersion 代表目标资源的 API 版本。

    - **observedWorkloads.workload.kind** (string), 必选

      Kind 代表目标资源的类别。

    - **observedWorkloads.workload.name** (string), 必选

      Name 目标资源的名称。

    - **observedWorkloads.workload.namespace** (string)

      目标资源的命名空间。 默认为空, 表明其是非命名空间作用域的资源。

  - **observedWorkloads.reason** (string)

    Reason 资源重平衡失败的机器可读描述。

  - **observedWorkloads.result** (string)

    Result 观测到的资源重平衡结果。

## WorkloadRebalancerList 

WorkloadRebalancerList 是 WorkloadRebalancer 的集合。

<hr/>

- **apiVersion**: apps.karmada.io/v1alpha1

- **kind**: WorkloadRebalancerList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)), required

  Items 是 WorkloadRebalancer 的列表。

## 操作 

<hr/>

### `get` 查询指定的 WorkloadRebalancer

#### HTTP 请求

GET /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### 参数

- **name** (**路径参数**): string, 必选

  WorkloadRebalancer 的名称

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

### `get` 查询指定 WorkloadRebalancer 的状态

#### HTTP 请求

GET /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`/status

#### 参数

- **name** (**路径参数**): string, 必选

  WorkloadRebalancer 的名称

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

### `list` 查询 WorkloadRebalancer 列表

#### HTTP 请求

GET /apis/apps.karmada.io/v1alpha1/workloadrebalancers

#### 参数

- **allowWatchBookmarks** (**查询参数**): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (**查询参数**): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (**查询参数**): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (**查询参数**): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (**查询参数**): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (**查询参数**): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (**查询参数**): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (**查询参数**): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (**查询参数**): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (**查询参数**): boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([WorkloadRebalancerList](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancerlist)): OK

### `create` 创建一个 WorkloadRebalancer

#### HTTP 请求

POST /apis/apps.karmada.io/v1alpha1/workloadrebalancers

#### 参数

- **body**: [WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

202 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Accepted

### `update` 更新指定的 WorkloadRebalancer

#### HTTP 请求

PUT /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### 参数

- **name** (**路径参数**): string, 必选

  WorkloadRebalancer 的名称

- **body**: [WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `update` 更新指定 WorkloadRebalancer 的状态

#### HTTP 请求

PUT /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`/status

#### 参数

- **name** (**路径参数**): string, 必选

  WorkloadRebalancer 的名称

- **body**: [WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `patch` 更新指定 WorkloadRebalancer 的部分信息

#### HTTP 请求

PATCH /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### 参数

- **name** (**路径参数**): string, 必选

  WorkloadRebalancer 的名称

- **body**: [Patch](../common-definitions/patch#patch), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (**查询参数**): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `patch` 更新指定 WorkloadRebalancer 状态的部分信息

#### HTTP 请求

PATCH /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`/status

#### 参数

- **name** (**路径参数**): string, 必选

  WorkloadRebalancer 的名称

- **body**: [Patch](../common-definitions/patch#patch), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (**查询参数**): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `delete` 删除一个 WorkloadRebalancer

#### HTTP 请求

DELETE /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### 参数

- **name** (**路径参数**): string, 必选

  WorkloadRebalancer 的名称

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (**查询参数**): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (**查询参数**): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` 删除所有 WorkloadRebalancer

#### HTTP 请求

DELETE /apis/apps.karmada.io/v1alpha1/workloadrebalancers

#### 参数

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **continue** (**查询参数**): string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector** (**查询参数**): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds** (**查询参数**): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **labelSelector** (**查询参数**): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (**查询参数**): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (**查询参数**): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion** (**查询参数**): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (**查询参数**): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (**查询参数**): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (**查询参数**): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

