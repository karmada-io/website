---
api_metadata:
  apiVersion: ""
  import: "k8s.io/apimachinery/pkg/apis/meta/v1"
  kind: "LabelSelector"
content_type: "api_reference"
description: "A label selector is a label query over a set of resources."
title: "LabelSelector"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/apimachinery/pkg/apis/meta/v1"`

标签选择器是对一组资源的标签进行查询。matchLabels 和 matchExpressions 的结果之间是与的关系。如果留空，表示匹配所有对象。null 表示不匹配任何对象。

<hr/>

- **matchExpressions** ([]LabelSelectorRequirement)

  matchExpressions 是标签选择器要求的列表。要求之间是与的关系（即所有的要求都要满足）。

  <a name="LabelSelectorRequirement"></a>

  *标签选择器要求由键、值和关联键与值的运算符组成。*

  - **matchExpressions.key** (string)，必选

    *补丁策略：根据键 `key` 进行合并。*

    key 是选择器应用的标签键。

  - **matchExpressions.operator** (string)，必选

    operator 表示一个键与其值的关系。有效的运算符包括 In、NotIn、Exists 和 DoesNotExist。

  - **matchExpressions.values** ([]string)

    values 是字符串值的数组。如果运算符为 In 或 NotIn ，则 values 的数组必须非空。如果运算符为 Exists 或 DoesNotExist，则 values 的数组必须为空。在策略性合并补丁期间会替换此数组。

- **matchLabels** (map[string]string)

  matchLabels 是键值对的映射。matchLabels 映射中的单个键值对相当于 matchExpressions 的一个元素，键的字段为 key，运算符为 In，值为包含 value 的 values 数组。要求之间是与的关系（即所有的要求都要满足）。
