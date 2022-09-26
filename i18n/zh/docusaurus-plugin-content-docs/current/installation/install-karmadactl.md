---
title: Installation from Karmadactl
---

You can install `karmadactl` in any of the following ways:

- Download from the release.
- Build from source code.

## Download from the release

Karmada provides `karmadactl` plug-in download service since v1.2.0. You can choose proper plug-in version which fits your operator system form [karmada release](https://github.com/karmada-io/karmada/releases).

Take v1.2.1 that working with linux-amd64 os as an example:

```bash
wget https://github.com/karmada-io/karmada/releases/download/v1.2.1/karmadactl-linux-amd64.tgz

tar -zxf karmadactl-linux-amd64.tgz
```

Next, move `karmadactl` executable file to `PATH` path.

## Build from source code

Clone karmada repo and run `make` cmd from the repository:

```bash
make karmadactl
```

Next, move the `karmadactl` executable file under the `_output` folder in the project root directory to the `PATH` path.
