---
title: Scheduler Estimator Latency
sidebar_label: Scheduler Estimator Latency
description: Scheduler Estimator Latency
---

# Karmada Scheduler Estimator Latency SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable. This SLO uses **ticket-level alerts only** — investigate and address during normal business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The Karmada scheduler estimator is taking longer than the configured latency threshold to complete capacity estimation operations. The estimator calculates how many replicas of a workload each member cluster can support. Estimator latency is a major contributor to overall scheduling latency.

## Impact

- **Slower scheduling decisions** - Estimator latency directly adds to end-to-end scheduling time
- **Delayed workload placement** - Resources take longer to be assigned to clusters
- **Pipeline bottleneck** - The entire propagation pipeline is slowed
- **Reduced scheduling throughput** - The scheduler calls estimators synchronously as part of each scheduling decision

## Possible Causes

- Estimator pod under resource pressure (CPU or memory)
- Slow responses from the member cluster API server the estimator queries
- Large number of pods or nodes in the member cluster increasing estimation complexity
- Network latency between the estimator and the member cluster (especially cross-region)

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Identify the slow estimation step:**

```promql
histogram_quantile(0.95,
  sum by (le, step) (rate(karmada_scheduler_estimator_estimating_algorithm_duration_seconds_bucket[5m])))
```

**3. Check member cluster API server latency.** Estimators query member cluster API servers; their latency is the most common root cause.

```bash
kubectl describe cluster <cluster-name>
```

If you have access to the member cluster:

```bash
kubectl --context=<member-cluster-context> get nodes --request-timeout=5s
```

**4. Check estimator pod resource usage:**

```bash
kubectl top pod -n karmada-system -l app=karmada-scheduler-estimator
```

**5. Check network latency between control plane and member clusters.** Cross-region clusters will inherently have higher estimator latency.

```bash
kubectl run ping-test --rm -it --image=busybox --namespace=karmada-system -- ping -c 10 <member-cluster-api-server-ip>
```

**6. Check for complex capacity calculations.** Clusters with very high pod counts may take longer to estimate.

```bash
kubectl --context=<member-cluster-context> get pods -A --no-headers | wc -l
```

**7. Check estimator logs:**

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system <estimator-pod> --tail=200 | grep -i "error\|failed"
```

**8. Check for recent changes.** Were new member clusters added? Did cluster sizes grow significantly? Were network paths changed?

### Mitigation

| Root Cause | Action |
|------------|--------|
| Member cluster API server slow | Address member cluster API server performance |
| High network latency (cross-region) | Adjust the latency threshold to match expected network latency |
| Estimator CPU-constrained | Increase CPU limits for the estimator pod |
| Very large member cluster (many pods) | Increase estimator `--parallelism` to speed up computation; increase `--kube-api-qps` and `--kube-api-burst` if API throttling is occurring |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
