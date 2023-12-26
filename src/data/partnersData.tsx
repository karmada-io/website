import Translate from "@docusaurus/Translate";
import React from "react";

import huawei from "../../static/img/supporters/huawei.png";
import daocloud from "../../static/img/supporters/DaoCloud.png";
import DSK from "../../static/img/supporters/DSK.png";

const PartnersList = [
  {
    image: huawei,
    title: "Huawei",
    webURL: "https://www.huaweicloud.com/intl/en-us/product/ucs.html",
    description: (
      <Translate id="partners.huawei.description">
        UCS provides consistent experience in cloud native application deployment, management, and ecosystem. Cloud native applications can freely run across regions and clouds with intelligent traffic distribution.
      </Translate>
    ),
  },
  {
    image: daocloud,
    title: "DaoCloud",
    webURL: "https://www.daocloud.io/en/",
    description: (
      <Translate id="partners.daocloud.description">
        Build a more resilient and elastic hybrid-multi-cloud platform using Karmada.
      </Translate>
    ),
  },
  {
    image: DSK,
    title: "DSK",
    webURL: "https://www.unionbigdata.com/",
    description: (
      <Translate id="partners.DSK.description">
        Use Karmada to build a intelligent and distributed container platform with multi-policy and multi-region.
      </Translate>
    ),
  },
  // Add more partners information...
];

export default PartnersList;
