---
title: Karmadactl init component startup parameter extension guide
---

# Karmadactl init command component startup parameter extension guide

## Overview

The `karmadactl init` command is used to install Karmada control plane components in a Kubernetes cluster. To enhance user customizability, this command supports customizing component startup parameters during the installation process. Component startup parameters are arguments passed to the executable files that control the behavior of the components, configure the runtime environment, or specify particular operational modes. They can affect various aspects such as log levels, listening ports, performance tuning options, and more.

This document will detail two ways to customize the Karmada control plane using the `karmadactl init` command: **command line parameters** and **configuration files**.

## Functional features

- **Flexible parameter passing**: Supports directly passing additional parameters via command line flags.
- **Configuration file support**: Allows for unified management of all component parameters using a YAML configuration file.
- **Parameter override mechanism**: Command line parameters can override settings in the configuration file.
- **Multiple parameter formats**: Command line parameters support two ways of passing arguments: comma-separated values and multiple uses of flags.
- **Full component override**: Supports customizing startup parameters for all components started by `karmadactl init`.


## Default parameters

Before customizing the control plane, it is essential to understand the default startup parameters of each component. This helps determine which custom parameters need to be passed.

### `Etcd`

```yaml
  containers:
  - command:
    - /usr/local/bin/etcd
    - --name=$(POD_NAME)
    - --listen-peer-urls=http://$(POD_IP):2380
    - --listen-client-urls=https://$(POD_IP):2379,http://127.0.0.1:2379
    - --advertise-client-urls=https://$(POD_NAME).etcd.karmada-system.svc.cluster.local:2379
    - --initial-cluster=etcd-0=http://etcd-0.etcd.karmada-system.svc.cluster.local:2380
    - --initial-cluster-state=new
    - --client-cert-auth=true
    - --cert-file=/etc/karmada/pki/etcd-server.crt
    - --key-file=/etc/karmada/pki/etcd-server.key
    - --trusted-ca-file=/etc/karmada/pki/etcd-ca.crt
    - --data-dir=/var/lib/karmada-etcd
    - --snapshot-count=10000
    - --cipher-suites=TLS_AES_128_GCM_SHA256,TLS_AES_256_GCM_SHA384,TLS_CHACHA20_POLY1305_SHA256,TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256,TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256
    - --initial-cluster-token=etcd-cluster
    - --initial-advertise-peer-urls=http://$(POD_IP):2380
    - --peer-client-cert-auth=false
    - --peer-trusted-ca-file=/etc/karmada/pki/etcd-ca.crt
    - --peer-key-file=/etc/karmada/pki/etcd-server.key
    - --peer-cert-file=/etc/karmada/pki/etcd-server.crt
```
The environment variables are:

```yaml
env:
- name: POD_NAME
  valueFrom:
    fieldRef:
      apiVersion: v1
      fieldPath: metadata.name
- name: POD_IP
  valueFrom:
    fieldRef:
      apiVersion: v1
      fieldPath: status.podIP
```

### `karmadaAPIServer`

```yaml
  containers:
  - command:
    - kube-apiserver
    - --allow-privileged=true
    - --authorization-mode=Node,RBAC
    - --client-ca-file=/etc/karmada/pki/ca.crt
    - --enable-bootstrap-token-auth=true
    - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
    - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
    - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
    - --etcd-servers=https://etcd-0.etcd.karmada-system.svc.cluster.local:2379
    - --bind-address=0.0.0.0
    - --disable-admission-plugins=StorageObjectInUseProtection,ServiceAccount
    - --runtime-config=
    - --apiserver-count=1
    - --secure-port=5443
    - --service-account-issuer=https://kubernetes.default.svc.cluster.local
    - --service-account-key-file=/etc/karmada/pki/karmada.key
    - --service-account-signing-key-file=/etc/karmada/pki/karmada.key
    - --service-cluster-ip-range=10.96.0.0/12
    - --proxy-client-cert-file=/etc/karmada/pki/front-proxy-client.crt
    - --proxy-client-key-file=/etc/karmada/pki/front-proxy-client.key
    - --requestheader-allowed-names=front-proxy-client
    - --requestheader-client-ca-file=/etc/karmada/pki/front-proxy-ca.crt
    - --requestheader-extra-headers-prefix=X-Remote-Extra-
    - --requestheader-group-headers=X-Remote-Group
    - --requestheader-username-headers=X-Remote-User
    - --tls-cert-file=/etc/karmada/pki/apiserver.crt
    - --tls-private-key-file=/etc/karmada/pki/apiserver.key
    - --tls-min-version=VersionTLS13
```

### `karmadaAggregatedAPIServer`

```yaml
  containers:
  - command:
    - /bin/karmada-aggregated-apiserver
    - --kubeconfig=/etc/karmada/config/karmada.config
    - --authentication-kubeconfig=/etc/karmada/config/karmada.config
    - --authorization-kubeconfig=/etc/karmada/config/karmada.config
    - --etcd-servers=https://etcd-0.etcd.karmada-system.svc.cluster.local:2379
    - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
    - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
    - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
    - --tls-cert-file=/etc/karmada/pki/karmada.crt
    - --tls-private-key-file=/etc/karmada/pki/karmada.key
    - --tls-min-version=VersionTLS13
    - --audit-log-path=-
    - --audit-log-maxage=0
    - --audit-log-maxbackup=0
    - --bind-address=$(POD_IP)
```

The environment variables are:

```yaml
env:
- name: POD_IP
  valueFrom:
    fieldRef:
      apiVersion: v1
      fieldPath: status.podIP
```

### `kubeControllerManager`

```yaml
  containers:
  - command:
    - kube-controller-manager
    - --allocate-node-cidrs=true
    - --kubeconfig=/etc/karmada/config/karmada.config
    - --authentication-kubeconfig=/etc/karmada/config/karmada.config
    - --authorization-kubeconfig=/etc/karmada/config/karmada.config
    - --bind-address=0.0.0.0
    - --client-ca-file=/etc/karmada/pki/ca.crt
    - --cluster-cidr=10.244.0.0/16
    - --cluster-name=karmada-apiserver
    - --cluster-signing-cert-file=/etc/karmada/pki/ca.crt
    - --cluster-signing-key-file=/etc/karmada/pki/ca.key
    - --controllers=namespace,garbagecollector,serviceaccount-token,ttl-after-finished,bootstrapsigner,tokencleaner,csrcleaner,csrsigning,clusterrole-aggregation
    - --leader-elect=true
    - --leader-elect-resource-namespace=karmada-system
    - --node-cidr-mask-size=24
    - --root-ca-file=/etc/karmada/pki/ca.crt
    - --service-account-private-key-file=/etc/karmada/pki/karmada.key
    - --service-cluster-ip-range=10.96.0.0/12
    - --use-service-account-credentials=true
    - --v=4
```

### `karmadaControllerManager`

```yaml
  containers:
  - command:
    - /bin/karmada-controller-manager
    - --kubeconfig=/etc/karmada/config/karmada.config
    - --metrics-bind-address=$(POD_IP):8080
    - --health-probe-bind-address=$(POD_IP):10357
    - --cluster-status-update-frequency=10s
    - --leader-elect-resource-namespace=karmada-system
    - --v=4

```

The environment variables are:

```yaml
env:
  - name: POD_IP
    valueFrom:
      fieldRef:
        apiVersion: v1
        fieldPath: status.podIP
```

### `karmadaScheduler`

```yaml
  containers:
  - command:
    - /bin/karmada-scheduler
    - --kubeconfig=/etc/karmada/config/karmada.config
    - --metrics-bind-address=$(POD_IP):8080
    - --health-probe-bind-address=$(POD_IP):10351
    - --enable-scheduler-estimator=true
    - --leader-elect=true
    - --scheduler-estimator-ca-file=/etc/karmada/pki/ca.crt
    - --scheduler-estimator-cert-file=/etc/karmada/pki/karmada.crt
    - --scheduler-estimator-key-file=/etc/karmada/pki/karmada.key
    - --leader-elect-resource-namespace=karmada-system
    - --v=4
```

The environment variables are:

```yaml
env:
- name: POD_IP
  valueFrom:
    fieldRef:
      apiVersion: v1
      fieldPath: status.podIP
```

### `karmadaWebhook`

```yaml
  containers:
  - command:
    - /bin/karmada-webhook
    - --kubeconfig=/etc/karmada/config/karmada.config
    - --bind-address=$(POD_IP)
    - --metrics-bind-address=$(POD_IP):8080
    - --health-probe-bind-address=$(POD_IP):8000
    - --secure-port=8443
    - --cert-dir=/var/serving-cert
    - --v=4
```

The environment variables are:

```yaml
env:
- name: POD_IP
  valueFrom:
    fieldRef:
      apiVersion: v1
      fieldPath: status.podIP
```


## Command line parameter method

Use the corresponding flags with `karmadactl init` to pass additional parameters. Each component has specific flags for passing extra startup parameters.

### Parameter passing format

Supports two transfer formats:

1. **Comma-separated format**: Multiple parameters are separated by commas.
2. **Multiple flag format**: Use the same flag multiple times.

### Component flag mapping

| **Component**                | **Command-line flags**                      | **Official documentation link**                                                                                                              |
|------------------------------|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `Etcd`                       | `--etcd-extra-args`                         | [Etcd Configuration parameters](https://etcd.io/docs/v3.4/op-guide/configuration/)                                                           |
| `karmadaAPIServer`           | `--karmada-apiserver-extra-args`            | [karmadaAPIServer Configuration parameters](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/)               |
| `karmadaAggregatedAPIServer` | `--karmada-aggregated-apiserver-extra-args` | [karmadaAggregatedAPIServer Configuration parameters](https://karmada.io/docs/reference/components/karmada-aggregated-apiserver/)            |
| `kubeControllerManager`      | `--kube-controller-manager-extra-args`      | [kubeControllerManager Configuration parameters](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/) |
| `karmadaControllerManager`   | `--karmada-controller-manager-extra-args`   | [karmadaControllerManager Configuration parameters](https://karmada.io/docs/reference/components/karmada-controller-manager/)                |
| `karmadaScheduler`           | `--karmada-scheduler-extra-args`            | [karmadaScheduler Configuration parameters](https://karmada.io/docs/reference/components/karmada-scheduler)                                  |
| `karmadaWebhook`             | `--karmada-webhook-extra-args`              | [karmadaWebhook Configuration parameters](https://karmada.io/docs/reference/components/karmada-webhook)                                      |

>  This only displays the relevant flags for the current components. For the latest version, please refer to [karmadactl init](https://karmada.io/docs/reference/karmadactl/karmadactl-commands/karmadactl_init) or use `karmadactl init --help` after obtaining the latest version of `karmadactl`.

### Usage example:

#### Etcd component parameter customization

**Comma-separated format:**

```bash
karmadactl init --etcd-extra-args="--snapshot-count=5000,--heartbeat-interval=100"
```

**Multiple flag format:**

```bash
karmadactl init --etcd-extra-args="--snapshot-count=5000" --etcd-extra-args="--heartbeat-interval=100"
```

## Configuration file method

### Configuration file structure

Using a YAML configuration file allows for clearer management of all component configurations. The configuration file is based on the `config.karmada.io/v1alpha1` API version. 
For detailed configuration file structure and parameter descriptions, please refer to: [karmadactl-config.v1alpha1](https://karmada.io/docs/reference/karmadactl/karmadactl-config.v1alpha1/).

### Add the extraArgs field

Add the `extraArgs` field in the corresponding component section of the configuration file to pass additional parameters:

### Etcd Configuration example

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
      extraArgs:
         - name: snapshot-count
           value: "5000"
         - name: heartbeat-interval
           value: "100"
```

The configuration examples for the other components are the same as above. For detailed information, please refer to [karmadactl-config.v1alpha1](https://karmada.io/docs/reference/karmadactl/karmadactl-config.v1alpha1/).

### Using configuration file

Save the configuration as a YAML file (e.g., `karmada-init.yaml`), and then use the `--config` flag:

```bash
karmadactl init --config /path/to/karmada-init.yaml
```

### Parameter overriding mechanism

Command line parameters have a higher priority and can override settings in the configuration file.

## Troubleshooting

### Frequently Asked Questions

1. **Parameter format error**
    
   - Ensure there are double hyphens before the parameter name. (`--`)
   - When using command line parameters in comma-separated format, make sure not to use the Chinese comma `，`, and there should be no spaces between multiple parameters.
   
2. **Component start failed.**

   - View the component's log output.
   - Verify whether the passed parameters are supported by this component version.

3. **Configuration file parsing failed.**

    - Check if the YAML syntax is correct.
    - Confirm that the version and field names are correct.

## Precautions

- **Parameter Priority**: The additional parameters passed will override and append to the default parameters.
- **Version compatibility**: Ensure that the parameters used are compatible with the corresponding component version.

## Summary

The component startup parameter extension feature of `karmadactl init` provides users with a high degree of flexibility. Whether through command-line arguments or configuration files, the Karmada control plane can be deeply customized to meet specific needs. Proper use of this feature can significantly enhance Karmada’s adaptability and performance across different environments.
