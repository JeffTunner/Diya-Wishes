import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const PALETTE = ['#ffd166', '#ff9f1c', '#ff6b35', '#ffe8a3', '#f94144', '#fff1c1']
const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)]

// Full-screen canvas: twinkling stars + firework particles. Call ref.burst(x, y).
const Sky = forwardRef(function Sky(_, ref) {
  const canvasRef = useRef(null)
  const sparks = useRef([])

  useImperativeHandle(ref, () => ({
    burst(x, y) {
      const colors = [pick(), pick()]
      for (let i = 0; i < 90; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 1.5 + Math.random() * 4.5
        sparks.current.push({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 1, decay: 0.008 + Math.random() * 0.012,
          color: colors[i % 2],
        })
      }
    },
  }))

  useEffect(() => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    let w, h, stars = [], raf

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth; h = window.innerHeight
      c.width = w * dpr; c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = Array.from({ length: Math.floor((w * h) / 5000) }, () => ({
        x: Math.random() * w, y: Math.random() * h * 0.85,
        r: Math.random() * 1.3 + 0.3, p: Math.random() * 6.28, s: 0.5 + Math.random() * 1.5,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = (t) => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#fff3d6'
      for (const s of stars) {
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin((t / 1000) * s.s + s.p))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill()
      }
      ctx.globalCompositeOperation = 'lighter'
      const arr = sparks.current
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.vx *= 0.985; p.vy *= 0.985; p.life -= p.decay
        if (p.life <= 0) { arr.splice(i, 1); continue }
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 6.283); ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full" />
})

export default Sky
