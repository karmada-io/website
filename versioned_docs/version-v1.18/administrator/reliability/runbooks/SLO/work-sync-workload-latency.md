---
title: Work Sync Workload Latency
sidebar_label: Work Sync Workload Latency
description: Work Sync Workload Latency
---

# Work to Workload Sync Latency SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable. This SLO uses **ticket-level alerts only** — investigate and address during normal business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The final step of resource propagation (Stage 5: Work Execution) -- deploying workloads to member clusters -- is taking longer than expected. While workloads are being successfully deployed, the operations are exceeding the configured latency threshold at an elevated rate.

## Impact

- **Slower deployments** - Applications take longer to start running in member clusters
- **Delayed updates** - Changes to existing workloads propagate more slowly
- **Increased end-to-end deployment time** - The overall time from resource creation to running workload increases
- **Reduced sync throughput** - High latency can cause a backlog of pending Work objects

Every millisecond of work sync latency adds directly to how long users wait between submitting a resource and seeing it running in member clusters.

## Possible Causes

- Member cluster API server slowness
- Large or complex resource manifests
- High volume of resources being synced simultaneously
- Network latency between the Karmada control plane and member clusters (especially cross-region)
- Slow admission webhooks in member clusters
- Execution controller under resource pressure

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check if latency is isolated to specific clusters.** Cross-region clusters will naturally have higher latency.

```bash
kubectl run latency-test --rm -it --image=curlimages/curl --namespace=karmada-system -- \
  curl -w "%{time_total}" -s -o /dev/null -k https://<member-cluster-api-server>:6443/healthz
```

**3. Check member cluster API server load:**

```bash
kubectl --context=<member-cluster-context> top pods -n kube-system | grep apiserver
```

**4. Check for large resource manifests.** Large Work objects take longer to transmit and apply.

```bash
kubectl get works -A -o json | jq '.items | map({name: .metadata.name, namespace: .metadata.namespace, size: (.spec | tostring | length)}) | sort_by(.size) | reverse | .[0:10]'
```

**5. Check member cluster admission webhooks.** Admission webhooks can significantly increase request latency.

```bash
kubectl --context=<member-cluster-context> get validatingwebhookconfigurations
kubectl --context=<member-cluster-context> get mutatingwebhookconfigurations
```

**6. Check work sync duration breakdown:**

```promql
histogram_quantile(0.95,
  sum by (le, result) (rate(work_sync_workload_duration_seconds_bucket[5m])))
```

**7. Check execution controller workqueue:**

```promql
workqueue_depth{name="execution-controller"}

histogram_quantile(0.95,
  sum by (le) (rate(workqueue_queue_duration_seconds_bucket{name="execution-controller"}[5m])))
```

**8. Check controller-manager logs:**

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "sync work\|failed"
```

**9. Check for recent changes.** Were new cross-region clusters added? Were admission webhooks installed in member clusters? Did resource sizes increase?

### Mitigation

| Root Cause | Action |
|------------|--------|
| High network latency to cross-region clusters | Adjust the latency threshold; co-locate controllers if possible |
| Member cluster API server overloaded | Reduce request rate; scale member cluster API server |
| Large Work objects | Reduce resource size; split large ConfigMaps/Secrets |
| Slow admission webhooks in member cluster | Optimize or temporarily disable non-critical webhooks |
| Execution controller CPU-constrained | Increase CPU limits for controller-manager |
| Backlog of Work objects | Address root cause; consider increasing controller workers |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
