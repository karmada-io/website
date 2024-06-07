---
title: karmadactl init
---

Install the Karmada control plane in a Kubernetes cluster

### Synopsis

Install the Karmada control plane in a Kubernetes cluster.

 By default, the images and CRD tarball are downloaded remotely. For offline installation, you can set '--private-image-registry' and '--crds'.

```
karmadactl init
```

### Examples

```
  # Install Karmada in Kubernetes cluster
  # The karmada-apiserver binds the master node's IP by default
  karmadactl init
  
  # China mainland registry mirror can be specified by using kube-image-mirror-country
  karmadactl init --kube-image-mirror-country=cn
  
  # Kube registry can be specified by using kube-image-registry
  karmadactl init --kube-image-registry=registry.cn-hangzhou.aliyuncs.com/google_containers
  
  # Specify the URL to download CRD tarball
  karmadactl init --crds https://github.com/karmada-io/karmada/releases/download/v0.0.0-master/crds.tar.gz
  
  # Specify the local CRD tarball
  karmadactl init --crds /root/crds.tar.gz
  
  # Use PVC to persistent storage etcd data
  karmadactl init --etcd-storage-mode PVC --storage-classes-name {StorageClassesName}
  
  # Use hostPath to persistent storage etcd data. For data security, only 1 etcd pod can run in hostPath mode
  karmadactl init --etcd-storage-mode hostPath  --etcd-replicas 1
  
  # Use hostPath to persistent storage etcd data but select nodes by labels
  karmadactl init --etcd-storage-mode hostPath --etcd-node-selector-labels karmada.io/etcd=true
  
  # Private registry can be specified for all images
  karmadactl init --etcd-image local.registry.com/library/etcd:3.5.13-0
  
  # Specify Karmada API Server IP address. If not set, the address on the master node will be used.
  karmadactl init --karmada-apiserver-advertise-address 192.168.1.2
  
  # Deploy highly available(HA) karmada
  karmadactl init --karmada-apiserver-replicas 3 --etcd-replicas 3 --etcd-storage-mode PVC --storage-classes-name {StorageClassesName}
  
  # Specify external IPs(load balancer or HA IP) which used to sign the certificate
  karmadactl init --cert-external-ip 10.235.1.2 --cert-external-dns www.karmada.io
```

### Options

```
      --cert-external-dns string                         the external DNS of Karmada certificate (e.g localhost,localhost.com)
      --cert-external-ip string                          the external IP of Karmada certificate (e.g 192.168.1.2,172.16.1.2)
      --cert-validity-period duration                    the validity period of Karmada certificate (e.g 8760h0m0s, that is 365 days) (default 8760h0m0s)
      --context string                                   The name of the kubeconfig context to use
      --crds string                                      Karmada crds resource.(local file e.g. --crds /root/crds.tar.gz) (default "https://github.com/karmada-io/karmada/releases/download/v0.0.0-master/crds.tar.gz")
      --etcd-data string                                 etcd data path,valid in hostPath mode. (default "/var/lib/karmada-etcd")
      --etcd-image string                                etcd image
      --etcd-init-image string                           etcd init container image (default "docker.io/alpine:3.19.1")
      --etcd-node-selector-labels string                 etcd pod select the labels of the node. valid in hostPath mode ( e.g. --etcd-node-selector-labels karmada.io/etcd=true)
      --etcd-pvc-size string                             etcd data path,valid in pvc mode. (default "5Gi")
      --etcd-replicas int32                              etcd replica set, cluster 3,5...singular (default 1)
      --etcd-storage-mode string                         etcd data storage mode(emptyDir,hostPath,PVC). value is PVC, specify --storage-classes-name (default "hostPath")
      --external-etcd-ca-cert-path string                The path of CA certificate of the external etcd cluster in pem format.
      --external-etcd-client-cert-path string            The path of client side certificate to the external etcd cluster in pem format.
      --external-etcd-client-key-path string             The path of client side private key to the external etcd cluster in pem format.
      --external-etcd-key-prefix string                  The key prefix to be configured to kube-apiserver through --etcd-prefix.
      --external-etcd-servers string                     The server urls of external etcd cluster, to be used by kube-apiserver through --etcd-servers.
  -h, --help                                             help for init
      --host-cluster-domain string                       The cluster domain of karmada host cluster. (e.g. --host-cluster-domain=host.karmada) (default "cluster.local")
      --image-pull-policy string                         The image pull policy for all Karmada components container. One of Always, Never, IfNotPresent. Defaults to IfNotPresent. (default "IfNotPresent")
      --image-pull-secrets strings                       Image pull secrets are used to pull images from the private registry, could be secret list separated by comma (e.g '--image-pull-secrets PullSecret1,PullSecret2', the secrets should be pre-settled in the namespace declared by '--namespace')
      --karmada-aggregated-apiserver-image string        Karmada aggregated apiserver image (default "docker.io/karmada/karmada-aggregated-apiserver:v0.0.0-master")
      --karmada-aggregated-apiserver-replicas int32      Karmada aggregated apiserver replica set (default 1)
      --karmada-apiserver-advertise-address string       The IP address the Karmada API Server will advertise it's listening on. If not set, the address on the master node will be used.
      --karmada-apiserver-image string                   Kubernetes apiserver image
      --karmada-apiserver-replicas int32                 Karmada apiserver replica set (default 1)
      --karmada-controller-manager-image string          Karmada controller manager image (default "docker.io/karmada/karmada-controller-manager:v0.0.0-master")
      --karmada-controller-manager-replicas int32        Karmada controller manager replica set (default 1)
  -d, --karmada-data string                              Karmada data path. kubeconfig cert and crds files (default "/etc/karmada")
      --karmada-kube-controller-manager-image string     Kubernetes controller manager image
      --karmada-kube-controller-manager-replicas int32   Karmada kube controller manager replica set (default 1)
      --karmada-pki string                               Karmada pki path. Karmada cert files (default "/etc/karmada/pki")
      --karmada-scheduler-image string                   Karmada scheduler image (default "docker.io/karmada/karmada-scheduler:v0.0.0-master")
      --karmada-scheduler-replicas int32                 Karmada scheduler replica set (default 1)
      --karmada-webhook-image string                     Karmada webhook image (default "docker.io/karmada/karmada-webhook:v0.0.0-master")
      --karmada-webhook-replicas int32                   Karmada webhook replica set (default 1)
      --kube-image-mirror-country string                 Country code of the kube image registry to be used. For Chinese mainland users, set it to cn
      --kube-image-registry string                       Kube image registry. For Chinese mainland users, you may use local gcr.io mirrors such as registry.cn-hangzhou.aliyuncs.com/google_containers to override default kube image registry
      --kube-image-tag string                            Choose a specific Kubernetes version for the control plane. (default "v1.27.11")
      --kubeconfig string                                absolute path to the kubeconfig file
  -n, --namespace string                                 Kubernetes namespace (default "karmada-system")
  -p, --port int32                                       Karmada apiserver service node port (default 32443)
      --private-image-registry string                    Private image registry where pull images from. If set, all required images will be downloaded from it, it would be useful in offline installation scenarios.  In addition, you still can use --kube-image-registry to specify the registry for Kubernetes's images.
      --storage-classes-name string                      Kubernetes StorageClasses Name
      --wait-component-ready-timeout int                 Wait for karmada component ready timeout. 0 means wait forever (default 120)
```

### Options inherited from parent commands

```
      --add-dir-header                   If true, adds the file directory to the header of the log messages
      --alsologtostderr                  log to standard error as well as files (no effect when -logtostderr=true)
      --log-backtrace-at traceLocation   when logging hits line file:N, emit a stack trace (default :0)
      --log-dir string                   If non-empty, write log files in this directory (no effect when -logtostderr=true)
      --log-file string                  If non-empty, use this log file (no effect when -logtostderr=true)
      --log-file-max-size uint           Defines the maximum size a log file can grow to (no effect when -logtostderr=true). Unit is megabytes. If the value is 0, the maximum file size is unlimited. (default 1800)
      --logtostderr                      log to standard error instead of files (default true)
      --one-output                       If true, only write logs to their native severity level (vs also writing to each lower severity level; no effect when -logtostderr=true)
      --skip-headers                     If true, avoid header prefixes in the log messages
      --skip-log-headers                 If true, avoid headers when opening log files (no effect when -logtostderr=true)
      --stderrthreshold severity         logs at or above this threshold go to stderr when writing to files and stderr (no effect when -logtostderr=true or -alsologtostderr=true) (default 2)
  -v, --v Level                          number for the log level verbosity
      --vmodule moduleSpec               comma-separated list of pattern=N settings for file-filtered logging
```

### SEE ALSO

* [karmadactl](karmadactl.md)	 - karmadactl controls a Kubernetes Cluster Federation.

#### Go Back to [Karmadactl Commands](karmadactl_index.md) Homepage.


###### Auto generated by [spf13/cobra script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/genkarmadactldocs).