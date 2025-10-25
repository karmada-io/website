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

FederatedHPA is centralized HPA that can aggregate the metrics in multiple clusters. When the system load increases, it will query the metrics from multiple clusters and scales up the replicas. When the system load decreases, it will query the metrics from multiple clusters and scales down the replicas. After the replicas are scaled up/down, karmada-scheduler will schedule the replicas based on the policy.

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: FederatedHPA

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([FederatedHPASpec](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpaspec)), required

  Spec is the specification of the FederatedHPA.

- **status** (HorizontalPodAutoscalerStatus)

  Status is the current status of the FederatedHPA.

  <a name="HorizontalPodAutoscalerStatus"></a>

  *HorizontalPodAutoscalerStatus describes the current status of a horizontal pod autoscaler.*

  - **status.desiredReplicas** (int32), required

    desiredReplicas is the desired number of replicas of pods managed by this autoscaler, as last calculated by the autoscaler.

  - **status.conditions** ([]HorizontalPodAutoscalerCondition)

    *Patch strategy: merge on key `type`*
    
    *Map: unique values on key type will be kept during a merge*
    
    conditions is the set of conditions required for this autoscaler to scale its target, and indicates whether or not those conditions are met.

    <a name="HorizontalPodAutoscalerCondition"></a>

    *HorizontalPodAutoscalerCondition describes the state of a HorizontalPodAutoscaler at a certain point.*

    - **status.conditions.status** (string), required

      status is the status of the condition (True, False, Unknown)

    - **status.conditions.type** (string), required

      type describes the current condition

    - **status.conditions.lastTransitionTime** (Time)

      lastTransitionTime is the last time the condition transitioned from one status to another

      <a name="Time"></a>

      *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

    - **status.conditions.message** (string)

      message is a human-readable explanation containing details about the transition

    - **status.conditions.reason** (string)

      reason is the reason for the condition's last transition.

  - **status.currentMetrics** ([]MetricStatus)

    *Atomic: will be replaced during a merge*
    
    currentMetrics is the last read state of the metrics used by this autoscaler.

    <a name="MetricStatus"></a>

    *MetricStatus describes the last-read state of a single metric.*

    - **status.currentMetrics.type** (string), required

      type is the type of metric source.  It will be one of "ContainerResource", "External", "Object", "Pods" or "Resource", each corresponds to a matching field in the object.

    - **status.currentMetrics.containerResource** (ContainerResourceMetricStatus)

      container resource refers to a resource metric (such as those specified in requests and limits) known to Kubernetes describing a single container in each pod in the current scale target (e.g. CPU or memory). Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.

      <a name="ContainerResourceMetricStatus"></a>

      *ContainerResourceMetricStatus indicates the current value of a resource metric known to Kubernetes, as specified in requests and limits, describing a single container in each pod in the current scale target (e.g. CPU or memory).  Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.*

      - **status.currentMetrics.containerResource.container** (string), required

        container is the name of the container in the pods of the scaling target

      - **status.currentMetrics.containerResource.current** (MetricValueStatus), required

        current contains the current value for the given metric

        <a name="MetricValueStatus"></a>

        *MetricValueStatus holds the current value for a metric*

        - **status.currentMetrics.containerResource.current.averageUtilization** (int32)

          currentAverageUtilization is the current value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods.

        - **status.currentMetrics.containerResource.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue is the current value of the average of the metric across all relevant pods (as a quantity)

        - **status.currentMetrics.containerResource.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value is the current value of the metric (as a quantity).

      - **status.currentMetrics.containerResource.name** (string), required

        name is the name of the resource in question.

    - **status.currentMetrics.external** (ExternalMetricStatus)

      external refers to a global metric that is not associated with any Kubernetes object. It allows autoscaling based on information coming from components running outside of cluster (for example length of queue in cloud messaging service, or QPS from loadbalancer running outside of cluster).

      <a name="ExternalMetricStatus"></a>

      *ExternalMetricStatus indicates the current value of a global metric not associated with any Kubernetes object.*

      - **status.currentMetrics.external.current** (MetricValueStatus), required

        current contains the current value for the given metric

        <a name="MetricValueStatus"></a>

        *MetricValueStatus holds the current value for a metric*

        - **status.currentMetrics.external.current.averageUtilization** (int32)

          currentAverageUtilization is the current value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods.

        - **status.currentMetrics.external.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue is the current value of the average of the metric across all relevant pods (as a quantity)

        - **status.currentMetrics.external.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value is the current value of the metric (as a quantity).

      - **status.currentMetrics.external.metric** (MetricIdentifier), required

        metric identifies the target metric by name and selector

        <a name="MetricIdentifier"></a>

        *MetricIdentifier defines the name and optionally selector for a metric*

        - **status.currentMetrics.external.metric.name** (string), required

          name is the name of the given metric

        - **status.currentMetrics.external.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

          selector is the string-encoded form of a standard kubernetes label selector for the given metric When set, it is passed as an additional parameter to the metrics server for more specific metrics scoping. When unset, just the metricName will be used to gather metrics.

    - **status.currentMetrics.object** (ObjectMetricStatus)

      object refers to a metric describing a single kubernetes object (for example, hits-per-second on an Ingress object).

      <a name="ObjectMetricStatus"></a>

      *ObjectMetricStatus indicates the current value of a metric describing a kubernetes object (for example, hits-per-second on an Ingress object).*

      - **status.currentMetrics.object.current** (MetricValueStatus), required

        current contains the current value for the given metric

        <a name="MetricValueStatus"></a>

        *MetricValueStatus holds the current value for a metric*

        - **status.currentMetrics.object.current.averageUtilization** (int32)

          currentAverageUtilization is the current value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods.

        - **status.currentMetrics.object.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue is the current value of the average of the metric across all relevant pods (as a quantity)

        - **status.currentMetrics.object.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value is the current value of the metric (as a quantity).

      - **status.currentMetrics.object.describedObject** (CrossVersionObjectReference), required

        DescribedObject specifies the descriptions of a object,such as kind,name apiVersion

        <a name="CrossVersionObjectReference"></a>

        *CrossVersionObjectReference contains enough information to let you identify the referred resource.*

        - **status.currentMetrics.object.describedObject.kind** (string), required

          kind is the kind of the referent; More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

        - **status.currentMetrics.object.describedObject.name** (string), required

          name is the name of the referent; More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

        - **status.currentMetrics.object.describedObject.apiVersion** (string)

          apiVersion is the API version of the referent

      - **status.currentMetrics.object.metric** (MetricIdentifier), required

        metric identifies the target metric by name and selector

        <a name="MetricIdentifier"></a>

        *MetricIdentifier defines the name and optionally selector for a metric*

        - **status.currentMetrics.object.metric.name** (string), required

          name is the name of the given metric

        - **status.currentMetrics.object.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

          selector is the string-encoded form of a standard kubernetes label selector for the given metric When set, it is passed as an additional parameter to the metrics server for more specific metrics scoping. When unset, just the metricName will be used to gather metrics.

    - **status.currentMetrics.pods** (PodsMetricStatus)

      pods refers to a metric describing each pod in the current scale target (for example, transactions-processed-per-second).  The values will be averaged together before being compared to the target value.

      <a name="PodsMetricStatus"></a>

      *PodsMetricStatus indicates the current value of a metric describing each pod in the current scale target (for example, transactions-processed-per-second).*

      - **status.currentMetrics.pods.current** (MetricValueStatus), required

        current contains the current value for the given metric

        <a name="MetricValueStatus"></a>

        *MetricValueStatus holds the current value for a metric*

        - **status.currentMetrics.pods.current.averageUtilization** (int32)

          currentAverageUtilization is the current value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods.

        - **status.currentMetrics.pods.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue is the current value of the average of the metric across all relevant pods (as a quantity)

        - **status.currentMetrics.pods.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value is the current value of the metric (as a quantity).

      - **status.currentMetrics.pods.metric** (MetricIdentifier), required

        metric identifies the target metric by name and selector

        <a name="MetricIdentifier"></a>

        *MetricIdentifier defines the name and optionally selector for a metric*

        - **status.currentMetrics.pods.metric.name** (string), required

          name is the name of the given metric

        - **status.currentMetrics.pods.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

          selector is the string-encoded form of a standard kubernetes label selector for the given metric When set, it is passed as an additional parameter to the metrics server for more specific metrics scoping. When unset, just the metricName will be used to gather metrics.

    - **status.currentMetrics.resource** (ResourceMetricStatus)

      resource refers to a resource metric (such as those specified in requests and limits) known to Kubernetes describing each pod in the current scale target (e.g. CPU or memory). Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.

      <a name="ResourceMetricStatus"></a>

      *ResourceMetricStatus indicates the current value of a resource metric known to Kubernetes, as specified in requests and limits, describing each pod in the current scale target (e.g. CPU or memory).  Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.*

      - **status.currentMetrics.resource.current** (MetricValueStatus), required

        current contains the current value for the given metric

        <a name="MetricValueStatus"></a>

        *MetricValueStatus holds the current value for a metric*

        - **status.currentMetrics.resource.current.averageUtilization** (int32)

          currentAverageUtilization is the current value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods.

        - **status.currentMetrics.resource.current.averageValue** ([Quantity](../common-definitions/quantity#quantity))

          averageValue is the current value of the average of the metric across all relevant pods (as a quantity)

        - **status.currentMetrics.resource.current.value** ([Quantity](../common-definitions/quantity#quantity))

          value is the current value of the metric (as a quantity).

      - **status.currentMetrics.resource.name** (string), required

        name is the name of the resource in question.

  - **status.currentReplicas** (int32)

    currentReplicas is current number of replicas of pods managed by this autoscaler, as last seen by the autoscaler.

  - **status.lastScaleTime** (Time)

    lastScaleTime is the last time the HorizontalPodAutoscaler scaled the number of pods, used by the autoscaler to control how often the number of pods is changed.

    <a name="Time"></a>

    *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

  - **status.observedGeneration** (int64)

    observedGeneration is the most recent generation observed by this autoscaler.

## FederatedHPASpec 

FederatedHPASpec describes the desired functionality of the FederatedHPA.

<hr/>

- **maxReplicas** (int32), required

  MaxReplicas is the upper limit for the number of replicas to which the autoscaler can scale up. It cannot be less that minReplicas.

- **scaleTargetRef** (CrossVersionObjectReference), required

  ScaleTargetRef points to the target resource to scale, and is used to the pods for which metrics should be collected, as well as to actually change the replica count.

  <a name="CrossVersionObjectReference"></a>

  *CrossVersionObjectReference contains enough information to let you identify the referred resource.*

  - **scaleTargetRef.kind** (string), required

    kind is the kind of the referent; More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

  - **scaleTargetRef.name** (string), required

    name is the name of the referent; More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

  - **scaleTargetRef.apiVersion** (string)

    apiVersion is the API version of the referent

- **behavior** (HorizontalPodAutoscalerBehavior)

  Behavior configures the scaling behavior of the target in both Up and Down directions (scaleUp and scaleDown fields respectively). If not set, the default HPAScalingRules for scale up and scale down are used.

  <a name="HorizontalPodAutoscalerBehavior"></a>

  *HorizontalPodAutoscalerBehavior configures the scaling behavior of the target in both Up and Down directions (scaleUp and scaleDown fields respectively).*

  - **behavior.scaleDown** (HPAScalingRules)

    scaleDown is scaling policy for scaling Down. If not set, the default value is to allow to scale down to minReplicas pods, with a 300 second stabilization window (i.e., the highest recommendation for the last 300sec is used).

    <a name="HPAScalingRules"></a>

    *HPAScalingRules configures the scaling behavior for one direction. These Rules are applied after calculating DesiredReplicas from metrics for the HPA. They can limit the scaling velocity by specifying scaling policies. They can prevent flapping by specifying the stabilization window, so that the number of replicas is not set instantly, instead, the safest value from the stabilization window is chosen.*

    - **behavior.scaleDown.policies** ([]HPAScalingPolicy)

      *Atomic: will be replaced during a merge*
      
      policies is a list of potential scaling polices which can be used during scaling. At least one policy must be specified, otherwise the HPAScalingRules will be discarded as invalid

      <a name="HPAScalingPolicy"></a>

      *HPAScalingPolicy is a single policy which must hold true for a specified past interval.*

      - **behavior.scaleDown.policies.periodSeconds** (int32), required

        periodSeconds specifies the window of time for which the policy should hold true. PeriodSeconds must be greater than zero and less than or equal to 1800 (30 min).

      - **behavior.scaleDown.policies.type** (string), required

        type is used to specify the scaling policy.

      - **behavior.scaleDown.policies.value** (int32), required

        value contains the amount of change which is permitted by the policy. It must be greater than zero

    - **behavior.scaleDown.selectPolicy** (string)

      selectPolicy is used to specify which policy should be used. If not set, the default value Max is used.

    - **behavior.scaleDown.stabilizationWindowSeconds** (int32)

      stabilizationWindowSeconds is the number of seconds for which past recommendations should be considered while scaling up or scaling down. StabilizationWindowSeconds must be greater than or equal to zero and less than or equal to 3600 (one hour). If not set, use the default values: - For scale up: 0 (i.e. no stabilization is done). - For scale down: 300 (i.e. the stabilization window is 300 seconds long).

  - **behavior.scaleUp** (HPAScalingRules)

    scaleUp is scaling policy for scaling Up. If not set, the default value is the higher of:
      * increase no more than 4 pods per 60 seconds
      * double the number of pods per 60 seconds
    No stabilization is used.

    <a name="HPAScalingRules"></a>

    *HPAScalingRules configures the scaling behavior for one direction. These Rules are applied after calculating DesiredReplicas from metrics for the HPA. They can limit the scaling velocity by specifying scaling policies. They can prevent flapping by specifying the stabilization window, so that the number of replicas is not set instantly, instead, the safest value from the stabilization window is chosen.*

    - **behavior.scaleUp.policies** ([]HPAScalingPolicy)

      *Atomic: will be replaced during a merge*
      
      policies is a list of potential scaling polices which can be used during scaling. At least one policy must be specified, otherwise the HPAScalingRules will be discarded as invalid

      <a name="HPAScalingPolicy"></a>

      *HPAScalingPolicy is a single policy which must hold true for a specified past interval.*

      - **behavior.scaleUp.policies.periodSeconds** (int32), required

        periodSeconds specifies the window of time for which the policy should hold true. PeriodSeconds must be greater than zero and less than or equal to 1800 (30 min).

      - **behavior.scaleUp.policies.type** (string), required

        type is used to specify the scaling policy.

      - **behavior.scaleUp.policies.value** (int32), required

        value contains the amount of change which is permitted by the policy. It must be greater than zero

    - **behavior.scaleUp.selectPolicy** (string)

      selectPolicy is used to specify which policy should be used. If not set, the default value Max is used.

    - **behavior.scaleUp.stabilizationWindowSeconds** (int32)

      stabilizationWindowSeconds is the number of seconds for which past recommendations should be considered while scaling up or scaling down. StabilizationWindowSeconds must be greater than or equal to zero and less than or equal to 3600 (one hour). If not set, use the default values: - For scale up: 0 (i.e. no stabilization is done). - For scale down: 300 (i.e. the stabilization window is 300 seconds long).

- **metrics** ([]MetricSpec)

  Metrics contains the specifications for which to use to calculate the desired replica count (the maximum replica count across all metrics will be used). The desired replica count is calculated multiplying the ratio between the target value and the current value by the current number of pods. Ergo, metrics used must decrease as the pod count is increased, and vice-versa. See the individual metric source types for more information about how each type of metric must respond. If not set, the default metric will be set to 80% average CPU utilization.

  <a name="MetricSpec"></a>

  *MetricSpec specifies how to scale based on a single metric (only `type` and one other matching field should be set at once).*

  - **metrics.type** (string), required

    type is the type of metric source.  It should be one of "ContainerResource", "External", "Object", "Pods" or "Resource", each mapping to a matching field in the object.

  - **metrics.containerResource** (ContainerResourceMetricSource)

    containerResource refers to a resource metric (such as those specified in requests and limits) known to Kubernetes describing a single container in each pod of the current scale target (e.g. CPU or memory). Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.

    <a name="ContainerResourceMetricSource"></a>

    *ContainerResourceMetricSource indicates how to scale on a resource metric known to Kubernetes, as specified in requests and limits, describing each pod in the current scale target (e.g. CPU or memory).  The values will be averaged together before being compared to the target.  Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.  Only one "target" type should be set.*

    - **metrics.containerResource.container** (string), required

      container is the name of the container in the pods of the scaling target

    - **metrics.containerResource.name** (string), required

      name is the name of the resource in question.

    - **metrics.containerResource.target** (MetricTarget), required

      target specifies the target value for the given metric

      <a name="MetricTarget"></a>

      *MetricTarget defines the target value, average value, or average utilization of a specific metric*

      - **metrics.containerResource.target.type** (string), required

        type represents whether the metric type is Utilization, Value, or AverageValue

      - **metrics.containerResource.target.averageUtilization** (int32)

        averageUtilization is the target value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods. Currently only valid for Resource metric source type

      - **metrics.containerResource.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue is the target value of the average of the metric across all relevant pods (as a quantity)

      - **metrics.containerResource.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value is the target value of the metric (as a quantity).

  - **metrics.external** (ExternalMetricSource)

    external refers to a global metric that is not associated with any Kubernetes object. It allows autoscaling based on information coming from components running outside of cluster (for example length of queue in cloud messaging service, or QPS from loadbalancer running outside of cluster).

    <a name="ExternalMetricSource"></a>

    *ExternalMetricSource indicates how to scale on a metric not associated with any Kubernetes object (for example length of queue in cloud messaging service, or QPS from loadbalancer running outside of cluster).*

    - **metrics.external.metric** (MetricIdentifier), required

      metric identifies the target metric by name and selector

      <a name="MetricIdentifier"></a>

      *MetricIdentifier defines the name and optionally selector for a metric*

      - **metrics.external.metric.name** (string), required

        name is the name of the given metric

      - **metrics.external.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        selector is the string-encoded form of a standard kubernetes label selector for the given metric When set, it is passed as an additional parameter to the metrics server for more specific metrics scoping. When unset, just the metricName will be used to gather metrics.

    - **metrics.external.target** (MetricTarget), required

      target specifies the target value for the given metric

      <a name="MetricTarget"></a>

      *MetricTarget defines the target value, average value, or average utilization of a specific metric*

      - **metrics.external.target.type** (string), required

        type represents whether the metric type is Utilization, Value, or AverageValue

      - **metrics.external.target.averageUtilization** (int32)

        averageUtilization is the target value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods. Currently only valid for Resource metric source type

      - **metrics.external.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue is the target value of the average of the metric across all relevant pods (as a quantity)

      - **metrics.external.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value is the target value of the metric (as a quantity).

  - **metrics.object** (ObjectMetricSource)

    object refers to a metric describing a single kubernetes object (for example, hits-per-second on an Ingress object).

    <a name="ObjectMetricSource"></a>

    *ObjectMetricSource indicates how to scale on a metric describing a kubernetes object (for example, hits-per-second on an Ingress object).*

    - **metrics.object.describedObject** (CrossVersionObjectReference), required

      describedObject specifies the descriptions of a object,such as kind,name apiVersion

      <a name="CrossVersionObjectReference"></a>

      *CrossVersionObjectReference contains enough information to let you identify the referred resource.*

      - **metrics.object.describedObject.kind** (string), required

        kind is the kind of the referent; More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

      - **metrics.object.describedObject.name** (string), required

        name is the name of the referent; More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names

      - **metrics.object.describedObject.apiVersion** (string)

        apiVersion is the API version of the referent

    - **metrics.object.metric** (MetricIdentifier), required

      metric identifies the target metric by name and selector

      <a name="MetricIdentifier"></a>

      *MetricIdentifier defines the name and optionally selector for a metric*

      - **metrics.object.metric.name** (string), required

        name is the name of the given metric

      - **metrics.object.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        selector is the string-encoded form of a standard kubernetes label selector for the given metric When set, it is passed as an additional parameter to the metrics server for more specific metrics scoping. When unset, just the metricName will be used to gather metrics.

    - **metrics.object.target** (MetricTarget), required

      target specifies the target value for the given metric

      <a name="MetricTarget"></a>

      *MetricTarget defines the target value, average value, or average utilization of a specific metric*

      - **metrics.object.target.type** (string), required

        type represents whether the metric type is Utilization, Value, or AverageValue

      - **metrics.object.target.averageUtilization** (int32)

        averageUtilization is the target value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods. Currently only valid for Resource metric source type

      - **metrics.object.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue is the target value of the average of the metric across all relevant pods (as a quantity)

      - **metrics.object.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value is the target value of the metric (as a quantity).

  - **metrics.pods** (PodsMetricSource)

    pods refers to a metric describing each pod in the current scale target (for example, transactions-processed-per-second).  The values will be averaged together before being compared to the target value.

    <a name="PodsMetricSource"></a>

    *PodsMetricSource indicates how to scale on a metric describing each pod in the current scale target (for example, transactions-processed-per-second). The values will be averaged together before being compared to the target value.*

    - **metrics.pods.metric** (MetricIdentifier), required

      metric identifies the target metric by name and selector

      <a name="MetricIdentifier"></a>

      *MetricIdentifier defines the name and optionally selector for a metric*

      - **metrics.pods.metric.name** (string), required

        name is the name of the given metric

      - **metrics.pods.metric.selector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        selector is the string-encoded form of a standard kubernetes label selector for the given metric When set, it is passed as an additional parameter to the metrics server for more specific metrics scoping. When unset, just the metricName will be used to gather metrics.

    - **metrics.pods.target** (MetricTarget), required

      target specifies the target value for the given metric

      <a name="MetricTarget"></a>

      *MetricTarget defines the target value, average value, or average utilization of a specific metric*

      - **metrics.pods.target.type** (string), required

        type represents whether the metric type is Utilization, Value, or AverageValue

      - **metrics.pods.target.averageUtilization** (int32)

        averageUtilization is the target value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods. Currently only valid for Resource metric source type

      - **metrics.pods.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue is the target value of the average of the metric across all relevant pods (as a quantity)

      - **metrics.pods.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value is the target value of the metric (as a quantity).

  - **metrics.resource** (ResourceMetricSource)

    resource refers to a resource metric (such as those specified in requests and limits) known to Kubernetes describing each pod in the current scale target (e.g. CPU or memory). Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.

    <a name="ResourceMetricSource"></a>

    *ResourceMetricSource indicates how to scale on a resource metric known to Kubernetes, as specified in requests and limits, describing each pod in the current scale target (e.g. CPU or memory).  The values will be averaged together before being compared to the target.  Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source.  Only one "target" type should be set.*

    - **metrics.resource.name** (string), required

      name is the name of the resource in question.

    - **metrics.resource.target** (MetricTarget), required

      target specifies the target value for the given metric

      <a name="MetricTarget"></a>

      *MetricTarget defines the target value, average value, or average utilization of a specific metric*

      - **metrics.resource.target.type** (string), required

        type represents whether the metric type is Utilization, Value, or AverageValue

      - **metrics.resource.target.averageUtilization** (int32)

        averageUtilization is the target value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods. Currently only valid for Resource metric source type

      - **metrics.resource.target.averageValue** ([Quantity](../common-definitions/quantity#quantity))

        averageValue is the target value of the average of the metric across all relevant pods (as a quantity)

      - **metrics.resource.target.value** ([Quantity](../common-definitions/quantity#quantity))

        value is the target value of the metric (as a quantity).

- **minReplicas** (int32)

  MinReplicas is the lower limit for the number of replicas to which the autoscaler can scale down. It defaults to 1 pod.

## FederatedHPAList 

FederatedHPAList contains a list of FederatedHPA.

<hr/>

- **apiVersion**: autoscaling.karmada.io/v1alpha1

- **kind**: FederatedHPAList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)), required

## Operations 

<hr/>

### `get` read the specified FederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

### `get` read status of the specified FederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

### `list` list or watch objects of kind FederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **allowWatchBookmarks** (*in query*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*in query*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### Response

200 ([FederatedHPAList](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpalist)): OK

### `list` list or watch objects of kind FederatedHPA

#### HTTP Request

GET /apis/autoscaling.karmada.io/v1alpha1/federatedhpas

#### Parameters

- **allowWatchBookmarks** (*in query*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*in query*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### Response

200 ([FederatedHPAList](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpalist)): OK

### `create` create a FederatedHPA

#### HTTP Request

POST /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

202 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Accepted

### `update` replace the specified FederatedHPA

#### HTTP Request

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `update` replace status of the specified FederatedHPA

#### HTTP Request

PUT /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `patch` partially update the specified FederatedHPA

#### HTTP Request

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `patch` partially update status of the specified FederatedHPA

#### HTTP Request

PATCH /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): OK

201 ([FederatedHPA](../auto-scaling-resources/federated-hpa-v1alpha1#federatedhpa)): Created

### `delete` delete a FederatedHPA

#### HTTP Request

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the FederatedHPA

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*in query*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### Response

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` delete collection of FederatedHPA

#### HTTP Request

DELETE /apis/autoscaling.karmada.io/v1alpha1/namespaces/`{namespace}`/federatedhpas

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*in query*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### Response

200 ([Status](../common-definitions/status#status)): OK

