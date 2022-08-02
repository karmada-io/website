---
title: Architecture
---

The overall architecture of Karmada is shown as below:

![Architecture](../resources//architecture.png)

The Karmada Control Plane consists of the following components:

- Karmada API Server
- Karmada Controller Manager
- Karmada Scheduler

ETCD stores the karmada API objects, the API Server is the REST endpoint all other components talk to, and the Karmada Controller Manager perform operations based on the API objects you create through the API server.

The Karmada Controller Manager runs the various controllers,  the controllers watch karmada objects and then talk to the underlying clusters' API servers to create regular Kubernetes resources.

1. Cluster Controller: attach kubernetes clusters to Karmada for managing the lifecycle of the clusters by creating cluster object.

2. Policy Controller: the controller watches PropagationPolicy objects. When PropagationPolicy object is added, it selects a group of resources matching the resourceSelector and create ResourceBinding with each single resource object.
3. Binding Controller: the controller watches ResourceBinding object and create Work object corresponding to each cluster with single resource manifest.
4. Execution Controller: the controller watches Work objects.When Work objects are created, it will distribute the resources to member clusters.


## Next Step
