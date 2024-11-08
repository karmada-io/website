---
title: 验证发布组件
---

## 镜像验证

karmada从v1.7版本开始引入cosign对发布的镜像进行验证。具体操作如下：

### 先决条件

你需要安装以下工具：

- `cosign`（[安装指南](https://docs.sigstore.dev/cosign/installation/)）
- `curl`（通常由你的操作系统提供）
- `jq`（[下载 jq](https://stedolan.github.io/jq/download/)）

### 验证镜像签名

#### 使用 cosign cli验证镜像

karmada在v1.7后引入验证工具`cosign`。已发布的镜像列表请参见[karmada镜像](https://hub.docker.com/u/karmada)。

从这些镜像选择一个镜像，并使用 `cosign verify` 命令来验证它的签名：

```shell
cosign verify docker.io/karmada/karmada-aggregated-apiserver:latest \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  --certificate-identity-regexp=^https://github.com/karmada-io/karmada/.*$ | jq
```

回显如下则表示验证成功：

```shell
Verification for index.docker.io/karmada/karmada-aggregated-apiserver:latest --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - Existence of the claims in the transparency log was verified offline
  - The code-signing certificate was verified using trusted certificate authority certificates
[
  {
    "critical": {
      "identity": {
        "docker-reference": "index.docker.io/karmada/karmada-aggregated-apiserver"
      },
      "image": {
        "docker-manifest-digest": "sha256:c6d85e111e1ca4da234e87fb48f8ff170c918a0e6893d9ac9e888a4e7cc0056f"
      },
      "type": "cosign container image signature"
    },
    "optional": {
      "1.3.6.1.4.1.57264.1.1": "https://token.actions.githubusercontent.com",
      "1.3.6.1.4.1.57264.1.2": "push",
      "1.3.6.1.4.1.57264.1.3": "e5277b6317ac1a4717f5fac4057caf51a5d248fc",
      "1.3.6.1.4.1.57264.1.4": "latest image to DockerHub",
      "1.3.6.1.4.1.57264.1.5": "karmada-io/karmada",
      "1.3.6.1.4.1.57264.1.6": "refs/heads/master",
      "Bundle": {
        "SignedEntryTimestamp": "MEYCIQD4R9XlhgQkjVAg4XuW857iqkNrSxbQB9k3x4Ie8IshgAIhAILn8m+eOAjYxxcpFU42ghoiiuMnyY+Xda2CBE5WZruq",
        "Payload": {
       ...
```

当你完成某个镜像的验证时，可以在你的 Pod 清单通过摘要值来指定该镜像，例如：

```console
registry-url/image-name@sha256:c6d85e111e1ca4da234e87fb48f8ff170c918a0e6893d9ac9e888a4e7cc0056f
```

要了解更多信息，请参考[k8s的镜像拉取策略](https://kubernetes.io/zh-cn/docs/concepts/containers/images/#image-pull-policy)章节中如何指定镜像的摘要来拉取镜像 。

#### 使用准入控制器验证镜像签名

镜像验证的过程也可以在部署时使用 [sigstore policy-controller](https://docs.sigstore.dev/policy-controller/overview) 控制器来实现。以下是一些有助于你开始使用 `policy-controller` 的资源：

- [安装](https://github.com/sigstore/helm-charts/tree/main/charts/policy-controller)
- [配置选项](https://github.com/sigstore/policy-controller/tree/main/config)
