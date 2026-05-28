import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const REMINDERS = [
  'Sit up straight — shoulders back',
  'Uncross your legs, feet flat on floor',
  'Relax your jaw and shoulders',
  'Move your screen to eye level',
]

export default function PostureReminder({ open, onClose, messageIndex }) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, 8000) // Auto-dismiss after 8s
    return () => clearTimeout(timer)
  }, [open, onClose])

  const reminderText = REMINDERS[messageIndex % REMINDERS.length]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: -80, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: -80, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="fixed top-6 left-1/2 z-[150] w-[90%] max-w-sm"
        >
          <div
            className="glass-card p-4 relative flex items-start gap-3.5"
            style={{
              background: 'rgba(9, 12, 20, 0.9)',
              borderLeft: '4px solid var(--neon-amber)',
              boxShadow: '0 0 20px rgba(255, 184, 0, 0.15)',
              borderRadius: '12px',
            }}
          >
            {/* Posture Upright Spine SVG Icon */}
            <div
              className="shrink-0 p-1.5 rounded-lg"
              style={{ background: 'rgba(255, 184, 0, 0.1)' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--neon-amber)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="4" r="1" />
                <path d="M12 7v10" />
                <path d="M17 22V11a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v11" />
              </svg>
            </div>

            {/* Body Info */}
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="font-orbitron text-[10px] tracking-wider text-[var(--neon-amber)] font-bold uppercase mb-1">
                POSTURE CHECK
              </h4>
              <p className="font-dm text-[11px] text-[var(--text-primary)] leading-normal">
                {reminderText}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--neon-amber)] transition-colors"
              aria-label="Dismiss posture check"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
