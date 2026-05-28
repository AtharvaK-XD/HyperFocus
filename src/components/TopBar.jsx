import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Settings2 } from 'lucide-react'
import { GOAL_PRESETS, formatDuration } from '../utils/helpers'

export default function TopBar({
  streak,
  dailyGoal,
  onDailyGoalChange,
  todayFocusSeconds,
}) {
  const [now, setNow] = useState(new Date())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customMins, setCustomMins] = useState(
    Math.round((dailyGoal.goalSeconds || 3600) / 60)
  )
  const [quotaPulse, setQuotaPulse] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const progress = Math.min(1, todayFocusSeconds / (dailyGoal.goalSeconds || 1))
  const quotaMet = progress >= 1

  useEffect(() => {
    if (quotaMet) {
      setQuotaPulse(true)
      const id = setTimeout(() => setQuotaPulse(false), 2000)
      return () => clearTimeout(id)
    }
    return undefined
  }, [quotaMet])

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const selectPreset = (preset) => {
    if (preset.id === 'custom') {
      onDailyGoalChange({
        preset: 'custom',
        goalSeconds: Math.max(900, customMins * 60),
      })
    } else {
      onDailyGoalChange({ preset: preset.id, goalSeconds: preset.seconds })
    }
  }

  return (
    <div className="shrink-0 z-10 relative" style={{ background: 'rgba(9,12,20,0.8)' }}>
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <h1 className="font-orbitron text-sm md:text-base tracking-widest neon-flicker text-[var(--neon-cyan)]">
          HYPERFOCUS
        </h1>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex font-dm text-[10px] text-[var(--text-muted)]">
            {dateStr} · {timeStr}
          </span>
          <span
            className="font-dm text-[10px] px-2 py-1 rounded-full flex items-center gap-1"
            style={{
              background: 'rgba(255,184,0,0.12)',
              color: 'var(--neon-amber)',
            }}
          >
            <Flame size={12} /> {streak}
          </span>
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-1.5 rounded-lg border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)]"
            aria-label="Daily goal settings"
          >
            <Settings2 size={14} />
          </button>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="font-dm text-[9px] text-[var(--text-muted)] hidden md:inline">
              NEURAL LINK ACTIVE
            </span>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-6 py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-dm text-[9px] text-[var(--text-muted)]">
            DAILY QUOTA · {formatDuration(todayFocusSeconds)} / {formatDuration(dailyGoal.goalSeconds)}
          </span>
          {quotaMet && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: quotaPulse ? [1, 0.6, 1] : 1 }}
              className="font-dm text-[9px] text-[var(--neon-cyan)]"
            >
              DAILY QUOTA MET ✓
            </motion.span>
          )}
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--glass-border)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--neon-cyan), #00c4a7)',
              boxShadow: quotaMet ? '0 0 12px rgba(0,245,212,0.6)' : 'none',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-4 top-full mt-1 glass-card p-4 z-50 w-64"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <p className="font-orbitron text-[10px] text-[var(--neon-cyan)] mb-3 tracking-wider">
              DAILY FOCUS GOAL
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {GOAL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPreset(p)}
                  className="font-dm text-[10px] px-2 py-1 rounded border"
                  style={{
                    borderColor:
                      dailyGoal.preset === p.id ? 'var(--neon-cyan)' : 'var(--glass-border)',
                    color:
                      dailyGoal.preset === p.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {dailyGoal.preset === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={15}
                  max={720}
                  value={customMins}
                  onChange={(e) => setCustomMins(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs rounded bg-[var(--bg-void)] border border-[var(--glass-border)]"
                />
                <span className="font-dm text-[10px] text-[var(--text-muted)]">min / day</span>
                <button
                  type="button"
                  onClick={() =>
                    onDailyGoalChange({
                      preset: 'custom',
                      goalSeconds: Math.max(900, customMins * 60),
                    })
                  }
                  className="font-dm text-[10px] text-[var(--neon-cyan)]"
                >
                  Apply
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
