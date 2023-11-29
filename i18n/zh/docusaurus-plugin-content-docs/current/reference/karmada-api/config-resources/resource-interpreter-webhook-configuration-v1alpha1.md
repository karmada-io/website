---
api_metadata:
  apiVersion: "config.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/config/v1alpha1"
  kind: "ResourceInterpreterWebhookConfiguration"
content_type: "api_reference"
description: "ResourceInterpreterWebhookConfiguration describes the configuration of webhooks which take the responsibility to tell karmada the details of the resource object, especially for custom resources."
title: "ResourceInterpreterWebhookConfiguration v1alpha1"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: config.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/config/v1alpha1"`

## ResourceInterpreterWebhookConfiguration 

ResourceInterpreterWebhookConfiguration 描述 webhook 的配置，这些配置负责传递 Karmada 资源对象的详情，特别是自定义资源的详情。

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterWebhookConfiguration

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **webhooks** ([]ResourceInterpreterWebhook)，必选

  Webhooks 罗列 webhook 及其所影响的资源和操作。

  <a name="ResourceInterpreterWebhook"></a>

  *ResourceInterpreterWebhook 描述 webhook 及其适用的资源和操作。*

  - **webhooks.clientConfig** (WebhookClientConfig)，必选

    ClientConfig 定义与钩子通信的方式。

    <a name="WebhookClientConfig"></a>

    *WebhookClientConfig 包含与 webhook 建立 TLS 连接的信息。*

    - **webhooks.clientConfig.caBundle** ([]byte)

      `caBundle` 是一个 PEM 编码的 CA 包，用于验证 webhook 的服务器证书。如果未指定，则使用API服务器上的系统信任根。

    - **webhooks.clientConfig.service** (ServiceReference)

      `service` 是对此 webhook 的服务的引用。必须指定 `service` 或 `url`。
      
      如果 webhook 在集群中运行，应使用 `service` 字段。

      <a name="ServiceReference"></a>

      *ServiceReference 包含对 Service.legacy.k8s.io 的引用。*

      - **webhooks.clientConfig.service.name** (string)，必选

        `name` 是服务的名称。必选。

      - **webhooks.clientConfig.service.namespace** (string)，必选

        `namespace` 是服务的命名空间。必选。

      - **webhooks.clientConfig.service.path** (string)

        `path` 是一个可选的 URL 路径，在发送给服务的所有请求中都会包含此路径。

      - **webhooks.clientConfig.service.port** (int32)

        如果指定，则为托管 webhook 的服务的端口。默认为 443 以实现向后兼容。 `port` 应该是一个有效端口（端口范围 1-65535）。

    - **webhooks.clientConfig.url** (string)

      `url` 以标准 URL 形式（`scheme://host:port/path`）给出了 webhook 的位置。必须指定 `url` 或 `service`。
      
      `host` 不能用来表示集群中运行的服务，应改用 `service` 字段。在某些 API 服务器上，可能会通过外部 DNS 解析 host 值。（例如，`kube-apiserver` 无法解析集群内的域名，因为这会违反分层原理）。`host` 也可以是 IP 地址。
      
      注意：使用 `localhost` 或 `127.0.0.1` 作为 `host` 是有风险的，在运行 API 服务器的所有主机上运行此 webhook 时必须非常小心， 这些 API 服务器可能需要调用此 webhook。此类部署可能是不可移植的，即不易在新集群中重复安装。
      
      该方案必须是 “https”；URL 必须以 “https://” 开头。
      
      路径是可选的，如果有路径，可以是 URL 中允许的任何字符串。可以使用路径将任意字符串传递给 webhook，例如集群标识符。
      
      不允许使用用户或基本身份验证，例如，不允许使用 “user:password@”。不允许使用片段（“#...”）和查询参数（“?...”）。

  - **webhooks.interpreterContextVersions** ([]string)，必选

    InterpreterContextVersions 是 Webhook 期望的优选的 `ResourceInterpreterContext` 版本的有序列表。Karmada 将尝试使用列表中的第一个版本。如果 Karmada 不支持此列表中的版本，则此对象的验证将失败。如果持久化的 webhook 配置指定了支持的版本，且不包括 Karmada 已知的任何版本，则对 webhook 的调用将失败，并受失败策略的约束。

  - **webhooks.name**（string），必选

    Name 是 webhook 的全限定名。

  - **webhooks.rules** ([]RuleWithOperations)

    Rules 描述了 webhook 涉及的资源上的操作。webhook 关心操作是否匹配任何 Rule。

    <a name="RuleWithOperations"></a>

    *RuleWithOperations 是操作和资源的元组。建议确保所有元组组合都是有效的。*

    - **webhooks.rules.apiGroups** ([]string)，必选

      APIGroups 是资源所属的 API 组。'*' 表示所有组。如果存在 '*'，则列表的长度必须为 1。例如：
       ["apps", "batch", "example.io"]：匹配3个组。
       ["*"]：匹配所有组。
      
      注意：组可留空，例如，对于 Kubernetes 的 core 组，使用 [""]。

    - **webhooks.rules.apiVersions** ([]string)，必选

      APIVersions 是资源所属的API版本。'*' 表示所有版本。如果存在 '*'，则列表的长度必须为 1。例如：
       ["v1alpha1", "v1beta1"]：匹配2个版本。
       ["*"]：匹配所有版本。

    - **webhooks.rules.kinds** ([]string)，必选

      Kinds 是规则适用的资源列表。如果存在 '*'，则列表的长度必须为 1。例如：
       ["Deployment", "Pod"]：匹配 Deployment 和 Pod。
       ["*"]：应用于所有资源。

    - **webhooks.rules.operations** ([]string)，必选

      Operations 是钩子所关心的操作。如果存在 '*'，则列表的长度必须为 1。

  - **webhooks.timeoutSeconds** (int32)

    TimeoutSeconds 指定此 webhook 的超时时间。超时后，webhook 的调用将被忽略或 API 调用将根据失败策略失败。取值必须在 1 到 30 秒之间，默认为 10 秒。

## ResourceInterpreterWebhookConfigurationList 

ResourceInterpreterWebhookConfigurationList 包含 ResourceInterpreterWebhookConfiguration 的列表。

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterWebhookConfigurationList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration))，必选

  Items holds a list of ResourceInterpreterWebhookConfiguration.

## 操作

<hr/>

### `get`：查询指定的 ResourceInterpreterWebhookConfiguration

#### HTTP 请求

`GET /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterWebhookConfiguration 名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

### `get`：查询指定 ResourceInterpreterWebhookConfiguration 的状态

#### HTTP 请求

`GET /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterWebhookConfiguration 的名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

### `list`：查询所有 ResourceInterpreterWebhookConfiguration

#### HTTP 请求

GET /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations

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

200 ([ResourceInterpreterWebhookConfigurationList](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfigurationlist)): OK

### `create`：创建一个 ResourceInterpreterWebhookConfiguration

#### HTTP 请求

POST /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations

#### 参数

- **body**: [ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration), required

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

202 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Accepted

### `update`：更新指定的 ResourceInterpreterWebhookConfiguration

#### HTTP 请求

`PUT /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterWebhookConfiguration 的名称

- **body**: [ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `update`：更新指定 ResourceInterpreterWebhookConfiguration 的状态

#### HTTP 请求

`PUT /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterWebhookConfiguration 的名称

- **body**: [ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `patch`：更新指定 ResourceInterpreterWebhookConfiguration 的部分信息

#### HTTP 请求

`PATCH /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterWebhookConfiguration 的名称

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

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `patch`：更新指定 ResourceInterpreterWebhookConfiguration 状态的部分信息

#### HTTP 请求

`PATCH /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterWebhookConfiguration 的名称

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

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `delete`：删除一个 ResourceInterpreterWebhookConfiguration

#### HTTP 请求

`DELETE /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterWebhookConfiguration 名称

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

### `deletecollection`：删除所有 ResourceInterpreterWebhookConfiguration

#### HTTP 请求

DELETE /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations

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
