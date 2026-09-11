---
title: Cluster Sync Latency
sidebar_label: Cluster Sync Latency
description: Cluster Sync Latency
---

# Cluster Status Sync Latency SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable. This SLO uses **ticket-level alerts only** — investigate and address during normal business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The process of syncing status information from ready member clusters is taking longer than expected. Karmada periodically pulls cluster status (node count, resource capacity, conditions) from each member cluster. This SLO only tracks syncs for clusters that are in a Ready state.

## Impact

- **Stale cluster information** - The scheduler may use outdated capacity data when making placement decisions
- **Suboptimal scheduling** - Workloads may be placed on clusters that appear to have capacity but don't
- **Delayed health detection** - Changes in cluster health take longer to be reflected in the control plane
- **Delayed failover** - Failed clusters continue receiving new workload placements

## Possible Causes

- Member cluster API server slowness
- Network latency between the Karmada control plane and member clusters (especially cross-region)
- Large clusters with many nodes requiring more status data to collect
- Resource pressure on the controller manager
- High number of registered member clusters

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Identify which specific clusters are slow:**

```promql
histogram_quantile(0.95,
  sum by (le, member_cluster) (rate(cluster_sync_status_duration_seconds_bucket[5m])))
  > 1
```

**3. Check member cluster API server latency.** The cluster sync controller fetches status from member cluster API servers; their latency is the primary driver.

```bash
kubectl describe cluster <slow-cluster-name>
```

```bash
kubectl run conn-test --rm -it --image=curlimages/curl --namespace=karmada-system -- \
  curl -w "%{time_total}\n" -s -o /dev/null -k https://<cluster-api-server>:6443/healthz
```

**4. Check network latency to member clusters.** Cross-region member clusters inherently have higher sync latency. If you have recently added cross-region clusters, consider adjusting the threshold.

**5. Check the cluster status controller workqueue:**

```promql
workqueue_depth{name="cluster-status-controller"}

histogram_quantile(0.95,
  sum by (le) (rate(workqueue_queue_duration_seconds_bucket{name="cluster-status-controller"}[5m])))
```

**6. Check controller-manager resource usage:**

```bash
kubectl top pod -n karmada-system -l app=karmada-controller-manager
```

**7. Check total cluster count.** The more member clusters registered, the more work the cluster controller must do.

```bash
kubectl get clusters --no-headers | wc -l
```

**8. Check controller-manager logs:**

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "cluster\|failed\|sync"
```

**9. Check for recent changes.** Were new member clusters added (especially cross-region)? Were there network path changes?

### Mitigation

| Root Cause | Action |
|------------|--------|
| Member cluster API server slow | Address member cluster health |
| High network latency (cross-region) | Adjust the latency threshold to match actual latency; consider cluster-local agents |
| Controller CPU-constrained | Increase CPU limits for controller-manager |
| Many clusters causing contention | Consider increasing controller-manager worker thread count |
| Network partition to specific clusters | Restore network connectivity; investigate network path |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
