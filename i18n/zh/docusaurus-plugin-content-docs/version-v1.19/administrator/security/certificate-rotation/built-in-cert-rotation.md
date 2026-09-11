---
title: 内置证书轮转
---

# 内置证书轮转

本文档介绍 Karmada 提供的内置证书轮转能力。Karmada 提供自动化的证书轮转机制，以降低手动运维负担，确保证书始终处于有效状态。

## Karmada Agent 证书轮转

### 工作原理

karmada-agent 中的 `cert-rotation-controller` 监控存储在 `karmada-kubeconfig` Secret 中的证书，当证书临近过期时自动发起轮转：

1. **监控**：`cert-rotation-controller` 定期检查 Secret `karmada-kubeconfig` 中 Agent 证书的过期时间。
2. **检测**：当剩余有效期低于配置的阈值时，触发轮转流程。
3. **生成 CSR**：Agent 生成证书签名请求（CSR）并提交给控制面。
4. **审批**：控制面中的 `agentcsrapproving` 控制器自动审批 CSR（或由管理员手动审批）。
5. **签发**：控制面颁发由 Karmada 根 CA 签名的新证书。
6. **更新**：Agent 接收新证书并将其写回 Secret `karmada-kubeconfig`。
7. **重载**：karmada-agent 重启后应用新证书。注意：karmada-agent 当前不支持证书热加载，因此必须重启后才能使用新证书。你需要手动重启 karmada-agent，或者等待 karmada-agent 因旧证书过期而自动重启。

### 启用控制器

`cert-rotation-controller` 默认不启用。若要启用，请在 `karmada-agent` 的启动参数中添加：

```bash
--controllers=*,certRotation
```

如果已通过 `--controllers` 指定了特定控制器，将 `certRotation` 追加到列表中即可：

```bash
--controllers=controller1,controller2,certRotation
```

### 配置参数

可通过以下启动参数自定义证书轮转行为：

#### `cert-rotation-checking-interval`

- **说明**：证书过期检查的时间间隔。
- **默认值**：`5m`（5 分钟）
- **示例**：`--cert-rotation-checking-interval=3m`

#### `cert-rotation-remaining-time-threshold`

- **说明**：触发轮转的证书有效期阈值。当 `剩余有效时间 / 总有效时间 ≤ 阈值` 时，启动证书轮转。
- **计算方式**：`(notAfter - now) / (notAfter - notBefore)`
- **默认值**：`0.2`（20%）
- **示例**：`--cert-rotation-remaining-time-threshold=0.3`（当剩余有效期不足 30% 时轮转）

:::note

为确保自动轮转顺畅运行，请确保 `karmada-controller-manager` 中的 `agentcsrapproving` 控制器已启用（默认开启）。若未启用，则需通过 `kubectl certificate approve <csr-name>` 手动审批 CSR。

:::
