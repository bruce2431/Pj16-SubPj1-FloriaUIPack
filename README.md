# @floria/web

Floria 网页前端的 **UI 基础包**。只装「与业务无关的 UI 底座」，业务模块仍住在 Floria 的 `src/gateway/web-src/`。

## 边界

属于本包：

- 主题令牌（明/暗两套 CSS 变量）与全局基础样式（reset、统一滚动条）
- 图标表 `I`（24 视框描边族 + 16 视框 dsh 产品图标族）与文件类型徽标 `fileIcon`
- 无项目状态的通用 DOM 工具（`esc` / `fromHtml`）
- 管理页通用 UI 组件族 `mgr`（`mgrBrowse` 页面壳 / 分段 / 搜索 / 分类、`mgrGrid` 网格、`mgrDetail` 详情头、`mgrCardHtml` / `mgrActionHtml` / `mgrColor`；纯数据 + 回调，不读 state、不碰网关）

不属于本包（留在 Floria）：

- 会话 / 文件树 / 编辑器 / 评论等卡片与业务模块
- 读 state 的工具（`toast` / 设备判定 / 新会话落项目）
- 任何网关接口

## 构建

```bash
bun build.ts        # 或 bun run build
```

`dist/` 是构建产物，**不进仓库**（`.gitignore` 已排除），克隆后先构建。

| 产物 | 形态 | 用途 |
| --- | --- | --- |
| `dist/index.js` | ESM | npm / 动态 import |
| `dist/floria-web.iife.js` | IIFE（classic script） | 挂 `window.FloriaWeb` |
| `dist/floria-web.css` | CSS | `<link>` 加载主题令牌、基础样式与管理页组件样式 |

## 在 Floria 中加载

1. `bun build.ts` 生成 `dist/`，把其中的 `floria-web.iife.js`、`floria-web.css` 拷到 `Floria/src/gateway/web/webui/`
2. `index.html` 的 `<head>` 里、业务样式之前加
   `<link rel="stylesheet" href="/webui/floria-web.css?v=1">`
3. `app.js` 之前加 `<script src="/webui/floria-web.iife.js?v=1"></script>`
4. 接缝只转调 `window.FloriaWeb`：缺包直接抛错，不回落到本地副本（图标见 `core/icons.js`，管理页 UI 见 `core/mgr-ui.js`）

## 预览

`preview/index.html` 是包的独立验收页：先 `bun build.ts`，再在浏览器打开该文件，检查令牌色块、日夜切换与图标网格。
