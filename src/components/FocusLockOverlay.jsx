import { useEffect, useRef, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import TimerRing from './TimerRing'
import { formatTime } from '../utils/helpers'

const FocusLockOverlay = forwardRef(function FocusLockOverlay(
  {
    active,
    remaining,
    total,
    taskTitle,
    focusLockElapsed,
    onExit,
  },
  fullscreenRef
) {
  const localRef = useRef(null)
  const setRef = (node) => {
    localRef.current = node
    if (typeof fullscreenRef === 'function') fullscreenRef(node)
    else if (fullscreenRef) fullscreenRef.current = node
  }

  useEffect(() => {
    if (!active) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])

  return createPortal(
    <div
      ref={setRef}
      className="focus-lock-root fixed inset-0 flex flex-col"
      style={{
        zIndex: 9999,
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(15,20,32,0.98) 0%, #04050a 70%)',
        display: active ? 'flex' : 'none',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(0,245,212,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(123,47,255,0.08) 0%, transparent 50%)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--glass-border)]">
        <p className="font-dm text-xs text-[var(--neon-violet)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--neon-rose)] mr-2 animate-pulse" />
          FOCUS LOCK ACTIVE — Session: {formatTime(focusLockElapsed)} elapsed
        </p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onExit}
          className="flex items-center gap-1 font-dm text-[10px] px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]"
          aria-label="Exit focus lock"
        >
          <X size={14} /> EXIT
        </motion.button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {active && (
          <TimerRing
            remaining={remaining}
            total={total}
            taskTitle={taskTitle}
            huge
          />
        )}
      </div>

      <footer className="relative z-10 pb-6 text-center">
        <p className="font-space text-[10px] text-[var(--text-muted)]">
          Press ESC or click EXIT to leave focus mode
        </p>
      </footer>
    </div>,
    document.body
  )
})

export default FocusLockOverlay
