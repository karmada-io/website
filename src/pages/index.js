import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import features from '../data/features'
import Feature from '../components/featuresList'
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';
import { Grid } from '@mui/material';
import SupportersList from '../components/supportersList';
import Button from '../components/button'
import WhatIs from '../components/whatIs'
import GhButton from '../components/gitHubButton'

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
          <h1 className={clsx('hero__title', styles.heroTitle)}>{siteConfig.title}</h1>

            <GhButton />

          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div
            className={clsx(styles.heroButtons, 'name', 'margin-vert--md')}>
            <Button href={useBaseUrl('docs/')}><Translate>Learn More</Translate></Button>
          </div>
        </div>
      </header>

      <WhatIs />   

      <main className={clsx('hero', styles.hero)}>
        <div className="container">
            <h2 className="title text-center">
                <Translate>Why Karmada</Translate>
            </h2>

            <section className={styles.features}>
            <div className="container features-container">
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
        <h2 className="title">
            <Translate>How It Works</Translate>
          </h2>
        <div className={styles.heroHowItWorks}>
        <img className={styles.heroHowItWorksImg} src={useBaseUrl('img/how-it-works.png')} alt="Karmada Control Plane" />
        </div>
        <h2 className="title">
            <Translate>Supporters</Translate>
          </h2>

        <SupportersList />

          <h2 className="hero__subtitle">
            <Translate>Karmada is a</Translate> <a href="https://cncf.io/">CNCF (Cloud Native Computing Foundation)</a> <Translate>sandbox project</Translate>
          </h2>
          <div className={clsx('cncf-logo', styles.cncfLogo)} />
        </div>
      </div>
    </Layout>
  );
}
