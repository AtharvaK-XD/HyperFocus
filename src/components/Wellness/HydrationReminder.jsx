import { motion, AnimatePresence } from 'framer-motion'

export default function HydrationReminder({ open, focusMinutes, onDone, onSnooze }) {
  const hours = Math.floor(focusMinutes / 60)
  const mins = focusMinutes % 60
  let durationText = ''
  if (hours > 0) {
    durationText += `${hours} hour${hours > 1 ? 's' : ''}`
  }
  if (mins > 0) {
    if (durationText) durationText += ' and '
    durationText += `${mins} minute${mins > 1 ? 's' : ''}`
  }
  if (!durationText) durationText = '0 minutes'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 100, y: 100, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ x: 100, y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="fixed bottom-6 right-6 z-[150] w-[90%] max-w-sm"
        >
          <div
            className="glass-card p-4 flex flex-col gap-3.5"
            style={{
              background: 'rgba(9, 12, 20, 0.95)',
              borderLeft: '4px solid var(--neon-cyan)',
              boxShadow: '0 0 24px rgba(0, 245, 212, 0.15)',
              borderRadius: '12px',
            }}
          >
            {/* Header / Info Row */}
            <div className="flex items-start gap-3">
              {/* Droplet SVG Icon */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
                className="shrink-0 p-2 rounded-lg"
                style={{ background: 'rgba(0, 245, 212, 0.1)' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--neon-cyan)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
                </svg>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h4 className="font-orbitron text-[10px] tracking-wider text-[var(--neon-cyan)] font-bold uppercase mb-1">
                  HYDRATION ALERT
                </h4>
                <p className="font-dm text-[11px] text-[var(--text-primary)] leading-normal">
                  You've been focused for <span className="text-[var(--neon-cyan)] font-semibold">{durationText}</span> today. Time to drink water.
                </p>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-2 w-full">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onDone}
                className="flex-1 py-1.5 rounded-lg font-orbitron text-[9px] tracking-wider text-[var(--bg-void)] uppercase font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), #00c4a7)',
                }}
              >
                DONE, THANKS
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onSnooze}
                className="flex-1 py-1.5 rounded-lg font-orbitron text-[9px] tracking-wider border transition-colors uppercase font-bold"
                style={{
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--neon-cyan)'
                  e.currentTarget.style.borderColor = 'var(--neon-cyan)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.borderColor = 'var(--glass-border)'
                }}
              >
                REMIND IN 10 MIN
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
