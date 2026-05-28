import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Flame } from 'lucide-react'
import {
  formatDuration,
  getWeekSessions,
  getMonthSessions,
  calcStreak,
} from '../utils/helpers'

const FILTERS = ['THIS WEEK', 'THIS MONTH', 'BY TASK']

export default function SessionArchive({ sessions }) {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState('THIS WEEK')

  const streak = calcStreak(sessions)

  const filtered = useMemo(() => {
    let list = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (filter === 'THIS WEEK') list = getWeekSessions(list)
    else if (filter === 'THIS MONTH') list = getMonthSessions(list)
    return list
  }, [sessions, filter])

  const weekSessions = getWeekSessions(sessions)
  const weekFocus = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
  const bestSession = weekSessions.reduce(
    (best, s) => {
      const score = (s.duration || 0) - (s.distractions?.length || 0) * 60
      return score > (best?.score ?? -1) ? { ...s, score } : best
    },
    null
  )

  const distractionColor = (count) => {
    if (count === 0) return '#4ade80'
    if (count <= 3) return 'var(--neon-amber)'
    return 'var(--neon-rose)'
  }

  return (
    <div
      className="shrink-0 border-b"
      style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-surface)' }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-orbitron text-xs tracking-widest text-[var(--neon-cyan)]">
            SESSION ARCHIVE
          </h3>
          <span
            className="font-dm text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              background: 'rgba(255,184,0,0.15)',
              color: 'var(--neon-amber)',
            }}
          >
            <Flame size={12} /> {streak} day streak
          </span>
        </div>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronDown size={18} className="text-[var(--text-muted)]" />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="flex gap-2 mb-3 flex-wrap">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className="font-dm text-[10px] px-2 py-1 rounded border"
                    style={{
                      borderColor: filter === f ? 'var(--neon-cyan)' : 'var(--glass-border)',
                      color: filter === f ? 'var(--neon-cyan)' : 'var(--text-muted)',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div
                className="glass-card p-3 mb-3 flex flex-wrap gap-4 text-xs font-dm"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div>
                  <span className="text-[var(--text-muted)]">Week focus </span>
                  <span className="text-[var(--neon-cyan)]">{formatDuration(weekFocus)}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Streak </span>
                  <span className="text-[var(--neon-amber)]">{streak} days</span>
                </div>
                {bestSession && (
                  <div>
                    <span className="text-[var(--text-muted)]">Best </span>
                    <span className="text-[var(--neon-violet)]">
                      {bestSession.taskTitle} ({formatDuration(bestSession.duration)})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 overflow-x-auto custom-scroll pb-2">
                {filtered.length === 0 ? (
                  <p className="font-dm text-xs text-[var(--text-muted)] py-4">
                    No sessions archived yet
                  </p>
                ) : (
                  filtered.map((s) => {
                    const distCount = s.distractions?.length ?? 0
                    return (
                      <motion.div
                        key={s.id}
                        whileHover={{ scale: 1.03, rotateY: 5 }}
                        className="glass-card shrink-0 w-48 p-3 relative"
                        style={{ background: 'var(--bg-elevated)' }}
                      >
                        {s.mood && (
                          <span
                            className="absolute top-2.5 right-2.5 text-xs select-none"
                            title={`Felt ${s.mood.toUpperCase().replace('_', ' ')}`}
                          >
                            {s.mood === 'tired' && '😴'}
                            {s.mood === 'neutral' && '😐'}
                            {s.mood === 'good' && '🙂'}
                            {s.mood === 'energized' && '⚡'}
                            {s.mood === 'in_the_zone' && '🔥'}
                          </span>
                        )}
                        <span className="font-space text-[9px] text-[var(--neon-cyan)]">
                          {new Date(s.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <p className="font-dm text-sm mt-1 truncate">{s.taskTitle}</p>
                        <p className="font-dm text-[10px] text-[var(--text-muted)] mt-1">
                          {formatDuration(s.duration)}
                        </p>
                        <p
                          className="font-space text-[10px] mt-2"
                          style={{ color: distractionColor(distCount) }}
                        >
                          {distCount} distraction{distCount !== 1 ? 's' : ''}
                        </p>
                        {s.note && (
                          <p className="font-dm text-[9px] text-[var(--text-muted)] mt-1 line-clamp-2">
                            {s.note}
                          </p>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
