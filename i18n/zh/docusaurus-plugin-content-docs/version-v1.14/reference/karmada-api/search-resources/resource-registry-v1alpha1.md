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

ResourceRegistry 表示缓存范围的配置，主要描述在哪些集群缓存资源。

<hr/>

- **apiVersion**: search.karmada.io/v1alpha1

- **kind**: ResourceRegistry

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceRegistrySpec](../search-resources/resource-registry-v1alpha1#resourceregistryspec))

  Spec 表示 ResourceRegistry 的规范。

- **status** ([ResourceRegistryStatus](../search-resources/resource-registry-v1alpha1#resourceregistrystatus))

  Status 表示 ResourceRegistry 的状态。

## ResourceRegistrySpec 

ResourceRegistrySpec 定义 ResourceRegistry 的预期状态。

<hr/>

- **resourceSelectors** ([]ResourceSelector)，必选

  ResourceSelectors 指定缓存系统应缓存的资源类型。

  <a name="ResourceSelector"></a>

  *ResourceSelector 指定资源类型及其范围。*

  - **resourceSelectors.apiVersion**（string），必选

    APIVersion 表示目标资源的 API 版本。

  - **resourceSelectors.kind**（string），必选

    Kind 表示目标资源的类别。

  - **resourceSelectors.namespace** (string)

    目标资源的命名空间。默认为空，表示所有命名空间。

- **targetCluster** (ClusterAffinity)，必选

  TargetCluster 指定缓存系统收集资源的集群。

  <a name="ClusterAffinity"></a>

  *ClusterAffinity 是用来选择集群的过滤器。*

  - **targetCluster.clusterNames** ([]string)

    ClusterNames 罗列了待选择的集群。

  - **targetCluster.exclude** ([]string)

    ExcludedClusters 罗列了待忽略的集群。

  - **targetCluster.fieldSelector** (FieldSelector)

    FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

    <a name="FieldSelector"></a>

    *FieldSelector 是一个字段过滤器。*

    - **targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

      字段选择器要求列表。

  - **targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

    LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

- **backendStore** (BackendStoreConfig)

  BackendStore 指定缓存项的存储位置。

  <a name="BackendStoreConfig"></a>

  *BackendStoreConfig 表示后端存储。*

  - **backendStore.openSearch** (OpenSearchConfig)

    OpenSearch 是一款由社区驱动的开源搜索和分析套件。更多详情，请浏览：https://opensearch.org/

    <a name="OpenSearchConfig"></a>

    *OpenSearchConfig 包含了客户端访问 OpenSearch 服务器所需的配置。*

    - **backendStore.openSearch.addresses** ([]string)，必选

      Addresses 罗列了待使用的节点端点（例如，https://localhost:9200）。有关“节点”的概念，请浏览：https://opensearch.org/docs/latest/opensearch/index/#clusters-and-nodes

    - **backendStore.openSearch.secretRef** (LocalSecretReference)

      SecretRef 表示密钥包含访问服务器的强制性凭据。取值包括 secret.data.userName 和 secret.data.password。

      <a name="LocalSecretReference"></a>

      *LocalSecretReference 指封闭命名空间内的密钥引用。*

      - **backendStore.openSearch.secretRef.name** ([]string)，必选

        Name 指被引用资源的名称。

      - **backendStore.openSearch.secretRef.namespace** ([]string)，必选

        Namespace 指所引用资源的命名空间。

## ResourceRegistryStatus 

ResourceRegistryStatus 定义 ResourceRegistry 的预期状态。

<hr/>

- **conditions** ([]Condition)

  Conditions 包含不同的状况。

  <a name="Condition"></a>

  *Condition 包含此 API 资源当前状态某个方面的详细信息。*

  - **conditions.lastTransitionTime** (Time)，必选

    lastTransitionTime 是状况最近一次从一种状态转换到另一种状态的时间。这种变化通常出现在下层状况发生变化的时候。如果无法了解下层状况变化，使用 API 字段更改的时间也是可以接受的。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **conditions.message**（string），必选

    message 是有关转换的详细信息（人类可读消息）。可以是空字符串。

  - **conditions.reason**（string），必选

    reason 是一个程序标识符，表明状况最后一次转换的原因。特定状况类型的生产者可以定义该字段的预期值和含义，以及这些值是否可被视为有保证的 API。取值应该是一个驼峰式（CamelCase）字符串。此字段不能为空。

  - **conditions.status**（string），必选

    status 表示状况的状态。取值为True、False 或 Unknown。

  - **conditions.type**（string），必选

    type 表示状况的类型，采用 CamelCase 或 foo.example.com/CamelCase 形式。

  - **conditions.observedGeneration** (int64)

    observedGeneration 表示设置状况时所基于的 .metadata.generation。例如，如果 .metadata.generation 为 12，但 .status.conditions[x].observedGeneration 为 9，则状况相对于实例的当前状态已过期。

## ResourceRegistryList 

ResourceRegistryList 是 ResourceRegistry 的集合。

<hr/>

- **apiVersion**: search.karmada.io/v1alpha1

- **kind**: ResourceRegistryList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry))，必选

  Items 是 ResourceRegistry 的列表。

## 操作

<hr/>

### `get`：查询指定的 ResourceRegistry

#### HTTP 请求

GET /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceRegistry 名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

### `get`：查询指定 ResourceRegistry 的状态

#### HTTP 请求

GET /apis/search.karmada.io/v1alpha1/resourceregistries/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceRegistry 的名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

### `list`：查询所有 ResourceRegistry

#### HTTP 请求

GET /apis/search.karmada.io/v1alpha1/resourceregistries

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

200 ([ResourceRegistryList](../search-resources/resource-registry-v1alpha1#resourceregistrylist)): OK

### `create`：创建一个 ResourceRegistry

#### HTTP 请求

POST /apis/search.karmada.io/v1alpha1/resourceregistries

#### 参数

- **body**: [ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

202 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Accepted

### `update`：更新指定的 ResourceRegistry

#### HTTP 请求

PUT /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceRegistry 的名称

- **body**: [ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `update`：更新指定 ResourceRegistry 的状态

#### HTTP 请求

PUT /apis/search.karmada.io/v1alpha1/resourceregistries/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceRegistry 的名称

- **body**: [ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `patch`：更新指定 ResourceRegistry 的部分信息

#### HTTP 请求

PATCH /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceRegistry 的名称

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

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `patch`：更新指定 ResourceRegistry 状态的部分信息

#### HTTP 请求

PATCH /apis/search.karmada.io/v1alpha1/resourceregistries/{name}/status

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceRegistry 的名称

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

200 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): OK

201 ([ResourceRegistry](../search-resources/resource-registry-v1alpha1#resourceregistry)): Created

### `delete`：删除一个 ResourceRegistry

#### HTTP 请求

DELETE /apis/search.karmada.io/v1alpha1/resourceregistries/{name}

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceRegistry 的名称

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

### `deletecollection`：删除所有 ResourceRegistry

#### HTTP 请求

DELETE /apis/search.karmada.io/v1alpha1/resourceregistries

#### 参数

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
