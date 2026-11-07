import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftIcon,
  UndoIcon,
  TrashIcon,
  DownloadIcon,
  CheckIcon,
} from '../components/Icons.jsx'
import { playChime, initAudioOnGesture } from '../lib/audio.js'

const PALETTE = [
  { name: 'Marigold', color: '#ffb703' },
  { name: 'Saffron', color: '#ff8c1a' },
  { name: 'Rose', color: '#ff5d8f' },
  { name: 'Magenta', color: '#d9048a' },
  { name: 'Leaf Green', color: '#52b788' },
  { name: 'White', color: '#ffffff' },
  { name: 'Turquoise', color: '#00b4d8' },
  { name: 'Violet', color: '#7209b7' },
]

const FOLDS = [6, 8, 12]

export default function RangoliScreen({ onBack, triggerBloom }) {
  const [selectedColor, setSelectedColor] = useState(PALETTE[0].color)
  const [brushSize, setBrushSize] = useState(6)
  const [fold, setFold] = useState(8)
  const [mirror, setMirror] = useState(true)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [historyLength, setHistoryLength] = useState(0)

  const canvasRef = useRef(null)
  const gridCanvasRef = useRef(null)
  const containerRef = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const historyRef = useRef([])

  // Save canvas state for Undo
  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current.push(imgData)
    if (historyRef.current.length > 20) {
      historyRef.current.shift()
    }
    setHistoryLength(historyRef.current.length)
  }, [])

  // Draw faint kolam dotted grid
  const drawKolamGrid = useCallback((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    const maxR = Math.min(cx, cy) * 0.9

    ctx.save()
    ctx.strokeStyle = 'rgba(255, 183, 3, 0.12)'
    ctx.fillStyle = 'rgba(255, 183, 3, 0.25)'
    ctx.lineWidth = 1

    // Concentric guide circles
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0]
    rings.forEach((ratio) => {
      ctx.beginPath()
      ctx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2)
      ctx.stroke()
    })

    // Radial guide lines & dots
    const divisions = fold * (mirror ? 2 : 1)
    for (let i = 0; i < divisions; i++) {
      const angle = (i * Math.PI * 2) / divisions
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR)
      ctx.stroke()

      // Dotted kolam points
      rings.forEach((ratio) => {
        const dotX = cx + Math.cos(angle) * (maxR * ratio)
        const dotY = cy + Math.sin(angle) * (maxR * ratio)
        ctx.beginPath()
        ctx.arc(dotX, dotY, 1.8, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    ctx.restore()
  }, [fold, mirror])

  // Setup canvases
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const gridCanvas = gridCanvasRef.current
    if (!container || !canvas || !gridCanvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = container.getBoundingClientRect()
    const size = Math.floor(Math.min(rect.width, rect.height))

    canvas.width = size * dpr
    canvas.height = size * dpr
    gridCanvas.width = size * dpr
    gridCanvas.height = size * dpr

    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    gridCanvas.style.width = `${size}px`
    gridCanvas.style.height = `${size}px`

    const ctx = canvas.getContext('2d')
    const gridCtx = gridCanvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

    drawKolamGrid(gridCtx, size, size)
    saveState()
  }, [drawKolamGrid, saveState])

  // Update kolam grid if fold or mirror changes
  useEffect(() => {
    const gridCanvas = gridCanvasRef.current
    if (!gridCanvas) return
    const gridCtx = gridCanvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = gridCanvas.width / dpr
    drawKolamGrid(gridCtx, size, size)
  }, [drawKolamGrid])

  // Helper to draw scattered powder dots
  const drawPowderLine = (ctx, x0, y0, x1, y1, color, radius) => {
    ctx.save()
    ctx.fillStyle = color
    ctx.globalCompositeOperation = 'lighter'

    const dist = Math.hypot(x1 - x0, y1 - y0)
    const steps = Math.max(1, Math.floor(dist * 2))

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const cx = x0 + (x1 - x0) * t
      const cy = y0 + (y1 - y0) * t

      // Scatter small powder particles around brush center
      const particleCount = Math.max(2, Math.floor(radius * 0.9))
      for (let p = 0; p < particleCount; p++) {
        const offsetAngle = Math.random() * Math.PI * 2
        const offsetR = Math.pow(Math.random(), 1.5) * radius * 1.1
        const px = cx + Math.cos(offsetAngle) * offsetR
        const py = cy + Math.sin(offsetAngle) * offsetR
        const pSize = 0.8 + Math.random() * 1.5

        ctx.globalAlpha = 0.4 + Math.random() * 0.55
        ctx.beginPath()
        ctx.arc(px, py, pSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }

  // Draw symmetric stroke relative to center
  const drawSymmetricStroke = (fromX, fromY, toX, toY) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = canvas.width / dpr
    const cx = size / 2
    const cy = size / 2

    const dx0 = fromX - cx
    const dy0 = fromY - cy
    const dx1 = toX - cx
    const dy1 = toY - cy

    const angleStep = (Math.PI * 2) / fold

    for (let i = 0; i < fold; i++) {
      const theta = i * angleStep
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)

      // Rotated point 0
      const rx0 = dx0 * cosT - dy0 * sinT + cx
      const ry0 = dx0 * sinT + dy0 * cosT + cy
      // Rotated point 1
      const rx1 = dx1 * cosT - dy1 * sinT + cx
      const ry1 = dx1 * sinT + dy1 * cosT + cy

      drawPowderLine(ctx, rx0, ry0, rx1, ry1, selectedColor, brushSize)

      // Mirror symmetry
      if (mirror) {
        // Invert Y relative to sector
        const mx0 = dx0 * cosT + dy0 * sinT + cx
        const my0 = dx0 * sinT - dy0 * cosT + cy
        const mx1 = dx1 * cosT + dy1 * sinT + cx
        const my1 = dx1 * sinT - dy1 * cosT + cy
        drawPowderLine(ctx, mx0, my0, mx1, my1, selectedColor, brushSize)
      }
    }
  }

  const handlePointerDown = (e) => {
    initAudioOnGesture()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    isDrawingRef.current = true
    lastPointRef.current = { x, y }
    if (!hasDrawn) setHasDrawn(true)

    // Draw single dot on touch down
    drawSymmetricStroke(x, y, x + 0.1, y + 0.1)
  }

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !lastPointRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    drawSymmetricStroke(lastPointRef.current.x, lastPointRef.current.y, x, y)
    lastPointRef.current = { x, y }
  }

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false
      lastPointRef.current = null
      saveState()
    }
  }

  // Undo last stroke
  const handleUndo = () => {
    const canvas = canvasRef.current
    if (!canvas || historyRef.current.length <= 1) return
    historyRef.current.pop() // remove current
    const prev = historyRef.current[historyRef.current.length - 1]
    const ctx = canvas.getContext('2d')
    ctx.putImageData(prev, 0, 0)
    setHistoryLength(historyRef.current.length)
    playChime()
  }

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveState()
    playChime()
  }

  // Export / Save PNG
  const handleSave = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create export canvas with dark background
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
    const eCtx = exportCanvas.getContext('2d')

    // Deep background gradient
    const grad = eCtx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      10,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 1.5
    )
    grad.addColorStop(0, '#170a2b')
    grad.addColorStop(1, '#07030f')
    eCtx.fillStyle = grad
    eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // Draw the rangoli powder
    eCtx.drawImage(canvas, 0, 0)

    exportCanvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'diwali-rangoli.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'My Diwali Rangoli',
            text: 'Created with Diya Wishes — Shubh Deepavali',
            files: [file],
          })
          return
        } catch {
          // fallback to download
        }
      }

      // Download fallback
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'diwali-rangoli.png'
      a.click()
      URL.revokeObjectURL(url)

      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 2600)
    })
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
    <div className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden select-none touch-none">
      {/* Toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#ffb703]/50 bg-[#170a2b]/95 px-5 py-2.5 text-xs font-semibold text-[#fff1d0] shadow-xl backdrop-blur-md"
          >
            <CheckIcon className="h-4 w-4 text-[#ffb703]" />
            <span>Rangoli saved!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="safe-top relative z-30 flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to Diwali Hub"
          className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ffb703]/30 bg-[#170a2b]/80 p-2 text-[#ffb703] shadow-md backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        {/* Folds & Mirror Controls */}
        <div className="flex items-center gap-1.5 rounded-full border border-[#ffb703]/25 bg-[#170a2b]/80 px-2 py-1 shadow-md backdrop-blur-md">
          {FOLDS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFold(f)}
              className={`min-h-[36px] min-w-[36px] rounded-full text-xs font-semibold transition-all ${
                fold === f
                  ? 'bg-[#ffb703] text-[#170a2b]'
                  : 'text-[#fff1d0]/70 hover:text-[#fff1d0]'
              }`}
            >
              {f}x
            </button>
          ))}
          <span className="h-4 w-[1px] bg-[#ffb703]/30" />
          <button
            type="button"
            onClick={() => setMirror((prev) => !prev)}
            className={`min-h-[36px] rounded-full px-2.5 text-xs font-semibold transition-all ${
              mirror
                ? 'bg-[#ff8c1a] text-[#170a2b]'
                : 'text-[#fff1d0]/60 hover:text-[#fff1d0]'
            }`}
          >
            Mirror
          </button>
        </div>

        {/* Actions: Undo, Clear, Save */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyLength <= 1}
            aria-label="Undo stroke"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ffb703]/30 bg-[#170a2b]/80 p-2 text-[#ffb703] shadow-md backdrop-blur-md transition-all disabled:opacity-30 active:scale-95"
          >
            <UndoIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear drawing"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-[#ff5d8f]/30 bg-[#170a2b]/80 p-2 text-[#ff5d8f] shadow-md backdrop-blur-md transition-all active:scale-95"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            aria-label="Save rangoli image"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#ffb703] to-[#ff8c1a] p-2 text-[#170a2b] shadow-md transition-all active:scale-95"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Drawing Canvas Container */}
      <div
        ref={containerRef}
        className="relative my-auto flex flex-1 items-center justify-center p-3"
      >
        <div
          style={{ touchAction: 'none' }}
          className="relative aspect-square max-h-[66vh] max-w-[92vw] overflow-hidden rounded-full border border-[#ffb703]/25 bg-[#07030f]/60 shadow-[0_0_35px_rgba(255,183,3,0.15)]"
        >
          {/* Faint Dotted Kolam Grid */}
          <canvas
            ref={gridCanvasRef}
            className="pointer-events-none absolute inset-0 z-0"
          />

          {/* User Drawing Powder Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none' }}
            className="relative z-10 cursor-crosshair"
          />

          {/* First-time hint that fades after first stroke */}
          {!hasDrawn && (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
              <span className="rounded-full border border-[#ffb703]/40 bg-[#170a2b]/90 px-4 py-2 text-xs font-medium text-[#fff1d0] shadow-xl backdrop-blur-md">
                Touch and drag to draw glowing powder rangoli
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Color Palette & Brush Size Controls */}
      <footer className="safe-bottom relative z-30 flex flex-col gap-2.5 border-t border-[#ffb703]/20 bg-[#170a2b]/95 px-4 py-3 backdrop-blur-xl">
        {/* Brush Size Slider */}
        <div className="mx-auto flex w-full max-w-sm items-center gap-3">
          <span className="text-[11px] font-medium text-[#fff1d0]/60">Size</span>
          <input
            type="range"
            min="3"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#ffb703]/25 accent-[#ffb703]"
          />
          <span className="w-5 text-right text-[11px] font-medium text-[#ffb703]">
            {brushSize}
          </span>
        </div>

        {/* 8 Festival Colors Palette */}
        <div className="mx-auto flex w-full max-w-sm items-center justify-between gap-1 overflow-x-auto py-1">
          {PALETTE.map(({ name, color }) => {
            const isSelected = selectedColor === color
            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={`Select ${name} color`}
                style={{ backgroundColor: color }}
                className={`min-h-[44px] min-w-[44px] rounded-full transition-transform active:scale-95 ${
                  isSelected
                    ? 'ring-4 ring-offset-2 ring-offset-[#170a2b] ring-[#fff1d0] scale-110 shadow-lg'
                    : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
              />
            )
          })}
        </div>
      </footer>
    </div>
  )
}

