---
title: Policy Apply Availability
sidebar_label: Policy Apply Availability
description: Policy Apply Availability
---

# Policy Apply Availability SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable — **page** alerts indicate urgent issues requiring immediate action, while **ticket** alerts should be addressed during business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

Karmada is failing to apply propagation policies to your resources. This is the first step in the resource distribution process (Stage 1: Policy Matching) where propagation policies get matched with target resources.

## Impact

- **Resources don't propagate** - Deployments and other resources won't be distributed to clusters
- **Policies don't match resources** - Your propagation policies aren't being applied to workloads
- **No ResourceBindings created** - The process stops before scheduling can begin
- **Workloads remain in control plane only** - Nothing reaches member clusters

This is a **critical** issue that prevents workload distribution from starting. All downstream stages (scheduling, work creation, workload sync) are blocked.

## Possible Causes

- Missing or mismatched propagation policies
- Invalid resource specifications
- Misconfigured `resourceSelectors` causing policy failures

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check Kubernetes events for policy apply failures:**

```bash
kubectl get events -n karmada-system --field-selector reason=ApplyPolicyFailed --sort-by='.lastTimestamp'
```

Review the event messages to understand why the policy apply failed and determine the fix.

**3. Check the controller-manager logs.** The policy application controller runs in the karmada-controller-manager.

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "policy\|error\|failed"
```

**4. Check recent events and existing policies:**

```bash
kubectl get events -n karmada-system --sort-by='.lastTimestamp' | tail -30
kubectl get propagationpolicies -A
kubectl get clusterpropagationpolicies
```

**5. Check the policy apply error rate:**

```promql
sum by (result) (rate(policy_apply_attempts_total[5m]))
```

**6. Check for conflicting policies:**

```promql
sum(rate(policy_preemption_total[5m])) by (result)
```

**7. Check controller workqueue health:**

```promql
workqueue_depth{name=~"propagationPolicy reconciler|clusterPropagationPolicy reconciler"}
rate(workqueue_retries_total{name=~"propagationPolicy reconciler|clusterPropagationPolicy reconciler"}[5m])
```

**8. Check for resource template selector mismatches.** Misconfigured `resourceSelectors` can cause policy failures.

```bash
kubectl get propagationpolicies -A -o yaml | grep -A 5 "resourceSelectors"
```

**9. Check for recent changes.** Were any policies recently created or modified? Were new resource types introduced?

### Mitigation

| Symptom | Action |
|---------|--------|
| Invalid policy configurations | Review and fix `resourceSelectors`, `placement`, `overrideRules` |
| Policy conflicts (preemption spikes) | Review overlapping policies; use explicit `priority` to resolve conflicts |
| Workqueue stuck / high depth | Restart the controller-manager pod after fixing the root cause |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
