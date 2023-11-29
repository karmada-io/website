---
api_metadata:
  apiVersion: "networking.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/networking/v1alpha1"
  kind: "MultiClusterIngress"
content_type: "api_reference"
description: "MultiClusterIngress is a collection of rules that allow inbound connections to reach the endpoints defined by a backend."
title: "MultiClusterIngress v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: networking.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/networking/v1alpha1"`

## MultiClusterIngress 

MultiClusterIngress is a collection of rules that allow inbound connections to reach the endpoints defined by a backend. The structure of MultiClusterIngress is same as Ingress, indicates the Ingress in multi-clusters.

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterIngress

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** (IngressSpec)

  Spec is the desired state of the MultiClusterIngress.

  <a name="IngressSpec"></a>

  *IngressSpec describes the Ingress the user wishes to exist.*

  - **spec.defaultBackend** (IngressBackend)

    defaultBackend is the backend that should handle requests that don't match any rule. If Rules are not specified, DefaultBackend must be specified. If DefaultBackend is not set, the handling of requests that do not match any of the rules will be up to the Ingress controller.

    <a name="IngressBackend"></a>

    *IngressBackend describes all endpoints for a given service and port.*

    - **spec.defaultBackend.resource** ([TypedLocalObjectReference](../common-definitions/typed-local-object-reference#typedlocalobjectreference))

      resource is an ObjectRef to another Kubernetes resource in the namespace of the Ingress object. If resource is specified, a service.Name and service.Port must not be specified. This is a mutually exclusive setting with "Service".

    - **spec.defaultBackend.service** (IngressServiceBackend)

      service references a service as a backend. This is a mutually exclusive setting with "Resource".

      <a name="IngressServiceBackend"></a>

      *IngressServiceBackend references a Kubernetes Service as a Backend.*

      - **spec.defaultBackend.service.name** (string), required

        name is the referenced service. The service must exist in the same namespace as the Ingress object.

      - **spec.defaultBackend.service.port** (ServiceBackendPort)

        port of the referenced service. A port name or port number is required for a IngressServiceBackend.

        <a name="ServiceBackendPort"></a>

        *ServiceBackendPort is the service port being referenced.*

        - **spec.defaultBackend.service.port.name** (string)

          name is the name of the port on the Service. This is a mutually exclusive setting with "Number".

        - **spec.defaultBackend.service.port.number** (int32)

          number is the numerical port number (e.g. 80) on the Service. This is a mutually exclusive setting with "Name".

  - **spec.ingressClassName** (string)

    ingressClassName is the name of an IngressClass cluster resource. Ingress controller implementations use this field to know whether they should be serving this Ingress resource, by a transitive connection (controller -&gt; IngressClass -&gt; Ingress resource). Although the `kubernetes.io/ingress.class` annotation (simple constant name) was never formally defined, it was widely supported by Ingress controllers to create a direct binding between Ingress controller and Ingress resources. Newly created Ingress resources should prefer using the field. However, even though the annotation is officially deprecated, for backwards compatibility reasons, ingress controllers should still honor that annotation if present.

  - **spec.rules** ([]IngressRule)

    *Atomic: will be replaced during a merge*
    
    rules is a list of host rules used to configure the Ingress. If unspecified, or no rule matches, all traffic is sent to the default backend.

    <a name="IngressRule"></a>

    *IngressRule represents the rules mapping the paths under a specified host to the related backend services. Incoming requests are first evaluated for a host match, then routed to the backend associated with the matching IngressRuleValue.*

    - **spec.rules.host** (string)

      host is the fully qualified domain name of a network host, as defined by RFC 3986. Note the following deviations from the "host" part of the URI as defined in RFC 3986: 1. IPs are not allowed. Currently an IngressRuleValue can only apply to
         the IP in the Spec of the parent Ingress.
      2. The `:` delimiter is not respected because ports are not allowed.
      	  Currently the port of an Ingress is implicitly :80 for http and
      	  :443 for https.
      Both these may change in the future. Incoming requests are matched against the host before the IngressRuleValue. If the host is unspecified, the Ingress routes all traffic based on the specified IngressRuleValue.
      
      host can be "precise" which is a domain name without the terminating dot of a network host (e.g. "foo.bar.com") or "wildcard", which is a domain name prefixed with a single wildcard label (e.g. "*.foo.com"). The wildcard character '*' must appear by itself as the first DNS label and matches only a single label. You cannot have a wildcard label by itself (e.g. Host == "*"). Requests will be matched against the Host field in the following way: 1. If host is precise, the request matches this rule if the http host header is equal to Host. 2. If host is a wildcard, then the request matches this rule if the http host header is to equal to the suffix (removing the first label) of the wildcard rule.

    - **spec.rules.http** (HTTPIngressRuleValue)

      <a name="HTTPIngressRuleValue"></a>

      *HTTPIngressRuleValue is a list of http selectors pointing to backends. In the example: http://&lt;host&gt;/&lt;path&gt;?&lt;searchpart&gt; -&gt; backend where where parts of the url correspond to RFC 3986, this resource will be used to match against everything after the last '/' and before the first '?' or '#'.*

      - **spec.rules.http.paths** ([]HTTPIngressPath), required

        *Atomic: will be replaced during a merge*
        
        paths is a collection of paths that map requests to backends.

        <a name="HTTPIngressPath"></a>

        *HTTPIngressPath associates a path with a backend. Incoming urls matching the path are forwarded to the backend.*

        - **spec.rules.http.paths.backend** (IngressBackend), required

          backend defines the referenced service endpoint to which the traffic will be forwarded to.

          <a name="IngressBackend"></a>

          *IngressBackend describes all endpoints for a given service and port.*

          - **spec.rules.http.paths.backend.resource** ([TypedLocalObjectReference](../common-definitions/typed-local-object-reference#typedlocalobjectreference))

            resource is an ObjectRef to another Kubernetes resource in the namespace of the Ingress object. If resource is specified, a service.Name and service.Port must not be specified. This is a mutually exclusive setting with "Service".

          - **spec.rules.http.paths.backend.service** (IngressServiceBackend)

            service references a service as a backend. This is a mutually exclusive setting with "Resource".

            <a name="IngressServiceBackend"></a>

            *IngressServiceBackend references a Kubernetes Service as a Backend.*

            - **spec.rules.http.paths.backend.service.name** (string), required

              name is the referenced service. The service must exist in the same namespace as the Ingress object.

            - **spec.rules.http.paths.backend.service.port** (ServiceBackendPort)

              port of the referenced service. A port name or port number is required for a IngressServiceBackend.

              <a name="ServiceBackendPort"></a>

              *ServiceBackendPort is the service port being referenced.*

              - **spec.rules.http.paths.backend.service.port.name** (string)

                name is the name of the port on the Service. This is a mutually exclusive setting with "Number".

              - **spec.rules.http.paths.backend.service.port.number** (int32)

                number is the numerical port number (e.g. 80) on the Service. This is a mutually exclusive setting with "Name".

        - **spec.rules.http.paths.pathType** (string), required

          pathType determines the interpretation of the path matching. PathType can be one of the following values: * Exact: Matches the URL path exactly. * Prefix: Matches based on a URL path prefix split by '/'. Matching is
            done on a path element by element basis. A path element refers is the
            list of labels in the path split by the '/' separator. A request is a
            match for path p if every p is an element-wise prefix of p of the
            request path. Note that if the last element of the path is a substring
            of the last element in request path, it is not a match (e.g. /foo/bar
            matches /foo/bar/baz, but does not match /foo/barbaz).
          * ImplementationSpecific: Interpretation of the Path matching is up to
            the IngressClass. Implementations can treat this as a separate PathType
            or treat it identically to Prefix or Exact path types.
          Implementations are required to support all path types.
          
          Possible enum values:
           - `"Exact"` matches the URL path exactly and with case sensitivity.
           - `"ImplementationSpecific"` matching is up to the IngressClass. Implementations can treat this as a separate PathType or treat it identically to Prefix or Exact path types.
           - `"Prefix"` matches based on a URL path prefix split by '/'. Matching is case sensitive and done on a path element by element basis. A path element refers to the list of labels in the path split by the '/' separator. A request is a match for path p if every p is an element-wise prefix of p of the request path. Note that if the last element of the path is a substring of the last element in request path, it is not a match (e.g. /foo/bar matches /foo/bar/baz, but does not match /foo/barbaz). If multiple matching paths exist in an Ingress spec, the longest matching path is given priority. Examples: - /foo/bar does not match requests to /foo/barbaz - /foo/bar matches request to /foo/bar and /foo/bar/baz - /foo and /foo/ both match requests to /foo and /foo/. If both paths are present in an Ingress spec, the longest matching path (/foo/) is given priority.

        - **spec.rules.http.paths.path** (string)

          path is matched against the path of an incoming request. Currently it can contain characters disallowed from the conventional "path" part of a URL as defined by RFC 3986. Paths must begin with a '/' and must be present when using PathType with value "Exact" or "Prefix".

  - **spec.tls** ([]IngressTLS)

    *Atomic: will be replaced during a merge*
    
    tls represents the TLS configuration. Currently the Ingress only supports a single TLS port, 443. If multiple members of this list specify different hosts, they will be multiplexed on the same port according to the hostname specified through the SNI TLS extension, if the ingress controller fulfilling the ingress supports SNI.

    <a name="IngressTLS"></a>

    *IngressTLS describes the transport layer security associated with an ingress.*

    - **spec.tls.hosts** ([]string)

      *Atomic: will be replaced during a merge*
      
      hosts is a list of hosts included in the TLS certificate. The values in this list must match the name/s used in the tlsSecret. Defaults to the wildcard host setting for the loadbalancer controller fulfilling this Ingress, if left unspecified.

    - **spec.tls.secretName** (string)

      secretName is the name of the secret used to terminate TLS traffic on port 443. Field is left optional to allow TLS routing based on SNI hostname alone. If the SNI host in a listener conflicts with the "Host" header field used by an IngressRule, the SNI host is used for termination and value of the "Host" header is used for routing.

- **status** (IngressStatus)

  Status is the current state of the MultiClusterIngress.

  <a name="IngressStatus"></a>

  *IngressStatus describe the current state of the Ingress.*

  - **status.loadBalancer** (IngressLoadBalancerStatus)

    loadBalancer contains the current status of the load-balancer.

    <a name="IngressLoadBalancerStatus"></a>

    *IngressLoadBalancerStatus represents the status of a load-balancer.*

    - **status.loadBalancer.ingress** ([]IngressLoadBalancerIngress)

      ingress is a list containing ingress points for the load-balancer.

      <a name="IngressLoadBalancerIngress"></a>

      *IngressLoadBalancerIngress represents the status of a load-balancer ingress point.*

      - **status.loadBalancer.ingress.hostname** (string)

        hostname is set for load-balancer ingress points that are DNS based.

      - **status.loadBalancer.ingress.ip** (string)

        ip is set for load-balancer ingress points that are IP based.

      - **status.loadBalancer.ingress.ports** ([]IngressPortStatus)

        *Atomic: will be replaced during a merge*
        
        ports provides information about the ports exposed by this LoadBalancer.

        <a name="IngressPortStatus"></a>

        *IngressPortStatus represents the error condition of a service port*

        - **status.loadBalancer.ingress.ports.port** (int32), required

          port is the port number of the ingress port.

        - **status.loadBalancer.ingress.ports.protocol** (string), required

          protocol is the protocol of the ingress port. The supported values are: "TCP", "UDP", "SCTP"
          
          Possible enum values:
           - `"SCTP"` is the SCTP protocol.
           - `"TCP"` is the TCP protocol.
           - `"UDP"` is the UDP protocol.

        - **status.loadBalancer.ingress.ports.error** (string)

          error is to record the problem with the service port The format of the error shall comply with the following rules: - built-in error values shall be specified in this file and those shall use
            CamelCase names
          - cloud provider specific error values must have names that comply with the
            format foo.example.com/CamelCase.

## MultiClusterIngressList 

MultiClusterIngressList is a collection of MultiClusterIngress.

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterIngressList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)), required

  Items is the list of MultiClusterIngress.

## Operations 

<hr/>

### `get` read the specified MultiClusterIngress

#### HTTP Request

`GET /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterIngress

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

### `get` read status of the specified MultiClusterIngress

#### HTTP Request

`GET /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses/{name}/status`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterIngress

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

### `list` list or watch objects of kind MultiClusterIngress

#### HTTP Request

`GET /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses`

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

200 ([MultiClusterIngressList](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringresslist)): OK

### `list` list or watch objects of kind MultiClusterIngress

#### HTTP Request

`GET /apis/networking.karmada.io/v1alpha1/multiclusteringresses`

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

200 ([MultiClusterIngressList](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringresslist)): OK

### `create` create a MultiClusterIngress

#### HTTP Request

`POST /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses`

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

202 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Accepted

### `update` replace the specified MultiClusterIngress

#### HTTP Request

`PUT /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterIngress

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `update` replace status of the specified MultiClusterIngress

#### HTTP Request

`PUT /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses/{name}/status`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterIngress

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `patch` partially update the specified MultiClusterIngress

#### HTTP Request

`PATCH /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterIngress

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

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `patch` partially update status of the specified MultiClusterIngress

#### HTTP Request

`PATCH /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses/{name}/status`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterIngress

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

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `delete` delete a MultiClusterIngress

#### HTTP Request

`DELETE /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the MultiClusterIngress

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

### `deletecollection` delete collection of MultiClusterIngress

#### HTTP Request

`DELETE /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusteringresses`

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

