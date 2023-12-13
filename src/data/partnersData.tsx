import Translate from "@docusaurus/Translate";
import React from "react";

import huawei from "../../static/img/supporters/huawei.png";
import daocloud from "../../static/img/supporters/DaoCloud.png";

const PartnersList = [
  {
    image: huawei,
    title: "Huawei",
    webURL: "https://www.huaweicloud.com/intl/en-us/",
    description: (
      <Translate id="partners.huawei.description">
        Huawei Cloud is a leading cloud service provider in China and Asia
        Pacific.
      </Translate>
    ),
  },
  {
    image: daocloud,
    title: "DaoCloud",
    webURL: "https://www.daocloud.io/en/",
    description: (
      <Translate id="partners.daocloud.description">
        Huawei Cloud is a leading cloud service provider in China and Asia
        Pacific.
      </Translate>
    ),
  },
  // Add more partners information...
];

export default PartnersList;
