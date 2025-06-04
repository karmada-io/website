---
api_metadata:
  apiVersion: "cluster.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/cluster/v1alpha1"
  kind: "Cluster"
content_type: "api_reference"
description: "Cluster represents the desired state and status of a member cluster."
title: "Cluster v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: cluster.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/cluster/v1alpha1"`

## Cluster 

Cluster represents the desired state and status of a member cluster.

<hr/>

- **apiVersion**: cluster.karmada.io/v1alpha1

- **kind**: Cluster

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ClusterSpec](../cluster-resources/cluster-v1alpha1#clusterspec)), required

  Spec represents the specification of the desired behavior of member cluster.

- **status** ([ClusterStatus](../cluster-resources/cluster-v1alpha1#clusterstatus))

  Status represents the status of member cluster.

## ClusterSpec 

ClusterSpec defines the desired state of a member cluster.

<hr/>

- **syncMode** (string), required

  SyncMode describes how a cluster syncs resources from karmada control plane.

- **apiEndpoint** (string)

  The API endpoint of the member cluster. This can be a hostname, hostname:port, IP or IP:port.

- **id** (string)

  ID is the unique identifier for the cluster. It is different from the object uid(.metadata.uid) and is typically collected automatically from each member cluster during the process of registration.
  
  The value is collected in order: 1. If the registering cluster enabled ClusterProperty API and defined the cluster ID by
    creating a ClusterProperty object with name 'cluster.clusterset.k8s.io', Karmada would
    take the defined value in the ClusterProperty object.
    See https://github.com/kubernetes-sigs/about-api for more details about ClusterProperty API.
  2. Take the uid of 'kube-system' namespace on the registering cluster.
  
  Please don't update this value unless you know what you are doing, because it will/may be used to : - uniquely identify the clusters within the Karmada system. - compose the DNS name of multi-cluster services.

- **impersonatorSecretRef** (LocalSecretReference)

  ImpersonatorSecretRef represents the secret that contains the token of impersonator. The secret should hold credentials as follows: - secret.data.token

  <a name="LocalSecretReference"></a>

  *LocalSecretReference is a reference to a secret within the enclosing namespace.*

  - **impersonatorSecretRef.name** (string), required

    Name is the name of the resource being referenced.

  - **impersonatorSecretRef.namespace** (string), required

    Namespace is the namespace for the resource being referenced.

- **insecureSkipTLSVerification** (boolean)

  InsecureSkipTLSVerification indicates that the karmada control plane should not confirm the validity of the serving certificate of the cluster it is connecting to. This will make the HTTPS connection between the karmada control plane and the member cluster insecure. Defaults to false.

- **provider** (string)

  Provider represents the cloud provider name of the member cluster.

- **proxyHeader** (map[string]string)

  ProxyHeader is the HTTP header required by proxy server. The key in the key-value pair is HTTP header key and the value is the associated header payloads. For the header with multiple values, the values should be separated by comma(e.g. 'k1': 'v1,v2,v3').

- **proxyURL** (string)

  ProxyURL is the proxy URL for the cluster. If not empty, the karmada control plane will use this proxy to talk to the cluster. For more details please refer to: https://github.com/kubernetes/client-go/issues/351

- **region** (string)

  Region represents the region in which the member cluster is located.

- **resourceModels** ([]ResourceModel)

  ResourceModels is the list of resource modeling in this cluster. Each modeling quota can be customized by the user. Modeling name must be one of the following: cpu, memory, storage, ephemeral-storage. If the user does not define the modeling name and modeling quota, it will be the default model. The default model grade from 0 to 8. When grade = 0 or grade = 1, the default model's cpu quota and memory quota is a fix value. When grade greater than or equal to 2, each default model's cpu quota is [2^(grade-1), 2^grade), 2 &lt;= grade &lt;= 7 Each default model's memory quota is [2^(grade + 2), 2^(grade + 3)), 2 &lt;= grade &lt;= 7 E.g. grade 0 likes this: - grade: 0
    ranges:
    - name: "cpu"
      min: 0 C
      max: 1 C
    - name: "memory"
      min: 0 GB
      max: 4 GB
  
  - grade: 1
    ranges:
    - name: "cpu"
      min: 1 C
      max: 2 C
    - name: "memory"
      min: 4 GB
      max: 16 GB
  
  - grade: 2
    ranges:
    - name: "cpu"
      min: 2 C
      max: 4 C
    - name: "memory"
      min: 16 GB
      max: 32 GB
  
  - grade: 7
    range:
    - name: "cpu"
      min: 64 C
      max: 128 C
    - name: "memory"
      min: 512 GB
      max: 1024 GB
  
  grade 8, the last one likes below. No matter what Max value you pass, the meaning of Max value in this grade is infinite. You can pass any number greater than Min value. - grade: 8
    range:
    - name: "cpu"
      min: 128 C
      max: MAXINT
    - name: "memory"
      min: 1024 GB
      max: MAXINT

  <a name="ResourceModel"></a>

  *ResourceModel describes the modeling that you want to statistics.*

  - **resourceModels.grade** (int32), required

    Grade is the index for the resource modeling.

  - **resourceModels.ranges** ([]ResourceModelRange), required

    Ranges describes the resource quota ranges.

    <a name="ResourceModelRange"></a>

    *ResourceModelRange describes the detail of each modeling quota that ranges from min to max. Please pay attention, by default, the value of min can be inclusive, and the value of max cannot be inclusive. E.g. in an interval, min = 2, max = 10 is set, which means the interval [2,10). This rule ensures that all intervals have the same meaning. If the last interval is infinite, it is definitely unreachable. Therefore, we define the right interval as the open interval. For a valid interval, the value on the right is greater than the value on the left, in other words, max must be greater than min. It is strongly recommended that the [Min, Max) of all ResourceModelRanges can make a continuous interval.*

    - **resourceModels.ranges.max** ([Quantity](../common-definitions/quantity#quantity)), required

      Max is the maximum amount of this resource represented by resource name. Special Instructions, for the last ResourceModelRange, which no matter what Max value you pass, the meaning is infinite. Because for the last item, any ResourceModelRange's quota larger than Min will be classified to the last one. Of course, the value of the Max field is always greater than the value of the Min field. It should be true in any case.

    - **resourceModels.ranges.min** ([Quantity](../common-definitions/quantity#quantity)), required

      Min is the minimum amount of this resource represented by resource name. Note: The Min value of first grade(usually 0) always acts as zero. E.g. [1,2) equal to [0,2).

    - **resourceModels.ranges.name** (string), required

      Name is the name for the resource that you want to categorize.

- **secretRef** (LocalSecretReference)

  SecretRef represents the secret that contains mandatory credentials to access the member cluster. The secret should hold credentials as follows: - secret.data.token - secret.data.caBundle

  <a name="LocalSecretReference"></a>

  *LocalSecretReference is a reference to a secret within the enclosing namespace.*

  - **secretRef.name** (string), required

    Name is the name of the resource being referenced.

  - **secretRef.namespace** (string), required

    Namespace is the namespace for the resource being referenced.

- **taints** ([]Taint)

  Taints are attached to the member cluster. Taints on the cluster have the "effect" on any resource that does not tolerate the Taint.

  <a name="Taint"></a>

  *The node this Taint is attached to has the "effect" on any pod that does not tolerate the Taint.*

  - **taints.effect** (string), required

    Required. The effect of the taint on pods that do not tolerate the taint. Valid effects are NoSchedule, PreferNoSchedule and NoExecute.
    
    Possible enum values:
     - `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.
     - `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.
     - `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler.

  - **taints.key** (string), required

    Required. The taint key to be applied to a node.

  - **taints.timeAdded** (Time)

    TimeAdded represents the time at which the taint was added. It is only written for NoExecute taints.

    <a name="Time"></a>

    *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

  - **taints.value** (string)

    The taint value corresponding to the taint key.

- **zone** (string)

  Zone represents the zone in which the member cluster is located. Deprecated: This field was never been used by Karmada, and it will not be removed from v1alpha1 for backward compatibility, use Zones instead.

- **zones** ([]string)

  Zones represents the failure zones(also called availability zones) of the member cluster. The zones are presented as a slice to support the case that cluster runs across multiple failure zones. Refer https://kubernetes.io/docs/setup/best-practices/multiple-zones/ for more details about running Kubernetes in multiple zones.

## ClusterStatus 

ClusterStatus contains information about the current status of a cluster updated periodically by cluster controller.

<hr/>

- **apiEnablements** ([]APIEnablement)

  APIEnablements represents the list of APIs installed on the member cluster.

  <a name="APIEnablement"></a>

  *APIEnablement is a list of API resource, it is used to expose the name of the resources supported in a specific group and version.*

  - **apiEnablements.groupVersion** (string), required

    GroupVersion is the group and version this APIEnablement is for.

  - **apiEnablements.resources** ([]APIResource)

    Resources is a list of APIResource.

    <a name="APIResource"></a>

    *APIResource specifies the name and kind names for the resource.*

    - **apiEnablements.resources.kind** (string), required

      Kind is the kind for the resource (e.g. 'Deployment' is the kind for resource 'deployments')

    - **apiEnablements.resources.name** (string), required

      Name is the plural name of the resource.

- **conditions** ([]Condition)

  Conditions is an array of current cluster conditions.

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

- **kubernetesVersion** (string)

  KubernetesVersion represents version of the member cluster.

- **nodeSummary** (NodeSummary)

  NodeSummary represents the summary of nodes status in the member cluster.

  <a name="NodeSummary"></a>

  *NodeSummary represents the summary of nodes status in a specific cluster.*

  - **nodeSummary.readyNum** (int32)

    ReadyNum is the number of ready nodes in the cluster.

  - **nodeSummary.totalNum** (int32)

    TotalNum is the total number of nodes in the cluster.

- **remedyActions** ([]string)

  RemedyActions represents the remedy actions that needs to be performed on the cluster.

- **resourceSummary** (ResourceSummary)

  ResourceSummary represents the summary of resources in the member cluster.

  <a name="ResourceSummary"></a>

  *ResourceSummary represents the summary of resources in the member cluster.*

  - **resourceSummary.allocatable** (map[string][Quantity](../common-definitions/quantity#quantity))

    Allocatable represents the resources of a cluster that are available for scheduling. Total amount of allocatable resources on all nodes.

  - **resourceSummary.allocatableModelings** ([]AllocatableModeling)

    AllocatableModelings represents the statistical resource modeling.

    <a name="AllocatableModeling"></a>

    *AllocatableModeling represents the number of nodes in which allocatable resources in a specific resource model grade. E.g. AllocatableModeling[Grade: 2, Count: 10] means 10 nodes belong to resource model in grade 2.*

    - **resourceSummary.allocatableModelings.count** (int32), required

      Count is the number of nodes that own the resources delineated by this modeling.

    - **resourceSummary.allocatableModelings.grade** (int32), required

      Grade is the index of ResourceModel.

  - **resourceSummary.allocated** (map[string][Quantity](../common-definitions/quantity#quantity))

    Allocated represents the resources of a cluster that have been scheduled. Total amount of required resources of all Pods that have been scheduled to nodes.

  - **resourceSummary.allocating** (map[string][Quantity](../common-definitions/quantity#quantity))

    Allocating represents the resources of a cluster that are pending for scheduling. Total amount of required resources of all Pods that are waiting for scheduling.

## ClusterList 

ClusterList contains a list of member clusters

<hr/>

- **apiVersion**: cluster.karmada.io/v1alpha1

- **kind**: ClusterList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][Cluster](../cluster-resources/cluster-v1alpha1#cluster)), required

  Items holds a list of Cluster.

## Operations 

<hr/>

### `get` read the specified Cluster

#### HTTP Request

GET /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the Cluster

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

### `get` read status of the specified Cluster

#### HTTP Request

GET /apis/cluster.karmada.io/v1alpha1/clusters/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the Cluster

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

### `list` list or watch objects of kind Cluster

#### HTTP Request

GET /apis/cluster.karmada.io/v1alpha1/clusters

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

200 ([ClusterList](../cluster-resources/cluster-v1alpha1#clusterlist)): OK

### `create` create a Cluster

#### HTTP Request

POST /apis/cluster.karmada.io/v1alpha1/clusters

#### Parameters

- **body**: [Cluster](../cluster-resources/cluster-v1alpha1#cluster), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

202 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Accepted

### `update` replace the specified Cluster

#### HTTP Request

PUT /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the Cluster

- **body**: [Cluster](../cluster-resources/cluster-v1alpha1#cluster), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `update` replace status of the specified Cluster

#### HTTP Request

PUT /apis/cluster.karmada.io/v1alpha1/clusters/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the Cluster

- **body**: [Cluster](../cluster-resources/cluster-v1alpha1#cluster), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `patch` partially update the specified Cluster

#### HTTP Request

PATCH /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the Cluster

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

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `patch` partially update status of the specified Cluster

#### HTTP Request

PATCH /apis/cluster.karmada.io/v1alpha1/clusters/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the Cluster

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

200 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): OK

201 ([Cluster](../cluster-resources/cluster-v1alpha1#cluster)): Created

### `delete` delete a Cluster

#### HTTP Request

DELETE /apis/cluster.karmada.io/v1alpha1/clusters/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the Cluster

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

### `deletecollection` delete collection of Cluster

#### HTTP Request

DELETE /apis/cluster.karmada.io/v1alpha1/clusters

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

