---
api_metadata:
  apiVersion: ""
  import: "k8s.io/apimachinery/pkg/apis/meta/v1"
  kind: "Status"
content_type: "api_reference"
description: "Status is a return value for calls that don't return other objects."
title: "Status"
weight: 8
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/apimachinery/pkg/apis/meta/v1"`

Status 是调用的返回值，而调用不返回其他对象。

<hr/>

- **apiVersion** (string)

  APIVersion 定义对象的版本模式。服务器将识别的模式转换为最新的内部值，可能拒绝未识别的值。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources

- **code** (int32)

  建议返回 HTTP码。如果未设置，则为 0。

- **details** (StatusDetails)

  与原因有关的扩展数据。每个原因都可以定义自己的扩展细节。此字段是可选的，且不保证返回的数据符合除原因类型定义外的任何模式。

  <a name="StatusDetails"></a>

  *StatusDetails 是一组可以由服务器设置的附加属性，以提供有关响应的附加信息。Status 对象的原因（Reason）字段定义了要设置的属性。客户端必须忽略与每个属性的定义类型不匹配的字段，并假定任何属性都可能为空、无效或未定义。*

  - **details.causes** ([]StatusCause)

    Causes 数组包含与 StatusReason 失败有关的更多详细信息。并非所有的 StatusReason 都可以提供详细的原因。

    <a name="StatusCause"></a>

    *StatusCause 提供了有关 api.Status 失败的更多信息，包括多个错误的情况。*

    - **details.causes.field** (string)

      导致错误的资源的字段，由其JSON序列化命名，可能包括嵌套属性的点和后缀。数组从零开始索引。由于字段有多个错误，字段可能会在原因数组中出现多次。可选字段。

      示例：
      “name”：当前资源的字段 “name”。
      "items[0].name"："items" 中第一个数组条目的字段 "name"。

    - **details.causes.message** (string)

      错误原因的描述（人类可读消息）。此字段可以直接呈现给读者。

    - **details.causes.reason** (string)

      错误原因的描述（机器可读消息）。如果留空，表示没有可用的信息。

  - **details.group** (string)

    与 StatusReason 关联的资源的组属性。

  - **details.kind** (string)

    与 StatusReason 关联的资源的类别属性。在某些操作上可能与请求的资源类别不同。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

  - **details.name** (string)

    与 StatusReason 关联的资源的名称属性（当有单个名称可以描述时）。

  - **details.retryAfterSeconds** (int32)

    表示重试操作前的时间（以秒为单位）。某些错误可能指出客户端必须采取替代操作，对于这些错误，此字段可能表示在采取替代操作之前等待的时间。

  - **details.uid** (string)

    资源的UID （当有单个资源可以描述时）。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names#uids

- **kind** (string)

  Kind 是对象所表示的 REST 资源的字符串值。服务器可从客户端提交请求的端点推断出字符串的值。此字段无法更新，必须采用驼峰形式表示。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

- **message** (string)

  操作状态的描述（人类可读消息）。

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

  标准的列表元数据。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

- **reason** (string)

  解释操作处于 Failure 状态的原因（机器可读消息）。如果留空，表示没有可用的信息。Reason 对 HTTP 状态码进行解释，但不会覆盖状态码。

- **status** (string)

  操作的状态。取值为 Success 或 Failure。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
