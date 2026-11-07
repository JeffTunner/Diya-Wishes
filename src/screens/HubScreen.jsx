import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShareIcon, CopyIcon, CheckIcon } from '../components/Icons.jsx'

export default function HubScreen({ onNavigate, triggerBloom }) {
  const [friendName, setFriendName] = useState('')
  const [copiedToast, setCopiedToast] = useState(false)

  const handleCardClick = (destination, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const origin = {
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top + rect.height / 2}px`,
    }
    triggerBloom(origin)
    setTimeout(() => {
      onNavigate(destination)
    }, 280)
  }

  const handleShare = async (e) => {
    e.preventDefault()
    const trimmed = friendName.trim().slice(0, 24)
    const url = new URL(window.location.origin + window.location.pathname)
    if (trimmed) {
      url.searchParams.set('name', trimmed)
    }
    const shareUrl = url.toString()

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Diya Wishes — Shubh Deepavali',
          text: trimmed
            ? `A special Diwali wish for ${trimmed}! Light your diya:`
            : 'Light a Diwali diya and make a wish:',
          url: shareUrl,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 2600)
    } catch {
      // Prompt fallback
      window.prompt('Copy this Diwali link:', shareUrl)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between px-4 py-6 text-center sm:px-6"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#ffb703]/50 bg-[#170a2b]/95 px-5 py-2.5 text-xs font-semibold text-[#fff1d0] shadow-xl backdrop-blur-md"
          >
            <CheckIcon className="h-4 w-4 text-[#ffb703]" />
            <span>Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="safe-top flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl tracking-wide text-[#ffb703] drop-shadow-md sm:text-4xl"
        >
          Choose your Diwali
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-1 text-xs text-[#fff1d0]/70 sm:text-sm"
        >
          Explore stories, crack fireworks, or draw sacred rangolis
        </motion.p>
      </header>

      {/* 3 Glowing Action Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto my-auto grid w-full max-w-sm grid-cols-1 gap-4 py-4 sm:max-w-md"
      >
        {/* Card 1: Did you know? */}
        <motion.button
          type="button"
          variants={itemVariants}
          onClick={(e) => handleCardClick('fact', e)}
          className="group relative flex min-h-[96px] w-full cursor-pointer items-center gap-4 rounded-3xl border border-[#ffb703]/25 bg-[#170a2b]/80 p-5 text-left shadow-lg backdrop-blur-md transition-all hover:border-[#ffb703]/60 hover:bg-[#170a2b]/95 hover:shadow-[#ffb703]/10 active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffb703]/20 to-[#ff8c1a]/10 border border-[#ffb703]/30 text-[#ffb703] transition-transform group-hover:scale-105">
            {/* Ancient scroll / wisdom book SVG */}
            <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
              <path
                d="M8 12C8 9.79 9.79 8 12 8H36C38.21 8 40 9.79 40 12V36C40 38.21 38.21 40 36 40H12C9.79 40 8 38.21 8 36V12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M14 16H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 24H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M14 32H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <circle cx="34" cy="32" r="3" fill="#ff5a1f" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl text-[#ffb703] group-hover:text-[#ffe8a3]">
              Did you know?
            </span>
            <span className="text-xs text-[#fff1d0]/75">
              Fascinating traditions, legends, and history
            </span>
          </div>
        </motion.button>

        {/* Card 2: Light the crackers */}
        <motion.button
          type="button"
          variants={itemVariants}
          onClick={(e) => handleCardClick('crackers', e)}
          className="group relative flex min-h-[96px] w-full cursor-pointer items-center gap-4 rounded-3xl border border-[#ff8c1a]/30 bg-[#170a2b]/80 p-5 text-left shadow-lg backdrop-blur-md transition-all hover:border-[#ff8c1a]/70 hover:bg-[#170a2b]/95 hover:shadow-[#ff8c1a]/15 active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8c1a]/25 to-[#ff5a1f]/15 border border-[#ff8c1a]/35 text-[#ff8c1a] transition-transform group-hover:scale-105">
            {/* Crackers / fireworks festive SVG */}
            <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
              {/* Rocket body */}
              <line x1="12" y1="36" x2="32" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M30 14L36 12L34 18Z" fill="#ffb703" />
              {/* Sparks radiating */}
              <circle cx="37" cy="11" r="2" fill="#fff1d0" />
              <path d="M38 6L40 4M42 12L45 12M38 18L41 21" stroke="#ffb703" strokeWidth="2" strokeLinecap="round" />
              {/* Flowerpot base */}
              <path d="M14 26L22 34" stroke="#ff5a1f" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl text-[#ff8c1a] group-hover:text-[#ffb703]">
              Light the crackers
            </span>
            <span className="text-xs text-[#fff1d0]/75">
              Sparks, rockets, chakris, anaars & sound
            </span>
          </div>
        </motion.button>

        {/* Card 3: Make a rangoli */}
        <motion.button
          type="button"
          variants={itemVariants}
          onClick={(e) => handleCardClick('rangoli', e)}
          className="group relative flex min-h-[96px] w-full cursor-pointer items-center gap-4 rounded-3xl border border-[#ff5d8f]/30 bg-[#170a2b]/80 p-5 text-left shadow-lg backdrop-blur-md transition-all hover:border-[#ff5d8f]/70 hover:bg-[#170a2b]/95 hover:shadow-[#ff5d8f]/15 active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff5d8f]/20 to-[#ffb703]/15 border border-[#ff5d8f]/35 text-[#ff5d8f] transition-transform group-hover:scale-105">
            {/* Rangoli mandala SVG */}
            <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="24" cy="24" r="10" stroke="#ffb703" strokeWidth="1.5" />
              <path d="M24 6V14M24 34V42M6 24H14M34 24H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="24" r="3" fill="#ffb703" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl text-[#ff5d8f] group-hover:text-[#ffeed0]">
              Make a rangoli
            </span>
            <span className="text-xs text-[#fff1d0]/75">
              Radial powder canvas with sacred symmetry
            </span>
          </div>
        </motion.button>
      </motion.div>

      {/* Footer: Send Diwali wishes to a friend */}
      <footer className="safe-bottom mx-auto w-full max-w-sm sm:max-w-md">
        <form
          onSubmit={handleShare}
          className="flex flex-col gap-2 rounded-2xl border border-[#ffb703]/20 bg-[#170a2b]/70 p-3.5 backdrop-blur-md"
        >
          <span className="text-left text-xs font-semibold text-[#ffb703]">
            Send Diwali wishes to a friend
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              maxLength={24}
              placeholder="Friend's name (e.g. Priya)"
              className="min-w-0 flex-1 rounded-xl border border-[#ffb703]/30 bg-[#07030f]/60 px-3.5 py-2.5 text-xs text-[#fff1d0] placeholder-[#fff1d0]/40 outline-none focus:border-[#ffb703]"
            />
            <button
              type="submit"
              className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ff8c1a] px-4 py-2.5 text-xs font-semibold text-[#170a2b] shadow-sm transition-all hover:brightness-110 active:scale-95"
            >
              <ShareIcon className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </form>
      </footer>
    </motion.div>
  )
}

