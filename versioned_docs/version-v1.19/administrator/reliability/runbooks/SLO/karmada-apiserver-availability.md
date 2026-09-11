---
title: Karmada API Server Availability
sidebar_label: Karmada API Server Availability
description: Karmada API Server Availability
---

# Karmada API Server Availability SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable — **page** alerts indicate urgent issues requiring immediate action, while **ticket** alerts should be addressed during business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The Karmada API Server is returning an elevated rate of server errors (5xx) or throttling responses (429). The API server is the front door for all Karmada control plane operations.

## Impact

- **All control plane operations are affected** - No resources can be created, updated, or deleted
- **Workload propagation is blocked** - Nothing can be scheduled or deployed to member clusters
- **CLI and API access is degraded** - Users cannot interact with the Karmada control plane

This is a **critical** issue that blocks all Karmada control plane operations.

## Possible Causes

- Karmada API Server pod is unhealthy, crash-looping, or OOMKilled
- etcd backend is degraded or unreachable
- High request volume causing throttling (429s)
- Network issues between clients and the API server
- TLS certificate issues

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check API Server pod health:**

```bash
kubectl get pods -n karmada-system -l app=karmada-apiserver
kubectl describe pod -n karmada-system <pod-name>
```

Look for OOMKilled, CrashLoopBackOff, or other abnormal pod states.

**3. Check API Server logs:**

Check the Karmada API Server logs for errors using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-apiserver --tail=100
```

**4. Check the error breakdown by status code to identify the type of failures:**

```promql
sum by (code) (rate(apiserver_request_total{code=~"5..|429"}[5m]))
```

**5. Break down errors by resource and verb to identify the failing operation:**

```promql
sum by (resource, verb) (rate(apiserver_request_total{code=~"5..|429"}[5m]))
```

**6. Check in-flight request saturation:**

```promql
apiserver_current_inflight_requests
```

**7. Check etcd health.** etcd issues are a common cause of API server 5xx errors.

```bash
kubectl get pods -n karmada-system -l component=etcd
kubectl logs -n karmada-system <etcd-pod> --tail=50
```

Check etcd request latency:

```promql
histogram_quantile(0.99, sum by (le) (rate(etcd_request_duration_seconds_bucket[5m])))
```

**8. If 429s are dominant, identify top request sources:**

```promql
topk(10, sum by (user_agent) (rate(apiserver_request_total[5m])))
```

**9. Check for recent changes.** Was there a recent Karmada upgrade, configuration change, new member clusters, or new PropagationPolicies?

### Mitigation

| Symptom | Action |
|---------|--------|
| API server pod crash-looping | Check logs, describe pod for OOM or config errors |
| High memory / OOM kills | Increase memory limits or reduce client QPS |
| High CPU saturation | Scale up API server replicas or increase CPU limits |
| etcd latency or errors | Investigate etcd cluster health; check disk I/O |
| High 429 rate | Identify and throttle abusive clients; tune `--max-requests-inflight` |
| Network issues | Check network policies and connectivity between components |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
