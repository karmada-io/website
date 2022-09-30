---
title: 基础概念
---

本篇文章介绍了 Karmada 的部分概念。

## 资源模板

Karmada 使用 Kubernetes 原生 API 来定义联合资源模板，以便于与 Kubernetes 现有工具进行集成。

### 传播策略

Karmada 提供了一个独立的传递（布局）策略 API 来定义多集群调度分布要求。

- 支持一对多映射：工作负载。 用户无需在每次创建联合应用程序时都指出调度限制。

- 通过默认策略，用户可以直接与 Kubernetes API 交互。

### 越权策略

Karmada 提供了一个独立的越权策略 API，专门用于自动化集群相关的配置。 例如：

- 根据成员集群区域覆盖图像前缀。

- 根据云提供商覆盖 StorageClass。

下图展示了 Karmada 的资源如何传播到成员集群。

![karmada-resource-relation](../resources/karmada-resource-relation.png)
