---
title: Global Search for Resources
---

## Background

Multicluster is becoming a common practice. It brings services closer to users.
But it also makes it hard to query Kubernetes resources across clusters.
Therefore, we need a caching layer and a search engine for Karmada to cache and search for Kubernetes resources across multiple clusters.
We introduced a new component named `karmada-search` and a new API group called `search.karmada.io` to implement it.

## What karmada-search can do

![karmada-search](../../resources/key-features/unified-search.png)

karmada-search can:

* Accelerate resource requests processing across regions.
* Provide a cross-cluster resource view.
* Be compatible with multiple Kubernetes resource versions.
* Unify resource requests entries.
* Reduce API server pressure on member clusters.
* Adapt to a variety of search engines and databases.

What's more, `karmada-search` also supports proxying one global resource. See [here](./proxy-global-resource.md) for details.

## Scope the caching

`.spec` in `ResourceRegistry` defines the cache scope.

It has three fields to set:
- TargetCluster
- ResourceSelector
- BackendStore

### TargetCluster

`TargetCluster` means the cluster from which the cache system collects resources.
It's exactly the same with [clusterAffinity](../scheduling/resource-propagating.md#deploy-deployment-into-a-specified-set-of-target-clusters) in `PropagationPolicy`.

### ResourceSelector

`ResourceSelector` specifies the type of resources to be cached by `karmada-search`. Subfields are `APIVersion`, `Kind` and `Namespace`.

The following example `ResourceSelector` means Deployments in `default` namespace are targeted:

```yaml
apiVersion: search.karmada.io/v1alpha1
kind: ResourceRegistry
metadata:
  name: foo
spec:
  # ...
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      namespace: default
```

:::note

A null `namespace` field means all namespaces are targeted.

:::

### BackendStore

`BackendStore` specifies the location to store cached items. Defaults to the memory of `karmada-search`.
Now `BackendStore` only supports `OpenSearch` as the backend.

`BackendStore` can be configured as follows:

```yaml
apiVersion: search.karmada.io/v1alpha1
kind: ResourceRegistry
metadata:
  name: foo
spec:
  # ...
  backendStore:
    openSearch:
      addresses:
        - http://10.240.0.100:9200
      secretRef:
        namespace: default
        name: opensearch-account
```

For a complete example, you can refer to [here](../../tutorials/karmada-search.md).
