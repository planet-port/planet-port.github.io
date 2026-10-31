// 1. 移动端菜单
const toggle = document.getElementById('navToggle')
const links = document.getElementById('navLinks')
toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open')
  toggle.setAttribute('aria-expanded', String(open))
  toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单')
})
links?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    links.classList.remove('open')
    toggle?.setAttribute('aria-expanded', 'false')
  })
)

// 2. features：真实开关（role=switch），开 = 色带填充 + 后果行
document.querySelectorAll('[data-switch]').forEach((sw) => {
  sw.addEventListener('click', () => {
    const band = sw.closest('[data-band]')
    const on = sw.getAttribute('aria-checked') !== 'true'
    sw.setAttribute('aria-checked', String(on))
    band?.classList.toggle('is-on', on)
  })
})

// 3. how-it-works：range 四档驱动左侧陈述与右侧片段状态
const hw = document.querySelector('.hw')
const range = document.getElementById('hwRange')
const fill = document.getElementById('hwFill')
const names = {
  1: '添加',
  2: '切换',
  3: '联网',
  4: '掌控',
}

function setStage(v) {
  if (!hw) return
  hw.setAttribute('data-stage', String(v))
  range?.setAttribute('aria-valuetext', names[v] ?? '')
  if (fill) fill.style.width = `${((v - 1) / 3) * 100}%`
  hw.querySelectorAll('[data-clause]').forEach((c) => {
    c.classList.toggle('is-active', c.dataset.clause === String(v))
  })
  hw.querySelectorAll('[data-stage-name]').forEach((n) => {
    n.classList.toggle('is-current', n.dataset.stageName === String(v))
  })
}

if (hw && range) {
  range.value = '1' // 初始进第一档（无 JS 时 HTML 保持第 4 档全量可见）
  setStage(1)
  range.addEventListener('input', () => setStage(Number(range.value)))
} else if (hw && !range) {
  hw.setAttribute('data-stage', '4')
}

// 4. showcase：行星选择器（live thing）——选中改变场色与标题中的名字
const show = document.getElementById('showcase')
show?.querySelectorAll('[data-planet]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.planet
    show.setAttribute('data-field', key)
    const label = show.querySelector('[data-show-name]')
    if (label) label.textContent = key
    show.querySelectorAll('[data-planet]').forEach((b) => {
      const active = b === btn
      b.classList.toggle('is-active', active)
      b.setAttribute('aria-pressed', String(active))
    })
  })
})

// 5. 滚动显现：同组元素按序错开（transform + opacity，reduced-motion 时 CSS 全关）
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
document.querySelectorAll('[data-reveal]').forEach((el) => {
  let i = 0
  let prev = el.previousElementSibling
  while (prev) {
    if (prev.hasAttribute('data-reveal')) i++
    prev = prev.previousElementSibling
  }
  el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`)
})

if (reduced) {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'))
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
}
