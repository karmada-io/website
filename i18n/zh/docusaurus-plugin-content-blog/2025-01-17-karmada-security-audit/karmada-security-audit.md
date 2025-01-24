# Karmada 安全审计结果发布

社区文章同步发布于 [OSTIF 博客](https://ostif.org/karmada-audit-complete/)和 [CNCF 博客](https://www.cncf.io/blog/2025/01/16/announcing-the-results-of-the-karmada-security-audit/)。

[OSTIF](https://ostif.org/) 非常荣幸能够分享我们对 Karmada 的安全审计结果。Karmada 是一个开源的 Kubernetes 编排系统，用于跨云和集群无缝运行云原生应用程序。
在 [Shielder](https://www.shielder.com/) 和 [云原生计算基金会 (CNCF)](https://www.cncf.io/) 的帮助下，此项目为用户提供了一个更加安全可靠的开放的多云、多集群 Kubernetes 管理解决方案。

## 审计流程：

Karmada 是 Kubernetes 生态系统的一部分，使用了 Kubernetes 库和实现，除此之外，Karmada 自定义实现及其第三方依赖项的整体安全状况也是本次审计工作的重中之重。
Karmada 利用多个组件、CLI 工具和附加组件来扩展标准 Kubernetes 功能，这些功能可以根据部署配置进行定制。因此，Karmada 的攻击场景相对复杂，有必要执行范围威胁建模以评估潜在的攻击面。利用这个定制的威胁模型，结合手动检查、工具分析和动态审查，[Shielder](https://www.shielder.com/)识别了六个对项目安全有影响的问题。

## 审计结果：

- 6 个发现
  - 1 个高风险，1 个中风险，2 个低风险，2 个提示
- 对未来工作的建议
- 整体安全性的长期改善建议

Karmada 项目的安全团队在整个审计过程中一直积极响应并与 Shielder 积极合作，解决修复了报告中列出的问题。他们为项目所做的工作一丝不苟，在问题修复过程中能考虑到对用户
以及相关的第三方依赖项和项目的影响。他们发布了必要的安全通告，并告知用户本次审计的影响和提供相应的解决方案。OSTIF 祝他们在 CNCF 毕业之路上一切顺利。

**感谢以下个人和团体使这次合作成为可能：**

- Karmada 维护者和社区：特别是 Kevin Wang、Hongcai Ren 和 Zhuang Zhang
- Shielder: Abdel Adim “Smaury” Oisfi, Pietro Tirenna, Davide Silvetti
- 云原生计算基金会

## 参考资料：

1. CNCF (宣布 Karmada 安全审计结果): https://www.cncf.io/blog/2025/01/16/announcing-the-results-of-the-karmada-security-audit/
2. 审计报告: https://ostif.org/wp-content/uploads/2025/01/OSTIF-Karmada-Report-PT-v1.1.pdf
3. Shielder: https://www.shielder.com/blog/2025/01/karmada-security-audit/
