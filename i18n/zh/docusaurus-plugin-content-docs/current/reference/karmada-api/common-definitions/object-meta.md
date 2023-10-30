---
api_metadata:
  apiVersion: ""
  import: "k8s.io/apimachinery/pkg/apis/meta/v1"
  kind: "ObjectMeta"
content_type: "api_reference"
description: "ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create."
title: "ObjectMeta"
weight: 5
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/apimachinery/pkg/apis/meta/v1"`

ObjectMeta 是所有持久化资源必须具有的元数据，其中包括用户必须创建的所有对象。

<hr/>

- **annotations** (map[string]string)

  Annotations 是一个非结构化键值映射，与资源一起存储，该资源可使用外部工具设置，以存储和检索任意元数据。Annotations 都是不可查询的，在修改对象时应该保留。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations

- **creationTimestamp** (Time)

  CreationTimestamp 是一个时间戳，表示创建此对象时的服务器时间。无法保证在不同的操作中按发生前的顺序设置此字段。客户端不能设置此值。此字段以 RFC3339 形式表示，时间采用 UTC 格式。
  
  取值由系统填充，而且只读。列表为空。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata

  <a name="Time"></a>

  *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

- **deletionGracePeriodSeconds** (int64)

  对象从系统中删除之前允许优雅终止的时间（单位为秒）。此字段只有在 deletionTimestamp 设置时需要，只能被缩短，而且只读。

- **deletionTimestamp** (Time)

  DeletionTimestamp 是资源的删除时间，以 RFC 3339 形式表示。当用户请求优雅删除时，此字段由服务器设置，客户端不能直接设置。一旦终结器列表为空，资源将在此字段中的时间之后被删除（资源列表中不可见，也无法通过名称访问）。只要终结器列表包含项目，删除就会被阻止。一旦设置了 deletionTimestamp，取值不会被取消设置或在未来设置，尽管它可能会缩短或在此之前资源可能会删除。例如，用户可能会请求在 30 秒内删除 pod。Kubelet 会向 pod 中的容器发送优雅终止信号。30 秒后，Kubelet 向容器发送硬终止信号（SIGKILL），并在清理后，从 API 中删除 pod。如果存在网络分区，对象在此时间戳之后也可能依然存在，直到管理员或自动进程确定资源已完全终止。如果未设置，表示未请求优雅删除对象。
  
  请求优雅删除时，取值由系统填充，而且只读。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata

  <a name="Time"></a>

  *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

- **finalizers** ([]string)

  在从注册表中删除对象之前，必须为空。每个条目都是组件的标识符，将从列表中删除条目。如果对象的 deletionTimestamp 不为 nil，只能删除列表中的条目。可以按任何顺序处理和删除终结器。顺序不是强制的，只是可能会造成终结器被卡住。finalizers 是个共享字段，任何具有权限的参与者都可以对其重新排序。如果按顺序处理终结器列表，列表中负责第一个终结器的组件会等待列表中稍后负责终结器的组件发出的信号（字段值、外部系统或其他），从而导致死锁。在没有强制顺序的情况下，终结器可自由排序，且不容易受到列表中顺序更改的影响。

- **generateName** (string)

  GenerateName 是服务器使用的可选前缀，仅在没有 Name 字段的情况下生成唯一名称。如果使用此字段，返回给客户端的名称会与传递的名称不同。取值还会与唯一后缀组合。取值具有与 Name 字段相同的验证规则，且后缀的长度可能会被截断，使名称在服务器上唯一。
  
  如果指定此字段，且存在生成的名称，服务器将返回 409。
  
  仅在未指定 Name 时应用。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#idempotency

- **generation** (int64)

  表示所需状态的特定序列号。取值由系统填充，而且只读。

- **labels** (map[string]string)

  字符串键与值之间的映射，可用于对象的组织和分类（范围和选择）。可匹配复制控制器和服务的选择器。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/labels

- **managedFields** ([]ManagedFieldsEntry)

  ManagedFields 将工作流 ID 和版本映射到该工作流管理的字段集。主要用于内部管理，用户通常不需要设置或理解此字段。工作流可以是用户名、控制器名称或特定应用路径的名称，如 ci-cd。修改对象时，工作流所使用的版本始终包含此字段集。

  <a name="ManagedFieldsEntry"></a>

  *ManagedFieldsEntry 是一个工作流 ID，一个字段集（FieldSet），也是该字段集适用的资源的组版本。*

  - **managedFields.apiVersion** (string)

    APIVersion 定义字段集适用的资源的版本。格式为“组/版本（group/version）”，就像顶级 APIVersion 字段一样。字段集的版本无法自动转换，所以必须跟踪字段集的版本。

  - **managedFields.fieldsType** (string)

    FieldsType 是不同字段格式和版本的标识符。目前取值只有一个：FieldsV1。

  - **managedFields.fieldsV1** (FieldsV1)

    FieldsV1 是 FieldsV1 类别中所描述的第一个 JSON 版本格式。

    <a name="FieldsV1"></a>

    *FieldsV1 以 JSON 格式将字段存储在 Trie 等数据结构中。
    
    每个键或 “.” 表示字段本身，并始终映射到一个空集，或是表示子字段或项的字符串。字符串有四种格式：- 'f:&lt;name&gt;'，其中 &lt;name&gt; 是结构中字段的名称，或映射中的键。- 'v:&lt;value&gt;'，其中 &lt;value&gt; 是列表项的实际值（JSON格式）。- i:&lt;index&gt;'， &lt;index&gt; 是列表项的位置。 - 'k:&lt;keys&gt;'，其中 &lt;keys&gt; 是列表项的键字段与其唯一值之间的映射。如果键映射到空字段值，则键表示的字段是集合的一部分。
    
    sigs.k8s.io/structured-merge-diff 中定义了具体格式*

  - **managedFields.manager** (string)

    Manager 是管理字段的工作流的标识符。

  - **managedFields.operation** (string)

    Operation 是导致创建 ManagedFieldsEntry 的操作类型。取值包括 Apply 和 Update。

  - **managedFields.subresource** (string)

    Subresource 是用于更新对象的子资源的名称，如果对象是通过主资源更新的，则此字段为空字符串。字段的取值可用于区分管理器，即使它们共享相同的名称。例如，状态更新不同于使用相同管理器名称的常规更新。注意：APIVersion 与 Subresource 无关，APIVersion 始终与主资源的版本有关。

  - **managedFields.time** (Time)

    Time 是添加 ManagedFields 条目的时间戳。如果添加字段，管理器更改任何所属字段值或删除字段，时间戳也会更新。当从条目中删除字段时，时间戳不会更新，因为另一个管理器会接管时间戳。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

- **name** (string)

  名称在命名空间中必须是唯一的。名称是创建资源时必需的，尽管某些资源可能允许客户端自动请求生成适当的名称。名称主要用于表示创建幂等性和配置定义。此字段无法更新。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names#names

- **namespace** (string)

  Namespace 定义一个空间，其中每个名称必须唯一。空命名空间相当于 default 命名空间，但 default 才是默认命名空间的规范表示。并非所有对象都需要限定在命名空间内，对于这些对象，此字段值为空。
  
  必须是 DNS_LABEL，而且无法更新。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces

- **ownerReferences** ([]OwnerReference)

  *补丁策略：根据键 `uid` 进行合并。*
  
  对象所依赖的对象列表。如果列表中的所有对象都已删除，对象会被视为垃圾收集。如果对象由控制器管理，则列表中的条目将指向此控制器，控制器字段设置为 true。管理对象的控制器不能有多个。

  <a name="OwnerReference"></a>

  *OwnerReference 包含足够可以让你识别属主对象的信息。属主对象必须与依赖对象处于同一命名空间内或同一集群内，因此没有命名空间字段。*

  - **ownerReferences.apiVersion** (string)，必选

    被引用资源的 API 版本。

  - **ownerReferences.kind** (string)，必选

    被引用资源的 API 类别。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

  - **ownerReferences.name** (string)，必选

    被引用资源的名称。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names#names

  - **ownerReferences.uid** (string)，必选

    被引用资源的 UID。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names#uids

  - **ownerReferences.blockOwnerDeletion** (boolean)

    如果取值为 true，且属主有 “foregroundDeletion” 终结器，则在删除此引用之前，无法从键值存储中删除属主。有关垃圾收集器与此字段交互并强制完成前台删除的方式，请浏览 https://kubernetes.io/docs/concepts/architecture/garbage-collection/#foreground-deletion 默认值为false。要设置此字段，用户需要所有者的“删除”权限，否则将返回 422 Unprocessable Entity。

  - **ownerReferences.controller** (boolean)

    如果取值为 true，引用指向管理控制器。

- **resourceVersion** (string)

  如果取值不透明，表示对象的内部版本，客户端可使用该版本来确定对象的更改时间。可用于乐观并发、变更检测以及对资源或资源集的监视操作。客户端必须将字段的取值视为是不透明的，并将未修改的值传递回服务器。可能仅对特定资源或资源集有效。
  
  取值由系统填充，而且只读。客户端必须将字段取值视为不透明。 更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency

- **selfLink** (string)

  Deprecated：selfLink 是遗留的只读字段，系统不再自动填充。

- **uid** (string)

  UID 是对象的唯一时间和空间值。通常由服务器在成功创建资源时生成，不允许在 PUT 操作中更改。
  
  取值由系统填充，而且只读。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names#uids
