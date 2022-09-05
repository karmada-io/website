---
title: Use Prometheus to monitor Karmada control plane
---

[Prometheus](https://github.com/prometheus/prometheus), a [Cloud Native Computing Foundation](https://cncf.io/) project, is a system and service monitoring system. It collects metrics from configured targets at given intervals, evaluates rule expressions, displays the results, and can trigger alerts when specified conditions are observed.

This document gives an example to demonstrate how to use the `Prometheus` to monitor Karmada control plane.



## Start up karmada clusters

You just need to clone Karmada repo, and run the following script in Karmada directory.

```shell
hack/local-up-karmada.sh
```



## Start Prometheus

1. Create the resource of RBAC in both `karmada-host` context and `karmada-apiserver` context

   ```yaml
   apiVersion: v1
   kind: Namespace
   metadata:
      name: monitor
      labels:
        name: monitor
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRole
   metadata:
     name: prometheus
   rules:
   - apiGroups: [""]
     resources:
     - nodes
     - nodes/proxy
     - services
     - endpoints
     - pods
     verbs: ["get", "list", "watch"]
   - apiGroups:
     - extensions
     resources:
     - ingresses
     verbs: ["get", "list", "watch"]
   - nonResourceURLs: ["/metrics"]
     verbs: ["get"]
   - apiGroups:
     - 'cluster.karmada.io'
     resources:
     - '*'
     verbs:
     - '*'
   ---
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: prometheus
     namespace: monitor
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRoleBinding
   metadata:
     name: prometheus
   roleRef:
     apiGroup: rbac.authorization.k8s.io
     kind: ClusterRole
     name: prometheus
   subjects:
   - kind: ServiceAccount
     name: prometheus
     namespace: monitor
   ```

2. Create Secret for ServiceAccount **[need in k8s v1.24+]** 
   (Creating a ServiceAccount does not automatically generate Secret in v1.24+ )

   ```yaml
   apiVersion: v1
   kind: Secret
   type: kubernetes.io/service-account-token
   metadata:
     name: prometheus
     namespace: monitor
     annotations:
       kubernetes.io/service-account.name: "prometheus"
   ```

3. Get the token for accessing the karmada apiserver

   ```shell
   kubectl get secret prometheus -o=jsonpath={.data.token} -n monitor --context "karmada-apiserver" | base64 -d
   ```

4. Create resource objects of Prometheus in context `karmada-host`, also you need replace `<karmada-token>` (2 places) with the token got from step 3

   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: prometheus-config
     namespace: monitor
   data:
     prometheus.yml: |-
       global:
         scrape_interval:     15s 
         evaluation_interval: 15s
       scrape_configs:
       - job_name: 'karmada-scheduler'
         kubernetes_sd_configs:
         - role: endpoints
         scheme: http
         tls_config:
           insecure_skip_verify: true
         relabel_configs:
         - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_pod_label_app]
           action: keep
           regex: karmada-system;karmada-scheduler;karmada-scheduler
       - job_name: 'kubernetes-apiserver'
         kubernetes_sd_configs:
         - role: endpoints
         scheme: https
         tls_config:
           ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
         bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
         relabel_configs:
         - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
           action: keep
           regex: default;kubernetes;https
         - target_label: __address__
           replacement: kubernetes.default.svc:443
       - job_name: 'karmada-apiserver'
         kubernetes_sd_configs:
         - role: endpoints
         scheme: https
         tls_config:
           insecure_skip_verify: true
         bearer_token: <karmada-token>    # need the true karmada token
         relabel_configs:
         - source_labels: [__meta_kubernetes_pod_label_app]
           action: keep
           regex: karmada-apiserver
         - target_label: __address__
           replacement: karmada-apiserver.karmada-system.svc:5443
       - job_name: 'karmada-aggregated-apiserver'
         kubernetes_sd_configs:
         - role: endpoints
         scheme: https
         tls_config:
           insecure_skip_verify: true
         bearer_token: <karmada-token>    # need the true karmada token
         relabel_configs:
         - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoints_name]
           action: keep
           regex: karmada-system;karmada-aggregated-apiserver;karmada-aggregated-apiserver
         - target_label: __address__
           replacement: karmada-aggregated-apiserver.karmada-system.svc:443
       - job_name: 'kubernetes-cadvisor'
         scheme: https
         tls_config:
           ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
         bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
         kubernetes_sd_configs:
         - role: node
         relabel_configs:
         - target_label: __address__
           replacement: kubernetes.default.svc:443
         - source_labels: [__meta_kubernetes_node_name]
           regex: (.+)
           target_label: __metrics_path__
           replacement: /api/v1/nodes/${1}/proxy/metrics/cadvisor
         - action: labelmap
           regex: __meta_kubernetes_node_label_(.+)
         metric_relabel_configs:
         - action: replace
           source_labels: [id]
           regex: '^/machine\.slice/machine-rkt\\x2d([^\\]+)\\.+/([^/]+)\.service$'
           target_label: rkt_container_name
           replacement: '${2}-${1}'
         - action: replace
           source_labels: [id]
           regex: '^/system\.slice/(.+)\.service$'
           target_label: systemd_service_name
           replacement: '${1}'
         - source_labels: [pod]
           separator: ;
           regex: (.+)
           target_label: pod_name
           replacement: $1
           action: replace
   ---
   apiVersion: v1
   kind: "Service"
   metadata:
     name: prometheus
     namespace: monitor
     labels:
       name: prometheus
   spec:
     ports:
     - name: prometheus
       protocol: TCP
       port: 9090
       targetPort: 9090
       nodePort: 31801 
     selector:
       app: prometheus
     type: NodePort
   ---
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     labels:
       name: prometheus
     name: prometheus
     namespace: monitor
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: prometheus
     template:
       metadata:
         labels:
           app: prometheus
       spec:
         serviceAccountName: prometheus
         containers:
         - name: prometheus
           image: prom/prometheus:latest
           command:
           - "/bin/prometheus"
           args:
           - "--config.file=/etc/prometheus/prometheus.yml"
           - "--storage.tsdb.path=/prom-data"
           - "--storage.tsdb.retention.time=180d"
           ports:
           - containerPort: 9090
             protocol: TCP
           volumeMounts:
           - mountPath: "/etc/prometheus"
             name: prometheus-config
           - mountPath: "/prom-data"
             name: prom-data
         initContainers:
         - name: prometheus-data-permission-fix
           image: busybox
           command: ["/bin/chmod","-R","777", "/data"]
           volumeMounts:
           - name: prom-data
             mountPath: /data
         volumes:
         - name: prometheus-config
           configMap:
             name: prometheus-config
         - name: prom-data
           hostPath:
             path: /var/lib/prom-data
             type: DirectoryOrCreate
   
   ```

3. Use any node IP of the control plane and the port number (default 31801) to enter the Prometheus monitoring page of the control plane


## Visualizing metrics using Grafana
For a better experience with visual metrics, we can also use Grafana with Prometheus, as well as [Dashboards](https://grafana.com/grafana/dashboards/) provided by the community

1. install grafana with helm
```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

cat <<EOF | helm upgrade --install grafana grafana/grafana --kube-context "karmada-host" -n monitor -f -
persistence:
  enabled: true
  storageClassName: local-storage
service:
  enabled: true
  type: NodePort
  nodePort: 31802
  targetPort: 3000
  port: 80
EOF
```
2. get the login password for grafana web UI
```shell
kubectl get secret --namespace monitor grafana -o jsonpath="{.data.admin-password}" --context "karmada-host" | base64 --decode ; echo
```
3. Use any node IP of the control plane and the port number (default 31802) to enter the grafana web UI of the control plane

![imag](grafana.png)

**Attention**:

1. In k8s v1.24+, the metrics from cadvisor may miss image, name and container labels, this may cause the metrics of the karmada components (e.g karmada-apisever, kamada-controller-manager) to be unobserved [link](https://github.com/kubernetes/kubernetes/issues/111077)



## Reference

- https://github.com/prometheus/prometheus
- https://prometheus.io/
- https://grafana.com/grafana/dashboards/



