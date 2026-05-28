import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const HOLD_MS = 2000

export default function HoldToEndButton({ onConfirm, onCancel }) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const clearAnim = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startRef.current = null
    setProgress(0)
  }, [])

  const tick = useCallback(() => {
    if (!startRef.current) return
    const elapsed = Date.now() - startRef.current
    const p = Math.min(1, elapsed / HOLD_MS)
    setProgress(p)
    if (p >= 1) {
      clearAnim()
      onConfirm()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [clearAnim, onConfirm])

  const handleDown = () => {
    startRef.current = Date.now()
    rafRef.current = requestAnimationFrame(tick)
  }

  const handleUp = () => {
    if (startRef.current && progress < 1) {
      onCancel?.()
    }
    clearAnim()
  }

  return (
    <button
      type="button"
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
      onPointerCancel={handleUp}
      className="relative flex-1 py-3 rounded-xl font-orbitron text-xs overflow-hidden border select-none touch-none"
      style={{ borderColor: 'var(--neon-rose)', color: 'var(--neon-rose)' }}
    >
      <span
        className="absolute inset-y-0 left-0 transition-[width] duration-75"
        style={{ width: `${progress * 100}%`, background: 'rgba(255,45,107,0.35)' }}
      />
      <span className="relative z-10">
        {progress > 0 && progress < 1
          ? `HOLD… ${Math.round(progress * 100)}%`
          : 'HOLD TO END'}
      </span>
    </button>
  )
}
