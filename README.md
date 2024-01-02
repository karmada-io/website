# Karmada Docs & Website

This repo contains the source code of [Karmada website](https://karmada.io/) and all of the docs for Karmada.
It's built by [Docusaurus](https://docusaurus.io/), a modern static website generator.

- [Karmada website](https://karmada.io/)
- [Karmada docs](https://karmada.io/docs/)
- [Karmada Blog](https://karmada.io/blog/)

Welcome to join us and you are more than appreciated to contribute!

## Website Preview

If you only update the docs, you do not need to preview the website locally.
We will create a preview link for you when you submit a pull request (PR). In an open PR,
you can find the preview link in the comment of the PR.
Check [Open PRs List](https://github.com/karmada-io/website/pulls).

## Run with Node.js

If you have the Node.js environment, you can run the website locally.

```bash
# Clone the repo, or your own fork
git clone https://github.com/<YOUR_GITHUB_USERNAME>/karmada-website.git

# Install dependencies
cd karmada-website
npm install

# Start the site
yarn run start
```

## Run with Docker

If you do not want to install the Node.js environment, you can consider using Docker instead.

```bash
make serve
```

With just one command, you can run it locally and then access <http://localhost:3000> to preview the website.

## Local Development

If you want to contribute to the website, firstly, it is essential to learn some basic knowledge of [Docusaurus](https://docusaurus.io/).

### Run the development server

To start a local development server, please run:

```bash
yarn run start
```

This command starts a local development server and opens a browser window at <http://localhost:3000>.
Most changes are automatically reflected live without the need to restart the server.

### Build

```bash
yarn run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```bash
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
