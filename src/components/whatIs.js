import React from 'react';
import Translate, { translate } from '@docusaurus/Translate';

const WhatIs = () => (
    <div className="hero">
        <div className="container">
            <div className="row">
                <div className="col">
                    <h1 className="text-center title"><Translate>What is Karmada?</Translate></h1>
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

export default WhatIs
