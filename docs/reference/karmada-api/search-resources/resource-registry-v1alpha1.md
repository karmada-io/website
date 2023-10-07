---
api_metadata:
  apiVersion: "search.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/search/v1alpha1"
  kind: "ResourceRegistry"
content_type: "api_reference"
description: "ResourceRegistry represents the configuration of the cache scope, mainly describes which resources in which clusters should be cached."
title: "ResourceRegistry v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: search.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/search/v1alpha1"`

## ResourceRegistry 

ResourceRegistry represents the configuration of the cache scope, mainly describes which resources in which clusters should be cached.

<hr/>

- **apiVersion**: search.karmada.io/v1alpha1

- **kind**: ResourceRegistry

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceRegistrySpec](../search-resources/resource-registry-v1alpha1#resourceregistryspec))

  Spec represents the desired behavior of ResourceRegistry.

- **status** ([ResourceRegistryStatus](../search-resources/resource-registry-v1alpha1#resourceregistrystatus))

  Status represents the status of ResourceRegistry.

## ResourceRegistrySpec 

ResourceRegistrySpec defines the desired state of ResourceRegistry.

<hr/>

- **resourceSelectors** ([]ResourceSelector), required

  ResourceSelectors specifies the resources type that should be cached by cache system.

  <a name="ResourceSelector"></a>

  *ResourceSelector specifies the resources type and its scope.*

  - **resourceSelectors.apiVersion** (string), required

    APIVersion represents the API version of the target resources.

  - **resourceSelectors.kind** (string), required

    Kind represents the kind of the target resources.

  - **resourceSelectors.namespace** (string)

    Namespace of the target resource. Default is empty, which means all namespaces.

- **targetCluster** (ClusterAffinity), required

  TargetCluster specifies the clusters where the cache system collect resource from.

  <a name="ClusterAffinity"></a>

  *ClusterAffinity represents the filter to select clusters.*

  - **targetCluster.clusterNames** ([]string)

    ClusterNames is the list of clusters to be selected.

  - **targetCluster.exclude** ([]string)

    ExcludedClusters is the list of clusters to be ignored.

  - **targetCluster.fieldSelector** (FieldSelector)

    FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

    <a name="FieldSelector"></a>

    *FieldSelector is a field filter.*

    - **targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

      A list of field selector requirements.

  - **targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

    LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

- **backendStore** (BackendStoreConfig)

  BackendStore specifies the location where to store the cached items.

  <a name="BackendStoreConfig"></a>

  *BackendStoreConfig specifies backend store.*

  - **backendStore.openSearch** (OpenSearchConfig)

    OpenSearch is a community-driven, open source search and analytics suite. Refer to website(https://opensearch.org/) for more details about OpenSearch.

    <a name="OpenSearchConfig"></a>

    *OpenSearchConfig holds the necessary configuration for client to access and config an OpenSearch server.*

    - **backendStore.openSearch.addresses** ([]string), required

      Addresses is a list of node endpoint(e.g. 'https://localhost:9200') to use. For the 'node' concept, please refer to: https://opensearch.org/docs/latest/opensearch/index/#clusters-and-nodes

    - **backendStore.openSearch.secretRef** (LocalSecretReference)

      SecretRef represents the secret contains mandatory credentials to access the server. The secret should hold credentials as follows: - secret.data.userName - secret.data.password

      <a name="LocalSecretReference"></a>

      *LocalSecretReference is a reference to a secret within the enclosing namespace.*

      - **backendStore.openSearch.secretRef.name** (string), required

        Name is the name of resource being referenced.

      - **backendStore.openSearch.secretRef.namespace** (string), required

        Namespace is the namespace for the resource being referenced.

## ResourceRegistryStatus 

ResourceRegistryStatus defines the observed state of ResourceRegistry

<hr/>

- **conditions** ([]Condition)

  Conditions contain the different condition statuses.

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

## ResourceRegistryList 

ResourceRegistryList if a collection of ResourceRegistry.

<hr/>

- **apiVersion**: search.karmada.io/v1alpha1

- **kind**: ResourceRegistryList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)), required

  Items holds a list of ResourceRegistry.

## Operations 

<hr/>

### `get` read the specified ResourceRegistry

#### HTTP Request

GET /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceRegistry

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

### `get` read status of the specified ResourceRegistry

#### HTTP Request

GET /apis/search.karmada.io/v1alpha1/resourceregistries/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceRegistry

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

### `list` list or watch objects of kind ResourceRegistry

#### HTTP Request

GET /apis/search.karmada.io/v1alpha1/resourceregistries

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

200 ([ResourceRegistryList](../search-resources/resource-registry-v1alpha1#resourceregistrylist)): OK

### `create` create a ResourceRegistry

#### HTTP Request

POST /apis/search.karmada.io/v1alpha1/resourceregistries

#### Parameters

- **body**: [ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

202 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Accepted

### `update` replace the specified ResourceRegistry

#### HTTP Request

PUT /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceRegistry

- **body**: [ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `update` replace status of the specified ResourceRegistry

#### HTTP Request

PUT /apis/search.karmada.io/v1alpha1/resourceregistries/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceRegistry

- **body**: [ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `patch` partially update the specified ResourceRegistry

#### HTTP Request

PATCH /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceRegistry

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

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `patch` partially update status of the specified ResourceRegistry

#### HTTP Request

PATCH /apis/search.karmada.io/v1alpha1/resourceregistries/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceRegistry

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

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `delete` delete a ResourceRegistry

#### HTTP Request

DELETE /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceRegistry

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

### `deletecollection` delete collection of ResourceRegistry

#### HTTP Request

DELETE /apis/search.karmada.io/v1alpha1/resourceregistries

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

