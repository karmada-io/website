---
title: FederatedHPA
---

In Karmada, a FederatedHPA scales up/down the workload's replicas across multiple clusters, with the aim of automatically scaling the workload to match the demand.
![img](../../resources/userguide/autoscaling/federatedhpa-overview.png)

When the load is increase, FederatedHPA scales up the replicas of the workload(the Deployment, StatefulSet, or other similar resource) if the number of Pods is under the configured maximum. When the load is decrease, FederatedHPA scales down the replicas of the workload if the number of Pods is above the configured minimum.

FederatedHPA does not apply to objects that can't be scaled (for example: a DaemonSet.)

The FederatedHPA is implemented as a Karmada API resource and a controller, the resource determines the behavior of the controller. The FederatedHPA controller, running within the Karmada control plane, periodically adjusts the desired scale of its target (for example, a Deployment) to match observed metrics such as average CPU utilization, average memory utilization, or any other custom metric you specify.


## How does a FederatedHPA work?

![federatedhpa-architecture](../../resources/userguide/autoscaling/federatedhpa-architecture.png)  
To implement autoscaling across clusters, Karmada introduces FederatedHPA controller and karmada-metrics-adapter, they works as follows:
1. HPA controller queries metrics via metrics API `metrics.k8s.io` or `custom.metrics.k8s.io` with label selector periodically.
1. `karmada-apiserver` gets the metrics API query, and it will route to karmada-metrics-adapter via API service registration.
1. `karmada-metrics-adapter` will query the metrics from the target clusters(where the pod exists). After the metrics are collected, it will aggregate them and return it.
1. HPA controller will calculate the desired replicas based on metrics and scale the workload directly. Then `karmada-scheduler` will schedule the replicas to the member clusters.

> Note: To use this feature, The Karmada version must be v1.6.0 or later.

## API Object

The FederatedHPA is an API in the Karmada autoscaling API group. The current version is v1alpha1, which only supports CPU and Memory metrics.  

You can check the FederatedHPA API specification [here](https://github.com/karmada-io/karmada/blob/76acb6d66f462e7e202c52cc4bb19a4798daf124/pkg/apis/autoscaling/v1alpha1/federatedhpa_types.go#L23).

## What's next

If you configure FederatedHPA, you may also want to consider running a cluster-level autoscaler such as [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler).  

For more information on FederatedHPA:
* Read a [FederatedHPA tutorials](../../tutorials/autoscaling-with-federatedhpa.md) for FederatedHPA.
