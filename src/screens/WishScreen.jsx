import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Diya from '../components/Diya.jsx'
import { playFireworkBurst, playWhoosh } from '../lib/audio.js'
import { supabase } from '../lib/supabase.js'

const COOLDOWN_KEY = 'diya_wish_last_sent'
const COOLDOWN_MS = 10000

export default function WishScreen({ onContinue, triggerBloom, recipientName = '', skyRef }) {
  const [wishText, setWishText] = useState('')
  const [lanterns, setLanterns] = useState([])
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const [showContinue, setShowContinue] = useState(false)
  const diyaRef = useRef(null)

  // Manage 10-second cooldown from localStorage
  useEffect(() => {
    const checkCooldown = () => {
      try {
        const lastSentStr = localStorage.getItem(COOLDOWN_KEY)
        if (lastSentStr) {
          const elapsed = Date.now() - parseInt(lastSentStr, 10)
          if (elapsed < COOLDOWN_MS) {
            setCooldownLeft(Math.ceil((COOLDOWN_MS - elapsed) / 1000))
            return
          }
        }
      } catch {
        // Ignore storage errors
      }
      setCooldownLeft(0)
    }

    checkCooldown()
    const timer = setInterval(checkCooldown, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSend = (e) => {
    e.preventDefault()
    const trimmed = wishText.trim()
    if (!trimmed || cooldownLeft > 0) return

    // Set cooldown
    try {
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
    } catch {
      // Ignore
    }
    setCooldownLeft(10)

    // Fire-and-forget save to Supabase
    if (supabase) {
      const nameVal = recipientName.trim() ? recipientName.trim().slice(0, 24) : null
      supabase
        .from('wishes')
        .insert({ name: nameVal, text: trimmed.slice(0, 80) })
        .then(() => {})
        .catch((err) => {
          console.warn('Supabase insert skipped or failed:', err)
        })
    }

    // Launch lantern
    const newId = crypto.randomUUID()
    const randomDx = Math.round((Math.random() - 0.5) * 80)
    setLanterns((prev) => [...prev, { id: newId, text: trimmed, dx: randomDx }])
    setWishText('')
    playWhoosh()
  }

  // Lantern reached top apex
  const handleLanternArrived = (id, el) => {
    if (el && skyRef?.current) {
      const r = el.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2

      skyRef.current.burst(x, y, 90)
      playFireworkBurst(0.4)

      setTimeout(() => {
        skyRef.current?.burst(x - 45, y + 25, 75)
        playFireworkBurst(0.3)
      }, 200)

      setTimeout(() => {
        skyRef.current?.burst(x + 50, y - 20, 85)
        playFireworkBurst(0.35)
      }, 400)
    }

    setLanterns((prev) => prev.filter((item) => item.id !== id))
    setShowContinue(true)
  }

  const handleAdvance = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const origin = {
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top + rect.height / 2}px`,
    }
    triggerBloom(origin)
    setTimeout(() => {
      onContinue()
    }, 280)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between px-4 py-8 text-center sm:px-6"
    >
      {/* Top Header */}
      <header className="safe-top flex flex-col items-center">
        <h2 className="font-display text-3xl text-[#ffb703] drop-shadow-md sm:text-4xl">
          Send Your Wish
        </h2>
        <p className="mt-1 text-sm text-[#fff1d0]/75">
          Write a prayer for peace, health, or someone you love
        </p>
      </header>

      {/* Middle Form Area */}
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
        <form onSubmit={handleSend} className="flex w-full flex-col gap-3">
          <div className="relative w-full">
            <input
              type="text"
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              maxLength={80}
              placeholder="Make a wish…"
              disabled={cooldownLeft > 0}
              className="w-full rounded-2xl border border-[#ffb703]/30 bg-[#170a2b]/80 px-4 py-3.5 text-sm text-[#fff1d0] placeholder-[#fff1d0]/40 backdrop-blur-md outline-none transition-all focus:border-[#ffb703] focus:ring-2 focus:ring-[#ffb703]/20 disabled:opacity-60"
            />
            <span className="pointer-events-none absolute right-3 top-3.5 text-xs text-[#fff1d0]/40">
              {80 - wishText.length}
            </span>
          </div>

          <button
            type="submit"
            disabled={!wishText.trim() || cooldownLeft > 0}
            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#ff8c1a] px-6 py-3 font-semibold text-[#170a2b] shadow-md shadow-[#ff8c1a]/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send wish
          </button>
        </form>

        {/* Cooldown banner */}
        {cooldownLeft > 0 && (
          <p className="text-xs font-medium text-[#ff8c1a]/90">
            Please wait {cooldownLeft}s before sending another wish
          </p>
        )}

        {/* Continue & Skip Links */}
        <div className="flex flex-col items-center gap-2 pt-2">
          {showContinue && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={handleAdvance}
              className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ffb703]/50 bg-[#170a2b]/90 px-8 py-2.5 text-sm font-semibold text-[#ffb703] shadow-lg backdrop-blur-md transition-all hover:bg-[#ffb703] hover:text-[#170a2b] active:scale-95"
            >
              Continue to Diwali Hub
            </motion.button>
          )}

          <button
            type="button"
            onClick={handleAdvance}
            className="min-h-[44px] cursor-pointer text-xs text-[#fff1d0]/50 underline-offset-4 hover:text-[#fff1d0]/80 hover:underline"
          >
            Skip to Diwali activities
          </button>
        </div>
      </div>

      {/* Floating Lanterns (animated rising from diya) */}
      <AnimatePresence>
        {lanterns.map((l) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 40, x: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 1],
              y: -window.innerHeight * 0.56,
              x: l.dx,
              scale: 1,
            }}
            transition={{
              duration: 4.2,
              ease: [0.2, 0.6, 0.3, 1],
            }}
            onAnimationComplete={() => {
              const el = document.getElementById(`lantern-${l.id}`)
              handleLanternArrived(l.id, el)
            }}
            id={`lantern-${l.id}`}
            className="pointer-events-none fixed left-1/2 bottom-[24vh] z-30 -translate-x-1/2"
          >
            <div className="relative flex w-32 flex-col items-center rounded-2xl bg-gradient-to-b from-[#ffd166] via-[#ff9f1c] to-[#ff5a1f] p-3 text-center shadow-[0_0_35px_10px_rgba(255,160,40,0.7)]">
              <span className="line-clamp-3 text-xs font-semibold leading-tight text-[#4a1d00]">
                {l.text}
              </span>
              <div className="mt-1.5 h-1.5 w-6 rounded-full bg-[#fff1d0]/80 blur-[1px]" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Bottom compact diya */}
      <footer ref={diyaRef} className="safe-bottom flex flex-col items-center">
        <Diya size="small" lit={true} />
      </footer>
    </motion.div>
  )
}

