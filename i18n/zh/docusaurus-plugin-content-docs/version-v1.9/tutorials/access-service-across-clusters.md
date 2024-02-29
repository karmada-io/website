---
title: Access service across clusters within native service
---

In Karmada, the MultiClusterService can enable users to access services across clusters with the native service domain name, like `foo.svc`, with the aim of providing users with a seamless experience when accessing services across multiple clusters, as if they were operating within a single cluster.

This document provides an example of how to enable MultiClusterService for accessing service across clusters with native service.

## Prerequisites

### Karmada has been installed

We can install Karmada by referring to [Quick Start](https://github.com/karmada-io/karmada#quick-start), or directly run `hack/local-up-karmada.sh` script which is also used to run our E2E cases.

### Member Cluster Network

Ensure that at least two clusters have been added to Karmada, and the container networks between member clusters are connected.

* If you use the `hack/local-up-karmada.sh` script to deploy Karmada, Karmada will have three member clusters, and the container networks of the member1 and member2 will be connected.
* You can use `Submariner` or other related open source projects to connected networks between member clusters.

Note: In order to prevent routing conflicts, Pod and Service CIDRs of clusters need non-overlapping.

## Deploy deployment in `member1` cluster

We need to deploy deployment in `member1` cluster:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
        resources:
          requests:
            cpu: 25m
            memory: 64Mi
          limits:
            cpu: 25m
            memory: 64Mi
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

After deploying, you can check the created pods:
```sh
$ karmadactl get po
NAME                     CLUSTER   READY   STATUS              RESTARTS   AGE
nginx-5c54b4855f-6sq9s   member1   1/1     Running             0          28s
nginx-5c54b4855f-vp948   member1   1/1     Running             0          28s
```

## Deploy curl pod in `member2` cluster

Let's deploy a curl pod in `member2` cluster:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: curl
  labels:
    app: curl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: curl
  template:
    metadata:
      labels:
        app: curl
    spec:
      containers:
      - image: curlimages/curl:latest
        command: ["sleep", "infinity"]
        name: curl
        resources:
          requests:
            cpu: 25m
            memory: 64Mi
          limits:
            cpu: 25m
            memory: 64Mi
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: curl-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: curl
  placement:
    clusterAffinity:
      clusterNames:
        - member2
```


After deploying, you can check the created pods:
```sh
$ karmadactl get po -C member2
NAME                    CLUSTER   READY   STATUS    RESTARTS   AGE
curl-6894f46595-c75rc   member2   1/1     Running   0          15s
```

Later, we will run the curl command in this pod.

## Deploy MultiClusterService and Service in Karmada

Now, instead of using PropagationPolicy/ClusterPropagationPolicy for the service, we utilize MultiClusterService for propagation.

To enable multi-cluster service in Karmada, deploy the following yaml:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: nginx
---
apiVersion: networking.karmada.io/v1alpha1
kind: MultiClusterService
metadata:
   name: nginx
spec:
  types:
    - CrossCluster
  consumerClusters:
    - name: member2
  providerClusters:
    - name: member1
```

## Access the backend pods from member2 cluster

To access the backend pods in the member1 cluster from the member2 cluster, execute the following command:
```sh
$ karmadactl exec -C member2 curl-6894f46595-c75rc -it -- sh
~ $ curl http://nginx.default
Hello, world!
Version: 1.0.0
Hostname: nginx-0
```

Using MultiClusterService, the pods are situated solely in the member1 cluster. However, they can be accessed from the member2 cluster using the native service name.
