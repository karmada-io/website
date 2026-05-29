---
title: How to Upgrade
---

This guide outlines the process for upgrading Karmada, covering API and component updates, as well as support for upgrade methods like Helm and Operator.

## Regular Upgrading Process

### Upgrading APIs
For releases that introduce API changes, the Karmada API (CRD) that Karmada components rely on must be upgraded to maintain consistency.

Karmada CRD consists of two parts:
- bases: The CRD definition generated via API structs.
- patches: Conversion settings for the CRD.

To support multiple versions of custom resources, the `patches` should be injected into `bases`. To achieve this, we introduced a `kustomization.yaml` configuration and use `kubectl kustomize` to build the final CRD.

The `bases`, `patches`, and `kustomization.yaml` are now located in the `charts/_crds` directory of the repo.

#### Manual Upgrade API

**Step 1: Get the Webhook CA certificate**

The CA certificate will be injected into `patches` before building the final CRD. We can retrieve it from the `MutatingWebhookConfiguration` or `ValidatingWebhookConfiguration` configurations, e.g:
```bash
kubectl get mutatingwebhookconfigurations.admissionregistration.k8s.io mutating-config
```
Copy the `ca_string` from the YAML path `webhooks.name[x].clientConfig.caBundle`, then replace the `{{caBundle}}` in the YAML files in `patches`. For example:
```bash
sed -i'' -e "s/{{caBundle}}/${ca_string}/g" ./"charts/karmada/_crds/patches/webhook_in_resourcebindings.yaml"
sed -i'' -e "s/{{caBundle}}/${ca_string}/g" ./"charts/karmada/_crds/patches/webhook_in_clusterresourcebindings.yaml"
```

**Step 2: Build the final CRD**

Generate the final CRD using the `kubectl kustomize` command, for example:
```bash
kubectl kustomize ./charts/karmada/_crds 
```
Or, you can apply it to `karmada-apiserver` by:
```bash
kubectl kustomize ./charts/karmada/_crds | kubectl apply -f -
```

### Upgrading Components
Component upgrades involve image version updates and possible command argument changes.

> For argument changes, please refer to [Details Upgrading Instruction](https://karmada.io/docs/administrator/upgrading/#details-upgrading-instruction).

## Upgrade Support

To simplify the upgrade process, Karmada provides multiple upgrade support methods, as detailed below:

:::note

The upgrade methods for Karmada installed via different installation methods may vary. Please select the corresponding upgrade method based on your actual installation method.

:::

### Helm Upgrade

If you installed Karmada using Helm, you can upgrade Karmada using the `helm upgrade` command.

#### Configuration Changes

To adjust component parameters (e.g., feature gates) without changing the software version, modify the configuration file. The specific process is as follows:

1. First, ensure you have a Karmada cluster installed via `helm install`, for example:

   ```bash
   helm install karmada -n karmada-system --create-namespace karmada-chart-v1.14.0.tgz
   ```

2. Suppose you want to update the `featureGates` parameter of `karmada-controller-manager` to enable the FederatedQuotaEnforcement feature. You can use the following command:

   ```bash
   $ helm upgrade karmada -n karmada-system --create-namespace karmada-chart-v1.14.0.tgz --set controllerManager.featureGates.FederatedQuotaEnforcement=true
   Release "karmada" has been upgraded. Happy Helming!
   NAME: karmada
   LAST DEPLOYED: Mon Jun 23 15:03:51 2025
   NAMESPACE: karmada-system
   STATUS: deployed
   REVISION: 2
   TEST SUITE: None
   ```
   In addition to using the `--set` command-line parameter, you can also update configurations by modifying the `values.yaml` file.   

3. Verify the update by checking the `karmada-controller-manager` manifest before and after the update:

   **Before update:**
   ```yaml
           - --feature-gates=PropagateDeps=false
   ```

   **After update:**
   ```yaml
           - --feature-gates=FederatedQuotaEnforcement=true,PropagateDeps=false
   ```

#### Version Update

To update the Karmada version (e.g., from v1.13.0 to v1.14.0), use the following steps:

##### Local Update

1. Start with a Karmada cluster installed via Helm, for example:
   
   ```bash
   helm install karmada -n karmada-system --create-namespace karmada-chart-v1.13.0.tgz
   ```

2. Prepare the Helm Chart package for v1.14.0 (e.g., `karmada-chart-v1.14.0.tgz`), then run:

   ```bash
   helm upgrade karmada -n karmada-system --create-namespace karmada-chart-v1.14.0.tgz
   ```
   This command triggers the Karmada upgrade process, including API and component upgrades.

#### Remote Update

1. First, add the Karmada chart repository to your local repository:
   ```bash
   $ helm repo add karmada-charts https://raw.githubusercontent.com/karmada-io/karmada/master/charts
   $ helm repo list
   NAME            URL
   karmada-charts   https://raw.githubusercontent.com/karmada-io/karmada/master/charts
   ```

2. List available charts and versions:
   ```bash
   helm search repo karmada
   ```

3. Install or upgrade the chart, specifying the version with the `--version` argument. Replace `<x.x.x>` with your target version:
   ```bash
   $ helm --namespace karmada-system upgrade -i karmada karmada-charts/karmada --version=v1.14.0 --create-namespace
   NAME: karmada
   LAST DEPLOYED: Mon Jun 23 16:42:07 2025
   NAMESPACE: karmada-system
   STATUS: deployed
   REVISION: 2
   TEST SUITE: None
   ```

### Operator Upgrade

The Karmada Operator manages the lifecycle (installation, upgrade, and uninstallation) of Karmada clusters via Custom Resources (CRs). If you installed Karmada using the Karmada Operator, you can upgrade Karmada by modifying the Karmada CR.

#### Configuration Changes

1. Deploy the Karmada Operator and create a Karmada instance (see the [Karmada Operator installation tutorial](https://github.com/karmada-io/karmada/blob/master/operator/README.md) for details).

2. Update the Karmada CR to modify component configurations, such as disabling the `hpaScaleTargetMarker` controller in the controller manager:

   ```bash
   kubectl patch karmada karmada-demo -n test --type merge -p '
   {
     "spec": {
       "components": {
         "karmadaControllerManager": {
           "extraArgs": {
             "controllers": "*,-hpaScaleTargetMarker"
           }
         }
       }
     }
   }'
   ```

#### Version Update

1. Suspend reconciliation of the Karmada CR to avoid invalid restarts during the update:

   ```bash
   kubectl patch karmada karmada-demo -n test --type merge -p '
   {
     "spec": {
       "suspend": true
     
   }'
   ```

2. Upgrade the Karmada Operator (typically requires matching the minor version of Karmada components) and update the Karmada API:

   ```bash
   kubectl set image --namespace karmada-system deployments/karmada-operator karmada-operator=docker.io/karmada/karmada-operator:<imageTag>
   kubectl apply -f https://raw.githubusercontent.com/karmada-io/karmada/refs/tags/<imageTag>/charts/karmada-operator/crds/operator.karmada.io_karmadas.yaml
   ```

3. Update the Karmada CR:
   - Upgrade Karmada components by updating the `imageTag` in the CR.
   - Upgrade the APIs by updating the `crdTarball` in the CR.
   - Refer to [Details Upgrading Instruction](https://karmada.io/docs/administrator/upgrading/#details-upgrading-instruction) to remove deprecated parameters in the new version.

   ```bash
   kubectl patch karmada karmada-demo -n test --type merge -p '
   {
     "spec": {
       "crdTarball": {
         "httpSource": {
           "url": "https://github.com/karmada-io/karmada/releases/download/v1.14.0/crds.tar.gz"
         }
       },
       "components": {
         "karmadaAggregatedAPIServer": {
           "imageTag": "v1.14.0"
         },
         "karmadaControllerManager": {
           "imageTag": "v1.14.0"
         },
         ## Other components omitted for brevity...
       }
     }
   }'
   ```

4. Resume reconciliation of the Karmada CR:

   ```bash
   kubectl patch karmada karmada-demo -n test --type merge -p '
   {
     "spec": {
       "suspend": false
     }
   }'
   ```

After completing the above steps, the Karmada upgrade is complete.
