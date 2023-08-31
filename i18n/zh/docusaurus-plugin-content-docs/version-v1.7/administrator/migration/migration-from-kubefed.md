---
title: 从 Kubefed 迁移
---

Karmada 是在 Kubernetes [Federation v1](https://github.com/kubernetes-retired/federation) 和
[Federation v2（也称为 Kubefed）](https://github.com/kubernetes-sigs/kubefed)的基础上开发的。
Karmada 继承了很多两者的概念。例如：

- **资源模板**：Karmada 使用 Kubernetes 原生 API 定义用于联邦化的资源模板，使其易于与已采用 Kubernetes 的现有工具集成。
- **分发策略**：Karmada 提供独立的 Propagation(placement) Policy API 来定义多集群调度和分发要求。
- **差异化策略**：Karmada 提供了独立的 Override Policy API，专门自动化处理集群相关的配置。

Kubefed 的大多数功能都在 Karmada 进行了重塑，因此可以说 Karmada 是其自然继任者。

一般来说，从 Kubefed 迁移到 Karmada 很容易。
本文档概述了 Kubefed 用户的基本迁移路径。
**注意：**本文档正在编撰中，欢迎任何反馈。

## 集群注册

Kubefed 在 `kubefedctl` 命令行工具中提供 `join` 和 `unjoin` 命令，Karmada 也在 `karmadactl` 中实现了这两个命令。

请参阅 [kubefed 集群注册](https://github.com/kubernetes-sigs/kubefed/blob/master/master/docs/cluster-registration.md)和
[Karmada 集群注册](https://karmada.io/docs/userguide/clustermanager/cluster-registration)了解详情。

### 接入集群

假设您如下使用 `kubefedctl` 工具接入集群：

```bash
kubefedctl join cluster1 --cluster-context cluster1 --host-cluster-context cluster1
```

现在通过 Karmada，您可以用 `karmadactl` 工具达到同样的效果：

```
karmadactl join cluster1 --cluster-context cluster1 --karmada-context karmada 
```

`join` 命令背后的行为在 Kubefed 和 Karmada 中类似。
对于 Kubefed，它将创建一个 Kubefed 和 Karmada 所使用的 `join` 命令在后台具有类似的行为。
对于 Kubefed，此命令将创建一个对象，
而 Karmada 将创建一个 [Cluster](https://github.com/karmada-io/karmada/blob/aa2419cb1f447d5512b2a998ec81c9013fa31586/pkg/apis/cluster/types.go#L36)对象来描述所接入的集群。

### 检查接入集群的状态

假设您如下使用 `kubefedctl` 工具来检查接入集群的状态：

```
kubectl -n kube-federation-system get kubefedclusters

NAME       AGE   READY   KUBERNETES-VERSION
cluster1   1m    True    v1.21.2
cluster2   1m    True    v1.22.0
```

现在通过 Karmada，您可以用 `karmadactl` 工具达到同样的效果：

```
kubectl get clusters

NAME      VERSION   MODE   READY   AGE
member1   v1.20.7   Push   True    66s
```

Kubefed 管理着 `PUSH` 模式的集群，但是 Karmada 支持 `PUSH` 和 `PULL` 两种模式。
请参阅[集群模式概述](https://karmada.io/docs/userguide/clustermanager/cluster-registration)。

### 移除集群

假设您如下使用 `kubefedctl` 工具移除集群：

```
kubefedctl unjoin cluster2 --cluster-context cluster2 --host-cluster-context cluster1
```

现在通过 Karmada，您可以用 `karmadactl` 工具达到同样的效果：

```
karmadactl unjoin cluster2 --cluster-context cluster2 --karmada-context karmada 
```

在 Kubefed 和 Karmada 中 `unjoin` 命令后台的行为是类似的，都是通过移除集群对象从控制平面中移除集群。

## 分发工作负载到集群

假设您要将一个工作负载（`deployment`）分发到名为 `cluster1` 和 `cluster2` 的两个集群、
您可能需要将以下 yaml 部署到 Kubefed：

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

现在使用 Karmada，这个 yaml 可以拆分为 3 个 yaml，`template`、`placement` 和 `overrides` 各一个。

在 Karmada 中，模板不需要嵌入到 `Federated CRD` 中，它与 Kubernetes 的原生声明方式相同：

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

对于 `placement` 部分，Karmada 提供了 `PropagationPolicy` API 来保存放置规则：

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

`PropagationPolicy` 定义了哪些资源 (`resourceSelectors`) 应该被分发到哪里 (`placement`) 的规则。
参见[资源分发](https://karmada.io/docs/userguide/scheduling/resource-propagating)了解更多细节。

对于 `override` 部分，Karmada 提供了 `OverridePolicy` API 来保存差异化规则：

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

`OverridePolicy` 定义了哪些资源 (`resourceSelectors`) 在分发到哪里 (`targetCluster`) 时应该被覆盖的规则。

除了 Kubefed 之外，Karmada 还提供了各种替代方案来声明差异化规则，参见
[Overrider](https://karmada.io/docs/userguide/scheduling/override-policy#overriders)了解更多细节。

## FAQ

### Karmada 会提供平滑迁移的工具吗？

我们还没有这个计划，因为我们接触了一些 Kubefed 用户，发现他们通常不使用 Vanilla Kubefed，而是使用克隆版本。
他们对 Kubefed 进行了大量扩展以满足他们的需求。
所以，要维护一个通用的工具来满足大多数用户的需求可能是相当困难的。

我们非常期待更多的反馈，请随时与我们联系，我们将乐意支持您完成迁移工作。
