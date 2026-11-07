export default function Diya({ size = 'large', lit = false, className = '' }) {
  const isLarge = size === 'large'
  const widthClass = isLarge ? 'w-56 sm:w-64' : 'w-28 sm:w-32'

  return (
    <div className={`relative flex items-center justify-center ${lit ? 'lit' : ''} ${className}`}>
      <svg
        viewBox="0 0 160 130"
        className={`${widthClass} overflow-visible transition-transform duration-300`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`glow-${size}`} cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#fff1a8" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#ffb703" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#ff5a1f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`flameGrad-${size}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff5a1f" />
            <stop offset="45%" stopColor="#ff8c1a" />
            <stop offset="75%" stopColor="#ffb703" />
            <stop offset="100%" stopColor="#fff8e7" />
          </linearGradient>
          <linearGradient id={`bowlGrad-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8c1a" />
            <stop offset="25%" stopColor="#d95d1e" />
            <stop offset="100%" stopColor="#691f06" />
          </linearGradient>
          <linearGradient id={`rimGrad-${size}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffb703" />
            <stop offset="50%" stopColor="#ffe8a3" />
            <stop offset="100%" stopColor="#ff8c1a" />
          </linearGradient>
        </defs>

        {/* Ambient radial glow halo */}
        <circle
          className="glow"
          cx="80"
          cy="42"
          r="72"
          fill={`url(#glow-${size})`}
        />

        {/* Outer and inner flame layers */}
        <g className="flame">
          {/* Main outer teardrop flame */}
          <path
            d="M80 2C102 26 108 48 80 70C52 48 58 26 80 2Z"
            fill={`url(#flameGrad-${size})`}
            filter="drop-shadow(0 0 12px rgba(255, 183, 3, 0.8))"
          />
          {/* Inner hot white-yellow core */}
          <path
            d="M80 26C89 39 92 50 80 64C68 50 71 39 80 26Z"
            fill="#ffffff"
            opacity="0.95"
          />
          {/* Core blue/violet base touch */}
          <ellipse cx="80" cy="65" rx="5" ry="3" fill="#ff5d8f" opacity="0.6" />
        </g>

        {/* Cotton wick */}
        <rect x="78" y="64" width="4" height="12" rx="2" fill="#240c02" />

        {/* Terracotta Diya body */}
        <path
          d="M12 76Q80 62 148 76Q144 122 80 126Q16 122 12 76Z"
          fill={`url(#bowlGrad-${size})`}
        />

        {/* Diya inner rim lip with warm highlight */}
        <path
          d="M12 76Q80 62 148 76Q80 88 12 76Z"
          fill={`url(#rimGrad-${size})`}
        />

        {/* Ornamental motifs & dots along the base */}
        <path
          d="M32 94Q80 108 128 94"
          stroke="#ffd166"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="1 8"
        />
        <circle cx="80" cy="112" r="3.5" fill="#ffd166" />
        <circle cx="60" cy="108" r="2.5" fill="#ffd166" />
        <circle cx="100" cy="108" r="2.5" fill="#ffd166" />
        <circle cx="42" cy="101" r="2" fill="#ffd166" />
        <circle cx="118" cy="101" r="2" fill="#ffd166" />
      </svg>
    </div>
  )
}

