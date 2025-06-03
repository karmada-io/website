---
title: 如何进行 PR 的 Cherry-pick 操作
---

本文档解释了在 `karmada-io/karmada` 仓库的 release branches 中如何管理 cherry-pick 操作。
该任务的常见使用场景是将已经合并到主分支（master）的 PR 回合（backport）到某个发布分支。

> 本文档参考自 [Kubernetes cherry-pick 指南](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-release/cherry-picks.md)。

- [前置条件](#前置条件)
- [适合进行 Cherry-pick 的 PR 类型](#适合进行-cherry-pick-的-pr-类型)
- [发起 Cherry-pick 操作](#发起-cherry-pick-操作)
- [Cherry-pick 的评审流程](#cherry-pick-的评审流程)
- [Cherry-pick 问题排查](#cherry-pick-问题排查)
- [不再受支持版本的 Cherry-pick](#不再受支持版本的-cherry-pick)

## 前置条件

- 一个已合并到 `master` 分支的 Pull Request。
- 发布分支已存在（例如：[`release-1.0`](https://github.com/karmada-io/karmada/tree/release-1.0)）。
- 已配置 Git 和 GitHub Shell 命令行环境，用于向您在 GitHub 上的 Karmada 个人 fork 仓库推送代码，以及向已配置的上游远程仓库（upstream）发起拉取请求（pull request）。该上游仓库追踪 https://github.com/karmada-io/karmada.git 代码库，且环境包含 GITHUB_USER 环境变量。
- 安装了 GitHub CLI 工具（`gh`），参考[安装说明](https://github.com/cli/cli#installation)。
- 一个 GitHub 个人访问令牌（Personal Access Token），需具备 “repo” 和 “read:org” 权限。该令牌仅用于执行 [gh auth login](https://cli.github.com/manual/gh_auth_login) 登录，不涉及 cherry-pick 之外的操作（如创建分支和发起 PR）。

## 适合进行 Cherry-pick 的 PR 类型

相较于主分支每天合并大量 PR，发布分支的 cherry-pick 数量通常少一个到两个数量级，这是由于其需要更高程度的审查。

重点应放在关键性 Bug 修复上，例如：

- 数据丢失

- 内存损坏

- 程序 panic、崩溃或卡死

- 安全性漏洞

如果是某个 alpha 特性的功能问题修复（不涉及数据或安全问题），通常不视为关键性修复。

如果您准备进行 cherry-pick，且该改动不是明显关键的 bug 修复，请慎重考虑。如仍决定继续，请通过以下补充信息增强您的理由：

- 一个描述问题的 GitHub Issue

- 改动范围说明

- 引入该改动的风险分析

- 回归风险评估

- 已完成的测试及新增测试用例说明

- 关键干系人（reviewer/approver）对该变更回移必要性的背书

我们鼓励社区广泛参与对功能增强的讨论。如果某个已发布的特性在某个平台上未启用，这是社区在 master 分支阶段的疏漏，应在后续主版本中修复，而不应通过补丁版本进行回移。

## 发起 Cherry-pick 操作

- 执行 [cherry-pick script](https://github.com/karmada-io/karmada/blob/master/hack/cherry_pick_pull.sh)

  例如，将 PR #1206 从 `master` 回移到远程分支 `upstream/release-1.0`：

  ```shell
  hack/cherry_pick_pull.sh upstream/release-1.0 1206
  ```

  - 注意，该脚本默认您已配置名为 `upstream` 的 git 远程源，指向 Karmada 官方仓库。

  - 每一个目标发布分支需要单独执行一次 cherry-pick 脚本。请确保将修复应用于所有受影响的活跃发布分支。

  - 若未设置环境变量 `GITHUB_TOKEN`，脚本将提示输入 GitHub 密码：此处应提供您的 [个人访问令牌](https://github.com/settings/tokens)，而**非** GitHub 账户密码。为了避免交互式输入，建议将令牌安全地设置为环境变量 `GITHUB_TOKEN`。可参考[此问题评论](https://github.com/github/hub/issues/2655#issuecomment-735836048)。

## Cherry-pick 的评审流程

与普通 Pull Request 一样，cherry-pick PR 也需代码 OWNERS 审核并使用( `/lgtm`) 和 (`/approve`) 进行批准。

同样适用常规 PR 的 Release Note 要求，但 cherry-pick PR 的 Release Note 内容将自动继承自原始 PR（来自 master 分支）。

## Cherry-pick 问题排查

发起 cherry-pick 时可能遇到以下问题：

- cherry-pick PR 无法干净地应用于旧的发布分支：需手动解决冲突。

- PR 包含的代码未通过 CI 检查：需从自动生成的分支中检出、修改问题提交并强制推送回该分支；或者可以新建一个 PR（推荐优先修复原分支，避免冗余 PR）。

## 不再受支持版本的 Cherry-pick

对于已不再由社区支持的发布版本，其是否需要打补丁需社区进行讨论和决策。



[cherry-pick-script]: https://github.com/karmada-io/karmada/blob/master/hack/cherry_pick_pull.sh