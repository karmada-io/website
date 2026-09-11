---
title: 保留命名空间
---

> 注意: 应避免创建以 kube- 和 karmada- 为前缀的命名空间，因为它们被 Kubernetes 和 Karmada 系统命名空间所保留。
> 目前，以下命名空间中的资源不会被复制：

- 命名空间前缀为 `kube-`(包括但不限于 `kube-system`, `kube-public`, `kube-node-lease`)
- karmada-system
- karmada-cluster
- karmada-es-*