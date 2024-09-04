---
title: 使用 Filebeat 来收集 Karmada 成员集群的日志
---

[Filebeat](https://github.com/elastic/beats/tree/master/filebeat) 是一个轻量级的运送器，用于转发和集中日志数据。作为代理安装在你的服务器上，Filebeat 监控你指定的日志文件或位置，收集日志事件，并将它们转发到 [Elasticsearch](https://www.elastic.co/products/elasticsearch) 或 [kafka](https://github.com/apache/kafka) 以进行索引。

本文演示了如何使用 `Filebeat` 来收集 Karmada 成员集群的日志。

## 启动 Karmada 集群

你只需要克隆 Karmada repo，并在 Karmada 目录下运行以下脚本。

```bash
hack/local-up-karmada.sh
```

## 启动Filebeat

1. 创建 Filebeat 的资源对象，内容如下，你可以在 `filebeat.yml` 中的 `filebeat.inputs` 部分指定一个输入列表。输入指定了 Filebeat 如何定位和处理输入数据，同时你也可以通过在 `filebeat.yml` 配置文件的 `Outputs` 部分设置选项来配置 Filebeat 写到一个特定的输出。这个例子将收集每个容器的日志信息，并将收集到的日志写到一个文件中。关于输入和输出配置的更多详细信息，请参考：https://github.com/elastic/beats/tree/master/filebeat/docs
   
   ```yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: logging
   ---
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: filebeat
     namespace: logging
     labels:
       k8s-app: filebeat
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRole
   metadata:
     name: filebeat
   rules:
   - apiGroups: [""] # "" indicates the core API group
     resources:
     - namespaces
     - pods
     verbs:
     - get
     - watch
     - list
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRoleBinding
   metadata:
     name: filebeat
   subjects:
   - kind: ServiceAccount
     name: filebeat
     namespace: kube-system
   roleRef:
     kind: ClusterRole
     name: filebeat
     apiGroup: rbac.authorization.k8s.io
   ---
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: filebeat-config
     namespace: logging
     labels:
       k8s-app: filebeat
       kubernetes.io/cluster-service: "true"
   data:
     filebeat.yml: |-
       filebeat.inputs:
       - type: container
         paths:
           - /var/log/containers/*.log
         processors:
           - add_kubernetes_metadata:
               host: ${NODE_NAME}
               matchers:
               - logs_path:
                   logs_path: "/var/log/containers/"
       # 要启用基于提示的自动发现功能，请删除 `filebeat.inputs` 配置，并取消注释。
       #filebeat.autodiscover:
       #  providers:
       #    - type: kubernetes
       #      node: ${NODE_NAME}
       #      hints.enabled: true
       #      hints.default_config:
       #        type: container
       #        paths:
       #          - /var/log/containers/*${data.kubernetes.container.id}.log
   
       processors:
         - add_cloud_metadata:
         - add_host_metadata:
   
       #output.elasticsearch:
       #  hosts: ['${ELASTICSEARCH_HOST:elasticsearch}:${ELASTICSEARCH_PORT:9200}']
       #  username: ${ELASTICSEARCH_USERNAME}
       #  password: ${ELASTICSEARCH_PASSWORD}
       output.file:
           path: "/tmp/filebeat"
           filename: filebeat
   ---
   apiVersion: apps/v1
   kind: DaemonSet
   metadata:
     name: filebeat
     namespace: logging
     labels:
       k8s-app: filebeat
   spec:
     selector:
       matchLabels:
         k8s-app: filebeat
     template:
       metadata:
         labels:
           k8s-app: filebeat
       spec:
         serviceAccountName: filebeat
         terminationGracePeriodSeconds: 30
         tolerations:
         - effect: NoSchedule
           key: node-role.kubernetes.io/master
         containers:
         - name: filebeat
           image: docker.elastic.co/beats/filebeat:8.0.0-beta1-amd64
           imagePullPolicy: IfNotPresent
           args: [  "-c", "/usr/share/filebeat/filebeat.yml",  "-e",]
           env:
           - name: NODE_NAME
             valueFrom:
               fieldRef:
                 fieldPath: spec.nodeName
           securityContext:
             runAsUser: 0
           resources:
             limits:
               memory: 200Mi
             requests:
               cpu: 100m
               memory: 100Mi
           volumeMounts:
           - name: config
             mountPath: /usr/share/filebeat/filebeat.yml
             readOnly: true
             subPath: filebeat.yml
           - name: inputs
             mountPath: /usr/share/filebeat/inputs.d
             readOnly: true
           - name: data
             mountPath: /usr/share/filebeat/data
           - name: varlibdockercontainers
             mountPath: /var/lib/docker/containers
             readOnly: true
           - name: varlog
             mountPath: /var/log
             readOnly: true
         volumes:
         - name: config
           configMap:
             defaultMode: 0600
             name: filebeat-config
         - name: varlibdockercontainers
           hostPath:
             path: /var/lib/docker/containers
         - name: varlog
           hostPath:
             path: /var/log
         - name: inputs
           configMap:
             defaultMode: 0600
             name: filebeat-config
         # data 文件夹存储了所有文件的读取状态的注册表，所以我们不会在 Filebeat pod 重启时再次发送所有文件。
         - name: data
           hostPath:
             path: /var/lib/filebeat-data
             type: DirectoryOrCreate
   ```
2. 运行下面的命令来执行 Karmada PropagationPolicy 和 ClusterPropagationPolicy。

   ```
   cat <<EOF | kubectl apply -f -
   apiVersion: policy.karmada.io/v1alpha1
   kind: PropagationPolicy
   metadata:
     name: filebeat-propagation
     namespace: logging
   spec:
     resourceSelectors:
       - apiVersion: v1
         kind: Namespace
         name: logging
       - apiVersion: v1
         kind: ServiceAccount
         name: filebeat
         namespace: logging
       - apiVersion: v1
         kind: ConfigMap
         name: filebeat-config
         namespace: logging
       - apiVersion: apps/v1
         kind: DaemonSet
         name: filebeat
         namespace: logging
     placement:
       clusterAffinity:
         clusterNames:
           - member1
           - member2
           - member3
   EOF
   cat <<EOF | kubectl apply -f -
   apiVersion: policy.karmada.io/v1alpha1
   kind: ClusterPropagationPolicy
   metadata:
     name: filebeatsrbac-propagation
   spec:
     resourceSelectors:
       - apiVersion: rbac.authorization.k8s.io/v1
         kind: ClusterRole
         name: filebeat
       - apiVersion: rbac.authorization.k8s.io/v1
         kind: ClusterRoleBinding
         name: filebeat
     placement:
       clusterAffinity:
         clusterNames:
         - member1
         - member2
         - member3
   EOF
   ```

3. 根据 filebeat.yml 的 output 配置，获取收集的日志。

## 参考资料
- https://github.com/elastic/beats/tree/master/filebeat
- https://github.com/elastic/beats/tree/master/filebeat/docs
