const { Component } = require("react");

module.exports = {
    docs: [
        {
            type: "category",
            label: "Core Concepts",
            collapsed: false,
            items: [
                "core-concepts/introduction",
                "core-concepts/concepts",
                "core-concepts/architecture",
            ],
        },
        {
            type: "doc",
            id: "key-features/features",
        },
        {
            type: "category",
            label: "Get Started",
            items: [
                "get-started/nginx-example"
            ],
        },
        {
            type: "category",
            label: "Tutorials",
            items: [
                "tutorials/karmada-search"
            ],
        },
        {
            type: "category",
            label: "Installation",
            items: [
                "installation/installation",
                "installation/install-kubectl-karmada",
                "installation/fromsource",
                "installation/install-binary",
            ],
        },
        {
            type: "category",
            label: "User Guide",
            items: [
                {
                    type: "category",
                    label: "Cross-cloud Multi-cluster Management",
                    items: [
                        "userguide/clustermanager/cluster-registration",
                        "userguide/clustermanager/working-with-anp",
                    ],
                },
                {
                    type: "category",
                    label: "Multi-cluster Scheduling",
                    items: [
                        "userguide/scheduling/resource-propagating",
                        "userguide/scheduling/override-policy",
                        "userguide/scheduling/propagate-dependencies",
                        "userguide/scheduling/descheduler",
                        "userguide/scheduling/scheduler-estimator",
                        "userguide/scheduling/cluster-resources",
                    ],
                },
                {
                    type: "category",
                    label: "Multi-cluster Failover",
                    items: [
                        "userguide/failover/failover",
                    ],
                },
                {
                    type: "category",
                    label: "Global Uniform Resource View",
                    items: [
                        "userguide/globalview/aggregated-api-endpoint",
                        "userguide/globalview/customizing-resource-interpreter",
                        "userguide/globalview/proxy-global-resource",
                    ],
                },
                {
                    type: "category",
                    label: "Multi-cluster Service Governance",
                    items: [
                        "userguide/service/multi-cluster-service",
                        "userguide/service/multi-cluster-ingress",
                        "userguide/service/working-with-istio-on-flat-network",
                        "userguide/service/working-with-istio-on-non-flat-network",
                    ],
                },
                {
                    type: "category",
                    label: "Multi-cluster Network",
                    items: [
                        "userguide/network/working-with-submariner",
                    ],
                },
                {
                    type: "category",
                    label: "Multi-cluster CI/CD",
                    items: [
                        "userguide/cicd/working-with-argocd",
                        "userguide/cicd/working-with-flux",
                    ],
                },
                {
                    type: "category",
                    label: "Multi-cluster Security Compliance Governance",
                    items: [
                        "userguide/security-governance/working-with-gatekeeper",
                        "userguide/security-governance/working-with-kyverno",
                    ],
                },
                {
                    type: "category",
                    label: "Role Separation",
                    items: [
                        "userguide/roleseparation/unifiedAuth",
                    ],
                },
            ],
        },
        {
            type: "category",
            label: "Administrator Guide",
            items: [
                {
                    type: "category",
                    label: "Karmadactl Manual",
                    items: [
                        "administrator/karmadactl/init"
                    ],
                },
                {
                    type: "category",
                    label: "Configuration",
                    items: [
                        "administrator/configuration/configure-controllers"
                    ],
                },
                {
                    type: "category",
                    label: "Migration",
                    items: [
                        "administrator/migration/promote-legacy-workload",
                        "administrator/migration/migration-from-kubefed",
                    ],
                },
                {
                    type: "category",
                    label: "Monitoring",
                    items: [
                        "administrator/monitoring/working-with-filebeat",
                        "administrator/monitoring/working-with-prometheus",
                    ],
                },
                {
                    type: "category",
                    label: "Upgrading",
                    items: [
                        "administrator/upgrading/README",
                        "administrator/upgrading/v0.8-v0.9",
                        "administrator/upgrading/v0.9-v0.10",
                        "administrator/upgrading/v0.10-v1.0",
                        "administrator/upgrading/v1.0-v1.1",
                        "administrator/upgrading/v1.1-v1.2",
                    ],
                },
                {
                    type: "category",
                    label: "Backup",
                    items: [
                        "administrator/backup/working-with-velero"
                    ],
                },
            ],
        },
        {
            type: "category",
            label: "Developer Guide",
            items: [
                "developers/profiling-karmada",
                "developers/bash-auto-completion-on-linux",
            ],
        },
        {
            type: "category",
            label: "Contributor Guide",
            items: [
                "contributor/cherry-picks",
                "contributor/github-workflow",
                "contributor/lifted",
            ],
        },
        {
            type: "category",
            label: "Case Study",
            items: [
                "casestudies/vipkid",
            ],
        },
        {
            type: "doc",
            id: "troubleshooting/troubleshooting"
        },
        {
            type: "doc",
            id: "faq/faq",
        },
        {
            type: "category",
            label: "Reference",
            items: [
                "reference/reserved-namespaces",
                "reference/object-association-mapping",
            ],
        },
    ],
};
