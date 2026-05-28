import { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'
import { getScoreTier } from '../utils/helpers'

export default function FocusScoreDisplay({ score, isPersonalBest }) {
  const tier = getScoreTier(score)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => controls.stop()
  }, [score])

  const circumference = 2 * Math.PI * 52
  const offset = circumference * (1 - score / 100)

  return (
    <div className="flex flex-col items-center mb-4">
      <p className="font-space text-[9px] text-[var(--text-muted)] tracking-widest mb-2">
        FOCUS SCORE
      </p>
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width={140} height={140} className="absolute inset-0 -rotate-90">
          <circle
            cx={70}
            cy={70}
            r={52}
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth={8}
          />
          <motion.circle
            cx={70}
            cy={70}
            r={52}
            fill="none"
            stroke={tier.color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 10px ${tier.color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-orbitron text-4xl font-bold"
            style={{ color: tier.color, textShadow: `0 0 20px ${tier.color}` }}
          >
            {shown}
          </motion.span>
          <span className="font-space text-[9px] text-[var(--text-muted)]">{tier.label}</span>
        </div>
      </div>
      {isPersonalBest && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-2 font-orbitron text-[10px] px-3 py-1 rounded-full"
          style={{
            background: 'rgba(0,245,212,0.15)',
            color: 'var(--neon-cyan)',
            border: '1px solid var(--neon-cyan)',
            boxShadow: '0 0 12px rgba(0,245,212,0.3)',
          }}
        >
          PERSONAL BEST
        </motion.span>
      )}
    </div>
  )
}
