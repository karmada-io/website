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
                "tutorials/crd-application",
                "tutorials/karmada-search"
            ],
        },
        {
            type: "category",
            label: "Installation",
            items: [
                "installation/installation",
                "installation/install-cli-tools",
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
                        "userguide/failover/failover-overview",
                        "userguide/failover/determine-cluster-failures",
                        "userguide/failover/failover-analysis",
                    ],
                },
                {
                    type: "category",
                    label: "Global Uniform Resource View",
                    items: [
                        "userguide/globalview/aggregated-api-endpoint",
                        "userguide/globalview/customizing-resource-interpreter",
                        "userguide/globalview/global-search-for-resources",
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
                    label: "Best Production Practices",
                    items: [
                        "userguide/bestpractices/namespace-management",
                        "userguide/bestpractices/unified-auth",
                        "userguide/bestpractices/federated-resource-quota",
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
                        "administrator/monitoring/working-with-prometheus-in-control-plane",
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
                        "administrator/upgrading/v1.2-v1.3",
                        "administrator/upgrading/v1.3-v1.4",
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
                "developers/performance-test-setup-for-karmada",
                "developers/releasing",
                "developers/customize-karmada-scheduler",
            ],
        },
        {
            type: "category",
            label: "Contributor Guide",
            items: [
                "contributor/contribute-docs",
                "contributor/cherry-picks",
                "contributor/github-workflow",
                "contributor/lifted",
            ],
        },
        {
            type: "category",
            label: "Case Study",
            items: [
                "casestudies/adopters",
                "casestudies/vipkid",
                "casestudies/ci123",
            ],
        },
        {
            type: "doc",
            id: "troubleshooting/trouble-shooting"
        },
        {
            type: "doc",
            id: "faq/faq",
        },
        {
            type: "doc",
            id: "releases",
        },
        {
            type: "category",
            label: "Reference",
            items: [
                {
                    type: "category",
                    label: "Command line tool(karmadactl)",
                    items: [
                        "reference/karmadactl/bash-auto-completion-on-linux",
                        "reference/karmadactl/karmadactl-commands/karmadactl_index",
                        "reference/karmadactl/karmadactl-commands/karmadactl",
                        "reference/karmadactl/karmadactl-usage-conventions",
                    ],
                },
                {
                    type: "category",
                    label: "Component tools",
                    items: [
                        "reference/components/karmada-agent",
                        "reference/components/karmada-aggregated-apiserver",
                        "reference/components/karmada-controller-manager",
                        "reference/components/karmada-descheduler",
                        "reference/components/karmada-scheduler",
                        "reference/components/karmada-scheduler-estimator",
                        "reference/components/karmada-search",
                        "reference/components/karmada-webhook",
                    ],
                },
                {
                    type: "category",
                    label: "Instrumentation",
                    items: [
                        "reference/instrumentation/event",
                        "reference/instrumentation/metrics",
                    ],
                },
                "reference/reserved-namespaces",
                "reference/object-association-mapping",
            ],
        },
    ],
};
