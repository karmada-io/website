---
title: Karmada Metrics 参考
---

## Metrics

本章节详细介绍了 Karmada 不同组件导出的 Metrics 指标。

您可以使用 HTTP 抓取查询这些组件的指标端点，并以 Prometheus 格式获取当前指标数据。

| 名称                                             | 类型        | 帮助                                                                                          | 标签                                    | 源组件                                          |
|------------------------------------------------|-----------|---------------------------------------------------------------------------------------------|---------------------------------------|----------------------------------------------|
| schedule_attempts_total                        | Counter   | 尝试调度 resourceBinding 的次数                                                                    | result<br/>schedule_type              | karmada-scheduler                            |
| e2e_scheduling_duration_seconds                | Histogram | E2E 调度延迟 (单位秒)                                                                              | result<br/>schedule_type              | karmada-scheduler                            |
| scheduling_algorithm_duration_seconds          | Histogram | 调度算法延迟 (单位秒，不包括 scale 调度器)                                                                  | schedule_step                         | karmada-scheduler                            |
| queue_incoming_bindings_total                  | Counter   | 按事件类型添加到调度队列的 bindings 数量                                                                   | event                                 | karmada-scheduler                            |
| framework_extension_point_duration_seconds     | Histogram | 运行特定扩展点的所有插件的延迟                                                                             | extension_point<br/>result            | karmada-scheduler                            |
| plugin_execution_duration_seconds              | Histogram | 在特定扩展点运行插件的持续时间                                                                             | plugin<br/>extension_point<br/>result | karmada-scheduler                            |
| estimating_request_total                       | Counter   | 调度器估算器的请求数                                                                                  | result<br/>type                       | karmada_scheduler_estimator                  |
| estimating_algorithm_duration_seconds          | Histogram | 估算每个步骤的算法的延迟(单位秒)                                                                           | result<br/>type<br/>step              | karmada_scheduler_estimator                  |
| cluster_ready_state                            | Gauge     | 集群的状态 (1 代表就绪, 0 代表其他)                                                                      | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_node_number                            | Gauge     | 集群中节点的数量                                                                                    | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_ready_node_number                      | Gauge     | 集群中就绪节点的数量                                                                                  | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_memory_allocatable_bytes               | Gauge     | 集群中可分配的内存资源 (单位字节)                                                                          | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_cpu_allocatable_number                 | Gauge     | 集群中可分配的 CPU 数量                                                                              | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_pod_allocatable_number                 | Gauge     | 集群中可分配的 Pod 数量                                                                              | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_memory_allocated_bytes                 | Gauge     | 集群中已分配的内存资源 (单位字节)                                                                          | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_cpu_allocated_number                   | Gauge     | 集群中已分配的 CPU 数量                                                                              | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_pod_allocated_number                   | Gauge     | 集群中已分配的 Pod 数量                                                                              | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| cluster_sync_status_duration_seconds           | Histogram | 同步一次群集状态的持续时间 (单位秒)                                                                         | cluster_name                          | karmada-controller-manager<br/>karmada-agent |
| resource_match_policy_duration_seconds         | Histogram | 为资源模板找到匹配的调度策略的持续时间 (单位秒)                                                                   | /                                     | karmada-controller-manager                   |
| resource_apply_policy_duration_seconds         | Histogram | 为资源模板应用调度策略的持续时间 (单位秒)，"error" 代表资源模板应用该策略失败，否则为 "success"                                  | result                                | karmada-controller-manager                   |
| policy_apply_attempts_total                    | Counter   | 为资源模板应用调度策略的尝试次数次数，"error" 代表资源模板应用该策略失败，否则为 "success"                                      | result                                | karmada-controller-manager                   |
| binding_sync_work_duration_seconds             | Histogram | 为 binding 对象同步 work 的持续时间 (单位秒)，"error" 代表为 binding 同步 work 失败，否则为 "success"                | result                                | karmada-controller-manager                   |
| work_sync_workload_duration_seconds            | Histogram | 将 workload 对象同步到目标群集的持续时间 (单位秒)，"error" 代表同步 workload 失败，否则为 "success"                      | result                                | karmada-controller-manager<br/>karmada-agent |
| policy_preemption_total                        | Counter   | 资源模板的抢占次数，"error" 代表资源模版抢占失败，否则为 "success"                                                  | result                                | karmada-controller-manager                   |
| cronfederatedhpa_process_duration_seconds      | Histogram | 处理 CronFederatedHPA 的持续时间 (单位秒)，"error" 代表处理 CronFederatedHPA 失败，否则为 "success"              | result                                | karmada-controller-manager                   |
| cronfederatedhpa_rule_process_duration_seconds | Histogram | 处理 CronFederatedHPA 规则的持续时间 (单位秒)，"error" 代表处理 CronFederatedHPA 规则失败，否则为 "success"          | result                                | karmada-controller-manager                   |
| federatedhpa_process_duration_seconds          | Histogram | 处理 FederatedHPA 的持续时间 (单位秒)，"error" 代表处理 FederatedHPA 失败，否则为 "success"                      | result                                | karmada-controller-manager                   |
| federatedhpa_pull_metrics_duration_seconds     | Histogram | FederatedHPA 拉取 metrics 指标所需的时间 (单位秒)，"error" 代表 FederatedHPA 拉取 metrics 指标失败，否则为 "success" | result<br/>metricType                 | karmada-controller-manager                   |
| pool_get_operation_total                       | Counter   | 从池中拉数据的总次数                                                                                  | name<br/>from                         | karmada-controller-manager<br/>karmada-agent |
| pool_put_operation_total                       | Counter   | 向池中推数据的总次数                                                                                  | name<br/>to                           | karmada-controller-manager<br/>karmada-agent |
