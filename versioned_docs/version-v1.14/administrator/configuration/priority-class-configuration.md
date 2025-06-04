---
title: Component Priority Class Configuration
---

[PriorityClass](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) is a crucial resource that defines a priority level for pods. It enables the scheduling system to make decisions based on the importance of different pods. Pods associated with a higher-priority PriorityClass will be scheduled preferentially over those with lower-priority classes.
This mechanism is especially important in resource-constrained environments, as it helps to ensure that critical components get the necessary resources first.

In the Karmada system, you can customize the priority classes of Karmada control plane components. With this feature, you can:

- configure the priority class for Karmada control plane components to ensure critical components are reliably scheduled to ensure system stability and reliability.
- override the default priority class for Karmada control plane components with a custom priority class that aligns with organization’s policies, ensuring reliable resource allocation and system stability across workloads.

## How to Configure Priority Class for Karmada Control Plane Components

Karmada offers multiple installation methods, including karmada-operator, Helm and karmadactl. The following steps demonstrate how to configure the priority class for Karmada control plane components in different installation methods.

### karmada-operator

To configure the priority class for Karmada control plane components using karmada-operator, you can set the `priorityClassName` field for each component in the `Karmada` CR, defaulting to `system-node-critical` if not specified.

```yaml
apiVersion: operator.karmada.io/v1alpha1
kind: Karmada
metadata:
  name: foo
  namespace: foo
spec:
  components:
    etcd:
      local:
        priorityClassName: system-cluster-critical
    karmadaAPIServer:
        priorityClassName: system-cluster-critical
    ## other components omitted for brevity...
```

### Helm

To configure the priority class for Karmada control plane components using Helm, you can set the `priorityClassNaem` field for each component in the [`values.yaml`](https://github.com/karmada-io/karmada/blob/master/charts/karmada/values.yaml) file, defaulting to `system-node-critical` if not specified.

```yaml
## webhook config
webhook:
  ## @param webhook.labels labels of the webhook deployment
  labels:
    app: karmada-webhook
  ## @param webhook.replicaCount target replicas
  replicaCount: 1
  ## @param webhook.priorityClassName the priority class name for the karmada-webhook
  priorityClassName: "system-cluster-critical"

## other components omitted for brevity...
```
Or, you can use the `--set` flag to set the priority class name for target components during `helm install`, for example:

```bash
$ helm install karamda -n karmada-system --create-namespace --dependency-update ./charts/karmada --set apiServer.priorityClassName=system-cluster-critical
```

The above command sets the priority class name for the `karmada-apiserver` component to `system-cluster-critical`, other components can be configured in a similar way.

### karamdactl

Karmadactl provides command `init` to install control plane components and command `addons` to install addons like `karmada-descheduler`. They both support setting the priority class name for target components with specific flags.

#### karmadactl init

```bash
$ karmadactl init --help | grep priority
    --etcd-priority-class='system-node-critical':
        The priority class name for the component etcd.
    --karmada-aggregated-apiserver-priority-class='system-node-critical':
        The priority class name for the component karmada-aggregated-apiserver.
    --karmada-apiserver-priority-class='system-node-critical':
        The priority class name for the component karmada-apiserver.
    --karmada-controller-manager-priority-class='system-node-critical':
        The priority class name for the component karmada-controller-manager.
    --karmada-kube-controller-manager-priority-class='system-node-critical':
        The priority class name for the component karmada-kube-controller-manager.
    --karmada-scheduler-priority-class='system-node-critical':
        The priority class name for the component karmada-scheduler.
    --karmada-webhook-priority-class='system-node-critical':
        The priority class name for the component karmada-webhook.
```

With the flags above, you can set the priority class name for each component during the installation process.

#### karmadactl addons

```bash
$ karmadactl addons enable --help |grep priority
    --descheduler-priority-class='system-node-critical':
        The priority class name for the component karmada-descheduler.
    --estimator-priority-class='system-node-critical':
        The priority class name for the component karmada-scheduler-estimator.
    --metrics-adapter-priority-class='system-node-critical':
        The priority class name for the component karmada-metrics-adaptor.
    --search-priority-class='system-node-critical':
        The priority class name for the component karmada-search.
```

With the flags above, you can set the priority class name for target addons during the installation process.
