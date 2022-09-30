---
title: 什么是 Karmada ？
slug: /

---

## Karmada：一款开放、多云、多集群的管理系统

Karmada (Kubernetes Armada) 是一个 Kubernetes 管理系统，可以使您在无需更改应用程序的情况下，跨集群、跨云运行云原生 APP 。 通过使用 Kubernetes 原生 API 接口，并提供高级调度功能，Karmada 真正实现了开放的、多云的 Kubernetes。

Karmada 旨在为多云和混合云场景中的多集群应用程序管理提供一站式方案，
重要特性有集中式多云管理、高可用性、错误恢复和流量调度等。

Karmada 属于 [云原生计算基金会](https://cncf.io/)（CNCF）的沙盒项目。

## 为什么选择 Karmada：
- __兼容 K8s 原生 API__
     - 无需升级更新，从单集群到多集群
     - 无缝集成现有 K8s 工具链

- __开箱即用__
     - 内置多种场景策略，包括：双活、远程容灾、异地冗余等
     - 跨集群应用程序在多集群上实现自动扩展、错误恢复以及负载平衡

- __避免与供应商锁定__
     - 与主流云提供商集成
     - 自动跨集群分配迁移
     - 不依赖于专有的供应商编排

- __集中管理__
     - 位置无关的集群管理
     - 支持公共云、 on-prem 云以及边缘云上的集群

- __富有成效的多集群调度策略__
     - 集群亲和性、多集群拆分/重新部署，
     - 多维度高可用性：区域/AZ/集群/提供商

- __开放与中立__
     - 由互联网、金融、制造、电信、云提供商等共同发起
     - 目标是与 CNCF 开放治理

**注意：本项目为 Kubernetes [Federation v1](https://github.com/kubernetes-retired/federation) 和 [v2](https://github.com/kubernetes-sigs/kubefed) 的延续开发，继承了这两个版本的一些基本概念。**


## 下一篇

推荐您接下来阅读以下文档：

- 学习 Karmada 的 [基础概念](./getting-started/core-concept)。
- 学习 Karmada 的 [架构](./getting-started/architecture)。
- 开始 [安装 Karmada](./install)。