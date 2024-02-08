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

CronFederatedHPA represents a collection of repeating schedule to scale replica number of a specific workload. It can scale any resource implementing the scale subresource as well as FederatedHPA.

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: CronFederatedHPA

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([CronFederatedHPASpec](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpaspec)), required

  Spec is the specification of the CronFederatedHPA.

- **status** ([CronFederatedHPAStatus](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpastatus))

  Status is the current status of the CronFederatedHPA.

## CronFederatedHPASpec 

CronFederatedHPASpec is the specification of the CronFederatedHPA.

<hr/>

- **rules** ([]CronFederatedHPARule), required

  Rules contains a collection of schedules that declares when and how the referencing target resource should be scaled.

  <a name="CronFederatedHPARule"></a>

  *CronFederatedHPARule declares a schedule as well as scale actions.*

  - **rules.name** (string), required

    Name of the rule. Each rule in a CronFederatedHPA must have a unique name.
    
    Note: the name will be used as an identifier to record its execution history. Changing the name will be considered as deleting the old rule and adding a new rule, that means the original execution history will be discarded.

  - **rules.schedule** (string), required

    Schedule is the cron expression that represents a periodical time. The syntax follows https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/#schedule-syntax.

  - **rules.failedHistoryLimit** (int32)

    FailedHistoryLimit represents the count of failed execution items for each rule. The value must be a positive integer. It defaults to 3.

  - **rules.successfulHistoryLimit** (int32)

    SuccessfulHistoryLimit represents the count of successful execution items for each rule. The value must be a positive integer. It defaults to 3.

  - **rules.suspend** (boolean)

    Suspend tells the controller to suspend subsequent executions. Defaults to false.

  - **rules.targetMaxReplicas** (int32)

    TargetMaxReplicas is the target MaxReplicas to be set for FederatedHPA. Only needed when referencing resource is FederatedHPA. TargetMinReplicas and TargetMaxReplicas can be specified together or either one can be specified alone. nil means the MaxReplicas(.spec.maxReplicas) of the referencing FederatedHPA will not be updated.

  - **rules.targetMinReplicas** (int32)

    TargetMinReplicas is the target MinReplicas to be set for FederatedHPA. Only needed when referencing resource is FederatedHPA. TargetMinReplicas and TargetMaxReplicas can be specified together or either one can be specified alone. nil means the MinReplicas(.spec.minReplicas) of the referencing FederatedHPA will not be updated.

  - **rules.targetReplicas** (int32)

    TargetReplicas is the target replicas to be scaled for resources referencing by ScaleTargetRef of this CronFederatedHPA. Only needed when referencing resource is not FederatedHPA.

  - **rules.timeZone** (string)

    TimeZone for the giving schedule. If not specified, this will default to the time zone of the karmada-controller-manager process. Invalid TimeZone will be rejected when applying by karmada-webhook. see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for the all timezones.

- **scaleTargetRef** (CrossVersionObjectReference), required

  ScaleTargetRef points to the target resource to scale. Target resource could be any resource that implementing the scale subresource like Deployment, or FederatedHPA.

  <a name="CrossVersionObjectReference"></a>

  *CrossVersionObjectReference contains enough information to let you identify the referred resource.*

  - **scaleTargetRef.kind** (string), required

    kind is the kind of the referent; More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

  - **scaleTargetRef.name** (string), required

    name is the name of the referent; More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

  - **scaleTargetRef.apiVersion** (string)

    apiVersion is the API version of the referent

## CronFederatedHPAStatus 

CronFederatedHPAStatus represents the current status of a CronFederatedHPA.

<hr/>

- **executionHistories** ([]ExecutionHistory)

  ExecutionHistories record the execution histories of CronFederatedHPARule.

  <a name="ExecutionHistory"></a>

  *ExecutionHistory records the execution history of specific CronFederatedHPARule.*

  - **executionHistories.ruleName** (string), required

    RuleName is the name of the CronFederatedHPARule.

  - **executionHistories.failedExecutions** ([]FailedExecution)

    FailedExecutions records failed executions.

    <a name="FailedExecution"></a>

    *FailedExecution records a failed execution.*

    - **executionHistories.failedExecutions.executionTime** (Time), required

      ExecutionTime is the actual execution time of CronFederatedHPARule. Tasks may not always be executed at ScheduleTime. ExecutionTime is used to evaluate the efficiency of the controller's execution.

      <a name="Time"></a>

      *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

    - **executionHistories.failedExecutions.message** (string), required

      Message is the human-readable message indicating details about the failure.

    - **executionHistories.failedExecutions.scheduleTime** (Time), required

      ScheduleTime is the expected execution time declared in CronFederatedHPARule.

      <a name="Time"></a>

      *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

  - **executionHistories.nextExecutionTime** (Time)

    NextExecutionTime is the next time to execute. Nil means the rule has been suspended.

    <a name="Time"></a>

    *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

  - **executionHistories.successfulExecutions** ([]SuccessfulExecution)

    SuccessfulExecutions records successful executions.

    <a name="SuccessfulExecution"></a>

    *SuccessfulExecution records a successful execution.*

    - **executionHistories.successfulExecutions.executionTime** (Time), required

      ExecutionTime is the actual execution time of CronFederatedHPARule. Tasks may not always be executed at ScheduleTime. ExecutionTime is used to evaluate the efficiency of the controller's execution.

      <a name="Time"></a>

      *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

    - **executionHistories.successfulExecutions.scheduleTime** (Time), required

      ScheduleTime is the expected execution time declared in CronFederatedHPARule.

      <a name="Time"></a>

      *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

    - **executionHistories.successfulExecutions.appliedMaxReplicas** (int32)

      AppliedMaxReplicas is the MaxReplicas have been applied. It is required if .spec.rules[*].targetMaxReplicas is not empty.

    - **executionHistories.successfulExecutions.appliedMinReplicas** (int32)

      AppliedMinReplicas is the MinReplicas have been applied. It is required if .spec.rules[*].targetMinReplicas is not empty.

    - **executionHistories.successfulExecutions.appliedReplicas** (int32)

      AppliedReplicas is the replicas have been applied. It is required if .spec.rules[*].targetReplicas is not empty.

## CronFederatedHPAList 

CronFederatedHPAList contains a list of CronFederatedHPA.

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: CronFederatedHPAList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)), required

## Operations 

<hr/>

### `get` read the specified CronFederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas/\{name\}

#### Parameters

- **name** (*in path*): string, required

  name of the CronFederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

### `get` read status of the specified CronFederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas/\{name\}/status

#### Parameters

- **name** (*in path*): string, required

  name of the CronFederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

### `list` list or watch objects of kind CronFederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **allowWatchBookmarks** (*in query*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*in query*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### Response

200 ([CronFederatedHPAList](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpalist)): OK

### `list` list or watch objects of kind CronFederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/cronfederatedhpas

#### Parameters

- **allowWatchBookmarks** (*in query*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*in query*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### Response

200 ([CronFederatedHPAList](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpalist)): OK

### `create` create a CronFederatedHPA

#### HTTP Request

POST /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

202 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Accepted

### `update` replace the specified CronFederatedHPA

#### HTTP Request

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas/\{name\}

#### Parameters

- **name** (*in path*): string, required

  name of the CronFederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `update` replace status of the specified CronFederatedHPA

#### HTTP Request

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas/\{name\}/status

#### Parameters

- **name** (*in path*): string, required

  name of the CronFederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `patch` partially update the specified CronFederatedHPA

#### HTTP Request

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas/\{name\}

#### Parameters

- **name** (*in path*): string, required

  name of the CronFederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `patch` partially update status of the specified CronFederatedHPA

#### HTTP Request

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas/\{name\}/status

#### Parameters

- **name** (*in path*): string, required

  name of the CronFederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): OK

201 ([CronFederatedHPA](../auto-scaling-resources/cron-federated-hpa-v1alpha1#cronfederatedhpa)): Created

### `delete` delete a CronFederatedHPA

#### HTTP Request

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas/\{name\}

#### Parameters

- **name** (*in path*): string, required

  name of the CronFederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### Response

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` delete collection of CronFederatedHPA

#### HTTP Request

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/\{namespace\}/cronfederatedhpas

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### Response

200 ([Status](../common-definitions/status#status)): OK

