---
title: Security Considerations
---

## Security Considerations

The Karmada Security Considerations document aims to assist users in ensuring the security of their Karmada deployments. This document provides a series of best practices and recommendations to help users protect their Karmada clusters and related resources from potential security risks. It covers various aspects of security, including artifacts verifying and component configurations. By following the recommendations in this guide, users can enhance the security of their Karmada environments and reduce potential security vulnerabilities and attack surfaces. Please note that this document is for reference purposes only, and users should adjust and implement the recommendations according to their specific circumstances and requirements.

### Verify artifacts：

Karmada introduced the use of Cosign for image verification starting from v1.7.0 release. For detailed information, please refer to [Verify Artifacts](verify-artifacts).

### Component Configurations：

#### TLS Configuration

Karmada components set the TLS configuration options for client-to-server communication using the startup parameters `--tls-min-version` and `--cipher-suites`.

To avoid the use of insecure algorithms such as 3DES during the communication process, the TLS configuration is set during the installation of Karmada-related components. The specific configuration is as follows:

- karmada-apiserver: `--tls-min-version=VersionTLS13`

- karmada-aggregated-apiserver: `--tls-min-version=VersionTLS13`

- karmada-search: `--tls-min-version=VersionTLS13`

- karmada-metrics-adapter: `--tls-min-version=VersionTLS13`

- etcd: `--cipher-suites=TLS_RSA_WITH_AES_128_CBC_SHA,TLS_RSA_WITH_AES_256_CBC_SHA,TLS_RSA_WITH_AES_128_GCM_SHA256,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_AES_128_GCM_SHA256,TLS_AES_256_GCM_SHA384,TLS_CHACHA20_POLY1305_SHA256,TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305`

Set Golang's secure cipher suite to etcd's cipher suite. They are obtained through the return value of the function "CipherSuites()" under the "go/src/crypto/tls/cipher_suites.go" package. Consistent with the "preferred value" of the k8s default cipher suite.

#### Binding Address Configuration

Karmada components provide configurable parameters for users to configure listening addresses and ports. When a user deploys a Karmada component, the Karmada component will use the default listening address and port if the listening-related parameters are not configured. The default listening address of the Karmada component is `0.0.0.0`, which means that the component will listen to all network interfaces on the server (for a container, this is a virtual network interface that is managed by the container runtime, such as Docker).

The following are the configurable parameters provided by the Karmada component:

- karmada-controller-manager
    - `--metrics-bind-address`: default is `:8080`.
    - `--health-probe-bind-address`: default is `:10357`.
- karmada-scheduler
    - `--metrics-bind-address`: default is `:8080`.
    - `--health-probe-bind-address`: default is `:10351`.
- karmada-scheduler-estimator
    - `--metrics-bind-address`: default is `:8080`.
    - `--health-probe-bind-address`: default is `:10351`.
- karmada-descheduler
    - `--metrics-bind-address`: default is `:8080`.
    - `--health-probe-bind-address`: default is `:10358`.
- karmada-aggregated-apiserver
    - `--bind-address`: default is `0.0.0.0`.
    - `--secure-port`: default is `443`.
- karmada-metrics-adapter
    - `--metrics-bind-address`: default is `:8080`.
    - `--bind-address`: default is `0.0.0.0`.
    - `--secure-port`: default is `443`.
- karmada-webhook
    - `--metrics-bind-address`: default is `:8080`.
    - `--health-probe-bind-address`: default is `:8000`.
    - `--bind-address`: default is `0.0.0.0`.
    - `--secure-port`: default is `8443`.
- karmada-search
    - `--bind-address`: default is `0.0.0.0`.
    - `--secure-port`: default is `443`.
- karmada-agent
    - `--metrics-bind-address`: default is `:8080`.
    - `--health-probe-bind-address`: default is `:10357`.

Users can configure the listening address as a Pod IP value. For example, you can configure the metrics interface of the `karmada-controller-manager` component as follows:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: karmada-controller-manager
  namespace: karmada-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: karmada-controller-manager
  template:
    metadata:
      labels:
        app: karmada-controller-manager
    spec:
      containers:
      - name: my-container
        env:
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        command:
        - /bin/karmada-controller-manager
        - --metrics-bind-address=${POD_IP}:8080
```
