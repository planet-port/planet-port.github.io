// 1. 移动端菜单
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
