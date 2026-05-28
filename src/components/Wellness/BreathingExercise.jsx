import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BreathingExercise({ open, onFinish }) {
  const [phase, setPhase] = useState('INHALE') // 'INHALE', 'HOLD', 'EXHALE'
  const [cycle, setCycle] = useState(1)

  useEffect(() => {
    if (!open) return

    setPhase('INHALE')
    setCycle(1)

    const interval = setInterval(() => {
      setPhase((currentPhase) => {
        if (currentPhase === 'INHALE') {
          return 'HOLD'
        } else if (currentPhase === 'HOLD') {
          return 'EXHALE'
        } else {
          // It was EXHALE, let's see if we should increment cycle or finish
          setCycle((currentCycle) => {
            if (currentCycle >= 3) {
              clearInterval(interval)
              setTimeout(onFinish, 1000) // Small delay for smooth closing
              return currentCycle
            }
            return currentCycle + 1
          })
          return 'INHALE'
        }
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [open, onFinish])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 backdrop-blur-lg"
          style={{ background: 'rgba(4, 5, 10, 0.95)' }}
        >
          {/* Main Breathing Visual Area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-md">
            
            {/* Cycle Counter */}
            <div className="text-center">
              <span className="font-orbitron text-[10px] tracking-[0.2em] text-[var(--neon-violet)] uppercase font-semibold">
                Nirvana State Calibration
              </span>
              <h3 className="font-dm text-xs text-[var(--text-muted)] mt-1 tracking-wider">
                Cycle {cycle} of 3
              </h3>
            </div>

            {/* Breathing Circle Container */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Pulsing Outer Neon Cyan Aura */}
              <motion.div
                animate={{
                  scale: phase === 'INHALE' ? 1.8 : phase === 'HOLD' ? 1.8 : 1.0,
                  opacity: phase === 'HOLD' ? 0.95 : 0.6,
                  boxShadow:
                    phase === 'INHALE'
                      ? '0 0 35px rgba(0, 245, 212, 0.6)'
                      : phase === 'HOLD'
                      ? '0 0 50px rgba(0, 245, 212, 0.9)'
                      : '0 0 15px rgba(0, 245, 212, 0.25)',
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="absolute w-36 h-36 rounded-full border border-[var(--neon-cyan)] flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 245, 212, 0.12) 0%, transparent 70%)',
                }}
              >
                {/* Inner Glowing Core */}
                <motion.div
                  animate={{
                    opacity: phase === 'HOLD' ? 0.8 : 0.4,
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="w-24 h-24 rounded-full bg-[rgba(0,245,212,0.06)] blur-sm"
                />
              </motion.div>

              {/* Glowing Active Phase Label */}
              <div className="absolute text-center select-none pointer-events-none">
                <motion.span
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.5 }}
                  className="block font-orbitron text-base md:text-lg tracking-[0.25em] text-[var(--neon-cyan)] font-bold"
                  style={{
                    textShadow: '0 0 12px rgba(0, 245, 212, 0.6)',
                  }}
                >
                  {phase}
                </motion.span>
              </div>
            </div>

            {/* Instruction description */}
            <div className="text-center max-w-xs">
              <p className="font-dm text-[11px] text-[var(--text-muted)] leading-relaxed">
                {phase === 'INHALE' && 'Breathe in slowly through your nose, expanding your lungs.'}
                {phase === 'HOLD' && 'Maintain focus. Feel the clarity circulating within.'}
                {phase === 'EXHALE' && 'Release slowly through your mouth, letting go of tension.'}
              </p>
            </div>
          </div>

          {/* Bottom Skip Control */}
          <div className="pb-8 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFinish}
              className="font-dm text-[10px] tracking-widest text-[var(--text-muted)] hover:text-[var(--neon-cyan)] uppercase transition-colors"
            >
              SKIP &rarr;
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
