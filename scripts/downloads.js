// 下载区：GitHub API latest release 动态渲染
// 三层降级：API → localStorage 缓存(1h，失败时过期缓存兜底) → 保留静态"前往 GitHub 仓库"按钮
// beta 为 prerelease，不会被 releases/latest 解析到，这里永远展示稳定版
const REPOS = {
  desktop: 'planet-port/planet-port-desktop',
  android: 'planet-port/planet-port-android',
  ios: 'planet-port/planet-port-ios',
};
const TTL = 3_600_000;
const FETCH_TIMEOUT_MS = 8000;

// desktop 资产匹配：兼容两代命名
//  - dist 规范（无版本号）：planet-port-aarch64-apple-darwin.tar.xz / .tar.gz、planet-port-x86_64-pc-windows-msvc.zip
//  - v0.3.0 实际命名（带版本号）：planet-port_0.3.0_macos_aarch64.tar.gz、planet-port_0.3.0_windows_x86_64.zip
const DESKTOP_TARGETS = [
  { id: 'mac-arm', label: 'macOS · Apple Silicon', re: /aarch64-apple-darwin\.tar\.(xz|gz)$|macos_aarch64\.tar\.gz$/ },
  { id: 'mac-intel', label: 'macOS · Intel', re: /x86_64-apple-darwin\.tar\.(xz|gz)$|macos_x86_64\.tar\.gz$/ },
  { id: 'linux-amd64', label: 'Linux · x86_64', re: /x86_64-unknown-linux-gnu\.tar\.(xz|gz)$|linux_amd64\.tar\.gz$/ },
  { id: 'linux-arm64', label: 'Linux · arm64', re: /aarch64-unknown-linux-gnu\.tar\.(xz|gz)$|linux_arm64\.tar\.gz$/ },
  { id: 'win-x64', label: 'Windows · x86_64', re: /x86_64-pc-windows-msvc\.zip$|windows_x86_64\.zip$/ },
];

// 由 UA 判定访问者平台。macOS 的 UA 不区分 Apple Silicon / Intel（统一报 Intel），
// 默认按 Apple Silicon 选主按钮，Intel 用户从下方"其他平台"取 x86_64 链接。
export function detectPlatform(ua = navigator.userAgent) {
  if (/iPhone|iPad|iPod/i.test(ua)) return { os: 'ios', arch: null };
  if (/Android/i.test(ua)) return { os: 'android', arch: null };
  if (/Windows/i.test(ua)) return { os: 'windows', arch: 'x86_64' };
  if (/Macintosh|Mac OS X/i.test(ua)) return { os: 'mac', arch: 'aarch64' };
  if (/Linux|X11/i.test(ua)) return { os: 'linux', arch: 'x86_64' };
  return { os: 'unknown', arch: null };
}

// 按平台+架构从资产名列表中选出 desktop 目标
export function pickDesktopAsset(assets, platform) {
  let wanted = null;
  if (platform.os === 'mac') wanted = platform.arch === 'x86_64' ? 'mac-intel' : 'mac-arm';
  else if (platform.os === 'windows') wanted = 'win-x64';
  else if (platform.os === 'linux') wanted = platform.arch === 'arm64' ? 'linux-arm64' : 'linux-amd64';
  if (!wanted) return null;
  const target = DESKTOP_TARGETS.find((t) => t.id === wanted);
  const hit = assets.find((n) => target.re.test(n));
  return hit ? { target, asset: hit } : null;
}

const cacheKey = (repo) => `pp-release:${repo}`;
// 校验缓存 data 形状：合法 JSON 但结构异常（如手改/旧版本写入）时按无缓存处理，
// 避免 init 里 data.assets.find 抛 TypeError 导致动态区永久停「正在获取」。
const isShaped = (d) =>
  d && typeof d.tag === 'string' && Array.isArray(d.assets) && d.assets.every((n) => typeof n === 'string');
const readCache = (repo, ignoreTTL = false) => {
  try {
    const c = JSON.parse(localStorage.getItem(cacheKey(repo)) || 'null');
    if (c && typeof c.at === 'number' && isShaped(c.data) && (ignoreTTL || Date.now() - c.at < TTL)) return c.data;
  } catch (_) { /* 忽略损坏缓存 */ }
  return null;
};
const writeCache = (repo, data) => {
  try { localStorage.setItem(cacheKey(repo), JSON.stringify({ at: Date.now(), data })); } catch (_) {}
};

async function fetchLatest(repo) {
  const cached = readCache(repo);
  if (cached) return { data: cached, from: 'cache' };
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const data = { tag: j.tag_name, assets: (j.assets || []).map((a) => a.name) };
  // 网关/CDN 偶发返回畸形 JSON 时，未校验的 data 会渲染 undefined 链接并污染缓存。
  // 与 readCache 同用一套 isShaped 校验，非法即走 stale 兜底链。
  if (!isShaped(data)) throw new Error('malformed release payload');
  writeCache(repo, data);
  return { data, from: 'network' };
}

// 失败时回退过期缓存（标记 from:'stale'），让页面尽量有可用链接
async function fetchLatestWithFallback(repo) {
  try {
    return await fetchLatest(repo);
  } catch (err) {
    const stale = readCache(repo, true);
    if (stale) return { data: stale, from: 'stale' };
    throw err;
  }
}

function makeLink(repo, tag, asset, label, cls) {
  const a = document.createElement('a');
  a.className = cls;
  a.href = `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(asset)}`;
  a.textContent = label;
  a.target = '_blank';
  a.rel = 'noopener';
  return a;
}

export async function init() {
  const box = document.querySelector('[data-downloads]');
  if (!box) return;
  const list = box.querySelector('[data-dl-list]');
  const note = box.querySelector('[data-dl-note]');

  const results = await Promise.allSettled([
    fetchLatestWithFallback(REPOS.desktop),
    fetchLatestWithFallback(REPOS.android),
    fetchLatestWithFallback(REPOS.ios),
  ]);
  const [desktop, android, ios] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));

  if (!desktop && !android && !ios) {
    note.textContent = '版本信息获取失败，请从下方按钮前往 GitHub Releases 下载。';
    box.hidden = false;
    return;
  }

  const platform = detectPlatform();
  const staleUsed = [desktop, android, ios].some((r) => r && r.from === 'stale');

  // 主按钮：按访问者平台+架构自动选资产；移动端选对应安装包，未识别则不设主按钮
  const primary = box.querySelector('[data-dl-primary]');
  const mobileHit =
    platform.os === 'android' && android ? { repo: REPOS.android, rel: android, ext: '.apk', label: 'Android' } :
    platform.os === 'ios' && ios ? { repo: REPOS.ios, rel: ios, ext: '.ipa', label: 'iOS（侧载）' } : null;
  const desktopHit = desktop ? pickDesktopAsset(desktop.data.assets, platform) : null;

  let primaryLink = null;
  if (mobileHit) {
    const asset = mobileHit.rel.data.assets.find((n) => n.endsWith(mobileHit.ext));
    if (asset) primaryLink = makeLink(mobileHit.repo, mobileHit.rel.data.tag, asset, `下载 ${mobileHit.label} ${mobileHit.rel.data.tag}`, 'btn btn--ink');
  } else if (desktopHit) {
    primaryLink = makeLink(REPOS.desktop, desktop.data.tag, desktopHit.asset, `下载 ${desktopHit.target.label} ${desktop.data.tag}`, 'btn btn--ink');
  }
  if (primaryLink) primary.appendChild(primaryLink);

  // 其余平台全部列出，作为次级链接
  if (desktop) {
    const seenPrimary = desktopHit ? desktopHit.target.id : null;
    for (const t of DESKTOP_TARGETS) {
      if (t.id === seenPrimary) continue;
      const hit = desktop.data.assets.find((n) => t.re.test(n));
      if (hit) list.appendChild(makeLink(REPOS.desktop, desktop.data.tag, hit, t.label, 'btn'));
    }
  }
  if (android) {
    const apk = android.data.assets.find((n) => n.endsWith('.apk'));
    if (apk && platform.os !== 'android') list.appendChild(makeLink(REPOS.android, android.data.tag, apk, 'Android', 'btn'));
  }
  if (ios) {
    const ipa = ios.data.assets.find((n) => n.endsWith('.ipa'));
    if (ipa && platform.os !== 'ios') list.appendChild(makeLink(REPOS.ios, ios.data.tag, ipa, 'iOS（侧载）', 'btn'));
  }

  const parts = [];
  if (desktop) parts.push(`桌面端 ${desktop.data.tag}`);
  if (android) parts.push(`Android ${android.data.tag}`);
  if (ios) parts.push(`iOS ${ios.data.tag}`);
  const missing = results.some((r) => r.status === 'rejected');
  note.textContent =
    (missing ? '部分版本信息获取失败，已展示可用的下载。' : '最新稳定版：') +
    parts.join(' · ') +
    (staleUsed ? '（来自本地缓存）' : '');
  box.hidden = false;
}

if (typeof document !== 'undefined') {
  // 任何未预期异常都回落到静态兜底，不允许动态区永久停留「正在获取」。
  init().catch(() => {});
}
