---
title: RBAC Permissions for Karmada Components
---

# RBAC Permissions for Karmada Components

## karmada-operator

| API Group | Resource | Verbs | Description |
|-----------|----------|-------|-------------|
| coordination.k8s.io | leases | get, create, update | Required for leader election. |
| operator.karmada.io | karmadas | get, list, watch, update | To manage Karmada instances. |
| operator.karmada.io | karmadas/status | update | To update the status subresource of Karmada instances. |
| "" (core) | events | create | Allows karmada-operator to record events in the Kubernetes API server. |
| "" (core) | nodes, pods | list | List cluster nodes and pods to get node information and for health checks. |
| "" (core) | namespaces | get | To get information about namespaces, and deploy resources into specific namespaces. |
| "" (core) | secrets, services | get, create, update, delete | To manage secrets which might contain sensitive data like credentials and services to expose applications within the cluster. |
| apps | statefulsets, deployments | get, create, update, delete | To manage StatefulSets, e.g., etcd, and Deployments, e.g., karmada-operator. |

| Non-Resource URLs | Verbs | Description |
|-------------|-------|-------------|
| /healthz | get | Used to check whether the Karmada API server is healthy. |


## karmada-agent

| API Group | Resource | Verbs | Description |
|-----------|----------|-------|-------------|
| cluster.karmada.io | clusters | list, watch | To manage and monitor clusters. |
| cluster.karmada.io | clusters | get, create, delete | resourceNames: `{{clustername}}` |
| cluster.karmada.io | clusters/status | update | resourceNames: `{{clustername}}` |
| config.karmada.io | resourceinterpreterwebhookconfigurations, resourceinterpretercustomizations | get, list, watch | To list and watch resource interpreter configurations. |
| "" (core) | namespaces | get | To get information about namespaces. |
| coordination.k8s.io | leases | get, create, update | Required for leader election. |
| certificates.k8s.io | certificatesigningrequests | get, create | To get and create CSR. |
| "" (core) | events | create, patch, update | Allows karmada-agent to record events in the Karmada API server. |
| "" (core) | secrets | get, create, patch | To manage secrets which might contain sensitive data like credentials. |
| work.karmada.io | works | get, list, watch, create, update, delete | To manage work resources. |
| work.karmada.io | works/status | patch, update | To update the status of work resources. |
