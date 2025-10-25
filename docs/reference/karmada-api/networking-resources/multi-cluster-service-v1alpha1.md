---
api_metadata:
  apiVersion: "networking.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/networking/v1alpha1"
  kind: "MultiClusterService"
content_type: "api_reference"
description: "MultiClusterService is a named abstraction of multi-cluster software service."
title: "MultiClusterService v1alpha1"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: networking.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/networking/v1alpha1"`

## MultiClusterService 

MultiClusterService is a named abstraction of multi-cluster software service. The name field of MultiClusterService is the same as that of Service name. Services with the same name in different clusters are regarded as the same service and are associated with the same MultiClusterService. MultiClusterService can control the exposure of services to outside multiple clusters, and also enable service discovery between clusters.

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterService

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([MultiClusterServiceSpec](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservicespec)), required

  Spec is the desired state of the MultiClusterService.

- **status** (ServiceStatus)

  Status is the current state of the MultiClusterService.

  <a name="ServiceStatus"></a>

  *ServiceStatus represents the current status of a service.*

  - **status.conditions** ([]Condition)

    *Patch strategy: merge on key `type`*
    
    *Map: unique values on key type will be kept during a merge*
    
    Current service state

    <a name="Condition"></a>

    *Condition contains details for one aspect of the current state of this API Resource.*

    - **status.conditions.lastTransitionTime** (Time), required

      lastTransitionTime is the last time the condition transitioned from one status to another. This should be when the underlying condition changed.  If that is not known, then using the time when the API field changed is acceptable.

      <a name="Time"></a>

      *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

    - **status.conditions.message** (string), required

      message is a human readable message indicating details about the transition. This may be an empty string.

    - **status.conditions.reason** (string), required

      reason contains a programmatic identifier indicating the reason for the condition's last transition. Producers of specific condition types may define expected values and meanings for this field, and whether the values are considered a guaranteed API. The value should be a CamelCase string. This field may not be empty.

    - **status.conditions.status** (string), required

      status of the condition, one of True, False, Unknown.

    - **status.conditions.type** (string), required

      type of condition in CamelCase or in foo.example.com/CamelCase.

    - **status.conditions.observedGeneration** (int64)

      observedGeneration represents the .metadata.generation that the condition was set based upon. For instance, if .metadata.generation is currently 12, but the .status.conditions[x].observedGeneration is 9, the condition is out of date with respect to the current state of the instance.

  - **status.loadBalancer** (LoadBalancerStatus)

    LoadBalancer contains the current status of the load-balancer, if one is present.

    <a name="LoadBalancerStatus"></a>

    *LoadBalancerStatus represents the status of a load-balancer.*

    - **status.loadBalancer.ingress** ([]LoadBalancerIngress)

      *Atomic: will be replaced during a merge*
      
      Ingress is a list containing ingress points for the load-balancer. Traffic intended for the service should be sent to these ingress points.

      <a name="LoadBalancerIngress"></a>

      *LoadBalancerIngress represents the status of a load-balancer ingress point: traffic intended for the service should be sent to an ingress point.*

      - **status.loadBalancer.ingress.hostname** (string)

        Hostname is set for load-balancer ingress points that are DNS based (typically AWS load-balancers)

      - **status.loadBalancer.ingress.ip** (string)

        IP is set for load-balancer ingress points that are IP based (typically GCE or OpenStack load-balancers)

      - **status.loadBalancer.ingress.ipMode** (string)

        IPMode specifies how the load-balancer IP behaves, and may only be specified when the ip field is specified. Setting this to "VIP" indicates that traffic is delivered to the node with the destination set to the load-balancer's IP and port. Setting this to "Proxy" indicates that traffic is delivered to the node or pod with the destination set to the node's IP and node port or the pod's IP and port. Service implementations may use this information to adjust traffic routing.

      - **status.loadBalancer.ingress.ports** ([]PortStatus)

        *Atomic: will be replaced during a merge*
        
        Ports is a list of records of service ports If used, every port defined in the service should have an entry in it

        <a name="PortStatus"></a>

        *PortStatus represents the error condition of a service port*

        - **status.loadBalancer.ingress.ports.port** (int32), required

          Port is the port number of the service port of which status is recorded here

        - **status.loadBalancer.ingress.ports.protocol** (string), required

          Protocol is the protocol of the service port of which status is recorded here The supported values are: "TCP", "UDP", "SCTP"
          
          Possible enum values:
           - `"SCTP"` is the SCTP protocol.
           - `"TCP"` is the TCP protocol.
           - `"UDP"` is the UDP protocol.

        - **status.loadBalancer.ingress.ports.error** (string)

          Error is to record the problem with the service port The format of the error shall comply with the following rules: - built-in error values shall be specified in this file and those shall use
            CamelCase names
          - cloud provider specific error values must have names that comply with the
            format foo.example.com/CamelCase.

## MultiClusterServiceSpec 

MultiClusterServiceSpec is the desired state of the MultiClusterService.

<hr/>

- **types** ([]string), required

  Types specifies how to expose the service referencing by this MultiClusterService.

- **consumerClusters** ([]ClusterSelector)

  ConsumerClusters specifies the clusters where the service will be exposed, for clients. If leave it empty, the service will be exposed to all clusters.

  <a name="ClusterSelector"></a>

  *ClusterSelector specifies the cluster to be selected.*

  - **consumerClusters.name** (string), required

    Name is the name of the cluster to be selected.

- **ports** ([]ExposurePort)

  Ports is the list of ports that are exposed by this MultiClusterService. No specified port will be filtered out during the service exposure and discovery process. All ports in the referencing service will be exposed by default.

  <a name="ExposurePort"></a>

  *ExposurePort describes which port will be exposed.*

  - **ports.port** (int32), required

    Port specifies the exposed service port.

  - **ports.name** (string)

    Name is the name of the port that needs to be exposed within the service. The port name must be the same as that defined in the service.

- **providerClusters** ([]ClusterSelector)

  ProviderClusters specifies the clusters which will provide the service backend. If leave it empty, we will collect the backend endpoints from all clusters and sync them to the ConsumerClusters.

  <a name="ClusterSelector"></a>

  *ClusterSelector specifies the cluster to be selected.*

  - **providerClusters.name** (string), required

    Name is the name of the cluster to be selected.

- **range** (ExposureRange)

  Range specifies the ranges where the referencing service should be exposed. Only valid and optional in case of Types contains CrossCluster. If not set and Types contains CrossCluster, all clusters will be selected, that means the referencing service will be exposed across all registered clusters. Deprecated: in favor of ProviderClusters/ConsumerClusters.

  <a name="ExposureRange"></a>

  *ExposureRange describes a list of clusters where the service is exposed. Now supports selecting cluster by name, leave the room for extend more methods such as using label selector.*

  - **range.clusterNames** ([]string)

    ClusterNames is the list of clusters to be selected.

- **serviceConsumptionClusters** ([]string)

  ServiceConsumptionClusters specifies the clusters where the service will be exposed, for clients. If leave it empty, the service will be exposed to all clusters. Deprecated: in favor of ProviderClusters/ConsumerClusters.

- **serviceProvisionClusters** ([]string)

  ServiceProvisionClusters specifies the clusters which will provision the service backend. If leave it empty, we will collect the backend endpoints from all clusters and sync them to the ServiceConsumptionClusters. Deprecated: in favor of ProviderClusters/ConsumerClusters.

## MultiClusterServiceList 

MultiClusterServiceList is a collection of MultiClusterService.

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterServiceList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)), required

  Items is the list of MultiClusterService.

## Operations 

<hr/>

### `get` read the specified MultiClusterService

#### HTTP Request

GET /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterService

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

### `get` read status of the specified MultiClusterService

#### HTTP Request

GET /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterService

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

### `list` list or watch objects of kind MultiClusterService

#### HTTP Request

GET /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices

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

200 ([MultiClusterServiceList](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservicelist)): OK

### `list` list or watch objects of kind MultiClusterService

#### HTTP Request

GET /apis/networking.karmada.io/v1alpha1/multiclusterservices

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

200 ([MultiClusterServiceList](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservicelist)): OK

### `list` list or watch objects of kind MultiClusterService

#### HTTP Request

GET /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices

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

200 ([MultiClusterServiceList](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservicelist)): OK

### `create` create a MultiClusterService

#### HTTP Request

POST /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

202 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Accepted

### `update` replace the specified MultiClusterService

#### HTTP Request

PUT /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterService

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `update` replace status of the specified MultiClusterService

#### HTTP Request

PUT /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterService

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `patch` partially update the specified MultiClusterService

#### HTTP Request

PATCH /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterService

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

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `patch` partially update status of the specified MultiClusterService

#### HTTP Request

PATCH /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterService

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

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `delete` delete a MultiClusterService

#### HTTP Request

DELETE /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterService

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

### `deletecollection` delete collection of MultiClusterService

#### HTTP Request

DELETE /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusterservices

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

