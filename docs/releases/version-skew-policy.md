---
title: Version Support and Skew Policy
---

This page explains which Karmada versions are supported, how component versions may differ, and which member
cluster Kubernetes versions are compatible. It consolidates the rules that are maintained in
[Releases](../releases.md), [Upgrading Instruction](../administrator/upgrading/README.md), and
[Kubernetes Compatibility](../administrator/compatibility/compatibility.md).

## Supported Karmada versions

Karmada follows [Semantic Versioning](https://semver.org/) in the form `MAJOR.MINOR.PATCH`.

- Minor releases are published roughly every three months.
- The community maintains the three most recent minor releases.
- Each minor release receives approximately nine months of patch maintenance.
- Patch releases are cut from release branches when critical fixes are required.

For example, when the latest release is `v1.19`, the supported release lines are `v1.19`, `v1.18`, and `v1.17`.
Users should run the latest patch release of a supported minor release. See [Releases](../releases.md) for the
release lifecycle and artifact details.

## Supported upgrade paths

- **Patch upgrades** within the same minor release are supported, for example `v1.19.1` to `v1.19.2`.
- **Minor upgrades** must be performed one minor release at a time, for example `v1.17` to `v1.18`, then `v1.18`
  to `v1.19`.
- **Skipping minor releases** is not supported. Upgrading directly from `v1.17` to `v1.19` is not a supported
  upgrade path.
- When upgrading, use the latest patch release of the source and target minor versions where possible.

For releases that introduce API changes, upgrade the Karmada CRDs before upgrading the components that rely on
them. The complete procedure is documented in [How to Upgrade](../administrator/upgrading/how-to-upgrade.md).

## Control plane component versions

Karmada control plane components are released and tested together. The supported configuration is to run all
control plane components from the same Karmada release:

- `karmada-apiserver`
- `karmada-controller-manager`
- `karmada-scheduler`
- `karmada-webhook`
- `karmada-aggregated-apiserver`
- `karmada-search`, `karmada-descheduler`, and `karmada-scheduler-estimator`, when enabled

The official installation methods, including the Helm chart and `karmadactl init`, deploy these components with a
single Karmada release. Do not mix minor releases in one control plane. A component from an older or newer minor
release is not a supported configuration, even when the control plane starts successfully.

`karmada-agent`, used for pull mode, is part of the same release. Run the agent at the same Karmada release as the
control plane it registers with.

The Karmada Operator should match the minor release of the Karmada components it manages. Upgrade the operator
before or together with the components, as described in the operator upgrade instructions.

Other projects in the Karmada ecosystem, such as the Karmada Dashboard, have their own release cycles. Follow the
compatibility guidance published by each project.

## Member cluster Kubernetes compatibility

Each Karmada release integrates Kubernetes client libraries and is validated against the latest 10 Kubernetes
versions at the time of release. For example, Karmada v1.14 uses Kubernetes client v1.32 and is validated against
Kubernetes v1.23 through v1.32.

Karmada propagates a resource to a member cluster only when both Karmada and the member cluster support the
resource's API. If a member cluster does not serve an API, Karmada skips the resource for that cluster. Karmada
does not convert resources to an older API version automatically; upgrade member clusters that are outside the
validated range.

See [Kubernetes Compatibility](../administrator/compatibility/compatibility.md) for the full compatibility
guidance and for details about the Karmada API server version.

## Version skew summary

| Component pair | Supported configuration |
| :--- | :--- |
| Control plane components | Same Karmada release |
| `karmada-agent` and control plane | Same Karmada release |
| Karmada Operator and Karmada | Same minor release |
| Karmada and member cluster Kubernetes | Within the validated range for that Karmada release |
| Karmada Dashboard and Karmada | Follow the Dashboard's compatibility documentation |

:::note

This page describes the configurations the community tests and supports. Other combinations may work in
specific environments, but they are not covered by the project's testing or support policy.

:::
