---
api_metadata:
  apiVersion: "policy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
  kind: "ClusterTaintPolicy"
content_type: "api_reference"
description: "ClusterTaintPolicy automates taint management on Cluster objects based on declarative conditions."
title: "ClusterTaintPolicy v1alpha1"
weight: 6
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: policy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"`

## ClusterTaintPolicy 

ClusterTaintPolicy automates taint management on Cluster objects based on declarative conditions. The system evaluates AddOnConditions to determine when to add taints, and RemoveOnConditions to determine when to remove taints. AddOnConditions are evaluated before RemoveOnConditions. Taints are NEVER automatically removed when the ClusterTaintPolicy is deleted.

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: ClusterTaintPolicy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ClusterTaintPolicySpec](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicyspec)), required

  Spec represents the desired behavior of ClusterTaintPolicy.

## ClusterTaintPolicySpec 

ClusterTaintPolicySpec represents the desired behavior of ClusterTaintPolicy.

<hr/>

- **taints** ([]Taint), required

  Taints specifies the taints that need to be added or removed on the cluster object which match with TargetClusters. If the Taints is modified, the system will process the taints based on the latest value of Taints during the next condition-triggered execution, regardless of whether the taint has been added or removed.

  <a name="Taint"></a>

  *Taint describes the taint that needs to be applied to the cluster.*

  - **taints.effect** (string), required

    Effect represents the taint effect to be applied to a cluster.
    
    Possible enum values:
     - `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.
     - `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.
     - `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler.

  - **taints.key** (string), required

    Key represents the taint key to be applied to a cluster.

  - **taints.value** (string)

    Value represents the taint value corresponding to the taint key.

- **addOnConditions** ([]MatchCondition)

  AddOnConditions defines the conditions to match for triggering the controller to add taints on the cluster object. The match conditions are ANDed. If AddOnConditions is empty, no taints will be added.

  <a name="MatchCondition"></a>

  *MatchCondition represents the condition match detail of activating the failover relevant taints on target clusters.*

  - **addOnConditions.conditionType** (string), required

    ConditionType specifies the ClusterStatus condition type.

  - **addOnConditions.operator** (string), required

    Operator represents a relationship to a set of values. Valid operators are In, NotIn.

  - **addOnConditions.statusValues** ([]string), required

    StatusValues is an array of metav1.ConditionStatus values. The item specifies the ClusterStatus condition status.

- **removeOnConditions** ([]MatchCondition)

  RemoveOnConditions defines the conditions to match for triggering the controller to remove taints from the cluster object. The match conditions are ANDed. If RemoveOnConditions is empty, no taints will be removed.

  <a name="MatchCondition"></a>

  *MatchCondition represents the condition match detail of activating the failover relevant taints on target clusters.*

  - **removeOnConditions.conditionType** (string), required

    ConditionType specifies the ClusterStatus condition type.

  - **removeOnConditions.operator** (string), required

    Operator represents a relationship to a set of values. Valid operators are In, NotIn.

  - **removeOnConditions.statusValues** ([]string), required

    StatusValues is an array of metav1.ConditionStatus values. The item specifies the ClusterStatus condition status.

- **targetClusters** (ClusterAffinity)

  TargetClusters specifies the clusters that ClusterTaintPolicy needs to pay attention to. For clusters that no longer match the TargetClusters, the taints will be kept unchanged. If targetClusters is not set, any cluster can be selected.

  <a name="ClusterAffinity"></a>

  *ClusterAffinity represents the filter to select clusters.*

  - **targetClusters.clusterNames** ([]string)

    ClusterNames is the list of clusters to be selected.

  - **targetClusters.exclude** ([]string)

    ExcludedClusters is the list of clusters to be ignored.

  - **targetClusters.fieldSelector** (FieldSelector)

    FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

    <a name="FieldSelector"></a>

    *FieldSelector is a field filter.*

    - **targetClusters.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

      A list of field selector requirements.

  - **targetClusters.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

    LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

## ClusterTaintPolicyList 

ClusterTaintPolicyList contains a list of ClusterTaintPolicy

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: ClusterTaintPolicyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)), required

## Operations 

<hr/>

### `get` read the specified ClusterTaintPolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterTaintPolicy

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

### `get` read status of the specified ClusterTaintPolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterTaintPolicy

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

### `list` list or watch objects of kind ClusterTaintPolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/clustertaintpolicies

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

200 ([ClusterTaintPolicyList](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicylist)): OK

### `create` create a ClusterTaintPolicy

#### HTTP Request

POST /apis/policy.karmada.io/v1alpha1/clustertaintpolicies

#### Parameters

- **body**: [ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

202 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Accepted

### `update` replace the specified ClusterTaintPolicy

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterTaintPolicy

- **body**: [ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `update` replace status of the specified ClusterTaintPolicy

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterTaintPolicy

- **body**: [ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `patch` partially update the specified ClusterTaintPolicy

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterTaintPolicy

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

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `patch` partially update status of the specified ClusterTaintPolicy

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterTaintPolicy

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

200 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): OK

201 ([ClusterTaintPolicy](../policy-resources/cluster-taint-policy-v1alpha1#clustertaintpolicy)): Created

### `delete` delete a ClusterTaintPolicy

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/clustertaintpolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ClusterTaintPolicy

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

### `deletecollection` delete collection of ClusterTaintPolicy

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/clustertaintpolicies

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

