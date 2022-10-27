---
title: Troubleshooting
---

## I can't access some resources when installing Karmada

- Pull images from Google Container Registry (k8s.gcr.io).

  You can run the following commands to change the image registry in Mainland China.

  ```shell
  sed -i'' -e "s#k8s.gcr.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-etcd.yaml
  sed -i'' -e "s#k8s.gcr.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-apiserver.yaml
  sed -i'' -e "s#k8s.gcr.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/kube-controller-manager.yaml
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

Cause: Karmada has been installed on the cluster before. `karmada-etcd` uses the `hostpath` mode to mount the local storage. When `karmada-etcd` is uninstalled, residual data exists. We need to delete files in the  defualt directory`/var/lib/karmada-etcd`. If the karmdactl  [--etcd-data](https://github.com/karmada-io/karmada/blob/master/pkg/karmadactl/cmdinit/cmdinit.go#L119) parameter is used, please delete the corresponding directory.

Related Issue: [#1467](https://github.com/karmada-io/karmada/issues/1467), [#2504](https://github.com/karmada-io/karmada/issues/2504).
