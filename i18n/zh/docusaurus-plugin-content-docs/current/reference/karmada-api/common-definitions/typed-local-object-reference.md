---
api_metadata:
  apiVersion: ""
  import: "k8s.io/api/core/v1"
  kind: "TypedLocalObjectReference"
content_type: "api_reference"
description: "TypedLocalObjectReference contains enough information to let you locate the typed referenced object inside the same namespace."
title: "TypedLocalObjectReference"
weight: 9
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/api/core/v1"`

TypedLocalObjectReference 包含足够的信息，使您能够在同一命名空间内按类别定位被引用的对象。

<hr/>

- **kind** (string)，必选

  Kind 是被引用资源的类别。

- **name** (string)，必选

  Name 是被引用资源的名称。

- **apiGroup** (string)

  APIGroup 是被引用资源所在的组。如果未指定 APIGroup，则核心 API 组中必须包含指定的 Kind。对于任何其他第三方类型，APIGroup 都是必需的。
