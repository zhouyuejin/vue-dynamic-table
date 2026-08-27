# 发布到 npm 指南

> 这份指南是给**你本人**用的。`npm publish` 需要你自己的 npm 账号凭据，Codex 没法替你登录。

## 当前包信息

```json
{
  "name": "@zhouyuejin1995/vue-dynamic-table",
  "version": "0.1.0",
  "license": "MIT"
}
```

注意：npm scoped 包默认是私有（需要付费），发布时加 `--access public` 强制公开。`package.json` 的 `publishConfig.access` 已写好。

## 仓库 Secrets（首次发布前需要在 GitHub 仓库配置）

去仓库 `Settings → Secrets and variables → Actions`：

| Secret | 用途 | 怎么拿 |
|---|---|---|
| `NPM_TOKEN` | publish workflow 发布到 npm 用 | `npm login` 后跑 `npm token create` 复制 token |

## 首次发布

### 1. 本地 dry-run 确认产物

```bash
npm install
npm run prepublishOnly        # clean + lint + test + build
npm pack --dry-run            # 看 tarball 里都有啥
```

期望看到：`dist/index.d.ts` / `dist/vue-dynamic-table.es.js` / `dist/vue-dynamic-table.umd.js` / `dist/vue-dynamic-table.css` / `README.md` / `LICENSE`。
不应看到：`src/` / `playground/` / `node_modules/` / `.github/`。

### 2. 确认 registry + 包名可用

```bash
npm config set registry https://registry.npmjs.org
npm view @zhouyuejin1995/vue-dynamic-table
# 404 就可以继续；否则说明名字已被占用
```

### 3. 手动首次发布（可选）

如果还没走 release-please 流程，可以手动首发：

```bash
npm login
npm publish --access public
```

### 4. 之后用 release-please + release.sh 自动化

```bash
# 日常迭代
# ... 改代码，commit，push ...

# 准备发版：跑脚本（自动 test+build+改版本+commit+tag+push）
npm run release:patch   # 0.1.0 → 0.1.1
npm run release:minor   # 0.1.0 → 0.2.0
npm run release:dry     # 只跑测试+构建，验证一遍不发
```

脚本 push 后：
1. `release-please.yml` 在 `main` 分支检测到版本变更 → 自动开/更新一个 "Release" PR
2. 合并该 PR → 自动打 tag `vue-dynamic-table-vX.Y.Z`
3. `publish.yml` 检测到 tag → 测试 + 发布到 npm

## 升级版本号

| 命令 | 场景 |
|---|---|
| `npm run release:patch` | bug 修复，向后兼容 |
| `npm run release:minor` | 新增功能，向后兼容 |
| `npm run release:major` | 破坏性变更 |

显式版本：`./scripts/release.sh 0.2.5`

## 故障排查

### `npm publish` 报 403

没登录或者 token 没权限：
```bash
npm whoami                    # 看是否登录
npm login                     # 重新登录
```

### `npm publish` 报包名冲突

scoped 包名前缀只能是你的 npm 用户名。检查：
```bash
npm profile get username
# 输出应该等于包名 scope
```

### release-please 不开 PR

release-please 默认用 `secrets.GITHUB_TOKEN`，依赖 `permissions` 块给的 `contents: write` / `pull-requests: write`。如果不开 PR，多半是 workflow 没拿到写权限——检查 `.github/workflows/release-please.yml` 顶部的 `permissions:` 段是否还在。

### Actions publish 失败

去 Actions 页查看 build / test 日志。常见：Node 版本不匹配 → 已在 matrix 里固定 18/20/22，宿主环境要注意。
