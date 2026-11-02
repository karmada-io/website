---
title: Installation with CLI
---

## Prerequisites
## Installation with init flags

## Installation with init configuration

`karmadactl init` allows you to install Karmada by specifying a configuration file, which provides a structured way to define all settings in a YAML file.

### Example Configuration File
Here is an example of the configuration file for Karmada deployment:
```yaml
apiVersion: config.karmada.io/v1alpha1
kind: KarmadaInitConfig
spec:
  karmadaCRDs: "https://github.com/karmada-io/karmada/releases/download/v1.19.1/crds.tar.gz"
  etcd:
    local:
      repository: "registry.k8s.io/etcd"
      tag: "3.6.8-0"
  components:
    karmadaAPIServer:
      repository: "registry.k8s.io/kube-apiserver"
      tag: "v1.36.2"
    karmadaAggregatedAPIServer:
      repository: "docker.io/karmada/karmada-aggregated-apiserver"
      tag: "v1.19.1"
    kubeControllerManager:
      repository: "registry.k8s.io/kube-controller-manager"
      tag: "v1.36.2"
    karmadaControllerManager:
      repository: "docker.io/karmada/karmada-controller-manager"
      tag: "v1.19.1"
    karmadaScheduler:
      repository: "docker.io/karmada/karmada-scheduler"
      tag: "v1.19.1"
    karmadaWebhook:
      repository: "docker.io/karmada/karmada-webhook"
      tag: "v1.19.1"
```

### Deploying Karmada with Configuration File

1.Save the example configuration above to a file, e.g., karmada-init-config.yaml.

2.Use the following command to deploy Karmada with the configuration file:

  ```bash
  sudo karmadactl init --config /path/to/your/karmada-init-config.yaml
  ```

:::note

You need to use sudo for elevated permissions because `karmadactl` creates a
`karmada-apiserver.config` file at the `/etc/karmada/` directory.

:::

3.This configuration file allows you to define essential parameters, including:

- certificates: Defines certificate paths and validity period.
- etcd: Configures Etcd settings, including local or external Etcd options.
- hostCluster: Specifies host cluster API endpoint and kubeconfig.
- images: Configures image settings for components.
- components: Sets up replicas for API Server and other core components.
- karmadaDataPath: Defines the data path for Karmada.
-  ...

If you need more information about the configuration file, please refer to the [karmadactl init API reference](../reference/karmadactl/karmadactl-config.v1alpha1.md).
