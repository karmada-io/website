---
title: Work Sync Workload Availability
sidebar_label: Work Sync Workload Availability
description: Work Sync Workload Availability
---

# Work to Workload Sync Availability SLO Error Budget Burn Rate Exceeded

## Understanding This Alert

This alert fires when the SLO's error budget is being consumed faster than sustainable — **page** alerts indicate urgent issues requiring immediate action, while **ticket** alerts should be addressed during business hours. See the [Reliability Engineering Guide](../../guide#slo-alerting-framework) for details on burn rates, time windows, and severity thresholds.

## What This Alert Means

Karmada is failing to deploy workloads to your member clusters (Stage 5: Work Execution). This is the final and most critical step where your resources actually get created in the target clusters.

## Impact

- **Workloads don't run** - Despite successful scheduling, applications fail to start in member clusters
- **Most visible failures** - Your applications won't be available
- **Direct end-user impact** - Services depending on these workloads will be down
- **Deployment pipeline broken at the final step** - Everything works until the last mile

This is a **critical** issue with direct impact on application availability. Users can see their resources in Karmada but not in member clusters.

## Possible Causes

- Member cluster API server issues or unreachable clusters
- Admission control rejections due to policy misconfigurations
- Conflicts with pre-existing resources in the member cluster
- Missing CRDs in member clusters
- Authentication/authorization failures to member clusters
- Network connectivity issues between control plane and member clusters

## Remediation

**1. Review the Sloth SLO dashboards in Grafana.** These dashboards are your primary tool for understanding the scope and timeline of the issue:

- **[SLO Details Dashboard](https://grafana.com/grafana/dashboards/14348)** — Drill into this specific SLO to see the current burn rate, error budget remaining, monthly burndown chart, and alert state. Use this to confirm the alert and understand when the issue began.
- **[SLO Overview Dashboard](https://grafana.com/grafana/dashboards/14643)** — Check the fleet-wide view to see if other SLOs are also burning budget, which may indicate a broader systemic issue.


**2. Check Kubernetes events for work sync failures:**

```bash
kubectl get events -n karmada-system --field-selector reason=SyncFailed --sort-by='.lastTimestamp'
```

Review the event messages to understand why the sync failed and determine the fix.

**3. Identify affected clusters:**

```promql
sum by (member_cluster) (
  rate(create_resource_to_cluster{result="error"}[5m])
  + rate(update_resource_to_cluster{result="error"}[5m])
  + rate(delete_resource_from_cluster{result="error"}[5m])
)
```

**4. Check member cluster connectivity.** Work sync errors most commonly occur when member clusters are unreachable.

```bash
kubectl get clusters
kubectl describe cluster <cluster-name>
```

```promql
cluster_ready_state == 0
```

**5. Check the execution controller logs:**

Check the logs using your logging solution (e.g., kubectl logs, Loki, Elasticsearch):

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "sync work\|failed"
```

**6. Check for resource-specific errors.** Specific resource kinds failing may indicate missing CRDs, RBAC restrictions, or resource conflicts in the member cluster.

```promql
sum by (kind) (
  rate(create_resource_to_cluster{result="error"}[5m])
  + rate(update_resource_to_cluster{result="error"}[5m])
)
```

**7. Check authentication/authorization to member clusters:**

```bash
kubectl logs -n karmada-system -l app=karmada-controller-manager --tail=200 | grep -i "unauthorized\|forbidden\|certificate"
```

**8. Check network connectivity to member clusters:**

```bash
kubectl run connectivity-test --rm -it --image=curlimages/curl --namespace=karmada-system -- \
  curl -k https://<member-cluster-api-server>:6443/healthz
```

**9. Check for recent changes.** Were member cluster credentials rotated? Were admission policies changed in member clusters? Were new CRD-based resources added?

### Mitigation

| Symptom | Action |
|---------|--------|
| Member cluster unreachable | Restore network connectivity to member cluster |
| Member cluster API server errors | Address member cluster API server health |
| Authentication failures | Rotate or renew member cluster credentials |
| Missing CRDs in member cluster | Install required CRDs in affected member clusters |
| Resource conflicts | Resolve conflicts; check for namespace/name collisions |
| Network partition | Work with network team to restore connectivity |

## Related Resources

- [Reliability Engineering Guide](../../guide)
- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/)
