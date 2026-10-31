# Planet Port 品牌网站 v2 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Planet Port 品牌网站 v2：一个入口选择页 + 「现代」「未来」两套完全独立的单页介绍页面。

**Architecture:** 原生 HTML/CSS/JS + Vite 多页构建，三页（index/modern/future）各自持有独立 HTML/CSS/JS，互不共享代码。素材从 v1 仓库 `../planet-port-website/public/assets/` 拷贝复用。

**Tech Stack:** 原生 HTML5 / CSS3 / JavaScript（ES Module），Vite 5（仅 devDependency），无运行时依赖、无 UI 框架、无外部字体/图片 CDN。

## Global Constraints

- 项目根目录：`/Users/zivyuan/GoziLib/Zerotier/planet-port-website-2`
- **不编写自动化测试用例**（用户全局规则明确：未要求时不得自动添加测试）。每个任务的验证方式为：`npm run dev` 启动后 `curl` 检查页面可达、`npm run build` 产物检查、断言文件内容。用户指令优先于 TDD 流程。
- 事实层（两套页面必须一致，不得虚构）：
  - 移动端：iOS ✅ / Android ✅ / 鸿蒙 ✅
  - 桌面端：macOS CLI ✅ 已发布（特权 daemon + 薄客户端架构，「GUI 不开、隧道照跑」）、macOS GUI 📐 规划中（Tauri 2 托盘常驻）、Linux 🚧 适配中（数据面已通，服务层 systemd 与安装脚本待适配）、Windows 📐 规划中
  - 核心能力四项：多 Planet 并存（别名、启停、导入、导出）/ 多网络同连（每 Planet 独立身份，join/leave，跨 Planet 聚合查询）/ 路由与 DNS 掌控（routeViaZeroTier 开关、dnsMode=none|network|custom）/ Moon 支持（orbit/deorbit、导入 .moon 文件）
  - 仓库入口：`https://github.com/planet-port`
  - 页脚免责：「非官方客户端，与 ZeroTier, Inc. 无隶属关系」
- **未来风用词规则：科幻词汇（跃迁/星域/座舱/航线）仅用于章节标题与视觉氛围；功能名称与功能描述必须用真实原词**（如「多 Planet 并存」「Moon 支持：orbit / deorbit、导入 .moon 文件」）。
- 桌面端 CLI 命令示例必须从 `/Users/zivyuan/GoziLib/Zerotier/planet-port-desktop/COMMANDS.md` 摘取真实命令，不得杜撰。
- 系统字体栈，零外部网络请求（离线可完整呈现）。
- 动效须尊重 `prefers-reduced-motion: reduce`。
- Git 提交遵循 Conventional Commits（type/scope 英文，description/Body 中文，必须有 Body，禁止 Co-authored-by）。
- 桌面端命令一律 `git --no-pager`。

## 素材清单（Task 1 拷贝，后续任务引用此路径）

源：`/Users/zivyuan/GoziLib/Zerotier/planet-port-website/public/assets/`
→ 目标：`<root>/public/assets/`

- `planet-port-logo.webp`
- `screenshots/ios-home.webp`、`screenshots/ios-import.webp`、`screenshots/ios-network.webp`
- `screenshots/android-home.webp`、`screenshots/android-import.webp`、`screenshots/android-network.webp`、`screenshots/android-settings.webp`

页面内引用路径（Vite 约定）：`/assets/planet-port-logo.webp`、`/assets/screenshots/ios-home.webp` 等。

---

### Task 1: 项目脚手架与素材拷贝

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`
- Create: `public/assets/`（从 v1 拷贝）

**Interfaces:**
- Produces: 可运行的 `npm run dev`（端口 5173）与 `npm run build`；素材路径 `/assets/...` 供后续任务引用。

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "planet-port-website-2",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js（多页三入口）**

```js
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        modern: resolve(__dirname, 'modern.html'),
        future: resolve(__dirname, 'future.html'),
      },
    },
  },
})
```

- [ ] **Step 3: 创建 .gitignore**

```
node_modules/
dist/
.DS_Store
```

- [ ] **Step 4: 拷贝素材**

```bash
mkdir -p public/assets/screenshots
cp /Users/zivyuan/GoziLib/Zerotier/planet-port-website/public/assets/planet-port-logo.webp public/assets/
cp /Users/zivyuan/GoziLib/Zerotier/planet-port-website/public/assets/screenshots/*.webp public/assets/screenshots/
ls public/assets public/assets/screenshots
```

Expected: 1 个 logo + 7 张截图就位。

- [ ] **Step 5: 安装依赖并验证构建**

```bash
npm install
npm run build
ls dist
```

Expected: 构建成功（index/modern/future 三个入口产物；modern/future html 此时还不存在会报错的话，先创建两个只含 `<!doctype html><title>placeholder</title>` 的空文件让构建通过，后续任务覆写）。

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js .gitignore public/
git commit -m "chore: 初始化 Vite 多页脚手架并复用 v1 品牌素材

三入口（index/modern/future）构建配置，素材从 v1 仓库拷贝，
无运行时依赖，保持离线可完整呈现。"
```

---

### Task 2: 入口选择页

**Files:**
- Create: `index.html`
- Create: `styles/entry.css`
- Create: `scripts/entry.js`

**Interfaces:**
- Produces: `modern.html`、`future.html` 的链接入口；无对外接口。

- [ ] **Step 1: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planet Port — 选择一种风格</title>
  <meta name="description" content="Planet Port 品牌网站：现代与未来两种风格方案。" />
  <link rel="icon" href="/assets/planet-port-logo.webp" />
  <link rel="stylesheet" href="/styles/entry.css" />
</head>
<body>
  <header class="entry-header">
    <img src="/assets/planet-port-logo.webp" alt="Planet Port logo" width="40" height="40" />
    <div>
      <strong>Planet Port</strong>
      <span>跨平台 ZeroTier 多行星客户端</span>
    </div>
  </header>

  <main class="entry-split">
    <a class="pane pane--modern" href="/modern.html">
      <span class="pane__index">A</span>
      <h2>现代</h2>
      <p>MODERN</p>
      <span class="pane__desc">浅色 · 留白 · 克制精致</span>
      <span class="pane__cta">进入 →</span>
    </a>
    <a class="pane pane--future" href="/future.html">
      <span class="pane__index">B</span>
      <h2>未来</h2>
      <p>FUTURE</p>
      <span class="pane__desc">深空 · 轨道 · 沉浸炫技</span>
      <span class="pane__cta">进入 →</span>
    </a>
  </main>

  <footer class="entry-footer">非官方客户端，与 ZeroTier, Inc. 无隶属关系</footer>
  <script type="module" src="/scripts/entry.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建 styles/entry.css**

左右分屏：左半浅色（`#FAFAFA` 底、深字），右半深空（`#050508` 底、浅字带霓虹青点缀）。核心规则：

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body { height: 100%; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  display: flex;
  flex-direction: column;
  background: #101014;
  color: #e8e8ec;
}

.entry-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 32px;
}
.entry-header span { display: block; font-size: 12px; color: #9a9aa5; }

.entry-split {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.pane {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: flex-grow .3s ease;
}

.pane--modern { background: #FAFAFA; color: #17171c; }
.pane--modern .pane__desc { color: #6b6b76; }
.pane--modern .pane__cta { color: #0a6cf1; }

.pane--future {
  background: radial-gradient(ellipse at 50% 120%, #0d1428 0%, #050508 60%);
  color: #e8f4ff;
}
.pane--future .pane__desc { color: #6f7d95; }
.pane--future .pane__cta { color: #35e0ff; }

.pane h2 { font-size: clamp(40px, 6vw, 72px); font-weight: 700; letter-spacing: .08em; }
.pane p { font-size: 14px; letter-spacing: .5em; opacity: .55; text-transform: uppercase; }
.pane__index {
  position: absolute;
  top: 28px;
  left: 32px;
  font-size: 13px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  opacity: .4;
}
.pane__cta { margin-top: 18px; font-size: 14px; }

/* hover：分屏扩张 + cta 位移 */
.pane:hover { flex-grow: 1.15; }
.pane:hover .pane__cta { transform: translateX(6px); }
.pane__cta { transition: transform .25s ease; display: inline-block; }

.entry-footer {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #6b6b76;
  background: #101014;
}

/* 移动端：上下分屏 */
@media (max-width: 720px) {
  .entry-split { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
  .pane h2 { font-size: 40px; }
}

@media (prefers-reduced-motion: reduce) {
  .pane, .pane__cta { transition: none; }
}
```

- [ ] **Step 3: 创建 scripts/entry.js（键盘快捷访问）**

```js
// A / B 键快速进入对应风格页
document.addEventListener('keydown', (e) => {
  if (e.key === 'a' || e.key === 'A') location.href = '/modern.html'
  if (e.key === 'b' || e.key === 'B') location.href = '/future.html'
})
```

- [ ] **Step 4: 验证**

```bash
npm run dev &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/
curl -s http://127.0.0.1:5173/ | grep -c "pane--"
kill %1
```

Expected: `200` 与 `2`（两个分屏 pane）。

- [ ] **Step 5: Commit**

```bash
git add index.html styles/entry.css scripts/entry.js
git commit -m "feat(entry): 添加现代/未来风格选择入口页

左右分屏一键进入两套风格方案，支持 A/B 键盘快捷访问，
移动端降级为上下分屏。"
```

---

### Task 3: modern.html 页面结构与文案

**Files:**
- Create: `modern.html`（覆写 Task 1 的占位文件）

**Interfaces:**
- Produces: `modern.html`，其 DOM 结构（`data-reveal` 属性、`.screenshot-strip`、`.mobile-nav-toggle` 等 class）供 Task 4 的 CSS/JS 挂载。
- Consumes: 素材 `/assets/...`；桌面端命令需先读 `/Users/zivyuan/GoziLib/Zerotier/planet-port-desktop/COMMANDS.md` 摘 3 条真实命令填入 `<!-- CLI 命令块 -->` 处（示例占位为 planet import / planet use / net join 相关，以 COMMANDS.md 实际语法为准）。

- [ ] **Step 1: 写入完整 modern.html**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planet Port — 行星管理，装进口袋</title>
  <meta name="description" content="Planet Port：开源跨平台 ZeroTier 多行星客户端。多 Planet 并存、多网络同连、路由与 DNS 掌控。" />
  <link rel="icon" href="/assets/planet-port-logo.webp" />
  <link rel="stylesheet" href="/styles/modern.css" />
</head>
<body>
  <nav class="nav">
    <a class="nav__brand" href="#top">
      <img src="/assets/planet-port-logo.webp" alt="Planet Port" width="28" height="28" />
      <span>Planet Port</span>
    </a>
    <div class="nav__links" id="navLinks">
      <a href="#concept">概念</a>
      <a href="#features">能力</a>
      <a href="#platforms">双端</a>
      <a href="#flow">流程</a>
      <a href="#matrix">平台</a>
      <a href="#roadmap">路线图</a>
      <a class="nav__github" href="https://github.com/planet-port" target="_blank" rel="noopener">GitHub</a>
    </div>
    <button class="nav__toggle" id="navToggle" aria-label="打开菜单" aria-expanded="false">☰</button>
  </nav>

  <!-- 01 首屏（深色对比区） -->
  <header class="hero" id="top">
    <div class="hero__copy">
      <p class="hero__eyebrow">开源 · 跨平台 ZeroTier 客户端</p>
      <h1>行星管理，<br />装进口袋。</h1>
      <p class="hero__sub">
        Planet Port 让多 Planet 组网变成一次点击——官方与私有 Planet 同机并存，
        网络、路由与 DNS 全程掌控。
      </p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="#matrix">下载 App</a>
        <a class="btn btn--ghost" href="https://github.com/planet-port" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
    <div class="hero__visual" aria-hidden="true">
      <img class="hero__shot hero__shot--a" src="/assets/screenshots/ios-home.webp" alt="" />
      <img class="hero__shot hero__shot--b" src="/assets/screenshots/android-home.webp" alt="" />
    </div>
  </header>

  <main>
    <!-- 02 概念 -->
    <section class="section" id="concept" data-reveal>
      <div class="section__head">
        <span class="section__no">01</span>
        <h2>为什么需要 Planet Port</h2>
      </div>
      <p class="lead">
        ZeroTier 的世界由 Planet 根服务器指引方向。官方只有一颗；自建私有 Planet 之后，
        每次切换都要手改文件、重启服务。Planet Port 把这件事变成一个 App：
        导入、命名、启停、切换，全部一处完成。
      </p>
    </section>

    <!-- 03 核心能力 -->
    <section class="section" id="features" data-reveal>
      <div class="section__head">
        <span class="section__no">02</span>
        <h2>核心能力</h2>
      </div>
      <div class="cards">
        <article class="card">
          <h3>多 Planet 并存</h3>
          <p>官方与多份私有 Planet 同机共存，别名管理、一键启停，互不干扰。</p>
        </article>
        <article class="card">
          <h3>多网络同连</h3>
          <p>每 Planet 独立身份，join / leave 自如，网络与 peers 跨 Planet 聚合查询。</p>
        </article>
        <article class="card">
          <h3>路由与 DNS 掌控</h3>
          <p>默认路由开关、dnsMode 三种模式，陈述式配置，脚本友好。</p>
        </article>
        <article class="card">
          <h3>Moon 支持</h3>
          <p>orbit / deorbit、导入 .moon 文件，中继节点一样纳入管理。</p>
        </article>
      </div>
    </section>

    <!-- 04 双端介绍（并重两栏） -->
    <section class="section" id="platforms" data-reveal>
      <div class="section__head">
        <span class="section__no">03</span>
        <h2>同一件事，两种方式</h2>
      </div>
      <p class="lead">移动端与桌面端做的是同一件事——行星管理，只是交互方式不同。</p>
      <div class="duo">
        <div class="duo__col">
          <h3>移动端 · 触控即达</h3>
          <p>iOS / Android / 鸿蒙原生 App。行星管理、网络开关、peers 状态，指尖完成。</p>
          <div class="screenshot-strip" role="list">
            <figure role="listitem"><img src="/assets/screenshots/ios-home.webp" alt="iOS 首页" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/ios-import.webp" alt="iOS 导入 Planet" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/ios-network.webp" alt="iOS 网络" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-home.webp" alt="Android 首页" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-import.webp" alt="Android 导入 Planet" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-network.webp" alt="Android 网络" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-settings.webp" alt="Android 设置" loading="lazy" /></figure>
          </div>
        </div>
        <div class="duo__col">
          <h3>桌面端 · 命令行常驻</h3>
          <p>
            macOS CLI 已发布：特权 daemon 持有核心与虚拟网卡，CLI 只是薄客户端——
            <strong>GUI 不开、隧道照跑</strong>。GUI 与 Linux / Windows 在路上。
          </p>
          <pre class="cli"><code><!-- CLI 命令块：从 COMMANDS.md 摘 3 条真实命令 --></code></pre>
        </div>
      </div>
    </section>

    <!-- 05 使用流程 -->
    <section class="section section--alt" id="flow" data-reveal>
      <div class="section__head">
        <span class="section__no">04</span>
        <h2>三步，接入你的网络</h2>
      </div>
      <ol class="steps">
        <li><span>Step 1</span><h3>导入 Planet</h3><p>本地文件或 URL 导入，起一个好记的别名。</p></li>
        <li><span>Step 2</span><h3>加入网络</h3><p>输入 Network ID，join 并随时 leave。</p></li>
        <li><span>Step 3</span><h3>一键切换</h3><p>在任意 Planet 之间即时切换，无需重启服务。</p></li>
      </ol>
    </section>

    <!-- 06 平台矩阵 -->
    <section class="section" id="matrix" data-reveal>
      <div class="section__head">
        <span class="section__no">05</span>
        <h2>支持平台</h2>
      </div>
      <table class="matrix">
        <thead><tr><th>平台</th><th>形态</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td>iOS</td><td>App</td><td class="ok">✅ 可用</td></tr>
          <tr><td>Android</td><td>App</td><td class="ok">✅ 可用</td></tr>
          <tr><td>鸿蒙</td><td>App</td><td class="ok">✅ 可用</td></tr>
          <tr><td>macOS</td><td>CLI</td><td class="ok">✅ 可用</td></tr>
          <tr><td>macOS</td><td>GUI</td><td class="plan">📐 规划中</td></tr>
          <tr><td>Linux</td><td>CLI</td><td class="wip">🚧 适配中</td></tr>
          <tr><td>Windows</td><td>CLI / GUI</td><td class="plan">📐 规划中</td></tr>
        </tbody>
      </table>
    </section>

    <!-- 07 路线图 -->
    <section class="section section--alt" id="roadmap" data-reveal>
      <div class="section__head">
        <span class="section__no">06</span>
        <h2>路线图</h2>
      </div>
      <ol class="timeline">
        <li class="timeline__item wip"><span>🚧 进行中</span><h3>Linux 适配</h3><p>数据面已通（多 planet 上线、join / 路由、跨节点连通已实机验证），服务层 systemd 与安装脚本适配中。</p></li>
        <li class="timeline__item plan"><span>📐 规划中</span><h3>macOS GUI</h3><p>Tauri 2 托盘常驻，作为既有 daemon 的薄客户端。</p></li>
        <li class="timeline__item plan"><span>📐 规划中</span><h3>Windows</h3><td></td><p>CLI 与 GUI，延续 daemon + 薄客户端架构。</p></li>
        <li class="timeline__item plan"><span>📐 规划中</span><h3>安装包分发</h3><p>deb / MSI 等系统安装包，逐步补齐。</p></li>
      </ol>
      <p class="note">以各仓库 README 为准，不承诺时间点。</p>
    </section>
  </main>

  <footer class="footer">
    <img src="/assets/planet-port-logo.webp" alt="Planet Port" width="32" height="32" />
    <div class="footer__links">
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">GitHub</a>
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">planet-port-ios</a>
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">planet-port-android</a>
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">planet-port-desktop</a>
    </div>
    <p>非官方客户端，与 ZeroTier, Inc. 无隶属关系。</p>
  </footer>

  <a class="style-switch" href="/future.html" title="切换到未来风格">⌁ 未来风</a>
  <script type="module" src="/scripts/modern.js"></script>
</body>
</html>
```

注意：上面 timeline 第三项里误植了一个 `<td></td>`，写入时删掉。

- [ ] **Step 2: 摘取真实 CLI 命令**

读 `/Users/zivyuan/GoziLib/Zerotier/planet-port-desktop/COMMANDS.md`，挑 3 条能体现「导入 Planet → 切换 → 加入网络」流程的真实命令，替换 `<!-- CLI 命令块 -->`。格式为 `$ ` 前缀 + 命令，每行一条，HTML 转义（`&lt;` 等）。

- [ ] **Step 3: 验证**

```bash
npm run dev &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/modern.html
curl -s http://127.0.0.1:5173/modern.html | grep -c "data-reveal"
grep -c "CLI 命令块" modern.html
kill %1
```

Expected: `200`；`data-reveal` 计数 `6`；最后一个 grep 返回 `0`（占位已替换；grep 无匹配时退出码非 0，`|| echo 0` 处理）。

- [ ] **Step 4: Commit**

```bash
git add modern.html
git commit -m "feat(modern): 搭建现代风单页结构与全量文案

八个章节（首屏/概念/能力/双端/流程/平台/路线图/页脚），
移动与桌面双端并重呈现，CLI 命令取自 desktop 仓库真实语法，
路线图与平台状态如实标注。"
```

---

### Task 4: modern.css 样式与 modern.js 交互

**Files:**
- Create: `styles/modern.css`
- Create: `scripts/modern.js`

**Interfaces:**
- Consumes: Task 3 的 DOM（class 名见其 HTML）。
- Produces: 完整可浏览的 modern 页面。

- [ ] **Step 1: 写入 styles/modern.css**

设计令牌与关键组件规格（完整写出；其余章节样式按同一令牌体系补齐）：

```css
/* ===== 设计令牌 ===== */
:root {
  --bg: #FAFAFA;
  --bg-dark: #0e0f13;        /* 首屏深色 */
  --surface: #ffffff;
  --text: #17171c;
  --text-2: #6b6b76;
  --line: #e6e6ea;
  --brand: #0a6cf1;           /* 品牌蓝 */
  --brand-ink: #ffffff;
  --radius: 14px;
  --shadow: 0 1px 2px rgba(23,23,28,.04), 0 8px 24px rgba(23,23,28,.06);
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --sans: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  --maxw: 1080px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--sans); background: var(--bg); color: var(--text); line-height: 1.7; }
img { max-width: 100%; display: block; }
a { color: inherit; }

/* ===== 导航 ===== */
.nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px; background: rgba(250,250,250,.85);
  backdrop-filter: blur(12px); border-bottom: 1px solid var(--line);
}
.nav__brand { display: flex; align-items: center; gap: 10px; font-weight: 700; text-decoration: none; }
.nav__links { display: flex; gap: 26px; font-size: 14px; }
.nav__links a { text-decoration: none; color: var(--text-2); }
.nav__links a:hover { color: var(--text); }
.nav__github {
  border: 1px solid var(--line); border-radius: 999px; padding: 5px 14px;
}
.nav__toggle { display: none; }

/* ===== 首屏（深色对比） ===== */
.hero {
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center;
  max-width: var(--maxw); margin: 0 auto; padding: 96px 32px;
  background: var(--bg-dark); color: #f2f3f7;
  /* 页面级：hero 区独立深色带 */
}
.hero { border-radius: 0; }
.hero__eyebrow { font-family: var(--mono); font-size: 13px; color: #7fa8ff; letter-spacing: .12em; }
.hero h1 { font-size: clamp(38px, 5.5vw, 64px); line-height: 1.15; letter-spacing: -.01em; margin: 14px 0 18px; }
.hero__sub { color: #b9bcc7; max-width: 44ch; }
.hero__cta { display: flex; gap: 14px; margin-top: 30px; }
.btn { display: inline-block; padding: 11px 22px; border-radius: 10px; font-size: 15px; text-decoration: none; }
.btn--primary { background: var(--brand); color: var(--brand-ink); }
.btn--primary:hover { filter: brightness(1.08); }
.btn--ghost { border: 1px solid rgba(255,255,255,.25); color: #f2f3f7; }
.hero__visual { position: relative; min-height: 420px; }
.hero__shot {
  position: absolute; width: 46%; border-radius: 22px; border: 1px solid rgba(255,255,255,.14);
  box-shadow: 0 24px 60px rgba(0,0,0,.45);
}
.hero__shot--a { left: 4%;  top: 0;    transform: rotate(-3deg); }
.hero__shot--b { right: 4%; bottom: 0; transform: rotate(3deg); }

/* ===== 章节通用 ===== */
.section { max-width: var(--maxw); margin: 0 auto; padding: 88px 32px; }
.section--alt { background: #f1f2f5; }  /* 注意：section 有 max-width，alt 底色需用 body 级处理，见 Step 2 说明 */
.section__head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 36px; }
.section__no { font-family: var(--mono); font-size: 14px; color: var(--brand); }
.section__head h2 { font-size: clamp(26px, 3.4vw, 36px); letter-spacing: -.01em; }
.lead { max-width: 62ch; font-size: 17px; color: var(--text-2); }

/* ===== 能力卡片 ===== */
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.card {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 26px 22px; box-shadow: var(--shadow);
  transition: transform .18s ease, box-shadow .18s ease;
}
.card:hover { transform: translateY(-3px); box-shadow: 0 4px 8px rgba(23,23,28,.05), 0 16px 36px rgba(23,23,28,.09); }
.card h3 { font-size: 17px; margin-bottom: 8px; }
.card p { font-size: 14px; color: var(--text-2); }

/* ===== 双端两栏 ===== */
.duo { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.duo__col h3 { font-size: 19px; margin-bottom: 10px; }
.duo__col p { color: var(--text-2); margin-bottom: 20px; }
.screenshot-strip {
  display: flex; gap: 14px; overflow-x: auto; padding-bottom: 10px;
  scroll-snap-type: x mandatory;
}
.screenshot-strip figure { flex: 0 0 auto; scroll-snap-align: start; }
.screenshot-strip img {
  height: 380px; width: auto; border-radius: 18px; border: 1px solid var(--line);
  box-shadow: var(--shadow);
}
.cli {
  background: #0e0f13; color: #d6e2ff; border-radius: 12px;
  padding: 20px 22px; font-family: var(--mono); font-size: 13.5px;
  overflow-x: auto; line-height: 1.9;
}

/* ===== 三步流程 ===== */
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; list-style: none; }
.steps li { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 26px 22px; }
.steps span { font-family: var(--mono); font-size: 12.5px; color: var(--brand); }
.steps h3 { margin: 8px 0 6px; font-size: 17px; }
.steps p { font-size: 14px; color: var(--text-2); }

/* ===== 平台矩阵 ===== */
.matrix { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
.matrix th, .matrix td { padding: 13px 20px; text-align: left; font-size: 14.5px; border-bottom: 1px solid var(--line); }
.matrix th { font-size: 13px; color: var(--text-2); background: #f6f6f8; }
.matrix .ok { color: #0d7a3f; }
.matrix .wip { color: #a26512; }
.matrix .plan { color: var(--text-2); }

/* ===== 路线图时间轴 ===== */
.timeline { list-style: none; display: grid; gap: 0; }
.timeline__item { position: relative; padding: 0 0 30px 30px; border-left: 2px solid var(--line); }
.timeline__item:last-child { border-left-color: transparent; padding-bottom: 0; }
.timeline__item::before {
  content: ""; position: absolute; left: -6px; top: 4px; width: 10px; height: 10px;
  border-radius: 50%; background: var(--line);
}
.timeline__item.wip::before { background: #a26512; }
.timeline__item span { font-family: var(--mono); font-size: 12.5px; }
.timeline__item.wip span { color: #a26512; }
.timeline__item.plan span { color: var(--text-2); }
.timeline__item h3 { font-size: 16.5px; margin: 4px 0; }
.timeline__item p { font-size: 14px; color: var(--text-2); max-width: 60ch; }
.note { margin-top: 20px; font-size: 13px; color: var(--text-2); }

/* ===== 页脚 ===== */
.footer {
  background: #0e0f13; color: #b9bcc7; text-align: center;
  padding: 48px 32px; display: flex; flex-direction: column; gap: 14px; align-items: center;
}
.footer__links { display: flex; gap: 22px; font-size: 14px; }
.footer__links a { color: #d6d9e2; text-decoration: none; }
.footer__links a:hover { color: #fff; }
.footer p { font-size: 12.5px; color: #7c7f8b; }

/* ===== 风格切换按钮 ===== */
.style-switch {
  position: fixed; right: 18px; bottom: 18px; z-index: 60;
  background: var(--bg-dark); color: #d6e2ff; text-decoration: none;
  font-size: 13px; padding: 9px 14px; border-radius: 999px;
  border: 1px solid rgba(255,255,255,.18); box-shadow: var(--shadow);
}
.style-switch:hover { filter: brightness(1.2); }

/* ===== 滚动显现（JS 配合） ===== */
[data-reveal] { opacity: 0; transform: translateY(18px); transition: opacity .5s ease, transform .5s ease; }
[data-reveal].is-in { opacity: 1; transform: none; }

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; padding: 64px 24px; }
  .hero__visual { min-height: 300px; }
  .cards, .steps { grid-template-columns: 1fr 1fr; }
  .duo { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .nav__links {
    display: none; position: absolute; top: 100%; left: 0; right: 0;
    flex-direction: column; gap: 0; background: var(--surface);
    border-bottom: 1px solid var(--line); padding: 8px 24px 16px;
  }
  .nav__links.open { display: flex; }
  .nav__links a { padding: 10px 0; }
  .nav__toggle { display: block; background: none; border: none; font-size: 22px; cursor: pointer; }
  .section { padding: 64px 24px; }
  .cards, .steps { grid-template-columns: 1fr; }
  .screenshot-strip img { height: 300px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
  [data-reveal] { opacity: 1; transform: none; }
}
```

- [ ] **Step 2: 处理 section--alt 底色的结构性问题**

`.section` 有 `max-width`，`--alt` 底色直接加在 section 上无法通栏。两种做法任选其一（推荐 a）：
a. 把 `section--alt` 的样式改为给 `<body>` 上对应区间的背景（不可行——body 无法按区间着色）。实际做法：`.section--alt` 不做通栏底色，改为给该 section 加 `background: transparent`，并在 CSS 中新增一条通栏包裹规则：将 alt section 用 `box-shadow: 0 0 0 100vmax #f1f2f5; clip-path: inset(0 -100vmax);` 实现通栏底色。写入：

```css
.section--alt { box-shadow: 0 0 0 100vmax #f1f2f5; clip-path: inset(0 -100vmax); }
```

（用此条替换 Step 1 中 `.section--alt` 原注释行。）

- [ ] **Step 3: 写入 scripts/modern.js**

```js
// 1. 移动端菜单
const toggle = document.getElementById('navToggle')
const links = document.getElementById('navLinks')
toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open')
  toggle.setAttribute('aria-expanded', String(open))
})
links?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => links.classList.remove('open'))
)

// 2. 滚动显现
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in')
        io.unobserve(e.target)
      }
    }
  },
  { threshold: 0.15 }
)
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
```

- [ ] **Step 4: 验证**

```bash
npm run dev &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/modern.html
curl -s http://127.0.0.1:5173/styles/modern.css | grep -c "prefers-reduced-motion"
kill %1
```

Expected: `200` 与 ≥1。再用浏览器打开 `http://127.0.0.1:5173/modern.html` 目检：导航、首屏双截图、卡片 hover、截图层叠、移动宽度（DevTools 375px）汉堡菜单。

- [ ] **Step 5: Commit**

```bash
git add styles/modern.css scripts/modern.js
git commit -m "feat(modern): 完成现代风样式与交互

浅色基底+深色首屏对比、单品牌蓝、卡片化组件、
滚动显现与移动端菜单，动效尊重 reduced-motion。"
```

---

### Task 5: future.html 页面结构与文案

**Files:**
- Create: `future.html`（覆写占位文件）

**Interfaces:**
- Produces: `future.html` DOM（class 前缀 `f-`，含 `#starfield` canvas 挂载点、`data-reveal`），供 Task 6 挂载。
- Consumes: 同 Task 3 的素材与 CLI 命令来源；事实层与 modern 完全一致。

- [ ] **Step 1: 写入完整 future.html**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planet Port — 私有星域，随身跃迁</title>
  <meta name="description" content="Planet Port：开源跨平台 ZeroTier 多行星客户端。多 Planet 并存、多网络同连、路由与 DNS 掌控。" />
  <link rel="icon" href="/assets/planet-port-logo.webp" />
  <link rel="stylesheet" href="/styles/future.css" />
</head>
<body class="f-body">
  <canvas id="starfield" aria-hidden="true"></canvas>

  <nav class="f-nav">
    <a class="f-nav__brand" href="#top">
      <img src="/assets/planet-port-logo.webp" alt="Planet Port" width="28" height="28" />
      <span>PLANET&nbsp;PORT</span>
    </a>
    <div class="f-nav__links" id="navLinks">
      <a href="#sector">星域</a>
      <a href="#abilities">能力</a>
      <a href="#cockpits">座舱</a>
      <a href="#sequence">跃迁</a>
      <a href="#starmap">星图</a>
      <a href="#voyage">航线</a>
      <a class="f-nav__github" href="https://github.com/planet-port" target="_blank" rel="noopener">GITHUB</a>
    </div>
    <button class="f-nav__toggle" id="navToggle" aria-label="打开菜单" aria-expanded="false">☰</button>
  </nav>

  <!-- 01 首屏：深空 + 轨道动画 -->
  <header class="f-hero" id="top">
    <div class="f-orbit" aria-hidden="true">
      <div class="f-orbit__ring f-orbit__ring--1"></div>
      <div class="f-orbit__ring f-orbit__ring--2"></div>
      <div class="f-orbit__ring f-orbit__ring--3"></div>
      <div class="f-orbit__planet f-orbit__planet--a"></div>
      <div class="f-orbit__planet f-orbit__planet--b"></div>
    </div>
    <p class="f-hero__eyebrow">// PLANET PORT — MULTI-PLANET CLIENT</p>
    <h1>私有星域，<br />随身跃迁。</h1>
    <p class="f-hero__sub">
      每颗 Planet 都是一片星域。Planet Port 让它们同机并存——
      多 Planet 管理、多网络同连、路由与 DNS 全程掌控。
    </p>
    <div class="f-hero__cta">
      <a class="f-btn f-btn--primary" href="#starmap">进入星图</a>
      <a class="f-btn f-btn--ghost" href="https://github.com/planet-port" target="_blank" rel="noopener">GITHUB</a>
    </div>
  </header>

  <main class="f-main">
    <!-- 02 星域概念 -->
    <section class="f-section" id="sector" data-reveal>
      <div class="f-section__tag">01 / 星域</div>
      <h2>每颗 Planet，一片星域</h2>
      <p class="f-lead">
        ZeroTier 网络由 Planet 根服务器指引方向。官方只有一颗；你自建的每一颗，
        都是一片私有星域。Planet Port 让多份 Planet 同机并存——
        切换 Planet 只是换一条航线，你的网络与配置原样保留。
      </p>
    </section>

    <!-- 03 能力舱段：HUD 卡片，功能原词 -->
    <section class="f-section" id="abilities" data-reveal>
      <div class="f-section__tag">02 / 能力舱段</div>
      <h2>核心能力</h2>
      <div class="f-hud-grid">
        <article class="f-hud">
          <span class="f-hud__no">CAP-01</span>
          <h3>多 Planet 并存</h3>
          <p>官方与多份私有 Planet 同机共存，别名管理、一键启停，互不干扰。</p>
        </article>
        <article class="f-hud">
          <span class="f-hud__no">CAP-02</span>
          <h3>多网络同连</h3>
          <p>每 Planet 独立身份，join / leave 自如，网络与 peers 跨 Planet 聚合查询。</p>
        </article>
        <article class="f-hud">
          <span class="f-hud__no">CAP-03</span>
          <h3>路由与 DNS 掌控</h3>
          <p>默认路由开关、dnsMode 三种模式，陈述式配置，脚本友好。</p>
        </article>
        <article class="f-hud">
          <span class="f-hud__no">CAP-04</span>
          <h3>Moon 支持</h3>
          <p>orbit / deorbit、导入 .moon 文件，中继节点一样纳入管理。</p>
        </article>
      </div>
    </section>

    <!-- 04 两个座舱：双端并重 -->
    <section class="f-section" id="cockpits" data-reveal>
      <div class="f-section__tag">03 / 两个座舱</div>
      <h2>同一件事，两种方式</h2>
      <p class="f-lead">移动端与桌面端做的是同一件事——行星管理，只是座舱不同。</p>
      <div class="f-cockpits">
        <div class="f-cockpit">
          <span class="f-cockpit__tag">掌上终端 · MOBILE</span>
          <h3>移动端 App</h3>
          <p>iOS / Android / 鸿蒙原生 App。行星管理、网络开关、peers 状态，指尖完成。</p>
          <div class="f-holo-strip" role="list">
            <figure role="listitem"><img src="/assets/screenshots/ios-home.webp" alt="iOS 首页" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/ios-import.webp" alt="iOS 导入 Planet" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/ios-network.webp" alt="iOS 网络" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-home.webp" alt="Android 首页" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-import.webp" alt="Android 导入 Planet" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-network.webp" alt="Android 网络" loading="lazy" /></figure>
            <figure role="listitem"><img src="/assets/screenshots/android-settings.webp" alt="Android 设置" loading="lazy" /></figure>
          </div>
        </div>
        <div class="f-cockpit">
          <span class="f-cockpit__tag">舰桥主控 · DESKTOP</span>
          <h3>桌面端 CLI</h3>
          <p>
            macOS CLI 已发布：特权 daemon 持有核心与虚拟网卡，CLI 只是薄客户端——
            <strong>GUI 不开、隧道照跑</strong>。GUI 与 Linux / Windows 在路上。
          </p>
          <pre class="f-cli"><code><!-- CLI 命令块：与 modern.html 相同的 3 条真实命令 --></code></pre>
        </div>
      </div>
    </section>

    <!-- 05 跃迁序列 -->
    <section class="f-section" id="sequence" data-reveal>
      <div class="f-section__tag">04 / 跃迁序列</div>
      <h2>三步接入</h2>
      <ol class="f-seq">
        <li><span>SEQ-01</span><h3>导入 Planet</h3><p>本地文件或 URL 导入，起一个好记的别名。</p></li>
        <li><span>SEQ-02</span><h3>加入网络</h3><p>输入 Network ID，join 并随时 leave。</p></li>
        <li><span>SEQ-03</span><h3>一键切换</h3><p>在任意 Planet 之间即时切换，无需重启服务。</p></li>
      </ol>
    </section>

    <!-- 06 星图矩阵 -->
    <section class="f-section" id="starmap" data-reveal>
      <div class="f-section__tag">05 / 星图</div>
      <h2>支持平台</h2>
      <div class="f-starmap">
        <div class="f-starmap__cell"><strong>iOS</strong><span>App</span><em class="ok">✅ 可用</em></div>
        <div class="f-starmap__cell"><strong>Android</strong><span>App</span><em class="ok">✅ 可用</em></div>
        <div class="f-starmap__cell"><strong>鸿蒙</strong><span>App</span><em class="ok">✅ 可用</em></div>
        <div class="f-starmap__cell"><strong>macOS</strong><span>CLI</span><em class="ok">✅ 可用</em></div>
        <div class="f-starmap__cell"><strong>macOS</strong><span>GUI</span><em class="plan">📐 规划中</em></div>
        <div class="f-starmap__cell"><strong>Linux</strong><span>CLI</span><em class="wip">🚧 适配中</em></div>
        <div class="f-starmap__cell"><strong>Windows</strong><span>CLI / GUI</span><em class="plan">📐 规划中</em></div>
      </div>
    </section>

    <!-- 07 航线图 -->
    <section class="f-section" id="voyage" data-reveal>
      <div class="f-section__tag">06 / 航线图</div>
      <h2>下一段航程</h2>
      <ol class="f-voyage">
        <li class="wip"><span>🚧 进行中</span><h3>Linux 适配</h3><p>数据面已通（多 planet 上线、join / 路由、跨节点连通已实机验证），服务层 systemd 与安装脚本适配中。</p></li>
        <li class="plan"><span>📐 规划中</span><h3>macOS GUI</h3><p>Tauri 2 托盘常驻，作为既有 daemon 的薄客户端。</p></li>
        <li class="plan"><span>📐 规划中</span><h3>Windows</h3><p>CLI 与 GUI，延续 daemon + 薄客户端架构。</p></li>
        <li class="plan"><span>📐 规划中</span><h3>安装包分发</h3><p>deb / MSI 等系统安装包，逐步补齐。</p></li>
      </ol>
      <p class="f-note">以各仓库 README 为准，不承诺时间点。</p>
    </section>
  </main>

  <footer class="f-footer">
    <img src="/assets/planet-port-logo.webp" alt="Planet Port" width="32" height="32" />
    <div class="f-footer__links">
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">GITHUB</a>
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">PLANET-PORT-IOS</a>
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">PLANET-PORT-ANDROID</a>
      <a href="https://github.com/planet-port" target="_blank" rel="noopener">PLANET-PORT-DESKTOP</a>
    </div>
    <p>非官方客户端，与 ZeroTier, Inc. 无隶属关系。</p>
  </footer>

  <a class="f-switch" href="/modern.html" title="切换到现代风格">⌁ 现代风</a>
  <script type="module" src="/scripts/future.js"></script>
</body>
</html>
```

- [ ] **Step 2: 复制 CLI 命令块**：与 Task 3 Step 2 相同的 3 条真实命令（同一来源、同一转义）。

- [ ] **Step 3: 验证**

```bash
npm run dev &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/future.html
curl -s http://127.0.0.1:5173/future.html | grep -c "CAP-0"
grep -c "CLI 命令块" future.html || echo 0
kill %1
```

Expected: `200`；`CAP-0` 计数 `4`；占位计数 `0`。

- [ ] **Step 4: Commit**

```bash
git add future.html
git commit -m "feat(future): 搭建未来风单页结构与全量文案

星际叙事章节（星域/能力舱段/座舱/跃迁序列/星图/航线图），
科幻词仅用于章节包装，功能描述保持真实原词，事实层与 modern 一致。"
```

---

### Task 6: future.css 样式与 future.js 交互

**Files:**
- Create: `styles/future.css`
- Create: `scripts/future.js`

**Interfaces:**
- Consumes: Task 5 的 DOM（`f-` 前缀 class、`#starfield`、`data-reveal`）。

- [ ] **Step 1: 写入 styles/future.css（设计令牌 + 关键组件）**

```css
/* ===== 设计令牌 ===== */
:root {
  --f-bg: #050508;
  --f-bg-2: #0a0c14;
  --f-surface: rgba(16, 20, 34, .55);
  --f-text: #e8f0ff;
  --f-text-2: #8b96ad;
  --f-cyan: #35e0ff;          /* 霓虹青 */
  --f-magenta: #ff5cc8;       /* 品红点缀 */
  --f-line: rgba(80, 200, 255, .22);
  --f-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --f-sans: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  --f-maxw: 1080px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
.f-body {
  font-family: var(--f-sans); background: var(--f-bg); color: var(--f-text);
  line-height: 1.7; overflow-x: hidden;
}
img { max-width: 100%; display: block; }
a { color: inherit; }

/* 星空画布：固定底层 */
#starfield { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.f-nav, .f-hero, .f-main, .f-footer { position: relative; z-index: 1; }

/* ===== 导航（玻璃） ===== */
.f-nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px;
  background: rgba(5,5,8,.6); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--f-line);
}
.f-nav__brand { display: flex; align-items: center; gap: 10px; font-family: var(--f-mono); font-weight: 700; letter-spacing: .18em; text-decoration: none; }
.f-nav__links { display: flex; gap: 26px; font-size: 13.5px; font-family: var(--f-mono); }
.f-nav__links a { text-decoration: none; color: var(--f-text-2); }
.f-nav__links a:hover { color: var(--f-cyan); text-shadow: 0 0 12px rgba(53,224,255,.6); }
.f-nav__github { border: 1px solid var(--f-line); border-radius: 999px; padding: 5px 14px; }
.f-nav__toggle { display: none; }

/* ===== 首屏 ===== */
.f-hero { min-height: 92vh; display: flex; flex-direction: column; justify-content: center; padding: 96px 32px; max-width: var(--f-maxw); margin: 0 auto; }
.f-hero__eyebrow { font-family: var(--f-mono); font-size: 13px; color: var(--f-cyan); letter-spacing: .14em; }
.f-hero h1 {
  font-size: clamp(42px, 6.5vw, 84px); line-height: 1.12; letter-spacing: .02em; margin: 18px 0;
  text-shadow: 0 0 40px rgba(53,224,255,.25);
}
.f-hero__sub { color: var(--f-text-2); max-width: 46ch; font-size: 17px; }
.f-hero__cta { display: flex; gap: 14px; margin-top: 34px; }
.f-btn { font-family: var(--f-mono); display: inline-block; padding: 11px 24px; font-size: 14px; text-decoration: none; border-radius: 4px; }
.f-btn--primary { background: var(--f-cyan); color: #04121a; box-shadow: 0 0 24px rgba(53,224,255,.45); }
.f-btn--primary:hover { box-shadow: 0 0 40px rgba(53,224,255,.7); }
.f-btn--ghost { border: 1px solid var(--f-line); color: var(--f-text); }

/* 轨道动画：同心轨道环 + 行星 */
.f-orbit { position: absolute; right: -120px; top: 50%; width: 560px; height: 560px; transform: translateY(-50%); pointer-events: none; }
.f-orbit__ring { position: absolute; inset: 0; border: 1px solid rgba(80,200,255,.18); border-radius: 50%; }
.f-orbit__ring--2 { inset: 90px; border-color: rgba(255,92,200,.16); }
.f-orbit__ring--3 { inset: 180px; }
.f-orbit__planet { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: var(--f-cyan); box-shadow: 0 0 18px var(--f-cyan); }
.f-orbit__planet--a { top: -7px; left: 50%; animation: f-orbit-a 18s linear infinite; }
.f-orbit__planet--b { top: 50%; right: 83px; width: 10px; height: 10px; background: var(--f-magenta); box-shadow: 0 0 14px var(--f-magenta); animation: f-orbit-b 26s linear infinite; }
@keyframes f-orbit-a { from { transform: rotate(0deg) translateY(0); } to { transform: rotate(360deg) translateY(0); } }
/* 简化实现：行星沿环旋转用 transform-origin 圆周动画 */
.f-orbit__planet--a { transform-origin: 0 281px; }   /* (560/2)-7? 以环1半径为准：280px 中心 */
.f-orbit__planet--b { transform-origin: 0 191px; }
@keyframes f-orbit-a { to { transform: rotate(360deg); } }
@keyframes f-orbit-b { to { transform: rotate(-360deg); } }

/* ===== 章节通用 ===== */
.f-section { max-width: var(--f-maxw); margin: 0 auto; padding: 96px 32px; }
.f-section__tag { font-family: var(--f-mono); font-size: 13px; color: var(--f-cyan); letter-spacing: .2em; margin-bottom: 12px; }
.f-section h2 { font-size: clamp(26px, 3.6vw, 40px); margin-bottom: 22px; }
.f-lead { color: var(--f-text-2); max-width: 62ch; font-size: 16.5px; }

/* ===== HUD 能力卡片（玻璃 + 霓虹描边 + 扫描线） ===== */
.f-hud-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.f-hud {
  position: relative; overflow: hidden;
  background: var(--f-surface); backdrop-filter: blur(10px);
  border: 1px solid var(--f-line); border-radius: 8px; padding: 26px 22px;
  transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
}
.f-hud::after {  /* 扫描线 */
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent 0 3px, rgba(53,224,255,.03) 3px 4px);
}
.f-hud:hover { border-color: var(--f-cyan); box-shadow: 0 0 30px rgba(53,224,255,.18); transform: translateY(-3px); }
.f-hud__no { font-family: var(--f-mono); font-size: 12px; color: var(--f-magenta); letter-spacing: .16em; }
.f-hud h3 { font-size: 17px; margin: 10px 0 8px; }
.f-hud p { font-size: 14px; color: var(--f-text-2); }

/* ===== 座舱两栏 ===== */
.f-cockpits { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.f-cockpit { background: var(--f-surface); backdrop-filter: blur(10px); border: 1px solid var(--f-line); border-radius: 8px; padding: 30px 26px; }
.f-cockpit__tag { font-family: var(--f-mono); font-size: 12px; color: var(--f-cyan); letter-spacing: .18em; }
.f-cockpit h3 { font-size: 19px; margin: 10px 0; }
.f-cockpit p { color: var(--f-text-2); margin-bottom: 20px; }
/* 全息截图条 */
.f-holo-strip { display: flex; gap: 14px; overflow-x: auto; padding: 8px 4px 12px; scroll-snap-type: x mandatory; }
.f-holo-strip figure { flex: 0 0 auto; scroll-snap-align: start; }
.f-holo-strip img {
  height: 380px; width: auto; border-radius: 10px;
  border: 1px solid var(--f-line);
  box-shadow: 0 0 24px rgba(53,224,255,.15), inset 0 0 30px rgba(53,224,255,.05);
}
.f-cli {
  background: rgba(3,5,10,.8); color: #b9ecff; border: 1px solid var(--f-line); border-radius: 8px;
  padding: 20px 22px; font-family: var(--f-mono); font-size: 13.5px; line-height: 1.9; overflow-x: auto;
}

/* ===== 跃迁序列 ===== */
.f-seq { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; list-style: none; }
.f-seq li { border: 1px dashed var(--f-line); border-radius: 8px; padding: 26px 22px; background: var(--f-surface); }
.f-seq span { font-family: var(--f-mono); font-size: 12.5px; color: var(--f-magenta); letter-spacing: .16em; }
.f-seq h3 { margin: 8px 0 6px; font-size: 17px; }
.f-seq p { font-size: 14px; color: var(--f-text-2); }

/* ===== 星图矩阵 ===== */
.f-starmap {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  background-image: linear-gradient(rgba(80,200,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(80,200,255,.05) 1px, transparent 1px);
  background-size: 40px 40px; padding: 28px; border: 1px solid var(--f-line); border-radius: 8px;
}
.f-starmap__cell { padding: 18px 16px; border: 1px solid rgba(80,200,255,.12); border-radius: 6px; background: rgba(5,5,8,.5); }
.f-starmap__cell strong { display: block; font-size: 16px; }
.f-starmap__cell span { display: block; font-family: var(--f-mono); font-size: 12px; color: var(--f-text-2); margin: 2px 0 8px; }
.f-starmap__cell em { font-style: normal; font-size: 13px; }
.f-starmap .ok { color: var(--f-cyan); }
.f-starmap .wip { color: #ffc46b; }
.f-starmap .plan { color: var(--f-text-2); }

/* ===== 航线图 ===== */
.f-voyage { list-style: none; position: relative; padding-left: 34px; }
.f-voyage::before { content: ""; position: absolute; left: 8px; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(var(--f-cyan), var(--f-magenta)); box-shadow: 0 0 12px rgba(53,224,255,.4); }
.f-voyage li { position: relative; padding-bottom: 30px; }
.f-voyage li:last-child { padding-bottom: 0; }
.f-voyage li::before { content: ""; position: absolute; left: -32px; top: 6px; width: 12px; height: 12px; border-radius: 50%; background: var(--f-bg); border: 2px solid var(--f-cyan); }
.f-voyage li.plan::before { border-color: var(--f-text-2); }
.f-voyage span { font-family: var(--f-mono); font-size: 12.5px; color: #ffc46b; }
.f-voyage li.plan span { color: var(--f-text-2); }
.f-voyage h3 { font-size: 16.5px; margin: 4px 0; }
.f-voyage p { font-size: 14px; color: var(--f-text-2); max-width: 60ch; }
.f-note { margin-top: 20px; font-size: 13px; color: var(--f-text-2); }

/* ===== 页脚 ===== */
.f-footer { border-top: 1px solid var(--f-line); text-align: center; padding: 48px 32px; display: flex; flex-direction: column; gap: 14px; align-items: center; }
.f-footer__links { display: flex; gap: 22px; font-family: var(--f-mono); font-size: 13px; }
.f-footer__links a { color: var(--f-text-2); text-decoration: none; }
.f-footer__links a:hover { color: var(--f-cyan); }
.f-footer p { font-size: 12.5px; color: var(--f-text-2); }

/* ===== 风格切换 ===== */
.f-switch {
  position: fixed; right: 18px; bottom: 18px; z-index: 60;
  font-family: var(--f-mono); font-size: 13px; text-decoration: none;
  background: rgba(5,5,8,.8); color: var(--f-cyan); padding: 9px 14px;
  border-radius: 999px; border: 1px solid var(--f-line);
  box-shadow: 0 0 18px rgba(53,224,255,.2);
}
.f-switch:hover { box-shadow: 0 0 30px rgba(53,224,255,.45); }

/* ===== 滚动显现 ===== */
[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
[data-reveal].is-in { opacity: 1; transform: none; }

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .f-hud-grid, .f-starmap { grid-template-columns: 1fr 1fr; }
  .f-cockpits { grid-template-columns: 1fr; }
  .f-orbit { opacity: .35; right: -220px; }
  .f-seq { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .f-nav__links {
    display: none; position: absolute; top: 100%; left: 0; right: 0;
    flex-direction: column; gap: 0; background: rgba(5,5,8,.95);
    border-bottom: 1px solid var(--f-line); padding: 8px 24px 16px;
  }
  .f-nav__links.open { display: flex; }
  .f-nav__links a { padding: 10px 0; }
  .f-nav__toggle { display: block; background: none; border: none; color: var(--f-text); font-size: 22px; cursor: pointer; }
  .f-section { padding: 64px 24px; }
  .f-hud-grid, .f-starmap { grid-template-columns: 1fr; }
  .f-holo-strip img { height: 300px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
  [data-reveal] { opacity: 1; transform: none; }
}
```

注意：上面轨道行星的 `transform-origin` 注释行是推算过程，写入时清理为最终值（环 1 半径 280px、环 2 半径 190px，行星定位在环上，origin 指向圆心），并保留单一 `@keyframes` 定义（删除第一组被替代的 keyframes）。

- [ ] **Step 2: 写入 scripts/future.js（星空粒子 + 菜单 + 显现）**

```js
// 1. 星空粒子（canvas，reduced-motion 时跳过）
const canvas = document.getElementById('starfield')
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

if (canvas && !reduced) {
  const ctx = canvas.getContext('2d')
  let stars = []
  const resize = () => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    const count = Math.min(220, Math.floor((innerWidth * innerHeight) / 9000))
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),               // 闪烁相位
      s: 0.004 + Math.random() * 0.012, // 闪烁速度
    }))
  }
  resize()
  addEventListener('resize', resize)

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const st of stars) {
      st.a += st.s
      const alpha = 0.25 + Math.abs(Math.sin(st.a)) * 0.65
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#bfe9ff'
      ctx.beginPath()
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    requestAnimationFrame(tick)
  }
  tick()
} else if (canvas) {
  // 降级：静态星点
  const ctx = canvas.getContext('2d')
  canvas.width = innerWidth
  canvas.height = innerHeight
  for (let i = 0; i < 160; i++) {
    ctx.globalAlpha = Math.random() * 0.7 + 0.15
    ctx.fillStyle = '#bfe9ff'
    ctx.beginPath()
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.3 + 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 2. 移动端菜单（与 modern.js 相同逻辑）
const toggle = document.getElementById('navToggle')
const links = document.getElementById('navLinks')
toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open')
  toggle.setAttribute('aria-expanded', String(open))
})
links?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => links.classList.remove('open'))
)

// 3. 滚动显现
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in')
        io.unobserve(e.target)
      }
    }
  },
  { threshold: 0.15 }
)
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
```

- [ ] **Step 3: 验证**

```bash
npm run dev &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/future.html
curl -s http://127.0.0.1:5173/styles/future.css | grep -c "prefers-reduced-motion"
kill %1
```

Expected: `200` 与 ≥1。浏览器目检：星空动画、首屏轨道旋转、HUD 卡片霓虹 hover、玻璃导航、375px 汉堡菜单。

- [ ] **Step 4: Commit**

```bash
git add styles/future.css scripts/future.js
git commit -m "feat(future): 完成未来风样式与交互

深空底色+霓虹青/品红、玻璃拟态 HUD 卡片、canvas 星空粒子
（reduced-motion 降级静态星点）、同心轨道动画与坐标网格星图。"
```

---

### Task 7: 收尾——README、构建与离线验收

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: 前 6 个任务的全部产物。

- [ ] **Step 1: 写入 README.md**

```markdown
# Planet Port 品牌网站 v2

Planet Port 的双风格品牌介绍站：入口选择页 + 「现代」「未来」两套完全独立的单页方案。
基于原生 HTML / CSS / JavaScript 构建，Vite 仅作开发服务器与生产打包，
无运行时依赖、无外部字体/图片 CDN，可离线完整呈现。

## 本地运行

​```bash
npm install
npm run dev      # http://127.0.0.1:5173 （入口页，可进入两套风格）
​```

## 生产构建

​```bash
npm run build    # 产出 dist/（index / modern / future 三入口）
npm run preview
​```

## 页面说明

- `index.html` 入口选择页：左右分屏进入两套风格，支持 A / B 键快捷访问
- `modern.html` 现代风：浅色基底 + 深色首屏，克制精致
- `future.html` 未来风：深空底色 + 轨道/星图视觉，沉浸叙事；科幻词汇仅作章节包装，功能描述保持真实原词
- 两套页面右下角可互相切换；每套页面均可独立摘出上线

## 事实基准

平台状态与路线图以各平台仓库 README 为准，如实标注，未发布功能不写成已上线。
非官方品牌站，与 ZeroTier, Inc. 无隶属关系。
```

（注意：写入时把 ​``` 的零宽字符去掉，用正常的三反引号。）

- [ ] **Step 2: 构建与产物检查**

```bash
npm run build
ls dist dist/assets 2>/dev/null | head -20
grep -c "http" dist/modern.html || true
```

Expected: 构建成功，dist 下有三个入口 html 与打包后的 css/js。

- [ ] **Step 3: 断网离线验收**

```bash
npm run preview &
sleep 2
# 临时禁网后用 curl 验证（或直接检查产物无外链）：
grep -oE 'https?://[^"]+' dist/modern.html dist/future.html dist/index.html | grep -v github.com | grep -v w3.org || echo "无外部资源引用"
kill %1
```

Expected: 除 GitHub 链接（用户点击才发起）外无任何外部资源引用。

- [ ] **Step 4: 最终一致性检查**

对照 spec（`docs/superpowers/specs/2026-10-31-planet-port-website-2-design.md`）逐项核对验收标准：

```bash
grep -c "非官方客户端" modern.html future.html
grep -c "style-switch\|f-switch" modern.html future.html
grep -c "📐 规划中" modern.html future.html
git --no-pager log --oneline
```

Expected: 两页都有免责声明、切换按钮、规划中标注；提交历史完整。

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: 添加 README 说明双风格站点结构与运行方式

涵盖本地运行、生产构建、页面说明与事实基准声明。"
```

---

## Self-Review 记录

- **Spec 覆盖**：入口页（Task 2）、modern（Task 3-4）、future（Task 5-6）、路线图（3/5 内含）、离线验收（Task 7）✅
- **占位扫描**：`<!-- CLI 命令块 -->` 是刻意设计——来源在 Interfaces 中明确（COMMANDS.md），非未决项 ✅
- **类型/命名一致性**：modern 用无前缀 class + `modern.css/modern.js`；future 用 `f-` 前缀 + `future.css/future.js`；两页 navToggle/navLinks id 一致但互不共享文件 ✅
