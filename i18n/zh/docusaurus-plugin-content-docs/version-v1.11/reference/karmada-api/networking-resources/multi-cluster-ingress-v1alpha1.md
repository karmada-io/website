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

MultiClusterIngress 是允许入站连接到达后端定义的端点的规则集合。MultiClusterIngress 的结构 与 Ingress 相同，表示多集群中的 Ingress。

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterIngress

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** (IngressSpec)

  Spec 是 MultiClusterIngress 的期望状态。

  <a name="IngressSpec"></a>

  *IngressSpec 描述用户希望存在的 Ingress。*

  - **spec.defaultBackend** (IngressBackend)

    defaultBackend 是负责处理与任何规则都不匹配的请求的后端。如果未指定 Rules，则必须指定 DefaultBackend。如果未设置 DefaultBackend，则与任何规则都不匹配的请求的处理将由 Ingress 控制器决定。

    <a name="IngressBackend"></a>

    *IngressBackend 描述给定服务和端口的所有端点。*

    - **spec.defaultBackend.resource** ([TypedLocalObjectReference](../common-definitions/typed-local-object-reference#typedlocalobjectreference))

      Resource 是一个 ObjectRef 对象，指向同一命名空间内的另一个 Kubernetes 资源，将其视为 Ingress 对象。如果指定了 Resource，则不能指定 service.Name 和 service.Port。Resource 与 Service 互斥。

    - **spec.defaultBackend.service** (IngressServiceBackend)

      Service 引用一个服务作为后端，与 Resource 互斥。

      <a name="IngressServiceBackend"></a>

      *IngressServiceBackend 引用一个 Kubernetes Service 作为后端。*

      - **spec.defaultBackend.service.name** (string)，必选

        Name 是引用的服务。该服务必须与 Ingress 对象在同一命名空间。

      - **spec.defaultBackend.service.port** (ServiceBackendPort)

        所引用的服务的端口。IngressServiceBackend 需要端口名或端口号。

        <a name="ServiceBackendPort"></a>

        *ServiceBackendPort 是被引用的服务端口。*

        - **spec.defaultBackend.service.port.name** (string)

          Name 是服务上的端口名称，与 Number 互斥。

        - **spec.defaultBackend.service.port.number** (int32)

          Number 是服务上的数字形式端口号（例如 80），与 Name 互斥。

  - **spec.ingressClassName** (string)

    ingressClassName 是 IngressClass 集群资源的名称。Ingress 控制器实现使用此字段来了解它们是否应该通过传递连接（控制器 - IngressClass -> Ingress 资源）为该 Ingress 资源提供服务。尽管 `kubernetes.io/ingress.class` 注解（简单的常量名称）从未正式定义，但它被 Ingress 控制器广泛支持，以在 Ingress 控制器和 Ingress 资源之间创建直接绑定。新创建的 Ingress 资源应该优先选择使用该字段。但是，即使注解已被正式弃用，出于向后兼容的原因，Ingress 控制器仍应能够处理该注解（如果存在）。

  - **spec.rules** ([]IngressRule)

    *Atomic：将在合并期间被替换*

    rules 是用于配置 Ingress 的主机规则列表。如果未指定或没有规则匹配，则所有流量都将发送到默认后端。

    <a name="IngressRule"></a>

    *IngressRule 表示将指定主机下的路径映射到相关后端服务的规则。传入请求首先评估主机匹配，然后路由到与匹配的 IngressRuleValue 关联的后端。*

    - **spec.rules.host** (string)

      host 是 RFC 3986 定义的网络主机的完全限定域名。请注意以下与 RFC 3986 中定义的 URI 的 host 部分的偏差：

      - 不允许 IP。当前 IngressRuleValue 只能应用于父 Ingress Spec 中的 IP。

      - 由于不允许使用端口，因此 `:` 分隔符会被忽略。当前 Ingress 的端口隐式为： :80 用于 http 和 :443 用于 https

      这两种情况在未来都可能发生变化。入站请求在通过 IngressRuleValue 处理之前会先进行主机匹配。如果主机未指定，Ingress 将根据指定的 IngressRuleValue 规则路由所有流量。

      主机可以是“精确”的，设置为一个不含终止句点的网络主机域名（例如， *foo.bar.com* ），也可以是一个“通配符”，设置为以单个通配符标签为前缀的域名（例如， *.foo.com* ）。通配符 “*” 必须单独显示为第一个 DNS 标签，并且仅与单个标签匹配。不能单独使用通配符作为标签（例如，Host == "*"）。请求将按以下方式与主机字段匹配：- 如果主机是精确匹配的，在 http host 头等于 Host 值的情况下，请求与此规则匹配。- 如果主机是用通配符给出的，在 http host 头与通配符规则的后缀（删除第一个标签）相同的情况下，请求与此规则匹配。

    - **spec.rules.http** (HTTPIngressRuleValue)

      <a name="HTTPIngressRuleValue"></a>

      *HTTPIngressRuleValue 是指向后端的 http 选择算符列表。例如 http://&lt;host&gt;/&lt;path&gt;?&lt;searchpart&gt; -&gt; 后端，其中 url 的部分对应 RFC 3986，此资源将用于匹配最后一个 “/” 之后和第一个 “?” 之前的所有内容或 “#”。*

      - **spec.rules.http.paths** ([]HTTPIngressPath)，必选

        *Atomic：将在合并期间被替换*

        paths 是一个将请求映射到后端的路径集合。

        <a name="HTTPIngressPath"></a>

        *HTTPIngressPath 将路径与后端关联。与路径匹配的传入 URL 将转发到后端。*

        - **spec.rules.http.paths.backend** (IngressBackend)，必选

          backend 定义将流量转发到的引用服务端点。

          <a name="IngressBackend"></a>

          *IngressBackend 描述给定服务和端口的所有端点。*

          - **spec.rules.http.paths.backend.resource** ([TypedLocalObjectReference](../common-definitions/typed-local-object-reference#typedlocalobjectreference))

            resource 是一个 ObjectRef 对象，指向同一命名空间内的另一个 Kubernetes 资源，将其视为 Ingress 对象。如果指定了 resource，则不能指定 service.Name 和 service.Port。resource 与 Service 互斥。

          - **spec.rules.http.paths.backend.service** (IngressServiceBackend)

            service 引用一个服务作为后端，与 Resource互斥。

            <a name="IngressServiceBackend"></a>

            *IngressServiceBackend 引用一个 Kubernetes Service 作为后端。*

            - **spec.rules.http.paths.backend.service.name** (string)，必选

              name 是引用的服务。该服务必须与 Ingress 对象在同一命名空间。

            - **spec.rules.http.paths.backend.service.port** (ServiceBackendPort)

              所引用的服务的端口。IngressServiceBackend 需要端口名或端口号。

              <a name="ServiceBackendPort"></a>

              *ServiceBackendPort 是被引用的服务端口。*

              - **spec.rules.http.paths.backend.service.port.name** (string)

                name 是服务上的端口名称，与 Number 互斥。

              - **spec.rules.http.paths.backend.service.port.number** (int32)

                number 是服务上的数字形式端口号（例如 80），与 Name 互斥。

        - **spec.rules.http.paths.pathType** (string)，必选

          pathType 决定如何解释路径匹配。取值包括： * Exact：与 URL 路径完全匹配。* Prefix：根据按 “/” 拆分的 URL 路径前缀进行匹配。匹配是按路径元素逐个元素完成。
          路径元素引用的是路径中由“/”分隔符拆分的标签列表。如果每个 p 都是请求路径 p 的元素前缀，则请求与路径 p 匹配。请注意，如果路径的最后一个元素是请求路径中的最后一个元素的子字符串，则匹配不成功（例如，/foo/bar 匹配 /foo/bar/baz，但不匹配 /foo/barbaz）。

          * ImplementationSpecific：路径匹配的解释取决于 IngressClass。
             实现可以将其视为单独的路径类型，也可以将其视为前缀或确切的路径类型。
             
          实现需要支持所有路径类型。
          
          枚举值包括：
           - `"Exact"`：与URL路径完全匹配，并区分大小写。
           - `"ImplementationSpecific"`：匹配取决于 IngressClass。 实现可以将其视为单独的路径类型，也可以将其视为前缀或确切的路径类型。
           - `"Prefix"`：根据按 “/” 拆分的 URL 路径前缀进行匹配。匹配区分大小写，是按路径元素逐个元素完成。路径元素引用的是路径中由“/”分隔符拆分的标签列表。如果每个 p 都是请求路径 p 的元素前缀，则请求与路径 p 匹配。请注意，如果路径的最后一个元素是请求路径中的最后一个元素的子字符串，则匹配不成功（例如，/foo/bar 匹配 /foo/bar/baz，但不匹配 /foo/barbaz）。如果 Ingress 规范中存在多个匹配路径，则匹配路径最长者优先。例如， - /foo/bar 不匹配 /foo/barbaz - /foo/bar 匹配 /foo/bar和/foo/bar/baz - /foo和/foo/均匹配 /foo 和 /foo/。如果仍然有两条同等的匹配路径，则匹配路径最长者（例如，/foo/）优先。

        - **spec.rules.http.paths.path** (string)

          path 要与传入请求的路径进行匹配。目前，它可以包含 RFC 3986 定义的 URL 的常规“路径”部分所不允许的字符。路径必须以 “/” 开头，并且在 pathType 值为 Exact 或 Prefix 时必须存在。

- **spec.tls** ([]IngressTLS)

  *Atomic：将在合并期间被替换*

  tls 表示 TLS 配置。目前，Ingress 仅支持一个 TLS 端口 443。如果此列表的多个成员指定了不同的主机，在实现 Ingress 的 Ingress 控制器支持 SNI的情况下，它们将根据通过 SNI TLS 扩展指定的主机名在同一端口上多路复用。

  <a name="IngressTLS"></a>

  *IngressTLS 描述与 Ingress 相关的传输层安全性。*

    - **spec.tls.hosts** ([]string)

      *Atomic：将在合并期间被替换*

      hosts 是 TLS 证书中包含的主机列表。此列表中的值必须与 tlsSecret 中使用的名称匹配。如果未指定，默认为实现此 Ingress 的负载均衡控制器的通配符主机设置。

    - **spec.tls.secretName** (string)

      secretName 是用于终止端口 443 上 TLS 通信的 secret 的名称。字段是可选的，以允许仅基于 SNI 主机名的 TLS 路由。如果监听器中的 SNI 主机与 IngressRule 使用的 “Host” 头字段冲突，则 SNI 主机用于终止，Host 头的值用于路由。

- **status** (IngressStatus)

  Status 是 MultiClusterIngress 的当前状态。

  <a name="IngressStatus"></a>

  *IngressStatus 描述 Ingress 的当前状态。*

  - **status.loadBalancer** (IngressLoadBalancerStatus)

    loadBalancer 包含负载均衡器的当前状态。

    <a name="IngressLoadBalancerStatus"></a>

    *IngressLoadBalancerStatus 表示负载均衡器的状态。*

    - **status.loadBalancer.ingress** ([]IngressLoadBalancerIngress)

      ingress 是一个包含负载均衡器入口点的列表。

      <a name="IngressLoadBalancerIngress"></a>

      *IngressLoadBalancerIngress 表示负载均衡器入口点的状态。*

      - **status.loadBalancer.ingress.hostname** (string)

        hostname 是为基于 DNS 的负载均衡器入口点所设置的主机名。

      - **status.loadBalancer.ingress.ip** (string)

        ip 是为基于 IP 的负载均衡器入口点设置的 IP。

      - **status.loadBalancer.ingress.ports** ([]IngressPortStatus)

        *Atomic：将在合并期间被替换*

        ports 提供有关此 LoadBalancer 公开端口的信息。

        <a name="IngressPortStatus"></a>

        *IngressPortStatus 表示服务端口的错误情况。*

        - **status.loadBalancer.ingress.ports.port** (int32)，必选

          port 是入栈端口的端口号。

        - **status.loadBalancer.ingress.ports.protocol** (string)，必选

          protocol 是入栈端口的协议。取值包括：TCP、UDP 和·SCTP。

          枚举值包括：
          - `"SCTP"`：SCTP协议。
          - `"TCP"`：TCP协议。
          - `"UDP"`：UDP协议。

        - **status.loadBalancer.ingress.ports.error** (string)

          error 用来记录服务端口的问题。错误的格式应符合以下规则：

          - 应在此文件中指定内置错误码，并且错误码应使用驼峰法命名。

          - 特定于云提供商的错误码名称必须符合 foo.example.com/CamelCase 格式。

## MultiClusterIngressList

MultiClusterIngressList 是 MultiClusterIngress 的集合。

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterIngressList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress))，必选

  Items 是 MultiClusterIngress 的列表。

## 操作

<hr/>

### `get`：查询指定的 MultiClusterIngress

#### HTTP 请求

GET /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  name of the MultiClusterIngress

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

### `get`：查询指定 MultiClusterIngress 的状态

#### HTTP 请求

GET /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses/`{name}`/status

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterIngress 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

### `list`：查询指定命名空间内的所有 MultiClusterIngress

#### HTTP 请求

GET /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **allowWatchBookmarks**（*查询参数*）：boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([MultiClusterIngressList](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringresslist)): OK

### `list`：查询所有 MultiClusterIngress

#### HTTP 请求

GET /apis/networking.karmada.io/v1alpha1/multiclusteringresses

#### 参数

- **allowWatchBookmarks**（*查询参数*）：boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([MultiClusterIngressList](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringresslist)): OK

### `create`：创建一个 MultiClusterIngress

#### HTTP 请求

POST /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress), required


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

202 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Accepted

### `update`：更新指定的 MultiClusterIngress

#### HTTP 请求

PUT /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterIngress 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `update`：更新指定 MultiClusterIngress 的状态

#### HTTP 请求

PUT /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses/`{name}`/status

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterIngress 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `patch`：更新指定 MultiClusterIngress 的部分信息

#### HTTP 请求

PATCH /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterIngress 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force**（*查询参数*）：boolean

  [force](../common-parameter/common-parameters#force)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `patch`：更新指定 MultiClusterIngress 状态的部分信息

#### HTTP 请求

PATCH /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses/`{name}`/status

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterIngress 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force**（*查询参数*）：boolean

  [force](../common-parameter/common-parameters#force)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): OK

201 ([MultiClusterIngress](../networking-resources/multi-cluster-ingress-v1alpha1#multiclusteringress)): Created

### `delete`：删除一个 MultiClusterIngress

#### HTTP 请求

DELETE /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses/`{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterIngress 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds**（*查询参数*）：integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy**（*查询参数*）：string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection`：删除所有 MultiClusterIngress

#### HTTP 请求

DELETE /apis/networking.karmada.io/v1alpha1/namespaces/`{namespace}`/multiclusteringresses

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)


- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds**（*查询参数*）：integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy**（*查询参数*）：string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status)): OK
