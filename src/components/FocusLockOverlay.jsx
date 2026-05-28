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
        <p className="font-dm text-xs text-[var(--neon-violet)] mx-auto sm:mx-0">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--neon-rose)] mr-2 animate-pulse" />
          FOCUS LOCK ACTIVE — Session: {formatTime(focusLockElapsed)} elapsed
        </p>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-8">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="flex items-center gap-2 font-orbitron text-xs md:text-sm px-8 py-3.5 rounded-xl border transition-all duration-300 tracking-[0.2em] font-bold z-30"
          style={{
            borderColor: 'var(--neon-rose)',
            color: 'var(--text-primary)',
            background: 'linear-gradient(135deg, rgba(255,45,107,0.2) 0%, rgba(255,45,107,0.02) 100%)',
            boxShadow: '0 0 24px rgba(255,45,107,0.25)',
          }}
          aria-label="Exit focus lock"
        >
          <X size={16} style={{ color: 'var(--neon-rose)' }} /> EXIT FOCUS LOCK
        </motion.button>

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
