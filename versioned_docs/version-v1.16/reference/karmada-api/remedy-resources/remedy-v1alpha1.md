---
api_metadata:
  apiVersion: "remedy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/remedy/v1alpha1"
  kind: "Remedy"
content_type: "api_reference"
description: "Remedy represents the cluster-level management strategies based on cluster conditions."
title: "Remedy v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: remedy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/remedy/v1alpha1"`

## Remedy 

Remedy represents the cluster-level management strategies based on cluster conditions.

<hr/>

- **apiVersion**: remedy.karmada.io/v1alpha1

- **kind**: Remedy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([RemedySpec](../remedy-resources/remedy-v1alpha1#remedyspec)), required

  Spec represents the desired behavior of Remedy.

## RemedySpec 

RemedySpec represents the desired behavior of Remedy.

<hr/>

- **actions** ([]string)

  Actions specifies the actions that remedy system needs to perform. If empty, no action will be performed.

- **clusterAffinity** (ClusterAffinity)

  ClusterAffinity specifies the clusters that Remedy needs to pay attention to. For clusters that meet the DecisionConditions, Actions will be preformed. If empty, all clusters will be selected.

  <a name="ClusterAffinity"></a>

  *ClusterAffinity represents the filter to select clusters.*

  - **clusterAffinity.clusterNames** ([]string)

    ClusterNames is the list of clusters to be selected.

- **decisionMatches** ([]DecisionMatch)

  DecisionMatches indicates the decision matches of triggering the remedy system to perform the actions. As long as any one DecisionMatch matches, the Actions will be preformed. If empty, the Actions will be performed immediately.

  <a name="DecisionMatch"></a>

  *DecisionMatch represents the decision match detail of activating the remedy system.*

  - **decisionMatches.clusterConditionMatch** (ClusterConditionRequirement)

    ClusterConditionMatch describes the cluster condition requirement.

    <a name="ClusterConditionRequirement"></a>

    *ClusterConditionRequirement describes the Cluster condition requirement details.*

    - **decisionMatches.clusterConditionMatch.conditionStatus** (string), required

      ConditionStatus specifies the ClusterStatue condition status.

    - **decisionMatches.clusterConditionMatch.conditionType** (string), required

      ConditionType specifies the ClusterStatus condition type.

    - **decisionMatches.clusterConditionMatch.operator** (string), required

      Operator represents a conditionType's relationship to a conditionStatus. Valid operators are Equal, NotEqual.

## RemedyList 

RemedyList contains a list of Remedy.

<hr/>

- **apiVersion**: remedy.karmada.io/v1alpha1

- **kind**: RemedyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][Remedy](../remedy-resources/remedy-v1alpha1#remedy)), required

## Operations 

<hr/>

### `get` read the specified Remedy

#### HTTP Request

GET /apis/remedy.karmada.io/v1alpha1/remedies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Remedy

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

### `get` read status of the specified Remedy

#### HTTP Request

GET /apis/remedy.karmada.io/v1alpha1/remedies/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the Remedy

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

### `list` list or watch objects of kind Remedy

#### HTTP Request

GET /apis/remedy.karmada.io/v1alpha1/remedies

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

200 ([RemedyList](../remedy-resources/remedy-v1alpha1#remedylist)): OK

### `create` create a Remedy

#### HTTP Request

POST /apis/remedy.karmada.io/v1alpha1/remedies

#### Parameters

- **body**: [Remedy](../remedy-resources/remedy-v1alpha1#remedy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

202 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Accepted

### `update` replace the specified Remedy

#### HTTP Request

PUT /apis/remedy.karmada.io/v1alpha1/remedies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Remedy

- **body**: [Remedy](../remedy-resources/remedy-v1alpha1#remedy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `update` replace status of the specified Remedy

#### HTTP Request

PUT /apis/remedy.karmada.io/v1alpha1/remedies/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the Remedy

- **body**: [Remedy](../remedy-resources/remedy-v1alpha1#remedy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `patch` partially update the specified Remedy

#### HTTP Request

PATCH /apis/remedy.karmada.io/v1alpha1/remedies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Remedy

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

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `patch` partially update status of the specified Remedy

#### HTTP Request

PATCH /apis/remedy.karmada.io/v1alpha1/remedies/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the Remedy

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

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `delete` delete a Remedy

#### HTTP Request

DELETE /apis/remedy.karmada.io/v1alpha1/remedies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Remedy

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

### `deletecollection` delete collection of Remedy

#### HTTP Request

DELETE /apis/remedy.karmada.io/v1alpha1/remedies

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

