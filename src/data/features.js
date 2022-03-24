import React from 'react'
import Translate, { translate } from '@docusaurus/Translate';

const features = [
  {
    title: <><Translate>Kubernetes Native API Compatible</Translate></>,
    // imgUrl: 'img/compat.png',
    description: (
      <>
        <p>
          <Translate>
          Zero change upgrade: from single-cluster to multi-cluster; Seamless integration of existing K8s tool chain
          </Translate>
        </p>
      </>
    ),
  },
  {
    title: <><Translate>Open and Neutral</Translate></>,
    // imgUrl: 'img/open.png',
    description: (
      <>
        <p>
          <Translate>
          Jointly initiated by Internet, finance, manufacturing, teleco, cloud providers, etc. Target for open governance with CNCF
          </Translate>
        </p>
      </>
    ),
    reverse: true,
  },
  {
    title: <><Translate>Avoid Vendor Lock-in</Translate></>,
    // imgUrl: 'img/vendor.png',
    description: (
      <>
        <p>
          <Translate>
          Integration with mainstream cloud providers; Automatic allocation, migration across clusters; Not tied to proprietary vendor orchestration
            </Translate>
        </p>
      </>
    ),
  },
  {
    title: <><Translate>Out of the Box</Translate></>,
    // imgUrl: 'img/box.png',
    description: (
      <>
        <p>
          <Translate>
          Built-in policy sets for scenarios: Active-active, Remote DR, Geo Redundant            
          </Translate>
        </p>
      </>
    ),
    reverse: true,
  },
  {
    title: <><Translate>Fruitful Scheduling Policies</Translate></>,
    // imgUrl: 'img/policy.png',
    description: (
      <>
        <p>
          <Translate>
          Cluster Affinity; Multi Cluster Splitting/Rebalancing; Multi-Dimension HA: Region/AZ/Cluster/Provider
          </Translate>
        </p>
      </>
    ),
  },
  {
    title: <><Translate>Centralized Management</Translate></>,
    // imgUrl: 'img/management.png',
    description: (
      <>
        <p>
          <Translate>
          Cluster location agnostic; Support clusters in public cloud, on-prem or edge          </Translate>
        </p>
      </>
    ),
    reverse: true,
  },
]

export default features
