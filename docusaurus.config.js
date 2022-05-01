/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "karmada",
  tagline: "Open, Multi-Cloud, Multi-Cluster Kubernetes Orchestration",
  url: "https://karmada.io",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn", 
  favicon: "img/favicon.ico",
  organizationName: "karmada-io",
  projectName: "website",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    localeConfigs: {
      en: {
        label: "English",
      },
      zh: {
        label: "简体中文",
      },
    },
  },
  themeConfig: {
    announcementBar: {
      id: "start",
      content:
        '⭐️ If you like Karmada, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/karmada-io/karmada">GitHub</a>! ⭐️',
    },
    algolia: {
      appId: '<NEW_APP_ID>',
      apiKey: '<NEW_SEARCH_API_KEY>',
      indexName: 'xxx',
    },
    navbar: {
      title: "Karmada",
      logo: {
        alt: "Karmada",
        src: "img/logo.svg",
        srcDark: "img/logoDark.svg",
      },
      items: [
        {
          type: "docsVersionDropdown",
          position: "right",
        },
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Documentation",
          position: "left",
        },
        {
          to: "blog",
          label: "Blog",
          position: "left",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/karmada-io/karmada",
          className: "header-github-link",
          position: "right",
        },
      ],
    },
    footer: {
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Getting Started",
              to: "/docs/",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "CNCF Slack ( #karmada channel )",
              href: "https://slack.cncf.io/",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/karmada-io/karmada",
            },
            {
              label: "Blog",
              to: "blog",
            },
          ],
        },
      ],
      copyright: `
        <br />
        <strong>© Karmada Authors ${new Date().getFullYear()} | Documentation Distributed under <a href="https://creativecommons.org/licenses/by/4.0">CC-BY-4.0</a> </strong> <strong>| Powered by <a href="https://www.netlify.com">Netlify</a></strong>
        <br />
        <br />
        © ${new Date().getFullYear()} The Linux Foundation. All rights reserved. The Linux Foundation has registered trademarks and uses trademarks. For a list of trademarks of The Linux Foundation, please see our <a href="https://www.linuxfoundation.org/trademark-usage/"> Trademark Usage</a> page.
      `,
    },
    prism: {
      theme: require("prism-react-renderer/themes/dracula"),
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: function ({ locale, docPath }) {
            return `https://github.com/karmada-io/website/edit/main/docs/${docPath}`;
          },
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          includeCurrentVersion: true,
        },
        gtag: {
          trackingID: "UA-195246198-1",
          anonymizeIP: false,
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/karmada-io/website/tree/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
