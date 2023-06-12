---
title: Installation Overview
---

## Prerequisites

### Karmada kubectl plugin
`kubectl-karmada` is the Karmada command-line tool that lets you control the Karmada control plane, it presents as
the [kubectl plugin][1].
For installation instructions see [installing kubectl-karmada](./install-cli-tools.md#install-kubectl-karmada).

### Karmadactl
`karmadactl` is also the command-line tool that lets you control the Karmada control plane. Compared with kubectl-karmada,
it is a complete CLI tool exclusive to Karmada. 
For installation instructions see [installing karmadactl](./install-cli-tools.md#install-karmadactl).

:::note

Although the above two tools have different forms, the related commands and options are exactly the same. 
The following takes kubectl-karmada as an example.
Replacing it with karmadactl also works fine.

In actual use, you can choose a CLI tool according to your needs.

:::

## Install Karmada by Karmada command-line tool

### Install Karmada on your own cluster

Assume you have put your cluster's `kubeconfig` file to `$HOME/.kube/config` or specify the path
with `KUBECONFIG` environment variable. Otherwise, you should specify the configuration file by
setting `--kubeconfig` flag to the following commands.

> Note: The `init` command is available from v1.0. Running `init` command requires escalated privileges for it to store public configurations (certs, crds) for multiple users under default location `/etc/karmada`, you can override this location via flags `--karmada-data` and `--karmada-pki`. Refer to CLI for more details or usage information.

Run the following command to install:
```bash
kubectl karmada init
```
It might take about 5 minutes and if everything goes well, you will see outputs similar to:
```
I1121 19:33:10.270959 2127786 tlsbootstrap.go:61] [bootstrap-token] configured RBAC rules to allow certificate rotation for all agent client certificates in the member cluster
I1121 19:33:10.275041 2127786 deploy.go:127] Initialize karmada bootstrap token
I1121 19:33:10.281426 2127786 deploy.go:397] create karmada kube controller manager Deployment
I1121 19:33:10.288232 2127786 idempotency.go:276] Service karmada-system/kube-controller-manager has been created or updated.
...
...
------------------------------------------------------------------------------------------------------
 █████   ████   █████████   ███████████   ██████   ██████   █████████   ██████████     █████████
░░███   ███░   ███░░░░░███ ░░███░░░░░███ ░░██████ ██████   ███░░░░░███ ░░███░░░░███   ███░░░░░███
 ░███  ███    ░███    ░███  ░███    ░███  ░███░█████░███  ░███    ░███  ░███   ░░███ ░███    ░███
 ░███████     ░███████████  ░██████████   ░███░░███ ░███  ░███████████  ░███    ░███ ░███████████
 ░███░░███    ░███░░░░░███  ░███░░░░░███  ░███ ░░░  ░███  ░███░░░░░███  ░███    ░███ ░███░░░░░███
 ░███ ░░███   ░███    ░███  ░███    ░███  ░███      ░███  ░███    ░███  ░███    ███  ░███    ░███
 █████ ░░████ █████   █████ █████   █████ █████     █████ █████   █████ ██████████   █████   █████
░░░░░   ░░░░ ░░░░░   ░░░░░ ░░░░░   ░░░░░ ░░░░░     ░░░░░ ░░░░░   ░░░░░ ░░░░░░░░░░   ░░░░░   ░░░░░
------------------------------------------------------------------------------------------------------
Karmada is installed successfully.

Register Kubernetes cluster to Karmada control plane.

Register cluster with 'Push' mode

Step 1: Use "kubectl karmada join" command to register the cluster to Karmada control plane. --cluster-kubeconfig is kubeconfig of the member cluster.
(In karmada)~# MEMBER_CLUSTER_NAME=$(cat ~/.kube/config  | grep current-context | sed 's/: /\n/g'| sed '1d')
(In karmada)~# kubectl karmada --kubeconfig /etc/karmada/karmada-apiserver.config  join ${MEMBER_CLUSTER_NAME} --cluster-kubeconfig=$HOME/.kube/config

Step 2: Show members of karmada
(In karmada)~# kubectl --kubeconfig /etc/karmada/karmada-apiserver.config get clusters


Register cluster with 'Pull' mode

Step 1: Use "kubectl karmada register" command to register the cluster to Karmada control plane. "--cluster-name" is set to cluster of current-context by default.
(In member cluster)~# kubectl karmada register 172.18.0.3:32443 --token lm6cdu.lcm4wafod2jmjvty --discovery-token-ca-cert-hash sha256:9bf5aa53d2716fd9b5568c85db9461de6429ba50ef7ade217f55275d89e955e4

Step 2: Show members of karmada
(In karmada)~# kubectl --kubeconfig /etc/karmada/karmada-apiserver.config get clusters

```

The components of Karmada are installed in `karmada-system` namespace by default, you can get them by:
```bash
kubectl get deployments -n karmada-system
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
karmada-aggregated-apiserver   1/1     1            1           102s
karmada-apiserver              1/1     1            1           2m34s
karmada-controller-manager     1/1     1            1           116s
karmada-scheduler              1/1     1            1           119s
karmada-webhook                1/1     1            1           113s
kube-controller-manager        1/1     1            1           2m3s
```
And the `karmada-etcd` is installed as the `StatefulSet`, get it by:
```bash
kubectl get statefulsets -n karmada-system
NAME   READY   AGE
etcd   1/1     28m
```

The configuration file of Karmada will be created to `/etc/karmada/karmada-apiserver.config` by default.

#### Offline installation

When installing Karmada, the `kubectl karmada init` will download the APIs(CRD) from the Karmada official release page
(e.g. `https://github.com/karmada-io/karmada/releases/tag/v0.10.1`) and load images from the official registry by default.

If you want to install Karmada offline, maybe you have to specify the APIs tar file as well as the image.

Use `--crds` flag to specify the CRD file. e.g.
```bash
kubectl karmada init --crds /$HOME/crds.tar.gz
```

The images of Karmada components could be specified, take `karmada-controller-manager` as an example:
```bash
kubectl karmada init --karmada-controller-manager-image=example.registry.com/library/karmada-controller-manager:1.0 
```

#### Deploy HA
Use `--karmada-apiserver-replicas` and `--etcd-replicas` flags to specify the number of the replicas (defaults to `1`).
```bash
kubectl karmada init --karmada-apiserver-replicas 3 --etcd-replicas 3
```

### Install Karmada in Kind cluster

> kind is a tool for running local Kubernetes clusters using Docker container "nodes".
> It was primarily designed for testing Kubernetes itself, not for production.

Create a cluster named `host` by `hack/create-cluster.sh`:
```bash
hack/create-cluster.sh host $HOME/.kube/host.config
```

Install Karmada v1.2.0 by command `kubectl karmada init`:
```bash
kubectl karmada init --crds https://github.com/karmada-io/karmada/releases/download/v1.2.0/crds.tar.gz --kubeconfig=$HOME/.kube/host.config
```

Check installed components:
```bash
kubectl get pods -n karmada-system --kubeconfig=$HOME/.kube/host.config
NAME                                           READY   STATUS    RESTARTS   AGE
etcd-0                                         1/1     Running   0          2m55s
karmada-aggregated-apiserver-84b45bf9b-n5gnk   1/1     Running   0          109s
karmada-apiserver-6dc4cf6964-cz4jh             1/1     Running   0          2m40s
karmada-controller-manager-556cf896bc-79sxz    1/1     Running   0          2m3s
karmada-scheduler-7b9d8b5764-6n48j             1/1     Running   0          2m6s
karmada-webhook-7cf7986866-m75jw               1/1     Running   0          2m
kube-controller-manager-85c789dcfc-k89f8       1/1     Running   0          2m10s
```

## Install Karmada by Helm Chart Deployment

Please refer to [installing by Helm](https://github.com/karmada-io/karmada/tree/master/charts/karmada).

## Install Karmada by Karmada Operator

Please refer to [installing by Karmada Operator](https://github.com/karmada-io/karmada/blob/master/operator/README.md)

## Install Karmada by binary

Please refer to [installing by binary](./install-binary.md).

## Install Karmada from source

Please refer to [installing from source](./fromsource.md).

[1]: https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/

## Install Karmada for development environment

If you want to try Karmada, we recommend that build a development environment by
`hack/local-up-karmada.sh` which will do following tasks for you:
- Start a Kubernetes cluster by [kind](https://kind.sigs.k8s.io/) to run the Karmada control plane, aka. the `host cluster`.
- Build Karmada control plane components based on a current codebase.
- Deploy Karmada control plane components on the `host cluster`.
- Create member clusters and join Karmada.

**1. Clone Karmada repo to your machine:**
```
git clone https://github.com/karmada-io/karmada
```
or use your fork repo by replacing your `GitHub ID`:
```
git clone https://github.com/<GitHub ID>/karmada
```

**2. Change to the karmada directory:**
```
cd karmada
```

**3. Deploy and run Karmada control plane:**

run the following script:

```
hack/local-up-karmada.sh
```
This script will do following tasks for you:
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

**4. Check registered cluster**

```
kubectl get clusters --kubeconfig=/$HOME/.kube/karmada.config
```

You will get similar output as follows:
```
NAME      VERSION   MODE   READY   AGE
member1   v1.23.4   Push   True    7m38s
member2   v1.23.4   Push   True    7m35s
member3   v1.23.4   Pull   True    7m27s
```

There are 3 clusters named `member1`, `member2` and `member3` have registered with `Push` or `Pull` mode.
