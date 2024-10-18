---
title: Components Privileges
---

### karmada-operator
```yaml
rules:
  - apiGroups:
      - coordination.k8s.io
    resources:
      - leases # karmada-operator requires access to the Lease resource for leader election.
    verbs:
      - get # to check if a lease exists.
      - create # to acquire a new lease.
      - update # to renew an existing lease.
  - apiGroups:
      - operator.karmada.io
    resources:
      - karmadas # to manage karmada instances
    verbs:
      - get # to fetch details of karmada instances.
      - list # to list all karmada instances.
      - watch # to watch for changes in karmada instances.
      - update # to modify karmada instances.
  - apiGroups:
      - operator.karmada.io
    resources:
      - karmadas/status
    verbs:
      - update # to update the status subresource of karmada instances.
  - apiGroups:
      - ""
    resources:
      - events # allows karmada-operator to record events in the kubernetes api-server.
    verbs:
      - create
  - apiGroups:
      - ""
    resources:
      - nodes # to list cluster nodes, which is necessary to get node information.
      - pods # to list pods, potentially for health checks or other operational needs.
    verbs:
      - list
  - apiGroups:
      - ""
    resources:
      - namespaces # to get information about namespaces, and deploy resources into specific namespaces.
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - secrets # to manage secrets, which might contain sensitive data like credentials.
      - services # to manage services, which are used to expose applications within the cluster.
    verbs:
      - get # to retrieve secret and service configurations.
      - create # to create new secrets and services.
      - update # to modify existing secrets and services.
      - delete # to remove unused secrets and services.
  - apiGroups:
      - apps
    resources:
      - statefulsets # to manage statefulsets, e.g. etcd.
      - deployments # to manage deployments, e.g. karmada-operator.
    verbs:
      - get # to retrieve statefulset and deployment configurations.
      - create # to create new statefulsets and deployments.
      - update # to modify existing statefulsets and deployments.
      - delete # to remove unused statefulsets and deployments.
```
