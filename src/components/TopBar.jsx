import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GOAL_PRESETS, formatDuration } from '../utils/helpers'

export default function TopBar({
  streak,
  dailyGoal,
  onDailyGoalChange,
  todayFocusSeconds,
  email,
  onConnectClick,
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
          HYPER FOCUS
        </h1>
        <div className="flex items-center gap-3">
          <span className="hidden lg:flex font-dm text-[10px] text-[var(--text-muted)]">
            {dateStr} · {timeStr}
          </span>

          {streak > 0 && (
            <span
              className="px-2.5 py-1.5 rounded-lg border font-dm text-[9px] flex items-center gap-1 font-bold"
              style={{
                borderColor: 'rgba(255, 184, 0, 0.3)',
                background: 'rgba(255, 184, 0, 0.05)',
                color: 'var(--neon-amber)',
                boxShadow: '0 0 8px rgba(255, 184, 0, 0.1)',
              }}
            >
              🔥 {streak} {streak === 1 ? 'DAY' : 'DAYS'}
            </span>
          )}

          {email ? (
            <button
              onClick={onConnectClick}
              className="px-3 py-1.5 rounded-lg border font-dm text-[9px] transition-all flex items-center gap-1.5 font-bold uppercase cursor-pointer"
              style={{
                borderColor: 'rgba(0, 245, 212, 0.4)',
                background: 'rgba(0, 245, 212, 0.05)',
                color: 'var(--neon-cyan)',
                boxShadow: '0 0 10px rgba(0, 245, 212, 0.15)',
              }}
            >
              👤 {email.length > 18 ? `${email.slice(0, 15)}...` : email}
            </button>
          ) : (
            <button
              onClick={onConnectClick}
              className="px-3 py-1.5 rounded-lg border font-dm text-[9px] transition-all flex items-center gap-1.5 font-bold animate-pulse hover:animate-none uppercase cursor-pointer"
              style={{
                borderColor: 'rgba(123, 47, 255, 0.4)',
                background: 'rgba(123, 47, 255, 0.05)',
                color: 'var(--neon-violet)',
                boxShadow: '0 0 10px rgba(123, 47, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                e.currentTarget.style.color = 'var(--neon-cyan)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 245, 212, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(123, 47, 255, 0.4)';
                e.currentTarget.style.color = 'var(--neon-violet)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(123, 47, 255, 0.1)';
              }}
            >
              👤 SYNC PROFILE
            </button>
          )}

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


    </div>
  )
}
