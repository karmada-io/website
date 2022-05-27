const { Component } = require("react");

module.exports = {
  docs: [
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "getting-started/introduction",
        "getting-started/core-concept",
        "getting-started/architecture",
      ],
    },
    {
      type: "category",
      label: "Installation",
      collapsed: true,
      items: [
        "installation/installation",
        "installation/install-kubectl-karmada",
        "installation/fromsource",
      ],
    },
    {
      type: "category",
      label: "User Guide",
      collapsed: true,
      items: [
        "userguide/cluster-registration",
        "userguide/aggregated-api-endpoint",
        "userguide/configure-controllers",
        "userguide/customizing-resource-interpreter",
        "userguide/failover",
        "userguide/promote-legacy-workload",
        "userguide/resource-propagating",
        "userguide/override-policy",
      ],
    },
    {
      type: "category",
      label: "Developer Guide",
      items: [
        "developers/guide/github-workflow",
        "developers/guide/cherry-picks",
      ],
    },
    {
      type: "category",
      label: "Roadmap",
      items: ["roadmap"],
    },
    {
      type: "doc",
      id: "developers/devel/faq",
    },
  ],
};
