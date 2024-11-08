---
title: Documentation Releasing
---

Every minor release will have a corresponding documentation release. This guide is an introduction of the whole release procedure.

## Keep Multilingual Documents in Sync(manually)

Sometimes contributors do not update the content of the documentation in all languages. Before releasing, ensure the multilingual documents are in sync.
This will be tracked by an issue. The issue should follow the format:

```
This issue is to track documents which needs to sync zh for release 1.x:
* #268
```

## Update Reference Documents(manually)

Before releasing, we need to update reference docs in the website, which includes CLI references and component references. The whole process is done by scripts automatically.
Follow these steps to update reference docs.

1. Clone `karmada-io/karmada` and `karmada-io/website` to the local environment. It's recommended to step up these two projects in the same folder.

```text
$ git clone https://github.com/karmada-io/karmada.git
$ git clone https://github.com/karmada-io/website.git


$ tree -L 1
#.
#├── karmada
#├── website
```

2. Run generate command in karmada root dir.

```shell
cd karmada/
go run ./hack/tools/genkarmadactldocs/gen_karmadactl_docs.go ../website/docs/reference/karmadactl/karmadactl-commands/
go run ./hack/tools/genkarmadactldocs/gen_karmadactl_docs.go ../website/i18n/zh/docusaurus-plugin-content-docs/current/reference/karmadactl/karmadactl-commands/
```

3. Generate reference docs of each component one by one. Here we take `karmada-apiserver` as an example.

```shell
cd karmada/
go build ./hack/tools/gencomponentdocs/.
./gencomponentdocs ../website/docs/reference/components/ karmada-apiserver
./gencomponentdocs ../website/i18n/zh/docusaurus-plugin-content-docs/current/reference/components/ karmada-apiserver
```

## Setup release-1.x(manually)

1. Update versions.json

```shell
$ cd website/
$ vim versions.json

[
  v1.5  # add a new version tag
  v1.4
  v1.3
]
```

2. Update versioned_docs

```shell
mkdir versioned_docs/version-v1.5
cp docs/* versioned_docs/version-v1.5 -r
```

3. Update versioned_sidebars

```shell
cp versioned_sidebars/version-v1.4-sidebars.json versioned_sidebars/version-v1.5-sidebars.json
sed -i'' -e "s/version-v1.4/version-v1.5/g" versioned_sidebars/version-v1.5-sidebars.json
# update version-v1.5-sidebars.json based on sidebars.js
```

4. Update versioned_docs for zh

```shell
mkdir i18n/zh/docusaurus-plugin-content-docs/version-v1.5
cp i18n/zh/docusaurus-plugin-content-docs/current/*  i18n/zh/docusaurus-plugin-content-docs/version-v1.5 -r
```

5. Update versioned_sidebars for zh

```shell
cp i18n/zh/docusaurus-plugin-content-docs/current.json i18n/zh/docusaurus-plugin-content-docs/version-v1.5.json
sed -i'' -e "s/Next/v1.5/g" i18n/zh/docusaurus-plugin-content-docs/version-v1.5.json
```

## Check the difference of website and send a pull request(manually)
