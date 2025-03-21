---
title: karmadactl top pod
---

Display resource (CPU/memory) usage of pods of member clusters

### Synopsis

Display resource (CPU/memory) usage of pods.

 The 'top pod' command allows you to see the resource consumption of pods of member clusters.

 Due to the metrics pipeline delay, they may be unavailable for a few minutes since pod creation.

```
karmadactl top pod [NAME | -l label]
```

### Examples

```
  # Show metrics for all pods in the default namespace
  karmadactl top pod
  
  # Show metrics for all pods in the default namespace in member1 cluster
  karmadactl top pod --clusters=member1
  
  # Show metrics for all pods in the default namespace in member1 and member2 cluster
  karmadactl top pod --clusters=member1,member2
  
  # Show metrics for all pods in the given namespace
  karmadactl top pod --namespace=NAMESPACE
  
  # Show metrics for a given pod and its containers
  karmadactl top pod POD_NAME --containers
  
  # Show metrics for the pods defined by label name=myLabel
  karmadactl top pod -l name=myLabel
```

### Options

```
  -A, --all-namespaces           If present, list the requested object(s) across all namespaces. Namespace in current context is ignored even if specified with --namespace.
  -C, --clusters strings         -C=member1,member2
      --containers               If present, print usage of containers within a pod.
      --field-selector string    Selector (field query) to filter on, supports '=', '==', and '!='.(e.g. --field-selector key1=value1,key2=value2). The server only supports a limited number of field queries per type.
  -h, --help                     help for pod
      --karmada-context string   The name of the kubeconfig context to use
      --kubeconfig string        Path to the kubeconfig file to use for CLI requests.
  -n, --namespace string         If present, the namespace scope for this CLI request.
      --no-headers               If present, print output without headers.
  -l, --selector string          Selector (label query) to filter on, supports '=', '==', and '!='.(e.g. -l key1=value1,key2=value2). Matching objects must satisfy all of the specified label constraints.
      --sort-by string           If non-empty, sort pods list using specified field. The field can be either 'cpu' or 'memory'.
      --sum                      Print the sum of the resource usage
      --use-protocol-buffers     Enables using protocol-buffers to access Metrics API. (default true)
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

* [karmadactl top](karmadactl_top.md)	 - Display resource (CPU/memory) usage of member clusters

#### Go Back to [Karmadactl Commands](karmadactl_index.md) Homepage.


###### Auto generated by [spf13/cobra script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/genkarmadactldocs).