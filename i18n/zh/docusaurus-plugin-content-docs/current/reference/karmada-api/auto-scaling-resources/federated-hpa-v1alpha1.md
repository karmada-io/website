---
api_metadata:
  apiVersion: "autoscaling.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/autoscaling/v1alpha1"
  kind: "FederatedHPA"
content_type: "api_reference"
description: "FederatedHPA is centralized HPA that can aggregate the metrics in multiple clusters."
title: "FederatedHPA v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: autoscaling.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/autoscaling/v1alpha1"`

## FederatedHPA 

FederatedHPA 是一个可以聚合多个集群指标的 HPA。当系统负载增加时，它会从多个集群查询指标，并增加副本。当系统负载减少时，它会从多个集群查询指标，并减少副本。副本增加或减少后，karmada-scheduler 将根据策略调度副本。

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: FederatedHPA

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([FederatedHPASpec](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpaspec))，必选

  Spec表示 FederatedHPA 的规范。

- **status** (HorizontalPodAutoscalerStatus)

  Status 是 FederatedHPA 当前的状态。

  <a name="HorizontalPodAutoscalerStatus"></a>

  *HorizontalPodAutoscalerStatus 描述 pod 水平伸缩器当前的状态。*

  - **status.desiredReplicas** (int32)，必选

    desiredReplicas 是自动伸缩器自上次计算起，其所管理的pod所需的副本数量。

  - **status.conditions** ([]HorizontalPodAutoscalerCondition)

    *补丁策略：根据键 `type` 进行合并。*
    
    *Map：在合并过程中将保留键类型的唯一值。*
    
    conditions 是自动伸缩器伸缩其目标所需的状况，并表明是否满足这些状况。

    <a name="HorizontalPodAutoscalerCondition"></a>

    *HorizontalPodAutoscalerCondition 描述 HorizontalPodAutoscaler 在特定时刻的状态。*

    - **status.conditions.status** (string)，必选

      status 表示状况的状态（True、False 和 Unknown）。

    - **status.conditions.type** (string)，必选

      type 描述当前的状况。

    - **status.conditions.lastTransitionTime** (Time)

      lastTransitionTime 是状况最后一次从一种状态转换到另一种状态的时间。

      <a name="Time"></a>

      *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

    - **status.conditions.message** (string)

      message 解释了有关状态转换的细节（人类可读消息）。

    - **status.conditions.reason** (string)

      reason 是状况（Condition）最后一次转换的原因。

  - **status.currentMetrics** ([]MetricStatus)

    *Atomic：将在合并过程中被替换掉。*
    
    currentMetrics 是自动伸缩器所用指标最后读取的状态。

    <a name="MetricStatus"></a>

    *MetricStatus 描述单个指标最后读取的状态。*

    - **status.currentMetrics.type** (string)，必选

      type 表示指标源的类别。指标源可能是 ContainerResource、External、Object、Pods 或 Resource，均对应对象中的一个匹配字段。注意：ContainerResource 只有在特性开关 HPAContainerMetrics 启用时可用。

    - **status.currentMetrics.containerResource** (ContainerResourceMetricStatus)

      容器资源是 Kubernetes 已知的资源指标（如 request 与 limit），用于描述当前伸缩目标（如 CPU 或内存）中每个 pod 中单个容器的资源使用情况。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。

      <a name="ContainerResourceMetricStatus"></a>

      *ContainerResourceMetricStatus 表示 Kubernetes 已知的资源指标的当前值，如 request 与 limit，描述当前伸缩目标（如 CPU 或内存）中每个 Pod 中的单个容器的资源使用情况。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。*

      - **status.currentMetrics.containerResource.container** (string)，必选

        container 是伸缩目标的 pod 中容器的名称。

      - **status.currentMetrics.containerResource.current** (MetricValueStatus)，必选

        current 是给定指标的当前值。

        <a name="MetricValueStatus"></a>

        *MetricValueStatus 表示指标的当前值。*

        - **status.currentMetrics.containerResource.current.averageUtilization** (int32)

          currentAverageUtilization 是所有相关 pod 中资源指标当前的平均值，表示为 pod 请求的资源值的百分比。

        - **status.currentMetrics.containerResource.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue 是所有相关 pod 中资源指标当前的平均值（数量）。

        - **status.currentMetrics.containerResource.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value 是指标的当前值（数量）。

      - **status.currentMetrics.containerResource.name** (string)，必选

        name 是伸缩资源的名称。

    - **status.currentMetrics.external** (ExternalMetricStatus)

      external 是指不与任何 Kubernetes 对象关联的全局指标。它允许根据集群外运行的组件的信息（例如，云消息传递服务中的队列长度，或集群外运行的负载平衡器的 QPS）进行自动伸缩。

      <a name="ExternalMetricStatus"></a>

      *ExternalMetricStatus 表示与任何 Kubernetes 对象无关的全局指标的当前值。*

      - **status.currentMetrics.external.current** (MetricValueStatus)，必选

        current 是给定指标的当前值。

        <a name="MetricValueStatus"></a>

        *MetricValueStatus 表示指标的当前值。*

        - **status.currentMetrics.external.current.averageUtilization** (int32)

          currentAverageUtilization 是所有相关 pod 中资源指标当前的平均值，表示为 pod 请求的资源值的百分比。

        - **status.currentMetrics.external.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue 是所有相关 pod 中资源指标当前的平均值。

        - **status.currentMetrics.external.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value 是指标的当前值（数量）。

      - **status.currentMetrics.external.metric** (MetricIdentifier)，必选

        metric 通过名称和选择器标识目标指标。

        <a name="MetricIdentifier"></a>

        *MetricIdentifier 定义指标的名称和可选的选择器。*

        - **status.currentMetrics.external.metric.name** (string)，必选

          name 是给定指标的名称。

        - **status.currentMetrics.external.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

          selector 是给定指标的标准 Kubernetes 标签选择器的字符串编码形式。如果设置，将作为附加参数传递给指标服务器，以实现更具体的指标范围。如果未设置，只使用 metricName 收集指标。

    - **status.currentMetrics.object** (ObjectMetricStatus)

      object 是描述单个 Kubernetes 对象的指标（例如，Ingress 对象每秒的点击量）。

      <a name="ObjectMetricStatus"></a>

      *ObjectMetricStatus 是 Kubernetes 对象指标（例如，Ingress对象每秒的点击量）的当前值。*

      - **status.currentMetrics.object.current** (MetricValueStatus)，必选

        current 是给定指标的当前值。

        <a name="MetricValueStatus"></a>

        *MetricValueStatus 表示指标的当前值。*

        - **status.currentMetrics.object.current.averageUtilization** (int32)

          currentAverageUtilization 是所有相关 pod 中资源指标当前的平均值，表示为 pod 请求的资源值的百分比。

        - **status.currentMetrics.object.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue 是所有相关 pod 中资源指标当前的平均值。

        - **status.currentMetrics.object.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value 是指标的当前值（数量）。

      - **status.currentMetrics.object.describedObject** (CrossVersionObjectReference)，必选

        DescribedObject 是对象的描述，如类别、名称和 apiVersion。

        <a name="CrossVersionObjectReference"></a>

        *CrossVersionObjectReference 包含可以识别被引用资源的足够信息。*

        - **status.currentMetrics.object.describedObject.kind** (string)，必选

          kind 表示引用资源的类别。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

        - **status.currentMetrics.object.describedObject.name** (string)，必选

          name 表示引用资源的名称。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

        - **status.currentMetrics.object.describedObject.apiVersion** (string)

          apiVersion 是引用资源的API版本。

      - **status.currentMetrics.object.metric** (MetricIdentifier)，必选

        metric 通过名称和选择器标识目标指标。

        <a name="MetricIdentifier"></a>

        *MetricIdentifier 定义指标的名称和可选的选择器。*

        - **status.currentMetrics.object.metric.name** (string)，必选

          name 是给定指标的名称。

        - **status.currentMetrics.object.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

          selector 是给定指标的标准 Kubernetes 标签选择器的字符串编码形式。如果设置，将作为附加参数传递给指标服务器，以实现更具体的指标范围。如果未设置，只使用 metricName 收集指标。

    - **status.currentMetrics.pods** (PodsMetricStatus)

      pods 是指描述当前伸缩目标中每个 pod 的指标（例如，每秒处理的事务）。在与目标值进行比较之前，会将所有指标值进行平均。

      <a name="PodsMetricStatus"></a>

      *PodsMetricStatus 表示描述当前规模目标（例如，每秒处理的事务）中每个 pod 的指标的当前值（例如，每秒处理的事务）。*

      - **status.currentMetrics.pods.current** (MetricValueStatus)，必选

        current 是给定指标的当前值。

        <a name="MetricValueStatus"></a>

        *MetricValueStatus 表示指标的当前值。*

        - **status.currentMetrics.pods.current.averageUtilization** (int32)

          currentAverageUtilization 是所有相关 pod 中资源指标当前的平均值，表示为 pod 请求的资源值的百分比。

        - **status.currentMetrics.pods.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue 是所有相关 pod 中资源指标当前的平均值。

        - **status.currentMetrics.pods.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value 是指标的当前值（数量）。

      - **status.currentMetrics.pods.metric** (MetricIdentifier)，必选

        metric 通过名称和选择器标识目标指标。

        <a name="MetricIdentifier"></a>

        *MetricIdentifier 定义指标的名称和可选的选择器。*

        - **status.currentMetrics.pods.metric.name** (string)，必选

          name 是给定指标的名称。

        - **status.currentMetrics.pods.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

          selector 是给定指标的标准 Kubernetes 标签选择器的字符串编码形式。如果设置，将作为附加参数传递给指标服务器，以实现更具体的指标范围。如果未设置，只使用 metricName 收集指标。

    - **status.currentMetrics.resource** (ResourceMetricStatus)

      resource 表示 Kubernetes 已知的资源指标（如 request 与 limit），用于描述当前伸缩目标（如 CPU 或内存）中每个 pod 的资源使用情况。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。

      <a name="ResourceMetricStatus"></a>

      *ResourceMetricStatus 表示 Kubernetes 已知的资源指标的当前值，如 request 与 limit，描述当前伸缩目标（如 CPU 或内存）中每个 pod 的资源使用情况。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。*

      - **status.currentMetrics.resource.current** (MetricValueStatus)，必选

        current 是给定指标的当前值。

        <a name="MetricValueStatus"></a>

        *MetricValueStatus 表示指标的当前值。*

        - **status.currentMetrics.resource.current.averageUtilization** (int32)

          currentAverageUtilization 是所有相关 pod 中资源指标当前的平均值，表示为 pod 请求的资源值的百分比。

        - **status.currentMetrics.resource.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue 是所有相关 pod 中资源指标当前的平均值。

        - **status.currentMetrics.resource.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value 是指标的当前值（数量）。

      - **status.currentMetrics.resource.name** (string)，必选

        name 是伸缩资源的名称。

  - **status.currentReplicas** (int32)

    currentReplicas 是指从自动伸缩器上次计算后，其所管理的 pod 当前的副本数。

  - **status.lastScaleTime** (Time)

    lastScaleTime 是 HorizontalPodAutoscaler 最后一次伸缩 pod 的时间，自动伸缩器用此控制 pod 数量更改的频率。

    <a name="Time"></a>

    *Time 是 time.Time 的包装器，它支持对 YAML 和 JSON 的正确编组。time 包的许多工厂方法提供了包装器。*

  - **status.observedGeneration** (int64)

    observedGeneration 是此自动伸缩器观察到的最新一代。

## FederatedHPASpec 

FederatedHPASpec 描述了 FederatedHPA 的所需功能。

<hr/>

- **maxReplicas** (int32)，必选

  MaxReplicas 是自动伸缩器可增加的副本量的上限。它不能小于 minReplicas。

- **scaleTargetRef** (CrossVersionObjectReference)，必选

  ScaleTargetRef 指向要伸缩的目标资源，用于收集 pod的指标，以及实际更改副本的数量。

  <a name="CrossVersionObjectReference"></a>

  *CrossVersionObjectReference 包含可以识别被引用资源的足够信息。*

  - **scaleTargetRef.kind** (string)，必选

    kind 表示引用资源的类别。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

  - **scaleTargetRef.name** (string)，必选

    name 表示引用资源的名称。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

  - **scaleTargetRef.apiVersion** (string)

    apiVersion 是引用资源的API版本。

- **behavior** (HorizontalPodAutoscalerBehavior)

  Behavior 表示目标的伸缩行为（scaleUp 或 scaleDown）。如果未设置，则使用默认的 HPAScalingRules 完成伸缩。

  <a name="HorizontalPodAutoscalerBehavior"></a>

  *HorizontalPodAutoscalerBehavior 表示目标的伸缩行为（scaleUp 或 scaleDown）。*

  - **behavior.scaleDown** (HPAScalingRules)

    scaleDown 是用于缩容的伸缩策略。如果未设置，默认允许伸缩至 minReplicas，稳定窗口为 300 秒（建议为 300 秒）。

    <a name="HPAScalingRules"></a>

    *HPAScalingRules 表示一个方向伸缩行为。在根据 HPA 的指标计算 DesiredReplicas 后应用这些规则。可以通过指定伸缩策略来限制伸缩速度，也可以通过指定稳定窗口来防止抖动，这样就不会立即设置副本的数量，而是选择稳定窗口中最安全的值。*

    - **behavior.scaleDown.policies** ([]HPAScalingPolicy)

      *Atomic：将在合并过程中被替换掉。*
      
      policies 罗列伸缩过程中可用的伸缩策略。必须至少指定一条策略，否则 HPAScalingRules 将被视为无效而丢弃。

      <a name="HPAScalingPolicy"></a>

      *HPAScalingPolicy 表示单条策略，在指定的过去间隔内取值必须为 true。*

      - **behavior.scaleDown.policies.periodSeconds** (int32)，必选

        periodSeconds 表示策略取值为 true 的时间窗口。periodSeconds 必须大于 0，且小于或等于 1800 秒（30 分钟）。

      - **behavior.scaleDown.policies.type** (string)，必选

        type 用于指定伸缩策略。

      - **behavior.scaleDown.policies.value** (int32)，必选

        value 包含策略允许的变化数量。取值必须大于 0。

    - **behavior.scaleDown.selectPolicy** (string)

      selectPolicy 用于指定应使用的策略。如果未设置，则使用默认值 Max。

    - **behavior.scaleDown.stabilizationWindowSeconds** (int32)

      stabilizationWindowSeconds 是指伸缩时应考虑之前建议的秒数。取值必须大于等于 0 且小于等于 3600 秒（即一个小时）。如果未设置，请使用默认值：- 扩容：0（不设置稳定窗口）。- 缩容：300（即稳定窗口为 300 秒）。

  - **behavior.scaleUp** (HPAScalingRules)

    scaleUp 是用于扩容的伸缩策略。如果未设置，默认值为以下中较高的值：
      *每 60 秒增加不超过 4 个pod
      *每 60 秒 pod 数量翻倍
    不使用稳定窗口。

    <a name="HPAScalingRules"></a>

    *HPAScalingRules 表示一个方向的伸缩行为。在根据 HPA 的指标计算 DesiredReplicas 后应用这些规则。可以通过指定伸缩策略来限制伸缩速度，也可以通过指定稳定窗口来防止抖动，这样就不会立即设置副本的数量，而是选择稳定窗口中最安全的值。*

    - **behavior.scaleUp.policies** ([]HPAScalingPolicy)

      *Atomic：将在合并过程中被替换掉。*
      
      policies 罗列伸缩过程中可用的伸缩策略。必须至少指定一条策略，否则 HPAScalingRules 将被视为无效而丢弃。

      <a name="HPAScalingPolicy"></a>

      *HPAScalingPolicy 表示单条策略，在指定的过去间隔内取值必须为 true。*

      - **behavior.scaleUp.policies.periodSeconds** (int32)，必选

        periodSeconds 表示策略取值为 true 的时间窗口。periodSeconds 必须大于 0，且小于或等于 1800 秒（即30 分钟）。

      - **behavior.scaleUp.policies.type** (string)，必选

        type 用于指定伸缩策略。

      - **behavior.scaleUp.policies.value** (int32)，必选

        value 包含策略允许的伸缩数量。取值必须大于 0。

    - **behavior.scaleUp.selectPolicy** (string)

      selectPolicy 用于指定应使用的策略。如果未设置，则使用默认值 Max。

    - **behavior.scaleUp.stabilizationWindowSeconds** (int32)

      stabilizationWindowSeconds 是指伸缩时应考虑之前建议的秒数。取值必须大于等于 0 且小于等于 3600 秒（即一个小时）。如果未设置，请使用默认值：- 扩容：0（不设置稳定窗口）。- 缩容：300（即稳定窗口为 300 秒）。

- **metrics** ([]MetricSpec)

  Metrics 包含用于计算所需副本数的规范（将使用所有指标中的最大副本数）。所需的副本数是目标值和当前值之间的比率与当前 pod 数的乘积。因此，指标必须随 pod 数的增加而减少，反之亦然。有关每种类型的指标源详细信息，参见各个指标源类型。如果未设置，默认指标为平均 CPU 利用率的 80%。

  <a name="MetricSpec"></a>

  *MetricSpec 是如何基于单个指标进行伸缩的规范（每次只应设置* *`type`* *和一个其他匹配字段）。*

  - **metrics.type** (string)，必选

    type 表示指标源的类别。指标源类别可以是 ContainerResource、External、Object、Pods 或 Resource，每个类别映射对象中的一个对应字段。注意：ContainerResource 只有在特性开关 HPAContainerMetrics 启用时可用。

  - **metrics.containerResource** (ContainerResourceMetricSource)

    containerResource 表示 Kubernetes 已知的资源指标（如 request 与 limit），用于描述当前伸缩目标（如 CPU 或内存）中每个 pod 中单个容器的资源使用情况。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。这是一个 alpha 特性，可以通过 HPAContainerMetrics 特性标志启用。

    <a name="ContainerResourceMetricSource"></a>

    *ContainerResourceMetricSource 表明在 Kubernetes 已知资源指标（如 request 与 limit）的基础上进行伸缩的方式，该指标描述当前伸缩目标（例如CPU或内存）中每个Pod的资源使用情况。在与目标值进行比较之前，会将所有指标值进行平均。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。只应设置一种 “target” 类别。*

    - **metrics.containerResource.container** (string)，必选

      container 是伸缩目标的 pod 中容器的名称。

    - **metrics.containerResource.name** (string)，必选

      name 是伸缩资源的名称。

    - **metrics.containerResource.target** (MetricTarget)，必选

      target 是给定指标的目标值

      <a name="MetricTarget"></a>

      *MetricTarget 定义特定指标的目标值、平均值或平均利用率。*

      - **metrics.containerResource.target.type** (string)，必选

        type 表示指标类型：利用率（Utilization）、值（Value）和平均值（AverageValue）。

      - **metrics.containerResource.target.averageUtilization** (int32)

        averageUtilization 是所有相关 pod 中资源指标均值的目标值，表示为 pod 资源请求值的百分比。目前仅对 Resource 指标源类别有效。

      - **metrics.containerResource.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue 是所有相关 pod 中资源指标均值的目标值 （数量）。

      - **metrics.containerResource.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value 是指标的目标值（数量）。

  - **metrics.external** (ExternalMetricSource)

    external 是指不与任何 Kubernetes 对象关联的全局指标。它允许根据集群外运行的组件的信息（例如，云消息传递服务中的队列长度，或集群外运行的负载平衡器的 QPS）进行自动伸缩。

    <a name="ExternalMetricSource"></a>

    *ExternalMetricSource 表示基于任何与 Kubernetes 对象无关的指标（例如，云消息传递服务中的队列长度，或集群外的负载平衡器的QPS）进行伸缩的方式。*

    - **metrics.external.metric** (MetricIdentifier)，必选

      metric 通过名称和选择器标识目标指标。

      <a name="MetricIdentifier"></a>

      *MetricIdentifier 定义指标的名称和可选的选择器。*

      - **metrics.external.metric.name** (string)，必选

        name 是给定指标的名称。

      - **metrics.external.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        selector 是给定指标的标准 Kubernetes 标签选择器的字符串编码形式。如果设置，将作为附加参数传递给指标服务器，以实现更具体的指标范围。如果未设置，只使用 metricName 收集指标。

    - **metrics.external.target** (MetricTarget)，必选

      target 是给定指标的目标值。

      <a name="MetricTarget"></a>

      *MetricTarget 定义特定指标的目标值、平均值或平均利用率。*

      - **metrics.external.target.type** (string)，必选

        type 表示指标类型：利用率（Utilization）、值（Value）和平均值（AverageValue）。

      - **metrics.external.target.averageUtilization** (int32)

        averageUtilization 是所有相关 pod 中资源指标均值的目标值，表示为 pod 资源请求值的百分比。目前仅对 Resource 指标源类别有效。

      - **metrics.external.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue 是所有相关 pod 中资源指标均值的目标值 （数量）。

      - **metrics.external.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value 是指标的目标值（数量）。

  - **metrics.object** (ObjectMetricSource)

    object 是描述单个 Kubernetes 对象的指标（例如，Ingress 对象每秒的点击量）。

    <a name="ObjectMetricSource"></a>

    *ObjectMetricSource 是 Kubernetes 对象（例如，Ingress对象每秒的点击量）指标的伸缩方式。*

    - **metrics.object.describedObject** (CrossVersionObjectReference)，必选

      DescribedObject 是对象的描述，如类别、名称和 apiVersion。

      <a name="CrossVersionObjectReference"></a>

      *CrossVersionObjectReference 包含可以识别被引用资源的足够信息。*

      - **metrics.object.describedObject.kind** (string)，必选

        kind 表示被引用资源的类别。更多信息，请浏览 https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

      - **metrics.object.describedObject.name** (string)，必选

        name 表示被引用资源的名称。更多信息，请浏览 https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

      - **metrics.object.describedObject.apiVersion** (string)

        apiVersion 是被引用资源的API版本。

    - **metrics.object.metric** (MetricIdentifier)，必选

      metric 通过名称和选择器标识目标指标。

      <a name="MetricIdentifier"></a>

      *MetricIdentifier 定义指标的名称和可选的选择器。*

      - **metrics.object.metric.name** (string)，必选

        name 是给定指标的名称。

      - **metrics.object.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        selector 是给定指标的标准 Kubernetes 标签选择器的字符串编码形式。如果设置，将作为附加参数传递给指标服务器，以实现更具体的指标范围。如果未设置，只使用 metricName 收集指标。

    - **metrics.object.target** (MetricTarget)，必选

      target 是给定指标的目标值。

      <a name="MetricTarget"></a>

      *MetricTarget 定义特定指标的目标值、平均值或平均利用率。*

      - **metrics.object.target.type** (string)，必选

        type 表示指标类型：利用率（Utilization）、值（Value）和平均值（AverageValue）。

      - **metrics.object.target.averageUtilization** (int32)

        averageUtilization 是所有相关 pod 中资源指标均值的目标值，表示为 pod 资源请求值的百分比。目前仅对 Resource 指标源类别有效。

      - **metrics.object.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue 是所有相关 pod 中资源指标均值的目标值 （数量）。

      - **metrics.object.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value 是指标的目标值（数量）。

  - **metrics.pods** (PodsMetricSource)

    pods 是指描述当前伸缩目标（例如，每秒处理的事务）中每个 pod 的指标。在与目标值进行比较之前，会将所有指标值进行平均。

    <a name="PodsMetricSource"></a>

    *PodsMetricSource 表示根据指标进行伸缩的方式，该指标描述当前伸缩目标（例如，每秒处理的事务）中每个pod的资源情况。在与目标值进行比较之前，会将所有指标值进行平均。*

    - **metrics.pods.metric** (MetricIdentifier)，必选

      metric 通过名称和选择器标识目标指标。

      <a name="MetricIdentifier"></a>

      *MetricIdentifier 定义指标的名称和可选的选择器。*

      - **metrics.pods.metric.name** (string)，必选

        name 是给定指标的名称。

      - **metrics.pods.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        selector 是给定指标的标准 Kubernetes 标签选择器的字符串编码形式。如果设置，将作为附加参数传递给指标服务器，以实现更具体的指标范围。如果未设置，只使用 metricName 收集指标。

    - **metrics.pods.target** (MetricTarget)，必选

      target 是给定指标的目标值。

      <a name="MetricTarget"></a>

      *MetricTarget 定义特定指标的目标值、平均值或平均利用率。*

      - **metrics.pods.target.type** (string)，必选

        type 表示指标类型：利用率（Utilization）、值（Value）和平均值（AverageValue）。

      - **metrics.pods.target.averageUtilization** (int32)

        averageUtilization 是所有相关 pod 中资源指标均值的目标值，表示为 pod 资源请求值的百分比。目前仅对 Resource 指标源类别有效。

      - **metrics.pods.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue 是所有相关 pod 中资源指标均值的目标值 （数量）。

      - **metrics.pods.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value 是指标的目标值（数量）。

  - **metrics.resource** (ResourceMetricSource)

    resource 表示 Kubernetes 已知的资源指标（如 request 与 limit），用于描述当前伸缩目标（如 CPU 或内存）中每个 pod 的资源使用情况。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。

    <a name="ResourceMetricSource"></a>

    *ResourceMetricSource 表明在 Kubernetes 已知资源指标（如 request 与 limit）的基础上进行伸缩的方式，该指标描述当前伸缩目标（例如 CPU 或内存）中每个Pod的资源使用情况。在与目标值进行比较之前，会将所有指标值进行平均。这类指标是 Kubernetes 内置指标，除了使用 Pods 源的 pod 粒度的正常指标以外，还有一些特殊的伸缩选项。只应设置一种 target 类别。*

    - **metrics.resource.name** (string)，必选

      name 是伸缩资源的名称。

    - **metrics.resource.target** (MetricTarget)，必选

      target 是给定指标的目标值。

      <a name="MetricTarget"></a>

      *MetricTarget 定义特定指标的目标值、平均值或平均利用率。*

      - **metrics.resource.target.type** (string)，必选

        type 表示指标类型：利用率（Utilization）、值（Value）和平均值（AverageValue）。

      - **metrics.resource.target.averageUtilization** (int32)

        averageUtilization 是所有相关 pod 中资源指标均值的目标值，表示为 pod 资源请求值的百分比。目前仅对 Resource 指标源类别有效。

      - **metrics.resource.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue 是所有相关 pod 中资源指标均值的目标值 （数量）。

      - **metrics.resource.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value 是指标的目标值（数量）。

- **minReplicas** (int32)

  MinReplicas 是自动伸缩器可减少的副本量的下限。默认值为1。

## FederatedHPAList 

FederatedHPAList 罗列 FederatedHPA。

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: FederatedHPAList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa))，必选

## 操作

<hr/>

### `get`：查询指定的 FederatedHPA

#### HTTP请求

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedHPA的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

### `get`：查询指定 FederatedHPA 的状态

#### HTTP请求

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas/{name}/status

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedHPA 的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

### `list`：查询指定命名空间内的所有 FederatedHPA

#### HTTP请求

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

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

200 ([FederatedHPAList](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpalist)): OK

### `list`：查询所有 FederatedHPA

#### HTTP请求

GET /apis/autoscaling.karmada.io/v1alpha1/federatedhpas

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

200 ([FederatedHPAList](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpalist)): OK

### `create`：创建一条 FederatedHPA

#### HTTP请求

POST /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas

#### 参数

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

202 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Accepted

### `update`：更新指定的 FederatedHPA

#### HTTP请求

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedHPA的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `update`：更新指定 FederatedHPA 的状态

#### HTTP请求

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas/{name}/status

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedHPA的名称

- **namespace**（*路径参数*）：string，必选

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)，必选

  

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `patch`：更新指定 FederatedHPA 的部分信息

#### HTTP请求

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedHPA的名称

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

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `patch`：更新指定 FederatedHPA 状态的部分信息

#### HTTP请求

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas/{name}/status

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedHPA 的名称

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

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `delete`：删除一条 FederatedHPA

#### HTTP请求

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas/{name}

#### 参数

- **名称**（*路径参数*）：string，必选

  FederatedHPA 的名称

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

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection`：删除指定命名空间内的所有 FederatedHPA

#### HTTP请求

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/{namespace}/federatedhpas

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

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status)): OK
