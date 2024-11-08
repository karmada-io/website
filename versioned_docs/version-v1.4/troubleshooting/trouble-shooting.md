---
title: Troubleshooting
---

## I can't access some resources when installing Karmada

- Pull images from Kubernetes Image Registry (registry.k8s.io).

  You can run the following commands to change the image registry in Mainland China.

  ```shell
  sed -i'' -e "s#registry.k8s.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-etcd.yaml
  sed -i'' -e "s#registry.k8s.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-apiserver.yaml
  sed -i'' -e "s#registry.k8s.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/kube-controller-manager.yaml
  ```

- Download the Golang package in Mainland China and run the following command before installation.

  ```shell
  export GOPROXY=https://goproxy.cn
  ```
  
  
## Member cluster healthy checking does not work
If your environment is similar to the following.
>
> After registering member cluster to karmada with push mode, and using `kubectl get cluster`, found the cluster status was ready.
> Then, by opening the firewall between the member cluster and karmada, after waiting for a long time, the cluster status was also ready, not change to fail.


The cause of the problem was that the firewall did not close the already existing TCP connection between the member cluster and karmada.

- login to the node where the member cluster apiserver is located
- use the `tcpkill` command to close the tcp connection. 

```
# ens192 is the name of the network-card used by the member cluster to communicate with karmada.
tcpkill -9  -i ens192 src host ${KARMADA_APISERVER_IP} and dst port ${MEMBER_CLUTER_APISERVER_IP}
```

## x509: certificate signed by unknown authority issue when using `karmadactl init`

When using the `karmadactl init` command to install Karmada, `init` command raises the error log as follows:
```log
deploy.go:55] Post "https://192.168.24.211:32443/api/v1/namespaces": x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "karmada")
```

Cause: Karmada has been installed on the cluster before. `karmada-etcd` uses the `hostpath` mode to mount the local storage. When `karmada-etcd` is uninstalled, residual data exists. We need to delete files in the  default directory`/var/lib/karmada-etcd`. If the karmadactl  [--etcd-data](https://github.com/karmada-io/karmada/blob/master/pkg/karmadactl/cmdinit/cmdinit.go#L119) parameter is used, please delete the corresponding directory.

Related Issue: [#1467](https://github.com/karmada-io/karmada/issues/1467), [#2504](https://github.com/karmada-io/karmada/issues/2504).

## karmada-webhook keeps on crashing due to "too many open files"

When using `hack/local-up-karmada` to install Karmada, karmada-webhook keeps on crashing raising the error log as follows:

```log
I1121 06:33:46.144605       1 webhook.go:83] karmada-webhook version: version.Info{GitVersion:"v1.3.0-425-gf7cac365", GitCommit:"f7cac365d743e5e40493f9ad90352f30123f7f1d", GitTreeState:"dirty", BuildDate:"2022-11-21T06:25:19Z", GoVersion:"go1.19.3", Compiler:"gc", Platform:"linux/amd64"}
I1121 06:33:46.167045       1 webhook.go:113] registering webhooks to the webhook server
I1121 06:33:46.169425       1 internal.go:362] "Starting server" path="/metrics" kind="metrics" addr="[::]:8080"
I1121 06:33:46.169569       1 internal.go:362] "Starting server" kind="health probe" addr="[::]:8000"
I1121 06:33:46.169670       1 shared_informer.go:285] caches populated
I1121 06:33:46.169828       1 internal.go:567] "Stopping and waiting for non leader election runnables"
I1121 06:33:46.169848       1 internal.go:571] "Stopping and waiting for leader election runnables"
I1121 06:33:46.169856       1 internal.go:577] "Stopping and waiting for caches"
I1121 06:33:46.169883       1 internal.go:581] "Stopping and waiting for webhooks"
I1121 06:33:46.169899       1 internal.go:585] "Wait completed, proceeding to shutdown the manager"
E1121 06:33:46.169909       1 webhook.go:132] webhook server exits unexpectedly: too many open files
E1121 06:33:46.169926       1 run.go:74] "command failed" err="too many open files"
```

It's a resource exhaustion issue. You can fix it with:

```
sysctl fs.inotify.max_user_watches=16384
sysctl -w fs.inotify.max_user_watches=100000
sysctl -w fs.inotify.max_user_instances=100000
```

Related Issue: https://github.com/kubernetes-sigs/kind/issues/2928