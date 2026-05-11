---
title: Binding Sync Work Latency
sidebar_label: Binding Sync Work Latency
description: Binding Sync Work Latency
---

# Binding to Work Sync Latency SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable. This SLO uses **ticket-level alerts only** — investigate and address during normal business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The process of converting ResourceBindings into Work resources (Stage 4: Work Creation & Override Application) is taking longer than expected. While operations are succeeding, they are exceeding the configured latency threshold at an elevated rate, which delays the overall resource propagation pipeline.

## Impact

- **Slower deployments** - Resources take longer to move from scheduling decisions to propagation tasks
- **Delayed updates** - Changes to workloads propagate more slowly to member clusters
- **End-to-end pipeline slowdown** - Downstream steps (actual workload deployment) are delayed

Binding sync latency determines how quickly scheduling decisions translate into deployable Work objects.

## Possible Causes

- High volume of resources being propagated simultaneously
- API server slowness affecting Work object creation
- Complex resource templates requiring more processing time
- Complex override policies with many rules
- Large resource manifests taking longer to process
- Controller-manager under resource pressure

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check binding sync duration breakdown:**

```promql
histogram_quantile(0.95,
  sum by (le, result) (rate(binding_sync_work_duration_seconds_bucket[5m])))
```

**3. Check for complex override policies.** Override policy evaluation happens during binding sync; complex policies with many rules are a common cause of latency.

```bash
kubectl get clusteroverridepolicies -o yaml | grep -c "overrideRules"
kubectl get overridepolicies -A -o yaml | grep -c "overrideRules"
```

**4. Check the binding controller workqueue:**

```promql
workqueue_depth{name=~"binding-controller|cluster-resource-binding-controller"}

histogram_quantile(0.95,
  sum by (le) (rate(workqueue_queue_duration_seconds_bucket{name=~"binding-controller|cluster-resource-binding-controller"}[5m])))

histogram_quantile(0.95,
  sum by (le) (rate(workqueue_work_duration_seconds_bucket{name=~"binding-controller|cluster-resource-binding-controller"}[5m])))
```

**5. Check binding volume.** A high number of bindings being processed simultaneously increases controller load.

```bash
kubectl get resourcebindings -A --no-headers | wc -l
kubectl get clusterresourcebindings --no-headers | wc -l
```

**6. Check controller-manager resource usage:**

```bash
kubectl top pod -n karmada-system -l app=karmada-controller-manager
```

**7. Check controller-manager logs:**

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "Sync work\|failed"
```

**8. Check for recent changes.** Were override policies added or modified? Did the number of propagated resources increase significantly?

### Mitigation

| Root Cause | Action |
|------------|--------|
| Complex override policies | Simplify override rules; reduce number of per-resource overrides |
| Large manifests | Review and reduce ConfigMap/Secret sizes; split large resources |
| Controller CPU-constrained | Increase CPU limits |
| API server slow writes | Address API server/etcd performance |
| Backlog in queue | Check for and resolve any errors causing retries |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
