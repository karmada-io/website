---
title: Priority Scheduling in Karmada
---

Karmada [**v1.13.0**](https://karmada.io/docs/administrator/upgrading/v1.12-v1.13#:~:text=,based%20scheduling%20and%20preemption%20control) introduces priority-based scheduling that determines the order in which workload bindings are scheduled during resource contention. This feature allows you to prioritize critical workloads by adding a `schedulePriority` field to your [`PropagationPolicy`](https://karmada.io/docs/reference/karmada-api/policy-resources/propagation-policy-v1alpha1/#:~:text=This%20setting%20is%20useful%20for,in%20scenarios%20of%20resource%20contention) or [`ClusterPropagationPolicy`](https://karmada.io/docs/reference/karmada-api/policy-resources/cluster-propagation-policy-v1alpha1/#:~:text=This%20setting%20is%20useful%20for,in%20scenarios%20of%20resource%20contention).

## How Priority Scheduling Works
`PropagationPolicies` determine binding priority through `PriorityClass` references, which define numeric priority values. Higher numeric values indicate higher priority in the scheduling queue ([`ResourceBinding`](https://karmada.io/docs/reference/karmada-api/work-resources/resource-binding-v1alpha2#:~:text=Priority%20specifies%20the%20scheduling%20priority,the%20default%20value%20is%200)).

The scheduler processes bindings in strict priority order, sorting them by their assigned priority value. When bindings share identical priority values, the scheduler falls back to standard first-in, first-out (FIFO) processing, maintaining the original queue order.

Each binding's priority derives from its associated propagation policy's PriorityClass reference, directly influencing its position in the scheduling sequence without affecting cluster selection logic.

## Important Notes

- Priority only affects scheduling order, not `placement` decisions

- If `PriorityClass` isn't found, binding creation fails

- Without a specified PriorityClass, default priority is **0**

- No preemption support in v1.13 (planned for future)


Let's create a deployment and assign it with a priority to demonstrate this behavior.

## Prerequisites

- Karmada **v1.13.0** or **later**

- **PriorityBasedScheduling** feature gate enabled on [`karmada-scheduler`](https://karmada.io/docs/next/reference/components/karmada-scheduler) and [`karmada-controller-manager`](https://karmada.io/docs/next/reference/components/karmada-controller-manager)

- **Admin access** to Karmada API Server

## Configuring Binding Priority

To use the priority scheduling feature, you will configure a PriorityClass in the Karmada cluster and then reference it in your `PropagationPolicy` or `ClusterPropagationPolicy`. The process involves the following steps:

### Define Priority Classes in Karmada
Create one or more `PriorityClass` objects in the Karmada API Server to represent your priority levels. Karmada uses standard Kubernetes PriorityClass resources (apiVersion `scheduling.k8s.io/v1`). 

For example, you could create a "high-priority" class for mission-critical workloads and a "low-priority" class for best-effort workloads:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
    name: high-priority
value: 1000000
# Note: The "globalDefault" field is currently not supported in Karmada.
# If the priority is not explicitly set via a PriorityClass, its value will default to 0.
globalDefault: false
description: "High priority class for critical workloads"
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
    name: low-priority
value: 1
# Note: The "globalDefault" field is currently not supported in Karmada.
# If the priority is not explicitly set via a PriorityClass, its value will default to 0.
globalDefault: false
description: "Low priority class for non-critical workloads"
```

Here, we only need to create the high-priority class for demonstration.

Apply with the following command to create the priority class.
```bash
kubectl --kubeconfig=<karmada-config> apply -f priorityclass.yaml
```
### Reference the PriorityClass in a Propagation Policy
In your PropagationPolicy or ClusterPropagationPolicy, set the `schedulePriority` field to refer to the PriorityClass. This field has two sub-fields: `priorityClassSource` and `priorityClassName`. For Karmada v1.13, the only supported source is `KubePriorityClass`, which tells Karmada to look up a Kubernetes PriorityClass by name in the Karmada cluster. The `priorityClassName` should match the name of the PriorityClass you created. For example, to assign the "high-priority" class to a PropagationPolicy:

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
    priorityClassName: high-priority      # Reference to the PriorityClass defined above
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
bashkubectl --kubeconfig=<karmada-config> get resourcebinding -n default critical-nginx-deployment \
  -o jsonpath='{.spec.schedulePriority.priority}'
```

In the example above, we propagate a Deployment named "critical-nginx" to two member clusters. The `schedulePriority` section assigns it a high priority by referencing the `high-priority` class. If another PropagationPolicy (or ClusterPropagationPolicy) exists for a less critical workload (e.g., with `priorityClassName: low-priority`), the Karmada scheduler will give scheduling preference to "critical-nginx" due to its higher priority value.


The above configuration can similarly be applied to a `ClusterPropagationPolicy` (just use `kind: ClusterPropagationPolicy` and omit the namespace, since it's cluster-scoped). The `schedulePriority` fields and usage are identical between `PropagationPolicy` and `ClusterPropagationPolicy`.

## Conclusion

Priority scheduling in Karmada v1.13 provides a mechanism to control scheduling order of multi-cluster workloads based on importance. Future versions may introduce preemptive scheduling capabilities.

For more details on design and roadmap, see the [**Binding Priority and Preemption Proposal**](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/binding-priority-preemption).