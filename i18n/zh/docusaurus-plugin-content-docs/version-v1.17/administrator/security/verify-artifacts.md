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

## SBOM

SBOM, 也即软件物料清单, 是软件资源中存在的所有组件（如第三方库或模块）的清单，已成为软件安全和软件供应链风险管理的关键组成部分。

从v1.10.2版本开始，Karmada 的发布产物中会提供 Karmada 项目的软件物料清单。通过集成不同的工具，我们可以从中能够获得:

- 组件与依赖列表
- 版本信息
- 许可证
- 依赖关系树/图

以下是使用工具解析 Karmada 的 SBOM 的两个示例。

### 先决条件

你需要安装以下工具：

- `bom` ([安装指南](https://github.com/kubernetes-sigs/bom#installation))
- `trivy` ([安装指南](https://aquasecurity.github.io/trivy/v0.52/getting-started/installation/))
- `tar` (通常由你的系统提供)

接下来，解压缩 `sbom.tar.gz` 并获取其中的 SBOM。

```shell
$ tar -zxvf sbom.tar.gz
sbom-karmada.spdx
```

### 查看 SBOM 所含信息的结构

使用命令 `bom document outline` 渲染 SBOM 所包含的内容，获取其信息结构。

```shell
$ bom document outline sbom-karmada.spdx
               _      
 ___ _ __   __| |_  __
/ __| '_ \ / _` \ \/ /
\__ \ |_) | (_| |>  < 
|___/ .__/ \__,_/_/\_\
    |_|               

 📂 SPDX Document /github/workspace
  │ 
  │ 📦 DESCRIBES 1 Packages
  │ 
  ├ /github/workspace
  │  │ 🔗 2 Relationships
  │  ├ CONTAINS PACKAGE go.mod
  │  │  │ 🔗 1 Relationships
  │  │  └ CONTAINS PACKAGE github.com/karmada-io/karmada
  │  │  │  │ 🔗 186 Relationships
  │  │  │  ├ DEPENDS_ON PACKAGE github.com/go-task/slim-sprig@0.0.0-20230315185526-52ccab3ef572
  │  │  │  ├ DEPENDS_ON PACKAGE sigs.k8s.io/structured-merge-diff/v4@4.4.1
  │  │  │  ├ DEPENDS_ON PACKAGE k8s.io/apimachinery@0.29.4
  │  │  │  ├ DEPENDS_ON PACKAGE k8s.io/kube-openapi@0.0.0-20231010175941-2dd684a91f00
......
```
### 扫描 SBOM 以查找漏洞

Trivy 能将 SBOM 作为输入，查找安全漏洞。

```shell
$ trivy sbom sbom-karmada.spdx
2024-07-01T17:00:36+08:00       INFO    Need to update DB
2024-07-01T17:00:36+08:00       INFO    Downloading DB...       repository="ghcr.io/aquasecurity/trivy-db:2"
49.28 MiB / 49.28 MiB [-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------] 100.00% 1.26 MiB p/s 39s
2024-07-01T17:01:17+08:00       INFO    Vulnerability scanning is enabled
2024-07-01T17:01:17+08:00       INFO    Detected SBOM format    format="spdx-tv"
2024-07-01T17:01:17+08:00       INFO    Number of language-specific files       num=3
2024-07-01T17:01:17+08:00       INFO    [gobinary] Detecting vulnerabilities...
2024-07-01T17:01:17+08:00       INFO    [gomod] Detecting vulnerabilities...
2024-07-01T17:01:17+08:00       INFO    [pip] Detecting vulnerabilities...
```

如果命令输出如上，说明当前 Karmada 项目文件系统中的软件组件和依赖项没有已知的安全漏洞。如果希望忽略还没有可修复版本的安全漏洞，可以加上参数 `--ignore-unfixed`。

```shell
$ trivy sbom sbom-karmada.spdx --ignore-unfixed
```
