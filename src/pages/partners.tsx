import Layout from "@theme/Layout";
import styles from "./styles.module.css";
import clsx from "clsx";
import React from "react";
import Translate, { translate } from "@docusaurus/Translate";
import { Typography } from "@douyinfe/semi-ui";
import PartnersListData from "../data/partnersData";

export default function Partners() {
  const { Text } = Typography;

  const PartnersList = PartnersListData;

  return (
    <Layout>
      <div className={styles.background}>
        <div className={clsx(styles.container, "container")}>
          <div className={clsx(styles.rowHeader, "row")}>
            <div className="col col--12">
              <h1>
                <Translate id="partners.title">
                  Karmada Partner
                </Translate>
              </h1>
            </div>
            <div className="col col--12">
              <p className={styles.font}>
                <Translate id="partners.description">
                  Vetted partners with deep experience helping enterprises successfully adopt Karmada.
                  Interested in becoming a partner?
                </Translate>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={clsx(styles.containerPartnersList, "container")}>
        <div className="row" style={{ marginBottom: "40px" }}>
          {PartnersList.map(({ image, title, webURL, description }, index) => (
            <div
              className={clsx(styles.colPartnersList, "col col--3")}
              key={index}
            >
              <div className="card shadow--md">
                <div
                  className={clsx(styles.cardImagePartnersList, "card__image")}
                >
                  <a href={webURL} target="_blank">
                    <img src={image} className={styles.cardImage} />
                  </a>
                </div>
                <div className="card__body">
                  <div className={styles.cardBodyPartnersList}>
                    <h4 className={styles.cardBodyH4PartnersList}>
                      <a href={webURL} target="_blank">
                        {title}
                      </a>
                    </h4>
                  </div>
                  <p className={styles.cardBodyFoot}>{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
