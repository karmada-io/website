---
title: Core Concept
---


**Resource template**: Karmada uses Kubernetes Native API definition for federated resource template, to make it easy to integrate with existing tools that already adopt on Kubernetes

**Propagation Policy**: Karmada offers standalone Propagation(placement) Policy API to define multi-cluster scheduling and spreading requirements.
- Support 1:n mapping of Policy: workload, users don't need to indicate scheduling constraints every time creating federated applications.
- With default policies, users can just interact with K8s API

**Override Policy**: Karmada provides standalone Override Policy API for specializing cluster relevant configuration automation. E.g.:
- Override image prefix according to member cluster region
- Override StorageClass according to cloud provider


The following diagram shows how Karmada resources are involved when propagating resources to member clusters.

![karmada-resource-relation](../resources/karmada-resource-relation.png)

## Next Step
