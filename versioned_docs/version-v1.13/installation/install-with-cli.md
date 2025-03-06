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
  karmadaCrds: "https://github.com/karmada-io/karmada/releases/download/v1.10.3/crds.tar.gz"
  etcd:
    local:
      imageRepository: "registry.k8s.io/etcd"
      imageTag: "3.5.13-0"
      initImage:
        imageRepository: "docker.io/library/alpine"
        imageTag: "3.19.1"
  components:
    karmadaAPIServer:
      imageRepository: "registry.k8s.io/kube-apiserver"
      imageTag: "v1.30.0"
    karmadaAggregatedAPIServer:
      imageRepository: "docker.io/karmada/karmada-aggregated-apiserver"
      imageTag: "v1.10.3"
    kubeControllerManager:
      imageRepository: "registry.k8s.io/kube-controller-manager"
      imageTag: "v1.30.0"
    karmadaControllerManager:
      imageRepository: "docker.io/karmada/karmada-controller-manager"
      imageTag: "v1.10.3"
    karmadaScheduler:
      imageRepository: "docker.io/karmada/karmada-scheduler"
      imageTag: "v1.10.3"
    karmadaWebhook:
      imageRepository: "docker.io/karmada/karmada-webhook"
      imageTag: "v1.10.3"
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

If you need more information about the configuration file, please refer to the [karmadactl init API reference](/docs/reference/karmadactl/karmadactl-config.v1alpha1.md).
