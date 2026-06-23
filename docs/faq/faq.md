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

Technically, `yes`. You can install Karmada in an existing Kubernetes cluster and reuse the
`kube-apiserver` as the Karmada apiserver instead of deploying a standalone
[karmada-apiserver](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-apiserver.yaml).
In this setup, Karmada can also benefit from the high availability capabilities of the existing Kubernetes control plane.

However, this deployment mode is not generally recommended as the default choice. If you still decide to use it, please
carefully evaluate the following considerations:

- This approach has not been fully tested by the Karmada community, and there is no plan to make it a recommended
  deployment mode at this time.
- Reusing the Kubernetes `kube-apiserver` may increase the computational cost and reconciliation pressure on the Karmada
  system. For example, after you apply a `resource template`, such as a `Deployment`, the `kube-controller-manager` may
  create `Pods` for the `Deployment` and continuously update its status. Karmada controllers may also reconcile these
  changes, which can lead to unexpected interactions or conflicts.
- The Kubernetes control plane and the Karmada control plane will share the same API server, so operational issues,
  configuration changes, or resource pressure in one system may affect the other.

In general, deploying a dedicated `karmada-apiserver` is preferred for clearer isolation and more predictable behavior.
Reusing an existing `kube-apiserver` should be considered only when you fully understand the trade-offs and can accept the
potential risks.

## Why Cluster API doesn't have the CRD YAML file?

Kubernetes provides two methods to extend APIs: Custom Resource and Kubernetes API Aggregation Layer. For more detail, you can refer to [Extending the Kubernetes API](https://kubernetes.io/docs/concepts/extend-kubernetes/).

Karmada uses both extension methods. For example, `PropagationPolicy` and `ResourceBinding` use Custom Resource, and `Cluster` resource uses Kubernetes API Aggregation Layer.

Therefore, `Cluster` resources do not have a CRD YAML file, and they are not visible when you execute the `kubectl get crd` command.

So, why would we choose to use the Kubernetes API Aggregation Layer to extend `Cluster` resources instead of using Custom Resource?

This is because the `Cluster` resource requires the setup of the `Proxy` sub-resource. By using `Proxy`, you can access resources in member clusters. For details, please refer to [Aggregation Layer APIServer](https://karmada.io/docs/next/userguide/globalview/aggregated-api-endpoint/). At present, Custom Resource do not support configuring `Proxy` sub-resources, which is why it was not chosen for this purpose.

## How to prevent automatic propagation of Namespace to all member clusters?

Karmada will propagate the `Namespace` resources created by users to member clusters by default. This functionality is handled by the `namespace` controller in the `karmada-controller-manager` component, and can be configured by referring to [Configure Karmada Controllers](../administrator/configuration/configure-controllers.md#configure-karmada-controllers).

After disabling the `namespace` controller, users can propagate `Namespace` resources to specified clusters through `ClusterPropagationPolicy` resources.
