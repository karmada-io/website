---
title: Adding an Organization to Supporters
---

The Karmada homepage recognizes organizations that support the project. This guide explains how to add an
organization's logo to the **Supporters** section.

The Supporters list is separate from the [Karmada Adopter Group](https://karmada.io/adopters/). If your
organization uses Karmada and wants to join the Adopter Group, follow the adopter onboarding process instead.

## Before you start

1. Confirm with the Karmada community that the organization should be listed as a supporter.
2. Make sure you are authorized to submit the organization's logo and allow it to be displayed on `karmada.io`.
3. Obtain a clear PNG logo. Prefer a transparent background, crop unnecessary whitespace, and optimize the file
   so it does not add unnecessary page weight.

## Add the logo

Clone the website repository and create a branch:

```shell
git clone https://github.com/karmada-io/website.git
cd website
git checkout -b add-example-company-supporter
```

Copy the logo to `static/img/supporters/`. Use a descriptive lowercase file name, for example:

```text
static/img/supporters/example-company.png
```

Do not replace or modify another organization's logo.

## Register the supporter

Edit `src/data/supporters.js` and import the image near the other supporter imports:

```javascript
import exampleCompany from "../../static/img/supporters/example-company.png";
```

Add an entry to `supportersData`. Use the organization's public name for accessible alternative text:

```javascript
{
    logo: exampleCompany,
    alt: 'Example Company',
},
```

The order of entries is also the display order on the homepage. Keep the existing order unless maintainers ask
for a different placement.

## Verify the change

Install dependencies and start the website locally:

```shell
npm ci
npm run start
```

Open `http://localhost:3000/` and check the Supporters section on desktop and mobile widths. Verify that:

- the logo loads without distortion;
- it has reasonable spacing relative to neighboring logos;
- the browser's image element contains the organization's name as alternative text.

Run a production build before opening the pull request:

```shell
npm run build
```

## Open the pull request

Include the following information in the pull request description:

- the organization's public name and website;
- confirmation that you are authorized to submit the logo;
- a screenshot of the rendered Supporters section;
- a link to the related issue or community discussion.

Keep the pull request limited to the logo file, its import, and the `supportersData` entry.
