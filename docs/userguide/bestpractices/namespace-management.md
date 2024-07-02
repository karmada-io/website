---
title: Namespace Management
---

In a Kubernetes cluster, workloads are deployed into a namespace.
Multi-cluster deployments mean each namespace must exists in multiple clusters.
If you want to manage these namespaces in a unified manner, `karmada-controller-manager` [namespace sync controller](https://github.com/karmada-io/karmada/blob/master/pkg/controllers/namespace/namespace_sync_controller.go) is a solution,
which propagates namespaces from Karmada to member clusters.

## Default namespace propagation
All namespaces, except those reserved, will be propagated to all member clusters.
Reserved namespaces are `karmada-system`,`karmada-cluster`, `karmada-es-*`, `kube-*` (configured via cli option, see below), and `default`.

## Skip namespace auto propagation

If you don't want to propagate a namespace automatically:
- Option A: Configure `karmada-controller-manager`
- Option B: Label the namespace
- Option C: use custom namespace propagation

### Option A: Configure `karmada-controller-manager`
The flag `--skipped-propagating-namespaces` can skip namespace auto propagation in `karmada-controller-manager` which defaults to the regex "kube-.*". Here is an example:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: karmada-controller-manager
  namespace: karmada-system
  labels:
    app: karmada-controller-manager
spec:
  ...
  template:
    metadata:
      labels:
        app: karmada-controller-manager
    spec:
      containers:
        - name: karmada-controller-manager
          image: docker.io/karmada/karmada-controller-manager:latest
          command:
            - /bin/karmada-controller-manager
            - --skipped-propagating-namespaces=ns1,ns2
```
With this change:
- `ns1` and `ns2` will not be propagated to all the member clusters.
- the previously ignored "kube-.*" namespaces will be propagated to all the member clusters.

### Option B: Label the namespace
Configure label `namespace.karmada.io/skip-auto-propagation: "true"` to skip namespace auto propagation. Here is an example:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: example-ns
  labels:
    namespace.karmada.io/skip-auto-propagation: "true"
```
> Note: If the namespace has been propagated to member clusters, labeling the namespace with `namespace.karmada.io/skip-auto-propagation: "true"` will not trigger member clusters to delete the namespace, but the namespace will not be propagated to newly joined member clusters.

### Option C: use custom namespace propagation.

If you want to take full control of which namespaces get propagated this option offers the most flexibility,
but also means you have to add new clusters to the propagation policy yourself.

#### Step 1: Disable the namespace-sync-controller (which is called "namespace" internally)

Change the `karmada-controller-manager` command to not run the "namespace" controller:
```yaml
command:
- /bin/karmada-controller-manager
- --controllers=*,-namespace
```

#### Step 2: Create a clusterpropagationpolicy to propagate namespaces

Example:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterPropagationPolicy
metadata:
  labels:
    role: namespace
  name: namespace
spec:
  conflictResolution: Overwrite
  placement:
    clusterAffinity:
      clusterNames:
      - cluster-a
      - cluster-b
  resourceSelectors:
  - apiVersion: v1
    kind: Namespace
    labelSelector:
      matchExpressions:
      - key: kubernetes.io/metadata.name
        operator: NotIn
        values:
        - kube-system
        - kube-public
        - kube-node-lease
        - default
        - karmada-system
        - karmada-cluster
      - key: karmada.io/managed
        operator: NotIn
        values:
        - "true"
```
