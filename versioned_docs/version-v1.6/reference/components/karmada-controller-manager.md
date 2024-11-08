---
title: karmada-controller-manager
---



### Synopsis

The karmada-controller-manager runs various controllers.
The controllers watch Karmada objects and then talk to the underlying clusters' API servers 
to create regular Kubernetes resources.

```
karmada-controller-manager [flags]
```

### Options

```
      --add_dir_header                                                 If true, adds the file directory to the header of the log messages
      --alsologtostderr                                                log to standard error as well as files (no effect when -logtostderr=true)
      --bind-address string                                            The IP address on which to listen for the --secure-port port. (default "0.0.0.0")
      --cluster-api-burst int                                          Burst to use while talking with cluster kube-apiserver. Doesn't cover events and node heartbeat apis which rate limiting is controlled by a different set of flags. (default 60)
      --cluster-api-context string                                     Name of the cluster context in cluster-api management cluster kubeconfig file.
      --cluster-api-kubeconfig string                                  Path to the cluster-api management cluster kubeconfig file.
      --cluster-api-qps float32                                        QPS to use while talking with cluster kube-apiserver. Doesn't cover events and node heartbeat apis which rate limiting is controlled by a different set of flags. (default 40)
      --cluster-cache-sync-timeout duration                            Timeout period waiting for cluster cache to sync. (default 30s)
      --cluster-failure-threshold duration                             The duration of failure for the cluster to be considered unhealthy. (default 30s)
      --cluster-lease-duration duration                                Specifies the expiration period of a cluster lease. (default 40s)
      --cluster-lease-renew-interval-fraction float                    Specifies the cluster lease renew interval fraction. (default 0.25)
      --cluster-monitor-grace-period duration                          Specifies the grace period of allowing a running cluster to be unresponsive before marking it unhealthy. (default 40s)
      --cluster-monitor-period duration                                Specifies how often karmada-controller-manager monitors cluster health status. (default 5s)
      --cluster-startup-grace-period duration                          Specifies the grace period of allowing a cluster to be unresponsive during startup before marking it unhealthy. (default 1m0s)
      --cluster-status-update-frequency duration                       Specifies how often karmada-controller-manager posts cluster status to karmada-apiserver. (default 10s)
      --cluster-success-threshold duration                             The duration of successes for the cluster to be considered healthy after recovery. (default 30s)
      --concurrent-cluster-propagation-policy-syncs int                The number of ClusterPropagationPolicy that are allowed to sync concurrently. (default 1)
      --concurrent-cluster-syncs int                                   The number of Clusters that are allowed to sync concurrently. (default 5)
      --concurrent-clusterresourcebinding-syncs int                    The number of ClusterResourceBindings that are allowed to sync concurrently. (default 5)
      --concurrent-namespace-syncs int                                 The number of Namespaces that are allowed to sync concurrently. (default 1)
      --concurrent-propagation-policy-syncs int                        The number of PropagationPolicy that are allowed to sync concurrently. (default 1)
      --concurrent-resource-template-syncs int                         The number of resource templates that are allowed to sync concurrently. (default 5)
      --concurrent-resourcebinding-syncs int                           The number of ResourceBindings that are allowed to sync concurrently. (default 5)
      --concurrent-work-syncs int                                      The number of Works that are allowed to sync concurrently. (default 5)
      --controllers strings                                            A list of controllers to enable. '*' enables all on-by-default controllers, 'foo' enables the controller named 'foo', '-foo' disables the controller named 'foo'. 
                                                                       All controllers: applicationFailover, binding, bindingStatus, cluster, clusterStatus, endpointSlice, execution, federatedHorizontalPodAutoscaler, federatedResourceQuotaStatus, federatedResourceQuotaSync, gracefulEviction, hpa, namespace, serviceExport, serviceImport, unifiedAuth, workStatus.
                                                                       Disabled-by-default controllers: hpa (default [*])
      --enable-cluster-resource-modeling                               Enable means controller would build resource modeling for each cluster by syncing Nodes and Pods resources.
                                                                       The resource modeling might be used by the scheduler to make scheduling decisions in scenario of dynamic replica assignment based on cluster free resources.
                                                                       Disable if it does not fit your cases for better performance. (default true)
      --enable-pprof                                                   Enable profiling via web interface host:port/debug/pprof/.
      --enable-taint-manager                                           If set to true enables NoExecute Taints and will evict all not-tolerating objects propagating on Clusters tainted with this kind of Taints. (default true)
      --failover-eviction-timeout duration                             Specifies the grace period for deleting scheduling result on failed clusters. (default 5m0s)
      --feature-gates mapStringBool                                    A set of key=value pairs that describe feature gates for alpha/experimental features. Options are:
                                                                       AllAlpha=true|false (ALPHA - default=false)
                                                                       AllBeta=true|false (BETA - default=false)
                                                                       CustomizedClusterResourceModeling=true|false (BETA - default=true)
                                                                       Failover=true|false (BETA - default=true)
                                                                       GracefulEviction=true|false (BETA - default=true)
                                                                       PropagateDeps=true|false (BETA - default=true)
      --graceful-eviction-timeout duration                             Specifies the timeout period waiting for the graceful-eviction-controller performs the final removal since the workload(resource) has been moved to the graceful eviction tasks. (default 10m0s)
  -h, --help                                                           help for karmada-controller-manager
      --horizontal-pod-autoscaler-cpu-initialization-period duration   The period after pod start when CPU samples might be skipped. (default 5m0s)
      --horizontal-pod-autoscaler-downscale-delay duration             The period since last downscale, before another downscale can be performed in horizontal pod autoscaler. (default 5m0s)
      --horizontal-pod-autoscaler-downscale-stabilization duration     The period for which autoscaler will look backwards and not scale down below any recommendation it made during that period. (default 5m0s)
      --horizontal-pod-autoscaler-initial-readiness-delay duration     The period after pod start during which readiness changes will be treated as initial readiness. (default 30s)
      --horizontal-pod-autoscaler-sync-period duration                 The period for syncing the number of pods in horizontal pod autoscaler. (default 15s)
      --horizontal-pod-autoscaler-tolerance float                      The minimum change (from 1.0) in the desired-to-actual metrics ratio for the horizontal pod autoscaler to consider scaling. (default 0.1)
      --horizontal-pod-autoscaler-upscale-delay duration               The period since last upscale, before another upscale can be performed in horizontal pod autoscaler. (default 3m0s)
      --kube-api-burst int                                             Burst to use while talking with karmada-apiserver. Doesn't cover events and node heartbeat apis which rate limiting is controlled by a different set of flags. (default 60)
      --kube-api-qps float32                                           QPS to use while talking with karmada-apiserver. Doesn't cover events and node heartbeat apis which rate limiting is controlled by a different set of flags. (default 40)
      --kubeconfig string                                              Path to karmada control plane kubeconfig file.
      --leader-elect                                                   Start a leader election client and gain leadership before executing the main loop. Enable this when running replicated components for high availability. (default true)
      --leader-elect-lease-duration duration                           The duration that non-leader candidates will wait after observing a leadership renewal until attempting to acquire leadership of a led but unrenewed leader slot. This is effectively the maximum duration that a leader can be stopped before it is replaced by another candidate. This is only applicable if leader election is enabled. (default 15s)
      --leader-elect-renew-deadline duration                           The interval between attempts by the acting master to renew a leadership slot before it stops leading. This must be less than or equal to the lease duration. This is only applicable if leader election is enabled. (default 10s)
      --leader-elect-resource-namespace string                         The namespace of resource object that is used for locking during leader election. (default "karmada-system")
      --leader-elect-retry-period duration                             The duration the clients should wait between attempting acquisition and renewal of a leadership. This is only applicable if leader election is enabled. (default 2s)
      --log_backtrace_at traceLocation                                 when logging hits line file:N, emit a stack trace (default :0)
      --log_dir string                                                 If non-empty, write log files in this directory (no effect when -logtostderr=true)
      --log_file string                                                If non-empty, use this log file (no effect when -logtostderr=true)
      --log_file_max_size uint                                         Defines the maximum size a log file can grow to (no effect when -logtostderr=true). Unit is megabytes. If the value is 0, the maximum file size is unlimited. (default 1800)
      --logtostderr                                                    log to standard error instead of files (default true)
      --metrics-bind-address string                                    The TCP address that the controller should bind to for serving prometheus metrics(e.g. 127.0.0.1:8080, :8080). It can be set to "0" to disable the metrics serving. (default ":8080")
      --one_output                                                     If true, only write logs to their native severity level (vs also writing to each lower severity level; no effect when -logtostderr=true)
      --profiling-bind-address string                                  The TCP address for serving profiling(e.g. 127.0.0.1:6060, :6060). This is only applicable if profiling is enabled. (default ":6060")
      --rate-limiter-base-delay duration                               The base delay for rate limiter. (default 5ms)
      --rate-limiter-bucket-size int                                   The bucket size for rate limier. (default 100)
      --rate-limiter-max-delay duration                                The max delay for rate limiter. (default 16m40s)
      --rate-limiter-qps int                                           The QPS for rate limier. (default 10)
      --resync-period duration                                         Base frequency the informers are resynced.
      --secure-port int                                                The secure port on which to serve HTTPS. (default 10357)
      --skip_headers                                                   If true, avoid header prefixes in the log messages
      --skip_log_headers                                               If true, avoid headers when opening log files (no effect when -logtostderr=true)
      --skipped-propagating-apis string                                Semicolon separated resources that should be skipped from propagating in addition to the default skip list(cluster.karmada.io;policy.karmada.io;work.karmada.io). Supported formats are:
                                                                       <group> for skip resources with a specific API group(e.g. networking.k8s.io),
                                                                       <group>/<version> for skip resources with a specific API version(e.g. networking.k8s.io/v1beta1),
                                                                       <group>/<version>/<kind>,<kind> for skip one or more specific resource(e.g. networking.k8s.io/v1beta1/Ingress,IngressClass) where the kinds are case-insensitive.
      --skipped-propagating-namespaces strings                         Comma-separated namespaces that should be skipped from propagating.
                                                                       Note: 'karmada-system', 'karmada-cluster' and 'karmada-es-.*' are Karmada reserved namespaces that will always be skipped. (default [kube-.*])
      --stderrthreshold severity                                       logs at or above this threshold go to stderr when writing to files and stderr (no effect when -logtostderr=true or -alsologtostderr=false) (default 2)
  -v, --v Level                                                        number for the log level verbosity
      --vmodule moduleSpec                                             comma-separated list of pattern=N settings for file-filtered logging
```

###### Auto generated by [spf13/cobra script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/gencomponentdocs)