---
title: Autoscaling across clusters with resource metrics
---
In Karmada, a FederatedHPA scales up/down the workload's replicas across multiple clusters, with the aim of automatically scaling the workload to match the demand.

When the load is increased, FederatedHPA scales up the replicas of the workload (Deployment, StatefulSet, or other similar resource) if the number of Pods is under the configured maximum. When the load is decreased, FederatedHPA scales down the replicas of the workload if the number of Pods is above the configured minimum.

This document walks you through an example of enabling FederatedHPA to automatically manage scaling for a cross-cluster  nginx Deployment.

The walkthrough example will do as follows:  

* One Deployment's Pod exists in `member1` cluster.
* The Service is deployed in `member1` and `member2` clusters.
* A `MultiClusterService` enables cross-cluster access between the `nginx-service` services in `member1` and `member2`.
* Request the service from `member1`, route traffic to backend pods in both clusters, and trigger an increase in the pods' CPU utilization.
* The replicas will be scaled up in `member1` and `member2` clusters.

In this example, the role of `MultiClusterService` is to load balance user requests to different member clusters, simulating a real-world scenario where applications in multiple clusters share the load. In practice, `FederatedHPA` does not require `MultiClusterService`.

## Prerequisites

### Karmada has been installed

We can install Karmada by referring to [Quick Start](https://github.com/karmada-io/karmada#quick-start), or directly run `hack/local-up-karmada.sh` script which is also used to run our E2E cases.

### Member Cluster Network

Ensure that at least two clusters have been added to Karmada, and the container networks between member clusters are connected.

- If you use the `hack/local-up-karmada.sh` script to deploy Karmada, Karmada will have three member clusters, and the container networks of the `member1` and `member2` will be connected.
- You can use `Submariner` or other related open source projects to connect networks between member clusters.

> Note: To prevent routing conflicts, the Pod and Service CIDRs of clusters must be non-overlapping.

### metrics-server has been installed in member clusters

We need to install `metrics-server` for member clusters to provider the metrics API, install it by running:
```sh
hack/deploy-k8s-metrics-server.sh ${member_cluster_kubeconfig} ${member_cluster_context_name} 
```

If you use the `hack/local-up-karmada.sh` script to deploy Karmada, you can run following command to deploy `metrics-server` in all three member clusters:
```sh
hack/deploy-k8s-metrics-server.sh $HOME/.kube/members.config member1
hack/deploy-k8s-metrics-server.sh $HOME/.kube/members.config member2
hack/deploy-k8s-metrics-server.sh $HOME/.kube/members.config member3
```

### karmada-metrics-adapter has been installed in Karmada control plane

We need to install `karmada-metrics-adapter` in Karmada control plane to provide the metrics API, install it by running:
```sh
hack/deploy-metrics-adapter.sh ${host_cluster_kubeconfig} ${host_cluster_context} ${karmada_apiserver_kubeconfig} ${karmada_apiserver_context_name}
```

If you use the `hack/local-up-karmada.sh` script to deploy Karmada, `karmada-metrics-adapter` will be installed by default.

## Deploy workloads in `member1` and `member2` clusters

We need to deploy the Deployment (1 replica) and Service in `member1` and `member2`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 1
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
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: nginx
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
    - apiVersion: v1
      kind: Service
      name: nginx-service
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - member1
            weight: 1
          - targetCluster:
              clusterNames:
                - member2
            weight: 1
```

After deploying, you can check the propagation of the Pods and Service:
```sh
$ karmadactl get pods --operation-scope members
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-mbdn8   member1   1/1     Running   0          9h
$ karmadactl get svc --operation-scope members
NAME                    CLUSTER   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE   ADOPTION
nginx-service           member1   ClusterIP   10.11.216.215   <none>        80/TCP    9h    Y
nginx-service           member2   ClusterIP   10.13.46.61     <none>        80/TCP    9h    Y

```

## Deploy FederatedHPA in Karmada control plane

Then let's deploy FederatedHPA in Karmada control plane.

```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: FederatedHPA
metadata:
  name: nginx
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 1
  maxReplicas: 10
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 10
    scaleUp:
      stabilizationWindowSeconds: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 10
```

After deploying, you can check the FederatedHPA:
```sh
$ kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-apiserver get fhpa
NAME    REFERENCE-KIND   REFERENCE-NAME   MINPODS   MAXPODS   REPLICAS   AGE
nginx   Deployment       nginx            1         10        1          9h
```

## Create a `MultiClusterService` for cross-cluster access

The `MultiClusterService` is used to enable cross-cluster access between the `nginx-service` services in `member1` and `member2`. When a client in `member1` accesses `nginx-service`, the request is not limited to the backend pods local to `member1`; it can also be routed to backend pods behind the `nginx-service` service in `member2`. More usage of `MultiClusterService` can be found in [MultiClusterService user guide](../userguide/service/multi-cluster-service-with-native-svc-access.mdx).

Create a `MultiClusterService` object on Karmada Control Plane.
  ```yaml
  apiVersion: networking.karmada.io/v1alpha1
  kind: MultiClusterService
  metadata:
    name: nginx-service
  spec:
    types:
      - CrossCluster
    consumerClusters:
      - name: member1
      - name: member2
    providerClusters:
      - name: member1
      - name: member2
  ```

After deploying, requests sent from `member1` to `nginx-service` can be routed to backend pods in both `member1` and `member2`.

## Install hey http load testing tool in member1 cluster

In order to do http requests, here we use `hey`.
* Download `hey` and copy it to kind cluster container.
```sh
wget -O hey https://storage.googleapis.com/hey-releases/hey_linux_amd64
chmod +x hey
docker cp hey member1-control-plane:/usr/local/bin/hey
```

## Test scaling up

* Check the Pod propagation firstly.
  ```sh
  $ karmadactl get pods --operation-scope members
  NAME                     CLUSTER   READY   STATUS      RESTARTS   AGE
  nginx-777bc7b6d7-mbdn8   member1   1/1     Running     0          61m
  ```

* Check the service IP in `member1`.
  ```sh
  $ karmadactl get svc --operation-scope members
  NAME                    CLUSTER   TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)   AGE   ADOPTION
  nginx-service   member1   ClusterIP   10.11.59.213      <none>        80/TCP    20m   Y
  ```

* Request the service from `member1` with `hey` to increase the the nginx Pods' CPU usage across both clusters.
  ```sh
  docker exec member1-control-plane hey -c 1000 -z 1m http://10.11.59.213
  ```

* Wait 15s, the replicas will be scaled up, then you can check the Pod propagation again.
  ```sh
  $ karmadactl get pods --operation-scope members -l app=nginx
  NAME                     CLUSTER   READY   STATUS      RESTARTS   AGE
  nginx-777bc7b6d7-c2cfv   member1   1/1     Running     0          22s
  nginx-777bc7b6d7-mbdn8   member1   1/1     Running     0          62m
  nginx-777bc7b6d7-pk2s4   member1   1/1     Running     0          37s
  nginx-777bc7b6d7-tbb4k   member1   1/1     Running     0          37s
  nginx-777bc7b6d7-znlj9   member1   1/1     Running     0          22s
  nginx-777bc7b6d7-6n7d9   member2   1/1     Running     0          22s
  nginx-777bc7b6d7-dfbnw   member2   1/1     Running     0          22s
  nginx-777bc7b6d7-fsdg2   member2   1/1     Running     0          37s
  nginx-777bc7b6d7-kddhn   member2   1/1     Running     0          22s
  nginx-777bc7b6d7-lwn52   member2   1/1     Running     0          37s
  
  ```

## Test scaling down

After 1 minute, the load testing tool will be stopped, then you can see the workload is scaled down across clusters.
```sh
$ karmadactl get pods --operation-scope members -l app=nginx
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-mbdn8   member1   1/1     Running   0          64m
```
