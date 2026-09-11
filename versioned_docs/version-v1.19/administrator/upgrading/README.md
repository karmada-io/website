---
title: Upgrading Instruction
---

## Overview
Karmada uses the [semver versioning](https://semver.org/) and each version in the format of v`MAJOR`.`MINOR`.`PATCH`:
- The `PATCH` release does not introduce breaking changes.
- The `MINOR` release might introduce minor breaking changes with a workaround.
- The `Major` release might introduce backward-incompatible behavior changes.

## How to Upgrade

To upgrade Karmada, you can follow the [Upgrade Guide](./how-to-upgrade.md).

## Details Upgrading Instruction

Cross-version upgrades are not recommended. It is recommended to use the latest PATCH version when upgrading. For example, if you are upgrading from
v1.1.x to v1.2.x and the available patch versions are v1.2.0, v1.2.1 and v1.2.2, then select v1.2.2.

For detailed instructions on MINOR version upgrades, refer to the corresponding upgrade guide.
