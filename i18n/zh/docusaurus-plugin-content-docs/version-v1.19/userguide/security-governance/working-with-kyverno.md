---
title: Working with Kyverno
---

[Kyverno](https://github.com/kyverno/kyverno), a [Cloud Native Computing Foundation](https://cncf.io/) project, is a policy engine designed for Kubernetes. It can validate, mutate, and generate configurations using admission controls and background scans. Kyverno policies are Kubernetes resources and do not require learning a new language. Kyverno is designed to work nicely with tools you already use like kubectl, kustomize, and Git.

This document gives an example to demonstrate how to use `Kyverno` to manage policies across multiple clusters.

## Setup Karmada

To start up Karmada, you can refer to [here](../../installation/installation.md).
If you just want to try Karmada, we recommend building a development environment by ```hack/local-up-karmada.sh```.

```sh
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
```

## Kyverno Installations

In this case, we will use Kyverno v1.6.3. Related deployment files are from [here](https://github.com/kyverno/kyverno/blob/release-1.6/config/install.yaml).

:::note

You can choose the version of Kyverno based on that of the cluster where Karmada is installed. See details [here](https://kyverno.io/docs/installation/#compatibility-matrix).
However, Kyverno 1.7.x removes the `kubeconfig` parameter and does not support out-of-cluster installations. **So Kyverno 1.7.x is not able to run with Karmada**.

:::

### Install Kyverno APIs on Karmada

1. Switch to Karmada control plane.

```shell
kubectl config use-context karmada-apiserver
```

2. Create resource objects of Kyverno in Karmada control plane. The content is as follows and does not need to be modified.

Deploy namespace: https://github.com/kyverno/kyverno/blob/release-1.6/config/install.yaml#L1-L12

Deploy configmap: https://github.com/kyverno/kyverno/blob/release-1.6/config/install.yaml#L7751-L7783

Deploy Kyverno CRDs: https://github.com/kyverno/kyverno/blob/release-1.6/config/install.yaml#L12-L7291

### Install Kyverno components on host cluster

1. Switch to `karmada-host` context.

```shell
kubectl config use-context karmada-host 
```

2. Create resource objects of Kyverno in karmada-host context, the content is as follows.

Deploy namespace: https://github.com/kyverno/kyverno/blob/release-1.6/config/install.yaml#L1-L12

Deploy RBAC resources: https://github.com/kyverno/kyverno/blob/release-1.6/config/install.yaml#L7292-L7750

Deploy Karmada kubeconfig in Kyverno namespace. Fill in the secret which represents kubeconfig pointing to karmada-apiserver, such as **ca_crt, client_cer and client_key** below.

```yaml
apiVersion: v1
stringData:
   kubeconfig: |-
      apiVersion: v1
      clusters:
      - cluster:
          certificate-authority-data: {{ca_crt}}
          server: https://karmada-apiserver.karmada-system.svc.cluster.local:5443
        name: kind-karmada
      contexts:
      - context:
          cluster: kind-karmada
          user: kind-karmada
        name: karmada
      current-context: karmada
      kind: Config
      preferences: {}
      users:
      - name: kind-karmada
        user:
          client-certificate-data: {{client_cer}}
          client-key-data: {{client_key}}
kind: Secret
metadata:
   name: kubeconfig
   namespace: kyverno
```

Deploy Kyverno controllers and services:
```yaml
apiVersion: v1
kind: Service
metadata:
   labels:
      app: kyverno
      app.kubernetes.io/component: kyverno
      app.kubernetes.io/instance: kyverno
      app.kubernetes.io/name: kyverno
      app.kubernetes.io/part-of: kyverno
      app.kubernetes.io/version: v1.6.3
   name: kyverno-svc
   namespace: kyverno
spec:
   type: NodePort
   ports:
      - name: https
        port: 443
        targetPort: https
        nodePort: {{nodePort}}
   selector:
      app: kyverno
      app.kubernetes.io/name: kyverno
---
apiVersion: v1
kind: Service
metadata:
   labels:
      app: kyverno
      app.kubernetes.io/component: kyverno
      app.kubernetes.io/instance: kyverno
      app.kubernetes.io/name: kyverno
      app.kubernetes.io/part-of: kyverno
      app.kubernetes.io/version: v1.6.3
   name: kyverno-svc-metrics
   namespace: kyverno
spec:
   ports:
      - name: metrics-port
        port: 8000
        targetPort: metrics-port
   selector:
      app: kyverno
      app.kubernetes.io/name: kyverno
---
apiVersion: apps/v1
kind: Deployment
metadata:
   labels:
      app: kyverno
      app.kubernetes.io/component: kyverno
      app.kubernetes.io/instance: kyverno
      app.kubernetes.io/name: kyverno
      app.kubernetes.io/part-of: kyverno
      app.kubernetes.io/version: v1.6.3
   name: kyverno
   namespace: kyverno
spec:
   replicas: 1
   selector:
      matchLabels:
         app: kyverno
         app.kubernetes.io/name: kyverno
   strategy:
      rollingUpdate:
         maxSurge: 1
         maxUnavailable: 40%
      type: RollingUpdate
   template:
      metadata:
         labels:
            app: kyverno
            app.kubernetes.io/component: kyverno
            app.kubernetes.io/instance: kyverno
            app.kubernetes.io/name: kyverno
            app.kubernetes.io/part-of: kyverno
            app.kubernetes.io/version: v1.6.3
      spec:
         affinity:
            podAntiAffinity:
               preferredDuringSchedulingIgnoredDuringExecution:
                  - podAffinityTerm:
                       labelSelector:
                          matchExpressions:
                             - key: app.kubernetes.io/name
                               operator: In
                               values:
                                  - kyverno
                       topologyKey: kubernetes.io/hostname
                    weight: 1
         containers:
            - args:
                 - --filterK8sResources=[Event,*,*][*,kube-system,*][*,kube-public,*][*,kube-node-lease,*][Node,*,*][APIService,*,*][TokenReview,*,*][SubjectAccessReview,*,*][*,kyverno,kyverno*][Binding,*,*][ReplicaSet,*,*][ReportChangeRequest,*,*][ClusterReportChangeRequest,*,*][PolicyReport,*,*][ClusterPolicyReport,*,*]
                 - -v=2
                 - --kubeconfig=/etc/kubeconfig
                 - --serverIP={{nodeIP}}:{{nodePort}}
              env:
                 - name: INIT_CONFIG
                   value: kyverno
                 - name: METRICS_CONFIG
                   value: kyverno-metrics
                 - name: KYVERNO_NAMESPACE
                   valueFrom:
                      fieldRef:
                         fieldPath: metadata.namespace
                 - name: KYVERNO_SVC
                   value: kyverno-svc
                 - name: TUF_ROOT
                   value: /.sigstore
              image: ghcr.io/kyverno/kyverno:v1.6.3
              imagePullPolicy: Always
              livenessProbe:
                 failureThreshold: 2
                 httpGet:
                    path: /health/liveness
                    port: 9443
                    scheme: HTTPS
                 initialDelaySeconds: 15
                 periodSeconds: 30
                 successThreshold: 1
                 timeoutSeconds: 5
              name: kyverno
              ports:
                 - containerPort: 9443
                   name: https
                   protocol: TCP
                 - containerPort: 8000
                   name: metrics-port
                   protocol: TCP
              readinessProbe:
                 failureThreshold: 4
                 httpGet:
                    path: /health/readiness
                    port: 9443
                    scheme: HTTPS
                 initialDelaySeconds: 5
                 periodSeconds: 10
                 successThreshold: 1
                 timeoutSeconds: 5
              resources:
                 limits:
                    memory: 384Mi
                 requests:
                    cpu: 100m
                    memory: 128Mi
              securityContext:
                 allowPrivilegeEscalation: false
                 capabilities:
                    drop:
                       - ALL
                 privileged: false
                 readOnlyRootFilesystem: true
                 runAsNonRoot: true
              volumeMounts:
                 - mountPath: /.sigstore
                   name: sigstore
                 - mountPath: /etc/kubeconfig
                   name: kubeconfig
                   subPath: kubeconfig
         initContainers:
            - env:
                 - name: METRICS_CONFIG
                   value: kyverno-metrics
                 - name: KYVERNO_NAMESPACE
                   valueFrom:
                      fieldRef:
                         fieldPath: metadata.namespace
              image: ghcr.io/kyverno/kyvernopre:v1.6.3
              imagePullPolicy: Always
              name: kyverno-pre
              resources:
                 limits:
                    cpu: 100m
                    memory: 256Mi
                 requests:
                    cpu: 10m
                    memory: 64Mi
              securityContext:
                 allowPrivilegeEscalation: false
                 capabilities:
                    drop:
                       - ALL
                 privileged: false
                 readOnlyRootFilesystem: true
                 runAsNonRoot: true
         securityContext:
            runAsNonRoot: true
         serviceAccountName: kyverno-service-account
         volumes:
            - emptyDir: {}
              name: sigstore
            - name: kubeconfig
              secret:
                 defaultMode: 420
                 secretName: kubeconfig
---
```

For multi-cluster deployment, we need to add the config of `--serverIP` which is the address of the webhook server. So you need to ensure that the network from nodes in Karmada control plane to those in `karmada-host` cluster is connected and expose Kyverno controller pods to control plane, for example, using `nodePort` above.

## Run demo
### Create require-labels ClusterPolicy

ClusterPolicy is a CRD which `Kyverno` offers to support different kinds of rules. Here is an example ClusterPolicy which means that you must create pod with `app.kubernetes.io/name` label.
You can use the following commands to create it in Karmada control plane.

```shell
kubectl config use-context karmada-apiserver  
```

```shell
kubectl create -f- << EOF
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: enforce
  rules:
  - name: check-for-labels
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "label 'app.kubernetes.io/name' is required"
      pattern:
        metadata:
          labels:
            app.kubernetes.io/name: "?*"
EOF
```

The output is similar to:

```
clusterpolicy.kyverno.io/require-labels created
```

### Create a bad deployment without labels

```console
kubectl create deployment nginx --image=nginx
```

The output is similar to:

```
error: failed to create deployment: admission webhook "validate.kyverno.svc-fail" denied the request: 

policy Deployment/default/nginx for resource violation: 

require-labels:
  autogen-check-for-labels: 'validation error: label ''app.kubernetes.io/name'' is
    required. rule autogen-check-for-labels failed at path /spec/template/metadata/labels/app.kubernetes.io/name/'

```

## Reference

- https://github.com/kyverno/kyverno