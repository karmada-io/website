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

MultiClusterService 是多集群软件服务的命名抽象。MultiClusterService 的 name 字段与 Service 的 name 字段相同。不同集群中同名的服务将被视为同一服务，会被关联到同一 MultiClusterService。MultiClusterService 可以控制服务向多集群外部暴露，还可以在集群之间启用服务发现。

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterService

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([MultiClusterServiceSpec](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservicespec))，必选

  Spec 是 MultiClusterService 的期望状态。

- **status** (ServiceStatus)

  Status 是 MultiClusterService 的当前状态。

  <a name="ServiceStatus"></a>

  *ServiceStatus 表示服务的当前状态。*

  - **status.conditions** ([]Condition)

    *补丁策略：以键的**`类型`**为基础进行合并。*
    
    *Map: 键类型的唯一值将在合并期间保留*
    
    服务的当前状态。

    <a name="Condition"></a>

    *Condition 包含此 API 资源当前状态某个方面的详细信息。*

    - **status.conditions.lastTransitionTime** (Time)，必选

      lastTransitionTime 是状况最近一次从一种状态转换到另一种状态的时间。这种变化通常出现在下层状况发生变化的时候。如果无法了解下层状况变化，使用 API 字段更改的时间也是可以接受的。

      <a name="Time"></a>

      *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

    - **status.conditions.message** (string)，必选

      message 是有关转换的详细信息（人类可读消息）。可以是空字符串。

    - **status.conditions.reason** (string)，必选

      reason 是一个程序标识符，表明状况最后一次转换的原因。特定状况类型的生产者可以定义该字段的预期值和含义，以及这些值是否可被视为有保证的 API。取值应该是一个 CamelCase 字符串。此字段不能为空。

    - **status.conditions.status** (string)，必选

      status 表示状况的状态。取值为True、False或Unknown。

    - **status.conditions.type** (string)，必选

      type 表示状况的类型，采用 CamelCase 或 foo.example.com/CamelCase 形式。

    - **status.conditions.observedGeneration** (int64)

      observedGeneration 表示设置状况时所基于的 .metadata.generation。例如，如果 .metadata.generation 为 12，但 .status.conditions[x].observedGeneration 为 9，则状况相对于实例的当前状态已过期。

  - **status.loadBalancer** (LoadBalancerStatus)

    loadBalancer 包含负载均衡器的当前状态（如果存在）。

    <a name="LoadBalancerStatus"></a>

    *LoadBalancerStatus 表示负载均衡器的状态。*

    - **status.loadBalancer.ingress** ([]LoadBalancerIngress)

      ingress 是一个包含负载均衡器入口点的列表。服务的流量需要被发送到这些入口点。

      <a name="LoadBalancerIngress"></a>

      *LoadBalancerIngress 表示负载均衡器入口点的状态，用于服务的流量是否被发送到入口点。*

      - **status.loadBalancer.ingress.hostname** (string)

        Hostname 为基于 DNS 的负载均衡器入口点（通常是 AWS 负载均衡器）所设置。

      - **status.loadBalancer.ingress.ip** (string)

        IP 为基于 IP 的负载均衡器入口点（通常是 GCE 或 OpenStack 负载均衡器）所设置。

      - **status.loadBalancer.ingress.ports** ([]PortStatus)

        *Atomic：将在合并期间被替换*
        
        Ports 是服务的端口列表。如果设置了此字段，服务中定义的每个端口都应该在此列表中。

        <a name="PortStatus"></a>

        **

        - **status.loadBalancer.ingress.ports.port** (int32)，必选

          Port 是所记录的服务端口状态的端口号。

        - **status.loadBalancer.ingress.ports.protocol** (string)，必选

          Protocol 是所记录的服务端口状态的协议。取值包括：TCP、UDP 和 SCTP。
          
          枚举值包括：
           - `"SCTP"`：SCTP协议。
           - `"TCP"`：TCP协议。
           - `"UDP"`：UDP协议。

        - **status.loadBalancer.ingress.ports.error** (string)

          error 用来记录服务端口的问题。错误的格式应符合以下规则：
          
          - 应在此文件中指定内置错误码，并且错误码应使用驼峰法命名。
             
          - 特定于云驱动的错误码名称必须符合 foo.example.com/CamelCase 格式。
             

## MultiClusterServiceSpec 

MultiClusterServiceSpec 是 MultiClusterService 的期望状态。

<hr/>

- **types** ([]string)，必选

  Types 指定公开此 MultiClusterService 的服务引用的方式。

- **ports** ([]ExposurePort)

  Ports 罗列了此 MultiClusterService 公开的端口。在服务暴露和发现过程中，不会过滤指定的端口。默认情况下，引用服务中的所有端口都将公开。

  <a name="ExposurePort"></a>

  *ExposurePort 描述了将暴露的端口。*

  - **ports.port** (int32)，必选

    Port 表示暴露的服务端口。

  - **ports.name** (string)

    Name 是需要在服务中公开的端口的名称。端口名称必须与服务中定义的端口名称一致。

- **range** (ExposureRange)

  Range 指定引用服务应公开的范围。仅在 Types 包含 CrossCluster 的情况下有效和可选。如果未设置且 Types 包含 CrossCluster，将选择所有群集，这意味着引用服务将在所有注册的集群上公开。

  <a name="ExposureRange"></a>

  *ExposureRange 罗列了暴露服务的集群。当前支持按名称选择集群，为扩展更多方法留出空间，如使用标签选择器。*

  - **range.clusterNames** ([]string)

    ClusterNames 罗列了待选择的集群。

## MultiClusterServiceList 

MultiClusterServiceList 是 MultiClusterService 的集合。

<hr/>

- **apiVersion**: networking.karmada.io/v1alpha1

- **kind**: MultiClusterServiceList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice))，必选

  Items 是 MultiClusterService 的列表。

## 操作

<hr/>

### `get`：查询指定的 MultiClusterService

#### HTTP 请求

`GET /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterService 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

### `get`：查询指定 MultiClusterService 的状态

#### HTTP 请求

`GET /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterService 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

### `list`：查询指定命名空间内的所有 MultiClusterService

#### HTTP 请求

`GET /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices`

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

200 ([MultiClusterServiceList](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservicelist)): OK

### `list`：查询所有 MultiClusterService

#### HTTP 请求

GET /apis/networking.karmada.io/v1alpha1/multiclusterservices

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

200 ([MultiClusterServiceList](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservicelist)): OK

### `create`：创建一个 MultiClusterService

#### HTTP 请求

`POST /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices`

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

202 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Accepted

### `update`：更新指定的 MultiClusterService

#### HTTP 请求

`PUT /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterService 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `update`：更新指定 MultiClusterService 的状态

#### HTTP 请求

`PUT /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterService 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `patch`：更新指定 MultiClusterService 的部分信息

#### HTTP 请求

`PATCH /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterService 的名称

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

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `patch`：更新指定 MultiClusterService 状态的部分信息

#### HTTP 请求

`PATCH /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterService 的名称

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

200 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): OK

201 ([MultiClusterService](../networking-resources/multi-cluster-service-v1alpha1#multiclusterservice)): Created

### `delete`：删除一个 MultiClusterService

#### HTTP 请求

`DELETE /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  MultiClusterService 的名称

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

### `deletecollection`：删除所有 MultiClusterService

#### HTTP 请求

`DELETE /apis/networking.karmada.io/v1alpha1/namespaces/{namespace}/multiclusterservices`

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

#### Response

200 ([Status](../common-definitions/status#status)): OK
