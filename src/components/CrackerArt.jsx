// Detailed inline SVGs for the 6 Diwali crackers. Strictly NO emoji.

export function LadiSvg({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Central string */}
      <line x1="32" y1="4" x2="32" y2="60" stroke="#ffd166" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Top fuse */}
      <path d="M32 4C30 1 36 0 34 -2" stroke="#e0e0e0" strokeWidth="1.5" />
      {/* Individual red firecrackers along the string */}
      {[8, 16, 24, 32, 40, 48, 54].map((y, idx) => (
        <g key={y}>
          {/* Left cracker */}
          <rect x="18" y={y} width="12" height="5" rx="1.5" fill="#d90429" stroke="#900" strokeWidth="0.5" />
          <line x1="28" y1={y + 2.5} x2="32" y2={y + 2.5} stroke="#ffd166" strokeWidth="1" />
          <rect x="22" y={y} width="4" height="5" fill="#ffb703" opacity="0.8" />

          {/* Right cracker */}
          <rect x="34" y={y + 3} width="12" height="5" rx="1.5" fill="#d90429" stroke="#900" strokeWidth="0.5" />
          <line x1="32" y1={y + 5.5} x2="36" y2={y + 5.5} stroke="#ffd166" strokeWidth="1" />
          <rect x="38" y={y + 3} width="4" height="5" fill="#ffb703" opacity="0.8" />
        </g>
      ))}
    </svg>
  )
}

export function RocketSvg({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Guiding bamboo stick */}
      <line x1="32" y1="28" x2="32" y2="62" stroke="#cbb282" strokeWidth="1.8" strokeLinecap="round" />
      {/* Rocket cylinder */}
      <rect x="25" y="16" width="14" height="22" rx="2" fill="#d90429" />
      <rect x="25" y="22" width="14" height="8" fill="#ffb703" />
      <text x="32" y="28" fontSize="5" fontWeight="bold" fill="#07030f" textAnchor="middle" fontFamily="sans-serif">
        DIWALI
      </text>
      {/* Conical nosecone */}
      <path d="M24 16L32 4L40 16Z" fill="#ff5a1f" />
      {/* Fuse at base */}
      <path d="M30 38C28 42 32 46 30 49" stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

export function ChakriSvg({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <radialGradient id="chakriGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb703" />
          <stop offset="60%" stopColor="#ff5a1f" />
          <stop offset="100%" stopColor="#7a2e0c" />
        </radialGradient>
      </defs>
      {/* Outer spinning rim */}
      <circle cx="32" cy="32" r="26" fill="url(#chakriGrad)" stroke="#ffb703" strokeWidth="1.5" />
      {/* Coiled spiral blades */}
      <path
        d="M32 10 A22 22 0 0 1 54 32 M54 32 A22 22 0 0 1 32 54 M32 54 A22 22 0 0 1 10 32 M10 32 A22 22 0 0 1 32 10"
        stroke="#fff1d0"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <circle cx="32" cy="32" r="14" fill="#07030f" stroke="#ff8c1a" strokeWidth="2" />
      <circle cx="32" cy="32" r="6" fill="#ffb703" />
      {/* Fuse sticking out */}
      <path d="M50 20Q58 14 56 8" stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

export function AnaarSvg({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="anaarBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb703" />
          <stop offset="50%" stopColor="#d95d1e" />
          <stop offset="100%" stopColor="#691f06" />
        </linearGradient>
      </defs>
      {/* Conical flowerpot body */}
      <path d="M22 18H42L52 56H12L22 18Z" fill="url(#anaarBody)" stroke="#ff8c1a" strokeWidth="1.5" />
      {/* Decorative banding */}
      <path d="M19 28H45" stroke="#fff1d0" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M16 40H48" stroke="#ffb703" strokeWidth="2" />
      <path d="M13 50H51" stroke="#fff1d0" strokeWidth="1" strokeDasharray="3 2" />
      {/* Top opening collar */}
      <ellipse cx="32" cy="18" rx="10" ry="3.5" fill="#ff8c1a" stroke="#ffe8a3" strokeWidth="1" />
      {/* Wick / fuse */}
      <path d="M32 18C30 12 35 10 33 5" stroke="#e0e0e0" strokeWidth="1.8" />
    </svg>
  )
}

export function SparklerSvg({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Thin wire handle */}
      <line x1="32" y1="30" x2="32" y2="62" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" />
      {/* Pyrotechnic combustible coating */}
      <rect x="29" y="8" width="6" height="24" rx="2" fill="#5c5c66" stroke="#888899" strokeWidth="1" />
      {/* Granular speckles on the coating */}
      <line x1="30" y1="12" x2="34" y2="12" stroke="#ffb703" strokeWidth="1" strokeDasharray="1 1" />
      <line x1="30" y1="18" x2="34" y2="18" stroke="#fff1d0" strokeWidth="1" strokeDasharray="1 1" />
      <line x1="30" y1="24" x2="34" y2="24" stroke="#ff8c1a" strokeWidth="1" strokeDasharray="1 1" />
      {/* Tip spark ignition wick */}
      <line x1="32" y1="8" x2="32" y2="4" stroke="#e0e0e0" strokeWidth="1.5" />
    </svg>
  )
}

export function AtomBombSvg({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Green wrapped jute twine packet */}
      <rect x="14" y="20" width="36" height="34" rx="4" fill="#2d6a4f" stroke="#1b4332" strokeWidth="1.5" />
      {/* Twine diagonal strings */}
      <line x1="14" y1="20" x2="50" y2="54" stroke="#d8f3dc" strokeWidth="1.2" opacity="0.7" />
      <line x1="50" y1="20" x2="14" y2="54" stroke="#d8f3dc" strokeWidth="1.2" opacity="0.7" />
      <line x1="32" y1="20" x2="32" y2="54" stroke="#d8f3dc" strokeWidth="1.5" />
      <line x1="14" y1="37" x2="50" y2="37" stroke="#d8f3dc" strokeWidth="1.5" />
      {/* Center red sticker badge */}
      <rect x="22" y="28" width="20" height="18" rx="2" fill="#d90429" stroke="#ffb703" strokeWidth="1" />
      <text x="32" y="39" fontSize="6" fontWeight="bold" fill="#fff1d0" textAnchor="middle" fontFamily="sans-serif">
        ATOM
      </text>
      {/* Thick braided fuse at top */}
      <path d="M32 20C30 14 36 10 33 4" stroke="#e0e0e0" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export const CRACKER_TYPES = [
  { id: 'ladi', name: 'Ladi', Component: LadiSvg },
  { id: 'rocket', name: 'Rocket', Component: RocketSvg },
  { id: 'chakri', name: 'Chakri', Component: ChakriSvg },
  { id: 'anaar', name: 'Anaar', Component: AnaarSvg },
  { id: 'sparkler', name: 'Sparkler', Component: SparklerSvg },
  { id: 'atombomb', name: 'Atom Bomb', Component: AtomBombSvg },
]

