---
title: Migration From Kubefed
---

Karmada is developed in continuation of Kubernetes [Federation v1](https://github.com/kubernetes-retired/federation)
and [Federation v2(aka Kubefed)](https://github.com/kubernetes-sigs/kubefed). Karmada inherited a lot of concepts
from these two versions. For example:

- **Resource template**: Karmada uses Kubernetes Native API definition for federated resource template,
  to make it easy to integrate with existing tools that already adopt Kubernetes.
- **Propagation Policy**: Karmada offers a standalone Propagation(placement) Policy API to define multi-cluster
  scheduling and spreading requirements.
- **Override Policy**: Karmada provides a standalone Override Policy API for specializing cluster relevant
  configuration automation.

Most of the features in Kubefed have been reformed in Karmada, so Karmada would be the natural successor.

Generally speaking, migrating from Kubefed to Karmada would be pretty easy.
This document outlines the basic migration path for Kubefed users.
**Note:** This document is a work in progress, any feedback would be welcome.

## Cluster Registration

Kubefed provides `join` and `unjoin` commands in `kubefedctl` command line tool, Karmada also implemented the
two commands in `karmadactl`.

Refer to [Kubefed Cluster Registration](https://github.com/kubernetes-sigs/kubefed/blob/master/docs/cluster-registration.md),
and [Karmada Cluster Registration](https://karmada.io/docs/userguide/clustermanager/cluster-registration) for more
details.

### Joining Clusters

Assume you use the `kubefedctl` tool to join cluster as follows:

```bash
kubefedctl join cluster1 --cluster-context cluster1 --host-cluster-context cluster1
```

Now with Karmada, you can use `karmadactl` tool to do the same thing:
```
karmadactl join cluster1 --cluster-context cluster1 --karmada-context karmada
```

The behavior behind the `join` command is similar between Kubefed and Karmada. For Kubefed, it will create a
[KubeFedCluster](https://github.com/kubernetes-sigs/kubefed/blob/96f03f0dea62fe09136010255acf218ed14987f3/pkg/apis/core/v1beta1/kubefedcluster_types.go#L94),
object and Karmada will create a [Cluster](https://github.com/karmada-io/karmada/blob/aa2419cb1f447d5512b2a998ec81c9013fa31586/pkg/apis/cluster/types.go#L36)
object to describe the joined cluster.

### Checking status of joined clusters

Assume you use the `kubefedctl` tool to check the status of the joined clusters as follows:

```bash
$ kubectl -n kube-federation-system get kubefedclusters

NAME       AGE   READY   KUBERNETES-VERSION
cluster1   1m    True    v1.21.2
cluster2   1m    True    v1.22.0
```

Now with Karmada, you can use `karmadactl` tool to do the same thing:

```bash
$ kubectl get clusters

NAME      VERSION   MODE   READY   AGE
member1   v1.20.7   Push   True    66s
```

Kubefed manages clusters with `Push` mode, however Karmada supports both `Push` and `Pull` modes.
Refer to [Overview of cluster mode](https://karmada.io/docs/userguide/clustermanager/cluster-registration) for
more details.

### Unjoining clusters

Assume you use the `kubefedctl` tool to unjoin as follows:

```
kubefedctl unjoin cluster2 --cluster-context cluster2 --host-cluster-context cluster1
```

Now with Karmada, you can use `karmadactl` tool to do the same thing:

```
karmadactl unjoin cluster2 --cluster-context cluster2 --karmada-context karmada
```

The behavior behind the `unjoin` command is similar between Kubefed and Karmada, they both remove the cluster
from the control plane by removing the cluster object.

## Propagating workload to clusters

Assume you are going to propagate a workload (`Deployment`) to both clusters named `cluster1` and `cluster2`,
you might have to deploy following yaml to Kubefed:

```yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedDeployment
metadata:
  name: test-deployment
  namespace: test-namespace
spec:
  template:
    metadata:
      labels:
        app: nginx
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: nginx
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - image: nginx
            name: nginx
  placement:
    clusters:
    - name: cluster2
    - name: cluster1
  overrides:
  - clusterName: cluster2
    clusterOverrides:
    - path: "/spec/replicas"
      value: 5
    - path: "/spec/template/spec/containers/0/image"
      value: "nginx:1.17.0-alpine"
    - path: "/metadata/annotations"
      op: "add"
      value:
        foo: bar
    - path: "/metadata/annotations/foo"
      op: "remove"
```

Now with Karmada, the yaml could be split into 3 yamls, one for each of the `template`, `placement` and `overrides`.

In Karmada, the template doesn't need to embed into `Federated CRD`, it just the same as Kubernetes native declaration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - image: nginx
          name: nginx
```

For the `placement` part, Karmada provides `PropagationPolicy` API to hold the placement rules:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - cluster1
        - cluster2
```

The `PropagationPolicy` defines the rules of which resources(`resourceSelectors`) should be propagated to
where (`placement`).
See [Resource Propagating](https://karmada.io/docs/userguide/scheduling/resource-propagating) for more details.

For the `override` part, Karmada provides `OverridePolicy` API to hold the rules for differentiation:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: OverridePolicy
metadata:
  name: example-override
  namespace: default
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  overrideRules:
    - targetCluster:
        clusterNames:
          - cluster2
      overriders:
        plaintext:
          - path: "/spec/replicas"
            operator: replace
            value: 5
          - path: "/metadata/annotations"
            operator: add
            value:
              foo: bar
          - path: "/metadata/annotations/foo"
            operator: remove
        imageOverrider:
          - component: Tag
            operator: replace
            value: 1.17.0-alpine
```

The `OverridePolicy` defines the rules of which resources(`resourceSelectors`) should be overwritten when
propagating to where(`targetCluster`).

In addition to Kubefed, Karmada offers various alternatives to declare the override rules, see
[Overriders](https://karmada.io/docs/userguide/scheduling/override-policy#overriders) for more details.

## FAQ

### Will Karmada provide tools to smooth the migration?

We don't have the plan yet, as we reached some Kubefed users and found that they're usually not using vanilla
Kubefed but the forked version, they extended Kubefed a lot to meet their requirements. So, it might be pretty
hard to maintain a common tool to satisfy most users.

We are also looking forward to more feedback now, please feel free to reach us, and we are glad to support you
finish the migration.