---
title: Karmada 是什么？
slug: /

---

## Karmada：开放的、多云的、多集群的 Kubernetes 编排

Karmada（Kubernetes Armada）是一个 Kubernetes 管理系统，使您能够在多个 Kubernetes 集群和云中运行云原生应用程序，而无需更改应用程序。通过使用 Kubernetes 原生 API 并提供先进的调度功能，Karmada 实现了真正的开放式、多云 Kubernetes。

Karmada 旨在为多云和混合云场景下的多集群应用程序管理提供即插即用的自动化，具有集中式多云管理、高可用性、故障恢复和流量调度等关键功能。

Karmada 是[Cloud Native Computing Foundation](https://cncf.io/)（CNCF）的孵化项目。

## 为什么选择 Karmada

- __兼容 K8s 原生 API__
    - 从单集群到多集群的无侵入式升级
    - 现有 K8s 工具链的无缝集成

- __开箱即用__
    - 针对场景内置策略集，包括：Active-active, Remote DR, Geo Redundant 等。
    - 在多集群上进行跨集群应用程序自动伸缩、故障转移和负载均衡。

- __避免供应商锁定__
    - 与主流云提供商集成
    - 在集群之间自动分配、迁移
    - 未绑定专有供应商编排

- __集中式管理__
    - 位置无关的集群管理
    - 支持公有云、本地或边缘上的集群。

- __丰富多集群调度策略__
    - 集群亲和性、实例在多集群中的拆分调度/再平衡，
    - 多维 HA:区域/AZ/集群/提供商

- __开放和中立__
    - 由互联网、金融、制造业、电信、云提供商等联合发起。
    - 目标是与 CNCF 一起进行开放治理。

**注意：此项目是在 Kubernetes [Federation v1](https://github.com/kubernetes-retired/federation)和[v2](https://github.com/kubernetes-sigs/kubefed)基础之上开发的。某些基本概念从这两个版本继承而来。**

## 接下来做什么

以下是一些建议的下一步：

- 了解 Karmada 的[核心概念](./concepts.md)。
- 了解 Karmada 的[架构](./architecture.md)。
- 开始[安装 Karmada](../installation/installation.md)。
- 开始使用[交互式教程](https://killercoda.com/karmada/)。
