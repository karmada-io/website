# Karmadactl Configuration (v1alpha1)

## Overview

The `karmadactl init` command supports loading configuration parameters from a YAML file to simplify the deployment process for Karmada's control plane. This feature allows users to define all the necessary settings in a configuration file, reducing the complexity of managing numerous command-line flags and improving consistency across different environments.

This document explains the structure of the YAML configuration file used with `karmadactl init --config`, based on the `v1alpha1` version of the configuration schema.

## YAML Configuration Structure

The configuration file is structured in the following key sections:

### `apiVersion`
Specifies the version of the configuration file. The value for this field should always be `config.karmada.io/v1alpha1`.

```yaml
apiVersion: config.karmada.io/v1alpha1
```

### `kind`
Defines the type of configuration. For Karmada initialization, this value should always be `InitConfiguration`.

```yaml
kind: InitConfiguration
```

### `general`
This section contains general settings that apply to the entire Karmada deployment, such as the namespace, image settings, and kubeconfig path.

- **namespace**: Specifies the Kubernetes namespace in which Karmada will be deployed.
- **kubeConfigPath**: The path to the kubeconfig file that Karmada will use to communicate with the host cluster.
- **privateImageRegistry**: Specifies a private container registry for Karmada images, useful for offline deployments or environments with restricted internet access.
- **kubeImageTag**: Specifies the Kubernetes version tag to use for control plane components.

```yaml
general:
  namespace: "karmada-system"
  kubeConfigPath: "/etc/karmada/kubeconfig"
  privateImageRegistry: "registry.company.com"
  kubeImageTag: "v1.21.0"
```

### `karmadaControlPlane`
This section defines the settings related to the Karmada control plane components.

- **apiServer**: Configuration for the Karmada API server.
  - **replicas**: Specifies the number of Karmada API server replicas to deploy.

```yaml
karmadaControlPlane:
  apiServer:
    replicas: 3
```

### `etcd`
This section defines the settings related to the etcd cluster, which Karmada uses for state storage. Users can either configure a local etcd cluster or specify external etcd servers.

- **local**: Defines the settings for a locally deployed etcd cluster.
  - **replicas**: Specifies the number of etcd replicas to deploy.
  
```yaml
etcd:
  local:
    replicas: 3
```

## Example Configuration File

Here is a part example of a `karmada-init.yaml` configuration file:

```yaml
apiVersion: config.karmada.io/v1alpha1
kind: InitConfiguration
general:
  namespace: "karmada-system"
  kubeConfigPath: "/etc/karmada/kubeconfig"
  kubeImageTag: "v1.21.0"
  privateImageRegistry: "local.registry.com"

etcd:
  local:
    image: "local.registry.com/library/etcd:3.5.13-0"
    storageMode: "PVC"
    replicas: 3

karmadaControlPlane:
  apiServer:
    replicas: 3

```

Here is a complete example of a `karmada-init.yaml` configuration file:

```yaml
apiVersion: config.karmada.io/v1alpha1
kind: InitConfiguration
general:
  namespace: "karmada-system"
  kubeConfigPath: "/etc/karmada/kubeconfig"
  kubeImageTag: "v1.21.0"
  context: "karmada-context"
  storageClassesName: "fast"
  privateImageRegistry: "local.registry.com"
  waitComponentReadyTimeout: 120
  port: 32443
  image:
    kubeImageTag: "v1.21.0"
      kubeImageRegistry: "registry.cn-hangzhou.aliyuncs.com/google_containers"
      kubeImageMirrorCountry: "cn"
      imagePullPolicy: "IfNotPresent"
      imagePullSecrets:
        - "PullSecret1"
        - "PullSecret2"

certificate:
  externalDNS:
    - "www.karmada.io"
  externalIP:
    - "10.235.1.2"
  validityPeriod: "8760h"
  caCertFile: "/etc/karmada/pki/ca.crt"
  caCertKeyFile: "/etc/karmada/pki/ca.key"
  extraArgs:
    - name: "arg1"
      value: "value1"

etcd:
  local:
    image: "local.registry.com/library/etcd:3.5.13-0"
    initImage: "docker.io/alpine:3.19.1"
    dataDir: "/var/lib/karmada-etcd"
    pvcSize: "5Gi"
    nodeSelectorLabels: "karmada.io/etcd=true"
    storageMode: "PVC"
    replicas: 3
    extraArgs:
      - name: "etcd-arg1"
        value: "etcd-value1"
#  external:
#    externalCAPath: "/etc/ssl/certs/ca-certificates.crt"
#    externalCertPath: "/path/to/your/certificate.pem"
#    externalKeyPath: "/path/to/your/privatekey.pem"
#    externalServers: "https://example.com:8443"
#    externalPrefix: "ext-"
#    extraArgs:
#      - name: "ext-etcd-arg1"
#        value: "ext-etcd-value1"

karmadaControlPlane:
  apiServer:
    image: "karmada-apiserver:latest"
    advertiseAddress: "192.168.1.2"
    replicas: 3
    nodePort: 32443
    extraArgs:
      - name: "api-arg1"
        value: "api-value1"
  controllerManager:
    image: "karmada-controller-manager:latest"
    replicas: 3
    extraArgs:
      - name: "cm-arg1"
        value: "cm-value1"
  scheduler:
    image: "karmada-scheduler:latest"
    replicas: 3
    extraArgs:
      - name: "sched-arg1"
        value: "sched-value1"
  webhook:
    image: "karmada-webhook:latest"
    replicas: 3
    extraArgs:
      - name: "webhook-arg1"
        value: "webhook-value1"
  aggregatedAPIServer:
    image: "karmada-aggregated-apiserver:latest"
    replicas: 3
    extraArgs:
      - name: "aggregated-arg1"
        value: "aggregated-value1"
  kubeControllerManager:
    image: "kube-controller-manager:latest"
    replicas: 3
    extraArgs:
      - name: "kcm-arg1"
        value: "kcm-value1"
  dataPath: "/etc/karmada"
  pkiPath: "/etc/karmada/pki"
  crds: "/etc/karmada/crds"
  hostClusterDomain: "cluster.local"
```

## Using the Configuration File

To use this configuration file with `karmadactl init`, simply pass the path to the YAML file as an argument to the `--config` flag:

```bash
karmadactl init --config /path/to/karmada-init.yaml
```

### Overriding Configuration File Values

If necessary, command-line flags can still be used in conjunction with the configuration file. The parameters specified via the command line will override those in the configuration file. For example, to override the number of API server replicas, you could use:

```bash
karmadactl init --config /path/to/karmada-init.yaml --karmada-apiserver-replicas 5
```

## Additional Information

For further details on the available configuration options and advanced use cases, please refer to the [Karmadactl Init Documentation](../karmadactl_init.md).

### SEE ALSO

* [karmadactl init](karmadactl_init.md)	 - Install the Karmada control plane in a Kubernetes cluster

#### Go Back to [Karmadactl Commands](karmadactl_index.md) Homepage.
