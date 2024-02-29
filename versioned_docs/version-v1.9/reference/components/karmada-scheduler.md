---
title: karmada-scheduler
---



### Synopsis

The karmada-scheduler is a control plane process which assigns resources to the clusters it manages.
The scheduler determines which clusters are valid placements for each resource in the scheduling queue according to
constraints and available resources. The scheduler then ranks each valid cluster and binds the resource to
the most suitable cluster.

```
karmada-scheduler [flags]
```

### Options

```
      --add_dir_header                              If true, adds the file directory to the header of the log messages
      --alsologtostderr                             log to standard error as well as files (no effect when -logtostderr=true)
      --bind-address string                         The IP address on which to listen for the --secure-port port. (default "0.0.0.0")
      --disable-scheduler-estimator-in-pull-mode    Disable the scheduler estimator for clusters in pull mode, which takes effect only when enable-scheduler-estimator is true.
      --enable-empty-workload-propagation           Enable workload with replicas 0 to be propagated to member clusters.
      --enable-pprof                                Enable profiling via web interface host:port/debug/pprof/.
      --enable-scheduler-estimator                  Enable calling cluster scheduler estimator for adjusting replicas.
      --feature-gates mapStringBool                 A set of key=value pairs that describe feature gates for alpha/experimental features. Options are:
                                                    AllAlpha=true|false (ALPHA - default=false)
                                                    AllBeta=true|false (BETA - default=false)
                                                    CustomizedClusterResourceModeling=true|false (BETA - default=true)
                                                    Failover=true|false (BETA - default=true)
                                                    GracefulEviction=true|false (BETA - default=true)
                                                    MultiClusterService=true|false (ALPHA - default=false)
                                                    PropagateDeps=true|false (BETA - default=true)
                                                    PropagationPolicyPreemption=true|false (ALPHA - default=false)
                                                    ResourceQuotaEstimate=true|false (ALPHA - default=false)
  -h, --help                                        help for karmada-scheduler
      --kube-api-burst int                          Burst to use while talking with karmada-apiserver. Doesn't cover events and node heartbeat apis which rate limiting is controlled by a different set of flags. (default 60)
      --kube-api-qps float32                        QPS to use while talking with karmada-apiserver. Doesn't cover events and node heartbeat apis which rate limiting is controlled by a different set of flags. (default 40)
      --kubeconfig string                           Path to karmada control plane kubeconfig file.
      --leader-elect                                Enable leader election, which must be true when running multi instances. (default true)
      --leader-elect-lease-duration duration        The duration that non-leader candidates will wait after observing a leadership renewal until attempting to acquire leadership of a led but unrenewed leader slot. This is effectively the maximum duration that a leader can be stopped before it is replaced by another candidate. This is only applicable if leader election is enabled. (default 15s)
      --leader-elect-renew-deadline duration        The interval between attempts by the acting master to renew a leadership slot before it stops leading. This must be less than or equal to the lease duration. This is only applicable if leader election is enabled. (default 10s)
      --leader-elect-resource-name string           The name of resource object that is used for locking during leader election. (default "karmada-scheduler")
      --leader-elect-resource-namespace string      The namespace of resource object that is used for locking during leader election. (default "karmada-system")
      --leader-elect-retry-period duration          The duration the clients should wait between attempting acquisition and renewal of a leadership. This is only applicable if leader election is enabled. (default 2s)
      --log_backtrace_at traceLocation              when logging hits line file:N, emit a stack trace (default :0)
      --log_dir string                              If non-empty, write log files in this directory (no effect when -logtostderr=true)
      --log_file string                             If non-empty, use this log file (no effect when -logtostderr=true)
      --log_file_max_size uint                      Defines the maximum size a log file can grow to (no effect when -logtostderr=true). Unit is megabytes. If the value is 0, the maximum file size is unlimited. (default 1800)
      --logtostderr                                 log to standard error instead of files (default true)
      --master string                               The address of the Kubernetes API server. Overrides any value in KubeConfig. Only required if out-of-cluster.
      --one_output                                  If true, only write logs to their native severity level (vs also writing to each lower severity level; no effect when -logtostderr=true)
      --plugins strings                             A list of plugins to enable. '*' enables all build-in and customized plugins, 'foo' enables the plugin named 'foo', '*,-foo' disables the plugin named 'foo'.
                                                    All build-in plugins: APIEnablement,ClusterAffinity,ClusterEviction,ClusterLocality,SpreadConstraint,TaintToleration. (default [*])
      --profiling-bind-address string               The TCP address for serving profiling(e.g. 127.0.0.1:6060, :6060). This is only applicable if profiling is enabled. (default ":6060")
      --rate-limiter-base-delay duration            The base delay for rate limiter. (default 5ms)
      --rate-limiter-bucket-size int                The bucket size for rate limier. (default 100)
      --rate-limiter-max-delay duration             The max delay for rate limiter. (default 16m40s)
      --rate-limiter-qps int                        The QPS for rate limier. (default 10)
      --scheduler-estimator-port int                The secure port on which to connect the accurate scheduler estimator. (default 10352)
      --scheduler-estimator-service-prefix string   The prefix of scheduler estimator service name (default "karmada-scheduler-estimator")
      --scheduler-estimator-timeout duration        Specifies the timeout period of calling the scheduler estimator service. (default 3s)
      --scheduler-name string                       SchedulerName represents the name of the scheduler. default is 'default-scheduler'. (default "default-scheduler")
      --secure-port int                             The secure port on which to serve HTTPS. (default 10351)
      --skip_headers                                If true, avoid header prefixes in the log messages
      --skip_log_headers                            If true, avoid headers when opening log files (no effect when -logtostderr=true)
      --stderrthreshold severity                    logs at or above this threshold go to stderr when writing to files and stderr (no effect when -logtostderr=true or -alsologtostderr=false) (default 2)
  -v, --v Level                                     number for the log level verbosity
      --vmodule moduleSpec                          comma-separated list of pattern=N settings for file-filtered logging
```

###### Auto generated by [spf13/cobra script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/gencomponentdocs)