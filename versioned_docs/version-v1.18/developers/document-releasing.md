---
title: Documentation Releasing
---

Every minor release will have a corresponding documentation release. This guide is an introduction of the whole release procedure.

## Keep Multilingual Documents in Sync(manually)

Sometimes contributors do not update the content of the documentation in all languages. Before releasing, ensure the multilingual documents are in sync.
This will be tracked by an issue. The issue should follow the format:

```
This issue is to track documents which need to sync zh for release 1.x:
* #268
```

## Update Reference Documents(manually)

Before releasing, we need to update reference docs in the website, which includes CLI references, component references and API documentation. The whole process is done by scripts automatically.
Follow these steps to update reference docs.

1. Clone `karmada-io/website` to the local environment.

```bash
git clone https://github.com/karmada-io/website.git
```

2. Generate reference docs.

```bash
$ cd website/infra/document-releasing
$ hack/update-reference.sh
```

## Setup release-1.x(manually)

The whole process is done by scripts automatically. Follow these steps to setup release-1.x.

Take release-1.18 as an example, the process is as follows:
```bash
# website/infra/document-releasing
$ hack/release.sh v1.18
```

## Stop maintaining the old release branch(manually)

The Karmada website only maintains the latest 6 release versions. When a new version is released, older versions will no longer be maintained. This step removes the outdated version to ensure only the latest 6 versions are kept.

First, confirm the version to be removed (e.g., v1.12), then run the following command:

```bash
# website/infra/document-releasing
$ hack/prune-release.sh v1.12
```

## Check the difference of website and send a pull request(manually)
