---
title: Certificate Configuration
---

## Certificate Configuration

Karmada components use digital certificates to verify each other's identities, preventing malicious third parties from impersonating and stealing information or attacking the system. During mutual authentication with digital certificates between two components, the following files are involved:

- Business Certificate (Client/Server): A certificate used to prove one's own identity.
- Private Key: The private key corresponding to the public key included in the business certificate.
- CA Root Certificate: The root certificate issued by the Certificate Authority (CA) that signed the business certificate.

Both the business certificate and the CA root certificate have an expiration date. Therefore, when a business certificate or a CA root certificate is about to expire or has already expired, new certificates need to be replaced to ensure that the components can operate normally.

### Prerequisites

You need to install the following tools:

- `openssl` ([Installation Guide](https://github.com/openssl/openssl#download))
- `cfssl` ([Installation Guide](github.com/cloudflare/cfssl/cmd))
- `cfssljson` ([Installation Guide](github.com/cloudflare/cfssl/cmd))



> NOTE: The following examples are based on the installation method described in [Installation from Source](https://karmada.io/docs/installation/fromsource/#install). When using other installation methods, appropriate adaptation is required.

### Karmada Certificates

Karmada certificate storage path: Default to `${HOME}/.karmada`.

The current certificates used by Karmada include:

```shell
$ tree
.
├── apiserver.crt
├── apiserver.key
├── ca-config.json
├── ca.crt
├── ca.key
├── etcd-ca-config.json
├── etcd-ca.crt
├── etcd-ca.key
├── etcd-client.crt
├── etcd-client.key
├── etcd-server.crt
├── etcd-server.key
├── front-proxy-ca-config.json
├── front-proxy-ca.crt
├── front-proxy-ca.key
├── front-proxy-client.crt
├── front-proxy-client.key
├── karmada.crt
└── karmada.key
```

#### **Karmada Certificate Overview**

Certificates can be categorized into three sets based on the issuing CA:

- Issued by ca

  The certificates `apiserver` and `karmada` are both issued by the CA certificate `ca`. The key attributes of these certificates are as follows:

  | Certificates | common name(CN)   | organization(og) | hosts                                                        |
  | ------------ | ----------------- | ---------------- | ------------------------------------------------------------ |
  | apiserver    | karmada-apiserver | /                | "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" "${api server's ip from kubecomfig by context karmada host}" |
  | karmada      | system:admin      | system:masters   | kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" "${interpreter_webhook_example_service_external_ip_address}" |

  The `${api server's ip from kubecomfig by context karmada host}` can be obtained by executing `./get_server_ip.sh ${HOST_CLUSTER_NAME}`.

  ```shell
  #!/usr/bin/env bash
  # get_server_ip.sh
  context_name=$1
  cluster_name=$(kubectl config view --template='{{ range $_, $value := .contexts }}{{if eq $value.name '"\"${context_name}\""'}}{{$value.context.cluster}}{{end}}{{end}}')
  apiserver_url=$(kubectl config view --template='{{range $_, $value := .clusters }}{{if eq $value.name '"\"${cluster_name}\""'}}{{$value.cluster.server}}{{end}}{{end}}')
  echo "${apiserver_url}" | awk -F/ '{print $3}' | sed 's/:.*//'
  ```

  > PS: The `karmada api server config` in the `kubeconfig` file is composed of the `karmada` certificate.

- Issued by etcd-ca

  The certificates `etcd-server` and `etcd-client` are both issued by the CA certificate `etcd-ca`. The key attributes of these certificates are as follows:

  | certificates | common name(CN) | organization(og) | hosts                                                        |
  | ------------ | --------------- | ---------------- | ------------------------------------------------------------ |
  | etcd-server  | etcd-server     | /                | kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" |
  | etcd-client  | etcd-client     | /                | "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" |

- Issued by front-proxy-ca

  The certificate `front-proxy-client` is issued by the CA certificate `front-proxy-ca`. The key attributes of these certificates are as follows:

  | certificates       | common name(CN)    | organization(og) | hosts                                                        |
  | ------------------ | ------------------ | ---------------- | ------------------------------------------------------------ |
  | front-proxy-client | front-proxy-client | /                | kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" |

#### How Karmada Components Use Certificates

Karmada components use certificates by mounting secrets. The current secrets used by Karmada for storing certificates are:

- [karmada-cert-secret](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-cert-secret.yaml)
- [kubeconfig](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/secret.yaml)

- [karmada-webhook-cert-secret](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-webhook-cert-secret.yaml)

You can find the corresponding certificates for each secret from the [cert-secret-generation](https://github.com/karmada-io/karmada/blob/19d1146c3510942809f48d399fc2079ce3a79a66/hack/deploy-karmada.sh#L102-L124).

Karmada components acquire the necessary certificates by mounting secrets. The detailed usage of certificates by each component is as follows:

- **etcd** mounts the secret `karmada-cert-secret` and uses the certificates for

  ```yaml
              - --cert-file=/etc/karmada/pki/etcd-server.crt
              - --key-file=/etc/karmada/pki/etcd-server.key
              - --trusted-ca-file=/etc/karmada/pki/etcd-ca.crt
  ```

- **karmada-apiserver**  mounts the secret `karmada-cert-secret` and uses the certificates for:

  ```yaml
              - --client-ca-file=/etc/karmada/pki/ca.crt
              - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
              - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
              - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
              - --kubelet-client-certificate=/etc/karmada/pki/karmada.crt
              - --kubelet-client-key=/etc/karmada/pki/karmada.key
              - --service-account-key-file=/etc/karmada/pki/karmada.key
              - --service-account-signing-key-file=/etc/karmada/pki/karmada.key
              - --proxy-client-cert-file=/etc/karmada/pki/front-proxy-client.crt
              - --proxy-client-key-file=/etc/karmada/pki/front-proxy-client.key
              - --requestheader-client-ca-file=/etc/karmada/pki/front-proxy-ca.crt
              - --tls-cert-file=/etc/karmada/pki/apiserver.crt
              - --tls-private-key-file=/etc/karmada/pki/apiserver.key
  ```

- **karmada-controller-manager** mounts the secret `kubeconfig` and uses the certificates for

  ```yaml
              - --kubeconfig=/etc/kubeconfig
  ```

- **karmada-aggregated-apiserver** mounts the secrets karmada-cert-secret and kubeconfig and uses the certificates for:

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --authentication-kubeconfig=/etc/kubeconfig
              - --authorization-kubeconfig=/etc/kubeconfig
              - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
              - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
              - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
              - --tls-cert-file=/etc/karmada/pki/karmada.crt
              - --tls-private-key-file=/etc/karmada/pki/karmada.key
  ```

- **karmada-scheduler-estimator** mounts the secret `karmada-cert-secret` and uses the certificates for:

  ```yaml
              - --grpc-auth-cert-file=/etc/karmada/pki/karmada.crt
              - --grpc-auth-key-file=/etc/karmada/pki/karmada.key
              - --grpc-client-ca-file=/etc/karmada/pki/ca.crt
  ```

- **karmada-scheduler** mounts the secrets `karmada-cert-secret` and `kubeconfig` and uses the certificates for:

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --scheduler-estimator-ca-file=/etc/karmada/pki/ca.crt
              - --scheduler-estimator-cert-file=/etc/karmada/pki/karmada.crt
              - --scheduler-estimator-key-file=/etc/karmada/pki/karmada.key
  ```

- **karmada-descheduler** mounts the secrets `karmada-cert-secret` and `kubeconfig` and uses the certificates for:

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --scheduler-estimator-ca-file=/etc/karmada/pki/ca.crt
              - --scheduler-estimator-cert-file=/etc/karmada/pki/karmada.crt
              - --scheduler-estimator-key-file=/etc/karmada/pki/karmada.key
  ```

- **karmada-metrics-adapter** mounts the secrets `karmada-cert-secret` and `kubeconfig` and uses the certificates for:

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --authentication-kubeconfig=/etc/kubeconfig
              - --authorization-kubeconfig=/etc/kubeconfig
              - --client-ca-file=/etc/karmada/pki/ca.crt
              - --tls-cert-file=/etc/karmada/pki/karmada.crt
              - --tls-private-key-file=/etc/karmada/pki/karmada.key
  ```

- **karmada-search** mounts the secrets `karmada-cert-secret` and `kubeconfig` and uses the certificates for:

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --authentication-kubeconfig=/etc/kubeconfig
              - --authorization-kubeconfig=/etc/kubeconfig
              - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
              - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
              - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
              - --tls-cert-file=/etc/karmada/pki/karmada.crt
              - --tls-private-key-file=/etc/karmada/pki/karmada.key
  ```

- **karmada-webhook** mounts the secrets `webhook-cert` and `kubeconfig` and uses the certificates for:

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --cert-dir=/var/serving-cert
  ```

#### Checking Certificate Expiry Dates

You can use the command `openssl x509 -noout -dates -in path/to/cert` to extract the before and after dates of the certificate.

```bash
$ openssl x509 -noout -dates -in path/to/cert
notBefore=Aug 24 16:00:00 2024 GMT
notAfter=Aug 29 16:00:00 2024 GMT
```

The output indicates that this certificate becomes valid at 16:00 on August 24, 2024, and expires at 16:00 on August 29, 2024.


### **Certificate Replacement**

When a business certificate expires or is about to expire, you can manually replace it with a new certificate to extend its validity.

#### generate a new certificate

1. **Determine the issuing CA of the expired certificate.** Refer to the **Karmada Certificate Overview** for the relationship between business certificates and their issuing CAs.

2. **Obtain the Common Name (CN) and other details from the expired certificate.** To ensure consistency before and after the replacement, it is recommended to directly inspect the expired business certificate to obtain the `CN` and other details.

   ```shell
   $ openssl x509 -noout -text -in path/to/cert
   Certificate:
       Data:
           ... ...
           Subject: O = system:masters, CN = system:admin
   		... ...
               X509v3 Subject Alternative Name:
                   DNS:kubernetes.default.svc, DNS:*.etcd.karmada-system.svc.cluster.local, DNS:*.karmada-system.svc.cluster.local, DNS:*.karmada-system.svc, DNS:localhost, IP Address:127.0.0.1
   ... ...
   ```

   The output of the command indicates that the expired certificate has the following details: `CN=system:admin`, `O=system:masters`, and `hosts=kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1"`.

3. **Use the CA and certificate information to issue a new certificate.**

   ```shell
   #!/usr/bin/env bash
   # signCert.sh
   dest_dir=$1
   ca=$2
   ca_dir=$3
   cert_name=$4
   cn=${5:-$4}
   og=$6
   hosts=""
   SEP=""
   shift 6
   while [[ -n "${1:-}" ]]; do
       hosts+="${SEP}\"$1\""
       SEP=","
       shift 1
   done
   ${sudo} /usr/bin/env bash -e <<EOF
   echo '{"CN":"${cn}","hosts":[${hosts}],"names":[{"O":"${og}"}],"key":{"algo":"rsa","size":3072}}' | cfssl gencert -ca="${ca_dir}/${ca}.crt" -ca-key="${ca_dir}/${ca}.key" -config="${ca_dir}/${ca}-config.json" - | cfssljson -bare ${cert_name}
   mv "${cert_name}-key.pem" "${cert_name}.key"
   mv "${cert_name}.pem" "${cert_name}.crt"
   rm -f "${cert_name}.csr"
   EOF
   ```

   The input parameters for `signCert.sh` and their meanings are as follows:

   - `dest_dir`: The directory for the new certificate, which is recommended to be different from the directory of the original business certificate to avoid overwriting.
   - `ca`: The name of the CA (Certificate Authority) certificate.
   - `ca_dir`: The directory where the CA certificate is stored.
   - `cn`: The Common Name (CN) for the business certificate.
   - `og`: The organization (O) for the business certificate.
   - `hosts`: The list of hosts for the business certificate.

   Example: For an expired Karmada certificate with a CA named `ca`, `CN=system:admin`, `O=system:masters`, and hosts including `kubernetes.default.svc`, `*.etcd.karmada-system.svc.cluster.local`, `*.karmada-system.svc.cluster.local`, `*.karmada-system.svc`, `localhost`, and `127.0.0.1`, you can execute the following command to generate a new Karmada certificate in the current directory:

   ```she
   ./signCert.sh . "ca" "${HOME}/.karmada" "karmada" "system:admin" "system:masters" kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1"
   ```

#### **Certificate Replacement**

Since Karmada components obtain certificates by mounting secrets, when a secret is updated, it will automatically synchronize to the component's mount path. Therefore, all that is needed is for the component to restart so that it can load the new certificate. It is recommended to update the server-side certificates first. This is because updating server-side certificates may affect all clients that depend on that service, whereas client-side certificate updates are more scattered and have a smaller impact range.

1. **Update the Secret**

   Using the certificate `karmada` as an example,

   ```shell
   # Base64 encode the new certificate
   KARMADACRT=$(cat karmada.crt|base64 -w 0)
   KARMADAKEY=$(cat karmada.key|base64 -w 0)
   # update secret karmada-cert-secret
   kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-host patch secret karmada-cert-secret -nkarmada-system --type='json' -p='[{"op": "replace", "path": "/data/karmada.crt", "value":'"${KARMADACRT}"'},{"op": "replace", "path": "/data/karmada.key", "value":'"${KARMADAKEY}"'}]'
   # update secret webhook-cert
   kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-host patch secret webhook-cert -nkarmada-system --type='json' -p='[{"op": "replace", "path": "/data/tls.crt", "value":'"${KARMADACRT}"'},{"op": "replace", "path": "/data/tls.key", "value":'"${KARMADAKEY}"'}]'
   # update secret kubeconfig
   kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-host edit secret webhook-cert -nkarmada-system -oyaml
   ```

   It's important to note that the `client-certificate-data` and `client-key-data` values under the `karmada-apiserver` context within the `kubeconfig` file also need to be replaced with the new `karmada.crt` and `karmada.key`.

2. **Restart Components to Reload Certificates**

   After synchronizing the new certificates to the secrets in Step 1, the components need to be restarted so they can load the new certificates.

   First, determine the scope of the certificate update, which identifies the components that need to be restarted.

   Restart Karmada components in batches as needed.

   Based on the dependencies between components, the recommended order for restarting is as follows:

   - **etcd**, as the backend for `karmada-apiserver`, should be restarted first.

   - **karmada-apiserver**, as the backend for other Karmada components, should be restarted after `etcd` has loaded the new certificate.

   - **karmada-aggregated-apiserver** should be restarted after `karmada-apiserver` has loaded the new certificate.

   - Remaining components can be restarted in the same batch.

With this, the process of updating expired certificates is complete.
