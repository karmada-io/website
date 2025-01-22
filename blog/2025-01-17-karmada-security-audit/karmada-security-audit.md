# Announcing the results of the Karmada security audit

Community post cross-posted on the [OSTIF blog](https://ostif.org/karmada-audit-complete/) and [CNCF blog](https://www.cncf.io/blog/2025/01/16/announcing-the-results-of-the-karmada-security-audit/)

[OSTIF](https://ostif.org/) is proud to share the results of our security audit of Karmada. Karmada is an open source Kubernetes orchestration 
system for running cloud-native applications seamlessly across different clouds and clusters. With the help of [Shielder](https://www.shielder.com/) and 
the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/), this project offers users improved open, multi-cloud, multi-cluster Kubernetes management.

## Audit Process:

While Karmada is a part of the Kubernetes ecosystem and therefore utilizes Kubernetes libraries and implementations, the focus 
of this particular work was on the overall security health of the custom implementations of Karmada and its third party dependencies. 
Karmada’s function utilizes multiple components, CLI tools, and add ons to extend the standard Kubernetes features, which can be 
customized from deployment to deployment. This makes Karmada’s attack scenarios complex, so it was necessary to perform a scoped 
threat modelling in order to evaluate potential attack surfaces. Utilizing this custom threat model and a combination of manual, 
tooling, and dynamic review, Shielder identified six findings with security impact on the project. 

## Audit Results:

- 6 Findings
  - 1 High, 1 Medium, 2 Low, 2 Informational
- Recommendations for Future Efforts
- Proposal for Long-term Improvements to Overall Security

The Karmada maintainer team worked quickly and in tandem with Shielder to resolve and fix the reported issues. Their work on behalf of 
the project was meticulous and mindful of users as well as relevant third-party dependencies and projects. They published necessary 
advisories and alerted users as to the impact and resolution of this audit. OSTIF wishes them the best of luck on their journey to 
graduated status with the CNCF.

**Thank you** to the individuals and groups that made this engagement possible:

- Karmada maintainers and community: especially Kevin Wang, Hongcai Ren, and Zhuang Zhang
- Shielder: Abdel Adim “Smaury” Oisfi, Pietro Tirenna, Davide Silvetti
- The Cloud Native Computing Foundation

## References:

1. CNCF (Announcing the results of the Karmada security audit): https://www.cncf.io/blog/2025/01/16/announcing-the-results-of-the-karmada-security-audit/
2. Audit Report: https://ostif.org/wp-content/uploads/2025/01/OSTIF-Karmada-Report-PT-v1.1.pdf
3. Shielder: https://www.shielder.com/blog/2025/01/karmada-security-audit/
