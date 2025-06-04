---
title: 更正您的信息，以便更好地贡献
---

通过问题、评论、拉取请求等向 [karmada-io](https://github.com/karmada-io) 做出贡献后，您可以在[此处](https://karmada.devstats.cncf.io/d/66/developer-activity-counts-by-companies)查看您的贡献。
如果您发现到公司栏中的信息错误或为空,我们强烈建议您更正它
列如，应该使用 `Huawei Technologies Co. Ltd` 而不是 `HUAWEI`:
![Wrong Information](../resources/contributor/contributions_list.png)

以下是解决此问题的步骤。

## 验证您在 CNCF 系统中的组织信息
首先，访问您的个人资料[页面](https://openprofile.dev/edit/profile)并确保您的组织是准确的。
![organization-check](../resources/contributor/organization_check.png)
* 如果组织不正确，请选择正确的组织。
* 如果您的组织不在列表中，请单击 **Add** 添加您的组织。

## 更新用于计算贡献的 CNCF 存储库
一旦您在 CNCF 系统中验证了您的组织，您必须在 gitdm 中使用更新的从属关系创建拉取请求。
为此，您需要修改两个文件: `company_developers*.txt` 和 `developers_affiliations*.txt`。请参考这个示例拉请求: [PR Example](https://github.com/cncf/gitdm/pull/183)。
拉取请求合并成功后,更改同步可能需要最多四周的时间