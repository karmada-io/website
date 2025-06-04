---
api_metadata:
  apiVersion: ""
  import: "k8s.io/api/core/v1"
  kind: "NodeSelectorRequirement"
content_type: "api_reference"
description: "A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values."
title: "NodeSelectorRequirement"
weight: 4
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/api/core/v1"`

*节点选择器要求由键、值和关联键与值的运算符组成。*

<hr/>

- **key** (string)，必选

  key 是选择器应用的标签键。

- **operator** (string)，必选

  operator 表示一个键与其值的关系。有效的运算符包括 In、NotIn、Exists、DoesNotExist、Gt 和 Lt。
  
  枚举值包括：
   - `"DoesNotExist"`
   - `"Exists"`
   - `"Gt"`
   - `"In"`
   - `"Lt"`
   - `"NotIn"`

- **values** ([]string)

  字符串值的数组。如果运算符为 In 或 NotIn ，则 values 的数组必须非空。如果运算符为 Exists 或 DoesNotExist，则 values 的数组必须为空。如果运算符是 Gt 或 Lt，则 values 的数组只能包含一个元素，该元素将被解释为整数。此数组会在策略性合并补丁期间被替换。
