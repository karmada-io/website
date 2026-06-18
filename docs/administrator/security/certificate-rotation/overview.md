---
title: Certificate Rotation Overview
---

Karmada components use certificates for secure communication, authentication, and trust establishment across the control plane and member clusters. For the recommended certificate layout and usage of each certificate, see the [Karmada Certificate Framework](../cert-framework.md).

In real-world environments, certificates eventually expire, become unavailable, or need to be replaced for security reasons. Because Karmada involves multiple components and certificate chains, certificate rotation is a sensitive and error-prone operation. However, it is also an essential maintenance task for keeping the system secure and available.

This guide covers the available approaches for performing certificate rotation in Karmada.

## Guides

- For the built-in certificate rotation workflow, see [Built-in Certificate Rotation](built-in-cert-rotation.md).
