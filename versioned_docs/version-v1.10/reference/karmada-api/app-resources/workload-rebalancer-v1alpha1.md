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

WorkloadRebalancer represents the desired behavior and status of a job which can enforces a resource rebalance.

<hr/>

- **apiVersion**: apps.karmada.io/v1alpha1

- **kind**: WorkloadRebalancer

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([WorkloadRebalancerSpec](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancerspec)), required

  Spec represents the specification of the desired behavior of WorkloadRebalancer.

- **status** ([WorkloadRebalancerStatus](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancerstatus))

  Status represents the status of WorkloadRebalancer.

## WorkloadRebalancerSpec 

WorkloadRebalancerSpec represents the specification of the desired behavior of Reschedule.

<hr/>

- **workloads** ([]ObjectReference), required

  Workloads used to specify the list of expected resource. Nil or empty list is not allowed.

  <a name="ObjectReference"></a>

  *ObjectReference the expected resource.*

  - **workloads.apiVersion** (string), required

    APIVersion represents the API version of the target resource.

  - **workloads.kind** (string), required

    Kind represents the Kind of the target resource.

  - **workloads.name** (string), required

    Name of the target resource.

  - **workloads.namespace** (string)

    Namespace of the target resource. Default is empty, which means it is a non-namespacescoped resource.

- **ttlSecondsAfterFinished** (int32)

  TTLSecondsAfterFinished limits the lifetime of a WorkloadRebalancer that has finished execution (means each target workload is finished with result of Successful or Failed). If this field is set, ttlSecondsAfterFinished after the WorkloadRebalancer finishes, it is eligible to be automatically deleted. If this field is unset, the WorkloadRebalancer won't be automatically deleted. If this field is set to zero, the WorkloadRebalancer becomes eligible to be deleted immediately after it finishes.

## WorkloadRebalancerStatus 

WorkloadRebalancerStatus contains information about the current status of a WorkloadRebalancer updated periodically by schedule trigger controller.

<hr/>

- **finishTime** (Time)

  FinishTime represents the finish time of rebalancer.

  <a name="Time"></a>

  *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

- **observedGeneration** (int64)

  ObservedGeneration is the generation(.metadata.generation) observed by the controller. If ObservedGeneration is less than the generation in metadata means the controller hasn't confirmed the rebalance result or hasn't done the rebalance yet.

- **observedWorkloads** ([]ObservedWorkload)

  ObservedWorkloads contains information about the execution states and messages of target resources.

  <a name="ObservedWorkload"></a>

  *ObservedWorkload the observed resource.*

  - **observedWorkloads.workload** (ObjectReference), required

    Workload the observed resource.

    <a name="ObjectReference"></a>

    *ObjectReference the expected resource.*

    - **observedWorkloads.workload.apiVersion** (string), required

      APIVersion represents the API version of the target resource.

    - **observedWorkloads.workload.kind** (string), required

      Kind represents the Kind of the target resource.

    - **observedWorkloads.workload.name** (string), required

      Name of the target resource.

    - **observedWorkloads.workload.namespace** (string)

      Namespace of the target resource. Default is empty, which means it is a non-namespacescoped resource.

  - **observedWorkloads.reason** (string)

    Reason represents a machine-readable description of why this resource rebalanced failed.

  - **observedWorkloads.result** (string)

    Result the observed rebalance result of resource.

## WorkloadRebalancerList 

WorkloadRebalancerList contains a list of WorkloadRebalancer

<hr/>

- **apiVersion**: apps.karmada.io/v1alpha1

- **kind**: WorkloadRebalancerList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)), required

  Items holds a list of WorkloadRebalancer.

## Operations 

<hr/>

### `get` read the specified WorkloadRebalancer

#### HTTP Request

GET /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the WorkloadRebalancer

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

### `get` read status of the specified WorkloadRebalancer

#### HTTP Request

GET /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the WorkloadRebalancer

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

### `list` list or watch objects of kind WorkloadRebalancer

#### HTTP Request

GET /apis/apps.karmada.io/v1alpha1/workloadrebalancers

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

200 ([WorkloadRebalancerList](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancerlist)): OK

### `create` create a WorkloadRebalancer

#### HTTP Request

POST /apis/apps.karmada.io/v1alpha1/workloadrebalancers

#### Parameters

- **body**: [WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

202 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Accepted

### `update` replace the specified WorkloadRebalancer

#### HTTP Request

PUT /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the WorkloadRebalancer

- **body**: [WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `update` replace status of the specified WorkloadRebalancer

#### HTTP Request

PUT /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the WorkloadRebalancer

- **body**: [WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `patch` partially update the specified WorkloadRebalancer

#### HTTP Request

PATCH /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the WorkloadRebalancer

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

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `patch` partially update status of the specified WorkloadRebalancer

#### HTTP Request

PATCH /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the WorkloadRebalancer

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

200 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): OK

201 ([WorkloadRebalancer](../app-resources/workload-rebalancer-v1alpha1#workloadrebalancer)): Created

### `delete` delete a WorkloadRebalancer

#### HTTP Request

DELETE /apis/apps.karmada.io/v1alpha1/workloadrebalancers/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the WorkloadRebalancer

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

### `deletecollection` delete collection of WorkloadRebalancer

#### HTTP Request

DELETE /apis/apps.karmada.io/v1alpha1/workloadrebalancers

#### Parameters

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

