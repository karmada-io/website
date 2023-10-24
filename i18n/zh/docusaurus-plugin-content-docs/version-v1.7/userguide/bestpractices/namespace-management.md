---
title: Namespace 管理
---

在 Kubernetes 集群中，工作负载被部署在某个命名空间中。 多集群的工作负载意味着多个不同命名空间。如果想对这些命名空间进行统一管理。`karmada-controller-manager` 将负责这部分功能，将用户在Karmada 中创建的命名空间分发到成员集群。

## 默认 Namespace 分发策略
默认情况下，除了保留 Namespace，其他 Namespace 都会被自动分发到所有成员集群。保留 Namespace 包括：`karmada-system`、`karmada-cluster`、 `karmada-es-*`、`kube-*`、 `default`.

## 跳过 Namespace 自动分发
如果你不想 Karmada 自动分发 Namespace 到成员集群，有两种配置方法。一种是通过配置 `karmada-controller-manager` 的启动参数，另一种是对 Namespace 打 label。

### 配置 `karmada-controller-manager`
配置 `karmada-controller-manager` 启动参数 `skipped-propagating-namespaces`，可以实现跳过特定 Namespace 自动分发。示例如下：
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
`ns1` 和 `ns2` 不会自动分发到所有成员集群。

### 对 Namespace 打 label
使用 Label `namespace.karmada.io/skip-auto-propagation: "true"`， 可以实现跳过特定 Namespace 自动分发. 示例如下:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: example-ns
  labels:
    namespace.karmada.io/skip-auto-propagation: "true"
```
> 注意：如果 Namespace 已经被分发到成员集群，对 Namespace 打 `namespace.karmada.io/skip-auto-propagation: "true"` label 不会触发成员集群删除此 Namespace，但此 Namespace 不会分发到后续新加入的成员集群。
