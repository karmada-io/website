---
api_metadata:
  apiVersion: ""
  import: "k8s.io/apimachinery/pkg/apis/meta/v1"
  kind: "ListMeta"
content_type: "api_reference"
description: "ListMeta describes metadata that synthetic resources must have, including lists and various status objects."
title: "ListMeta"
weight: 3
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/apimachinery/pkg/apis/meta/v1"`

ListMeta 描述合成资源必须具有的元数据，包括列表和各种状态对象。一个资源只能有一个 [ObjectMeta, ListMeta]。

<hr/>

- **continue** (string)

  如果用户对返回的项目数量设置了限制，可能会设置 continue，表示服务器有更多可用数据。取值是不透明的，可用于向列表的端点发出另一个请求，以检索下一组可用对象。如果服务器配置已更改或已过去几分钟，可能无法继续提供一致的列表。除非您从错误的消息中收到 continue 值，否则使用 continue 的值时返回的 resourceVersion 字段将与第一个响应中的值相同。

- **remainingItemCount** (int64)

  remainingItemCount 是列表中后续项目的数量，这些项目并未包含在列表响应中。如果列表请求包含标签或字段选择器，则剩余项的数量是未知的。在序列化过程中，remainingItemCount 将保持未设置和省略。如果列表是完整的（既不分块也不是是最后一个分块），则没有更多的剩余项。在序列化过程中，此字段将保持未设置和省略。早于 v1.15 的服务器不设置此字段。remainingItemCount 用于*估计*集合的大小。客户端不应依赖要设置或设置准确的 remainingItemCount。

- **resourceVersion** (string)

  resourceVersion 是标识此对象的服务器内部版本的字符串，客户端可使用此字段确定对象更改的时间。对客户端而言，此字段的取值非透明，且未做任何修改，直接传回至服务器。取值由系统填充，而且只读。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency

- **selfLink** (string)

  Deprecated：selfLink是遗留的只读字段，系统不再自动填充。
