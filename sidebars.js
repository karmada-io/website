const { Component } = require("react");

module.exports = {
    docs: [
        {
            type: "category",
            label: "Core Concepts",
            collapsed: false,
            items: [
                "core-concepts/introduction",
                "core-concepts/components",
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
                "tutorials/karmada-search",
                "tutorials/autoscaling-with-resource-metrics",
                "tutorials/autoscaling-with-custom-metrics",
                "tutorials/autoscaling-federatedhpa-with-cronfederatedhpa",
                "tutorials/autoscaling-workload-with-cronfederatedhpa",
                "tutorials/resource-migration",
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
                "installation/ha-installation",
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
                        "userguide/failover/application-failover",
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
                        "userguide/service/working-with-eriecanal",
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
                {
                    type: "category",
                    label: "Autoscaling across clusters",
                    items: [
                        "userguide/autoscaling/federatedhpa",
                        "userguide/autoscaling/cronfederatedhpa",
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
                        "administrator/configuration/configure-controllers",
                        "administrator/configuration/resource-deletion-protection",
                    ],
                },
                {
                    type: "category",
                    label: "Migration",
                    items: [
                        "administrator/migration/promote-legacy-workload",
                        "administrator/migration/migration-from-kubefed",
                        "administrator/migration/migrate-in-batch",
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
                        "administrator/upgrading/v1.4-v1.5",
                        "administrator/upgrading/v1.5-v1.6",
                        "administrator/upgrading/v1.6-v1.7",
                        "administrator/upgrading/v1.7-v1.8"
                    ],
                },
                {
                    type: "category",
                    label: "Backup",
                    items: [
                        "administrator/backup/working-with-velero"
                    ],
                },
                {
                    type: "category",
                    label: "Security",
                    items: [
                        "administrator/security/security-considerations",
                        "administrator/security/verify-artifacts"
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
                "developers/document-releasing"
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
                "contributor/count-contributions",
            ],
        },
        {
            type: "category",
            label: "Case Study",
            items: [
                "casestudies/adopters",
                "casestudies/vipkid",
                "casestudies/ci123",
                "casestudies/daocloud",
                "casestudies/hurricane_engine",
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
                    type: "doc",
                    id: "reference/glossary"
                },
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
			            "reference/components/karmada-metrics-adapter",
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
                {
                    type: "category",
                    label: "Karmada API",
                    link: {
                        type: 'generated-index',
                        title: 'Karmada API',
                        description:
                            "Karmada' API is the application that serves Karmada functionality through a RESTful interface " +
                            "and stores the state of Karmada. " +
                            "Karmada resources and \"records of intent\" are all stored as API objects, and modified " +
                            "via RESTful calls to the API. The API allows configuration to be managed in a declarative way. " +
                            "Users can interact with the Karmada API directly, or via tools like kubectl. " +
                            "The core Karmada API is flexible and can also be extended to support custom resources.",
                        keywords: ['Karmada API'],
                    },
                    items: [
                        {
                            type: "category",
                            label: "Auto Scaling Resources",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/auto-scaling-resources/cron-federated-hpa-v1alpha1",
                                "reference/karmada-api/auto-scaling-resources/federated-hpa-v1alpha1",
                            ],
                        },
                        {
                            type: "category",
                            label: "Cluster Resources",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/cluster-resources/cluster-v1alpha1",
                            ],
                        },
                        {
                            type: "category",
                            label: "Common Definitions",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/common-definitions/delete-options",
                                "reference/karmada-api/common-definitions/label-selector",
                                "reference/karmada-api/common-definitions/list-meta",
                                "reference/karmada-api/common-definitions/node-selector-requirement",
                                "reference/karmada-api/common-definitions/object-meta",
                                "reference/karmada-api/common-definitions/patch",
                                "reference/karmada-api/common-definitions/quantity",
                                "reference/karmada-api/common-definitions/status",
                                "reference/karmada-api/common-definitions/typed-local-object-reference",
                            ],
                        },
                        {
                            type: "category",
                            label: "Common Parameters",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/common-parameter/common-parameters",
                            ],
                        },
                        {
                            type: "category",
                            label: "Config Resources",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/config-resources/resource-interpreter-customization-v1alpha1",
                                "reference/karmada-api/config-resources/resource-interpreter-webhook-configuration-v1alpha1",
                            ],
                        },
                        {
                            type: "category",
                            label: "Networking Resources",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/networking-resources/multi-cluster-ingress-v1alpha1",
                                "reference/karmada-api/networking-resources/multi-cluster-service-v1alpha1",
                            ],
                        },
                        {
                            type: "category",
                            label: "Policy Resources",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/policy-resources/cluster-override-policy-v1alpha1",
                                "reference/karmada-api/policy-resources/cluster-propagation-policy-v1alpha1",
                                "reference/karmada-api/policy-resources/federated-resource-quota-v1alpha1",
                                "reference/karmada-api/policy-resources/override-policy-v1alpha1",
                                "reference/karmada-api/policy-resources/propagation-policy-v1alpha1",
                            ],
                        },
                        {
                            type: "category",
                            label: "Search Resources",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/search-resources/resource-registry-v1alpha1",
                            ],
                        },
                        {
                            type: "category",
                            label: "Work Resources",
                            link: {
                                type: 'generated-index',
                            },
                            items: [
                                "reference/karmada-api/work-resources/cluster-resource-binding-v1alpha2",
                                "reference/karmada-api/work-resources/resource-binding-v1alpha2",
                                "reference/karmada-api/work-resources/work-v1alpha1",
                            ],
                        },
                    ],
                },
                "reference/reserved-namespaces",
                "reference/object-association-mapping",
            ],
        },
    ],
};
