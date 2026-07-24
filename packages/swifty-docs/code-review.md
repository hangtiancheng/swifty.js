# @swifty.js/docs Code Review

> 评审对象：`packages/swifty-docs`（`@swifty.js/docs` v0.0.1）
> 参照消费方：`/Users/hangtiancheng/github/26autumn`（GitHub Pages 子路径部署的典型场景）
> 评审日期：2026-07-24

---

## 总体评价

包的三段式架构（配置生成 → Vite 编译 → Preact 运行时）清晰，markdown 编译链路测试充分（7 个 vitest 套件、scanner 549 行用例）。但**发布与消费体验存在系统性缺陷**：Tailwind 扫描面失控、静态托管刷新 404、baseUrl 需要消费方手工到处拼接、密码保护功能一半在包内一半在 demo 里。以下按严重程度逐条展开。

---

## 缺陷 1：Tailwind 扫描面失控 —— theme 未合并为可扫描的单一 chunk

**严重程度：高（性能 + 正确性双重问题）**

### 现状

- `vite.config.ts:120-153` 采用 5 入口 lib 构建（`index` / `compiler` / `vite` / `runtime` / `theme`）。Rollup 把所有组件代码提取进了**共享哈希 chunk** `dist/input-BqFqUeem.js`，而 `dist/theme.js` 只剩 34 行纯 re-export 门面：

  ```js
  // dist/theme.js —— 不含任何 Tailwind class
  import { B, C, l, m, ... } from "./input-BqFqUeem.js";
  ```

  实测：`bg-primary|text-muted-foreground` 在 `input-BqFqUeem.js` 中出现 30 次，在 `theme.js` / `index.js` 中出现 **0 次**。

- 后果一：`README.md:66` 指导的 `@source "@swifty.js/docs/theme.js"` **扫不到任何 utility class**，按文档配置的消费方会直接丢样式。
- 后果二：消费方只能退化为全目录扫描（26autumn `app/main.css:3`）：

  ```css
  @source "../node_modules/@swifty.js/docs/dist";
  ```

  `dist/` 共 33 个文件，还混入了 lib 构建时误拷贝的 `public/` 产物（`pwa-*.png`、favicon 等），Tailwind 每次构建都要扫描 compiler/vite/runtime 等与浏览器无关的大文件，冷启动与 HMR 明显变慢。
- 后果三：`dist/client.css:39` 的 `@source "./theme"` 指向 `dist/theme/` —— **该目录在发布产物中不存在**（源码里指向 `src/theme/`，拷贝到 dist 后失效），属于静默失效的死配置。

### 修复建议

1. **将 theme 入口独立构建为自包含单文件**：`theme` 入口单独跑一遍 `vite build`（或对该入口设置 `output.inlineDynamicImports` / 固定 `manualChunks`），保证所有含 class 字符串的组件代码都落在 `dist/theme.js` 一个文件里。多入口共存时最简单的做法是两段式构建脚本：先构建 `theme`，再构建其余入口并将 `./theme.js` 视为 external。
2. `dist/client.css` 内联 `@source "./theme.js"`（相对自身），消费方只需 `@import "@swifty.js/docs/client.css";` 即可零配置获得正确扫描面。
3. lib 模式下关闭 `publicDir`（`publicDir: false`），杜绝 PNG/favicon 混入 npm 包。
4. 备选方案：发布**预编译 CSS**（对 `src/theme` 跑一次 Tailwind，产出 utilities 快照），消费方无需任何 `@source`；代价是消费方自定义 token 的 tree-shaking 变差，可作为 `client-precompiled.css` 并行提供。

---

## 缺陷 2：GitHub Pages 子路径部署刷新 404 —— 无 SPA fallback

**严重程度：高**

### 现状

- 全仓库检索 `404|fallback|spa|history`：**没有任何 404.html 生成逻辑**。`dist-docs/` 仅有 `index.html`（+ PWA 产物）。
- 运行时是纯 history 路由（`preact-iso`，`app/boot.tsx:248-253`）。用户在 `https://user.github.io/26autumn/fe/react-qa` 刷新时，GitHub Pages 服务器找不到对应物理文件，直接返回平台级 404 —— 应用内的 `NotFound`（`docs-layout.tsx:259-280`）根本没机会执行。
- Vite 的 `base` 与 `DocsConfig.baseUrl` 是两个互不感知的配置（`vite.config.ts:160` 手写 `"/swifty/"`，`swifty-docs.config.ts` 里又写一遍），双份维护、极易漂移。

### 修复建议

1. `swiftyDocsPlugin` 增加 `closeBundle` 钩子：build 结束后把 `index.html` 复制为 `404.html`（GitHub Pages 的标准 SPA fallback 约定）。SPA 场景下 404.html 与 index.html 同构即可正确恢复路由，无需 sessionStorage redirect hack。
2. 更进一步：既然插件已持有 `config`，应在插件的 `config()` 钩子里自动设置 Vite `base: docsConfig.baseUrl`，消灭双份配置（见缺陷 3 的统一方案）。
3. 文档中补充各静态托管平台（GitHub Pages / Netlify `_redirects` / Vercel rewrites）的 fallback 说明。

---

## 缺陷 3：baseUrl 不自动前缀 nav / sidebar —— 消费方手工拼接地狱

**严重程度：高（DX 核心问题）**

### 现状

- baseUrl **只**作用于扫描生成的路由：`src/define-config.ts:89` → `scanDocsDir(docsDir, config.baseUrl)`，`src/scanner.ts:118-119` 拼出 `effectiveBase + routeSegment`；自动 sidebar（`sidebar-generator.ts:75-90`）因链接来自路由而间接携带前缀。
- 但用户手写的 `nav[].link`、sidebar 前缀 key、sidebar item link **全部原样透传**：
  - `src/theme/navbar.tsx:146-149`、`src/theme/sidebar.tsx:166-167`、`src/theme/prev-next.tsx:41,57` 均为裸 `<a href={item.link}>`；
  - `src/theme/context.tsx` 的 Zod 校验（`lib/content.ts:54-68`）不做任何链接变换。
- 结果就是 26autumn 的 `swifty-docs.config.ts`：**28 处** ``` `${baseUrl}fe/react-qa` ``` 式模板字符串拼接，每个 nav / sidebar 链接都要人肉带前缀，且 sidebar 匹配 key（`"/fe/"`）与链接（带前缀）的口径还不一致，心智负担极重。

### 修复建议

1. **在 `defineConfig` 归一化阶段统一加前缀**（推荐，构建期一次搞定）：对 `nav[].link`、`sidebar` 的 key 与所有 item `link`，凡以 `/` 开头且不以 `baseUrl` 开头的相对链接，自动 `joinBase(baseUrl, link)`；外链（`http(s)://`）跳过。幂等处理（已带前缀不重复加），保证向后兼容。
2. 运行时兜底：`DocsProvider` 的 Zod schema 加 `.transform()` 做同样归一化，覆盖不走 `defineConfig` 的自定义场景。
3. 配合缺陷 2 的方案，让 `swiftyDocsPlugin` 自动把 `baseUrl` 写入 Vite `base`，实现「baseUrl 只声明一次」。
4. 目标形态（消费方期望写法）：

   ```ts
   export default defineConfig({
     baseUrl: "/26autumn/",
     nav: [{ text: "前端基础", link: "/fe/react-qa" }],   // 自动变 /26autumn/fe/react-qa
     sidebar: { "/fe/": [ ... ] },                        // 匹配与渲染均自动加前缀
   });
   ```

---

## 缺陷 4：密码保护功能未产品化 —— 弹窗散落在 demo，DENIED_HTML 内联 HTML

**严重程度：中高**

### 现状

功能被劈成三块，只有最底层进了包：

| 环节 | 位置 | 是否包内可用 |
| --- | --- | --- |
| 加密插件 `docsGuardPlugin`（AES-256-GCM + PBKDF2） | `src/vite.ts:123-179` | 已实现但**未导出、未文档化**，demo 的 `vite.config.ts` 也没注册 |
| 解密 `decryptContent` | `src/utils/guard.ts:35-55` | 已从 `src/index.ts:98` 导出 |
| 全部 UX：`PasswordDialog`、sessionStorage 缓存、promise 桥 `askUnlockFn`、`guardedLoadContent`、拒绝页 | `app/boot.tsx:53-257` | **仅存在于 demo**，消费方必须整段复制粘贴 ~200 行 |

具体坏味道：

- `DENIED_HTML`（`app/boot.tsx:53-62`）：~600 字符的内联 HTML 模板字符串，手写 inline-style 布局 + 手写 lock SVG——而主题其他地方全是 lucide 图标 + Tailwind class，风格割裂且无法主题化（注：因为它被塞进 `contentHtml` 走 innerHTML 渲染，所以在当前架构下*被迫*是字符串，这正说明架构该改）。
- `askUnlockFn` 是模块级可变函数指针（`boot.tsx:64`），靠 `useCallback` 副作用赋值，是典型的逃逸 hack。
- 密码明文存 `sessionStorage["docs-guard-pwd"]`（`boot.tsx:222`），至少应存派生 key 或加密 payload 的解密结果缓存。

### 修复建议

1. **主题内置 `<DocsGuard>` 组件**（或直接把守卫逻辑收进 `DocsProvider` / `DocsLayout`）：检测 `__protected` payload → 自动弹出内置 `PasswordDialog`（复用 `ui/dialog.tsx` + `Input` + `Button` + lucide `Lock`）→ 成功后缓存 → 取消时渲染内置 `<AccessDenied>` **JSX 组件**（彻底删除 DENIED_HTML 字符串）。消费方零代码。
2. 从 `src/vite.ts` 公开导出 `docsGuardPlugin` 并写入 README（含 `DOCS_PASSWORD` 环境变量约定、frontmatter `protected: true` 用法）。
3. `guardedLoadContent` 的拦截逻辑收进包内 `loadContent` 包装器，denied 状态改用结构化字段（如 `{ denied: true }`）而不是伪造 `contentHtml`。
4. 缓存策略：sessionStorage 只存「已验证」标记 + 内存中持有 CryptoKey，不落明文密码。

---

## 缺陷 5：shadcn 组件与 lucide 图标使用不充分

**严重程度：中**

### 现状盘点

`src/theme/ui/` 仅 4 个 primitive（Button / Input / Kbd / Dialog），且主题组件大量绕开它们：

| 组件 | 问题 |
| --- | --- |
| `sidebar.tsx` | 全裸 `<button>/<a>/<ul>`（:104-225），折叠触发器应该用 `Button variant="ghost"`，结构上适合 shadcn 的 Collapsible 模式 |
| `toc.tsx` | 全裸元素（:61-108） |
| `prev-next.tsx` | 两张裸 `<a>` 卡片（:39-70），是标准的 shadcn Card 形态 |
| `search-dialog.tsx` | 用了 Dialog/Kbd，但搜索框是裸 `<input>`（:155-167）**没有复用 `ui/Input`**；结果行是裸 `<button>`（:197-238）。整个交互就是 shadcn **Command**（cmdk 命令面板）的形态，应重构为 Command 组合 |
| `docs-layout.tsx` | 移动端抽屉是手写 `role="dialog"` div（:189-227），即 shadcn **Sheet** 的形态，应抽为 Sheet primitive 复用 Dialog 的 portal/overlay/Escape 逻辑 |
| `navbar.tsx` | 桌面搜索触发器是裸 `<button>`（:86-94），旁边同类按钮却用了 `Button`，不一致 |
| `content-renderer.tsx` | `CopyButton` 是裸 `<button class="codeblock-copy">`（:113-121） |
| `ui/dialog.tsx` | `DialogClose` / `DialogTrigger` 是**没有任何开合逻辑的惰性按钮**（:130-148），形同虚设——shadcn/Radix 的语义是它们必须绑定 Dialog 状态（应引入 Dialog Context 供 Trigger/Close 消费）；`DialogAccessibleTitle`（:102-108）未从 `src/index.ts` 导出，barrel 不完整 |
| 图标 | `src/theme/icons.ts:23-43` 已做集中 re-export（19 个 lucide 图标），但 `logo.tsx:23` 绕过它直连 `lucide-preact`；`app/boot.tsx` 的 DENIED_HTML 还有手写 SVG |

### 修复建议（优先级从高到低）

1. 给 `ui/dialog.tsx` 补 Context：让 `DialogTrigger` / `DialogClose` 真正驱动开合，向 shadcn 语义对齐。
2. 新增 primitive：`Card`（供 prev-next / 未来 feature 卡片）、`Sheet`（移动端抽屉）、`Command`（重构 search-dialog）、`Separator`、`ScrollArea`（sidebar 长列表）。
3. 全量替换裸交互元素为 `Button`（利用现有 `ghost` / `icon` variants）、裸输入框为 `Input`。
4. 图标统一走 `icons.ts` 单点出口；删除一切内联 SVG。

---

## 其他发现（评审过程中一并暴露）

按影响排序：

1. **发布产物已损坏 / 过期（阻断级）**：
   - `package.json` 的 `./theme` types 指向 `./dist/theme/index.d.ts`，**该文件不存在**（dist 只有 10 个顶层 .d.ts）；
   - `dist/index.d.ts:34-42` re-export 自 `./theme/context` 等一批**不存在的声明文件**；
   - `dist/index.js` 缺少 `src/index.ts:98` 新增的 `decryptContent` 导出。
   - 说明 dist 与 src 已脱节，`prepublish` 还是废弃钩子名（应为 `prepublishOnly` 或 `prepack`），CI 应加「build 后产物完整性校验」（如 `publint` + `arethetypeswrong`）。
2. **依赖分类错误**：`ejs` / `js-yaml` / `shiki` / `markdown-it*` 是纯构建期依赖却放在 `dependencies`，浏览器消费方会被迫安装；`vite-plugin-pwa` 只有 demo 用到却是 runtime dependency。应梳理为：编译链路依赖保留（vite 插件确实运行时需要），demo-only 依赖移到 devDependencies。
3. **`tsconfig.build.json` 的 `include: ["./src/*"]`** 是单层 glob，`src/theme/**`、`src/utils/**` 只靠 import 间接进入编译图——新增未被引用的文件会静默逃过 typecheck，应改为 `./src/**/*`。
4. **测试盲区**：测试 100% 集中在编译侧，theme 组件、Zod 边界校验、guard 加解密、Vite 插件 resolveId/load 均为 0 覆盖。至少应为 `guard.ts`（纯函数、易测）和 `docsGuardPlugin` 补齐加解密往返测试。
5. `defineConfig` 是**导入即写文件系统的副作用函数**（`define-config.ts:66-72`），虽有「改 md 需重启」的已知约束，但副作用藏在 identity 函数里对使用者不透明，建议至少在 README 显著标注，长期看应改为 Vite 插件 `buildStart` 钩子驱动。

---

## 修复优先级路线图

| 优先级 | 事项 | 对应缺陷 |
| --- | --- | --- |
| P0 | 修复 dist 产物（theme 类型路径、缺失导出、prepublishOnly、publint 校验） | 其他-1 |
| P0 | theme 单文件 chunk + client.css 内置 `@source "./theme.js"` | 缺陷 1 |
| P1 | `defineConfig` 自动前缀 baseUrl（nav/sidebar/key），插件自动同步 Vite `base` | 缺陷 3 |
| P1 | build 产出 404.html SPA fallback | 缺陷 2 |
| P1 | 内置 `<DocsGuard>` + `<AccessDenied>`，导出 `docsGuardPlugin`，删除 DENIED_HTML | 缺陷 4 |
| P2 | Dialog Context、新增 Card/Sheet/Command primitive、裸元素全量收敛 | 缺陷 5 |
| P2 | 依赖分类、tsconfig include、theme 侧测试补齐 | 其他-2/3/4 |
