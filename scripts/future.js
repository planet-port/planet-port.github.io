// 1. 星空粒子（canvas，reduced-motion 时降级为静态星点）
const canvas = document.getElementById('starfield')
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

if (canvas) {
  const ctx = canvas.getContext('2d')

  if (!reduced) {
    let stars = []
    const resize = () => {
      canvas.width = innerWidth
      canvas.height = innerHeight
      const count = Math.min(220, Math.floor((innerWidth * innerHeight) / 9000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),                 // 闪烁相位
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
  } else {
    // 降级：静态星点（窗口尺寸变化时重绘一次）
    const drawStatic = () => {
      canvas.width = innerWidth
      canvas.height = innerHeight
      for (let i = 0; i < 160; i++) {
        ctx.globalAlpha = Math.random() * 0.7 + 0.15
        ctx.fillStyle = '#bfe9ff'
        ctx.beginPath()
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.3 + 0.3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    drawStatic()
    addEventListener('resize', drawStatic)
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
  a.addEventListener('click', () => {
    links.classList.remove('open')
    toggle?.setAttribute('aria-expanded', 'false')
  })
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
