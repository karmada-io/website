---
title: Namespace Management
---

In a Kubernetes cluster, workloads are deployed in a certain namespace. Multi-cluster deployments mean multiple namespaces. If you want to manage them in a unified manner, `karmada-controller-manager` will be the solution for you, which propagates the namespace you created in Karmada to member clusters.

## Default namespace propagation
All namespaces, except those reserved, will be automatically propagated to all member clusters. Reserved namespaces are `karmada-system`,`karmada-cluster`, `karmada-es-*`, `kube-*`, and `default`.

## Skip namespace auto propagation
If you don't want to propagate a namespace automatically, configure `karmada-controller-manager` or label the namespace.

### Configuring `karmada-controller-manager`
Flag `skipped-propagating-namespaces` could be configured to skip namespace auto propagation in `karmada-controller-manager`. Here is an example:
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
`ns1` and `ns2` will not be propagated to all the member clusters.

### Labeling the namespace
Label `namespace.karmada.io/skip-auto-propagation: "true"` could be configured to skip namespace auto propagation. Here is an example:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: example-ns
  labels:
    namespace.karmada.io/skip-auto-propagation: "true"
```
> Note: If the namespace has been propagated to member clusters, labeling the namespace with `namespace.karmada.io/skip-auto-propagation: "true"` will not trigger member clusters to delete the namespace, but the namespace will not be propagated to newly joined member clusters.
