---
title: Verify Artifacts
---

## verify images

Karmada has introduced cosign to verify the released images since version v1.7. The specific operation is as follows：

### Prerequisites

You need to install the following tools:

- `cosign` ([Installation Guide](https://docs.sigstore.dev/cosign/installation/))
- `curl` (usually provided by your OS)
- `jq` ([download jq](https://stedolan.github.io/jq/download/))

### Verify image signature

#### Verify image with cosign CLI

Karmada introduced the `cosign` verification tool since release 1.7. For a list of published mirrors, see [karmada mirrors](https://hub.docker.com/u/karmada).

> Note: image of helm chart introduced the `cosign` verification tool since release 1.8.

Select an image from these images and verify its signature using `cosign verify` command：

```shell
cosign verify docker.io/karmada/karmada-aggregated-apiserver:latest \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  --certificate-identity-regexp=^https://github.com/karmada-io/karmada/.*$ | jq
```

If the echo is as follows, the verification is successful:

```shell
Verification for index.docker.io/karmada/karmada-aggregated-apiserver:latest --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - Existence of the claims in the transparency log was verified offline
  - The code-signing certificate was verified using trusted certificate authority certificates
[
  {
    "critical": {
      "identity": {
        "docker-reference": "index.docker.io/karmada/karmada-aggregated-apiserver"
      },
      "image": {
        "docker-manifest-digest": "sha256:c6d85e111e1ca4da234e87fb48f8ff170c918a0e6893d9ac9e888a4e7cc0056f"
      },
      "type": "cosign container image signature"
    },
    "optional": {
      "1.3.6.1.4.1.57264.1.1": "https://token.actions.githubusercontent.com",
      "1.3.6.1.4.1.57264.1.2": "push",
      "1.3.6.1.4.1.57264.1.3": "e5277b6317ac1a4717f5fac4057caf51a5d248fc",
      "1.3.6.1.4.1.57264.1.4": "latest image to DockerHub",
      "1.3.6.1.4.1.57264.1.5": "karmada-io/karmada",
      "1.3.6.1.4.1.57264.1.6": "refs/heads/master",
      "Bundle": {
        "SignedEntryTimestamp": "MEYCIQD4R9XlhgQkjVAg4XuW857iqkNrSxbQB9k3x4Ie8IshgAIhAILn8m+eOAjYxxcpFU42ghoiiuMnyY+Xda2CBE5WZruq",
        "Payload": {
       ...
```

When you are done validating an image, you can specify that image in your Pod manifest by a digest value, for example：

```console
registry-url/image-name@sha256:c6d85e111e1ca4da234e87fb48f8ff170c918a0e6893d9ac9e888a4e7cc0056f
```

For more information, please refer to [k8s image pull policy](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy) chapter how to specify the image summary to pull the image.

#### Use the admission controller to verify the image signature

The image verification process can also be implemented using the [sigstore policy-controller](https://docs.sigstore.dev/policy-controller/overview) controller during deployment. Here are some resources to help you get started with `policy-controller`:

- [Install](https://github.com/sigstore/helm-charts/tree/main/charts/policy-controller)
- [configuration options](https://github.com/sigstore/policy-controller/tree/main/config)