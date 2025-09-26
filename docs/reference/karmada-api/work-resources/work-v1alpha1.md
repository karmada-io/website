---
api_metadata:
  apiVersion: "work.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/work/v1alpha1"
  kind: "Work"
content_type: "api_reference"
description: "Work defines a list of resources to be deployed on the member cluster."
title: "Work v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: work.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/work/v1alpha1"`

## Work 

Work defines a list of resources to be deployed on the member cluster.

<hr/>

- **apiVersion**: work.karmada.io/v1alpha1

- **kind**: Work

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([WorkSpec](../work-resources/work-v1alpha1#workspec)), required

  Spec represents the desired behavior of Work.

- **status** ([WorkStatus](../work-resources/work-v1alpha1#workstatus))

  Status represents the status of PropagationStatus.

## WorkSpec 

WorkSpec defines the desired state of Work.

<hr/>

- **preserveResourcesOnDeletion** (boolean)

  PreserveResourcesOnDeletion controls whether resources should be preserved on the member cluster when the Work object is deleted. If set to true, resources will be preserved on the member cluster. Default is false, which means resources will be deleted along with the Work object.

- **suspendDispatching** (boolean)

  SuspendDispatching controls whether dispatching should be suspended, nil means not suspend. Note: true means stop propagating to the corresponding member cluster, and does not prevent status collection.

- **workload** (WorkloadTemplate)

  Workload represents the manifest workload to be deployed on managed cluster.

  <a name="WorkloadTemplate"></a>

  *WorkloadTemplate represents the manifest workload to be deployed on managed cluster.*

  - **workload.manifests** ([]Manifest)

    Manifests represents a list of Kubernetes resources to be deployed on the managed cluster.

    <a name="Manifest"></a>

    *Manifest represents a resource to be deployed on managed cluster.*

## WorkStatus 

WorkStatus defines the observed state of Work.

<hr/>

- **conditions** ([]Condition)

  Conditions contain the different condition statuses for this work. Valid condition types are: 1. Applied represents workload in Work is applied successfully on a managed cluster. 2. Progressing represents workload in Work is being applied on a managed cluster. 3. Available represents workload in Work exists on the managed cluster. 4. Degraded represents the current state of workload does not match the desired state for a certain period.

  <a name="Condition"></a>

  *Condition contains details for one aspect of the current state of this API Resource.*

  - **conditions.lastTransitionTime** (Time), required

    lastTransitionTime is the last time the condition transitioned from one status to another. This should be when the underlying condition changed.  If that is not known, then using the time when the API field changed is acceptable.

    <a name="Time"></a>

    *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

  - **conditions.message** (string), required

    message is a human readable message indicating details about the transition. This may be an empty string.

  - **conditions.reason** (string), required

    reason contains a programmatic identifier indicating the reason for the condition's last transition. Producers of specific condition types may define expected values and meanings for this field, and whether the values are considered a guaranteed API. The value should be a CamelCase string. This field may not be empty.

  - **conditions.status** (string), required

    status of the condition, one of True, False, Unknown.

  - **conditions.type** (string), required

    type of condition in CamelCase or in foo.example.com/CamelCase.

  - **conditions.observedGeneration** (int64)

    observedGeneration represents the .metadata.generation that the condition was set based upon. For instance, if .metadata.generation is currently 12, but the .status.conditions[x].observedGeneration is 9, the condition is out of date with respect to the current state of the instance.

- **manifestStatuses** ([]ManifestStatus)

  ManifestStatuses contains running status of manifests in spec.

  <a name="ManifestStatus"></a>

  *ManifestStatus contains running status of a specific manifest in spec.*

  - **manifestStatuses.identifier** (ResourceIdentifier), required

    Identifier represents the identity of a resource linking to manifests in spec.

    <a name="ResourceIdentifier"></a>

    *ResourceIdentifier provides the identifiers needed to interact with any arbitrary object.*

    - **manifestStatuses.identifier.kind** (string), required

      Kind is the kind of the resource.

    - **manifestStatuses.identifier.name** (string), required

      Name is the name of the resource

    - **manifestStatuses.identifier.ordinal** (int32), required

      Ordinal represents an index in manifests list, so the condition can still be linked to a manifest even though manifest cannot be parsed successfully.

    - **manifestStatuses.identifier.resource** (string), required

      Resource is the resource type of the resource

    - **manifestStatuses.identifier.version** (string), required

      Version is the version of the resource.

    - **manifestStatuses.identifier.group** (string)

      Group is the group of the resource.

    - **manifestStatuses.identifier.namespace** (string)

      Namespace is the namespace of the resource, the resource is cluster scoped if the value is empty

  - **manifestStatuses.health** (string)

    Health represents the healthy state of the current resource. There maybe different rules for different resources to achieve health status.

  - **manifestStatuses.status** (RawExtension)

    Status reflects running status of current manifest.

    <a name="RawExtension"></a>

    *RawExtension is used to hold extensions in external versions.
    
    To use this, make a field which has RawExtension as its type in your external, versioned struct, and Object in your internal struct. You also need to register your various plugin types.
    
    // Internal package:
    
    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.Object `json:"myPlugin"`
    	]
    
    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]
    
    // External package:
    
    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.RawExtension `json:"myPlugin"`
    	]
    
    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]
    
    // On the wire, the JSON will look something like this:
    
    	[
    		"kind":"MyAPIObject",
    		"apiVersion":"v1",
    		"myPlugin": [
    			"kind":"PluginA",
    			"aOption":"foo",
    		],
    	]
    
    So what happens? Decode first uses json or yaml to unmarshal the serialized data into your external MyAPIObject. That causes the raw JSON to be stored, but not unpacked. The next step is to copy (using pkg/conversion) into the internal struct. The runtime package's DefaultScheme has conversion functions installed which will unpack the JSON stored in RawExtension, turning it into the correct object type, and storing it in the Object. (TODO: In the case where the object is of an unknown type, a runtime.Unknown object will be created and stored.)*

## WorkList 

WorkList is a collection of Work.

<hr/>

- **apiVersion**: work.karmada.io/v1alpha1

- **kind**: WorkList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][Work](../work-resources/work-v1alpha1#work)), required

  Items holds a list of Work.

## Operations 

<hr/>

### `get` read the specified Work

#### HTTP Request

GET /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Work

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Work](../work-resources/work-v1alpha1#work)): OK

### `get` read status of the specified Work

#### HTTP Request

GET /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the Work

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Work](../work-resources/work-v1alpha1#work)): OK

### `list` list or watch objects of kind Work

#### HTTP Request

GET /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works

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

200 ([WorkList](../work-resources/work-v1alpha1#worklist)): OK

### `list` list or watch objects of kind Work

#### HTTP Request

GET /apis/work.karmada.io/v1alpha1/works

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

200 ([WorkList](../work-resources/work-v1alpha1#worklist)): OK

### `create` create a Work

#### HTTP Request

POST /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Work](../work-resources/work-v1alpha1#work), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

202 ([Work](../work-resources/work-v1alpha1#work)): Accepted

### `update` replace the specified Work

#### HTTP Request

PUT /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Work

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Work](../work-resources/work-v1alpha1#work), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `update` replace status of the specified Work

#### HTTP Request

PUT /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the Work

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Work](../work-resources/work-v1alpha1#work), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `patch` partially update the specified Work

#### HTTP Request

PATCH /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Work

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

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `patch` partially update status of the specified Work

#### HTTP Request

PATCH /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the Work

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

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `delete` delete a Work

#### HTTP Request

DELETE /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the Work

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

### `deletecollection` delete collection of Work

#### HTTP Request

DELETE /apis/work.karmada.io/v1alpha1/namespaces/`{namespace}`/works

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

