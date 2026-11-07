import { useRef, useState } from 'react'
import Sky from './Sky.jsx'

// ?name=Rahul -> "Happy Diwali, Rahul!"  (React escapes it, so it's safe to render)
const name = (new URLSearchParams(window.location.search).get('name') || '').trim().slice(0, 24)

function Diya() {
  return (
    <svg viewBox="0 0 160 130" className="w-44 overflow-visible">
      <defs>
        <radialGradient id="g"><stop offset="0" stopColor="#ffb347" stopOpacity=".9" /><stop offset="1" stopColor="#ff7a00" stopOpacity="0" /></radialGradient>
        <linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff6a00" /><stop offset=".6" stopColor="#ffb703" /><stop offset="1" stopColor="#fff1a8" /></linearGradient>
        <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9692a" /><stop offset="1" stopColor="#7a2e0c" /></linearGradient>
      </defs>
      <circle className="glow" cx="80" cy="45" r="62" fill="url(#g)" />
      <g className="flame">
        <path d="M80 4C98 28 104 46 80 66C56 46 62 28 80 4Z" fill="url(#f)" />
        <path d="M80 30C88 42 90 52 80 62C70 52 72 42 80 30Z" fill="#fffbe0" opacity=".9" />
      </g>
      <rect x="77.5" y="62" width="5" height="12" rx="2" fill="#2b1206" />
      <path d="M12 76Q80 64 148 76Q144 118 80 122Q16 118 12 76Z" fill="url(#b)" />
      <path d="M12 76Q80 64 148 76Q80 86 12 76Z" fill="#f2a65a" />
      <path d="M40 98Q80 108 120 98" stroke="#ffd166" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="1 7" />
    </svg>
  )
}

export default function App() {
  const sky = useRef(null)
  const [lit, setLit] = useState(false)
  const [wish, setWish] = useState('')
  const [lanterns, setLanterns] = useState([])

  const send = (e) => {
    e.preventDefault()
    const text = wish.trim()
    if (!text) return
    setLanterns((l) => [...l, { id: crypto.randomUUID(), text, dx: Math.round((Math.random() - 0.5) * 80) }])
    setWish('')
  }

  // Lantern reached the top: fireworks at its position, then remove it
  const arrived = (id, el) => {
    const r = el.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    sky.current.burst(x, y)
    setTimeout(() => sky.current.burst(x - 50, y + 25), 180)
    setTimeout(() => sky.current.burst(x + 50, y - 15), 360)
    setLanterns((l) => l.filter((i) => i.id !== id))
  }

  return (
    <div className={lit ? 'lit' : ''}>
      <Sky ref={sky} />
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 h-3/5 transition-opacity duration-1000 ${lit ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,150,40,.4), transparent 70%)' }}
      />
      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-between px-6 pb-8 pt-12 text-center">
        <header>
          <h1 className="bg-gradient-to-b from-amber-200 to-orange-400 bg-clip-text font-serif text-4xl font-bold text-transparent">
            Happy Diwali{name && `, ${name}`}!
          </h1>
          <p className="mt-2 text-sm text-amber-100/70">{lit ? 'Make a wish on this diya' : 'Tap the diya to light it'}</p>
        </header>

        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          {lit && (
            <form onSubmit={send} className="fade-in flex w-full gap-2">
              <input
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                maxLength={80}
                placeholder="Make a wish…"
                className="min-w-0 flex-1 rounded-full border border-amber-300/40 bg-black/40 px-4 py-3 text-amber-50 outline-none placeholder:text-amber-100/40 focus:border-amber-300"
              />
              <button
                type="submit"
                disabled={!wish.trim()}
                className="rounded-full bg-gradient-to-b from-amber-300 to-orange-500 px-5 py-3 font-semibold text-orange-950 disabled:opacity-40"
              >
                Send wish
              </button>
            </form>
          )}
          <button onClick={() => setLit((v) => !v)} aria-pressed={lit} aria-label={lit ? 'Put out the diya' : 'Light the diya'} className="cursor-pointer">
            <Diya />
          </button>
        </div>
      </main>

      {lanterns.map((l) => (
        <div key={l.id} className="lantern" style={{ '--dx': `${l.dx}px` }} onAnimationEnd={(e) => arrived(l.id, e.currentTarget)}>
          <div className="lantern-body">{l.text}</div>
        </div>
      ))}
    </div>
  )
}
