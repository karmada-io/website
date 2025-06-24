---
title: Kubernetes Compatibility
---

This document provides a comprehensive guide to Karmada's compatibility with Kubernetes versions, focusing on two 
primary dimensions: 
- Karmada control plane APIs support: How many APIs are supported? 
- Kubernetes versions support: How many Kubernetes versions are supported?

This document helps administrators understand how Karmada manages resources across clusters with mixed Kubernetes versions. 
It ensures safe propagation by respecting each cluster’s API capabilities and provides guidelines for maintaining 
compatibility during upgrades or migrations.

## Karmada control plane APIs support

Karmada supports all Kubernetes APIs available in the version of kube-apiserver it uses. For example, if Karmada APIServer 
uses kube-apiserver@v1.32, it inherits support for every API (e.g., Deployment, Service, Ingress) and API version 
(e.g., apps/v1, networking.k8s.io/v1) available in Kubernetes v1.32. 

Beyond native Kubernetes APIs, Karmada extends its capabilities through Custom Resource Definitions (CRDs) and 
Aggregated APIServer, the same extension mechanisms used in Kubernetes itself:
- **CRD Extensions**: Most Karmada-specific APIs (e.g., PropagationPolicy, OverridePolicy) are implemented as CRDs. 
Users can also define custom CRDs in Karmada and propagate them to member clusters, following the same workflow as 
native Kubernetes APIs.
- **Aggregated APIServer**: Karmada’s Cluster API is extended by karmada-aggregated-apiserver, thus users can directly
query member cluster resources (e.g., Nodes, Pods) through Karmada’s unified API endpoint.
Users can extend Karmada’s API surface in the same way they extend Kubernetes -- whether for custom resources or 
third-party integrations.

To view all supported APIs, run the `karmadactl api-resources` command against Karmada, this lists all supported API
including Kubernetes API and extended APIs, the output like:
```
# karmadactl api-resources 
NAME                                       SHORTNAMES   APIVERSION                        NAMESPACED   KIND
pods                                       po           v1                                true         Pod
deployments                                deploy       apps/v1                           true         Deployment
clusters                                                cluster.karmada.io/v1alpha1       false        Cluster
overridepolicies                           op           policy.karmada.io/v1alpha1        true         OverridePolicy
propagationpolicies                        pp           policy.karmada.io/v1alpha1        true         PropagationPolicy
...
```

## Kubernetes versions support

Karmada manages Kubernetes clusters using a minimal set of stable APIs and endpoints, ensuring broad compatibility 
across Kubernetes versions. Each Karmada release integrates the latest Kubernetes client libraries and tests 
compatibility with the latest 10 Kubernetes versions. For example, Karmada v1.14 uses Kubernetes client v1.32 and is 
validated against Kubernetes versions from v1.23 to v1.32.

A resource can be propagated to member clusters only if both Karmada and the target cluster support its API.
- If Karmada does not recognize the API (e.g., unsupported CRDs or deprecated APIs), the resource cannot be created in Karmada.
- If a member cluster lacks the API (e.g., an older cluster missing networking.k8s.io/v1/Ingress), Karmada skips propagation to that cluster.

## FAQ

### How to choose the version of Karmada APIServer?

The Karmada project automatically updates the default kube-apiserver version in its installation tools (e.g., Karmada Operator) 
to support the latest Kubernetes APIs. In most cases, users do not need to change it, even in case of upgrading Karmada.

You may need to upgrade Karmada APIServer in cases such as:
- Adopting New Kubernetes APIs: To leverage features introduced in newer Kubernetes versions.
- Addressing CVEs: To resolve security vulnerabilities present in older versions.

Note that upgrading should be taken very carefully:

- Review API Deprecations: Ensure resource types used in your workloads are not deprecated in the target Kubernetes version.
- Incremental Upgrades: Always upgrade one minor version at a time (e.g., kube-apiserver@v1.32 → v1.33). 
Avoid skipping versions (e.g., v1.32 → v1.34), as Kubernetes relies on incremental API deprecation and automatic 
conversion mechanisms to safely migrate deprecated APIs to newer versions.

### How to handle member clusters with large version gaps?

For scenarios where member clusters span incompatible API versions (e.g., some support networking.k8s.io/v1, others only v1beta1),
Currently, Karmada does not automatically convert API versions according to the capacity of member clusters, instead, it is
recommended to upgrade the outdated clusters to a newer Kubernetes version.
