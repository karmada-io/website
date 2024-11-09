---
title: karmadactl patch
---

Update fields of a resource

### Synopsis

Update fields of a resource using strategic merge patch, a JSON merge patch, or a JSON patch.

 JSON and YAML formats are accepted.

 Note: Strategic merge patch is not supported for custom resources.

```
karmadactl patch (-f FILENAME | TYPE NAME) [-p PATCH|--patch-file FILE]
```

### Examples

```
  # Partially update a deployment using a strategic merge patch, specifying the patch as JSON
  [1]karmadactl patch deployment nginx-deployment -p '{"spec":{"replicas":2}}'
  
  # Partially update a deployment using a strategic merge patch, specifying the patch as YAML
  [1]%!s(MISSING) patch deployment nginx-deployment -p $'spec:\n replicas: 2'
  
  # Partially update a deployment identified by the type and name specified in "deployment.json" using strategic merge patch
  [1]%!s(MISSING) patch -f deployment.json -p '{"spec":{"replicas":2}}'
  
  # Update a propagationpolicy's conflictResolution using a JSON patch with positional arrays
  [1]%!s(MISSING) patch pp nginx-propagation --type='json' -p='[{"op": "replace", "path": "/spec/conflictResolution", "value":"Overwrite"}]'
  
  # Update a deployment's replicas through the 'scale' subresource using a merge patch
  [1]%!s(MISSING) patch deployment nginx-deployment --subresource='scale' --type='merge' -p '{"spec":{"replicas":2}}'
```

### Options

```
      --allow-missing-template-keys    If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. (default true)
      --dry-run string[="unchanged"]   Must be "none", "server", or "client". If client strategy, only print the object that would be sent, without sending it. If server strategy, submit server-side request without persisting the resource. (default "none")
      --field-manager string           Name of the manager used to track field ownership. (default "kubectl-patch")
  -f, --filename strings               Filename, directory, or URL to files identifying the resource to update
  -h, --help                           help for patch
  -k, --kustomize string               Process the kustomization directory. This flag can't be used together with -f or -R.
      --local                          If true, patch will operate on the content of the file, not the server-side resource.
  -o, --output string                  Output format. One of: (json, yaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file).
  -p, --patch string                   The patch to be applied to the resource JSON file.
      --patch-file string              A file containing a patch to be applied to the resource.
  -R, --recursive                      Process the directory used in -f, --filename recursively. Useful when you want to manage related manifests organized within the same directory.
      --show-managed-fields            If true, keep the managedFields when printing objects in JSON or YAML format.
      --subresource string             If specified, patch will operate on the subresource of the requested object. Must be one of [status scale]. This flag is beta and may change in the future.
      --template string                Template string or path to template file to use when -o=go-template, -o=go-template-file. The template format is golang templates [http://golang.org/pkg/text/template/#pkg-overview].
      --type string                    The type of patch being provided; one of [json merge strategic] (default "strategic")
```

### Options inherited from parent commands

```
      --add-dir-header                   If true, adds the file directory to the header of the log messages
      --alsologtostderr                  log to standard error as well as files (no effect when -logtostderr=true)
      --kubeconfig string                Paths to a kubeconfig. Only required if out-of-cluster.
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