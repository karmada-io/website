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

FederatedResourceQuota sets aggregate quota restrictions enforced per namespace across all clusters.

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: FederatedResourceQuota

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([FederatedResourceQuotaSpec](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotaspec)), required

  Spec defines the desired quota.

- **status** ([FederatedResourceQuotaStatus](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotastatus))

  Status defines the actual enforced quota and its current usage.

## FederatedResourceQuotaSpec 

FederatedResourceQuotaSpec defines the desired hard limits to enforce for Quota.

<hr/>

- **overall** (map[string][Quantity](../common-definitions/quantity#quantity)), required

  Overall is the set of desired hard limits for each named resource.

- **staticAssignments** ([]StaticClusterAssignment)

  StaticAssignments specifies ResourceQuota settings for specific clusters. If non-empty, Karmada will create ResourceQuotas in the corresponding clusters. Clusters not listed here or when StaticAssignments is empty will have no ResourceQuotas created.
  
  This field addresses multi-cluster configuration management challenges by allowing centralized control over ResourceQuotas across clusters.
  
  Note: The Karmada scheduler currently does NOT use this configuration for scheduling decisions. Future updates may integrate it into the scheduling logic.

  <a name="StaticClusterAssignment"></a>

  *StaticClusterAssignment represents the set of desired hard limits for a specific cluster.*

  - **staticAssignments.clusterName** (string), required

    ClusterName is the name of the cluster the limits enforce to.

  - **staticAssignments.hard** (map[string][Quantity](../common-definitions/quantity#quantity)), required

    Hard is the set of desired hard limits for each named resource.

## FederatedResourceQuotaStatus 

FederatedResourceQuotaStatus defines the enforced hard limits and observed use.

<hr/>

- **aggregatedStatus** ([]ClusterQuotaStatus)

  AggregatedStatus is the observed quota usage of each cluster.

  <a name="ClusterQuotaStatus"></a>

  *ClusterQuotaStatus represents the set of desired limits and observed usage for a specific cluster.*

  - **aggregatedStatus.clusterName** (string), required

    ClusterName is the name of the cluster the limits enforce to.

  - **aggregatedStatus.hard** (map[string][Quantity](../common-definitions/quantity#quantity))

    Hard is the set of enforced hard limits for each named resource. More info: https://kubernetes.io/docs/concepts/policy/resource-quotas/

  - **aggregatedStatus.used** (map[string][Quantity](../common-definitions/quantity#quantity))

    Used is the current observed total usage of the resource in the namespace.

- **overall** (map[string][Quantity](../common-definitions/quantity#quantity))

  Overall is the set of enforced hard limits for each named resource.

- **overallUsed** (map[string][Quantity](../common-definitions/quantity#quantity))

  OverallUsed is the current observed total usage of the resource in the namespace.

## FederatedResourceQuotaList 

FederatedResourceQuotaList contains a list of FederatedResourceQuota.

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: FederatedResourceQuotaList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)), required

## Operations 

<hr/>

### `get` read the specified FederatedResourceQuota

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedResourceQuota

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): OK

### `get` read status of the specified FederatedResourceQuota

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedResourceQuota

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): OK

### `list` list or watch objects of kind FederatedResourceQuota

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/federatedresourcequotas

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

200 ([FederatedResourceQuotaList](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotalist)): OK

### `list` list or watch objects of kind FederatedResourceQuota

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas

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

200 ([FederatedResourceQuotaList](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequotalist)): OK

### `create` create a FederatedResourceQuota

#### HTTP Request

POST /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): Created

202 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): Accepted

### `update` replace the specified FederatedResourceQuota

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedResourceQuota

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): Created

### `update` replace status of the specified FederatedResourceQuota

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedResourceQuota

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): Created

### `patch` partially update the specified FederatedResourceQuota

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedResourceQuota

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

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): Created

### `patch` partially update status of the specified FederatedResourceQuota

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedResourceQuota

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

200 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): OK

201 ([FederatedResourceQuota](../policy-resources/federated-resource-quota-v1alpha1#federatedresourcequota)): Created

### `delete` delete a FederatedResourceQuota

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedResourceQuota

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*in query*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### Response

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` delete collection of FederatedResourceQuota

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedresourcequotas

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

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*in query*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

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

