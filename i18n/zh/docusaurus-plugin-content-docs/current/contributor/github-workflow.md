---
title: "GitHub 工作流程"
description: 本文概述了 Karmada 项目采用的 GitHub 工作流程。内容包括如何保持本地环境与上游仓库同步、提交规范等建议与提示。
---

> 本文档部分内容来自 [Kubernetes github-workflow](https://github.com/kubernetes/community/blob/master/contributors/guide/github-workflow.md)。

![Git 工作流程](../resources/contributor/git_workflow.png)

### 1. 在云端 Fork

1. 访问 https://github.com/karmada-io/karmada
2. 点击页面右上角的 `Fork` 按钮以创建基于云端的 Fork 仓库。

### 2. 克隆 Fork 到本地存储

根据 Go 的 [工作区指引](https://golang.org/doc/code.html#Workspaces)，请按如下方式将 Karmada 的代码放置在你的 `GOPATH` 中。

定义本地工作目录：

```sh
# 如果你的 GOPATH 包含多个路径，请选择其中一个替代 $GOPATH。
# 必须严格遵循以下目录结构，
# 使用 `$GOPATH/src/github.com/${你的 GitHub 用户名}/` 或其他形式都将无法正常工作。
export working_dir="$(go env GOPATH)/src/github.com/karmada-io"
```

设置 `user` 变量，与 GitHub 上的用户名一致：

```sh
export user={你的 GitHub 用户名}
```

上述变量 `$working_dir` 与 `$user` 在上图中也有所展示。

克隆你的 Fork 仓库：

```sh
mkdir -p $working_dir
cd $working_dir
git clone https://github.com/$user/karmada.git
# 或使用 SSH: git clone git@github.com:$user/karmada.git

cd $working_dir/karmada
git remote add upstream https://github.com/karmada-io/karmada.git
# 或使用 SSH: git remote add upstream git@github.com:karmada-io/karmada.git

# 禁止向上游 master 分支推送
git remote set-url --push upstream no_push

# 验证远程仓库配置是否正确
git remote -v
```

### 3. 创建分支

先同步本地 master 分支至最新：

```sh
# 根据你使用的仓库
# 注意：部分仓库默认分支可能为 'main' 而非 'master'

cd $working_dir/karmada
git fetch upstream
git checkout master
git rebase upstream/master
```

基于 master 创建功能分支：

```sh
git checkout -b myfeature
```

然后在 `myfeature` 分支上进行代码开发。

------

### 4. 保持分支同步

```sh
# 根据你使用的仓库
# 注意：部分仓库默认分支可能为 'main' 而非 'master'

# 在 myfeature 分支上执行
git fetch upstream
git rebase upstream/master
```

请勿使用 `git pull` 替代上述 `fetch` / `rebase` 操作。
`git pull` 默认执行合并操作，可能会引入不必要的合并提交，使提交历史杂乱，违反“每个提交应具备独立意义与可读性”的原则。
你可以通过以下方式修改 `.git/config` 文件，改变 `git pull` 的行为：

```sh
git config branch.autoSetupRebase always
# 或使用：git pull --rebase
```

### 5. 提交代码

提交你的更改：

```sh
git commit --signoff
```

你可能需要多次编辑 / 构建 / 测试代码，可通过 `commit --amend` 修改上次提交内容。

### 6. 推送代码

准备好进行评审（或备份工作）后，将你的分支推送至 GitHub：

```sh
git push -f ${your_remote_name} myfeature
```

### 7. 创建 Pull Request

1. 访问你的 Fork 仓库：`https://github.com/$user/karmada`
2. 点击你 `myfeature` 分支旁边的 `Compare & Pull Request` 按钮

_如你拥有上游仓库的写权限_，请勿使用 GitHub 网页 UI 创建 PR，
因为这样会将 PR 分支创建在主仓库，而非你的 Fork 仓库中。

#### 获取代码评审

创建 PR 后，系统会自动分配一名或多名评审人。
评审者将进行全面的代码审查，关注以下方面：

- 正确性
- 潜在 Bug
- 优化建议
- 文档与注释
- 代码风格

根据评审意见，对代码进行相应修改，并提交到同一分支。

小型 PR 易于评审，大型 PR 难以评审。

#### 压缩提交（Squash Commits）

评审通过后，应对提交进行 squash 以准备合并。

PR 中剩余的提交应代表有意义的阶段性成果或工作单元。
合理使用提交有助于清晰展现开发与审查过程。

在合并 PR 前，请对以下类型的提交进行 squash：

- 修改 / 评审反馈修复
- 拼写修正
- 合并 / Rebase 提交
- WIP（工作中）提交

建议每个提交都能独立编译并通过测试（尽量做到），但不是硬性要求。
尤其是合并提交（merge commits）必须移除，因为它们无法通过测试。

执行 [交互式 rebase](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) 进行 squash：

1. 查看当前分支状态：

```
git status
```

输出示例：

```
On branch your-contribution
Your branch is up to date with 'origin/your-contribution'.
```

2. 启动交互式 rebase，可以使用某一提交的哈希值，或使用 `HEAD~<n>` 回溯指定数量的提交：

```
git rebase -i HEAD~3
```

输出示例：

```
  pick 2ebe926 Original commit
  pick 31f33e9 Address feedback
  pick b0315fe Second unit of work

  # Rebase 7c34fc9..b0315ff onto 7c34fc9 (3 commands)
  #
  # Commands:
  # p, pick <commit> = use commit
  # r, reword <commit> = use commit, but edit the commit message
  # e, edit <commit> = use commit, but stop for amending
  # s, squash <commit> = use commit, but meld into previous commit
  # f, fixup <commit> = like "squash", but discard this commit's log message

  ...
```

3. 使用命令行文本编辑器，将需 squash 的提交前的 `pick` 修改为 `squash`，保存退出：

```
pick 2ebe926 初始提交
squash 31f33e9 修复审查意见
pick b0315fe 第二个功能点
```

保存后输出类似：

```
  [detached HEAD 61fdded] Second unit of work
   Date: Thu Mar 5 19:01:32 2020 +0100
   2 files changed, 15 insertions(+), 1 deletion(-)

   ...

  Successfully rebased and updated refs/heads/master.
```

4. 强制推送更新后的提交：

```
git push --force
```

如需批量进行自动化修复（如自动格式化文档），
建议将工具变更与批量修改分别放在不同的提交中，以便于审查。

### 合并提交

当 PR 获得评审者与批准者的批准后，且提交已 squash，PR 将被自动合并。

如提交未 squash，可能会被要求在合并前进行 squash 操作。

### 回滚提交（Revert）

若需回滚某次提交，可参考以下指引。

注意：如你拥有上游写权限，请勿使用 GitHub 的 `Revert` 按钮创建 PR，
该操作会将 PR 分支建在主仓库而非你的 Fork。

步骤如下：

- 创建新分支并与上游同步：

```
# 根据你使用的仓库
# 默认分支可能为 'main'，请按实际情况替换

# 创建一个分支
git checkout -b myrevert

# 将分支与上游同步
git fetch upstream
git rebase upstream/master
```

- 若需回滚的提交为：

  - **合并提交**：

    ```
    # SHA 为需回滚的合并提交哈希
    git revert -m 1 SHA
    ```

  - **单次提交**：

    ```sh
    # SHA 为需回滚的合并提交哈希
    git revert SHA
    ```

- 系统将创建一个新提交用于还原更改。将其推送至远程：

```sh
git push ${your_remote_name} myrevert
```

- 使用该分支 [创建 Pull Request](#7-create-a-pull-request)