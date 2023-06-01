---
title: 升级指导
---

## 概述
Karmada 使用 [semver 发版机制](https://semver.org/)，每个版本的格式为 v`MAJOR`.`MINOR`.`PATCH`：
- `PATCH` 版本不会引入破坏性的变更。
- `MINOR` 版本可能引入少量破坏性的变更，但会提供一些应对办法。
- `Major` 版本可能引入向后不兼容的重大变更。

## 常规升级流程
### 升级 API
对于引入 API 变更的版本，必须升级 Karmada 组件所依赖的 Karmada API (CRD) 来保持一致。

Karmada CRD 由两部分组成：
- bases：通过 API 结构生成的 CRD 定义。
- patches：针对 CRD 的转换设置。

为了支持多个版本的自定义资源，`patches` 应被注入到 `bases` 中。
为此我们引入了 `kustomization.yaml` 配置文件，然后使用 `kubectl kustomize` 构建最终的 CRD。

`bases`、`patches` 和 `kustomization.yaml` 现在位于代码仓库的 `charts/_crds` 目录。

#### 手动升级 API

**步骤 1：获取 Webhook CA 证书**

在构建最终 CRD 之前，CA 证书将被注入到 `patches` 中。
我们可以从 `MutatingWebhookConfiguration` 或 `ValidatingWebhookConfiguration` 配置中检索此证书，例如：
```bash
kubectl get mutatingwebhookconfigurations.admissionregistration.k8s.io mutating-config
```
从 yaml 路径 `webhooks.name[x].clientConfig.caBundle` 复制 `ca_string`，然后替换 `patches` 中 yaml 文件内的 `{{caBundle}}`，例如：
```bash
sed -i'' -e "s/{{caBundle}}/${ca_string}/g" ./"charts/karmada/_crds/patches/webhook_in_resourcebindings.yaml"
sed -i'' -e "s/{{caBundle}}/${ca_string}/g" ./"charts/karmada/_crds/patches/webhook_in_clusterresourcebindings.yaml"
```

**步骤 2：构建最终的 CRD**

通过 `kubectl kustomize` 命令生成最终的 CRD，例如：
```bash
kubectl kustomize ./charts/karmada/_crds 
```
或者你可以运行以下命令将其应用到 `karmada-apiserver`：
```bash
kubectl kustomize ./charts/karmada/_crds | kubectl apply -f -
```

### 升级组件
组件升级包括镜像版本更新和可能的命令参数变更。

> 有关参数变更，请参阅以下`详细升级说明`。

## 详细升级说明

以下说明适用于 minor 版本升级。不推荐跨版本升级。
另外升级时建议使用最新的 patch 版本，例如如果从 v1.1.x 升级到 v1.2.x 时可用的 patch 版本为
v1.2.0、v1.2.1 和 v1.2.2， 则选择 v1.2.2。

### [v0.8 升级到 v0.9](./v0.8-v0.9.md)
### [v0.9 升级到 v0.10](./v0.9-v0.10.md)
### [v0.10 升级到 v1.0](./v0.10-v1.0.md)
### [v1.0 升级到 v1.1](./v1.0-v1.1.md)
### [v1.1 升级到 v1.2](./v1.1-v1.2.md)
### [v1.2 升级到 v1.3](./v1.2-v1.3.md)
### [v1.3 升级到 v1.4](./v1.3-v1.4.md)
### [v1.4 升级到 v1.5](./v1.4-v1.5.md)
### [v1.5 升级到 v1.6](./v1.5-v1.6.md)
