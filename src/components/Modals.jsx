import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import confetti from 'canvas-confetti'
import FocusScoreDisplay from './FocusScoreDisplay'
import {
  DISTRACTION_TYPES,
  formatTime,
  formatDuration,
  BREACH_REASONS,
} from '../utils/helpers'

export function StreakAlert({ streak, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed top-4 right-4 z-[110] max-w-xs cursor-pointer"
      onClick={onDismiss}
      role="alert"
    >
      <div
        className="glass-card px-4 py-3 font-dm text-xs"
        style={{
          background: 'var(--bg-elevated)',
          borderLeft: '3px solid var(--neon-amber)',
          boxShadow: '0 0 20px rgba(255,184,0,0.15)',
        }}
      >
        🔥 {streak}-day streak at risk — start a session to protect it
      </div>
    </motion.div>
  )
}

export function Toast({ message, onClose }) {
  if (!message) return null
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] toast-enter">
      <div
        className="glass-card px-4 py-3 font-dm text-xs max-w-sm text-center"
        style={{ borderColor: 'var(--neon-amber)', boxShadow: '0 0 20px rgba(255,184,0,0.2)' }}
      >
        {message}
        <button
          type="button"
          onClick={onClose}
          className="ml-3 text-[var(--neon-cyan)] underline"
        >
          dismiss
        </button>
      </div>
    </div>
  )
}

export function BreachModal({
  open,
  focusElapsed,
  breachReason,
  setBreachReason,
  onLogResume,
  onEndSession,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] backdrop-blur-md"
            style={{ background: 'rgba(4,5,10,0.85)' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[95] glass-card rounded-t-2xl p-6 max-w-lg mx-auto"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle style={{ color: 'var(--neon-rose)' }} />
              <h2 className="font-orbitron text-lg" style={{ color: 'var(--neon-rose)' }}>
                FOCUS BREACH DETECTED
              </h2>
            </div>
            <p className="font-dm text-sm text-[var(--text-muted)] mb-4">
              After {formatTime(focusElapsed)} of focus, your session was interrupted.
            </p>
            <p className="font-dm text-[10px] mb-2 text-[var(--text-muted)]">
              What caused the breach?
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {BREACH_REASONS.map((type) => {
                const meta = DISTRACTION_TYPES[type]
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBreachReason(type)}
                    className="py-2 rounded-lg border font-dm text-[10px] transition-all"
                    style={{
                      borderColor:
                        breachReason === type ? 'var(--neon-rose)' : 'var(--glass-border)',
                      color: breachReason === type ? 'var(--neon-rose)' : 'var(--text-muted)',
                      boxShadow:
                        breachReason === type
                          ? '0 0 12px rgba(255,45,107,0.3)'
                          : 'none',
                    }}
                  >
                    {meta.icon} {meta.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onLogResume}
                className="flex-1 py-3 rounded-lg font-orbitron text-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), #00c4a7)',
                  color: 'var(--bg-void)',
                }}
              >
                LOG & RESUME
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onEndSession}
                className="flex-1 py-3 rounded-lg font-orbitron text-sm border"
                style={{
                  borderColor: 'var(--neon-rose)',
                  color: 'var(--neon-rose)',
                }}
              >
                END SESSION
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function SummaryModal({
  open,
  sessionData,
  onSave,
  onClose,
}) {
  const [note, setNote] = useState('')

  const handleSave = () => {
    const distCount = sessionData?.distractions?.length ?? 0
    if (distCount === 0) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#7b2fff', '#ffb800'],
      })
    }
    onSave(note)
    setNote('')
  }

  if (!sessionData) return null

  const distCount = sessionData.distractions?.length ?? 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] backdrop-blur-md"
            style={{ background: 'rgba(4,5,10,0.8)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass-card p-6 max-w-md w-full pointer-events-auto"
              style={{ background: 'var(--bg-elevated)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-orbitron text-xl mb-2 text-[var(--neon-cyan)] text-center">
                SESSION COMPLETE
              </h2>

              {sessionData.focusScore != null && (
                <FocusScoreDisplay
                  score={sessionData.focusScore}
                  isPersonalBest={sessionData.isPersonalBest}
                />
              )}

              <div className="space-y-2 font-dm text-sm mb-4">
                <p>
                  Focus time:{' '}
                  <span className="text-[var(--neon-cyan)]">
                    {formatDuration(sessionData.elapsed)}
                  </span>
                </p>
                <p>
                  Distractions:{' '}
                  <span
                    style={{
                      color:
                        distCount === 0
                          ? '#4ade80'
                          : distCount <= 3
                            ? 'var(--neon-amber)'
                            : 'var(--neon-rose)',
                    }}
                  >
                    {distCount}
                  </span>
                </p>
                <p>
                  Task: <span className="text-[var(--text-primary)]">{sessionData.taskTitle}</span>
                </p>
                {sessionData.completedFull && (
                  <p className="text-[#4ade80] text-xs">Full session completed ✓</p>
                )}
                {sessionData.mood && (
                  <p className="text-[var(--text-muted)] text-xs mt-1">
                    You started this session feeling{' '}
                    <span className="text-[var(--neon-cyan)] uppercase font-semibold">
                      {sessionData.mood === 'tired' && '😴 TIRED'}
                      {sessionData.mood === 'neutral' && '😐 NEUTRAL'}
                      {sessionData.mood === 'good' && '🙂 GOOD'}
                      {sessionData.mood === 'energized' && '⚡ ENERGIZED'}
                      {sessionData.mood === 'in_the_zone' && '🔥 IN THE ZONE'}
                    </span>
                  </p>
                )}
              </div>
              <label className="font-dm text-[10px] text-[var(--text-muted)] block mb-1">
                What went well?
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Optional reflection..."
                className="w-full px-3 py-2 rounded-lg text-xs font-dm bg-[var(--bg-void)] border border-[var(--glass-border)] resize-none mb-4"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="w-full py-3 rounded-lg font-orbitron text-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                  color: 'var(--bg-void)',
                }}
              >
                SAVE SESSION
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
