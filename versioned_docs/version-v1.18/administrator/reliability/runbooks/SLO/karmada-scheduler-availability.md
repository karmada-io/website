---
title: Karmada Scheduler Availability
sidebar_label: Karmada Scheduler Availability
description: Karmada Scheduler Availability
---

# Karmada Scheduler Availability SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable — **page** alerts indicate urgent issues requiring immediate action, while **ticket** alerts should be addressed during business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The Karmada scheduler is failing to successfully schedule workloads to member clusters (Stage 2: Scheduling). The scheduler decides which clusters should run your workloads based on your propagation policies. This SLO tracks `result="error"` on the `karmada_scheduler_schedule_attempts_total` metric — note that this includes both system-level scheduler failures and unschedulable outcomes (e.g., no clusters matching placement constraints).

## Impact

- **Workloads don't propagate** - Resources remain in the control plane but don't reach member clusters
- **Deployments are stuck** - New applications can't be distributed
- **No rescheduling on failure** - When clusters fail, workloads can't be moved to healthy clusters
- **Scheduling decisions fail** - The scheduler can't determine where to place resources

This is a **critical** issue that blocks workload distribution across your clusters.

## Possible Causes

- Scheduler pod is unhealthy, crash-looping, or OOMKilled
- No matching clusters for the placement rules
- Insufficient cluster capacity
- Scheduler estimator failures or unreachable estimators
- Scheduler plugin execution failures
- Member clusters in NotReady state

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check Kubernetes events for scheduling failures:**

```bash
kubectl get events -n karmada-system --field-selector reason=ScheduleBindingFailed --sort-by='.lastTimestamp'
```

Review the event messages to understand why the scheduling failed and determine the fix.

**3. Check the scheduling error rate and breakdown by type:**

```promql
sum by (result, schedule_type) (rate(karmada_scheduler_schedule_attempts_total[5m]))
```

This metric reports `result="scheduled"` for successes and `result="error"` for failures. The `schedule_type` label helps distinguish first-time scheduling from rescheduling. Note that `result="error"` includes both system-level failures (e.g., estimator unreachable) and constraint mismatches (e.g., no eligible clusters) — check events and logs to distinguish them.

**4. Check the scheduler pod health:**

```bash
kubectl get pods -n karmada-system -l app=karmada-scheduler
kubectl logs -n karmada-system -l app=karmada-scheduler --tail=200 | grep -i "error\|failed\|panic"
```

**5. Check for slow plugins.** Slow plugins can cause scheduling timeouts that surface as errors.

```promql
histogram_quantile(0.99,
  sum by (le, plugin) (rate(karmada_scheduler_plugin_execution_duration_seconds_bucket[5m])))
```

**6. Check estimator connectivity.** Scheduler errors can occur when the scheduler cannot reach estimators.

```promql
sum(rate(karmada_scheduler_estimator_estimating_request_total{result="error"}[5m]))
/
sum(rate(karmada_scheduler_estimator_estimating_request_total[5m]))
```

```bash
kubectl get pods -n karmada-system -l app=karmada-scheduler-estimator
```

**7. Check member cluster connectivity:**

```bash
kubectl get clusters
```

```promql
cluster_ready_state == 0
```

**8. Check scheduler queue health:**

```promql
scheduler_pending_bindings
rate(karmada_scheduler_queue_incoming_bindings_total[5m]) by (event)
```

**9. Check for recent changes.** Were new member clusters added, PropagationPolicies modified, or scheduler plugins changed?

### Mitigation

| Symptom | Action |
|---------|--------|
| Scheduler pod crash-looping | Check logs for panics; describe pod for OOM events |
| Plugin failures in logs | Identify failing plugin; check plugin configuration |
| Estimator unreachable | Check estimator pod health and network connectivity |
| All clusters NotReady | Address cluster connectivity issues first |
| No matching clusters for placement rules | Review PropagationPolicy `clusterAffinity` and `spreadConstraints`; check cluster labels |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
