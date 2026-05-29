---
title: Policy Apply Latency
sidebar_label: Policy Apply Latency
description: Policy Apply Latency
---

# Policy Apply Latency SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable. This SLO uses **ticket-level alerts only** — investigate and address during normal business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

The process of applying propagation policies to resources (Stage 1: Policy Matching) is taking longer than expected. While policies are being applied successfully, operations are exceeding the configured latency threshold at an elevated rate.

## Impact

- **Slower resource propagation start** - The initial policy matching step takes longer, delaying the entire pipeline
- **Delayed new deployments** - New resources take longer to begin propagating
- **Slower policy updates** - Changes to propagation policies take longer to apply to matching resources

Policy matching is the first step in the propagation pipeline. Delays here cascade downstream: resources take longer to enter the scheduling queue, and end-to-end deployment time increases even if all downstream stages are healthy.

## Possible Causes

- Large number of policies or resources requiring complex matching
- API server slowness affecting ResourceBinding creation
- High volume of resources being created simultaneously
- Complex `resourceSelectors` increasing matching time
- Controller-manager under resource pressure (CPU or memory)

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check the number and complexity of policies.** More policies and more complex `resourceSelectors` increase matching time.

```bash
kubectl get propagationpolicies -A --no-headers | wc -l
kubectl get clusterpropagationpolicies --no-headers | wc -l
```

**3. Check for overly broad or complex resource selectors:**

```bash
kubectl get propagationpolicies -A -o json | jq '.items[].spec.resourceSelectors'
```

**4. Check the policy apply duration breakdown:**

```promql
histogram_quantile(0.95,
  sum by (le) (rate(resource_match_policy_duration_seconds_bucket[5m])))

histogram_quantile(0.95,
  sum by (le) (rate(resource_apply_policy_duration_seconds_bucket[5m])))
```

**5. Check controller-manager workqueue:**

```promql
workqueue_depth{name=~"propagationPolicy reconciler|clusterPropagationPolicy reconciler"}

histogram_quantile(0.95,
  sum by (le) (rate(workqueue_queue_duration_seconds_bucket{name=~"propagationPolicy reconciler|clusterPropagationPolicy reconciler"}[5m])))
```

**6. Check controller-manager resource usage:**

```bash
kubectl top pod -n karmada-system -l app=karmada-controller-manager
```

**7. Check controller-manager logs:**

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "policy"
```

**8. Check for recent changes.** Were new policies added? Did the number of matching resources increase significantly?

### Mitigation

| Root Cause | Action |
|------------|--------|
| Too many policies | Archive or consolidate unused policies |
| Complex selectors | Simplify `resourceSelectors`; prefer specific selectors over broad ones |
| Controller CPU-constrained | Increase CPU limits or add controller replicas |
| API server slow LIST | Ensure API server has sufficient resources; tune etcd |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
