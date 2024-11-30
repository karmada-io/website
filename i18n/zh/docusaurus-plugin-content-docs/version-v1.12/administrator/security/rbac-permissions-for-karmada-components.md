---
title: Karmada 组件的 RBAC 权限
---

# Karmada 组件的 RBAC 权限

## karmada-operator

| API Group | Resource | Verbs | Description |
|-----------|----------|-------|-------------|
| coordination.k8s.io | leases | get, create, update | 用于 leader 选举。 |
| operator.karmada.io | karmadas | get, list, watch, update | 用于管理 Karmada 实例。 |
| operator.karmada.io | karmadas/status | update | 用于更新 Karmada 实例的状态。 |
| "" (core) | events | create | 允许 karmada-operator 在 Kubernetes API Server 中记录 events。 |
| "" (core) | nodes, pods | list | 列出集群节点与 Pod，用于获取节点信息和 Pod 健康检查。 |
| "" (core) | namespaces | get | 用于获取命名空间信息，并将资源部署到特定命名空间中。 |
| "" (core) | secrets, services | get, create, update, delete | 用于管理 Secret（可能包含敏感数据，如认证信息）和 Service（为集群内应用提供服务发现）。 |
| apps | statefulsets, deployments | get, create, update, delete | 用于管理 StatefulSet（如 etcd）和 Deployment（如 karmada-operator）。 |

| Non-Resource URLs | Verbs | Description |
|-------------|-------|-------------|
| /healthz | get | 用于检查 Karmada API Server 的健康状态。 |


## karmada-agent

| API Group | Resource | Verbs | Description |
|-----------|----------|-------|-------------|
| cluster.karmada.io | clusters | list, watch | 用于管理和查看集群。 |
| cluster.karmada.io | clusters | get, create, delete | resourceNames: {{clustername}} |
| cluster.karmada.io | clusters/status | update | 用于更新集群状态。resourceNames: {{clustername}} |
| config.karmada.io | resourceinterpreterwebhookconfigurations, resourceinterpretercustomizations | get, list, watch | 用于获取 ResourceInterpreterCustomizations 和 ResourceInterpreterWebhookConfigurations。 |
| "" (core) | namespaces | get | 用于获取命名空间。 |
| coordination.k8s.io | leases | get, create, update | 用于 leader 选举。 |
| certificates.k8s.io | certificatesigningrequests | get, create | 用于获取和创建 CSR 资源。 |
| "" (core) | events | create, patch, update | 允许 karmada-agent 在 Karmada API Server 中记录 events。 |
| "" (core) | secrets | get, create, patch | 用于管理 Secret（可能包含敏感数据，如认证信息）。 |
| work.karmada.io | works | get, list, watch, create, update, delete | 用于管理 Work 自定义资源。 |
| work.karmada.io | works/status | patch, update | 用于更新 Work 自定义资源状态。 |
