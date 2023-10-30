---
api_metadata:
  apiVersion: ""
  import: "k8s.io/apimachinery/pkg/apis/meta/v1"
  kind: "DeleteOptions"
content_type: "api_reference"
description: "DeleteOptions may be provided when deleting an API object."
title: "DeleteOptions"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/apimachinery/pkg/apis/meta/v1"`

删除 API 对象时，可以提供 DeleteOptions。

<hr/>

- **apiVersion** (string)

  APIVersion 定义对象的版本化模式。服务器应将已识别的模式转换为最新的内部值，可能拒绝无法识别的值。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources

- **dryRun** ([]string)

  如果存在，表示修改不会被保留。无效或无法识别的 dryRun 指令会导致错误响应，也不会进一步处理请求。有效值为：
  - All：将处理所有空运行阶段。

- **gracePeriodSeconds** (int64)

  此字段表示删除对象之前的持续时间（单位为秒）。取值只能为正整数。取值为 0，表示立即删除。取值为 nil，表示使用指定类型的默认宽限期。如果未指定，则为每个对象的默认值。0 表示立即删除。

- **kind** (string)

  Kind 是对象所表示的 REST 资源的字符串值。服务器可从客户端提交请求的端点推断出字符串的值。此字段无法更新，必须采用驼峰形式（ CamelCase）表示。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

- **orphanDependents** (boolean)

  Deprecated：此字段将在1.7中废弃，请使用 PropagationPolicy。此字段表示是否孤立依赖项。如果取值为 true，会向对象的终结器列表中添加 orphan 终结器。如果取值为 false，会删除对象终结器列表中的 orphan 终结器。可设置此字段或 PropagationPolicy，但不可两个同时设置。

- **preconditions** (Preconditions)

  删除前必须满足先决条件。如果无法满足，将返回 409 Conflict。

  <a name="Preconditions"></a>

  *在执行操作（更新、删除等）之前，必须满足先决条件。*

  - **preconditions.resourceVersion** (string)

    目标资源版本。

  - **preconditions.uid** (string)

    目标UID。

- **propagationPolicy** (string)

  是否以及如何执行垃圾收集。可以设置此字段或 OrphanDependents，但不能同时设置。默认策略由 metadata.finalizers 中现有的终结器和特定资源的默认策略设置所决定。可接受的值是：
  - Orphan：孤立依赖项；
  - Background：允许垃圾回收器后台删除依赖；
  - Foreground：一个级联策略，前台删除所有依赖项。
