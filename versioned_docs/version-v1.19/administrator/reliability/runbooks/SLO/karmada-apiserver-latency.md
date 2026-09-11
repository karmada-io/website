---
title: Karmada API Server Latency
sidebar_label: Karmada API Server Latency
description: Karmada API Server Latency
---

# Karmada API Server Latency SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable. This SLO uses **ticket-level alerts only** — investigate and address during normal business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

Karmada API Server requests are taking longer than the configured latency threshold at an elevated rate. This indicates performance degradation in the control plane.

## Impact

- **Slow control plane operations** - Resource creation, updates, and deletions take longer than normal
- **Degraded user experience** - CLI commands and API calls feel sluggish
- **Downstream delays** - Scheduling and propagation pipelines are slowed because they depend on API server responsiveness

## Possible Causes

- etcd latency or storage performance degradation
- API server under high load (large LIST requests, excessive watch connections)
- Resource contention (CPU or memory pressure on the API server pod)
- Network latency between API server and etcd
- Webhook admission controllers adding latency to requests

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check API Server resource usage:**

```bash
kubectl top pod -n karmada-system -l app=karmada-apiserver
```

Look for CPU throttling or high memory usage.

**3. Identify slow operation types by verb and resource:**

```promql
histogram_quantile(0.99,
  sum by (le, verb) (rate(apiserver_request_duration_seconds_bucket[5m])))

histogram_quantile(0.99,
  sum by (le, resource) (rate(apiserver_request_duration_seconds_bucket[5m])))
```

LIST/WATCH being slow often indicates large object counts or etcd performance issues. POST/PUT/PATCH being slow may indicate admission webhook latency or etcd write pressure.

**4. Check etcd performance.** High etcd latency is a common root cause.

```promql
histogram_quantile(0.99,
  sum by (le, operation) (rate(etcd_request_duration_seconds_bucket[5m])))
```

```bash
kubectl get pods -n karmada-system -l component=etcd
kubectl logs -n karmada-system <etcd-pod> --tail=50
```

**5. Check admission webhook latency:**

```promql
histogram_quantile(0.99,
  sum by (le, name) (rate(apiserver_admission_webhook_admission_duration_seconds_bucket[5m])))
```

**6. Check in-flight request saturation:**

```promql
apiserver_current_inflight_requests
```

**7. Check API Server logs:**

Check the Karmada API Server logs for errors using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-apiserver --tail=100
```

**8. Check for recent changes.** Was there a recent Karmada upgrade, new admission webhooks, increased resource count, or infrastructure changes?

### Mitigation

| Root Cause | Action |
|------------|--------|
| Slow LIST operations | Add pagination (`--limit`) to controller LIST calls; review large object sizes |
| Slow admission webhooks | Check webhook endpoints; add timeout settings to webhook configurations |
| etcd write latency | Check etcd disk I/O; consider faster storage (NVMe SSD) for etcd |
| CPU saturation on API server | Scale up replicas or increase CPU limits |
| High in-flight requests | Tune `--max-requests-inflight` and `--max-mutating-requests-inflight` |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
