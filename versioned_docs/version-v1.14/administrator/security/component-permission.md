---
title: Component Permissions
---

# Karmada Component Permissions

This document provides a detailed explanation of the resources each Karmada component needs to access and the reasons for these accesses. It will help administrators understand and configure the RBAC permissions needed for Karmada components effectively, ensuring that the system operates securely and efficiently.
The [installation tools](https://karmada.io/docs/installation/) maintained by the community are designed with security in mind. These tools use Role-Based Access Control ([RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)) to manage access to components, ensuring they only have access to the resources they require. By adhering to the principle of least privilege, these tools minimize potential security risks and prevent unauthorized access or actions within the system.

## karmada-operator

### Introduction:

The Karmada operator is a method for installing, upgrading, and deleting Karmada instances. It builds upon the basic Karmada resource and controller concepts, provides convenience to centrally manage entire lifecycle of Karmada instances in a global cluster.

### Resources in Cluster Where karmada-operator is deployed

| Resource        | API Group           | Resource Names | Namespace | Verbs                       | Description                                                  |
| --------------- | ------------------- | -------------- | --------- | --------------------------- | ------------------------------------------------------------ |
| leases          | coordination.k8s.io | *              | *         | get, create, update         | Required for leader election                                 |
| karmadas        | operator.karmada.io | *              | *         | get, list, watch, update    | To manage Karmada instances                                  |
| karmadas/status | operator.karmada.io | *              | *         | update                      | To update the status subresource of Karmada instances        |
| events          | ""                  | *              | *         | create                      | Allows karmada-operator to record events in the Kubernetes API server |
| nodes           | ""                  | *              | NA        | list                        | To get Node IP                                               |
| pods            | ""                  | *              | *         | list                        | For  pod health checks                                       |
| namespaces      | ""                  | *              | *         | get                         | To get information about namespaces, and deploy resources into specific namespaces |
| secrets         | ""                  | *              | *         | get, create, update, delete | To manage secrets which might contain sensitive data like credentials |
| services        | ""                  | *              | *         | get, create, update, delete | To manage services to expose applications within the cluster |
| statefulsets    | ""                  | *              | *         | get, create, update, delete | To manage StatefulSets, e.g., etcd                           |
| deployments     | apps                | *              | *         | get, create, update, delete | To manage Deployments, e.g., karmada-apiserver               |

| Non-Resource URLs | Verbs | Description |
|-------------|-------|-------------|
| /healthz | get | Used to check whether the Karmada API server is healthy. |

### Resources in Karmada System

NONE.

## karmada-agent

### Introduction:

karmada-agent can register a specific cluster to the Karmada control plane and sync manifests from the Karmada control plane to the member cluster. In addition, it also syncs the status of member cluster and manifests to the Karmada control plane.

### Resources in Cluster Where karmada-agent is deployed

| Resource | API Group | Resource Names | Namespace | Verbs | Description                                               |
| -------- | --------- | -------------- | --------- | ----- | --------------------------------------------------------- |
| *        | *         | *              | *         | *     | karmada-agent acts as an administrator in member clusters |

| Non-Resource URLs | Verbs | Description                                               |
| ----------------- | ----- | --------------------------------------------------------- |
| *                 | get   | karmada-agent acts as an administrator in member clusters |

### Resources in Karmada System

In the following table, `{{cluster_name}}` represents the name of the member cluster that has been registered by the karmada-agent, and `{{cluster_namespace}}` indicates the namespace where the secrets resource of the member cluster is deployed, which is `karmada-cluster` by default.

| Resource                                 | API Group           | Resource Names     | Namespace                     | Verbs                                    | Description                                                  |
| ---------------------------------------- | ------------------- | ------------------ | ----------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| clusters                                 | cluster.karmada.io  | *                  | NA                            | list, watch，create                      | Used to create cluster and listen for cluster status         |
| clusters                                 | cluster.karmada.io  | `{{cluster_name}}` | NA                            | get, delete                              | To manager specific clusters                                 |
| clusters/status                          | cluster.karmada.io  | `{{cluster_name}}` | NA                            | update                                   | Used to update the status of a specific cluster              |
| resourceinterpreterwebhookconfigurations | config.karmada.io   | *                  | NA                            | get, list, watch                         | Used to get the resourceinterpreterwebhookconfigurations resource |
| resourceinterpretercustomizations        | config.karmada.io   | *                  | NA                            | get, list, watch                         | Used to get the resourceinterpretercustomizations resource   |
| namespaces                               | ""                  | *                  | *                             | get                                      | Used to get namespaces                                       |
| leases                                   | coordination.k8s.io | *                  | *                             | get, create, update                      | Required for leader election                                 |
| certificatesigningrequests               | certificates.k8s.io | *                  | NA                            | get, create                              | Obtaining and creating CSRs for Karmada-agent's certificate rotation |
| services                                 | ""                  | *                  | *                             | list, watch                              | Used to build the ClusterIPServiceResolver resource interpreter. |
| events                                   | ""                  | *                  | *                             | create, patch, update                    | Allow karmada-agent to log events in Karmada API Server      |
| secrets                                  | ""                  | `{{cluster_name}}` | `{{cluster_namespace}}`       | get, patch                               | For accessing and modifying specific secret resources        |
| secrets                                  | ""                  | *                  | `{{cluster_namespace}}`       | create                                   | Used to create secret resources                              |
| works                                    | work.karmada.io     | *                  | karmada-es-`{{cluster_name}}` | get, create, list, watch, update, delete | Used to create and manage work resources in a specific namespace |
| works/status                             | work.karmada.io     | *                  | karmada-es-`{{cluster_name}}` | patch, update                            | Used to update the status of work in a specific namespace    |

## Other components

Permission information for more components to be added.
