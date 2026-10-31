// Planet Port — 现代页交互
// 所有交互都有无 JS 回退：内容默认可见，JS 只增强。

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 导航：滚动加深底色 + 移动端折叠菜单 ---------- */
const nav = $('#nav');
const navToggle = $('#navToggle');
const navMenu = $('#navMenu');

if (nav) {
  const onScroll = () => nav.classList.toggle('nav--solid', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

navToggle?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navMenu?.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- 出场 ---------- */
const revealEls = $$('[data-reveal]');
if ('IntersectionObserver' in window && !reducedMotion) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* ---------- Hero：垂直 reel 随滚动推进（钉住舞台） ---------- */
const reel = $('[data-reel]');
const reelTrack = $('[data-reel-track]');
if (reel && reelTrack && !reducedMotion && window.matchMedia('(min-width: 960px)').matches) {
  const hero = reel.closest('.hero');
  let step = 0;
  const measure = () => {
    const frames = $$('.reel__frame', reelTrack);
    if (frames.length >= 2) step = frames[1].offsetTop - frames[0].offsetTop;
  };
  measure();
  window.addEventListener('resize', measure);

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -rect.top / total));
    // 居中帧索引：起点为第 2 帧（上下各留邻帧切片），滚动推进到最后一帧
    reelTrack.style.setProperty('--reel-y', `${(1 + 2 * p) * step}px`);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* ---------- features：巨型命令列表（选中 / 键盘 / 过滤） ---------- */
const cmdSearch = $('#cmdSearch');
const cmdRows = $('#cmdRows');
if (cmdSearch && cmdRows) {
  const rows = $$('.cmdlist__row', cmdRows);

  const select = (row, focus = false) => {
    rows.forEach((r) => r.setAttribute('aria-selected', String(r === row)));
    rows.forEach((r) => { r.tabIndex = r === row ? 0 : -1; });
    if (focus) row.focus();
  };

  rows.forEach((row) => {
    row.tabIndex = row.getAttribute('aria-selected') === 'true' ? 0 : -1;
    row.addEventListener('click', () => select(row));
    row.addEventListener('mouseenter', () => select(row));
    row.addEventListener('keydown', (e) => {
      const visible = rows.filter((r) => !r.hidden);
      const i = visible.indexOf(row);
      let next = null;
      if (e.key === 'ArrowDown') next = visible[i + 1] ?? visible[0];
      if (e.key === 'ArrowUp') next = visible[i - 1] ?? visible[visible.length - 1];
      if (e.key === 'Home') next = visible[0];
      if (e.key === 'End') next = visible[visible.length - 1];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });
  });

  const selectFirstVisible = () => {
    const first = rows.find((r) => !r.hidden);
    if (first) select(first);
  };

  cmdSearch.addEventListener('input', () => {
    const q = cmdSearch.value.trim().toLowerCase();
    rows.forEach((row) => {
      const text = (row.textContent + ' ' + (row.dataset.keywords || '')).toLowerCase();
      row.hidden = q !== '' && !text.includes(q);
    });
    selectFirstVisible();
  });
  cmdSearch.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const visible = rows.filter((r) => !r.hidden);
      const current = visible.find((r) => r.getAttribute('aria-selected') === 'true');
      const i = visible.indexOf(current);
      const next = e.key === 'ArrowDown'
        ? visible[i + 1] ?? visible[0]
        : visible[i - 1] ?? visible[visible.length - 1];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    }
  });
}

/* ---------- how-it-works：live thing 片段 ---------- */
const app = $('#appFragment');
if (app) {
  const planets = $$('.app__planet', app);
  const netlists = $$('.app__nets', app);
  const currentName = $('[data-current-name]', app);
  const statNets = $('[data-stat-nets]', app);
  const statPeers = $('[data-stat-peers]', app);
  let manual = false;

  const setCurrent = (key) => {
    planets.forEach((btn) => {
      const on = btn.dataset.planet === key;
      btn.setAttribute('aria-pressed', String(on));
      if (on) {
        statNets.textContent = btn.dataset.nets;
        statPeers.textContent = btn.dataset.peers;
        currentName.textContent = key;
      }
    });
    netlists.forEach((ul) => { ul.hidden = ul.dataset.netlist !== key; });
  };

  planets.forEach((btn) => {
    btn.addEventListener('click', () => {
      manual = true;
      setCurrent(btn.dataset.planet);
    });
  });

  // 左侧三句滚动 → 片段状态
  const steps = $$('.how__step');
  const sceneFor = ['add', 'switch', 'join'];
  if ('IntersectionObserver' in window && steps.length) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const i = Number(en.target.dataset.step);
        steps.forEach((s) => s.classList.toggle('is-active', s === en.target));
        const scene = sceneFor[i] ?? 'switch';
        app.dataset.scene = scene;
        if (!manual && (scene === 'switch' || scene === 'join')) setCurrent('company');
      }
    }, { rootMargin: '-40% 0px -40% 0px' });
    steps.forEach((s) => io.observe(s));
  } else {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === 1));
  }
}

/* ---------- showcase：输入（命令）→ 输出（表格） ---------- */
const showInput = $('[data-show-input]');
const showFoot = $('[data-show-foot]');
if (showInput && showFoot) {
  const rows = $$('.ptable tbody tr');
  const stats = {
    official: { nets: 2, peers: 5 },
    company: { nets: 3, peers: 7 },
    lab: { nets: 1, peers: 2 },
  };
  const apply = (alias) => {
    const key = alias in stats ? alias : 'company';
    rows.forEach((tr) => {
      const on = tr.dataset.planet === key;
      tr.classList.toggle('is-current', on);
      $('.ptable__state', tr).textContent = on ? '当前' : '在列';
    });
    showFoot.textContent = `peers ${stats[key].peers} online · networks ${stats[key].nets}`;
  };
  showInput.addEventListener('input', () => {
    const m = showInput.value.match(/use\s+([a-z0-9-]+)/i);
    if (m) apply(m[1].toLowerCase());
  });
}

/* ---------- cta：添加对话框（演示） ---------- */
const dialog = $('.dialog');
if (dialog) {
  dialog.addEventListener('submit', (e) => {
    e.preventDefault();
    const alias = ($('[data-dialog-alias]', dialog)?.value || 'company').trim();
    const note = $('[data-dialog-note]', dialog);
    note.textContent = `${alias} 已在列，官方 Planet 原样保留。`;
    note.hidden = false;
  });
}

/* ---------- footer：本地时间 ---------- */
const clock = $('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 1000);
}
