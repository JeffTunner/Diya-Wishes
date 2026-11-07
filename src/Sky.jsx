import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const PALETTE = ['#ffd166', '#ff9f1c', '#ff5a1f', '#ffe8a3', '#ff5d8f', '#ffb703', '#ffffff']

const Sky = forwardRef(function Sky({ lit = false }, ref) {
  const canvasRef = useRef(null)
  const sparksRef = useRef([])
  const embersRef = useRef([])
  const starsRef = useRef([])
  const isHiddenRef = useRef(false)
  const reducedMotionRef = useRef(false)

  useImperativeHandle(ref, () => ({
    burst(x, y, count = 80, colors = null) {
      if (sparksRef.current.length > 1200) return
      const palette = colors || [
        PALETTE[Math.floor(Math.random() * PALETTE.length)],
        PALETTE[Math.floor(Math.random() * PALETTE.length)],
      ]
      const actualCount = reducedMotionRef.current ? Math.min(count, 35) : count
      for (let i = 0; i < actualCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = (1.2 + Math.random() * 4.8) * (reducedMotionRef.current ? 0.6 : 1)
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.009 + Math.random() * 0.014,
          color: palette[i % palette.length],
          size: 1.5 + Math.random() * 2,
        })
      }
    },
    ringShockwave(x, y, radius = 80, color = '#ffffff') {
      const actualCount = reducedMotionRef.current ? 24 : 48
      for (let i = 0; i < actualCount; i++) {
        const angle = (i / actualCount) * Math.PI * 2
        const speed = 3.5 + Math.random() * 1.5
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.02 + Math.random() * 0.015,
          color,
          size: 2.2,
        })
      }
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0
    let rafId = null
    let lastTime = performance.now()

    // Reduced motion query
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mql.matches
    const handleMotionChange = (e) => {
      reducedMotionRef.current = e.matches
    }
    mql.addEventListener('change', handleMotionChange)

    // Visibility change
    const handleVisibilityChange = () => {
      isHiddenRef.current = document.hidden
      if (!document.hidden) {
        lastTime = performance.now()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Twinkling stars
      const starDensity = reducedMotionRef.current ? 9000 : 5500
      const starCount = Math.min(180, Math.floor((width * height) / starDensity))
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.88,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.4,
      }))

      // Initial embers
      const emberCount = reducedMotionRef.current ? 15 : 35
      embersRef.current = Array.from({ length: emberCount }, () => ({
        x: Math.random() * width,
        y: height + Math.random() * 40,
        vy: -(0.4 + Math.random() * 0.9),
        vx: (Math.random() - 0.5) * 0.4,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
        color: Math.random() > 0.4 ? '#ffb703' : '#ff8c1a',
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const render = (time) => {
      rafId = requestAnimationFrame(render)

      if (isHiddenRef.current) return
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      ctx.clearRect(0, 0, width, height)

      // 1. Draw twinkling stars
      ctx.fillStyle = '#fff4db'
      for (let i = 0; i < starsRef.current.length; i++) {
        const s = starsRef.current[i]
        const alpha = 0.25 + 0.65 * Math.abs(Math.sin((time / 1000) * s.speed + s.phase))
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // 2. Rising glowing embers (additive)
      ctx.globalCompositeOperation = 'lighter'
      const embers = embersRef.current
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]
        e.y += e.vy * (dt * 60)
        e.x += e.vx * (dt * 60) + Math.sin(time * 0.002 + i) * 0.2

        if (e.y < -20) {
          e.y = height + 10 + Math.random() * 30
          e.x = Math.random() * width
        }

        const yProgress = Math.max(0, Math.min(1, e.y / height))
        // Fade in from bottom, fade out toward upper atmosphere
        const currentAlpha = e.alpha * Math.sin(yProgress * Math.PI)
        ctx.globalAlpha = Math.max(0, currentAlpha)
        ctx.fillStyle = e.color
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // 3. Fireworks / sparks
      const sparks = sparksRef.current
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]
        p.x += p.vx * (dt * 60)
        p.y += p.vy * (dt * 60)
        p.vy += 0.06 * (dt * 60) // gravity
        p.vx *= 0.985
        p.vy *= 0.985
        p.life -= p.decay * (dt * 60)

        if (p.life <= 0) {
          sparks.splice(i, 1)
          continue
        }

        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    rafId = requestAnimationFrame(render)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      mql.removeEventListener('change', handleMotionChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />
      {/* Warm bottom atmospheric ambient glow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-0 h-2/3 transition-opacity duration-1000 ${
          lit ? 'opacity-90' : 'opacity-40'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at 50% 105%, rgba(255,140,26,0.35) 0%, rgba(255,90,31,0.18) 40%, transparent 75%)',
        }}
      />
    </>
  )
})

export default Sky
