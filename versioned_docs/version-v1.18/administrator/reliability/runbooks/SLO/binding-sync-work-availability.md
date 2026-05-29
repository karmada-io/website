---
title: Binding Sync Work Availability
sidebar_label: Binding Sync Work Availability
description: Binding Sync Work Availability
---

# Binding to Work Sync Availability SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable — **page** alerts indicate urgent issues requiring immediate action, while **ticket** alerts should be addressed during business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

Karmada is failing to create Work resources from your ResourceBindings or ClusterResourceBindings (Stage 4: Work Creation & Override Application). After the scheduler assigns workloads to clusters, the binding controller converts those scheduling decisions into Work objects that drive the actual deployment. This step is failing.

## Impact

- **Workloads scheduled but not propagated** - The scheduler picked clusters, but resources can't move to the next pipeline stage
- **Deployments are stuck** - New applications won't reach member clusters
- **Updates blocked** - Changes to existing workloads won't propagate

This is a **critical** issue that blocks workload propagation after scheduling. User intent (resources created in Karmada) never materializes in member clusters.

## Possible Causes

- Conflicts with existing Work resources
- Invalid resource templates in the binding
- API server issues preventing Work creation
- Missing execution namespaces (one per member cluster)
- RBAC permission issues
- Override policy application failures

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check Kubernetes events for binding sync failures:**

```bash
kubectl get events -n karmada-system --field-selector reason=SyncWorkFailed --sort-by='.lastTimestamp'
```

Review the event messages to understand why the sync failed and determine the fix.

**3. Check the controller-manager logs.** The binding controller runs in the karmada-controller-manager.

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "binding\|work\|error\|failed"
```

**4. Check execution namespace existence.** Work objects are created in execution namespaces (one per member cluster). Missing namespaces cause Work creation failures.

```bash
kubectl get namespaces | grep karmada-es-

kubectl get clusters -o jsonpath='{.items[*].metadata.name}' | tr ' ' '\n' | while read cluster; do
  ns="karmada-es-${cluster}"
  kubectl get namespace "$ns" &>/dev/null || echo "MISSING: $ns"
done
```

**5. Check RBAC permissions:**

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "forbidden\|unauthorized\|rbac"
```

**6. Check override policy application.** Override policies are applied during Work creation; failures cause binding sync errors.

```bash
kubectl get overridepolicies -A
kubectl get clusteroverridepolicies
```

**7. Check the binding sync error rate:**

```promql
sum by (result) (rate(binding_sync_work_duration_seconds_count[5m]))
```

**8. Check the binding controller workqueue:**

```promql
workqueue_depth{name=~"binding-controller|cluster-resource-binding-controller"}

rate(workqueue_retries_total{name=~"binding-controller|cluster-resource-binding-controller"}[5m])
/
rate(workqueue_adds_total{name=~"binding-controller|cluster-resource-binding-controller"}[5m])
```

**9. Check for recent changes.** Were override policies modified? Were new member clusters registered? Were execution namespaces deleted?

### Mitigation

| Symptom | Action |
|---------|--------|
| Missing execution namespaces | Recreate namespaces or trigger cluster re-registration |
| RBAC errors | Review and fix controller-manager RBAC roles |
| Override policy failures | Review and fix OverridePolicy configurations |
| API server errors | Address API server issues first (see [Karmada API Server Availability](./karmada-apiserver-availability)) |
| Controller workqueue stuck | Restart the controller-manager after fixing the root cause |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
