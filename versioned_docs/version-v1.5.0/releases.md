---
title:  Releases
---

## Release Notes and Assets

Release notes are available on GitHub at https://github.com/karmada-io/karmada/releases.

## Release Management

This section provides guidelines on release timelines and release branch maintenance.

### Release Timelines

Karmada uses the Semantic Versioning schema. Karmada v1.0.0 was released in December 2021. This project follows a given version number MAJOR.MINOR.PATCH.

### MAJOR release 

Major releases contain large features, design and architectural changes, and may include incompatible API changes. Major releases are low frequency and stable over a long period of time.

### MINOR release

Minor releases contain features, enhancements, and fixes that are introduced in a backwards-compatible manner. Since Karmada is a fast growing project and features continue to iterate rapidly, having a minor release approximately every few months helps balance speed and stability.

* Roughly every 3 months

### PATCH release

Patch releases are for backwards-compatible bug fixes and very minor enhancements which do not impact stability or compatibility. Typically only critical fixes are selected for patch releases. Usually there will be at least one patch release in a minor release cycle.

* When critical fixes are required, or roughly each month

### Versioning

Karmada uses GitHub tags to manage versions. New releases and release candidates are published using the wildcard tag`v<major>.<minor>.<patch>`.

Whenever a PR is merged into the master branch, CI will pull the latest code, generate an image and upload it to the mirror repository. The latest image of Karmada components can usually be downloaded online using the latest tag. 
Whenever a release is released, the image will also be released, and the tag is the same as the tag of the release above.

### Issues

Non-critical issues and features are always added to the next minor release milestone, by default.

Critical issues, with no work-arounds, are added to the next patch release.

### Branches and PRs

Release branches and PRs are managed as follows:

* All changes are always first committed to `master`.
* Branches are created for each major or minor release.
* The branch name will contain the version, for example release-1.2.
* Patch releases are created from a release branch.
* For critical fixes that need to be included in a patch release, PRs should always be first merged to master and then cherry-picked to the release branch. PRs need to be guaranteed to have a release note written and these descriptions will be reflected in the next patch release.
  The cherry-pick process of PRs is executed through the script. See usage [here](https://karmada.io/docs/contributor/cherry-picks).
* For complex changes, specially critical bugfixes, separate PRs may be required for master and release branches.
* The milestone mark (for example v1.4) will be added to PRs which means changes in PRs are one of the contents of the corresponding release.
* During PR review, the Assignee selection is used to indicate the reviewer.

### Release Planning

A minor release will contain a mix of features, enhancements, and bug fixes.

Major features follow the Karmada Design Proposal process. You can refer to [here](https://github.com/karmada-io/karmada/tree/master/docs/proposals/resource-interpreter-webhook) as a proposal example.

During the start of a release, there may be many issues assigned to the release milestone. The priorities for the release are discussed in the bi-weekly community meetings. 
As the release progresses several issues may be moved to the next milestone. Hence, if an issue is important it is important to advocate its priority early in the release cycle.

### Release Artifacts

The Karmada container images are availble at `dockerHub`. 
You can visit `https://hub.docker.com/r/karmada/<component_name>` to see the details of images.
For example, [here](https://hub.docker.com/r/karmada/karmada-controller-manager) for karmada-controller-manager.

Since v1.2.0, the following artifacts are uploaded:

* crds.tar.gz
* karmada-chart-v<version_number>.tgz
* karmadactl-darwin-amd64.tgz
* karmadactl-darwin-amd64.tgz.sha256
* karmadactl-darwin-arm64.tgz
* karmadactl-darwin-arm64.tgz.sha256
* karmadactl-linux-amd64.tgz
* karmadactl-linux-amd64.tgz.sha256
* karmadactl-linux-arm64.tgz
* karmadactl-linux-arm64.tgz.sha256
* kubectl-karmada-darwin-amd64.tgz
* kubectl-karmada-darwin-amd64.tgz.sha256
* kubectl-karmada-darwin-arm64.tgz
* kubectl-karmada-darwin-arm64.tgz.sha256
* kubectl-karmada-linux-amd64.tgz
* kubectl-karmada-linux-amd64.tgz.sha256
* kubectl-karmada-linux-arm64.tgz
* kubectl-karmada-linux-arm64.tgz.sha256
* Source code(zip)
* Source code(tar.gz)

You can visit `https://github.com/karmada-io/karmada/releases/download/v<version_number>/<artifact_name>` to download the artifacts above.

For example:

```shell
wget https://github.com/karmada-io/karmada/releases/download/v1.3.0/karmadactl-darwin-amd64.tgz
```