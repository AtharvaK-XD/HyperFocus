import { motion } from 'framer-motion'

export default function TimerRing({ remaining, total, taskTitle, large, huge, shake }) {
  const hrs = Math.floor(remaining / 3600)
  const mins = Math.floor((remaining % 3600) / 60)
  const secs = remaining % 60

  const totalHrs = Math.floor(total / 3600)

  // Progress calculations
  const secsProgress = total > 0 ? (remaining % 60) / 60 : 0
  
  let minsProgress = 0
  if (total > 0) {
    if (total < 3600) {
      minsProgress = (remaining / 60) / (total / 60)
    } else {
      minsProgress = (mins + secs / 60) / 60
    }
  }

  let hrsProgress = 0
  if (total > 0) {
    if (totalHrs > 0) {
      hrsProgress = (remaining / 3600) / (total / 3600)
    } else {
      hrsProgress = 0
    }
  }

  // Active color based on overall session progress percentage
  const overallProgress = total > 0 ? remaining / total : 0
  const pct = overallProgress * 100

  let activeColor = 'var(--neon-cyan)'
  let pulseClass = ''
  if (pct <= 25) {
    activeColor = 'var(--neon-rose)'
    pulseClass = 'timer-pulse'
  } else if (pct <= 50) {
    activeColor = 'var(--neon-violet)'
  }

  // Calculate size variables per ring
  const ringSize = huge ? 520 : large ? 270 : 190
  const strokeWidth = huge ? 44 : large ? 22 : 16
  const viewBoxSize = ringSize + 30

  return (
    <div className={`flex flex-col items-center gap-3 w-full ${shake ? 'shake' : ''}`}>
      {/* Three circles row */}
      <div className="flex flex-row justify-center items-center gap-3 sm:gap-4 md:gap-5 w-full max-w-full">
        <SingleRing
          value={hrs}
          progress={hrsProgress}
          label="HRS"
          color="var(--neon-violet)"
          size={ringSize}
          stroke={strokeWidth}
          pulse={pulseClass}
        />
        <SingleRing
          value={mins}
          progress={minsProgress}
          label="MIN"
          color={activeColor}
          size={ringSize}
          stroke={strokeWidth}
          pulse={pulseClass}
        />
        <SingleRing
          value={secs}
          progress={secsProgress}
          label="SEC"
          color="var(--neon-cyan)"
          size={ringSize}
          stroke={strokeWidth}
          pulse={pulseClass}
        />
      </div>

      {/* Centered task title */}
      {taskTitle && (
        <p
          className="font-dm truncate max-w-[85%] text-center transition-all duration-300"
          style={{
            color: 'var(--text-muted)',
            fontSize: huge ? '1.1rem' : '0.8rem',
            marginTop: '8px',
          }}
        >
          {taskTitle}
        </p>
      )}
    </div>
  )
}

function SingleRing({ value, progress, label, color, size, stroke, pulse }) {
  const viewBoxSize = size + 30
  const cx = viewBoxSize / 2
  const cy = viewBoxSize / 2
  const r = size / 2 - stroke / 2
  const formattedValue = String(value).padStart(2, '0')

  return (
    <div
      className="relative flex items-center justify-center aspect-square w-full"
      style={{
        maxWidth: viewBoxSize,
        maxHeight: viewBoxSize,
        containerType: 'inline-size',
      }}
    >
      {/* Outer dashed accent ring */}
      <svg
        className={`absolute inset-0 ring-rotate ${pulse || ''}`}
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r + 8}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.3"
        />
      </svg>

      {/* Progress ring */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="absolute inset-0 z-10"
      >
        {/* Track circle */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth={stroke}
        />
        {/* Active progress circle */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * r}
          strokeDashoffset={2 * Math.PI * r * (1 - progress)}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
          initial={false}
          animate={{
            strokeDashoffset: 2 * Math.PI * r * (1 - progress),
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        />
      </svg>

      {/* Numerical value and unit label inside the ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center">
        <span
          className="font-orbitron font-bold tracking-wider neon-flicker"
          style={{
            color: 'var(--text-primary)',
            textShadow: `0 0 14px ${color}`,
            fontSize: '32cqw',
            lineHeight: 1,
          }}
        >
          {formattedValue}
        </span>
        <span
          className="font-space font-bold tracking-widest"
          style={{
            fontSize: '9cqw',
            marginTop: '6%',
            color: 'var(--text-muted)',
            opacity: 0.8,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}





