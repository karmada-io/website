---
api_metadata:
  apiVersion: "autoscaling.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/autoscaling/v1alpha1"
  kind: "CronFederatedHPA"
content_type: "api_reference"
description: "CronFederatedHPA represents a collection of repeating schedule to scale replica number of a specific workload."
title: "CronFederatedHPA v1alpha1"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: autoscaling.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/autoscaling/v1alpha1"`

## CronFederatedHPA 

CronFederatedHPA 表示一组可重复的计划，这些计划用于伸缩特定工作负载的副本数量。CronFederatedHPA 可以伸缩任何实现了 scale 子资源的资源，也可以是 FederatedHPA。

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: CronFederatedHPA

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([CronFederatedHPASpec](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpaspec))，必选

  Spec 表示 CronFederatedHPA 的规范。

- **status** ([CronFederatedHPAStatus](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpastatus))

  Status 是 CronFederatedHPA 当前的状态。

## CronFederatedHPASpec 

CronFederatedHPASpec 表示 CronFederatedHPA 的规范。

<hr/>

- **rules** ([]CronFederatedHPARule)，必选

  Rules 是一组计划，用于声明伸缩引用目标资源的时间和动作。

  <a name="CronFederatedHPARule"></a>

  *CronFederatedHPARule 声明伸缩计划及伸缩动作。*

  - **rules.name** (string)，必选

    规则名称 CronFederatedHPA 中的每条规则必须有唯一的名称。
    
    注意：每条规则的名称是记录其执行历史记录的标识符。如果更改某条规则的名称，将被视为删掉该规则，并添加一条新规则，这意味着原始执行历史将被丢弃。

  - **rules.schedule** (string)，必选

    Schedule 是表示周期时间的 cron 表达式。欲了解其语法，请浏览 https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/#schedule-syntax

  - **rules.failedHistoryLimit** (int32)

    FailedHistoryLimit 表示每条规则的失败执行次数。取值只能为正整数，默认值为 3。

  - **rules.successfulHistoryLimit** (int32)

    SuccessfulHistoryLimit 表示每条规则的成功执行次数。取值只能为正整数，默认值为 3。

  - **rules.suspend** (boolean)

    Suspend 通知控制器暂停后续执行。默认值为 false。

  - **rules.targetMaxReplicas** (int32)

    TargetMaxReplicas 是为 FederatedHPA 设置的最大副本数（MaxReplicas）。此字段只有当引用资源是 FederatedHPA 才需要。TargetMaxReplicas 可与 TargetMinReplicas 同时指定，也可单独指定。nil 表示不会更新引用 FederatedHPA 的 MaxReplicas(.spec.maxReplicas)。

  - **rules.targetMinReplicas** (int32)

    TargetMinReplicas 是为 FederatedHPA 设置的最小副本数（MinReplicas）。此字段只有当引用资源是 FederatedHPA 才需要。TargetMinReplicas 可与 TargetMaxReplicas 同时指定，也可单独指定。nil 表示不会更新引用 FederatedHPA 的 MinReplicas(.spec.minReplicas)。

  - **rules.targetReplicas** (int32)

    TargetReplicas 是资源伸缩的目标副本，资源被 CronFederatedHPA 的 ScaleTargetRef 所引用。此字段只有当引用资源不是 FederatedHPA 才需要。

  - **rules.timeZone** (string)

    TimeZone 表示计划所用的时区。如果未指定，默认使用 karmada-controller-manager 进程的时区。当应用此资源模板时，无效的 TimeZone 会被 karmada-webhook 拒绝。欲了解所有时区，请浏览 https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

- **scaleTargetRef** (CrossVersionObjectReference)，必选

  ScaleTargetRef 指向待伸缩的目标资源。目标资源可以是任何资源，比如 Deployment 等子资源或 FederatedHPA。

  <a name="CrossVersionObjectReference"></a>

  *CrossVersionObjectReference 包含可以识别被引用资源的足够信息。*

  - **scaleTargetRef.kind** (string)，必选

    kind 表示引用资源的类别。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

  - **scaleTargetRef.name** (string)，必选

    name 表示引用资源的名称。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

  - **scaleTargetRef.apiVersion** (string)

    apiVersion 是引用资源的API版本。

## CronFederatedHPAStatus 

CronFederatedHPAStatus 表示 CronFederatedHPA 当前的状态。

<hr/>

- **executionHistories** ([]ExecutionHistory)

  ExecutionHistories 记录 CronFederatedHPARule 的执行历史。

  <a name="ExecutionHistory"></a>

  *ExecutionHistory 记录特定 CronFederatedHPARule 的执行历史。*

  - **executionHistories.ruleName** (string)，必选

    RuleName是 CronFederatedHPARule 的名称。

  - **executionHistories.failedExecutions** ([]FailedExecution)

    FailedExecutions 是失败的执行记录。

    <a name="FailedExecution"></a>

    *FailedExecution 记录了一次失败的执行。*

    - **executionHistories.failedExecutions.executionTime** (Time)，必选

      ExecutionTime 表示 CronFederatedHPARule 的实际执行时间。任务可能并不总是在 ScheduleTime 执行。ExecutionTime 用于评估控制器执行的效率。

      <a name="Time"></a>

      *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

    - **executionHistories.failedExecutions.message** (string)，必选

      Message 是有关失败的详细信息（人类可读消息）。

    - **executionHistories.failedExecutions.scheduleTime** (Time)，必选

      ScheduleTime 是 CronFederatedHPARule 中声明的期待执行时间。

      <a name="Time"></a>

      *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **executionHistories.nextExecutionTime** (Time)

    NextExecutionTime 是下一次执行的时间。nil 表示规则已被暂停。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **executionHistories.successfulExecutions** ([]SuccessfulExecution)

    SuccessfulExecutions 是成功的执行记录。

    <a name="SuccessfulExecution"></a>

    *SuccessfulExecution 记录了一次成功的执行。*

    - **executionHistories.successfulExecutions.executionTime** (Time)，必选

      ExecutionTime 表示 CronFederatedHPARule 的实际执行时间。任务可能并不总是在 ScheduleTime 执行。ExecutionTime 用于评估控制器执行的效率。

      <a name="Time"></a>

      *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

    - **executionHistories.successfulExecutions.scheduleTime** (Time)，必选

      ScheduleTime 是 CronFederatedHPARule 中声明的期待执行时间。

      <a name="Time"></a>

      *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

    - **executionHistories.successfulExecutions.appliedMaxReplicas** (int32)

      AppliedMaxReplicas 表示已应用的最大副本数（MaxReplicas）。此字段只有在 .spec.rules[*].targetMaxReplicas 未留空时需要。

    - **executionHistories.successfulExecutions.appliedMinReplicas** (int32)

      AppliedMinReplicas 表示已应用的最小副本数（MinReplicas）。此字段只有在 .spec.rules[*].targetMinReplicas 未留空时需要。

    - **executionHistories.successfulExecutions.appliedReplicas** (int32)

      AppliedReplicas 表示已应用的副本。此字段只有在 .spec.rules[*].targetReplicas 未留空时需要。

## CronFederatedHPAList 

CronFederatedHPAList 罗列 CronFederatedHPA。

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: CronFederatedHPAList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa))，必选

## 操作

<hr/>

### `get`：查询指定的 CronFederatedHPA

#### HTTP 请求

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  CronFederatedHPA 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

### `get`：查询指定 CronFederatedHPA 的状态

#### HTTP 请求

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas/{name}/status

#### 参数

- **名称**（*路径参数*）：string，必选

  CronFederatedHPA 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

### `list`：查询指定命名空间内的所有 CronFederatedHPA

#### HTTP 请求

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas

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

200 ([CronFederatedHPAList](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpalist)): OK

### `list`：查询所有 CronFederatedHPA

#### HTTP 请求

GET /apis/autoscaling.karmada.io/v1alpha1/cronfederatedhpas

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

200 ([CronFederatedHPAList](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpalist)): OK

### `create`：创建一条 CronFederatedHPA

#### HTTP 请求

POST /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

202 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Accepted

### `update`：更新指定的 CronFederatedHPA

#### HTTP 请求

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  CronFederatedHPA 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `update`：更新指定 CronFederatedHPA 的状态

#### HTTP 请求

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas/{name}/status

#### 参数

- **名称**（*路径参数*）：string，必选

  CronFederatedHPA 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `patch`：更新指定 CronFederatedHPA 的部分信息

#### HTTP 请求

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  CronFederatedHPA 的名称

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

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `patch`：更新指定 CronFederatedHPA 状态的部分信息

#### HTTP 请求

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas/{name}/status

#### 参数

- **名称**（*路径参数*）：string，必选

  CronFederatedHPA 的名称

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

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `delete`：删除一条 CronFederatedHPA

#### HTTP 请求

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  CronFederatedHPA 的名称

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

### `deletecollection`：删除指定命名空间内的所有 CronFederatedHPA

#### HTTP 请求

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/cronfederatedhpas

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
