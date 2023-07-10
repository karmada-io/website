---
title: Installation of CLI Tools
---
## Install Karmadactl

You can install `karmadactl` in any of the following ways:

- One-click installation.
- Build from source code.

### One-click installation

Karmada provides `karmadactl` download service since v1.2.0. You can choose the proper version which fits your operating system from [karmada release](https://github.com/karmada-io/karmada/releases).

To install the latest release run:

```shell
curl -s https://raw.githubusercontent.com/karmada-io/karmada/master/hack/install-cli.sh | sudo bash
```

The install script does the following:

- attempts to detect your OS
- downloads and unpacks the release tar file in a temporary directory
- copies the karmadactl binary to /usr/local/bin
- removes the temporary directory

Also, you can export `INSTALL_CLI_VERSION` env to select the version you want to install.

For example, use the following command to install the 1.3.0 karmadactl:

```shell
export INSTALL_CLI_VERSION=1.3.0
curl -s https://raw.githubusercontent.com/karmada-io/karmada/master/hack/install-cli.sh | sudo bash
```

:::note

install-cli.sh only supports CLI tools after 1.2.0.

:::

### Build from source code

Clone karmada repo and run `make` cmd from the repository:

```bash
make karmadactl
```

Next, move the `karmadactl` executable file under the `_output` folder in the project root directory to the `PATH` path.

## Install kubectl-karmada

You can install `kubectl-karmada` plug-in in any of the following ways:

- One-click installation.
- Install using Krew.
- Build from source code.

### Prerequisites

#### kubectl

`kubectl` is the Kubernetes command line tool lets you control Kubernetes clusters.
For installation instructions see [installing kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).

### One-click installation

Karmada provides `kubectl-karmada` plug-in download service since v0.9.0. You can choose the proper plug-in version which fits your operating system from [karmada release](https://github.com/karmada-io/karmada/releases).

The installation process is the same as installing karmadactl, you only need to add a parameter of `kubectl-karmada`.

To install the latest release run:

```shell
curl -s https://raw.githubusercontent.com/karmada-io/karmada/master/hack/install-cli.sh | sudo bash -s kubectl-karmada
```

### Install using Krew

Krew is the plugin manager for `kubectl` command-line tool.

[Install and set up](https://krew.sigs.k8s.io/docs/user-guide/setup/install/) Krew on your machine.

Then install `kubectl-karmada` plug-in:

```bash
kubectl krew install karmada
```

You can refer to [Quickstart of Krew](https://krew.sigs.k8s.io/docs/user-guide/quickstart/) for more information.

### Build from source code

Clone karmada repo and run `make` cmd from the repository:

```bash
make kubectl-karmada
```

Next, move the `kubectl-karmada` executable file under the `_output` folder in the project root directory to the `PATH` path.
