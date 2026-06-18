---
title: Built-in Certificate Rotation
---

# Built-in Certificate Rotation

This document describes the built-in certificate rotation capabilities provided by Karmada. Karmada offers automated mechanisms to rotate certificates, reducing manual management overhead and helping ensure certificates remain valid.

## Karmada Agent Certificate Rotation

### How it works

The `cert-rotation-controller` in karmada-agent monitors the certificate stored in the `karmada-kubeconfig` secret and automatically rotates it when it is approaching expiration:

1. **Monitoring**: The `cert-rotation-controller` periodically checks the expiration time of the agent certificate in secret `karmada-kubeconfig`.
2. **Detection**: When remaining validity falls below the configured threshold, rotation is triggered.
3. **CSR Generation**: The agent generates a Certificate Signing Request (CSR) and submits it to the control plane.
4. **Approval**: The `agentcsrapproving` controller in the control plane automatically approves the CSR (or administrators manually approve it).
5. **Issuance**: The control plane issues a new certificate signed by the Karmada root CA.
6. **Update**: The agent receives the new certificate and writes it back to the secret `karmada-kubeconfig`.
7. **Reload**: karmada-agent picks up the new certificate after restarting. Note: the karmada-agent does not support hot-reloading of certificates, so a restart is required to use the new certificate. You must manually restart the karmada-agent, or wait for it to restart automatically when the old certificate expires.

### Enabling the controller

The `cert-rotation-controller` is disabled by default. To enable it, use the following startup flag for `karmada-agent`:

```bash
--controllers=*,certRotation
```

Or, if you are already using `--controllers` with specific controllers, add `certRotation` to the list:

```bash
--controllers=controller1,controller2,certRotation
```

### Configuration parameters

You can customize the certificate rotation behavior through the following startup flags:

#### `cert-rotation-checking-interval`

- **Description**: The time interval between periodic certificate expiration checks.
- **Default**: `5m` (5 minutes)
- **Example**: `--cert-rotation-checking-interval=3m`

#### `cert-rotation-remaining-time-threshold`

- **Description**: The certificate validity threshold for triggering rotation. Certificate rotation is initiated when: `remaining-validity / total-validity ≤ threshold`
- **Calculation**: `(notAfter - now) / (notAfter - notBefore)`
- **Default**: `0.2` (20%)
- **Example**: `--cert-rotation-remaining-time-threshold=0.3` (rotate when 30% of validity remains)

:::note

Ensure that the `agentcsrapproving` controller in the `karmada-controller-manager` is enabled (default) for seamless automatic rotation. Without it, you must manually approve CSRs using `kubectl certificate approve <csr-name>`.

:::
