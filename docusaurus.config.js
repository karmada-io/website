const { themes } = require('prism-react-renderer'); 

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "karmada",
  tagline: "Open, Multi-Cloud, Multi-Cluster Kubernetes Orchestration",
  url: "https://karmada.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  organizationName: "karmada-io",
  projectName: "website",
  themes: ['@docusaurus/theme-mermaid'],
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
  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicons/apple-touch-icon.png",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicons/favicon-32x32.png",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicons/favicon-16x16.png",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: "/favicons/favicon.ico",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "manifest",
        href: "/favicons/site.webmanifest",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "mask-icon",
        color: "#ffffff",
        href: "/favicons/safari-pinned-tab.svg",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "theme-color",
        content: "#ffffff",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "msapplication-config",
        content: "/favicons/browserconfig.xml",
      },
    },
  ],
  themeConfig: {
    announcementBar: {
      id: "start",
      content:
        '⭐️ If you like Karmada, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/karmada-io/karmada">GitHub</a>! ⭐️',
    },
    algolia: {
      appId: '5IDBLUX6VJ',
      apiKey: '0544ead27838375d12530a88e31fcce8',
      indexName: 'karmada',
      // contextualSearch ensures that search results are relevant to the current language and version.
      contextualSearch: true,
    },
    navbar: {
      title: "Karmada",
      logo: {
        alt: "Karmada",
        src: "img/logo.svg",
        srcDark: "img/artwork/karmada-icon-white.svg",
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
          to: "adopters",
          label: "Adopters",
          position: "left",
        },
        {
          label: 'Partners',
          activeBasePath: 'partners',
          to: '/partners',
          position: 'left',
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/karmada-io/karmada",
          className: "header-github-link",
          position: "right",
          "aria-label": "GitHub repository",
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
            {
              label: "Adopters",
              to: "adopters",
            }
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
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'markdown', 'go']
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
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          postsPerPage: 1,
          showReadingTime: true,
          editUrl: "https://github.com/karmada-io/website/tree/main/",
        },
        pages: {
          path: "src/pages",
          routeBasePath: "/",
          include: ["**/*.{js,jsx,ts,tsx,md,mdx}"],
          exclude: [
            "**/_*.{js,jsx,ts,tsx,md,mdx}",
            "**/_*/**",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__tests__/**",
          ],
          mdxPageComponent: "@theme/MDXPage",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    }
  },
};
