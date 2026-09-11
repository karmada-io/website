---
title: High Availability Installation Using CLI
---

This documentation serves as a comprehensive guide for deploying Karmada in a high
availability (HA) configuration using the `karmadactl` CLI tool.

## Prerequisites

- A Kubernetes cluster with multiple worker nodes (it's recommended to have at least
  three worker nodes).
- A valid `kube-config` file to access your Kubernetes cluster.
- The `karmadactl` command-line tool or `kubectl-karmada` plugin installed.

  :::note

  For installing `karmadactl` command line tool refer to the [Installation of CLI Tools](/docs/next/installation/install-cli-tools#one-click-installation) guide.

  :::

## Installation

There are two ways to install the Karmada in HA. The first way is to use an internal etcd
cluster, and the second way is to use an external etcd cluster. You can learn more
about this in the [high availability installation overview](/docs/next/installation/ha-installation).

### Installation using internal etcd

1. Use the following command to install the Karmada in HA using internal etcd:

  ```bash
  sudo karmadactl init --karmada-apiserver-replicas 3 --etcd-replicas 3 --etcd-storage-mode PVC --storage-classes-name <storage-classes-name> --kubeconfig <path-to-kube-config>
  ```

  :::note

  You need to use sudo for elevated permissions because `karmadactl` creates a
  `karmada-config` file in the `/etc/karmada/karmada-apiserver.config` directory.

  :::

2. Specify the path to your `kube-config` file to connect to your Kubernetes cluster.
  Typically, the `kube-config` file is located at `~/.kube/config` directory.
  Alternatively, you can set the `KUBECONFIG` environment variable to specify the
  file's location.

3. Adjust the installation parameters as needed:
    - `--karmada-apiserver-replicas 3`: This parameter sets up three Karmada API server
      replicas. Each Karmada API server replica requires a separate node.
    - `--etcd-replicas 3`: This ensures three etcd members are available to support the
      three Karmada API servers.
    - `--etcd-storage-mode PVC`: It indicates the use of PVCs for etcd storage.
    - `--storage-classes-name <StorageClassesName>`: Specify the name of the storage
      class for etcd.

      :::note

      Make sure you have a minimum of three Kubernetes worker nodes available for a
      successful installation of three Karmada API servers and etcd replicas.
      Otherwise, the installation will not work.

      :::

### Installation using external etcd

1. Use the following command to install the Karmada in HA using external etcd:

 ```bash
  sudo karmadactl init --karmada-apiserver-replicas 3 --external-etcd-ca-cert-path <ca-cert-path> --external-etcd-client-cert-path <client-cert-path> --external-etcd-client-key-path <client-key-path> --external-etcd-servers <url-of-etcd-servers> --external-etcd-key-prefix <etcd-key-prefix> --kubeconfig <path-to-kube-config>
  ```

2. Adjust the installation parameters as needed:
    - `--karmada-apiserver-replicas 3`: This parameter sets up three Karmada API server
      replicas. Each Karmada API server replica requires a separate node.
    - The `--external-etcd-ca-cert-path`, `--external-etcd-client-cert-path`,
      `--external-etcd-client-key-path` and `--external-etcd-servers`
      are the parameters that are required to authenticate with the external etcd cluster.
    - Optionally you can also specify an etcd key prefix using the
      `--external-etcd-key-prefix` parameter.

## Verification

Once the Karmada cluster installation is complete, you can verify the distribution of
pods across multiple nodes by using the following command:

```bash
kubectl get pod -o=custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName -n karmada-system
```

This will display the status and node allocation of pods within the `karmada-system`
namespace.