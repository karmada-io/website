---
title: Architecture
---

The overall architecture of Karmada is shown as below:

![Architecture](../resources//architecture.png)

The Karmada Control Plane consists of the following components:

- Karmada API Server
- Karmada Controller Manager
- Karmada Scheduler

ETCD stores the karmada API objects, the API Server is the REST endpoint all other components talk to, and the Karmada Controller Manager performs operations based on the API objects you created through the API server.

The Karmada Controller Manager runs various controllers, which watch karmada objects and then talk to the underlying clusters' API servers to create regular Kubernetes resources.

1. Cluster Controller: attaches kubernetes clusters to Karmada for managing the lifecycle of the clusters by creating cluster objects.
2. Policy Controller: watches PropagationPolicy objects. When a PropagationPolicy object is added, the controller selects a group of resources matching the resourceSelector and create ResourceBinding with each single resource object.
3. Binding Controller: watches ResourceBinding objects and create a Work object corresponding to each cluster with a single resource manifest.
4. Execution Controller: watches Work objects. When Work objects are created, the controller will distribute the resources to member clusters.

