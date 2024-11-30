---
title: FAQ (Frequently Asked Questions)
---

## What is the difference between PropagationPolicy and ClusterPropagationPolicy?

The `PropagationPolicy` is a namespace-scoped resource type which means the objects with this type must reside in a namespace.
And the `ClusterPropagationPolicy` is the cluster-scoped resource type which means the objects with this type don't have a namespace.

Both of them are used to hold the propagation declaration, but they have different capacities:
- PropagationPolicy: can only represent the propagation policy for the resources in the same namespace.
- ClusterPropagationPolicy: can represent the propagation policy for all resources including namespace-scoped and cluster-scoped resources.

## What is the difference between 'Push' and 'Pull' mode of a cluster?

Please refer to [Overview of Push and Pull](../userguide/clustermanager/cluster-registration.md#overview-of-cluster-mode).

## Why Karmada requires `kube-controller-manager`?

`kube-controller-manager` is composed of a bunch of controllers, Karmada inherits some controllers from it
to keep a consistent user experience and behavior.

It's worth noting that not all controllers are needed by Karmada, for the recommended controllers please
refer to [Kubernetes Controllers](../administrator/configuration/configure-controllers.md#kubernetes-controllers).


## Can I install Karmada in a Kubernetes cluster and reuse the kube-apiserver as Karmada apiserver?

The quick answer is `yes`. In that case, you can save the effort to deploy
[karmada-apiserver](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-apiserver.yaml) and just
share the APIServer between Kubernetes and Karmada. In addition, the high availability capabilities in the origin clusters
can be inherited seamlessly. We do have some users using Karmada in this way.

There are some things you should consider before doing so:

- This approach hasn't been fully tested by the Karmada community and no plan for it yet.
- This approach will increase computation costs for the Karmada system. E.g.
  After you apply a `resource template`, take `Deployment` as an example, the `kube-controller` will create `Pods` for the
  Deployment and update the status persistently, Karmada system will reconcile these changes too, so there might be
  conflicts.

TODO: Link to adoption use case once it gets on board.

## Why Cluster API doesn't have the CRD YAML file?

Kubernetes provides two methods to extend APIs: Custom Resource and Kubernetes API Aggregation Layer. For more detail, you can refer to [Extending the Kubernetes API](https://kubernetes.io/docs/concepts/extend-kubernetes/).

Karmada uses both extension methods. For example, `PropagationPolicy` and `ResourceBinding` use Custom Resource, and `Cluster` resource uses Kubernetes API Aggregation Layer.

Therefore, `Cluster` resources do not have a CRD YAML file, and they are not visible when you execute the `kubectl get crd` command.

So, why would we choose to use the Kubernetes API Aggregation Layer to extend `Cluster` resources instead of using Custom Resource?

This is because the `Cluster` resource requires the setup of the `Proxy` sub-resource. By using `Proxy`, you can access resources in member clusters. For details, please refer to [Aggregation Layer APIServer](https://karmada.io/docs/next/userguide/globalview/aggregated-api-endpoint/). At present, Custom Resource do not support configuring `Proxy` sub-resources, which is why it was not chosen for this purpose.

## How to prevent automatic propagation of Namespace to all member clusters?

Karmada will propagate the `Namespace` resources created by users to member clusters by default. This functionality is handled by the `namespace` controller in the `karmada-controller-manager` component, and can be configured by referring to [Configure Karmada Controllers](../administrator/configuration/configure-controllers.md#configure-karmada-controllers).

After disabling the `namespace` controller, users can propagate `Namespace` resources to specified clusters through `ClusterPropagationPolicy` resources.
