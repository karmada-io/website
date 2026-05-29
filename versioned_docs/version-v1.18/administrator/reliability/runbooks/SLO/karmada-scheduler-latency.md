---
title: Karmada Scheduler Latency
sidebar_label: Karmada Scheduler Latency
description: Karmada Scheduler Latency
---

# Karmada Scheduler Latency SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable. This SLO uses **ticket-level alerts only** — investigate and address during normal business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

End-to-end scheduling operations (Stage 2: Scheduling) are exceeding the configured latency threshold at an elevated rate.

## Impact

- **Delayed workload placement** - Resources take longer to be assigned to member clusters
- **Slower deployments** - End-to-end deployment time increases
- **Pipeline bottleneck** - Downstream propagation steps are delayed waiting on scheduling decisions
- **Slower failure recovery** - Rescheduling speed is reduced when clusters fail

## Possible Causes

- Scheduler pod under resource pressure (CPU or memory)
- Large number of clusters or resources increasing scheduling complexity
- Scheduler estimator latency contributing to overall scheduling time
- API server latency slowing the scheduler's reads and writes
- Scheduler queue backlog causing queuing delays

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Identify the slow scheduling stage:**

```promql
histogram_quantile(0.95,
  sum by (le, schedule_step) (rate(karmada_scheduler_scheduling_algorithm_duration_seconds_bucket[5m])))

histogram_quantile(0.95,
  sum by (le, extension_point) (rate(karmada_scheduler_framework_extension_point_duration_seconds_bucket[5m])))
```

**3. Identify slow plugins:**

```promql
topk(10,
  histogram_quantile(0.95,
    sum by (le, plugin) (rate(karmada_scheduler_plugin_execution_duration_seconds_bucket[5m]))))
```

**4. Check estimator latency.** Estimator calls are often the longest part of scheduling.

```promql
histogram_quantile(0.95,
  sum by (le) (rate(karmada_scheduler_estimator_estimating_algorithm_duration_seconds_bucket[5m])))

histogram_quantile(0.95,
  sum by (le, step) (rate(karmada_scheduler_estimator_estimating_algorithm_duration_seconds_bucket[5m])))
```

**5. Check the number of clusters being evaluated.** More clusters means more work per scheduling operation.

```bash
kubectl get clusters --no-headers | wc -l
```

**6. Check scheduler resource usage:**

```bash
kubectl top pod -n karmada-system -l app=karmada-scheduler
```

**7. Check scheduler logs:**

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-scheduler --tail=200 | grep -i "error"
```

**8. Check for recent changes.** Were new clusters registered, new PropagationPolicies added, or scheduler configuration modified?

### Mitigation

| Root Cause | Action |
|------------|--------|
| Slow estimators | Check estimator pod health; see [Scheduler Estimator Latency](./karmada-scheduler-estimator-latency) |
| Slow plugins | Review plugin configuration; disable non-essential plugins if possible |
| Many clusters to evaluate | Use `clusterAffinity` in PropagationPolicies to pre-filter clusters |
| Scheduler CPU-constrained | Increase CPU limits |
| High scheduling throughput | Add scheduler replicas (leader election is supported and enabled by default) |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
