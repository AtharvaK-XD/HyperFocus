import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import {
  buildHeatmapDays,
  heatmapCellStyle,
  formatHeatmapTooltip,
} from '../utils/helpers'

export default function FocusHeatmap({ sessions }) {
  const [expanded, setExpanded] = useState(false)
  const [tooltip, setTooltip] = useState(null)

  const days = useMemo(() => buildHeatmapDays(sessions, 90), [sessions])
  
  const paddedDays = useMemo(() => {
    if (!days.length) return []
    const list = [...days]
    
    // Pad start to Sunday (getDay() === 0)
    const firstDayOfWeek = days[0].date.getDay()
    if (firstDayOfWeek > 0) {
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(days[0].date)
        d.setDate(days[0].date.getDate() - (firstDayOfWeek - i))
        list.unshift({
          date: d,
          key: `pad-start-${d.getTime()}`,
          minutes: 0,
          sessions: 0,
          isPlaceholder: true,
        })
      }
    }
    
    // Pad end to Saturday (getDay() === 6)
    const lastDayOfWeek = days[days.length - 1].date.getDay()
    if (lastDayOfWeek < 6) {
      for (let i = lastDayOfWeek + 1; i <= 6; i++) {
        const d = new Date(days[days.length - 1].date)
        d.setDate(days[days.length - 1].date.getDate() + (i - lastDayOfWeek))
        list.push({
          date: d,
          key: `pad-end-${d.getTime()}`,
          minutes: 0,
          sessions: 0,
          isPlaceholder: true,
        })
      }
    }
    
    return list
  }, [days])

  const weeks = useMemo(() => {
    const cols = []
    for (let i = 0; i < paddedDays.length; i += 7) {
      cols.push(paddedDays.slice(i, i + 7))
    }
    return cols
  }, [paddedDays])

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
        <h3 className="font-orbitron text-xs tracking-widest text-[var(--neon-violet)]">
          FOCUS MAP
        </h3>
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
            className="overflow-hidden px-4 pb-4"
          >
            <p className="font-dm text-[10px] text-[var(--text-muted)] mb-3">
              Last 90 days · intensity = focus minutes
            </p>
            <div className="overflow-x-auto custom-scroll pb-2">
              <div className="flex gap-1 min-w-max">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day, di) => {
                      const style = heatmapCellStyle(day.minutes)
                      const idx = wi * 7 + di
                      return (
                        <motion.div
                          key={day.key}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.008, duration: 0.2 }}
                          className="w-3 h-3 rounded-sm cursor-default"
                          style={{
                            ...style,
                            opacity: day.isPlaceholder ? 0.15 : style.opacity || 1,
                          }}
                          onMouseEnter={() =>
                            !day.isPlaceholder && setTooltip({
                              x: 0,
                              text: formatHeatmapTooltip(day.date, day.minutes, day.sessions),
                            })
                          }
                          onMouseLeave={() => setTooltip(null)}
                          title={day.isPlaceholder ? '' : formatHeatmapTooltip(day.date, day.minutes, day.sessions)}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            {tooltip && (
              <p className="font-dm text-[10px] text-[var(--neon-cyan)] mt-2">{tooltip.text}</p>
            )}
            <div className="flex items-center gap-2 mt-3 font-space text-[8px] text-[var(--text-muted)]">
              <span>Less</span>
              {[0, 30, 60, 120, 150].map((m, i) => (
                <div
                  key={m}
                  className="w-3 h-3 rounded-sm"
                  style={heatmapCellStyle(i === 0 ? 0 : m)}
                />
              ))}
              <span>More</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
