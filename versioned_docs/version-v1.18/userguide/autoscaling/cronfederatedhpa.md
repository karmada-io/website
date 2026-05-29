---
title: CronFederatedHPA
---

In Karmada, the CronFederatedHPA is used for regular autoscaling actions. It can scale workloads that have a scale subresource or FederatedHPA.

The typical scenario is to proactively scale up a workload in anticipation of predictable spikes in traffic. For example, if I know there will be a sudden increase in traffic every day at 9 AM, I want to scale up the related service ahead of time (e.g., 30 minutes prior) to handle the peak load and ensure uninterrupted availability.

The CronFederatedHPA is implemented as both a Karmada API resource and a controller. The behavior of the controller is determined by the CronFederatedHPA resource. Running within the Karmada control plane, the CronFederatedHPA controller scales the workload's replicas or FederatedHPA's minReplicas/maxReplicas based on predefined cron schedules.

## How does a CronFederatedHPA work?

![cronfederatedhpa-architecture](../../resources/userguide/autoscaling/cronfederatedhpa-architecture.png)  
Karmada implements CronFederatedHPA as a control loop that periodically checks the cron schedule time. If the scheduled time is reached, it scales the workload's replicas or FederatedHPA's minReplicas/maxReplicas.

> Please note that this feature requires Karmada version v1.7.0 or later.

## Scaling workloads with scale subresource

CronFederatedHPA is capable of scaling workloads that have a scale subresource, such as Deployment and StatefulSet. However, it is important to note that there is a limitation. It is crucial to ensure that the scaling operation performed by CronFederatedHPA does not conflict with any other ongoing scaling operations. For example, if the workload is managed by both CronFederatedHPA and FederatedHPA simultaneously, the final result may be unexpected.  
![autoscale-workload-conflicts](../../resources/userguide/autoscaling/autoscaling-conflicts.png)

## Scaling FederatedHPA

CronFederatedHPA is designed to scale resources at a specific time. When a workload is only scaled directly by CronFederatedHPA, its replicas will remain unchanged until the specified time is reached. This means that it loses the ability to handle more requests until then.
So, to ensure that the workload can be scaled up in advance to meet peak loads and real-time business demands later on, we recommend using CronFederatedHPA to scale FederatedHPA firstly. Then, FederatedHPA can scale the workloads based on their metrics.

## API Object

The CronFederatedHPA is an API in the Karmada autoscaling API group. The current version is v1alpha1, you can check the CronFederatedHPA API specification [here](https://github.com/karmada-io/karmada/blob/04d2ef17d835ffb6109ba268a0f21e3f880090fa/pkg/apis/autoscaling/v1alpha1/cronfederatedhpa_types.go#L32).

## What's next

If you configure CronFederatedHPA, you may also want to consider running a cluster-level autoscaler such as [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler).  

For more information on CronFederatedHPA:
* Read a [Autoscale FederatedHPA with CronFederatedHPA](../../tutorials/autoscaling-federatedhpa-with-cronfederatedhpa.md).
* Read a [Autoscale workload with CronFederatedHPA](../../tutorials/autoscaling-workload-with-cronfederatedhpa.md).