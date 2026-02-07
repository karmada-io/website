import React from 'react'
import Translate from '@docusaurus/Translate';

const features = [
    {
        title: <Translate>Kubernetes Native API Compatible</Translate>,
        // imgUrl: 'img/logo.svg',
        description: (
            <Translate>
                Zero change upgrade: from single-cluster to multi-cluster; Seamless integration of existing K8s tool
                chain
            </Translate>
        ),
    },
    {
        title: <Translate>Open and Neutral</Translate>,
        // imgUrl: 'img/logo.svg',
        description: (
            <Translate>
                Jointly initiated by Internet, finance, manufacturing, telecommunications, cloud providers, etc. Target for open
                governance with CNCF
            </Translate>
        ),
        reverse: true,
    },
    {
        title: <Translate>Avoid Vendor Lock-in</Translate>,
        // imgUrl: 'img/logo.svg',
        description: (
            <Translate>
                Integration with mainstream cloud providers; Automatic allocation, migration across clusters; Not
                tied to proprietary vendor orchestration
            </Translate>
        ),
    },
    {
        title: <Translate>Out of the Box</Translate>,
        // imgUrl: 'img/logo.svg',
        description: (
            <Translate>
                Built-in policy sets for scenarios: Active-active, Remote DR, Geo Redundant
            </Translate>
        ),
        reverse: true,
    },
    {
        title: <Translate>Fruitful Scheduling Policies</Translate>,
        // imgUrl: 'img/logo.svg',
        description: (
            <Translate>
                Cluster Affinity; Multi Cluster Splitting/Rebalancing; Multi-Dimension HA:
                Region/AZ/Cluster/Provider
            </Translate>
        ),
    },
    {
        title: <Translate>Centralized Management</Translate>,
        // imgUrl: 'img/logo.svg',
        description: (
            <Translate>
                Cluster location agnostic; Support clusters in public cloud, on-prem or edge
            </Translate>
        ),
        reverse: true,
    },
]

export default features
