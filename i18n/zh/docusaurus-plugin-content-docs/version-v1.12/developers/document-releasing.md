---
title: 文档发布
---

每个小版本都有相应的文档版本。本指南是对整个发布过程的介绍。

## 保持多语言文档同步(手动)

有时贡献者不会更新所有语言文档的内容。在发布之前，请确保多语种文档同步。这将通过一个 issue 来跟踪。issue 应遵循以下格式:

```
This issue is to track documents which needs to sync zh for release 1.x:
* #268
```

## 更新参考文档(手动)

在发布之前，我们需要更新网站中的参考文档，包括 CLI 引用和组件引用。整个过程由脚本自动完成。按照以下步骤更新参考文档。

1. 将 `karmada-io/karmada` 和 `karmada-io/website` 克隆到本地环境。建议将这两个项目放在同一个文件夹中。

```text
$ git clone https://github.com/karmada-io/karmada.git
$ git clone https://github.com/karmada-io/website.git


$ tree -L 1
#.
#├── karmada
#├── website
```

2. 在 karmada 根目录下执行 generate 命令。

```shell
cd karmada/
go run ./hack/tools/genkarmadactldocs/gen_karmadactl_docs.go ../website/docs/reference/karmadactl/karmadactl-commands/
go run ./hack/tools/genkarmadactldocs/gen_karmadactl_docs.go ../website/i18n/zh/docusaurus-plugin-content-docs/current/reference/karmadactl/karmadactl-commands/
```

3. 逐一生成每个组件的参考文档。这里我们以 `karmada-apiserver` 为例

```shell
cd karmada/
go build ./hack/tools/gencomponentdocs/.
./gencomponentdocs ../website/docs/reference/components/ karmada-apiserver
./gencomponentdocs ../website/i18n/zh/docusaurus-plugin-content-docs/current/reference/components/ karmada-apiserver
```

## 建立 release-1.x(手动)

1. 更新 versions.json

```shell
$ cd website/
$ vim versions.json

[
  v1.5  # add a new version tag
  v1.4
  v1.3
]
```

2. 更新 vesioned_docs

```shell
mkdir versioned_docs/version-v1.5
cp docs/* versioned_docs/version-v1.5 -r
```

3. 更新 versioned_sidebars

```shell
cp versioned_sidebars/version-v1.4-sidebars.json versioned_sidebars/version-v1.5-sidebars.json
sed -i'' -e "s/version-v1.4/version-v1.5/g" versioned_sidebars/version-v1.5-sidebars.json
# update version-v1.5-sidebars.json based on sidebars.js
```

4. 更新中文的 versioned_docs

```shell
mkdir i18n/zh/docusaurus-plugin-content-docs/version-v1.5
cp i18n/zh/docusaurus-plugin-content-docs/current/*  i18n/zh/docusaurus-plugin-content-docs/version-v1.5 -r
```

5. 更新中文的 versioned_sidebars

```shell
cp i18n/zh/docusaurus-plugin-content-docs/current.json i18n/zh/docusaurus-plugin-content-docs/version-v1.5.json
sed -i'' -e "s/Next/v1.5/g" i18n/zh/docusaurus-plugin-content-docs/version-v1.5.json
```

## 检查变更的文件和主仓库的差异部分，并创建 Pull Request(手动)