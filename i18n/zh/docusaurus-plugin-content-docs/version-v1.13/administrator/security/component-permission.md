---
title: 组件权限
---

# Karmada 组件权限

本文档详细解释了每个 Karmada 组件需要访问的资源以及访问这些资源的原因。它将帮助管理员了解并有效配置 Karmada 组件所需的 RBAC 权限，确保系统安全高效地运行。
社区维护的 [安装工具](https://karmada.io/docs/installation/) 在设计时考虑到了安全性。这些工具使用基于角色的访问控制（[RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)）来管理组件的访问权限，确保它们只能访问所需的资源。通过坚持最小权限原则，这些工具最大限度地降低了潜在的安全风险，并阻止了系统内未经授权的访问或操作。

## karmada-operator

### 简介：

Karmada-operator 是一种用于安装、升级和删除 Karmada 实例的组件。它基于 Karmada 资源和控制器的基本概念，提供了方便的方式来集中管理 Karmada 实例的整个生命周期。

### 部署 Karmada-operator 集群的资源

| Resource        | API Group           | Resource Names | Namespace | Verbs                       | Description                                                  |
| --------------- | ------------------- | -------------- | --------- | --------------------------- | ------------------------------------------------------------ |
| leases          | coordination.k8s.io | *              | *         | get, create, update         | 用于 leader 选举                                             |
| karmadas        | operator.karmada.io | *              | *         | get, list, watch, update    | 用于管理 Karmada 实例                                        |
| karmadas/status | operator.karmada.io | *              | *         | update                      | 用于更新 Karmada 实例的状态                                  |
| events          | ""                  | *              | *         | create                      | 允许 karmada-operator 在 Kubernetes API Server 中记录 events。 |
| nodes           | ""                  | *              | NA        | list                        | 用于获取 Node IP                                             |
| pods            | ""                  | *              | *         | list                        | 用于 pod 的健康检查                                          |
| namespaces      | ""                  | *              | *         | get                         | 用于获取命名空间信息，并将资源部署到特定命名空间中           |
| secrets         | ""                  | *              | *         | get, create, update, delete | 用于管理 Secret（可能包含敏感数据，如认证信息）              |
| services        | ""                  | *              | *         | get, create, update, delete | 用于管理Service，为集群内应用提供服务发现                    |
| statefulsets    | ""                  | *              | *         | get, create, update, delete | 用于管理 StatefulSet（如 etcd）                              |
| deployments     | apps                | *              | *         | get, create, update, delete | 用于管理Deployment（如 karmada-apiserver)                    |

| Non-Resource URLs | Verbs | Description |
|-------------|-------|-------------|
| /healthz | get | 用于检查 Karmada API Server 的健康状态。 |

### Karmada 资源

无

## karmada-agent

### 简介：

Karmada-agent 将特定集群注册到 Karmada 控制平面，并将工作负载清单从 Karmada 控制平面同步到成员集群。 此外，它也负责将成员集群及其资源的状态同步到 Karmada 控制平面。

### 部署 Karmada-agent 集群的资源

| Resource | API Group | Resource Names | Namespace | Verbs | Description                        |
| -------- | --------- | -------------- | --------- | ----- | ---------------------------------- |
| *        | *         | *              | *         | *     | karmada-agent 在成员集群充当管理员 |

| Non-Resource URLs | Verbs | Description                        |
| ----------------- | ----- | ---------------------------------- |
| *                 | get   | karmada-agent 在成员集群充当管理员 |

### Karmada 资源

下表中，`{{cluster_name}}` 为 karmada-agent 注册的成员集群的集群名，`{{cluster_namespace}}` 为部署成员集群 secrets 资源的命名空间，默认为 `karmada-cluster`。

| Resource                                 | API Group           | Resource Names     | Namespace                     | Verbs                                    | Description                                            |
| ---------------------------------------- | ------------------- | ------------------ | ----------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| clusters                                 | cluster.karmada.io  | *                  | NA                            | list, watch，create                      | 用于创建集群并监听集群状态                             |
| clusters                                 | cluster.karmada.io  | `{{cluster_name}}` | NA                            | get, delete                              | 删查特定的集群                                         |
| clusters/status                          | cluster.karmada.io  | `{{cluster_name}}` | NA                            | update                                   | 用于更新特定集群的状态                                 |
| resourceinterpreterwebhookconfigurations | config.karmada.io   | *                  | NA                            | get, list, watch                         | 用于获取 resourceinterpreterwebhookconfigurations资源  |
| resourceinterpretercustomizations        | config.karmada.io   | *                  | NA                            | get, list, watch                         | 用于获取 resourceinterpretercustomizations 资源        |
| namespaces                               | ""                  | *                  | *                             | get                                      | 用于获取命名空间                                       |
| leases                                   | coordination.k8s.io | *                  | *                             | get, create, update                      | 用于 leader 选举                                       |
| certificatesigningrequests               | certificates.k8s.io | *                  | NA                            | get, create                              | 获取和创建 CSR 资源，用于 Karmada-agent 的证书轮转     |
| services                                 | ""                  | *                  | *                             | list, watch                              | 用于构建 ClusterIPServiceResolver 资源解释器           |
| events                                   | ""                  | *                  | *                             | create, patch, update                    | 允许 karmada-agent 在 Karmada API Server 中记录 events |
| secrets                                  | ""                  | `{{cluster_name}}` | `{{cluster_namespace}}`       | get, patch                               | 用于获取和修改特定 secret资源                          |
| secrets                                  | ""                  | *                  | `{{cluster_namespace}}`       | create                                   | 用于创建 secret资源                                    |
| works                                    | work.karmada.io     | *                  | karmada-es-`{{cluster_name}}` | get, create, list, watch, update, delete | 用于创建和管理特定命名空间下 的 work 资源              |
| works/status                             | work.karmada.io     | *                  | karmada-es-`{{cluster_name}}` | patch, update                            | 用于更新特定命名空间下 work 的状态                     |

## 其他组件

更多组件的权限信息待加入。

