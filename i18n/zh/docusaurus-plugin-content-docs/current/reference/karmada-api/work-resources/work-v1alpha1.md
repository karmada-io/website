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

Work 罗列待部署到成员集群的资源。

<hr/>

- **apiVersion**: work.karmada.io/v1alpha1

- **kind**: Work

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([WorkSpec](../work-resources/work-v1alpha1#workspec))，必选

  Spec 表示 Work 的规范。

- **status** ([WorkStatus](../work-resources/work-v1alpha1#workstatus))

  Status 表示 PropagationStatus 的状态。

## WorkSpec

WorkSpec 定义 Work 的预期状态。

<hr/>

- **workload** (WorkloadTemplate)

  Workload 表示待部署在被管理集群上的 manifest 工作负载。

  <a name="WorkloadTemplate"></a>

  *WorkloadTemplate 表示待部署在被管理集群上的 manifest 工作负载。*

  - **workload.manifests** ([]Manifest)

    Manifests 表示待部署在被管理集群上的 Kubernetes 资源列表。

    <a name="Manifest"></a>

    *Manifest 表示待部署在被管理集群上的某种资源。*

## WorkStatus

WorkStatus 定义 Work 的状态。

<hr/>

- **conditions** ([]Condition)

  Conditions 是同一个 Work 的不同状况。取值可能为：1. Applied：工作负载在被管理集群上成功应用。2. Progressing：Work 中的工作负载正在被应用到被管理集群上。3. Available：别管理集群中存在 Work 中的工作负载。4. Degraded：工作负载的当前状态在一定时期内与所需状态不匹配。

  <a name="Condition"></a>

  *Condition 包含此 API 资源当前状态某个方面的详细信息。*

  - **conditions.lastTransitionTime** (Time)，必选

    lastTransitionTime 是状况最近一次从一种状态转换到另一种状态的时间。这种变化通常出现在下层状况发生变化的时候。如果无法了解下层状况变化，使用 API 字段更改的时间也是可以接受的。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **conditions.message**（string），必选

    message 是有关转换的详细信息（人类可读消息）。可以是空字符串。

  - **conditions.reason**（string），必选

    reason 是一个程序标识符，表明状况最后一次转换的原因。特定状况类型的生产者可以定义该字段的预期值和含义，以及这些值是否可被视为有保证的 API。取值应该是一个 CamelCase 字符串。此字段不能为空。

  - **conditions.status**（string），必选

    Status 表示状况的状态。取值为 True、False 或 Unknown。

  - **conditions.type**（string），必选

    **type**表示 CamelCase 或 foo.example.com/CamelCase 形式的状况类型。

  - **conditions.observedGeneration**（int64）

    **observedGeneration**表示设置状况时所基于的 .metadata.generation。例如，如果 .metadata.generation 为 12，但 .status.conditions[x].observedGeneration 为 9，则状况相对于实例的当前状态已过期。

- **manifestStatuses** ([]ManifestStatus)

  ManifestStatuses 是 spec 中 manifest 的运行状态。

  <a name="ManifestStatus"></a>

  *ManifestStatus 包含 spec 中特定 manifest 的运行状态。*

  - **manifestStatuses.identifier** (ResourceIdentifier)，必选

    **identifier**表示 spec 中链接到清单的资源的标识。

    <a name="ResourceIdentifier"></a>

    *ResourceIdentifier 提供与任意资源交互所需的标识符。*

    - **manifestStatuses.identifier.kind**（string），必选

      Kind 表示资源的类别。

    - **manifestStatuses.identifier.name**（string），必选

      Name 表示资源名称。

    - **manifestStatuses.identifier.ordinal**（int32），必选

      Ordinal 是 manifests 中的索引。即使某个 manifest 无法解析，状况仍然可以链接到该 manifest。

    - **manifestStatuses.identifier.resource**（string），必选

      Resource 表示资源类型。

    - **manifestStatuses.identifier.version**（string），必选

      Version 表示资源版本。

    - **manifestStatuses.identifier.group**（string），必选

      Group 表示资源所在的组。

    - **manifestStatuses.identifier.namespace**（string）

      Namespace 是资源的命名空间。如果值为空，则表示资源在集群范围内。

  - **manifestStatuses.health**（string）

    Health 表示资源的健康状态。可以设置不同规则来保障不同资源的健康状态。

  - **manifestStatuses.status** (RawExtension)

    Status 反映当前 manifest 的运行状态。

    <a name="RawExtension"></a>

    *RawExtension 用于在外部版本中保存扩展数据。

    要使用此字段，请生成一个字段，在外部、版本化结构中以 RawExtension 作为其类型，在内部结构中以 Object 作为其类型。此外，还需要注册各个插件类型。

    //内部包：

    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.Object `json:"myPlugin"`
    	]

    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]

    //外部包：

    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.RawExtension `json:"myPlugin"`
    	]

    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]

    //在网络上，JSON 看起来像这样：

    	[
    		"kind":"MyAPIObject",
    		"apiVersion":"v1",
    		"myPlugin": [
    			"kind":"PluginA",
    			"aOption":"foo",
    		],
    	]

    那么会发生什么？解码首先需要使用 JSON 或 YAML 将序列化数据解组到外部 MyAPIObject 中。这会导致原始 JSON 被存储下来，但不会被解包。下一步是复制（使用 pkg/conversion）到内部结构中。runtime 包的 DefaultScheme 安装了转换函数，它将解析存储在 RawExtension 中的 JSON，将其转换为正确的对象类型，并将其存储在对象中。（TODO：如果对象是未知类型，将创建并存储一个 runtime.Unknown 对象。）*

## WorkList

WorkList 是 Work 的集合。

<hr/>

- **apiVersion**: work.karmada.io/v1alpha1

- **kind**: WorkList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][Work](../work-resources/work-v1alpha1#work))，必选

  Items 中包含 Work 列表。

## 操作

<hr/>

### `get`：查询指定的 Work

#### HTTP 请求

`GET /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  Work 名称。

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Work](../work-resources/work-v1alpha1#work)): OK

### `get`：查询指定 Work 的状态

#### HTTP 请求

`GET /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  Work 名称。

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Work](../work-resources/work-v1alpha1#work)): OK

### `list`：查询指定命名空间内的所有 Work

#### HTTP 请求

`GET /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works`

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

200 ([WorkList](../work-resources/work-v1alpha1#worklist)): OK

### `list`：查询所有 Work

#### HTTP 请求

GET /apis/work.karmada.io/v1alpha1/works

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

200 ([WorkList](../work-resources/work-v1alpha1#worklist)): OK

### `create`：创建一个 Work

#### HTTP 请求

`POST /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works`

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Work](../work-resources/work-v1alpha1#work)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

202 ([Work](../work-resources/work-v1alpha1#work)): Accepted

### `update`：更新指定的 Work

#### HTTP 请求

`PUT /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  Work 名称。

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Work](../work-resources/work-v1alpha1#work)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `update`：更新指定 Work 的状态

#### HTTP 请求

`PUT /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  Work 名称。

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Work](../work-resources/work-v1alpha1#work)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `patch`：更新指定 Work 的部分信息

#### HTTP 请求

`PATCH /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  Work 名称。

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

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `patch`：更新指定 Work 状态的部分信息

#### HTTP 请求

`PATCH /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  Work 名称。

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

200 ([Work](../work-resources/work-v1alpha1#work)): OK

201 ([Work](../work-resources/work-v1alpha1#work)): Created

### `delete`：删除一个 Work

#### HTTP 请求

`DELETE /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  Work 名称。

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

### `deletecollection`：删除 Work 的集合

#### HTTP 请求

`DELETE /apis/work.karmada.io/v1alpha1/namespaces/{namespace}/works`

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
