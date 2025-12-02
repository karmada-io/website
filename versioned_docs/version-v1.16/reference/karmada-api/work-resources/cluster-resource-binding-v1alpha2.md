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

ClusterResourceBinding represents a binding of a kubernetes resource with a ClusterPropagationPolicy.

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ClusterResourceBinding

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceBindingSpec](../work-resources/resource-binding-v1alpha2#resourcebindingspec)), required

  Spec represents the desired behavior.

- **status** ([ResourceBindingStatus](../work-resources/resource-binding-v1alpha2#resourcebindingstatus))

  Status represents the most recently observed status of the ResourceBinding.

## ClusterResourceBindingList 

ClusterResourceBindingList contains a list of ClusterResourceBinding.

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ClusterResourceBindingList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)), required

  Items is the list of ClusterResourceBinding.

## Operations 

<hr/>

### `get` read the specified ClusterResourceBinding

#### HTTP Request

GET /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterResourceBinding

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

### `get` read status of the specified ClusterResourceBinding

#### HTTP Request

GET /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterResourceBinding

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

### `list` list or watch objects of kind ClusterResourceBinding

#### HTTP Request

GET /apis/work.karmada.io/v1alpha2/clusterresourcebindings

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

200 ([ClusterResourceBindingList](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebindinglist)): OK

### `create` create a ClusterResourceBinding

#### HTTP Request

POST /apis/work.karmada.io/v1alpha2/clusterresourcebindings

#### Parameters

- **body**: [ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

202 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Accepted

### `update` replace the specified ClusterResourceBinding

#### HTTP Request

PUT /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterResourceBinding

- **body**: [ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `update` replace status of the specified ClusterResourceBinding

#### HTTP Request

PUT /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterResourceBinding

- **body**: [ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `patch` partially update the specified ClusterResourceBinding

#### HTTP Request

PATCH /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterResourceBinding

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

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `patch` partially update status of the specified ClusterResourceBinding

#### HTTP Request

PATCH /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterResourceBinding

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

200 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): OK

201 ([ClusterResourceBinding](../work-resources/cluster-resource-binding-v1alpha2#clusterresourcebinding)): Created

### `delete` delete a ClusterResourceBinding

#### HTTP Request

DELETE /apis/work.karmada.io/v1alpha2/clusterresourcebindings/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterResourceBinding

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

### `deletecollection` delete collection of ClusterResourceBinding

#### HTTP Request

DELETE /apis/work.karmada.io/v1alpha2/clusterresourcebindings

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

