import React from 'react';
import Layout from '@theme/Layout';
import features from '../data/features'
import Feature from '../components/featuresList'
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
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
      <header className="hero">
        <div className="container text--center">
          <div className="heroLogoWrapper">
            <img className="heroLogo" src={useBaseUrl('img/karmada-icon-color.png')} alt="Karmada Logo" />
          </div>
          <h1 className="hero__title">{siteConfig.title}</h1>

            <GhButton />

          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div
            className="heroButtons">
            <Button href={useBaseUrl('docs/')}><Translate>Learn More</Translate></Button>
          </div>
        </div>
      </header>

      <WhatIs />   

      <main className="hero">
        <div className="container">
            <h2 className="title text-center">
                <Translate>Why Karmada</Translate>
            </h2>

            <section className="features">
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
      <div className="hero">
        <div className="container text--center">
        <h2 className="title">
            <Translate>How It Works</Translate>
          </h2>
        <div className="heroHowItWorks">
        <img className="heroHowItWorksImg" src={useBaseUrl('img/how-it-works.png')} alt="Karmada Control Plane" />
        </div>
        <h2 className="title">
            <Translate>Supporters</Translate>
          </h2>

        <SupportersList />

          <h2 className="hero__subtitle">
            <Translate>Karmada is a</Translate> <a href="https://cncf.io/">CNCF (Cloud Native Computing Foundation)</a> <Translate>sandbox project</Translate>
          </h2>
          <div className="cncf-logo" />
        </div>
      </div>
    </Layout>
  );
}
