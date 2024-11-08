import Translate from "@docusaurus/Translate";
import React from "react";

import huawei from "../../static/img/supporters/huawei.png";
import daocloud from "../../static/img/supporters/DaoCloud.png";
import unionbigdata from "../../static/img/supporters/unionbigdata.png";
import cecloud from "../../static/img/supporters/CECloud.png"
import neen from "../../static/img/supporters/neen.png"
import chinaunicom from "../../static/img/supporters/chinaunicom.png"

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
    image: unionbigdata,
    title: "Unionbigdata",
    webURL: "https://www.unionbigdata.com/",
    description: (
      <Translate id="partners.unionbigdata.description">
        Use Karmada to build a intelligent and distributed container platform with multi-policy and multi-region.
      </Translate>
    ),
  },
  {
    image: cecloud,
    title: "CECloud",
    webURL: "https://cecloud.com/",
    description: (
        <Translate id="partners.cecloud.description">
          Use Karmada to build multi-cluster platform.
        </Translate>
    ),
  },
  {
    image: neen,
    title: "Neen S.p.A",
    webURL: "https://www.neen.it/",
    description: (
        <Translate id="partners.neen.description">
          Use Karmada to manage failover in a multi-region cluster.
        </Translate>
    ),
  },
  {
    image: chinaunicom,
    title: "Unicom Digital Tech",
    webURL: "https://www.chinaunicom.com.cn/",
    description: (
        <Translate id="partners.chinaunicom.description">
          Use Karmada to build a intelligent and distributed container platform with multi-policy and multi-region.
        </Translate>
    ),
  },
  // Add more partners information...
];

export default PartnersList;
