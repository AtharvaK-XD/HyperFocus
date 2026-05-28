import { motion, AnimatePresence } from 'framer-motion'

const MOODS = [
  { id: 'tired', emoji: '😴', label: 'TIRED' },
  { id: 'neutral', emoji: '😐', label: 'NEUTRAL' },
  { id: 'good', emoji: '🙂', label: 'GOOD' },
  { id: 'energized', emoji: '⚡', label: 'ENERGIZED' },
  { id: 'in_the_zone', emoji: '🔥', label: 'IN THE ZONE' },
]

export default function MoodCheckIn({ open, onSelect, onSkip }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[210] backdrop-blur-md flex items-center justify-center p-4"
          style={{ background: 'rgba(4, 5, 10, 0.85)' }}
          onClick={onSkip}
        >
          {/* Centered Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 15, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="w-full max-w-lg glass-card rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'rgba(9, 12, 20, 0.9)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 0 40px rgba(0, 245, 212, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="font-orbitron text-base md:text-lg tracking-widest text-[var(--neon-cyan)] mb-1">
                HOW ARE YOU FEELING?
              </h2>
              <p className="font-dm text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Your mood is logged with this session
              </p>
            </div>

            {/* Mood Options */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
              {MOODS.map((m) => (
                <motion.button
                  key={m.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(m.id)}
                  className="glass-card py-3 px-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                  }}
                  // Give it a cyber glow hover effect
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)'
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 245, 212, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span className="text-xl md:text-2xl">{m.emoji}</span>
                  <span className="font-orbitron text-[9px] tracking-wider text-[var(--text-muted)] font-semibold uppercase">
                    {m.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Skip Option */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ x: 3 }}
                onClick={onSkip}
                className="font-dm text-[10px] text-[var(--text-muted)] hover:text-[var(--neon-cyan)] tracking-widest uppercase transition-colors"
              >
                SKIP &rarr;
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
