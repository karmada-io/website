---
title: Glossary
---

This glossary is intended to be a comprehensive, standardized list of Karmada terminology. It includes technical terms that are specific to Karmada, as well as more general terms that provide useful context.

* Aggregated API

Aggregated API is provided by `karmada-aggregated-apiserver`. It aggregates all registered clusters and allows users to uniformly access different member clusters through Karmada's `cluster/proxy` endpoint.

* ClusterAffinity

Similar to K8s, ClusterAffinity refers to a set of rules that provide the scheduler with hints on which cluster to deploy applications on.

* GracefulEviction

Graceful eviction means that when a workload is migrated between clusters, the eviction will be postponed until the workload becomes healthy on the new cluster or the `GracePeriodSeconds` is reached.
Graceful eviction can help the service to be continuously serviced during multi-cluster failover, and the instance will not drop to zero.

* OverridePolicy

Differentiated configuration policy applicable across clusters.

* Overrider

Overrider refers to a series of differentiated configuration rules provided by Karmada, such as `ImageOverrider` overrides the image of workloads.

* Propagate Dependencies(PropagateDeps)

`PropagateDeps` means that when an application is delivered to a certain cluster, Karmada can automatically distribute its dependencies to the same cluster at the same time. Dependencies do not go through the scheduling process, but reuse the scheduling results of the main application.
Dependencies of complex applications can be resolved through the resource interpreter's `InterpretDependency` operation.

* PropagationPolicy

Widely applicable policy for multi-cluster application scheduling.

* Pull Mode

A mode for Karmada to manage clusters. Karmada control plane will not access the member clusters directly, but will delegate the responsibility to the `karmada-agent` deployed on the member clusters.

* Push Mode

A mode for Karmada to manage clusters. Karmada control plane will directly access `kube-apiserver` of member clusters to obtain cluster status and deploy applications.

* ResourceBinding

Unified abstraction of Karmada, which drives internal processes. It contains info of resource template and scheduling policy, and is the processing object of karmada-scheduler when scheduling applications.

* Resource Interpreter

In the process of distributing resources from `karmada-apiserver` to member clusters, Karmada needs to understand the definition structure of resources. For example, during the divided scheduling of Deployment, Karmada needs to parse the replicas field of Deployment.
The resource interpreter is designed to interpret the resource structure. It includes two types of interpreters. The built-in interpreter is used to interpret common Kubernetes native resources or some well-known extended resources, implemented and maintained by the community, and the custom interpreter is used to interpret custom resources or override built-in interpreters, implemented and maintained by users.

* Resource Model

The resource model is the abstraction of the resource usage of the member cluster on the Karmada control plane. During the scheduling of replicas based on the cluster margin, karmada-scheduler will make decisions based on the resource model of the cluster.

* Resource Template

Resource template refers to the K8s native API definition including CRD, and generally refers to the template of multi-cluster applications.

* SpreadConstraint

Spread constraint refers to scheduling constraints based on the cluster topology, e.g. Karmada will schedule according to information such as the region, provider, and zone where the cluster is located.

* Work

Object at the federation layer to present a resource in member clusters. 
The work of different member clusters is isolated by namespace.
