---
title: Manual Certificate Rotation
---

# Manual Certificate Rotation

This document describes how to manually rotate Karmada control plane certificates. Manual rotation is needed when certificates are approaching expiration or have already expired, and you are not using an automated solution like cert-manager.

For background on which certificates exist and how they are used, see the [Karmada Certificate Framework](pathname://../cert-framework).

## Prerequisites

- `kubectl` access to the host cluster where Karmada is installed.
- `openssl` installed on your machine.
- Access to the Karmada root CA certificate and key (`ca.crt` and `ca.key`). These are typically stored in a Secret in the `karmada-system` namespace.

## Checking certificate expiration

Before rotating, check when your current certificates expire:

```bash
kubectl get secret karmada-cert -n karmada-system -o jsonpath='{.data["karmada.crt"]}' | base64 -d | openssl x509 -noout -enddate
```

Repeat for other certificate fields (e.g., `apiserver.crt`, `etcd-client.crt`) to identify which ones need rotation.

## Rotation steps

### Step 1: Extract the CA certificate and key

```bash
kubectl get secret karmada-cert -n karmada-system -o jsonpath='{.data["ca.crt"]}' | base64 -d > ca.crt
kubectl get secret karmada-cert -n karmada-system -o jsonpath='{.data["ca.key"]}' | base64 -d > ca.key
```

### Step 2: Inspect the existing certificate

Check the Subject, Organization, and SANs of the certificate you want to rotate, so the new certificate matches:

```bash
kubectl get secret karmada-cert -n karmada-system -o jsonpath='{.data["karmada.crt"]}' | base64 -d | openssl x509 -noout -text
```

Note the `Subject` (CN and O fields) and `Subject Alternative Name` entries.

### Step 3: Generate a new certificate

Use `openssl` to generate a new key and certificate signed by the existing CA. Adjust the `-subj`, `-addext`, and `-days` values to match your environment:

```bash
# Generate a new private key
openssl genrsa -out karmada.key 2048

# Create a certificate signing request
openssl req -new -key karmada.key -out karmada.csr \
  -subj "/CN=system:admin/O=system:masters"

# Sign the certificate with the CA (valid for 10 years)
openssl x509 -req -in karmada.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out karmada.crt -days 3650 -sha256
```

For server certificates that require SANs (like the API server certificate), generate the key and CSR first, then sign with an extensions file:

```bash
# Generate a new private key and CSR for the API server
openssl genrsa -out apiserver.key 2048
openssl req -new -key apiserver.key -out apiserver.csr \
  -subj "/CN=system:karmada:karmada-apiserver"

# Create a SAN extensions file
cat > san.ext << EOF
subjectAltName = DNS:karmada-apiserver.karmada-system.svc.cluster.local,DNS:karmada-apiserver.karmada-system.svc,DNS:localhost,IP:127.0.0.1
EOF

# Sign the certificate
openssl x509 -req -in apiserver.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out apiserver.crt -days 3650 -sha256 \
  -extfile san.ext
```

Repeat this process for each certificate that needs rotation. Refer to the [Certificate Framework](pathname://../cert-framework) for the correct CN, O, and SAN values for each component.

### Step 4: Update the Secret

Patch the Secret with the newly generated certificate and key:

```bash
kubectl patch secret karmada-cert -n karmada-system -p "{\"data\":{\"karmada.crt\":\"$(base64 karmada.crt | tr -d '\n')\"  ,\"karmada.key\":\"$(base64 karmada.key | tr -d '\n')\"}}"
```

:::note

Do not replace the CA certificate (`ca.crt`) and key (`ca.key`) unless you specifically need to rotate the root CA. Rotating the CA requires updating trust bundles across all member clusters.

:::

### Step 5: Restart the control plane components

Restart the affected pods so they pick up the new certificates:

```bash
kubectl rollout restart deployment -n karmada-system
kubectl rollout restart statefulset -n karmada-system
```

### Step 6: Verify

Confirm the components are running and the new certificates are in use:

```bash
kubectl get pods -n karmada-system
```

All pods should be in `Running` state. You can also verify the new certificate expiration:

```bash
kubectl get secret karmada-cert -n karmada-system -o jsonpath='{.data["karmada.crt"]}' | base64 -d | openssl x509 -noout -enddate
```
