---
title: Priority Scheduling
---

Karmada priority-based scheduling lets you control the order in which workload bindings are scheduled during resource contention.

This feature allows you to prioritize critical workloads by adding a `schedulePriority` field to your [`PropagationPolicy`](../../reference/karmada-api/policy-resources/propagation-policy-v1alpha1.md) or [`ClusterPropagationPolicy`](../../reference/karmada-api/policy-resources/cluster-propagation-policy-v1alpha1.md).

## How Priority Scheduling Works
`PropagationPolicies` determine binding priority through `PriorityClass` references, which define numeric priority values. Higher numeric values indicate higher priority in the scheduling queue ([`ResourceBinding`](../../reference/karmada-api/work-resources/resource-binding-v1alpha2.md)).

The scheduler processes bindings in strict priority order, sorting them by their assigned priority value. When bindings share identical priority values, the scheduler falls back to standard first-in, first-out (FIFO) processing, maintaining the original queue order.

Each binding's priority derives from its associated propagation policy's PriorityClass reference, directly influencing its position in the scheduling sequence without affecting cluster selection logic.

## Important Notes

- Priority only affects scheduling order, not `placement` decisions.
- If `PriorityClass` isn't found, binding creation **fails**.
- Without a specified PriorityClass, default priority is **0**.
- The priority-based scheduling was introduced in the v1.13 release, without preemption support yet (planned for the future).
- To use the feature, ensure that the PriorityBasedScheduling feature is enabled on both [`karmada-scheduler`](../../reference/components/karmada-scheduler) and [`karmada-controller-manager`](../../reference/components/karmada-controller-manager).
- This feature is in **alpha** stage and may be subject to changes in future releases.


## Example of Configuring Scheduling Priority

Assume that you have a Kubernetes PriorityClass resource (apiVersion `scheduling.k8s.io/v1`), for example, one named **high-priority-example**.

### Reference the PriorityClass in a Propagation Policy
In your PropagationPolicy or ClusterPropagationPolicy, set the `schedulePriority` field to refer to the PriorityClass. This field has two sub-fields: `priorityClassSource` and `priorityClassName`. For Karmada v1.13, the only supported source is `KubePriorityClass`, which tells Karmada to look up a Kubernetes PriorityClass by name in the Karmada cluster. The `priorityClassName` should match the name of the PriorityClass you created. For example, to assign the **high-priority-example** PriorityClass to a PropagationPolicy:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: critical-app-policy
  namespace: default
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: critical-nginx                  # The name of the workload to propagate
  schedulePriority:
    priorityClassSource: KubePriorityClass
    priorityClassName: high-priority-example      # Reference to the PriorityClass defined above
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```

Next, create the propagationPolicy and the deployment.

1. Create a propagationPolicy based on the YAML file:
```shell
  kubectl apply -f propagationpolicy.yaml
```
2. Create a Deployment nginx resource:
```shell
  kubectl create deployment critical-nginx --image nginx
```

### Verify Configuration
Check the ResourceBinding's priority:
```shell
kubectl --kubeconfig=<karmada-config> get resourcebinding -n default critical-nginx-deployment \
  -o jsonpath='{.spec.schedulePriority.priority}'
```

In the example above, we propagate a Deployment named "critical-nginx" to two member clusters. The `schedulePriority` section assigns it a priority by referencing the **high-priority-example** class.

## Conclusion

Priority scheduling in Karmada v1.13 provides a mechanism to control scheduling order of multi-cluster workloads based on importance. Future versions may introduce preemptive scheduling capabilities.

For more details on design and roadmap, see the [Binding Priority and Preemption Proposal](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/binding-priority-preemption).