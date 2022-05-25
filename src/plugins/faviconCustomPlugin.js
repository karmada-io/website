module.exports = function faviconCustomPlugin() {
    return {
        injectHtmlTags() {
            return {
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
            };
        },
    };
};
