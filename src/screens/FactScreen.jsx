import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FactBag } from '../lib/facts.js'
import { ArrowLeftIcon, RefreshIcon, SparklesIcon } from '../components/Icons.jsx'
import { playChime } from '../lib/audio.js'

export default function FactScreen({ onBack, triggerBloom }) {
  const bag = useMemo(() => new FactBag(), [])
  const [currentFact, setCurrentFact] = useState(() => bag.next())
  const [factIndex, setFactIndex] = useState(1)
  const [isFlipping, setIsFlipping] = useState(false)

  const handleNextFact = () => {
    if (isFlipping) return
    setIsFlipping(true)
    playChime()
    setTimeout(() => {
      setCurrentFact(bag.next())
      setFactIndex((prev) => (prev % 25) + 1)
      setIsFlipping(false)
    }, 220)
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between px-4 py-6 sm:px-6"
    >
      {/* Top Bar with Back Button */}
      <header className="safe-top flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to Diwali Hub"
          className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ffb703]/30 bg-[#170a2b]/80 p-2.5 text-[#ffb703] shadow-md backdrop-blur-md transition-all hover:border-[#ffb703] hover:bg-[#ffb703]/20 active:scale-95"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 rounded-full border border-[#ffb703]/25 bg-[#170a2b]/70 px-3.5 py-1 text-xs font-semibold text-[#ffb703] backdrop-blur-md">
          <SparklesIcon className="h-3.5 w-3.5 text-[#ff8c1a]" />
          <span>Did you know?</span>
        </div>

        {/* Balance spacer */}
        <div className="w-10" />
      </header>

      {/* Main Fact Card with Smooth Flip Transition */}
      <div className="mx-auto my-auto flex w-full max-w-sm flex-col items-center justify-center sm:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFact}
            initial={{ opacity: 0, scale: 0.92, rotateY: -35 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.92, rotateY: 35 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className="relative flex min-h-[260px] w-full flex-col justify-between rounded-3xl border border-[#ffb703]/35 bg-[#170a2b]/90 p-7 shadow-2xl backdrop-blur-xl sm:min-h-[290px] sm:p-9"
          >
            {/* Ambient golden corner glows */}
            <div
              className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-25 blur-2xl"
              style={{ background: 'radial-gradient(circle, #ffb703 0%, transparent 70%)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
              style={{ background: 'radial-gradient(circle, #ff8c1a 0%, transparent 70%)' }}
            />

            {/* Top metadata */}
            <div className="flex items-center justify-between border-b border-[#ffb703]/15 pb-3">
              <span className="font-display text-sm tracking-wider text-[#ff8c1a] uppercase">
                Diwali Lore
              </span>
              <span className="text-xs font-medium text-[#fff1d0]/50">
                {factIndex} of 25
              </span>
            </div>

            {/* Fact Text */}
            <div className="my-auto py-4">
              <p className="font-body text-base leading-relaxed text-[#fff1d0] sm:text-lg sm:leading-relaxed">
                "{currentFact}"
              </p>
            </div>

            {/* Bottom card decor */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="h-1 w-1 rounded-full bg-[#ffb703]" />
              <span className="h-1 w-8 rounded-full bg-gradient-to-r from-[#ffb703] to-[#ff8c1a]" />
              <span className="h-1 w-1 rounded-full bg-[#ff8c1a]" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Another Fact Button */}
        <motion.button
          type="button"
          onClick={handleNextFact}
          whileTap={{ scale: 0.96 }}
          className="mt-6 flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ffb703] to-[#ff8c1a] px-7 py-3 text-sm font-semibold text-[#170a2b] shadow-lg shadow-[#ff8c1a]/25 transition-all hover:brightness-110 active:scale-95"
        >
          <RefreshIcon className={`h-4 w-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>Another fact</span>
        </motion.button>
      </div>

      {/* Safe bottom spacer */}
      <footer className="safe-bottom" />
    </motion.div>
  )
}

