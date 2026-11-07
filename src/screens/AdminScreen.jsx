import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { ArrowLeftIcon, TrashIcon, SparklesIcon } from '../components/Icons.jsx'
import { playFireworkBurst } from '../lib/audio.js'

function formatRelativeTime(dateStr) {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffSec = Math.floor((now - date) / 1000)
    if (diffSec < 45) return 'just now'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
    if (diffSec < 172800) return 'yesterday'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return 'recently'
  }
}

export default function AdminScreen({ onExitAdmin, skyRef }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [wishes, setWishes] = useState([])
  const [isWallMode, setIsWallMode] = useState(false)
  const [wallLanterns, setWallLanterns] = useState([])
  const wallIntervalRef = useRef(null)

  // Check auth state on mount
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch initial wishes and setup realtime subscription when session is active
  useEffect(() => {
    if (!supabase || !session) return

    // 1. Fetch latest 200 wishes
    const fetchWishes = async () => {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!error && data) {
        setWishes(data)
      }
    }

    fetchWishes()

    // 2. Setup realtime channel for INSERT and DELETE
    const channel = supabase
      .channel('admin-wishes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes' },
        (payload) => {
          setWishes((prev) => [payload.new, ...prev.filter((w) => w.id !== payload.new.id)])
          // In wall mode, launch a live lantern + firework
          if (isWallMode) {
            launchWallLantern(payload.new)
            skyRef?.current?.burst(
              window.innerWidth * (0.2 + Math.random() * 0.6),
              window.innerHeight * 0.35,
              75
            )
            playFireworkBurst(0.3)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'wishes' },
        (payload) => {
          setWishes((prev) => prev.filter((w) => w.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, isWallMode, skyRef])

  // Helper to spawn a wall lantern
  const launchWallLantern = (wish, delay = 0) => {
    const id = `${wish.id}-${Date.now()}-${Math.random()}`
    const startX = 15 + Math.random() * 70 // percentage across screen
    const dx = (Math.random() - 0.5) * 60
    const duration = 9 + Math.random() * 5

    setTimeout(() => {
      setWallLanterns((prev) => [
        ...prev,
        { id, text: wish.text, name: wish.name, startX, dx, duration },
      ])
    }, delay)
  }

  // Handle wall mode activation
  useEffect(() => {
    if (isWallMode && wishes.length > 0) {
      // Stagger latest 30 float up on load
      setWallLanterns([])
      const top30 = wishes.slice(0, 30)
      top30.forEach((w, index) => {
        launchWallLantern(w, index * 650)
      })

      // Recurring drift of random wishes from collection
      wallIntervalRef.current = setInterval(() => {
        if (wishes.length > 0) {
          const randomWish = wishes[Math.floor(Math.random() * wishes.length)]
          launchWallLantern(randomWish)
        }
      }, 3500)
    } else {
      setWallLanterns([])
      if (wallIntervalRef.current) clearInterval(wallIntervalRef.current)
    }

    return () => {
      if (wallIntervalRef.current) clearInterval(wallIntervalRef.current)
    }
  }, [isWallMode, wishes])

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!supabase) return
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setAuthError(error.message)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }

  const handleDelete = async (wishId) => {
    if (!supabase) return
    const { error } = await supabase.from('wishes').delete().eq('id', wishId)
    if (!error) {
      setWishes((prev) => prev.filter((w) => w.id !== wishId))
    }
  }

  // If Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-sm rounded-3xl border border-[#ffb703]/30 bg-[#170a2b]/90 p-8 shadow-2xl backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffb703]/20 text-[#ffb703]">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl text-[#ffb703]">Supabase Not Configured</h2>
          <p className="mt-3 text-xs leading-relaxed text-[#fff1d0]/75">
            To enable cloud wish persistence, configure <code className="text-[#ffb703]">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-[#ffb703]">VITE_SUPABASE_ANON_KEY</code> in your environment variables.
          </p>
          <button
            type="button"
            onClick={onExitAdmin}
            className="mt-6 flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-2xl bg-[#ffb703] px-4 py-2.5 text-xs font-bold text-[#170a2b] shadow-md transition-all active:scale-95"
          >
            Return to Diya Wishes
          </button>
        </div>
      </div>
    )
  }

  // Not logged in: Show Login Form
  if (!session) {
    return (
      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-3xl border border-[#ffb703]/35 bg-[#170a2b]/95 p-7 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onExitAdmin}
              aria-label="Exit admin"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#ffb703]/25 bg-[#07030f]/60 text-[#ffb703]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold tracking-wider text-[#ffb703] uppercase">
              Admin Portal
            </span>
            <div className="w-8" />
          </div>

          <h2 className="font-display text-2xl text-[#ffb703]">Admin Sign In</h2>
          <p className="mt-1 text-xs text-[#fff1d0]/60">
            Sign in to moderate wishes & launch the lantern wall
          </p>

          <form onSubmit={handleSignIn} className="mt-6 flex flex-col gap-3.5 text-left">
            <div>
              <label className="text-[11px] font-medium text-[#fff1d0]/70">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1 w-full rounded-xl border border-[#ffb703]/30 bg-[#07030f]/70 px-3.5 py-2.5 text-xs text-[#fff1d0] outline-none focus:border-[#ffb703]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#fff1d0]/70">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-[#ffb703]/30 bg-[#07030f]/70 px-3.5 py-2.5 text-xs text-[#fff1d0] outline-none focus:border-[#ffb703]"
              />
            </div>

            {authError && (
              <p className="text-xs text-[#ff5d8f]">{authError}</p>
            )}

            <button
              type="submit"
              className="mt-2 flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ff8c1a] px-4 py-2.5 text-xs font-bold text-[#170a2b] shadow-md transition-all active:scale-95"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Wall Mode: Fullscreen Sky with drifting lanterns
  if (isWallMode) {
    return (
      <div className="fixed inset-0 z-40 overflow-hidden">
        {/* Floating Wall Lanterns */}
        {wallLanterns.map((l) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: window.innerHeight + 60, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -180,
              x: l.dx,
              scale: [0.6, 1, 1, 0.9],
            }}
            transition={{
              duration: l.duration,
              ease: 'linear',
            }}
            onAnimationComplete={() => {
              setWallLanterns((prev) => prev.filter((item) => item.id !== l.id))
            }}
            style={{ left: `${l.startX}%` }}
            className="pointer-events-none fixed bottom-0 z-20"
          >
            <div className="flex w-36 flex-col items-center rounded-2xl bg-gradient-to-b from-[#ffd166] via-[#ff9f1c] to-[#ff5a1f] p-3 text-center shadow-[0_0_40px_12px_rgba(255,160,40,0.7)]">
              <span className="text-[10px] font-semibold tracking-wider text-[#4a1d00]/70 uppercase">
                {l.name ? l.name : 'Anonymous'}
              </span>
              <p className="mt-0.5 line-clamp-3 text-xs font-bold leading-tight text-[#4a1d00]">
                {l.text}
              </p>
              <div className="mt-1 h-1.5 w-6 rounded-full bg-[#fff1d0]/80 blur-[1px]" />
            </div>
          </motion.div>
        ))}

        {/* Minimal Floating Exit Wall Mode Controls */}
        <div className="safe-top fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWallMode(false)}
            className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-[#ffb703]/50 bg-[#170a2b]/90 px-4 py-2 text-xs font-semibold text-[#ffb703] shadow-2xl backdrop-blur-md transition-all active:scale-95"
          >
            Exit Wall Mode
          </button>
        </div>
      </div>
    )
  }

  // Logged In Admin: Live Wishes Feed & Moderation
  return (
    <div className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden">
      {/* Header */}
      <header className="safe-top relative z-30 flex items-center justify-between border-b border-[#ffb703]/20 bg-[#170a2b]/95 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitAdmin}
            aria-label="Exit admin"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ffb703]/25 bg-[#07030f]/60 text-[#ffb703] transition-all active:scale-95"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-lg text-[#ffb703]">Diwali Wishes Feed</h1>
            <p className="text-[11px] text-[#fff1d0]/60">
              Total: <span className="font-semibold text-[#ffb703]">{wishes.length}</span> wishes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWallMode(true)}
            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ffb703] to-[#ff8c1a] px-3.5 py-2 text-xs font-bold text-[#170a2b] shadow-md transition-all active:scale-95"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Wall Mode</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-[44px] cursor-pointer items-center rounded-full border border-[#ff5d8f]/30 bg-[#170a2b] px-3 py-2 text-xs font-semibold text-[#ff5d8f] transition-all hover:border-[#ff5d8f] active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Wishes List Feed */}
      <main className="mx-auto flex-1 w-full max-w-2xl overflow-y-auto px-4 py-4">
        {wishes.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#fff1d0]/50">
            No wishes recorded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {wishes.map((w) => (
              <div
                key={w.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-[#ffb703]/20 bg-[#170a2b]/80 p-4 shadow-md backdrop-blur-md transition-all hover:border-[#ffb703]/40"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#ffb703]">
                      {w.name ? w.name : 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-[#fff1d0]/40">
                      {formatRelativeTime(w.created_at)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#fff1d0]/90">{w.text}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(w.id)}
                  aria-label="Delete wish"
                  className="flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#ff5d8f]/20 bg-[#07030f]/60 text-[#ff5d8f] transition-all hover:border-[#ff5d8f] active:scale-95"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

