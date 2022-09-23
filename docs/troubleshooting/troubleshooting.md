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


