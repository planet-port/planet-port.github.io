// A / B 键快速进入对应风格页
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key === 'a' || e.key === 'A') location.href = '/modern.html'
  if (e.key === 'b' || e.key === 'B') location.href = '/future.html'
})
