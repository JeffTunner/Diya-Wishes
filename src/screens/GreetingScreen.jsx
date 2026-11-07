import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { MiniDiya } from '../components/Icons.jsx'

export default function GreetingScreen({ onContinue, triggerBloom, recipientName = '' }) {
  const cardRef = useRef(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // 3D tilt coordinates
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 120, damping: 20 })
  const springY = useSpring(y, { stiffness: 120, damping: 20 })
  const rotateX = useTransform(springY, [-150, 150], [8, -8])
  const rotateY = useTransform(springX, [-150, 150], [-8, 8])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)

    // Optional device orientation for mobile tilt
    const handleOrientation = (e) => {
      if (mql.matches || !e.gamma || !e.beta) return
      x.set(Math.max(-150, Math.min(150, e.gamma * 4)))
      y.set(Math.max(-150, Math.min(150, (e.beta - 45) * 3)))
    }

    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      mql.removeEventListener('change', handler)
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [x, y])

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handlePointerLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleAction = (e) => {
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

  const nameDisplay = recipientName.trim()
    ? `Dear ${recipientName.trim()},`
    : 'Dear friend,'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-8 text-center"
      style={{ perspective: 1000 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-[#ffb703]/25 bg-[#170a2b]/85 px-6 py-8 shadow-2xl backdrop-blur-md sm:max-w-md sm:px-8 sm:py-10"
      >
        {/* Decorative Rangoli-style SVG border that draws itself */}
        <svg
          viewBox="0 0 340 440"
          className="pointer-events-none absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] overflow-visible opacity-50"
          aria-hidden="true"
        >
          <rect
            x="8"
            y="8"
            width="324"
            height="424"
            rx="20"
            fill="none"
            stroke="#ffb703"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            className="rangoli-border-path"
          />
          {/* Corner traditional rangoli flourish motifs */}
          <g stroke="#ff8c1a" strokeWidth="1.4" fill="none" className="rangoli-border-path">
            <path d="M12 36 Q36 36 36 12" />
            <path d="M328 36 Q304 36 304 12" />
            <path d="M12 404 Q36 404 36 428" />
            <path d="M328 404 Q304 404 304 428" />
          </g>
          <circle cx="36" cy="36" r="3" fill="#ffb703" />
          <circle cx="304" cy="36" r="3" fill="#ffb703" />
          <circle cx="36" cy="404" r="3" fill="#ffb703" />
          <circle cx="304" cy="404" r="3" fill="#ffb703" />
        </svg>

        {/* Top small auspicious motif */}
        <motion.div variants={itemVariants} className="mb-2 flex items-center justify-center gap-2">
          <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#ffb703]" />
          <span className="text-xs font-semibold tracking-widest text-[#ffb703]/80 uppercase">
            शुभ लाभ
          </span>
          <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#ffb703]" />
        </motion.div>

        {/* Devanagari Display Heading */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-4xl text-[#ffb703] drop-shadow-[0_2px_12px_rgba(255,183,3,0.4)] sm:text-5xl"
        >
          शुभ दीपावली
        </motion.h1>

        {/* English Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-1 text-sm font-semibold tracking-[0.25em] text-[#ff8c1a] uppercase"
        >
          Shubh Deepavali
        </motion.p>

        {/* Recipient line with gold shimmer sweep */}
        <motion.div variants={itemVariants} className="mt-5 mb-3">
          <p className="text-lg font-semibold tracking-wide">
            {recipientName.trim() ? (
              <span className="shimmer-text text-xl font-bold">
                {nameDisplay}
              </span>
            ) : (
              <span className="text-[#fff1d0]">{nameDisplay}</span>
            )}
          </p>
        </motion.div>

        {/* Warm 2-sentence Diwali message */}
        <motion.div
          variants={itemVariants}
          className="space-y-3 px-2 text-sm leading-relaxed text-[#fff1d0]/90 sm:text-base"
        >
          <p>
            May the glow of a thousand diyas light your path with joy, wisdom, and boundless harmony.
          </p>
          <p>
            May every corner of your year find its light, and may peace and prosperity gently find your door.
          </p>
        </motion.div>

        {/* Tiny flickering diyas row */}
        <motion.div
          variants={itemVariants}
          className="my-6 flex items-center justify-center gap-3"
          aria-hidden="true"
        >
          <MiniDiya lit={true} className="w-8 h-7 opacity-75" />
          <MiniDiya lit={true} className="w-9 h-8 opacity-90 scale-110" />
          <MiniDiya lit={true} className="w-10 h-9 opacity-100 scale-125" />
          <MiniDiya lit={true} className="w-9 h-8 opacity-90 scale-110" />
          <MiniDiya lit={true} className="w-8 h-7 opacity-75" />
        </motion.div>

        {/* Continue to Wish Screen Button */}
        <motion.div variants={itemVariants} className="w-full">
          <button
            type="button"
            onClick={handleAction}
            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#ffb703] via-[#ff8c1a] to-[#ff5a1f] px-6 py-3 font-semibold text-[#170a2b] shadow-lg shadow-[#ff8c1a]/30 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Make a wish
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

