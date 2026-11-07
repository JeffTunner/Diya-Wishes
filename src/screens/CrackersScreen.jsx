import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftIcon,
  TrashIcon,
  FlameIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
} from '../components/Icons.jsx'
import {
  CRACKER_TYPES,
  LadiSvg,
  RocketSvg,
  ChakriSvg,
  AnaarSvg,
  SparklerSvg,
  AtomBombSvg,
} from '../components/CrackerArt.jsx'
import {
  playFuseSpark,
  playLadiPop,
  playRocketWhistle,
  playFireworkBurst,
  playChakriLoop,
  playAnaarHiss,
  playSparklerSizzle,
  playAtomBomb,
  isAudioMuted,
  toggleAudioMute,
  subscribeAudioMute,
  initAudioOnGesture,
} from '../lib/audio.js'

const CRACKER_COMPONENTS = {
  ladi: LadiSvg,
  rocket: RocketSvg,
  chakri: ChakriSvg,
  anaar: AnaarSvg,
  sparkler: SparklerSvg,
  atombomb: AtomBombSvg,
}

export default function CrackersScreen({ onBack, triggerBloom, skyRef }) {
  const [placedCrackers, setPlacedCrackers] = useState([])
  const [selectedTrayType, setSelectedTrayType] = useState(null)
  const [draggingType, setDraggingType] = useState(null)
  const [dragPointerPos, setDragPointerPos] = useState({ x: 0, y: 0 })
  const [screenShaking, setScreenShaking] = useState(false)
  const [whiteFlash, setWhiteFlash] = useState(false)
  const [muted, setMuted] = useState(isAudioMuted())

  const groundRef = useRef(null)
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const emittersRef = useRef([]) // Active continuous emitters (anaar, sparkler, chakri, etc.)
  const isHiddenRef = useRef(false)

  // Sync mute state
  useEffect(() => {
    const unsub = subscribeAudioMute((val) => setMuted(val))
    return unsub
  }, [])

  // Canvas particle loop for ground effects
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let rafId = null
    let lastTime = performance.now()

    const handleVisibility = () => {
      isHiddenRef.current = document.hidden
      if (!document.hidden) lastTime = performance.now()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = groundRef.current ? groundRef.current.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight }
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const render = (time) => {
      rafId = requestAnimationFrame(render)
      if (isHiddenRef.current) return
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      const rect = groundRef.current ? groundRef.current.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight }
      ctx.clearRect(0, 0, rect.width, rect.height)

      // 1. Process active emitters
      const emitters = emittersRef.current
      for (let i = emitters.length - 1; i >= 0; i--) {
        const em = emitters[i]
        em.elapsed += dt

        if (em.type === 'anaar' && em.elapsed < em.duration) {
          // Fountain shooting up
          const count = 7
          for (let k = 0; k < count; k++) {
            if (particlesRef.current.length > 1400) break
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.55
            const speed = 7 + Math.random() * 8.5
            particlesRef.current.push({
              x: em.x + (Math.random() - 0.5) * 8,
              y: em.y - 14,
              vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
              vy: Math.sin(angle) * speed,
              life: 1,
              decay: 0.016 + Math.random() * 0.02,
              color: Math.random() > 0.3 ? '#ffb703' : '#fff1a8',
              size: 1.5 + Math.random() * 2,
              gravity: 0.18,
            })
          }
        } else if (em.type === 'sparkler' && em.elapsed < em.duration) {
          // Fine radial spark shower
          const count = 5
          for (let k = 0; k < count; k++) {
            if (particlesRef.current.length > 1400) break
            const angle = Math.random() * Math.PI * 2
            const speed = 1.5 + Math.random() * 5.2
            particlesRef.current.push({
              x: em.x,
              y: em.y - 18,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              decay: 0.025 + Math.random() * 0.035,
              color: Math.random() > 0.4 ? '#fff8e7' : '#ffd166',
              size: 1.2 + Math.random() * 1.5,
              gravity: 0.08,
            })
          }
        } else if (em.type === 'chakri' && em.elapsed < em.duration) {
          // Spinning spiral of ground sparks
          const count = 6
          const baseAngle = em.elapsed * 18
          for (let k = 0; k < count; k++) {
            if (particlesRef.current.length > 1400) break
            const angle = baseAngle + (k * (Math.PI * 2)) / count
            const speed = 3.5 + Math.random() * 4.5
            particlesRef.current.push({
              x: em.x,
              y: em.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              decay: 0.02 + Math.random() * 0.02,
              color: Math.random() > 0.5 ? '#ffb703' : '#ff5a1f',
              size: 1.6 + Math.random() * 1.8,
              gravity: 0.04,
            })
          }
        }

        if (em.elapsed >= em.duration) {
          emitters.splice(i, 1)
        }
      }

      // 2. Render particles with additive glow
      ctx.globalCompositeOperation = 'lighter'
      const pArr = particlesRef.current
      for (let i = pArr.length - 1; i >= 0; i--) {
        const p = pArr[i]
        p.x += p.vx * (dt * 60)
        p.y += p.vy * (dt * 60)
        p.vy += (p.gravity || 0.08) * (dt * 60)
        p.vx *= 0.98
        p.vy *= 0.98
        p.life -= p.decay * (dt * 60)

        if (p.life <= 0) {
          pArr.splice(i, 1)
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
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Place a cracker at coordinates
  const placeCracker = (type, clientX, clientY) => {
    if (placedCrackers.length >= 12) return
    const ground = groundRef.current
    if (!ground) return
    const rect = ground.getBoundingClientRect()
    // Ensure it's placed inside ground bounds
    const x = Math.max(30, Math.min(rect.width - 30, clientX - rect.left))
    const y = Math.max(40, Math.min(rect.height - 30, clientY - rect.top))

    const newCracker = {
      id: crypto.randomUUID(),
      type,
      x,
      y,
      state: 'idle', // idle -> lighting -> active -> spent
      rotation: 0,
    }

    setPlacedCrackers((prev) => [...prev, newCracker])
  }

  // Pointer drag events from tray
  const handleTrayPointerDown = (type, e) => {
    initAudioOnGesture()
    setDraggingType(type)
    setDragPointerPos({ x: e.clientX, y: e.clientY })
    setSelectedTrayType(type)
  }

  const handlePointerMove = (e) => {
    if (draggingType) {
      setDragPointerPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (e) => {
    if (draggingType && groundRef.current) {
      const rect = groundRef.current.getBoundingClientRect()
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        placeCracker(draggingType, e.clientX, e.clientY)
        setSelectedTrayType(null)
      }
    }
    setDraggingType(null)
  }

  // Tap ground when a tray item is selected
  const handleGroundClick = (e) => {
    if (selectedTrayType && !draggingType) {
      placeCracker(selectedTrayType, e.clientX, e.clientY)
      setSelectedTrayType(null)
    }
  }

  // Ignite individual cracker
  const igniteCracker = (id) => {
    initAudioOnGesture()
    setPlacedCrackers((prev) =>
      prev.map((c) => {
        if (c.id !== id || c.state !== 'idle') return c
        return { ...c, state: 'lighting' }
      })
    )

    playFuseSpark()

    // 0.6s fuse travel time
    setTimeout(() => {
      setPlacedCrackers((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          return { ...c, state: 'active' }
        })
      )
      executeCrackerEffect(id)
    }, 600)
  }

  const executeCrackerEffect = (id) => {
    const cracker = placedCrackers.find((c) => c.id === id)
    if (!cracker) return
    const { type, x, y } = cracker

    if (type === 'ladi') {
      // Rapid chain of 16 bangs over 1.8s
      let count = 0
      const interval = setInterval(() => {
        count++
        playLadiPop(0.9 + Math.random() * 0.4)

        // Micro flash and sparks
        const ground = groundRef.current
        if (ground) {
          for (let k = 0; k < 12; k++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 2 + Math.random() * 4
            particlesRef.current.push({
              x: x + (Math.random() - 0.5) * 20,
              y: y + (Math.random() - 0.5) * 20,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              decay: 0.04 + Math.random() * 0.04,
              color: Math.random() > 0.5 ? '#fff1d0' : '#d90429',
              size: 1.5,
              gravity: 0.05,
            })
          }
        }

        if (count >= 16) {
          clearInterval(interval)
          setPlacedCrackers((prev) =>
            prev.map((c) => (c.id === id ? { ...c, state: 'spent' } : c))
          )
        }
      }, 110)
    } else if (type === 'rocket') {
      // Whistle up, smoke trail, then explode high in sky
      playRocketWhistle()

      // Animate rocket rising in DOM
      setPlacedCrackers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, state: 'launching' } : c))
      )

      setTimeout(() => {
        const groundRect = groundRef.current?.getBoundingClientRect()
        const burstX = groundRect ? groundRect.left + x : x
        const burstY = groundRect ? groundRect.top + y - 260 : y - 260

        skyRef?.current?.burst(burstX, Math.max(80, burstY), 120, [
          '#ffb703',
          '#ff5d8f',
          '#52b788',
          '#00b4d8',
          '#fff1d0',
        ])
        playFireworkBurst(0.45)

        setPlacedCrackers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, state: 'spent' } : c))
        )
      }, 750)
    } else if (type === 'chakri') {
      // Spins on ground for 3.5s
      playChakriLoop(3.5)
      emittersRef.current.push({
        type: 'chakri',
        x,
        y,
        duration: 3.5,
        elapsed: 0,
      })

      setTimeout(() => {
        setPlacedCrackers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, state: 'spent' } : c))
        )
      }, 3500)
    } else if (type === 'anaar') {
      // Tall golden fountain for 4s
      playAnaarHiss(4)
      emittersRef.current.push({
        type: 'anaar',
        x,
        y,
        duration: 4,
        elapsed: 0,
      })

      setTimeout(() => {
        setPlacedCrackers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, state: 'spent' } : c))
        )
      }, 4000)
    } else if (type === 'sparkler') {
      // Continuous fine spark shower for 5s
      playSparklerSizzle(5)
      emittersRef.current.push({
        type: 'sparkler',
        x,
        y,
        duration: 5,
        elapsed: 0,
      })

      setTimeout(() => {
        setPlacedCrackers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, state: 'spent' } : c))
        )
      }, 5000)
    } else if (type === 'atombomb') {
      // White flash, huge shockwave ring, screen shake, boom
      setWhiteFlash(true)
      setScreenShaking(true)
      playAtomBomb()

      const groundRect = groundRef.current?.getBoundingClientRect()
      const absX = groundRect ? groundRect.left + x : x
      const absY = groundRect ? groundRect.top + y : y

      skyRef?.current?.ringShockwave(absX, absY, 120, '#ffb703')

      // Falling debris sparks
      for (let k = 0; k < 60; k++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 4 + Math.random() * 8
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          life: 1,
          decay: 0.012 + Math.random() * 0.015,
          color: Math.random() > 0.4 ? '#ff5a1f' : '#ffb703',
          size: 2.2,
          gravity: 0.2,
        })
      }

      setTimeout(() => setWhiteFlash(false), 90)
      setTimeout(() => setScreenShaking(false), 650)
      setPlacedCrackers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, state: 'spent' } : c))
      )
    }
  }

  // Light all placed unlit crackers with staggered delays
  const handleLightAll = () => {
    initAudioOnGesture()
    placedCrackers
      .filter((c) => c.state === 'idle')
      .forEach((c) => {
        const delay = 100 + Math.random() * 1100
        setTimeout(() => {
          igniteCracker(c.id)
        }, delay)
      })
  }

  // Clear all or spent crackers
  const handleClear = () => {
    setPlacedCrackers([])
    particlesRef.current = []
    emittersRef.current = []
  }

  const handleBack = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const origin = {
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top + rect.height / 2}px`,
    }
    triggerBloom(origin)
    setTimeout(() => {
      onBack()
    }, 280)
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative z-10 flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden select-none touch-none ${
        screenShaking ? 'screen-shake' : ''
      }`}
    >
      {/* White blast flash overlay for Atom Bomb */}
      {whiteFlash && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-white/80 transition-opacity" />
      )}

      {/* Top Header Bar */}
      <header className="safe-top relative z-30 flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to Diwali Hub"
          className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ffb703]/30 bg-[#170a2b]/80 p-2 text-[#ffb703] shadow-md backdrop-blur-md transition-all hover:border-[#ffb703] active:scale-95"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          {placedCrackers.some((c) => c.state === 'idle') && (
            <button
              type="button"
              onClick={handleLightAll}
              className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff5a1f] to-[#ffb703] px-4 py-2 text-xs font-bold text-[#170a2b] shadow-lg shadow-[#ff5a1f]/30 transition-all hover:brightness-110 active:scale-95"
            >
              <FlameIcon className="h-4 w-4" />
              <span>Light all</span>
            </button>
          )}

          {placedCrackers.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear crackers"
              className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ff5d8f]/30 bg-[#170a2b]/80 p-2 text-[#ff5d8f] shadow-md backdrop-blur-md transition-all hover:border-[#ff5d8f] active:scale-95"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}

          {/* Sound mute toggle */}
          <button
            type="button"
            onClick={() => toggleAudioMute()}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ffb703]/30 bg-[#170a2b]/80 p-2 text-[#ffb703] shadow-md backdrop-blur-md transition-all active:scale-95"
          >
            {muted ? (
              <VolumeMuteIcon className="h-4 w-4 text-[#fff1d0]/50" />
            ) : (
              <VolumeHighIcon className="h-4 w-4 text-[#ffb703]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Ground Playground Area */}
      <div
        ref={groundRef}
        onClick={handleGroundClick}
        style={{ touchAction: 'none' }}
        className="relative z-10 flex-1 w-full cursor-crosshair overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* Placing Guide Hint when tray has selected item */}
        {selectedTrayType && (
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#ffb703]/40 bg-[#170a2b]/90 px-4 py-1.5 text-xs font-semibold text-[#ffb703] shadow-lg backdrop-blur-md">
            Tap ground to place {selectedTrayType}
          </div>
        )}

        {placedCrackers.length === 0 && !selectedTrayType && (
          <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 text-center text-xs text-[#fff1d0]/40">
            Drag a cracker or tap one below, then tap the ground
          </div>
        )}

        {/* Placed Crackers on Ground */}
        {placedCrackers.map((c) => {
          const Comp = CRACKER_COMPONENTS[c.type]
          const isLighting = c.state === 'lighting'
          const isActive = c.state === 'active'
          const isLaunching = c.state === 'launching'
          const isSpent = c.state === 'spent'

          return (
            <div
              key={c.id}
              onClick={(e) => {
                e.stopPropagation()
                if (c.state === 'idle') igniteCracker(c.id)
              }}
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute z-20 flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center transition-all ${
                isLaunching ? '-translate-y-96 opacity-0 duration-700' : ''
              } ${isSpent ? 'opacity-35 grayscale' : ''}`}
            >
              {/* Spark fuse indicator */}
              {isLighting && (
                <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 h-2.5 w-2.5 animate-ping rounded-full bg-[#ffb703] shadow-[0_0_10px_#ffb703]" />
              )}

              {/* Chakri spinning animation */}
              <div
                className={`${
                  c.type === 'chakri' && isActive ? 'animate-spin' : ''
                }`}
              >
                <Comp className="h-10 w-10 drop-shadow-md sm:h-12 sm:w-12" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating Ghost Drag Preview */}
      {draggingType && (
        <div
          style={{
            position: 'fixed',
            left: `${dragPointerPos.x}px`,
            top: `${dragPointerPos.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 60,
          }}
          className="opacity-80 scale-110 drop-shadow-2xl"
        >
          {(() => {
            const GhostComp = CRACKER_COMPONENTS[draggingType]
            return GhostComp ? <GhostComp className="h-12 w-12" /> : null
          })()}
        </div>
      )}

      {/* Bottom Tray of 6 Crackers (Fixed for Thumb Reach) */}
      <footer className="safe-bottom relative z-30 w-full border-t border-[#ffb703]/20 bg-[#170a2b]/95 px-3 py-2.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-1 overflow-x-auto">
          {CRACKER_TYPES.map(({ id, name, Component }) => {
            const isSelected = selectedTrayType === id
            return (
              <button
                key={id}
                type="button"
                onPointerDown={(e) => handleTrayPointerDown(id, e)}
                onClick={() => setSelectedTrayType((prev) => (prev === id ? null : id))}
                aria-label={`Select ${name}`}
                className={`flex min-h-[52px] min-w-[48px] flex-1 flex-col items-center justify-center rounded-2xl p-1.5 transition-all ${
                  isSelected
                    ? 'border-2 border-[#ffb703] bg-[#ffb703]/20 scale-105 shadow-md shadow-[#ffb703]/20'
                    : 'border border-[#ffb703]/20 bg-[#07030f]/60 hover:border-[#ffb703]/40'
                } active:scale-95`}
              >
                <Component className="h-6 w-6 sm:h-7 sm:w-7" />
                <span className="mt-1 text-[10px] font-semibold tracking-tight text-[#fff1d0]/80">
                  {name}
                </span>
              </button>
            )
          })}
        </div>
      </footer>
    </div>
  )
}

