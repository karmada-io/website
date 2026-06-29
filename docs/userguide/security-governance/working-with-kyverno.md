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

In this case, we will use Kyverno v1.17.1. Related deployment files are from [here](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

:::note

You can choose the version of Kyverno based on that of the cluster where Karmada is installed. See details [here](https://kyverno.io/docs/installation/#compatibility-matrix).

:::

### Install Kyverno APIs on Karmada

1. Switch to Karmada control plane.

```shell
kubectl config use-context karmada-apiserver
```

2. Create resource objects of Kyverno in Karmada control plane. The content is as follows and does not need to be modified.

Deploy namespace:

You need to extract lines L1-L9 from the [Kyverno v1.17.1 installation file](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

Deploy configmap:

You need to extract lines L58-L198 from the [Kyverno v1.17.1 installation file](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

Deploy RBAC resources:

You need to extract lines L10-L57 and L87053-L88316 from the [Kyverno v1.17.1 installation file](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

Deploy CRDs:

```shell
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/kyverno.io_cleanuppolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/kyverno.io_clustercleanuppolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/kyverno.io_clusterpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/kyverno.io_globalcontextentries.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/kyverno.io_policies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/kyverno.io_policyexceptions.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/kyverno.io_updaterequests.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_deletingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_generatingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_imagevalidatingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_mutatingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_namespaceddeletingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_namespacedgeneratingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_namespacedimagevalidatingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_namespacedmutatingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_namespacedvalidatingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_policyexceptions.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/policies.kyverno.io_validatingpolicies.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/reports.kyverno.io_clusterephemeralreports.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/reports.kyverno.io_ephemeralreports.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/wgpolicyk8s.io_clusterpolicyreports.yaml
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.17.1/wgpolicyk8s.io_policyreports.yaml
```

### Install Kyverno components on host cluster

1. Switch to `karmada-host` context.

```shell
kubectl config use-context karmada-host 
```

2. Create resource objects of Kyverno in karmada-host context, the content is as follows.

Deploy namespace:

You need to extract lines L1-L9 from the [Kyverno v1.17.1 installation file](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

Deploy RBAC resources:

You need to extract lines L10-L57 and L87053-L88316 from the [Kyverno v1.17.1 installation file](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

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

Deploy Service resources:

You need to extract lines L88317-L88450 from the [Kyverno v1.17.1 installation file](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

Deploy Kyverno Deployments resources:

You need to extract lines L88451-L89043 from the [Kyverno v1.17.1 installation file](https://github.com/kyverno/kyverno/releases/download/v1.17.1/install.yaml).

Please note that we need to add the startup argument `--kubeconfig=/etc/kubeconfig` to all deployments so that Kyverno can access the Karmada control plane. Using `kyverno-admission-controller` as an example, the updated content is shown below:

<details>

<summary>unfold me to see the yaml</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kyverno-admission-controller
  namespace: kyverno
  labels:
    app.kubernetes.io/component: admission-controller
    app.kubernetes.io/instance: kyverno
    app.kubernetes.io/part-of: kyverno
    app.kubernetes.io/version: v1.17.1
spec:
  replicas:
  revisionHistoryLimit: 10
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 40%
    type: RollingUpdate
  selector:
    matchLabels:
      app.kubernetes.io/component: admission-controller
      app.kubernetes.io/instance: kyverno
      app.kubernetes.io/part-of: kyverno
  template:
    metadata:
      labels:
        app.kubernetes.io/component: admission-controller
        app.kubernetes.io/instance: kyverno
        app.kubernetes.io/part-of: kyverno
        app.kubernetes.io/version: v1.17.1
    spec:
      nodeSelector:
        kubernetes.io/os: linux
      dnsPolicy: ClusterFirst
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app.kubernetes.io/component
                  operator: In
                  values:
                  - admission-controller
              topologyKey: kubernetes.io/hostname
            weight: 1
      serviceAccountName: kyverno-admission-controller
      automountServiceAccountToken: true
      initContainers:
        - name: kyverno-pre
          image: "reg.kyverno.io/kyverno/kyvernopre:v1.17.1"
          imagePullPolicy: IfNotPresent
          args:
            - --loggingFormat=text
            - --v=2
            - --openreportsEnabled=false
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
            seccompProfile:
              type: RuntimeDefault
          env:
          - name: KYVERNO_SERVICEACCOUNT_NAME
            value: kyverno-admission-controller
          - name: KYVERNO_ROLE_NAME
            value: kyverno:admission-controller
          - name: INIT_CONFIG
            value: kyverno
          - name: METRICS_CONFIG
            value: kyverno-metrics
          - name: KYVERNO_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          - name: KYVERNO_POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: KYVERNO_DEPLOYMENT
            value: kyverno-admission-controller
          - name: KYVERNO_SVC
            value: kyverno-svc
      containers:
        - name: kyverno
          image: "reg.kyverno.io/kyverno/kyverno:v1.17.1"
          imagePullPolicy: IfNotPresent
          args:
            - --caSecretName=kyverno-svc.kyverno.svc.kyverno-tls-ca
            - --tlsSecretName=kyverno-svc.kyverno.svc.kyverno-tls-pair
            - --tlsKeyAlgorithm=RSA
            - --backgroundServiceAccountName=system:serviceaccount:kyverno:kyverno-background-controller
            - --reportsServiceAccountName=system:serviceaccount:kyverno:kyverno-reports-controller
            - --servicePort=443
            - --webhookServerPort=9443
            - --resyncPeriod=15m
            - --crdWatcher=false
            - --disableMetrics=false
            - --otelConfig=prometheus
            - --metricsPort=8000
            - --admissionReports=true
            - --maxAdmissionReports=1000
            - --autoUpdateWebhooks=true
            - --enableConfigMapCaching=true
            - --controllerRuntimeMetricsAddress=:8080
            - --enableDeferredLoading=true
            - --dumpPayload=false
            - --forceFailurePolicyIgnore=false
            - --generateValidatingAdmissionPolicy=true
            - --generateMutatingAdmissionPolicy=false
            - --dumpPatches=false
            - --maxAPICallResponseLength=2000000
            - --loggingFormat=text
            - --v=2
            - --omitEvents=PolicyApplied,PolicySkipped
            - --enablePolicyException=false
            - --protectManagedResources=false
            - --allowInsecureRegistry=false
            - --registryCredentialHelpers=default,google,amazon,azure,github
            - --enableReporting=validate,mutate,mutateExisting,imageVerify,generate
            - --kubeconfig=/etc/kubeconfig

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
            seccompProfile:
              type: RuntimeDefault
          ports:
          - containerPort: 9443
            name: https
            protocol: TCP
          - containerPort: 8000
            name: metrics-port
            protocol: TCP

          env:
          - name: INIT_CONFIG
            value: kyverno
          - name: METRICS_CONFIG
            value: kyverno-metrics
          - name: KYVERNO_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          - name: KYVERNO_POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: KYVERNO_SERVICEACCOUNT_NAME
            value: kyverno-admission-controller
          - name: KYVERNO_ROLE_NAME
            value: kyverno:admission-controller
          - name: KYVERNO_SVC
            value: kyverno-svc
          - name: TUF_ROOT
            value: /.sigstore
          - name: KYVERNO_DEPLOYMENT
            value: kyverno-admission-controller
          startupProbe:
            failureThreshold: 20
            httpGet:
              path: /health/liveness
              port: 9443
              scheme: HTTPS
            initialDelaySeconds: 2
            periodSeconds: 6
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
          readinessProbe:
            failureThreshold: 6
            httpGet:
              path: /health/readiness
              port: 9443
              scheme: HTTPS
            initialDelaySeconds: 5
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 5
          volumeMounts:
            - mountPath: /.sigstore
              name: sigstore
            - mountPath: /etc/kubeconfig
              name: kubeconfig
              subPath: kubeconfig
      volumes:
      - name: sigstore
        emptyDir: {}
      - name: kubeconfig
        secret:
          defaultMode: 420
          secretName: kubeconfig
```

</details>

For multi-cluster `kyverno-admission-controller` deployment (other components do not require this setting), we need to add the config of `--serverIP` which is the address of the webhook server. So you need to ensure that the network from nodes in Karmada control plane to those in `karmada-host` cluster is connected and expose Kyverno controller pods to control plane, for example, using `nodePort` above. This ensures that when the component registers `ValidatingAdmissionWebhook` and `MutatingAdmissionWebhook`, it can set the webhook server address to `--serverIP`, allowing the webhook server to be reachable from `karmada-apiserver`.

Note: you also need to change the type of the `kyverno-svc` Service to `NodePort` to work with the configuration above.

## Run demo

### Validate Resources

ValidatingPolicy is a CRD which `Kyverno` offers to support different kinds of rules. Here is an example ValidatingPolicy which means that you must create pod with `team` label.
You can use the following commands to create it in Karmada control plane.

```shell
kubectl config use-context karmada-apiserver  
```
   
```shell
kubectl create -f- << EOF
apiVersion: policies.kyverno.io/v1alpha1
kind: ValidatingPolicy
metadata:
  name: require-labels
spec:
  validationActions:
    - Deny
  matchConstraints:
    resourceRules:
      - apiGroups: ['']
        apiVersions: ['v1']
        operations: ['CREATE', 'UPDATE']
        resources: ['pods']
  validations:
    - message: "label 'team' is required"
      expression: "has(object.metadata.labels) && has(object.metadata.labels.team) && object.metadata.labels.team != ''"
EOF
```

The output is similar to:

```
validatingpolicy.policies.kyverno.io/require-labels created
```

### Create a bad deployment without labels 

```console
kubectl create deployment nginx --image=nginx
```

The output is similar to:

```
error: failed to create deployment: admission webhook "vpol.validate.kyverno.svc-fail" denied the request: Policy require-labels failed: label 'team' is required
```

## Reference

- https://github.com/kyverno/kyverno
- https://kyverno.io/docs/introduction/quick-start/#validate-resources
