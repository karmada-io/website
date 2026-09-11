---
title: Scheduler Estimator Availability
sidebar_label: Scheduler Estimator Availability
description: Scheduler Estimator Availability
---

# Karmada Scheduler Estimator Availability SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable — **page** alerts indicate urgent issues requiring immediate action, while **ticket** alerts should be addressed during business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The Karmada scheduler estimator is failing to respond to capacity estimation requests. The estimator provides the scheduler with information about how many replicas each member cluster can accommodate, enabling accurate workload placement. One estimator runs per member cluster; failures affect placement decisions for that cluster specifically.

## Impact

- **Inaccurate scheduling** - Without capacity estimates, the scheduler may make suboptimal placement decisions
- **Scheduling failures** - If the scheduler requires accurate estimates and can't get them, scheduling may fail entirely
- **Unbalanced workload distribution** - Workloads may be placed on clusters that cannot accommodate them

This is a **critical** issue that can lead to scheduling failures or suboptimal workload placement.

## Possible Causes

- Scheduler estimator pod is unhealthy or crash-looping
- Network connectivity issues between the scheduler and the estimator
- Member cluster API server is unreachable from the estimator
- Estimator unable to connect to or query the member cluster it serves
- gRPC connection failures between scheduler and estimator
- Authentication errors (expired or rotated member cluster credentials)

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check the error breakdown by request type:**

```promql
sum by (type) (rate(karmada_scheduler_estimator_estimating_request_total{result="error"}[5m]))
```

**3. Check estimator pod health.** Each member cluster has its own estimator pod.

```bash
kubectl get pods -n karmada-system -l app=karmada-scheduler-estimator
kubectl logs -n karmada-system <estimator-pod> --tail=200 | grep -i "error\|failed"
```

**4. Check member cluster API server connectivity.** Estimators query member cluster API servers; connectivity issues cause estimator errors.

```bash
kubectl get clusters
kubectl describe cluster <cluster-name>
```

```promql
cluster_ready_state == 0
```

**5. Check estimator service existence:**

```bash
kubectl get svc -n karmada-system | grep estimator
```

**6. Check the scheduler logs for estimator errors:**

Estimator failures surface in the scheduler as `ScheduleBindingFailed` events. Check the scheduler logs for error messages referencing the estimator:

```bash
kubectl logs -n karmada-system -l app=karmada-scheduler --tail=200 | grep -i "estimator"
```

**7. Check Kubernetes events for scheduling failures related to estimator issues:**

```bash
kubectl get events -n karmada-system --field-selector reason=ScheduleBindingFailed --sort-by='.lastTimestamp'
```

**8. Check for recent changes.** Were member cluster credentials rotated? Were new clusters registered? Were network policies modified?

### Mitigation

| Symptom | Action |
|---------|--------|
| Estimator pod crash-looping | Check logs for panics; describe pod for OOM events |
| Member cluster unreachable | Fix member cluster connectivity first |
| Authentication errors | Renew or rotate member cluster credentials used by the estimator |
| Network policies blocking | Review network policies between Karmada control plane and estimators |
| All estimators failing | Check control plane network; look for a common root cause |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
