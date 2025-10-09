---
title: 分发依赖项
---

Deployment、Job、Pod、DaemonSet 和 StatefulSet 的依赖项（ConfigMap 和 Secret）可自动传播到成员集群。本文档将演示如何使用该特性，更多设计细节可参考 [依赖项自动传播](https://github.com/karmada-io/karmada/blob/master/docs/proposals/dependencies-automatically-propagation/README.md)。

## 前提条件
### 已安装 Karmada

可参考 [快速开始](https://github.com/karmada-io/karmada#quick-start) 安装 Karmada，也可直接运行 `hack/local-up-karmada.sh` 脚本（该脚本也用于运行 E2E 测试用例）。

### 开启 PropagateDeps 特性

自 Karmada v1.4 版本起，`PropagateDeps` 特性门控（Feature Gate）已演进至 Beta 阶段，且默认开启。若您使用的是 Karmada 1.3 及更早版本，需手动开启该特性门控：

```bash
kubectl edit deployment karmada-controller-manager -n karmada-system
```
在 `karmada-controller-manager` 容器的 `args` 列表中添加 `--feature-gates=PropagateDeps=true`。

## 示例演示
创建包含 Deployment 和其依赖 ConfigMap 的 YAML 文件，内容如下：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx
  labels:
    app: my-nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-nginx
  template:
    metadata:
      labels:
        app: my-nginx
    spec:
      containers:
      - image: nginx
        name: my-nginx
        ports:
        - containerPort: 80
        volumeMounts:
          - name: configmap
            mountPath: "/configmap"
      volumes:
        - name: configmap
          configMap:
            name: my-nginx-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-nginx-config
data:
  nginx.properties: |
    proxy-connect-timeout: "10s"
    proxy-read-timeout: "10s"
    client-max-body-size: "2m"
```
创建针对上述 Deployment 的传播策略，并设置 `propagateDeps: true` 以开启依赖项自动传播
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: my-nginx-propagation
spec:
  propagateDeps: true
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: my-nginx
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
策略执行成功后，Deployment 及其依赖的 ConfigMap 会自动传播到目标成员集群，可通过以下命令验证：
```bash
$  kubectl --kubeconfig /etc/karmada/karmada-apiserver.config get propagationpolicy
NAME                   AGE
my-nginx-propagation   16s
$  kubectl --kubeconfig /etc/karmada/karmada-apiserver.config get deployment
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-nginx   2/2     2            2           22m
# member cluster1
$ kubectl config use-context member1
Switched to context "member1".
$  kubectl get deployment
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-nginx   1/1     1            1           25m
$  kubectl get configmap
NAME               DATA   AGE
my-nginx-config    1      26m
# member cluster2
$ kubectl config use-context member2
Switched to context "member2".
$ kubectl get deployment
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-nginx   1/1     1            1           27m
$  kubectl get configmap
NAME               DATA   AGE
my-nginx-config    1      27m
```
