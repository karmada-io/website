---
title: 组件优先级类配置
---

[优先级类](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/)是一种用于为 Pod 定义优先级的资源。它能让调度系统根据不同 Pod 的重要性来做出调度决策。与高优先级类关联的 Pod 会比低优先级类的 Pod 优先被调度。

这一机制在资源受限的环境中尤为重要，因为它有助于确保关键组件先获得必要的资源。

在 Karmada 系统中，你可以自定义 Karmada 控制平面组件的优先级类。借助此功能，你可以：

- 为 Karmada 控制平面组件配置优先级类，以确保关键组件能可靠调度，从而保证系统的稳定性和可靠性。
- 使用符合组织策略的自定义优先级类覆盖 Karmada 控制平面组件的默认优先级类，确保跨工作负载的资源分配可靠以及系统稳定。

## 如何为 Karmada 控制平面组件配置优先级类

Karmada 提供了多种安装方式，包括使用 karmada-operator、Helm 和 karmadactl。以下步骤展示了如何在不同安装方式下为 Karmada 控制平面组件配置优先级类。

### 使用 karmada-operator

若要使用 karmada-operator 为 Karmada 控制平面组件配置优先级类，你可以在 `Karmada` 自定义资源（CR）中为目标组件设置 `priorityClassName` 字段。若未指定，默认值为 `system-node-critical`。

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
    ## 为简洁起见，省略其他组件...
```

### 使用 Helm

若要使用 Helm 为 Karmada 控制平面组件配置优先级类，你可以在 [`values.yaml`](https://github.com/karmada-io/karmada/blob/master/charts/karmada/values.yaml) 文件中为每个组件设置 `priorityClassName` 字段。若未指定，默认值为 `system-node-critical`。

```yaml
##  Webhook 配置
webhook:
  ## @param webhook.labels Webhook 部署的标签
  labels:
    app: karmada-webhook
  ## @param webhook.replicaCount 目标副本数
  replicaCount: 1
  ## @param webhook.priorityClassName karmada - webhook 的优先级类名称
  priorityClassName: "system-cluster-critical"

## 为简洁起见，省略其他组件...
```
或者，你可以在执行 `helm install` 时使用 `--set` 参数为目标组件设置优先级类名称，例如：

```bash
$ helm install karamda -n karmada-system --create-namespace --dependency-update ./charts/karmada --set apiServer.priorityClassName=system-cluster-critical
```

上述命令将 `karmada-apiserver` 组件的优先级类名称设置为 `system-cluster-critical`，其他组件也可以用类似方式进行配置。

### 使用 karmadactl

karmadactl 提供了 `init` 命令来安装控制平面组件，以及 `addons` 命令来安装诸如 `karmada-descheduler` 之类的插件。这两个命令都支持使用特定参数为目标组件设置优先级类名称。

#### karmadactl init

```bash
$ karmadactl init --help | grep priority
    --etcd-priority-class='system-node-critical':
        etcd 组件的优先级类名称。
    --karmada-aggregated-apiserver-priority-class='system-node-critical':
        karmada-aggregated-apiserver 组件的优先级类名称。
    --karmada-apiserver-priority-class='system-node-critical':
        karmada-apiserver 组件的优先级类名称。
    --karmada-controller-manager-priority-class='system-node-critical':
        karmada-controller-manager 组件的优先级类名称。
    --karmada-kube-controller-manager-priority-class='system-node-critical':
        karmada-kube-controller-manager 组件的优先级类名称。
    --karmada-scheduler-priority-class='system-node-critical':
        karmada-scheduler 组件的优先级类名称。
    --karmada-webhook-priority-class='system-node-critical':
        karmada-webhook 组件的优先级类名称。
```

通过上述参数，你可以在安装过程中为每个组件设置优先级类名称。

#### karmadactl addons

```bash
$ karmadactl addons enable --help |grep priority
    --descheduler-priority-class='system-node-critical':
        karmada-descheduler 组件的优先级类名称。
    --estimator-priority-class='system-node-critical':
        karmada-scheduler-estimator 组件的优先级类名称。
    --metrics-adapter-priority-class='system-node-critical':
        karmada-metrics-adaptor 组件的优先级类名称。
    --search-priority-class='system-node-critical':
        karmada-search 组件的优先级类名称。
```

通过上述参数，你可以在安装过程中为目标插件设置优先级类名称。 
