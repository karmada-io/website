---
api_metadata:
  apiVersion: "policy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
  kind: "OverridePolicy"
content_type: "api_reference"
description: "OverridePolicy represents the policy that overrides a group of resources to one or more clusters."
title: "OverridePolicy v1alpha1"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: policy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"`

## OverridePolicy 

OverridePolicy 表示将一组资源覆盖到一个或多个集群的策略。

<hr/>

- **apiVersion**：policy.karmada.io/v1alpha1

- **kind**：OverridePolicy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** (OverrideSpec)，必选

  Spec 表示 OverridePolicy 的规范。

  <a name="OverrideSpec"></a>

  *OverrideSpec 定义了 OverridePolicy 的规范。*

  - **spec.overrideRules** ([]RuleWithCluster)

    OverrideRules 定义一组针对目标群集的覆盖规则。

    <a name="RuleWithCluster"></a>

    *RuleWithCluster 定义集群的覆盖规则。*

    - **spec.overrideRules.overriders** (Overriders)，必选

      Overriders 表示将应用于资源的覆盖规则。

      <a name="Overriders"></a>

      *Overriders 提供各种表示覆盖规则的替代方案。

      如果多个替代方案并存，将按以下顺序应用： ImageOverrider > CommandOverrider > ArgsOverrider > LabelsOverrider > AnnotationsOverrider > Plaintext*

      - **spec.overrideRules.overriders.annotationsOverrider** ([]LabelAnnotationOverrider)

        AnnotationsOverrider 表示用于处理工作负载注解的专属规则。

        <a name="LabelAnnotationOverrider"></a>

        *LabelAnnotationOverrider 表示用于处理工作负载标签/注解的专属规则。*

        - **spec.overrideRules.overriders.annotationsOverrider.operator** (string)，必选

          Operator 表示将应用于工作负载的运算符。

        - **spec.overrideRules.overriders.annotationsOverrider.value** (map[string]string)

          Value 表示工作负载的注解/标签的值。当运算符为“add（添加）"时，Value 中的项会附加在 annotation/label 之后。当运算符为“remove（移除）”时，Value 中与 annotation/label 匹配的项将被删除。当运算符为“replace（替换）”时，Value 中与 annotation/label 匹配的项将被替换。

      - **spec.overrideRules.overriders.argsOverrider** ([]CommandArgsOverrider)

        ArgsOverrider 表示专门处理容器 args 的规则。

        <a name="CommandArgsOverrider"></a>

        *CommandArgsOverrider 表示用于处理 command/args 覆盖的专属规则。*

        - **spec.overrideRules.overriders.argsOverrider.containerName** (string)，必选

          容器的名称。

        - **spec.overrideRules.overriders.argsOverrider.operator** (string)，必选

          Operator 表示将应用于 command/args 的运算符。

        - **spec.overrideRules.overriders.argsOverrider.value** ([]string)

          Value 表示 command/args 的值。当运算符为“add（添加）"时，Value 中的项会附加在 command/args 之后。当运算符为“remove（移除）”时，Value 中与 command/args 匹配的项将被删除。如果 Value 留空，则 command/args 将保持不变。

      - **spec.overrideRules.overriders.commandOverrider** ([]CommandArgsOverrider)

        CommandOverrider 表示用于处理容器命令的专属规则。

        <a name="CommandArgsOverrider"></a>

        *CommandArgsOverrider 表示用于处理 command/args 覆盖的专属规则。*

        - **spec.overrideRules.overriders.commandOverrider.containerName** (string)，必选

          容器的名称。

        - **spec.overrideRules.overriders.commandOverrider.operator** (string)，必选

          Operator 表示将应用于 command/args 的运算符。

        - **spec.overrideRules.overriders.commandOverrider.value** ([]string)

          Value 表示 command/args 的值。当运算符为“add（添加）"时，Value 中的项会附加在 command/args 之后。当运算符为“remove（移除）”时，Value 中与 command/args 匹配的项将被删除。如果 Value 留空，则 command/args 将保持不变。

      - **spec.overrideRules.overriders.imageOverrider** ([]ImageOverrider)

        ImageOverrider 表示用于处理镜像覆盖的专属规则。

        <a name="ImageOverrider"></a>

        *ImageOverrider 表示用于处理镜像覆盖的专属规则。*

        - **spec.overrideRules.overriders.imageOverrider.component** (string)，必选

          组件是镜像名称的一部分。镜像名称通常表示为[registry/]repository[:tag]。registry 可能是 - registry.k8s.io - fictional.registry.example:10443；repository 可能是 kube-apiserver - fictional/nginx；标签可能是 -latest- v1.19.1 - @sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c

        - **spec.overrideRules.overriders.imageOverrider.operator** (string)，必选

          Operator 表示将应用于镜像的运算符。

        - **spec.overrideRules.overriders.imageOverrider.predicate** (ImagePredicate)

          Predicate 在应用规则之前，会对镜像进行过滤。

          默认值为 nil。如果设置为默认值，并且资源类型为 Pod、ReplicaSet、Deployment、StatefulSet、DaemonSet 或 Job，系统将按照以下规则自动检测镜像字段：
          - Pod: /spec/containers/&lt;N&gt;/image
          - ReplicaSet: /spec/template/spec/containers/&lt;N&gt;/image
            - Deployment: /spec/template/spec/containers/&lt;N&gt;/image
            - DaemonSet: /spec/template/spec/containers/&lt;N&gt;/image
            - StatefulSet: /spec/template/spec/containers/&lt;N&gt;/image
            - Job: /spec/template/spec/containers/&lt;N&gt;/image

          此外，如果资源对象有多个容器，所有镜像都将被处理。

          如果值不是 nil，仅处理与过滤条件匹配的镜像。

          <a name="ImagePredicate"></a>

          *ImagePredicate 定义镜像的过滤条件。*

          - **spec.overrideRules.overriders.imageOverrider.predicate.path** (string)，必选

            Path 表示目标字段的路径。

        - **spec.overrideRules.overriders.imageOverrider.value** (string)

          Value 表示镜像的值。当运算符为“add（添加）”或“replace（替换）”时，不得为空。当运算符为“remove（删除）”时，默认为空且可忽略。

      - **spec.overrideRules.overriders.labelsOverrider** ([]LabelAnnotationOverrider)

        LabelsOverrider 表示用于处理工作负载标签的专属规则

        <a name="LabelAnnotationOverrider"></a>

        **LabelAnnotationOverrider** 表示用于处理工作负载标签/注解的专属规则。

        - **spec.overrideRules.overriders.labelsOverrider.operator** (string)，必选

          Operator表示将应用于工作负载的运算符。

        - **spec.overrideRules.overriders.labelsOverrider.value** (map[string]string)

          Value 表示工作负载的注解/标签的值。当运算符为“add（添加）"时，Value中的项会附加在annotation/label之后。当运算符为“remove（移除）”时，Value 中与 annotation/label 匹配的项将被删除。当运算符为“replace（替换）”时，Value 中与 annotation/label 匹配的项将被替换。

      - **spec.overrideRules.overriders.plaintext** ([]PlaintextOverrider)

        Plaintext 表示用明文定义的覆盖规则。

        <a name="PlaintextOverrider"></a>

        *PlaintextOverrider 根据路径、运算符和值覆盖目标字段。*

        - **spec.overrideRules.overriders.plaintext.operator** (string)，必选

          Operator 表示对目标字段的操作。可用的运算符有：添加（add）、替换（replace）和删除（remove）。

        - **spec.overrideRules.overriders.plaintext.path** (string)，必选

          Path 表示目标字段的路径。

        - **spec.overrideRules.overriders.plaintext.value** (JSON)

          Value 表示应用于目标字段的值。当操作符为“remove（删除）”时，必须为空。

          <a name="JSON"></a>

          *JSON 表示任何有效的 JSON 值。支持以下类型：bool、int64、float64、string、[]interface[]、map[string]interface[]和 nil*

    - **spec.overrideRules.targetCluster** (ClusterAffinity)

      TargetCluster 定义对此覆盖策略的限制，此覆盖策略仅适用于分发到匹配集群的资源。nil 表示匹配所有集群。

      <a name="ClusterAffinity"></a>

      *ClusterAffinity 表示用于选择集群的过滤条件。*

      - **spec.overrideRules.targetCluster.clusterNames** ([]string)

        ClusterNames 罗列待选择的集群。

      - **spec.overrideRules.targetCluster.exclude** ([]string)

        ExcludedClusters 罗列待忽略的集群。

      - **spec.overrideRules.targetCluster.fieldSelector** (FieldSelector)

        FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

        <a name="FieldSelector"></a>

        *FieldSelector 是一个字段过滤器。*

        - **spec.overrideRules.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          字段选择器要求列表。

      - **spec.overrideRules.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

  - **spec.overriders** (Overriders)

    Overriders 表示将应用于资源的覆盖规则。

    Deprecated：此字段已在 v1.0 中被弃用，请改用 OverrideRules。

    <a name="Overriders"></a>

    *Overriders 提供了各种表示覆盖规则的替代方案。

    如果多个替代方案并存，将按以下顺序应用： ImageOverrider > CommandOverrider > ArgsOverrider > LabelsOverrider > AnnotationsOverrider > Plaintext*

    - **spec.overriders.annotationsOverrider** ([]LabelAnnotationOverrider)

      AnnotationsOverrider 表示用于处理工作负载注解的专属规则。

      <a name="LabelAnnotationOverrider"></a>

      *LabelAnnotationOverrider 表示用于处理工作负载标签/注解的专属规则。*

      - **spec.overriders.annotationsOverrider.operator** (string)，必选

        Operator 表示将应用于工作负载的运算符。

      - **spec.overriders.annotationsOverrider.value** (map[string]string)

        Value 表示工作负载的注解/标签的值。当运算符为“add（添加）"时，Value 中的项会附加在 annotation/label 之后。当运算符为“remove（移除）”时，Value 中与 annotation/label 匹配的项将被删除。当运算符为“replace（替换）”时，Value 中与 annotation/label 匹配的项将被替换。

    - **spec.overriders.argsOverrider** ([]CommandArgsOverrider)

      ArgsOverrider 表示专门处理容器 args 的规则。

      <a name="CommandArgsOverrider"></a>

      *CommandArgsOverrider 表示用于处理 command/args 覆盖的专属规则。*

      - **spec.overriders.argsOverrider.containerName** (string)，必选

        容器的名称。

      - **spec.overriders.argsOverrider.operator** (string)，必选

        Operator 表示将应用于 command/args 的运算符。

      - **spec.overriders.argsOverrider.value** ([]string)

        Value 表示 command/args 的值。当运算符为“add（添加）"时，Value 中的项会附加在 command/args 之后。当运算符为“remove（移除）”时，Value 中与 command/args 匹配的项将被删除。如果Value 为空，则 command/args 将保持不变。

    - **spec.overriders.commandOverrider** ([]CommandArgsOverrider)

      CommandOverrider 表示用于处理容器命令的专属规则。

      <a name="CommandArgsOverrider"></a>

      *CommandArgsOverrider 表示用于处理 command/args 覆盖的专属规则。*

      - **spec.overriders.commandOverrider.containerName** (string)，必选

        容器的名称。

      - **spec.overriders.commandOverrider.operator** (string)，必选

        Operator 表示将应用于 command/args 的运算符。

      - **spec.overriders.commandOverrider.value** ([]string)

        Value 表示 command/args 的值。当运算符为“add（添加）"时，Value 中的项会附加在 command/args 之后。当运算符为“remove（移除）”时，Value 中与 command/args 匹配的项将被删除。如果 Value 为空，则 command/args 将保持不变。

    - **spec.overriders.imageOverrider** ([]ImageOverrider)

      ImageOverrider 表示用于处理镜像覆盖的专属规则。

      <a name="ImageOverrider"></a>

      *ImageOverrider 表示用于处理镜像覆盖的专属规则。*

      - **spec.overriders.imageOverrider.component** (string)，必选

        组件是镜像名称的一部分。镜像名称通常表示为[registry/]repository[:tag]。registry 可能是 - registry.k8s.io - fictional.registry.example:10443；repository 可能是 kube-apiserver - fictional/nginx；标签可能是 -latest- v1.19.1 - @sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c

      - **spec.overriders.imageOverrider.operator** (string)，必选

        Operator 表示将应用于镜像的运算符。

      - **spec.overriders.imageOverrider.predicate** (ImagePredicate)

        Predicate 在应用规则之前，会对镜像进行过滤。

        默认值为 nil。如果设置为默认值，并且资源类型为 Pod、ReplicaSet、Deployment、StatefulSet、DaemonSet 或 Job，系统将按照以下规则自动检测镜像字段：
        - Pod: /spec/containers/&lt;N&gt;/image
        - ReplicaSet: /spec/template/spec/containers/&lt;N&gt;/image
          - Deployment: /spec/template/spec/containers/&lt;N&gt;/image
          - DaemonSet: /spec/template/spec/containers/&lt;N&gt;/image
          - StatefulSet: /spec/template/spec/containers/&lt;N&gt;/image
          - Job: /spec/template/spec/containers/&lt;N&gt;/image

        此外，如果资源对象有多个容器，所有镜像都将被处理。

        如果值不是 nil，仅处理与过滤条件匹配的镜像。

        <a name="ImagePredicate"></a>

        *ImagePredicate 定义镜像的过滤条件。*

        - **spec.overriders.imageOverrider.predicate.path** (string)，必选

          Path 表示目标字段的路径。

      - **spec.overriders.imageOverrider.value** (string)

        Value 表示镜像的值。当运算符为“add（添加）”或“replace（替换）”时，不得为空。当运算符为“remove（删除）”时，默认为空且可忽略。

    - **spec.overriders.labelsOverrider** ([]LabelAnnotationOverrider)

      LabelsOverrider 表示用于处理工作负载标签的专属规则

      <a name="LabelAnnotationOverrider"></a>

      *LabelAnnotationOverrider 表示用于处理工作负载标签/注解的专属规则。*

      - **spec.overriders.labelsOverrider.operator** (string)，必选

        Operator 表示将应用于工作负载的运算符。

      - **spec.overriders.labelsOverrider.value** (map[string]string)

        Value 表示工作负载的注解/标签的值。当运算符为“add（添加）"时，Value 中的项会附加在 annotation/label 之后。当运算符为“remove（移除）”时，Value 中与 annotation/label 匹配的项将被删除。当运算符为“replace（替换）”时，Value 中与 annotation/label 匹配的项将被替换。

    - **spec.overriders.plaintext** ([]PlaintextOverrider)

      Plaintext 表示用明文定义的覆盖规则。

      <a name="PlaintextOverrider"></a>

      *PlaintextOverrider 根据路径、运算符和值覆盖目标字段。*

      - **spec.overriders.plaintext.operator** (string)，必选

        Operator 表示对目标字段的操作。可用的运算符有：添加（add）、替换（replace）和删除（remove）。

      - **spec.overriders.plaintext.path** (string)，必选

        Path 表示目标字段的路径。

      - **spec.overriders.plaintext.value** (JSON)

        Value 表示应用于目标字段的值。当操作符为“remove（删除）”时，必须为空。

        <a name="JSON"></a>

        *JSON 表示任何有效的 JSON 值。支持以下类型：bool、int64、float64、string、[]interface[]、map[string]interface[]和 nil*

  - **spec.resourceSelectors** ([]ResourceSelector)

    ResourceSelectors 限制此覆盖策略适用的资源类型。nil 表示此覆盖策略适用于所有资源。

    <a name="ResourceSelector"></a>

    *ResourceSelector 用于选择资源。*

    - **spec.resourceSelectors.apiVersion** (string)，必选

      APIVersion 表示目标资源的 API 版本。

    - **spec.resourceSelectors.kind** (string)，必选

      Kind 表示目标资源的类别。

    - **spec.resourceSelectors.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      查询一组资源的标签。如果 name 不为空，labelSelector 会被忽略。

    - **spec.resourceSelectors.name** (string)

      目标资源的名称。默认值为空，表示选择所有资源。

    - **spec.resourceSelectors.namespace** (string)

      目标资源的命名空间。默认值为空，表示从父对象作用域继承资源。

  - **spec.targetCluster** (ClusterAffinity)

    TargetCluster 定义对此覆盖策略的限制，此覆盖策略仅适用于分发到匹配集群的资源。nil 表示匹配所有集群。

    Deprecated 表示此字段已在 v1.0 中被弃用，请改用 OverrideRules。

    <a name="ClusterAffinity"></a>

    *ClusterAffinity 表示用于选择群集的过滤器。*

    - **spec.targetCluster.clusterNames** ([]string)

      ClusterNames 罗列待选择的集群。

    - **spec.targetCluster.exclude** ([]string)

      ExcludedClusters 罗列待忽略的集群。

    - **spec.targetCluster.fieldSelector** (FieldSelector)

      FieldSelector 是一个按字段选择成员集群的过滤器。匹配表达式的键（字段）为 provider、region 或 zone，匹配表达式的运算符为 In 或 NotIn。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

      <a name="FieldSelector"></a>

      *FieldSelector 是一个字段过滤器。*

      - **spec.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

        字段选择器要求列表。

    - **spec.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      LabelSelector 是一个按标签选择成员集群的过滤器。如果值不为 nil，也未留空，仅选择与此过滤器匹配的集群。

## OverridePolicyList 

OverridePolicyList 是一组 OverridePolicy 的集合。

<hr/>

- **apiVersion**：policy.karmada.io/v1alpha1

- **kind**：OverridePolicyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))，必选

  Items 罗列 OverridePolicy。

## 操作

<hr/>

### `get`：查询指定的 OverridePolicy

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  OverridePolicy 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：OK

### `get`：查询指定 OverridePolicy 的状态

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies/`{name}`/status

#### 参数

- **名称**（*路径参数*）：string，必选

  OverridePolicy 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：OK

### `list`：查询某个命名空间内的所有 OverridePolicy

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **allowWatchBookmarks** （*查询参数*）：boolean

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

- **timeoutSeconds** （查询参数）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([OverridePolicyList](../policy-resources/override-policy-v1alpha1#overridepolicylist))：OK

### `list`：查询所有 OverridePolicy

#### HTTP 请求

GET /apis/policy.karmada.io/v1alpha1/overridepolicies

#### 参数

- **allowWatchBookmarks** （*查询参数*）：boolean

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

- **timeoutSeconds** （查询参数）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([OverridePolicyList](../policy-resources/override-policy-v1alpha1#overridepolicylist))：OK

### `create`：创建一条 OverridePolicy

#### HTTP 请求

POST /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：Created

202 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：Accepted

### `update`：更新指定的 OverridePolicy

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  OverridePolicy 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)，必须


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：Created

### `update`：更新指定 OverridePolicy 的状态

#### HTTP 请求

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies/`{name}`/status

#### 参数

- **名称**（*路径参数*）：string，必选

  OverridePolicy 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)，必须


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：Created

### `patch`：更新指定 OverridePolicy 的部分信息

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  OverridePolicy 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

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

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：Created

### `patch`：更新指定 OverridePolicy 状态的部分信息

#### HTTP 请求

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies/`{name}`/status

#### 参数

- **名称**（*路径参数*）：string，必选

  OverridePolicy 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

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

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy))：Created

### `delete`：删除一条 OverridePolicy

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies/`{name}`

#### 参数

- **名称**（*路径参数*）：string，必选

  OverridePolicy 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

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

200 ([Status](../common-definitions/status#status))：OK

202 ([Status](../common-definitions/status#status))：Accepted

### `deletecollection` 删除所有 OverridePolicy

#### HTTP 请求

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/overridepolicies

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

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

- **timeoutSeconds** （查询参数）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status))：OK
