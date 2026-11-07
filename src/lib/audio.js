// WebAudio sound synthesizer for Diya Wishes
// Pure synthesized audio - no external audio files.

let ctx = null
let muted = false

// Initialize mute state from localStorage safely
try {
  const saved = localStorage.getItem('diya_wishes_muted')
  if (saved !== null) {
    muted = JSON.parse(saved)
  }
} catch {
  muted = false
}

const listeners = new Set()

export function isAudioMuted() {
  return muted
}

export function setAudioMuted(val) {
  muted = Boolean(val)
  try {
    localStorage.setItem('diya_wishes_muted', JSON.stringify(muted))
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((fn) => fn(muted))
}

export function toggleAudioMute() {
  setAudioMuted(!muted)
  return muted
}

export function subscribeAudioMute(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getAudioContext() {
  if (muted) return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (AudioCtx) {
      ctx = new AudioCtx()
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

// Ensure AudioContext starts on any initial interaction
export function initAudioOnGesture() {
  getAudioContext()
}

// 1. Soft whoosh (diya light / transition)
export function playWhoosh() {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  const filter = ac.createBiquadFilter()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.35)
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.8)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(400, now)
  filter.frequency.linearRampToValueAtTime(1200, now + 0.3)
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.8)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.25, now + 0.25)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)

  osc.start(now)
  osc.stop(now + 0.9)
}

// Helper: noise buffer
let noiseBuffer = null
function getNoiseBuffer(ac) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ac.sampleRate) {
    const bufferSize = ac.sampleRate * 2
    noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
  }
  return noiseBuffer
}

// 2. Firework burst (medium / high pitch pop with crackle)
export function playFireworkBurst(volume = 0.3) {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  // Low thump
  const osc = ac.createOscillator()
  const oscGain = ac.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.25)
  oscGain.gain.setValueAtTime(volume * 0.8, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  osc.connect(oscGain)
  oscGain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.32)

  // Noise explosion crackle
  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(1200, now)
  filter.Q.setValueAtTime(1.5, now)

  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(volume * 0.9, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(ac.destination)

  noise.start(now)
  noise.stop(now + 0.5)
}

// 3. Rocket whistle (whistle up, then burst)
export function playRocketWhistle() {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(350, now)
  osc.frequency.exponentialRampToValueAtTime(2400, now + 0.85)

  gain.gain.setValueAtTime(0.02, now)
  gain.gain.linearRampToValueAtTime(0.22, now + 0.6)
  gain.gain.linearRampToValueAtTime(0.001, now + 0.9)

  osc.connect(gain)
  gain.connect(ac.destination)

  osc.start(now)
  osc.stop(now + 0.92)

  // Tail hiss
  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(1800, now)
  const nGain = ac.createGain()
  nGain.gain.setValueAtTime(0.05, now)
  nGain.gain.linearRampToValueAtTime(0.12, now + 0.7)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

  noise.connect(filter)
  filter.connect(nGain)
  nGain.connect(ac.destination)
  noise.start(now)
  noise.stop(now + 0.92)
}

// 4. Ladi quick crackle pop
export function playLadiPop(pitch = 1) {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(200 * pitch, now)
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.08)

  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.1)

  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(2200 * pitch, now)
  const nGain = ac.createGain()
  nGain.gain.setValueAtTime(0.25, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  noise.connect(filter)
  filter.connect(nGain)
  nGain.connect(ac.destination)
  noise.start(now)
  noise.stop(now + 0.09)
}

// 5. Chakri spinning sound
export function playChakriLoop(durationSec = 3.5) {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.linearRampToValueAtTime(280, now + 1)
  osc.frequency.linearRampToValueAtTime(220, now + durationSec - 0.5)
  osc.frequency.linearRampToValueAtTime(60, now + durationSec)

  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(800, now)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.12, now + 0.3)
  gain.gain.setValueAtTime(0.12, now + durationSec - 0.5)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + durationSec)

  // Hiss overlay
  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  noise.loop = true
  const nFilter = ac.createBiquadFilter()
  nFilter.type = 'bandpass'
  nFilter.frequency.setValueAtTime(1800, now)
  const nGain = ac.createGain()
  nGain.gain.setValueAtTime(0.01, now)
  nGain.gain.linearRampToValueAtTime(0.15, now + 0.4)
  nGain.gain.setValueAtTime(0.15, now + durationSec - 0.5)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec)

  noise.connect(nFilter)
  nFilter.connect(nGain)
  nGain.connect(ac.destination)
  noise.start(now)
  noise.stop(now + durationSec)
}

// 6. Anaar / fountain hiss sound
export function playAnaarHiss(durationSec = 4) {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  noise.loop = true

  const filter = ac.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(1200, now)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.01, now)
  gain.gain.linearRampToValueAtTime(0.22, now + 0.6)
  gain.gain.setValueAtTime(0.22, now + durationSec - 0.8)
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)

  noise.start(now)
  noise.stop(now + durationSec)
}

// 7. Sparkler continuous fine sizzle
export function playSparklerSizzle(durationSec = 5) {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  noise.loop = true

  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(3200, now)
  filter.Q.setValueAtTime(2, now)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.02, now)
  gain.gain.linearRampToValueAtTime(0.16, now + 0.3)
  gain.gain.setValueAtTime(0.16, now + durationSec - 0.6)
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)

  noise.start(now)
  noise.stop(now + durationSec)
}

// 8. Atom Bomb massive boom & shockwave
export function playAtomBomb() {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  // Huge sub bass drop
  const osc = ac.createOscillator()
  const oscGain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.8)

  oscGain.gain.setValueAtTime(0.55, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

  osc.connect(oscGain)
  oscGain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 1.25)

  // Harsh white noise blast
  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2400, now)
  filter.frequency.exponentialRampToValueAtTime(180, now + 0.9)

  const nGain = ac.createGain()
  nGain.gain.setValueAtTime(0.5, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)

  noise.connect(filter)
  filter.connect(nGain)
  nGain.connect(ac.destination)
  noise.start(now)
  noise.stop(now + 1.15)
}

// 9. Spark fuse sound
export function playFuseSpark() {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const noise = ac.createBufferSource()
  noise.buffer = getNoiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(3000, now)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  noise.start(now)
  noise.stop(now + 0.6)
}

// 10. Pleasant UI chime / tap
export function playChime() {
  const ac = getAudioContext()
  if (!ac) return
  const now = ac.currentTime

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(587.33, now) // D5
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.1) // A5

  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.38)
}

