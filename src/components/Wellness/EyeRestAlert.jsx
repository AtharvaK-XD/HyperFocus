import { motion } from 'framer-motion'

export default function EyeRestAlert({ remaining, onSkip }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius // ~201.06
  const strokeDashoffset = circumference * (1 - remaining / 20)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 rounded-3xl"
      style={{
        background: 'rgba(4, 5, 10, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="text-center space-y-4 max-w-xs flex flex-col items-center justify-center">
        
        {/* Title */}
        <h3
          className="font-orbitron text-sm md:text-base tracking-[0.2em] text-[var(--neon-violet)] font-bold flex items-center gap-2 uppercase"
          style={{ textShadow: '0 0 10px rgba(123, 47, 255, 0.4)' }}
        >
          👁 EYE REST
        </h3>

        {/* Instructions */}
        <p className="font-dm text-[11px] text-[var(--text-muted)] uppercase tracking-wider leading-relaxed">
          Look at something 20 feet away
        </p>

        {/* SVG Ring Countdown Container */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="var(--glass-border)"
              strokeWidth="4"
            />
            {/* Active depleting circle */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="var(--neon-violet)"
              strokeWidth="4"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'linear' }}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered remaining seconds text */}
          <div className="absolute font-orbitron text-base text-[var(--text-primary)] font-bold">
            {remaining}s
          </div>
        </div>

        {/* Skip button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSkip}
          className="px-4 py-1.5 rounded-lg border font-dm text-[9px] tracking-wider text-[var(--text-muted)] uppercase font-semibold transition-colors"
          style={{ borderColor: 'var(--glass-border)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--neon-violet)'
            e.currentTarget.style.borderColor = 'var(--neon-violet)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }}
        >
          SKIP
        </motion.button>

      </div>
    </motion.div>
  )
}
