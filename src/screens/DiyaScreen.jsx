import { useState } from 'react'
import { motion } from 'framer-motion'
import Diya from '../components/Diya.jsx'
import { playWhoosh, initAudioOnGesture } from '../lib/audio.js'

export default function DiyaScreen({ onLightComplete, triggerBloom }) {
  const [isLighting, setIsLighting] = useState(false)

  const handleLight = (e) => {
    if (isLighting) return
    initAudioOnGesture()
    setIsLighting(true)
    playWhoosh()

    // Capture click position for bloom origin
    const rect = e.currentTarget.getBoundingClientRect()
    const origin = {
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top + rect.height * 0.35}px`,
    }

    // After 1.4s, trigger light bloom and advance to greeting
    setTimeout(() => {
      triggerBloom(origin)
      setTimeout(() => {
        onLightComplete()
      }, 350)
    }, 1400)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-between px-6 py-12 text-center"
    >
      <header className="safe-top flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="font-display text-2xl tracking-wider text-[#ffb703] sm:text-3xl">
            दीपावली
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-[#fff1d0]/60">
            Festival of Lights
          </span>
        </motion.div>
      </header>

      {/* Main hero center diya */}
      <div className="my-auto flex flex-col items-center gap-8">
        <button
          type="button"
          onClick={handleLight}
          disabled={isLighting}
          aria-label={isLighting ? 'Diya is glowing' : 'Tap the diya to light it'}
          className="group relative flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full p-6 transition-transform active:scale-95 disabled:cursor-default"
        >
          {/* Subtle guide ring pulsing before tap */}
          {!isLighting && (
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.1, 0.35],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="pointer-events-none absolute inset-2 rounded-full border border-[#ffb703]/30"
            />
          )}

          <Diya size="large" lit={isLighting} />
        </button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isLighting ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          className="text-sm font-medium tracking-wide text-[#fff1d0]/80 sm:text-base"
        >
          Tap the diya to light it
        </motion.p>
      </div>

      <footer className="safe-bottom">
        <p className="text-xs text-[#fff1d0]/40">
          May your life be illuminated with joy & peace
        </p>
      </footer>
    </motion.div>
  )
}

