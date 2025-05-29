---
title: Karmada 性能分析
---

## 启用性能分析


若要对运行在 Kubernetes Pod 中的 Karmada 组件进行性能分析，需要在组件的 YAML 配置中将 `--enable-pprof` 参数设置为 `true`。
 默认的分析地址为 `127.0.0.1:6060`，也可以通过 `--profiling-bind-address` 参数进行配置。

以下由 Karmada 源码构建的组件支持该功能：`Karmada-agent`, `Karmada-aggregated-apiserver`, `Karmada-controller-manager`, `Karmada-descheduler`, `Karmada-search`, `Karmada-scheduler`, `Karmada-scheduler-estimator`, `Karmada-webhook`.

```
--enable-pprof                                                              
                通过 Web 接口 host:port/debug/pprof/ 启用性能分析。
--profiling-bind-address string
                用于提供性能分析服务的 TCP 地址（如 127.0.0.1:6060、:6060）。仅在启用分析时有效，默认值为 ":6060"。
```

## 通过本地端口暴露分析接口

你可以通过 `kubectl port-forward` 命令将 Pod 中的分析端口转发到本地，例如：

```shell
$ kubectl -n karmada-system get pod
NAME                                          READY   STATUS    RESTARTS   AGE
karmada-controller-manager-7567b44b67-8kt59   1/1     Running   0          19s
...
```

```shell
$ kubectl -n karmada-system port-forward karmada-controller-manager-7567b44b67-8kt59 6060
Forwarding from 127.0.0.1:6060 -> 6060
Forwarding from [::1]:6060 -> 6060
```

此时，HTTP 分析接口将可通过本地端口访问。


## 生成分析数据

你可以通过 `curl` 命令获取内存分析数据（heap profile）并保存到文件：

```shell
curl http://localhost:6060/debug/pprof/heap > heap.pprof
```

获取 CPU 分析数据并保存（以下示例持续时间为 7200 秒，即两小时）：

```shell
curl "http://localhost:6060/debug/pprof/profile?seconds=7200" > cpu.pprof
```


## 分析数据

使用 Go 的 `pprof` 工具分析生成的数据文件：

```shell

go tool pprof heap.pprof
```


## 深入阅读性能分析相关内容

1. [在 Kubernetes 上分析 Golang 程序性能](https://danlimerick.wordpress.com/2017/01/24/profiling-golang-programs-on-kubernetes/)
2. [Go 官方博客](https://blog.golang.org/pprof)
