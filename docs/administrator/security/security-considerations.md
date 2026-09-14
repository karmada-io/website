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
        - --metrics-bind-address=$(POD_IP):8080
```

### Certificate Configuration

As a vital security measure, Karmada uses certificates for identity verification and encrypted communication between components. When deploying Karmada, a variety of configurations are available to meet different user needs. Users can select appropriate certificate options based on their security policies and requirements. The following outlines the default certificate behaviors and configuration options for different installation methods:

#### Helm

##### Default Behavior

When installing via Helm, a `pre-install` job automatically generates the required certificates.
- The default validity period for the CA certificate is 10 years (3650 days).
- The default validity period for leaf certificates is 5 years (43800h).
- The default RSA key length for certificates is 3072 bits.

##### Customization

Users can customize certificate-related options by modifying the `values.yaml` file in the Helm chart, for example:
- `certs.auto.rootCAExpiryDays`: The validity period for the CA certificate, in days.
- `certs.auto.expiry`: The validity period for leaf certificates, as a duration string (e.g., `43800h` for 5 years).
- `certs.auto.rsaSize`: The RSA key length for the certificates.

Additionally, if users have their own certificates, the Helm chart can be configured to skip the auto-generation step and use the provided certificates directly. The options are as follows:
- `certs.mode`: The certificate mode. Set to `custom` to use custom certificates. The default is `auto`.
- `certs.custom`: When `certs.mode` is `custom`, this section is used to configure fields for the user-provided certificates, such as `caCrt`, `caKey`, `frontProxyCaCrt`, etc.

#### karmadactl init

##### Default Behavior

When installing via `karmadactl init`, karmadactl automatically generates the required certificates.
- The default validity period for the CA certificate is 10 years (3650 days). This value is fixed and cannot be adjusted during auto-generation.
- The default validity period for leaf certificates is 1 year (8760h).
- The default RSA key length for certificates is 3072 bits. This value is fixed and cannot be adjusted during auto-generation.

##### Customization

Users can customize certificate options by passing flags when running the `karmadactl init` command.

To adjust the validity period of **leaf certificates**, use:
- `--cert-validity-period`: The validity period for leaf certificates, as a duration string (e.g., `8760h` for 1 year).

To use a **custom CA**, you can specify the CA file paths. This will skip the CA auto-generation step:
- `--ca-cert-file`: Path to the custom root CA certificate file.
- `--ca-key-file`: Path to the custom root CA private key file. Must be used with `--ca-cert-file`.

Alternatively, you can pass a configuration file via the `--config` flag to specify these options. Here is an example:
```yaml
apiVersion: config.karmada.io/v1alpha1
kind: KarmadaInitConfig
spec:
  certificates:
    caCertFile: "path/to/ca.crt"
    caKeyFile: "path/to/ca.key"
    validityPeriod: "43800h" # 5 years
```

#### Operator

##### Default Behavior

When installing via an Operator, the karmada-operator automatically generates the required certificates.
- The default validity period for the CA certificate is 10 years (3650 days). This value is fixed and cannot be adjusted during auto-generation.
- The default validity period for leaf certificates is 1 year (8760h).
- The default RSA key length for certificates is 3072 bits. This value is fixed and cannot be adjusted during auto-generation.

##### Customization

Users can customize certificate options by modifying the `Karmada` CR.

- `spec.customCertificate.leafCertValidityDays`: The validity period of the **leaf certificate**, in days.
- `spec.customCertificate.apiServerCACert`: Used to specify a Secret containing a custom CA certificate and private key. If this field is set, the Operator will skip the CA auto-generation process and use the credentials from this Secret directly.
