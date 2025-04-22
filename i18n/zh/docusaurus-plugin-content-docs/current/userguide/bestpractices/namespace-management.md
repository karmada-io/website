---
title: Namespace 管理
---

在 Kubernetes 集群中，工作负载部署在某个 Namespace 中。多集群部署意味着每个 Namespace 都必须存在于多个集群中。  
如果你希望以统一的方式管理这些 Namespaces，`karmada-controller-manager` 的 [namespace sync controller](https://github.com/karmada-io/karmada/blob/master/pkg/controllers/namespace/namespace_sync_controller.go) 能够将 Karmada中创建的Namespaces分发到各个成员集群。

## 默认 Namespace 分发策略
除保留的 Namespaces 外，其他所有 Namespaces 都会被自动分发到所有成员集群。  
保留的 Namespaces 包括：`karmada-system`、`karmada-cluster`、`karmada-es-*`、`kube-*`（通过 CLI 选项配置，详见下文）以及 `default`。

## 跳过 Namespace 自动分发

如果你不希望自动分发某个 Namespace:
- 选项 A：配置 `karmada-controller-manager`
- 选项 B：为 Namespace 添加 label
- 选项 C：自定义 Namespace 分发策略

### 选项 A：配置 `karmada-controller-manager`

在 `karmada-controller-manager` 中，标志 `--skipped-propagating-namespaces` 可用于跳过 Namespace 的自动分发，默认匹配正则表达式 "kube-.*"。示例如下：
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
此更改后：
- `ns1` 和 `ns2` 将不会分发到所有成员集群；
- 之前忽略的 "kube-.*" Namespace 将会分发到所有成员集群。

### 选项 B：为 Namespace 添加 label

通过配置 label `namespace.karmada.io/skip-auto-propagation: "true"` 来跳过 Namespace 的自动分发。示例如下：
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: example-ns
  labels:
    namespace.karmada.io/skip-auto-propagation: "true"
```
> 注意：如果 Namespace 已经分发到了成员集群，为其添加 label `namespace.karmada.io/skip-auto-propagation: "true"` 不会触发成员集群删除该 Namespace，但该 Namespace 将不会分发到新加入的成员集群。

### 选项 C：自定义 Namespace 分发策略

如果你希望完全控制哪些 Namespace 被分发，此选项提供了最大的灵活性，但需要你手动为新加入的集群添加分发策略。

#### 步骤 1：禁用 namespace-sync-controller（内部名称为 "namespace"）

更改 `karmada-controller-manager` 的启动命令，不运行 "namespace" 控制器：
```yaml
command:
- /bin/karmada-controller-manager
- --controllers=*,-namespace
```

#### 步骤 2：创建 clusterPropagationPolicy 分发 Namespaces

示例如下：
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
