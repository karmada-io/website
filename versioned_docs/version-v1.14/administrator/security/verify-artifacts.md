---
title: Verify Artifacts
---

## verify images

Karmada has introduced cosign to verify the released images since version v1.7. The specific operation is as follows:

### Prerequisites

You need to install the following tools:

- `cosign` ([Installation Guide](https://docs.sigstore.dev/cosign/installation/))
- `curl` (usually provided by your OS)
- `jq` ([download jq](https://stedolan.github.io/jq/download/))

### Verify image signature

#### Verify image with cosign CLI

Karmada introduced the `cosign` verification tool since release 1.7. For a list of published mirrors, see [karmada mirrors](https://hub.docker.com/u/karmada).

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

## SBOM

An SBOM, or Software Bill of Materials, is an inventory of all components within a software resource, such as third-party libraries or modules. It has emerged as a key building block in software security and supply chain risk management.

Starting with release `v1.10.2`, the SBOM for Karmada projects will be available in Karmada's release Assets. Integrated with different tools, we can get the information on:

- List of Components and Dependencies
- Version Information
- Licenses
- Dependency Trees/Graphs

Below are two examples of using tools to parse karmada's SBOM.

### Prerequisites

You need to install the following tools:

- `bom` ([Installation Guide](https://github.com/kubernetes-sigs/bom#installation))
- `trivy` ([Installation Guide](https://aquasecurity.github.io/trivy/v0.52/getting-started/installation/))
- `tar` (usually provided by your OS)

And then, unzip `sbom.tar.gz` and get the SBOM in it.

```shell
$ tar -zxvf sbom.tar.gz
sbom-karmada.spdx
```

### View the structure of the information contained in the SBOM

Using `bom document outline`, SBOM contents can be rendered to see how the information they contain is structured.

```shell
$ bom document outline sbom-karmada.spdx
               _      
 ___ _ __   __| |_  __
/ __| '_ \ / _` \ \/ /
\__ \ |_) | (_| |>  < 
|___/ .__/ \__,_/_/\_\
    |_|               

 📂 SPDX Document /github/workspace
  │ 
  │ 📦 DESCRIBES 1 Packages
  │ 
  ├ /github/workspace
  │  │ 🔗 2 Relationships
  │  ├ CONTAINS PACKAGE go.mod
  │  │  │ 🔗 1 Relationships
  │  │  └ CONTAINS PACKAGE github.com/karmada-io/karmada
  │  │  │  │ 🔗 186 Relationships
  │  │  │  ├ DEPENDS_ON PACKAGE github.com/go-task/slim-sprig@0.0.0-20230315185526-52ccab3ef572
  │  │  │  ├ DEPENDS_ON PACKAGE sigs.k8s.io/structured-merge-diff/v4@4.4.1
  │  │  │  ├ DEPENDS_ON PACKAGE k8s.io/apimachinery@0.29.4
  │  │  │  ├ DEPENDS_ON PACKAGE k8s.io/kube-openapi@0.0.0-20231010175941-2dd684a91f00
......
```
### Scan SBOM for vulnerabilities

Trivy can take SBOM as an input and scan for vulnerabilities.

```shell
$ trivy sbom sbom-karmada.spdx
2024-07-01T17:00:36+08:00       INFO    Need to update DB
2024-07-01T17:00:36+08:00       INFO    Downloading DB...       repository="ghcr.io/aquasecurity/trivy-db:2"
49.28 MiB / 49.28 MiB [-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------] 100.00% 1.26 MiB p/s 39s
2024-07-01T17:01:17+08:00       INFO    Vulnerability scanning is enabled
2024-07-01T17:01:17+08:00       INFO    Detected SBOM format    format="spdx-tv"
2024-07-01T17:01:17+08:00       INFO    Number of language-specific files       num=3
2024-07-01T17:01:17+08:00       INFO    [gobinary] Detecting vulnerabilities...
2024-07-01T17:01:17+08:00       INFO    [gomod] Detecting vulnerabilities...
2024-07-01T17:01:17+08:00       INFO    [pip] Detecting vulnerabilities...
```
If the echo is as above, it shows that software components and dependencies in the Karmada project filesystem have no known security vulnerabilities. If you wish to ignore vulnerabilities that don't have a fixed version, you can add `--ignore-unfixed`, e.g.

```shell
$ trivy sbom sbom-karmada.spdx --ignore-unfixed
```

## Verify artifacts with SLSA attestations

### Prerequisites

You need to install the following tools:

- `slsa-verifier` ([Installation Guide](https://github.com/slsa-framework/slsa-verifier?tab=readme-ov-file#installation))

### CLI

A single attestation (`karmada-cli.intoto.jsonl`) from each release is provided since release 1.10.3. This can be used with [slsa-verifier](https://github.com/slsa-framework/slsa-verifier) to verify that a CLI binary was generated using Karmada workflows on GitHub and ensures it was cryptographically signed.

```shell
slsa-verifier verify-artifact karmadactl-darwin-arm64.tgz \
  --provenance-path karmada-cli.intoto.jsonl \
  --source-uri github.com/karmada-io/karmada \
  --source-tag v1.10.3
```

If you only want to verify up to the major or minor version of the source repository tag (instead of the full tag), use the --source-versioned-tag, with which you can verify the semantic versions:

```shell
slsa-verifier verify-artifact karmadactl-darwin-arm64.tgz \
  --provenance-path karmada-cli.intoto.jsonl \
  --source-uri github.com/karmada-io/karmada \
  --source-tag v1 # You can use v1.10 for minor version verification
```

The payload is a non-forgeable provenance which is base64 encoded and can be viewed by passing the --print-provenance option to the commands above:

```shell
slsa-verifier verify-artifact karmadactl-darwin-arm64.tgz \
  --provenance-path karmada-cli.intoto.jsonl \
  --source-uri github.com/karmada-io/karmada \
  --source-tag v1.10.3 \
  --print-provenance | jq
```

### SBOM

A single attestation (`karmada-sbom.intoto.jsonl`) from each release is provided along with the sbom (sbom.tar.gz) since release 1.10.3. This can be used with slsa-verifier to verify that the SBOM was generated using Karmada workflows on GitHub and ensures it was cryptographically signed.

```shell
slsa-verifier verify-artifact sbom.tar.gz \
  --provenance-path karmada-sbom.intoto.jsonl \
  --source-uri github.com/karmada-io/karmada \
  --source-tag v1.10.3
```

### Crds

A single attestation (`karmada-crds.intoto.jsonl`) from each release is provided along with the crds (crds.tar.gz) since release 1.10.3. This can be used with slsa-verifier to verify that the crds were generated using Karmada workflows on GitHub and ensures it was cryptographically signed.

```shell
slsa-verifier verify-artifact crds.tar.gz \
  --provenance-path karmada-crds.intoto.jsonl \
  --source-uri github.com/karmada-io/karmada \
  --source-tag v1.10.3
```

### Charts

A single attestation (`karmada-charts.intoto.jsonl`) from each release is provided since release 1.10.3. This can be used with slsa-verifier to verify that the charts were generated using Karmada workflows on GitHub and ensures it was cryptographically signed.

```shell
slsa-verifier verify-artifact karmada-chart-v1.10.3.tgz \
  --provenance-path karmada-charts.intoto.jsonl \
  --source-uri github.com/karmada-io/karmada \
  --source-tag v1.10.3
slsa-verifier verify-artifact karmada-operator-chart-v1.10.3.tgz \
  --provenance-path karmada-charts.intoto.jsonl \
  --source-uri github.com/karmada-io/karmada \
  --source-tag v1.10.3
```
