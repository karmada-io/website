---
title: Karmada Metrics Reference
---

This document provides a comprehensive reference of all Prometheus metrics exported by Karmada components. For guidance on using these metrics for monitoring and observability, see the [Karmada Observability Guide](../../administrator/monitoring/karmada-observability).

## Karmada Metrics Architecture

Karmada exports Prometheus metrics from the following components:

- karmada-apiserver
- karmada-controller-manager
- karmada-scheduler
- karmada-scheduler-estimator
- karmada-agent
- karmada-webhook
- karmada-descheduler

## Metric Conventions

### Naming

- **Karmada-specific metrics**: Prefixed with `karmada_` (e.g., `karmada_scheduler_schedule_attempts_total`)
- **Subsystem metrics**: Include subsystem name (e.g., `karmada_scheduler_estimator_*`)
- **Standard controller-runtime metrics**: Use standard prefixes (e.g., `workqueue_*`, `controller_runtime_*`)
- **Units**: Time metrics use `_seconds`, byte metrics use `_bytes`
- **Base units**: CPU in cores, memory in bytes, duration in seconds

### Types

- **Counter**: Monotonically increasing value (e.g., total requests, errors). Use `rate()` or `increase()` in queries.
- **Gauge**: Value that can go up or down (e.g., queue depth, resource utilization). Use directly in queries.
- **Histogram**: Observations bucketed by value (e.g., latency). Use `histogram_quantile()` for percentiles.

### Stability Levels

Karmada follows Kubernetes metric stability conventions:

- **STABLE**: No explicit stability annotation in source code. Guaranteed consistent naming and semantics across versions. Breaking changes require minimum 2 release cycles notice. Safe for production use.

- **ALPHA**: Explicitly marked with `StabilityLevel: metrics.ALPHA` in source code. May change or be removed without notice. Use with caution in production.

## Metrics by Category

### Scheduler Metrics

These metrics track scheduling operations and performance.

#### karmada_scheduler_schedule_attempts_total

- **Component**: karmada-scheduler
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `schedule_type`: `ResourceBinding` or `ClusterResourceBinding`
- **Description**: Number of attempts to schedule a ResourceBinding or ClusterResourceBinding. High error rate indicates scheduling failures preventing workload placement.
- **Related Events**:
  - [`ScheduleBindingSucceed`](./event.md#schedulebindingsucceed) - Emitted when `result=success`
  - [`ScheduleBindingFailed`](./event.md#schedulebindingfailed) - Emitted when `result=error`
- **Example queries**:
  ```promql
  # Scheduling success rate
  rate(karmada_scheduler_schedule_attempts_total{result="success"}[5m])
    /
  rate(karmada_scheduler_schedule_attempts_total[5m])

  # Scheduling error rate
  rate(karmada_scheduler_schedule_attempts_total{result="error"}[5m])
    /
  rate(karmada_scheduler_schedule_attempts_total[5m])
  ```

#### karmada_scheduler_e2e_scheduling_duration_seconds

- **Component**: karmada-scheduler
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `schedule_type`: `ResourceBinding` or `ClusterResourceBinding`
- **Description**: End-to-end scheduling latency from when binding enters queue to placement decision. Use to monitor overall scheduling performance.
- **Related Events**:
  - [`ScheduleBindingSucceed`](./event.md#schedulebindingsucceed) - Emitted after successful scheduling
  - [`ScheduleBindingFailed`](./event.md#schedulebindingfailed) - Emitted after failed scheduling
- **Buckets**: Exponential from 0.001s to ~32s
- **Example queries**:
  ```promql
  # P95 scheduling latency
  histogram_quantile(0.95, rate(karmada_scheduler_e2e_scheduling_duration_seconds_bucket[5m]))

  # P99 scheduling latency
  histogram_quantile(0.99, rate(karmada_scheduler_e2e_scheduling_duration_seconds_bucket[5m]))
  ```

#### karmada_scheduler_scheduling_algorithm_duration_seconds

- **Component**: karmada-scheduler
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `schedule_step`: Scheduling step (Filter, Score, Select, AssignReplicas, etc.)
- **Description**: Latency for each step of the scheduling algorithm. Use to identify slow steps in the scheduling pipeline.
- **Buckets**: Exponential from 0.001s to ~32s
- **Example query**:
  ```promql
  # Latency by step (P95)
  histogram_quantile(0.95, rate(karmada_scheduler_scheduling_algorithm_duration_seconds_bucket[5m])) by (schedule_step)
  ```

#### karmada_scheduler_queue_incoming_bindings_total

- **Component**: karmada-scheduler
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `event`: `Add`, `Update`, or `Delete`
- **Description**: Number of bindings added to scheduling queues by event type. Use to understand workload churn and queue activity.
- **Example query**:
  ```promql
  # Queue incoming rate by event
  rate(karmada_scheduler_queue_incoming_bindings_total[5m]) by (event)
  ```

#### karmada_scheduler_framework_extension_point_duration_seconds

- **Component**: karmada-scheduler
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `extension_point`: Extension point name (Filter, Score, etc.)
  - `result`: `success` or `error`
- **Description**: Latency for running all plugins at a specific extension point. Use to identify slow extension points.
- **Buckets**: Exponential from 0.0001s to ~4s
- **Example query**:
  ```promql
  # Extension point latency (P95)
  histogram_quantile(0.95, rate(karmada_scheduler_framework_extension_point_duration_seconds_bucket[5m])) by (extension_point)
  ```

#### karmada_scheduler_plugin_execution_duration_seconds

- **Component**: karmada-scheduler
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `plugin`: Plugin name
  - `extension_point`: Extension point name
  - `result`: `success` or `error`
- **Description**: Duration for executing a specific plugin at an extension point. Use to identify slow plugins.
- **Buckets**: Exponential from 0.00001s to ~0.3s
- **Example query**:
  ```promql
  # Top 10 slowest plugins (P95)
  topk(10, histogram_quantile(0.95, rate(karmada_scheduler_plugin_execution_duration_seconds_bucket[5m])) by (plugin))
  ```

#### scheduler_pending_bindings

- **Component**: karmada-scheduler
- **Type**: Gauge
- **Stability**: ALPHA
- **Labels**:
  - `queue`: `active`, `backoff`, or `unschedulable`
- **Description**: Number of pending bindings in each scheduling queue. Bindings in `unschedulable` queue indicate resources that cannot be placed due to constraints.
- **Example query**:
  ```promql
  # Unschedulable bindings
  scheduler_pending_bindings{queue="unschedulable"}
  ```

### Scheduler Estimator Metrics

These metrics track cluster capacity estimation operations.

#### karmada_scheduler_estimator_estimating_request_total

- **Component**: karmada-scheduler-estimator
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `type`: Estimation type
- **Description**: Number of scheduler estimator requests. High error rate indicates inability to assess cluster capacity, leading to poor placement decisions.
- **Example query**:
  ```promql
  # Estimator error rate
  rate(karmada_scheduler_estimator_estimating_request_total{result="error"}[5m])
    /
  rate(karmada_scheduler_estimator_estimating_request_total[5m])
  ```

#### karmada_scheduler_estimator_estimating_algorithm_duration_seconds

- **Component**: karmada-scheduler-estimator
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `type`: Estimation type
  - `step`: Algorithm step
- **Description**: Latency for each step of the estimation algorithm. Impacts overall scheduling latency.
- **Buckets**: Exponential from 0.001s to ~1s
- **Example query**:
  ```promql
  # P95 estimation latency by step
  histogram_quantile(0.95, rate(karmada_scheduler_estimator_estimating_algorithm_duration_seconds_bucket[5m])) by (step)
  ```

#### karmada_scheduler_estimator_estimating_plugin_extension_point_duration_seconds

- **Component**: karmada-scheduler-estimator
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `estimating_plugin_extension_point`: Extension point name
- **Description**: Latency for running all plugins at a specific estimator extension point.
- **Buckets**: Exponential from 0.0001s to ~4s

#### karmada_scheduler_estimator_estimating_plugin_execution_duration_seconds

- **Component**: karmada-scheduler-estimator
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `estimating_plugin`: Plugin name
  - `estimating_plugin_extension_point`: Extension point name
- **Description**: Duration for executing a specific plugin at an estimator extension point.
- **Buckets**: Exponential from 0.00001s to ~0.3s

### Cluster Health Metrics

These metrics track member cluster state and resource capacity.

#### cluster_ready_state

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Cluster readiness state. Value of 1 indicates ready, 0 indicates not ready. **Critical metric** - value of 0 blocks all scheduling and workload operations to that cluster.
- **Example query**:
  ```promql
  # Not-ready clusters
  cluster_ready_state == 0
  ```

#### cluster_node_number

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Total number of nodes in the cluster. Use with `cluster_ready_node_number` to calculate node health ratio.

#### cluster_ready_node_number

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Number of ready nodes in the cluster. Low ratio vs total nodes indicates node health issues.
- **Example query**:
  ```promql
  # Node readiness ratio per cluster
  cluster_ready_node_number / cluster_node_number

  # Clusters with less than 80% ready nodes
  (cluster_ready_node_number / cluster_node_number) < 0.8
  ```

#### cluster_memory_allocatable_bytes

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Allocatable cluster memory in bytes. Represents total memory capacity available for scheduling.

#### cluster_cpu_allocatable_number

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Allocatable CPU in cores. Represents total CPU capacity available for scheduling.

#### cluster_pod_allocatable_number

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Allocatable pod capacity. Represents maximum number of pods that can be scheduled.

#### cluster_memory_allocated_bytes

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Allocated cluster memory in bytes. Sum of memory requests for all scheduled pods.

#### cluster_cpu_allocated_number

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Allocated CPU in cores. Sum of CPU requests for all scheduled pods.
- **Example query**:
  ```promql
  # CPU utilization by cluster
  (cluster_cpu_allocated_number / cluster_cpu_allocatable_number) * 100

  # Clusters with high CPU utilization (>85%)
  (cluster_cpu_allocated_number / cluster_cpu_allocatable_number) > 0.85
  ```

#### cluster_pod_allocated_number

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Number of allocated pods in the cluster. Count of pods currently scheduled.

#### cluster_sync_status_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Cluster name
- **Description**: Duration to sync cluster status once. High latency means delayed detection of cluster state changes.
- **Example query**:
  ```promql
  # P95 cluster status sync latency
  histogram_quantile(0.95, rate(cluster_sync_status_duration_seconds_bucket[5m])) by (member_cluster)
  ```

### Resource Propagation Metrics

These metrics track the propagation of resources from Karmada control plane to member clusters.

**Propagation Pipeline**: Policy Match → Policy Apply → Binding Sync → Work Sync → Resource Create/Update

#### resource_match_policy_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**: None
- **Description**: Duration to find a matched PropagationPolicy or ClusterPropagationPolicy for a resource template. **First step** in propagation pipeline - delays here impact the entire process.
- **Related Events**:
  - [`ApplyPolicySucceed`](./event.md#applypolicysucceed) - Includes policy matching time
  - [`ApplyPolicyFailed`](./event.md#applypolicyfailed) - May indicate policy matching failures
- **Buckets**: Exponential from 0.001s to ~4s
- **Example query**:
  ```promql
  # P95 policy matching latency
  histogram_quantile(0.95, rate(resource_match_policy_duration_seconds_bucket[5m]))
  ```

#### resource_apply_policy_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Duration to apply a PropagationPolicy or ClusterPropagationPolicy to a resource template.
- **Related Events**:
  - [`ApplyPolicySucceed`](./event.md#applypolicysucceed) - Emitted when `result=success`
  - [`ApplyPolicyFailed`](./event.md#applypolicyfailed) - Emitted when `result=error`
- **Buckets**: Exponential from 0.001s to ~4s

#### karmada_policy_apply_attempts_total

- **Component**: karmada-controller-manager
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Number of attempts to apply a PropagationPolicy or ClusterPropagationPolicy. High error rate indicates policy application failures preventing propagation.
- **Related Events**:
  - [`ApplyPolicySucceed`](./event.md#applypolicysucceed) - Emitted when `result=success`
  - [`ApplyPolicyFailed`](./event.md#applypolicyfailed) - Emitted when `result=error`
- **Example query**:
  ```promql
  # Policy application error rate
  rate(karmada_policy_apply_attempts_total{result="error"}[5m])
    /
  rate(karmada_policy_apply_attempts_total[5m])
  ```

#### policy_preemption_total

- **Component**: karmada-controller-manager
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Number of preemptions where a resource is taken over by a higher-priority propagation policy. High error rate indicates policy conflict issues.
- **Related Events**:
  - [`PreemptPolicySucceed`](./event.md#preemptpolicysucceed) - Emitted when `result=success`
  - [`PreemptPolicyFailed`](./event.md#preemptpolicyfailed) - Emitted when `result=error`

#### karmada_binding_sync_work_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Duration to sync Work objects for a ResourceBinding or ClusterResourceBinding. **Second step** in propagation - converts bindings to executable work.
- **Related Events**:
  - [`ApplyOverridePolicySucceed`](./event.md#applyoverridepolicysucceed) - Override application is part of work sync
  - [`ApplyOverridePolicyFailed`](./event.md#applyoverridepolicyfailed) - May cause work sync failures
  - [`SyncWorkSucceed`](./event.md#syncworksucceed) - Emitted after successful work sync
  - [`SyncWorkFailed`](./event.md#syncworkfailed) - Emitted when `result=error`
- **Buckets**: Exponential from 0.001s to ~4s
- **Example query**:
  ```promql
  # P95 binding-to-work sync latency
  histogram_quantile(0.95, rate(karmada_binding_sync_work_duration_seconds_bucket[5m]))
  ```

#### karmada_work_sync_workload_duration_seconds

- **Component**: karmada-controller-manager, karmada-agent
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Duration to sync the workload to a target member cluster. **Critical metric** - measures end-to-end sync time from Work object to cluster.
- **Related Events**:
  - [`WorkDispatching`](./event.md#workdispatching) - Emitted when work dispatching starts
  - [`SyncSucceed`](./event.md#syncsucceed) - Emitted when `result=success`
  - [`SyncFailed`](./event.md#syncfailed) - Emitted when `result=error`
- **Buckets**: Exponential from 0.001s to ~4s
- **Example query**:
  ```promql
  # P95 work-to-cluster sync latency
  histogram_quantile(0.95, rate(karmada_work_sync_workload_duration_seconds_bucket[5m]))
  ```

#### karmada_create_resource_to_cluster

- **Component**: karmada-controller-manager, karmada-agent
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `apiversion`: Resource API version
  - `kind`: Resource kind
  - `member_cluster`: Target cluster name
  - `recreate`: `true` or `false` (indicates recreating a previously deleted resource)
- **Description**: Number of resource creation operations to member clusters. Errors indicate connectivity or permission issues.
- **Related Events**:
  - [`SyncSucceed`](./event.md#syncsucceed) - Emitted when resource creation succeeds
  - [`SyncFailed`](./event.md#syncfailed) - Emitted when resource creation fails
- **Example query**:
  ```promql
  # Resource creation error rate by cluster
  sum by (member_cluster) (
    rate(karmada_create_resource_to_cluster{result="error"}[5m])
  )
  ```

#### karmada_update_resource_to_cluster

- **Component**: karmada-controller-manager, karmada-agent
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `apiversion`: Resource API version
  - `kind`: Resource kind
  - `member_cluster`: Target cluster name
  - `operationResult`: Type of update performed
- **Description**: Number of resource update operations to member clusters.
- **Related Events**:
  - [`SyncSucceed`](./event.md#syncsucceed) - Emitted when resource update succeeds
  - [`SyncFailed`](./event.md#syncfailed) - Emitted when resource update fails
  - [`ReflectStatusSucceed`](./event.md#reflectstatussucceed) - Status updates may trigger this event
  - [`ReflectStatusFailed`](./event.md#reflectstatusfailed) - Status update failures may trigger this event
- **Example query**:
  ```promql
  # Resource update error rate by kind
  sum by (kind) (
    rate(karmada_update_resource_to_cluster{result="error"}[5m])
  )
  ```

#### karmada_delete_resource_from_cluster

- **Component**: karmada-controller-manager, karmada-agent
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `apiversion`: Resource API version
  - `kind`: Resource kind
  - `member_cluster`: Target cluster name
- **Description**: Number of resource deletion operations from member clusters. Errors indicate issues removing resources during cleanup or migration.
- **Related Events**:
  - [`SyncSucceed`](./event.md#syncsucceed) - Emitted when resource deletion succeeds
  - [`SyncFailed`](./event.md#syncfailed) - Emitted when resource deletion fails
  - [`CleanupWorkFailed`](./event.md#cleanupworkfailed) - May be emitted during work cleanup failures

### Failover and Eviction Metrics

These metrics track cluster failure handling and resource eviction.

#### karmada_eviction_queue_depth

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `name`: Queue name
- **Description**: Current depth of the eviction queue. High or growing values indicate failover processing backlog.
- **Example query**:
  ```promql
  # Eviction queue depth
  karmada_eviction_queue_depth

  # Queue growth rate (positive = backlog)
  deriv(karmada_eviction_queue_depth[5m])
  ```

#### karmada_eviction_kind_total

- **Component**: karmada-controller-manager
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `member_cluster`: Source cluster name
  - `resource_kind`: Resource kind
- **Description**: Number of resources in eviction queue by kind and source cluster. Use to identify which resource types are being evicted.
- **Example query**:
  ```promql
  # Resources by kind across all clusters
  sum by (resource_kind) (karmada_eviction_kind_total)
  ```

#### karmada_eviction_processing_latency_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `name`: Queue name
- **Description**: Latency for processing an eviction task (moving resource from failed cluster to healthy cluster). High latency delays failover.
- **Buckets**: Exponential from 0.001s to ~32s
- **Example query**:
  ```promql
  # P95 eviction processing latency
  histogram_quantile(0.95, rate(karmada_eviction_processing_latency_seconds_bucket[5m]))
  ```

#### karmada_eviction_processing_total

- **Component**: karmada-controller-manager
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `name`: Queue name
  - `result`: `success` or `error`
- **Description**: Total evictions processed. High error rate indicates issues rescheduling workloads during cluster failures.
- **Related Events**:
  - [`EvictWorkloadFromClusterSucceed`](./event.md#evictworkloadfromclustersucceed) - Emitted when `result=success`
  - [`EvictWorkloadFromClusterFailed`](./event.md#evictworkloadfromclusterfailed) - Emitted when `result=error`
- **Example query**:
  ```promql
  # Eviction success rate
  rate(karmada_eviction_processing_total{result="success"}[5m])
    /
  rate(karmada_eviction_processing_total[5m])
  ```

### Autoscaling Metrics

These metrics track FederatedHPA and CronFederatedHPA controllers.

#### karmada_federatedhpa_process_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Duration to process a FederatedHPA object (one reconciliation loop). High latency delays scaling decisions.
- **Related Events**:
  - [`SuccessfulRescale`](./event.md#successfulrescale) - Emitted when scaling operation succeeds
  - [`FailedRescale`](./event.md#failedrescale) - Emitted when scaling operation fails
  - [`FailedGetScale`](./event.md#failedgetscale) - May occur during HPA processing
  - [`FailedComputeMetricsReplicas`](./event.md#failedcomputemetricsreplicas) - Indicates metric computation failures
- **Buckets**: Exponential from 0.01s to ~40s
- **Example query**:
  ```promql
  # P95 FederatedHPA processing latency
  histogram_quantile(0.95, rate(karmada_federatedhpa_process_duration_seconds_bucket[5m]))
  ```

#### karmada_federatedhpa_pull_metrics_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
  - `metricType`: Metric type
- **Description**: Duration for FederatedHPA to pull metrics from member clusters. High latency or errors impact scaling responsiveness.
- **Buckets**: Exponential from 0.01s to ~40s
- **Example query**:
  ```promql
  # P95 metrics pull latency by type
  histogram_quantile(0.95, rate(karmada_federatedhpa_pull_metrics_duration_seconds_bucket[5m])) by (metricType)
  ```

#### karmada_cronfederatedhpa_process_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Duration to process a CronFederatedHPA object.
- **Related Events**:
  - [`UpdateCronFederatedHPAFailed`](./event.md#updatecronfederatedhpafailed) - Emitted when CronFederatedHPA update fails
  - [`StartRuleFailed`](./event.md#startrulefailed) - Emitted when cron rule execution fails
  - [`ScaleFailed`](./event.md#scalefailed) - Emitted when scaling operation fails
- **Buckets**: Exponential from 0.001s to ~4s

#### karmada_cronfederatedhpa_rule_process_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `result`: `success` or `error`
- **Description**: Duration to process a single CronFederatedHPA rule. Use to identify slow or problematic cron rules.
- **Related Events**:
  - [`StartRuleFailed`](./event.md#startrulefailed) - Emitted when `result=error`
  - [`ScaleFailed`](./event.md#scalefailed) - May be emitted during rule processing failures
- **Buckets**: Exponential from 0.001s to ~4s

### HPA Controller Metrics

These metrics are from the horizontal pod autoscaler controller (based on Kubernetes upstream).

#### horizontal_pod_autoscaler_controller_reconciliations_total

- **Component**: karmada-controller-manager
- **Type**: Counter
- **Stability**: ALPHA
- **Labels**:
  - `action`: `scale_up`, `scale_down`, or `none`
  - `error`: `spec`, `internal`, or `none`
- **Description**: Number of HPA reconciliations. `action` indicates scaling decision, `error` indicates failure type. Spec errors are configuration issues, internal errors are runtime failures.
- **Related Events**:
  - [`SuccessfulRescale`](./event.md#successfulrescale) - Emitted when `action` is `scale_up` or `scale_down` and `error=none`
  - [`FailedRescale`](./event.md#failedrescale) - Emitted when scaling fails
  - [`FailedGetScale`](./event.md#failedgetscale) - May cause reconciliation errors
  - [`FailedUpdateStatus`](./event.md#failedupdatestatus) - Status update failures during reconciliation

#### horizontal_pod_autoscaler_controller_reconciliation_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: ALPHA
- **Labels**:
  - `action`: `scale_up`, `scale_down`, or `none`
  - `error`: `spec`, `internal`, or `none`
- **Description**: Time for one HPA reconciliation loop. Critical for understanding HPA responsiveness.
- **Buckets**: Exponential from 0.001s to ~32s

#### horizontal_pod_autoscaler_controller_metric_computation_total

- **Component**: karmada-controller-manager
- **Type**: Counter
- **Stability**: ALPHA
- **Labels**:
  - `action`: Scaling action
  - `error`: Error type
  - `metric_type`: `Resource`, `Pods`, `Object`, `External`, or `ContainerResource`
- **Description**: Number of metric computations. Use to identify problematic metric types.
- **Related Events**:
  - [`FailedComputeMetricsReplicas`](./event.md#failedcomputemetricsreplicas) - Emitted when `error != none`
  - [`FailedGetScale`](./event.md#failedgetscale) - May cause metric computation failures

#### horizontal_pod_autoscaler_controller_metric_computation_duration_seconds

- **Component**: karmada-controller-manager
- **Type**: Histogram
- **Stability**: ALPHA
- **Labels**:
  - `action`: Scaling action
  - `error`: Error type
  - `metric_type`: Metric type
- **Description**: Time to compute one metric. Slow metrics delay scaling.
- **Buckets**: Exponential from 0.001s to ~32s
- **Example query**:
  ```promql
  # P95 metric computation latency by type
  histogram_quantile(0.95, rate(horizontal_pod_autoscaler_controller_metric_computation_duration_seconds_bucket[5m])) by (metric_type)
  ```

### Controller Workqueue Metrics

Standard controller-runtime workqueue metrics available on all Karmada controllers.

#### workqueue_adds_total

- **Component**: All controllers
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `name`: Controller/queue name
- **Description**: Total items added to the workqueue. Rate indicates incoming work load.
- **Example query**:
  ```promql
  # Workqueue add rate
  rate(workqueue_adds_total[5m]) by (name)
  ```

#### workqueue_depth

- **Component**: All controllers
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `name`: Controller/queue name
- **Description**: Current workqueue depth. High values indicate controller cannot keep up. Values &gt;100 warrant investigation.
- **Related Events**: Many failure events (e.g., [`ApplyPolicyFailed`](./event.md#applypolicyfailed), [`SyncWorkFailed`](./event.md#syncworkfailed)) can cause work items to accumulate in queues.
- **Example query**:
  ```promql
  # Controllers with deep queues
  workqueue_depth > 100
  ```

#### workqueue_queue_duration_seconds

- **Component**: All controllers
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `name`: Controller/queue name
- **Description**: How long items stay in queue before processing. High P95/P99 indicates controller saturation.
- **Buckets**: Exponential from 1e-8s to ~1000s
- **Example query**:
  ```promql
  # P95 queue wait time by controller
  histogram_quantile(0.95, rate(workqueue_queue_duration_seconds_bucket[5m])) by (name)
  ```

#### workqueue_work_duration_seconds

- **Component**: All controllers
- **Type**: Histogram
- **Stability**: STABLE
- **Labels**:
  - `name`: Controller/queue name
- **Description**: How long processing one item takes. Identifies slow reconciliation loops.
- **Buckets**: Exponential from 1e-8s to ~1000s
- **Example query**:
  ```promql
  # P95 reconciliation duration by controller
  histogram_quantile(0.95, rate(workqueue_work_duration_seconds_bucket[5m])) by (name)
  ```

#### workqueue_retries_total

- **Component**: All controllers
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `name`: Controller/queue name
- **Description**: Total retries processed by the workqueue. High retry rate indicates transient failures or bugs. Retry rate &gt;10% of adds rate is concerning.
- **Related Events**: Many failure events (e.g., [`ApplyPolicyFailed`](./event.md#applypolicyfailed), [`SyncWorkFailed`](./event.md#syncworkfailed)) trigger controller retries, which increment this metric.
- **Example query**:
  ```promql
  # Retry ratio (should be <10%)
  rate(workqueue_retries_total[5m]) / rate(workqueue_adds_total[5m])
  ```

#### workqueue_unfinished_work_seconds

- **Component**: All controllers
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `name`: Controller/queue name
- **Description**: How long the oldest unfinished work item has been in progress. High values indicate stuck reconciliations.
- **Example query**:
  ```promql
  # Controllers with stuck items (>60 seconds)
  workqueue_unfinished_work_seconds > 60
  ```

#### workqueue_longest_running_processor_seconds

- **Component**: All controllers
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `name`: Controller/queue name
- **Description**: How long the longest running processor has been running. Identifies stuck worker goroutines.

### Webhook Metrics

These metrics track admission webhook operations.

#### controller_runtime_webhook_requests_total

- **Component**: karmada-webhook
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `webhook`: Webhook name
  - `code`: HTTP status code
- **Description**: Total requests processed by each webhook. Non-2xx codes indicate webhook failures that can **block API operations**. Critical to monitor.
- **Example query**:
  ```promql
  # Webhook error rate
  sum(rate(controller_runtime_webhook_requests_total{code!~"2.."}[5m]))
    /
  sum(rate(controller_runtime_webhook_requests_total[5m]))

  # Failing webhooks by name
  sum by (webhook) (
    rate(controller_runtime_webhook_requests_total{code!~"2.."}[5m])
  )
  ```

### Pool Metrics

These metrics track object pool usage for reducing memory allocations.

#### pool_get_operation_total

- **Component**: karmada-controller-manager, karmada-agent
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `name`: Pool name
  - `from`: `pool` (cache hit) or `new` (cache miss)
- **Description**: Total get operations from object pools. `from=pool` indicates cache hit, `from=new` indicates new allocation. High miss rate may indicate undersized pools.

#### pool_put_operation_total

- **Component**: karmada-controller-manager, karmada-agent
- **Type**: Counter
- **Stability**: STABLE
- **Labels**:
  - `name`: Pool name
  - `to`: `pool` (returned to pool) or `drop` (pool full)
- **Description**: Total put operations to object pools. `to=drop` indicates object dropped because pool is full.

### Build Information

This metric provides version and build information for all components.

#### karmada_build_info

- **Component**: All components
- **Type**: Gauge
- **Stability**: STABLE
- **Labels**:
  - `git_version`: Version string
  - `git_commit`: Full commit hash
  - `git_short_commit`: Short commit hash
  - `git_tree_state`: Git tree state
  - `build_date`: Build date
  - `go_version`: Go version
  - `compiler`: Compiler used
  - `platform`: Platform (OS/arch)
- **Description**: Constant gauge (value=1) with build metadata as labels. Essential for tracking component versions and correlating issues with releases.
- **Example queries**:
  ```promql
  # List all component versions
  karmada_build_info

  # Count components by version
  count by (git_version) (karmada_build_info)

  # Check for version mismatches
  count(count by (git_version) (karmada_build_info)) > 1
  ```

## Component Metrics Summary

Quick reference for which component emits which metrics:

### karmada-controller-manager
- All `cluster_*` metrics
- All `resource_*`, `policy_*`, `binding_*`, `work_*` propagation metrics
- All `*_resource_to_cluster` / `*_resource_from_cluster` metrics
- All `eviction_*` metrics
- All `federatedhpa_*` and `cronfederatedhpa_*` metrics
- All `horizontal_pod_autoscaler_*` metrics
- `pool_*` metrics
- `workqueue_*` metrics
- `karmada_build_info`

### karmada-scheduler
- All `karmada_scheduler_*` metrics (except estimator)
- `scheduler_pending_bindings`
- `workqueue_*` metrics
- `karmada_build_info`

### karmada-scheduler-estimator
- All `karmada_scheduler_estimator_*` metrics
- `karmada_build_info`

### karmada-agent
- Subset of `cluster_*` metrics (for local cluster only)
- `work_sync_workload_duration_seconds`
- `*_resource_to_cluster` / `*_resource_from_cluster` metrics
- `pool_*` metrics
- `workqueue_*` metrics
- `karmada_build_info`

### karmada-webhook
- `controller_runtime_webhook_requests_total`
- `karmada_build_info`

### karmada-descheduler
- `workqueue_*` metrics
- `karmada_build_info`

## Querying Best Practices

### Rate Calculations

Use appropriate time windows for `rate()` and `increase()`:

```promql
# Good: 5-minute rate for dashboards
rate(karmada_scheduler_schedule_attempts_total[5m])

# Good: 1-minute rate for alerting (faster response)
rate(karmada_scheduler_schedule_attempts_total[1m])

# Bad: Too short, susceptible to noise
rate(karmada_scheduler_schedule_attempts_total[30s])
```

### Histogram Quantiles

Use appropriate quantiles for different purposes:

```promql
# P50: Median latency (typical case)
histogram_quantile(0.50, rate(karmada_scheduler_e2e_scheduling_duration_seconds_bucket[5m]))

# P95: Good for understanding user experience
histogram_quantile(0.95, rate(karmada_scheduler_e2e_scheduling_duration_seconds_bucket[5m]))

# P99: Captures tail latency (worst case)
histogram_quantile(0.99, rate(karmada_scheduler_e2e_scheduling_duration_seconds_bucket[5m]))
```

### Error Rates

Calculate error rates as ratio of errors to total:

```promql
# Scheduling error rate
rate(karmada_scheduler_schedule_attempts_total{result="error"}[5m])
  /
rate(karmada_scheduler_schedule_attempts_total[5m])

# Workqueue retry rate
rate(workqueue_retries_total[5m])
  /
rate(workqueue_adds_total[5m])
```

### Resource Utilization

Calculate utilization as percentage:

```promql
# CPU utilization by cluster
(cluster_cpu_allocated_number / cluster_cpu_allocatable_number) * 100

# Memory utilization
(cluster_memory_allocated_bytes / cluster_memory_allocatable_bytes) * 100
```

## Label Cardinality

Be mindful of label cardinality in queries:

- `member_cluster`: Bounded by number of clusters (typically &lt;100)
- `kind`, `apiversion`: Bounded by resource types used
- `name` (workqueue): Bounded by number of controllers (~20-30)
- `plugin`, `webhook`: Bounded by installed plugins/webhooks

High-cardinality labels like `namespace` or individual resource names are intentionally excluded.

## Deprecated Labels

The following labels are deprecated and will be removed in v1.18:

| Old Label | New Label | Affected Metrics | Deprecated In |
|-----------|-----------|------------------|---------------|
| `cluster` | `member_cluster` | All cluster metrics | v1.16 |
| `cluster_name` | `member_cluster` | All cluster metrics | v1.16 |

**Migration**: Update all queries, dashboards, and alerts to use `member_cluster`.

## Related Documentation

- [Karmada Observability Guide](../../administrator/monitoring/karmada-observability) - Complete monitoring setup and best practices
- [PromQL Query Reference](../../administrator/monitoring/karmada-observability#promql-query-reference) - Ready-to-use queries
- [Working with Prometheus](../../administrator/monitoring/working-with-prometheus-in-control-plane) - Prometheus setup guide
