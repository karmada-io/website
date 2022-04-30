import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import features from '../data/features'
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import GitHubButton from 'react-github-btn';
import styles from './styles.module.css';
import { Grid } from '@mui/material';

function Feature({ imgUrl, title, description}) {
  return (
      <div className="col col--3">
        <div className="text--center">
          {imgUrl && <img className={styles.featureImage} src={useBaseUrl(imgUrl)} alt={title} />}
        </div>
      <div className="container">
          <h2>{title}</h2>
          <div>{description}</div>
      </div>
      </div>
  )
}

const Button = ({ children, href }) => {
  return (
    <div className="col col--2 margin-horiz--sm">
      <Link
        className="button button--outline button--primary button--lg"
        to={href}>
        {children}
      </Link>
    </div>
  );
};

export default function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title={siteConfig.tagline} description={siteConfig.tagline}>
      <header className={clsx('hero', styles.hero)}>
        <div className="container text--center">
          <div className={styles.heroLogoWrapper}>
            <img className={styles.heroLogo} src={useBaseUrl('img/karmada-icon-color.png')} alt="Karmada Logo" />
          </div>
          <h2 className={clsx('hero__title', styles.heroTitle)}>{siteConfig.title}</h2>
          <GitHubButton
            href="https://github.com/karmada-io/karmada"
            data-icon="octicon-star"
            data-size="large"
            data-show-count="true"
            aria-label="Star Karmada on GitHub">
            Star
          </GitHubButton>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div
            className={clsx(styles.heroButtons, 'name', 'margin-vert--md')}>
            <Button href={useBaseUrl('docs/')}><Translate>Learn More</Translate></Button>
          </div>
        </div>
      </header>

      <WhatIs />   

      <div className="container text--center">
        <h3 className="hero__subtitle">
            <Translate>Why Karmada</Translate>
          </h3>
      </div>    
      <main className={clsx('hero', styles.hero)}>
        <div className="container">
          <section className={styles.features}>
            <div className="container">
              <Grid container>
              {features.map((f, idx) => (
                <Grid item key={idx} xs={12} md={6} lg={4}>
                  <Feature title={f.title} description={f.description} />
                </Grid>
              ))}
              </Grid>
              
            </div>
          </section>
        </div>
      </main>
      <div className={clsx('hero', styles.hero)}>
        <div className="container text--center">
        <h3 className="hero__subtitle">
            <Translate>How It Works</Translate>
          </h3>
        <div className={styles.heroHowItWorks}>
        <img className={styles.heroLogo} src={useBaseUrl('img/how-it-works.png')} alt="Karmada Control Plane" />
        </div>
        <h3 className="hero__subtitle">
            <Translate>Supporters</Translate>
          </h3>
        <div className={styles.heroSupporter}>
        <img className={styles.heroLogo} src={useBaseUrl('img/supporters.png')} alt="Karmada Supporters" />
        </div>
          <h3 className="hero__subtitle">
            <Translate>Karmada is a</Translate> <a href="https://cncf.io/">CNCF (Cloud Native Computing Foundation)</a> <Translate>sandbox project</Translate>
          </h3>
          <div className={clsx('cncf-logo', styles.cncfLogo)} />
        </div>
      </div>
    </Layout>
  );
}

const WhatIs = () => (
  <div className={clsx('hero', styles.hero)}>
    <div className="container">
      <div className="row">
        <div className="col col--6">
          <h1><Translate>What is Karmada?</Translate></h1>
          <p className="hero__subtitle">
            <small>
              <Translate>
              Karmada (Kubernetes Armada) is a Kubernetes management system that enables you to run your cloud-native applications across multiple Kubernetes clusters and clouds, with no changes to your applications. By speaking Kubernetes-native APIs and providing advanced scheduling capabilities, Karmada enables truly open, multi-cloud Kubernetes.
              </Translate>
              <br />
              <br />
              <Translate>
              Karmada aims to provide turnkey automation for multi-cluster application management in multi-cloud and hybrid cloud scenarios, with key features such as centralized multi-cloud management, high availability, failure recovery, and traffic scheduling.
              </Translate>
            </small>
          </p>
        </div>
      </div>
    </div>
  </div>
);
