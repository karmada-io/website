---
title: 文档发布
---

每个小版本都有相应的文档版本。本指南是对整个发布过程的介绍。

## 保持多语言文档同步(手动)

有时贡献者不会更新所有语言文档的内容。在发布之前，请确保多语种文档同步。这将通过一个 issue 来跟踪。issue 应遵循以下格式:

```
This issue is to track documents which need to be synced with zh for release 1.x:
* #268
```

## 更新参考文档(手动)

在发布之前，我们需要更新网站中的参考文档，包括 CLI 引用，组件引用和 API 文档。整个过程由脚本自动完成。按照以下步骤更新参考文档。

1. 将 `karmada-io/website` 克隆到本地环境。

```bash
git clone https://github.com/karmada-io/website.git
```

2. 生成参考文档。

```bash
$ cd website/infra/document-releasing
$ hack/update-reference.sh
```

## 建立 release-1.x(手动)

整个过程由脚本自动完成。按照以下步骤建立 release-1.x。

以 release-1.18 为例，流程如下：
```bash
# website/infra/document-releasing
$ hack/release.sh v1.18
```

## 停止维护旧版本分支(手动)

Karmada 网站只维护最新的 6 个发布版本。当新版本发布后，旧版本将不再维护。此步骤用于删除过期版本，确保只保留最新的 6 个版本。

首先确认需要删除的版本（例如 v1.12），然后执行以下命令：

```bash
# website/infra/document-releasing
$ hack/prune-release.sh v1.12
```

## 检查变更的文件和主仓库的差异部分，并创建 Pull Request(手动)
