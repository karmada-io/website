---
title: Karmadactl init configuration v1alpha1 document
---

# Karmadactl Configuration (v1alpha1)

## Overview

The `karmadactl init` command supports loading configuration parameters from a YAML file to simplify the deployment process for Karmada's control plane. This feature allows users to define all the necessary settings in a configuration file, reducing the complexity of managing numerous command-line flags and improving consistency across different environments.

This document explains the structure of the YAML configuration file used with `karmadactl init --config`, based on the `v1alpha1` version of the configuration schema.

## YAML Configuration Structure

The configuration file is structured into the following key sections:

## `apiVersion`

Specifies the API version of the configuration file. For Karmada initialization, it should always be `config.karmada.io/v1alpha1`.

```yaml
apiVersion: config.karmada.io/v1alpha1
```

## `kind`
Defines the type of configuration. For Karmada initialization, this value should always be `InitConfiguration`.

```yaml
kind: KarmadaInitConfig
```

## `spec`

Contains the main configuration specifications for initializing Karmada.

#### `certificates`

Configures the certificate information required by Karmada components.

- **`caCertFile`**: Path to the root CA certificate file. If not specified, a new self-signed CA certificate will be generated.
- **`caKeyFile`**: Path to the root CA key file. If not specified, a new self-signed CA key will be generated.
- **`externalDNS`**: A list of external DNS names to include in the certificates' Subject Alternative Names (SANs).
- **`externalIP`**: A list of external IP addresses to include in the certificates' SANs.
- **`validityPeriod`**: The validity period of the certificates, specified in Go duration format (e.g., `"8760h0m0s"` for one year).

```yaml
spec:
 certificates:
   caCertFile: "/etc/karmada/pki/ca.crt"
   caKeyFile: "/etc/karmada/pki/ca.key"
   externalDNS:
     - "localhost"
     - "example.com"
   externalIP:
     - "192.168.1.2"
     - "172.16.1.2"
   validityPeriod: "8760h0m0s"
```

#### `etcd`

Configures the Etcd cluster used by Karmada. You can choose between a local Etcd cluster (`local`) or an external Etcd cluster (`external`).

##### `local`

Defines settings for deploying a local Etcd cluster as part of the Karmada control plane.

- **`repository`**: The Docker image repository for the Etcd image.
- **`tag`**: The image tag (version) of Etcd.
- **`dataPath`**: Filesystem path where Etcd will store its data on the host.
- **`initImage`**: Image used for the Etcd init container, typically a lightweight image like Alpine Linux.
- **`nodeSelectorLabels`**: Labels used to select the nodes where Etcd pods will be scheduled.
- **`pvcSize`**: The size of the PersistentVolumeClaim used by Etcd when `storageMode` is set to `PVC`.
- **`replicas`**: Number of Etcd replicas to deploy. For high availability, an odd number of replicas is recommended (e.g., 3, 5).
- **`storageMode`**: Storage mode for Etcd data. Options are `emptyDir`, `hostPath`, or `PVC`.

```yaml
spec:
  etcd:
    local:
      repository: "registry.k8s.io/etcd"
      tag: "latest"
      dataPath: "/var/lib/karmada-etcd"
      initImage:
        repository: "alpine"
        tag: "3.19.1"
      nodeSelectorLabels:
        karmada.io/etcd: "true"
      pvcSize: "5Gi"
      replicas: 3
      storageMode: "PVC"
```

##### `external`

Configures connection settings for an external Etcd cluster.

- **`endpoints`**: List of URLs to the external Etcd servers.
- **`caFile`**: Path to the CA certificate file for the external Etcd cluster.
- **`certFile`**: Path to the client certificate file for authentication.
- **`keyFile`**: Path to the client key file for authentication.
- **`keyPrefix`**: Key prefix used in the external Etcd cluster to segregate data.

```yaml
spec:
  etcd:
    external:
      endpoints:
        - "https://example.com:8443"
      caFile: "/path/to/your/ca.crt"
      certFile: "/path/to/your/cert.crt"
      keyFile: "/path/to/your/key.key"
      keyPrefix: "ext-"
```

#### `hostCluster`

Specifies information about the host Kubernetes cluster where Karmada will be installed.

- **`apiEndpoint`**: The API server endpoint of the host cluster.
- **`kubeconfig`**: Path to the kubeconfig file used to access the host cluster.
- **`context`**: The context name within the kubeconfig file to use.
- **`domain`**: The DNS domain of the host cluster (e.g., `cluster.local`).

```yaml
spec:
  hostCluster:
    apiEndpoint: "https://kubernetes.example.com"
    kubeconfig: "/root/.kube/config"
    context: "karmada-host"
    domain: "cluster.local"
```

#### `images`

Configures image-related settings for Karmada and Kubernetes components.

- **`imagePullPolicy`**: The image pull policy. Options are `Always`, `IfNotPresent`, or `Never`.
- **`imagePullSecrets`**: A list of Kubernetes secrets used to authenticate with private image registries.
- **`kubeImageMirrorCountry`**: Country code for selecting a Kubernetes image mirror (e.g., `cn` for China).
- **`kubeImageRegistry`**: Custom Docker registry to pull Kubernetes images from.
- **`kubeImageTag`**: The tag (version) of the Kubernetes images to use.
- **`privateRegistry`**:
    - **`registry`**: The address of a private image registry. If specified, all images will be pulled from this registry.

```yaml
spec:
  images:
    imagePullPolicy: "IfNotPresent"
    imagePullSecrets:
      - "PullSecret1"
      - "PullSecret2"
    kubeImageMirrorCountry: "cn"
    kubeImageRegistry: "registry.cn-hangzhou.aliyuncs.com/google_containers"
    kubeImageTag: "v1.29.6"
    privateRegistry:
      registry: "my.private.registry"
```

#### `components`

Defines configurations for individual Karmada components.

##### `karmadaAPIServer`

- **`repository`**: Docker image repository for the Karmada API Server.
- **`tag`**: Image tag for the Karmada API Server.
- **`replicas`**: Number of replicas for the API Server deployment.
- **`advertiseAddress`**: The IP address that the API Server will advertise to clients.
- **`networking`**:
    - **`namespace`**: Kubernetes namespace where the API Server will be deployed.
    - **`port`**: The port number on which the API Server will listen.

```yaml
spec:
  components:
    karmadaAPIServer:
      repository: "karmada/kube-apiserver"
      tag: "v1.29.6"
      replicas: 1
      advertiseAddress: "192.168.1.100"
      networking:
        namespace: "karmada-system"
        port: 32443
```

##### `karmadaAggregatedAPIServer`

- **`repository`**: Docker image repository for the Aggregated API Server.
- **`tag`**: Image tag for the Aggregated API Server.
- **`replicas`**: Number of replicas.

```yaml
spec:
  components:
    karmadaAggregatedAPIServer:
      repository: "karmada/karmada-aggregated-apiserver"
      tag: "v0.0.0-master"
      replicas: 1
```

##### `kubeControllerManager`

- **`repository`**: Docker image repository for the Kube Controller Manager.
- **`tag`**: Image tag for the Kube Controller Manager.
- **`replicas`**: Number of replicas.

```yaml
spec:
  components:
    kubeControllerManager:
      repository: "karmada/kube-controller-manager"
      tag: "v1.29.6"
      replicas: 1
```

##### `karmadaControllerManager`

- **`repository`**: Docker image repository for the Karmada Controller Manager.
- **`tag`**: Image tag for the Karmada Controller Manager.
- **`replicas`**: Number of replicas.

```yaml
spec:
  components:
    karmadaControllerManager:
      repository: "karmada/karmada-controller-manager"
      tag: "v0.0.0-master"
      replicas: 1
```

##### `karmadaScheduler`

- **`repository`**: Docker image repository for the Karmada Scheduler.
- **`tag`**: Image tag for the Karmada Scheduler.
- **`replicas`**: Number of replicas.

```yaml
spec:
  components:
    karmadaScheduler:
      repository: "karmada/karmada-scheduler"
      tag: "v0.0.0-master"
      replicas: 1
```

##### `karmadaWebhook`

- **`repository`**: Docker image repository for the Karmada Webhook.
- **`tag`**: Image tag for the Karmada Webhook.
- **`replicas`**: Number of replicas.

```yaml
spec:
  components:
    karmadaWebhook:
      repository: "karmada/karmada-webhook"
      tag: "v0.0.0-master"
      replicas: 1
```

#### `karmadaDataPath`

Specifies the directory on the host where Karmada stores its data, including kubeconfig files, certificates, and CRDs.

```yaml
spec:
  karmadaDataPath: "/etc/karmada"
```

#### `karmadaPKIPath`

Specifies the directory on the host where Karmada stores its PKI (Public Key Infrastructure) files, such as certificates and keys.

```yaml
spec:
  karmadaPKIPath: "/etc/karmada/pki"
```

#### `karmadaCRDs`

Specifies the URL or path to the tarball containing Karmada Custom Resource Definitions (CRDs) to be installed.

```yaml
spec:
  karmadaCRDs: "https://github.com/karmada-io/karmada/releases/download/test/crds.tar.gz"
```

#### `waitComponentReadyTimeout`

Specifies the timeout in seconds for waiting for Karmada components to become ready. A value of `0` means wait indefinitely.

```yaml
spec:
  waitComponentReadyTimeout: 120
```

## Complete Example Configuration File

Below is a complete example of the structure of the `karmada-init.yaml` file,

```yaml
apiVersion: config.karmada.io/v1alpha1
kind: KarmadaInitConfig
spec:
  certificates:
    caCertFile: "/path/to/your/ca.crt"
    caKeyFile: "/path/to/your/ca.key"
    externalDNS:
      - "localhost"
      - "example.com"
    externalIP:
      - "192.168.1.2"
      - "172.16.1.2"
    validityPeriod: "8760h0m0s"
  etcd:
    local:
      repository: "registry.k8s.io/etcd"
      tag: "latest"
      dataPath: "/var/lib/karmada-etcd"
      initImage:
        repository: "alpine"
        tag: "3.19.1"
      nodeSelectorLabels:
        karmada.io/etcd: "true"
      pvcSize: "5Gi"
      replicas: 3
      storageMode: "PVC"
#    external:
#      endpoints:
#        - "https://example.com:8443"
#      caFile: "/path/to/your/ca.crt"
#      certFile: "/path/to/your/cert.crt"
#      keyFile: "/path/to/your/key.key"
#      keyPrefix: "ext-"
  hostCluster:
    apiEndpoint: "https://kubernetes.example.com"
    kubeconfig: "/root/.kube/config"
    context: "karmada-host"
    domain: "cluster.local"
  images:
    imagePullPolicy: "IfNotPresent"
    imagePullSecrets:
      - "PullSecret1"
      - "PullSecret2"
    kubeImageMirrorCountry: "cn"
    kubeImageRegistry: "registry.cn-hangzhou.aliyuncs.com/google_containers"
    kubeImageTag: "v1.29.6"
    privateRegistry:
      registry: "my.private.registry"
  components:
    karmadaAPIServer:
      repository: "registry.k8s.io/kube-apiserver"
      tag: "v1.30.0"
      replicas: 1
      advertiseAddress: "192.168.1.100"
      networking:
        namespace: "karmada-system"
        port: 32443
    karmadaAggregatedAPIServer:
      repository: "docker.io/karmada/karmada-aggregated-apiserver"
      tag: "v1.10.3"
      replica: 1
    kubeControllerManager:
      repository: "registry.k8s.io/kube-controller-manager"
      tag: "v1.30.0"
      replica: 1
    karmadaControllerManager:
      repository: "docker.io/karmada/karmada-controller-manager"
      tag: "v1.10.3"
      replica: 1
    karmadaScheduler:
      repository: "docker.io/karmada/karmada-scheduler"
      tag: "v1.10.3"
      replica: 1
    karmadaWebhook:
      repository: "docker.io/karmada/karmada-webhook"
      tag: "v1.10.3"
      replica: 1
  karmadaDataPath: "/etc/karmada"
  karmadaPKIPath: "/etc/karmada/pki"
  karmadaCRDs: "https://github.com/karmada-io/karmada/releases/download/test/crds.tar.gz"
  waitComponentReadyTimeout: 120
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
