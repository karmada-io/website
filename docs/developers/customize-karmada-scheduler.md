---
title: Customize the scheduler
---

Karmada ships with a default scheduler that is described [here](../reference/components/karmada-scheduler.md). If the default scheduler does not suit your needs you can implement your own scheduler.
Karmada's `Scheduler Framework` is similar to Kubernetes, but unlike K8s, Karmada needs to deploy applications to a group of clusters instead of nodes. According to the placement field of the user's scheduling policy and the internal scheduling plug-in algorithm, the user's application will be deployed to the desired cluster group.

The scheduling process can be divided into the following four steps:
* Predicate: filter inappropriate clusters
* Priority: score the cluster
* SelectClusters: select cluster groups based on cluster scores and `SpreadConstraint`
* ReplicaScheduling: deploy the application replicas on the selected cluster group according to the configured replica scheduling policy

 ![schedule process](../resources/developers/schedule-process.png)

Among them, the plug-ins for filtering and scoring can be customized and configured based on the scheduler framework.

The default scheduler has several in-tree plugins:
* APIEnablement: a plugin that checks if the API(CRD) of the resource is installed in the target cluster.
* TaintToleration: a plugin that checks if a propagation policy tolerates a cluster's taints.
* ClusterAffinity: a plugin that checks if a resource selector matches the cluster label.
* SpreadConstraint: a plugin that checks if spread property in the Cluster.Spec.
* ClusterLocality: a score plugin that favors cluster that already have the resource.

You can customize your out-of-tree plugins according to your own scenario, and implement your scheduler through Karmada's `Scheduler Framework`.
This document will give a detailed description of how to customize a Karmada scheduler.

## Before you begin

You need to have a Karmada control plane. To start up Karmada, you can refer to [here](../installation/installation.md).
If you just want to try Karmada, we recommend building a development environment by ```hack/local-up-karmada.sh```.

```sh
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
```

## Deploy a plugin

Assume you want to deploy a new filter plugin named `TestFilter`. You can refer to the karmada-scheduler implementation in [pkg/scheduler/framework/plugins](https://github.com/karmada-io/karmada/tree/master/pkg/scheduler/framework/plugins) in the Karmada source directory.
The code directory after development is similar to:

```
.
├── apienablement
├── clusteraffinity
├── clusterlocality
├── spreadconstraint
├── tainttoleration
├── testfilter
│ ├── test_filter.go
```

The content of the test_filter.go file is as follows, and the specific filtering logic implementation is hidden.

```go
package testfilter

import (
	"context"

	clusterv1alpha1 "github.com/karmada-io/karmada/pkg/apis/cluster/v1alpha1"
	policyv1alpha1 "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
	workv1alpha2 "github.com/karmada-io/karmada/pkg/apis/work/v1alpha2"
	"github.com/karmada-io/karmada/pkg/scheduler/framework"
)

const (
	// Name is the name of the plugin used in the plugin registry and configurations.
	Name = "TestFilter"
)

type TestFilter struct{}

var _ framework.FilterPlugin = &TestFilter{}

// New instantiates the TestFilter plugin.
func New() (framework.Plugin, error) {
	return &TestFilter{}, nil
}

// Name returns the plugin name.
func (p *TestFilter) Name() string {
	return Name
}

// Filter implements the filtering logic of the TestFilter plugin.
func (p *TestFilter) Filter(ctx context.Context,
	bindingSpec *workv1alpha2.ResourceBindingSpec, bindingStatus *workv1alpha2.ResourceBindingStatus, cluster *clusterv1alpha1.Cluster) *framework.Result {

	// implementation

	return framework.NewResult(framework.Success)
}
```

For a filter plugin, you must implement `framework.FilterPlugin` interface. And for a score plugin, you must implement `framework.ScorePlugin` interface.

## Register the plugin

Edit the [cmd/scheduler/main.go](https://github.com/karmada-io/karmada/blob/master/cmd/scheduler/main.go):

```go
package main

import (
	"os"

	"k8s.io/component-base/cli"
	_ "k8s.io/component-base/logs/json/register" // for JSON log format registration
	controllerruntime "sigs.k8s.io/controller-runtime"
	_ "sigs.k8s.io/controller-runtime/pkg/metrics"

	"github.com/karmada-io/karmada/cmd/scheduler/app"
	"github.com/karmada-io/karmada/pkg/scheduler/framework/plugins/testfilter"
)

func main() {
	stopChan := controllerruntime.SetupSignalHandler().Done()
	command := app.NewSchedulerCommand(stopChan, app.WithPlugin(testfilter.Name, testfilter.New))
	code := cli.Run(command)
	os.Exit(code)
}

```

To register the plugin, you need to pass in the plugin configuration in the `NewSchedulerCommand` function.

## Package the scheduler

After you register the plugin, you need to package your scheduler binary into a container image.

```shell
cd karmada
export VERSION=## Your Image Tag
make image-karmada-scheduler
```

```shell
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-host edit deploy/karmada-scheduler -nkarmada-system
...
 spec:
      automountServiceAccountToken: false
      containers:
      - command:
        - /bin/karmada-scheduler
        - --kubeconfig=/etc/kubeconfig
        - --bind-address=0.0.0.0
        - --secure-port=10351
        - --enable-scheduler-estimator=true
        - --v=4
        image: ## Your Image Address
...
```

When you start the scheduler, you can find that `TestFilter` plugin has been enabled from the logs:

```
I0105 09:50:11.809137       1 scheduler.go:109] karmada-scheduler version: version.Info{GitVersion:"v1.4.0-141-g119cb8e1", GitCommit:"119cb8e1e8be0142ca3d32c619c25e5ec4b0a1b6", GitTreeState:"dirty", BuildDate:"2023-01-05T09:42:41Z", GoVersion:"go1.19.3", Compiler:"gc", Platform:"linux/amd64"}
I0105 09:50:11.813339       1 registry.go:63] Enable Scheduler plugin "SpreadConstraint"
I0105 09:50:11.813470       1 registry.go:63] Enable Scheduler plugin "ClusterLocality"
I0105 09:50:11.813483       1 registry.go:63] Enable Scheduler plugin "TestFilter"
I0105 09:50:11.813489       1 registry.go:63] Enable Scheduler plugin "APIEnablement"
I0105 09:50:11.813545       1 registry.go:63] Enable Scheduler plugin "TaintToleration"
I0105 09:50:11.813596       1 registry.go:63] Enable Scheduler plugin "ClusterAffinity"
```

## Config the plugin

You can config the plugin enablement by setting the flag `--plugins`.
For example, the following config will disable `TestFilter` plugin.

```shell
kubectl kubectl --kubeconfig ~/.kube/karmada.config --context karmada-host edit deploy/karmada-scheduler -nkarmada-system
...
 spec:
      automountServiceAccountToken: false
      containers:
      - command:
        - /bin/karmada-scheduler
        - --kubeconfig=/etc/kubeconfig
        - --bind-address=0.0.0.0
        - --secure-port=10351
        - --enable-scheduler-estimator=true
        - --plugins=*,-TestFilter
        - --v=4
        image: ## Your Image Address
...
```

## Configure Multiple Schedulers

### Run the second scheduler in the cluster

You can run multiple schedulers simultaneously alongside the default scheduler and instruct Karmada what scheduler to use for each of your workloads.
Here is an sample of the deployment config. You can save it as `my-scheduler.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-karmada-scheduler
  namespace: karmada-system
  labels:
    app: my-karmada-scheduler
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-karmada-scheduler
  template:
    metadata:
      labels:
        app: my-karmada-scheduler
    spec:
      automountServiceAccountToken: false
      tolerations:
        - key: node-role.kubernetes.io/master
          operator: Exists
      containers:
        - name: karmada-scheduler
          image: docker.io/karmada/karmada-scheduler:latest
          imagePullPolicy: IfNotPresent
          livenessProbe:
            httpGet:
              path: /healthz
              port: 10351
              scheme: HTTP
            failureThreshold: 3
            initialDelaySeconds: 15
            periodSeconds: 15
            timeoutSeconds: 5
          command:
            - /bin/karmada-scheduler
            - --kubeconfig=/etc/kubeconfig
            - --bind-address=0.0.0.0
            - --secure-port=10351
            - --enable-scheduler-estimator=true
            - --leader-elect-resource-name=my-scheduler # Your custom scheduler name
            - --scheduler-name=my-scheduler # Your custom scheduler name
            - --v=4
          volumeMounts:
            - name: kubeconfig
              subPath: kubeconfig
              mountPath: /etc/kubeconfig
      volumes:
        - name: kubeconfig
          secret:
            secretName: kubeconfig
```

> Note: For the `--leader-elect-resource-name` option, it will be `karmada-scheduler` by default. If you deploy another scheduler along with the default scheduler,
> this option should be specified and it's recommended to use the scheduler name as the value.

In order to run your scheduler in Karmada, create the deployment specified in the config above:

```shell
kubectl --context karmada-host create -f my-scheduler.yaml
```

Verify that the scheduler pod is running:

```
kubectl --context karmada-host get pods --namespace=karmada-system
```

```
NAME                                           READY     STATUS    RESTARTS   AGE
....
my-karmada-scheduler-lnf4s-4744f               1/1       Running   0          2m
...
```

You should see a "Running" my-karmada-scheduler pod, in addition to the default karmada-scheduler pod in this list.

### Specify schedulers for deployments

Now that your second scheduler is running, create some deployments, and direct them to be scheduled by either the default scheduler or the one you deployed. 
In order to schedule a given deployment using a specific scheduler, specify the name of the scheduler in that propagationPolicy spec. 
Let's look at three examples.

* PropagationPolicy spec without any scheduler name

```yaml
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
        - member2
```

When no scheduler name is supplied, the deployment is automatically scheduled using the default-scheduler.

* PropagationPolicy spec with `default-scheduler`

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  schedulerName: default-scheduler
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```

A scheduler is specified by supplying the scheduler name as a value to `spec.schedulerName`. 
In this case, we supply the name of the default scheduler which is `default-scheduler`.

* PropagationPolicy spec with `my-scheduler`

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  schedulerName: my-scheduler
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```

In this case, we specify that this deployment should be scheduled using the scheduler that we deployed - `my-scheduler`. 
Note that the value of `spec.schedulerName` should match the name supplied for the scheduler in the schedulerName field of options in the second schedulers.

### Verifying that the deployments were scheduled using the desired schedulers

In order to make it easier to work through these examples, you can look at the "Scheduled" entries in the event logs to verify that the deployments were scheduled by the desired schedulers.

```shell
kubectl --context karmada-apiserver describe deploy/nginx
```