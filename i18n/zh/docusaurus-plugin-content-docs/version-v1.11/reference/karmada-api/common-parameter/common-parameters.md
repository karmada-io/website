---
api_metadata:
  apiVersion: ""
  import: ""
  kind: "Common Parameters"
content_type: "api_reference"
description: ""
title: "Common Parameters"
weight: 11
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

## allowWatchBookmarks 

allowWatchBookmarks 请求类型为 BOOKMARK 的监视事件。没有实现书签的服务器可能会忽略这个标志，并根据服务器的判断发送书签。客户端不应该假设书签会在任何特定的时间间隔返回，也不应该假设服务器会在会话期间发送任何 BOOKMARK 事件。如果当前不是 watch 请求，则忽略该字段。

<hr/>

## continue

当需要从服务器检索更多结果时，应该设置 continue 选项。由于这个值是服务器定义的，客户端只能使用先前查询结果中具有相同查询参数的 continue 值（continue 值除外），服务器可能拒绝它识别不到的 continue 值。如果指定的 continue 值不再有效，无论是由于过期（通常是 5 到 15 分钟） 还是服务器上的配置更改，服务器将响应 "410 ResourceExpired" 错误和一个 continue 令牌。如果客户端需要一个一致的列表，它必须在没有 continue 字段的情况下重新发起 list 请求。否则，客户端可能会发送另一个带有 410 错误令牌的 list 请求，服务器将响应从下一个键开始的列表，但列表数据来自最新的快照，这与之前的列表结果不一致。第一个列表请求之后的对象创建，修改，或删除的对象将被包含在响应中，只要他们的键是在“下一个键”之后。

当 watch 字段为 true 时，不支持此字段。客户端可以从服务器返回的最后一个 resourceVersion 值开始监视，就不会错过任何修改。

<hr/>

## dryRun

表示不应该持久化所请求的修改。无效或无法识别的 dryRun 指令将导致错误响应，并且服务器不再对请求进行进一步处理。有效值为：
- All，表示将处理所有的演练阶段。

<hr/>

## fieldManager

fieldManager 是与进行这些变更的参与者或实体相关联的名称。长度小于或等于·128 个字符且仅包含可打印字符，如 https://golang.org/pkg/unicode/#IsPrint 所定义。

<hr/>

## fieldSelector

通过字段限制返回对象列表的选择器。默认为返回所有对象。

<hr/>

## fieldValidation

fieldValidation 指示服务器如何处理请求（POST/PUT/PATCH）中包含未知或重复字段的对象。有效值为：
- Ignore：将忽略从对象中默默删除的所有未知字段，并将忽略除解码器遇到的最后一个重复字段之外的所有字段。这是在 v1.23 之前的默认行为。
- Warn：将针对从对象中删除的各个未知字段以及所遇到的各个重复字段，分别通过标准警告响应头发出警告。如果没有其他错误，请求仍然会成功，并且只会保留所有重复字段中的最后一个。这是 v1.23+ 版本中的默认设置。
- Strict：如果从对象中删除任何未知字段，或者存在任何重复字段，将使请求失败并返回 BadRequest 错误。从服务器返回的错误将包含遇到的所有未知和重复字段。

<hr/>

## force

Force 将“强制”应用请求。这意味着用户将重新获得他人拥有的冲突领域。对于非应用补丁请求，Force 标志必须不设置。

<hr/>

## gracePeriodSeconds

删除对象前的持续时间（秒数）。值必须为非负整数。取值为 0 表示立即删除。如果该值为 nil，将使用指定类型的默认宽限期。如果没有指定，默认为每个对象的设置值。0 表示立即删除。

<hr/>

## labelSelector

通过标签限制返回对象列表的选择器。默认为返回所有对象。

<hr/>

## limit

limit 是一个列表调用返回的最大响应数。如果有更多的条目，服务器会将列表元数据上的 `continue` 字段设置为一个值，该值可以用于相同的初始查询来检索下一组结果。设置 limit 可能会在所有请求的对象被过滤掉的情况下返回少于请求的条目数量（下限为零），并且客户端应该只根据 continue 字段是否存在来确定是否有更多的结果可用。服务器可能选择不支持 limit 参数，并将返回所有可用的结果。如果指定了 limit 并且 continue 字段为空，客户端可能会认为没有更多的结果可用。如果 watch 为 true，则不支持此字段。

服务器保证在使用 continue 时返回的对象将与不带 limit 的列表调用相同。也就是说，在发出第一个请求后所创建、修改或删除的对象将不包含在任何后续的继续请求中。这有时被称为一致性快照，确保使用 limit 的客户端在分块接收非常大的结果的客户端能够看到所有可能的对象。如果对象在分块列表期间被更新，则返回计算第一个列表结果时存在的对象版本。

<hr/>

## namespace

对象名称和身份验证范围，例如用于团队和项目。

<hr/>

## pretty

如果设置为 true ，那么输出是规范的打印。默认为 false，除非用户代理指示浏览器或命令行 HTTP 工具（curl 和 wget）。

<hr/>

## propagationPolicy

是否以及如何执行垃圾收集。可以设置此字段或 OrphanDependents，但不能同时设置。默认策略由 metadata.finalizers 和特定资源的默认策略设置决定。可接受的值是：
- Orphan：孤立依赖项；
- Background：允许垃圾回收器后台删除依赖；
- Foreground：一个级联策略，前台删除所有依赖项。

<hr/>

## resourceVersion

resourceVersion 对请求所针对的资源版本设置约束。详情请参见：https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions

默认不设置。

<hr/>

## resourceVersionMatch

resourceVersionMatch 决定如何将 resourceVersion 应用于列表调用。强烈建议对设置了 resourceVersion 的列表调用设置 resourceVersionMatch，具体请参见：https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions

默认不设置。

<hr/>

## sendInitialEvents

`sendInitialEvents=true` 可以和 `watch=true` 一起设置。在这种情况下，监视通知流将从合成事件开始，以生成集合中对象的当前状态。一旦发送了所有此类事件，将发送合成的 Bookmark 事件。bookmark 将报告对象集合对应的 ResourceVersion（RV），并标有 `"k8s.io/initial-events-end": "true"` 注解。之后，监视通知流将照常进行，发送与所监视的对象的变更（在 RV 之后）对应的监视事件。

当设置了 `sendInitialEvents` 选项时，我们还需要设置 `resourceVersionMatch` 选项。watch 请求的语义如下：
- `resourceVersionMatch` = NotOlderThan 被解释为"数据至少与提供的 `resourceVersion` 一样新"，最迟当状态同步到与 ListOptions 提供的版本一样新的 `resourceVersion` 时，发送 bookmark 事件。如果 `resourceVersion` 未设置，这将被解释为"一致读取"，最迟当状态同步到开始处理请求的那一刻时，发送 bookmark 事件。
- `resourceVersionMatch` 设置为任何其他值或返回 unsetInvalid 错误。

如果 `resourceVersion=""` 或 `resourceVersion="0"`（出于向后兼容原因），默认为 true，否则默认为 false。

<hr/>

## timeoutSeconds

list/watch 调用的超时秒数。限制调用的持续时间，无论是否有活动。

<hr/>

## watch

监视对所述资源的变更，并将此类变更以添加、更新和删除通知流的形式返回。指定 resourceVersion。

<hr/>
