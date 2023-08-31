---
title: Propagate a deployment by Karmada
---

This guide will cover:
- Install `karmada` control plane components in a Kubernetes cluster which is known as `host cluster`.
- Join a member cluster to `karmada` control plane.
- Propagate an application by using `karmada`.

### Prerequisites
- [Go](https://golang.org/) version v1.18+
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) version v1.19+
- [kind](https://kind.sigs.k8s.io/) version v0.14.0+

### Install the Karmada control plane

#### 1. Clone this repo to your machine:
```
git clone https://github.com/karmada-io/karmada
```

#### 2. Change to the karmada directory:
```
cd karmada
```

#### 3. Deploy and run Karmada control plane:

run the following script:

```
# hack/local-up-karmada.sh
```
This script will do the following tasks for you:
- Start a Kubernetes cluster to run the Karmada control plane, aka. the `host cluster`.
- Build Karmada control plane components based on a current codebase.
- Deploy Karmada control plane components on the `host cluster`.
- Create member clusters and join Karmada.

If everything goes well, at the end of the script output, you will see similar messages as follows:
```
Local Karmada is running.

To start using your Karmada environment, run:
  export KUBECONFIG="$HOME/.kube/karmada.config"
Please use 'kubectl config use-context karmada-host/karmada-apiserver' to switch the host and control plane cluster.

To manage your member clusters, run:
  export KUBECONFIG="$HOME/.kube/members.config"
Please use 'kubectl config use-context member1/member2/member3' to switch to the different member cluster.
```

There are two contexts in Karmada:
- karmada-apiserver `kubectl config use-context karmada-apiserver`
- karmada-host `kubectl config use-context karmada-host`

The `karmada-apiserver` is the **main kubeconfig** to be used when interacting with the Karmada control plane, while `karmada-host` is only used for debugging Karmada installation with the host cluster. You can check all clusters at any time by running: `kubectl config view`. To switch cluster contexts, run `kubectl config use-context [CONTEXT_NAME]`


### Demo

![Demo](../resources/general/sample-nginx.svg)

### Propagate application
In the following steps, we are going to propagate a deployment by Karmada.

#### 1. Create nginx deployment in Karmada.
First, create a [deployment](https://github.com/karmada-io/karmada/blob/master/samples/nginx/deployment.yaml) named `nginx`:
```
kubectl create -f samples/nginx/deployment.yaml
```

#### 2. Create PropagationPolicy that will propagate nginx to member cluster
Then, we need to create a policy to propagate the deployment to our member cluster.
```
kubectl create -f samples/nginx/propagationpolicy.yaml
```

#### 3. Check the deployment status from Karmada
You can check deployment status from Karmada, don't need to access member cluster:
```
$ kubectl get deployment
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   2/2     2            2           20s
```