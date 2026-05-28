import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings2, ChevronDown, Minus, Plus, Check } from 'lucide-react'
import {
  splitSeconds,
  combineMinSec,
  formatTime,
} from '../utils/helpers'

export default function TimerPreferences({
  remaining,
  total,
  sessionElapsed,
  timerState,
  timerPrefs,
  onApplyDuration,
  onSelectPreset,
  onSavePrefs,
  userSettings,
  onSaveUserSettings,
}) {
  const { isRunning, isPaused } = timerState
  const canEdit = !isRunning || isPaused
  const editingRemaining = isPaused

  const [expanded, setExpanded] = useState(false)
  const [wellnessExpanded, setWellnessExpanded] = useState(false)
  const [editPresets, setEditPresets] = useState(false)
  const [draftPresets, setDraftPresets] = useState(timerPrefs.presets)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const syncFromTimer = () => {
    const base = editingRemaining ? remaining : total
    const { minutes: m, seconds: s } = splitSeconds(base)
    setMinutes(m)
    setSeconds(s)
  }

  useEffect(() => {
    syncFromTimer()
  }, [remaining, total, isPaused, isRunning, expanded])

  useEffect(() => {
    setDraftPresets(timerPrefs.presets)
  }, [timerPrefs.presets])

  const handleApply = () => {
    const secs = combineMinSec(minutes, seconds)
    onApplyDuration(secs, { adjustRemaining: editingRemaining })
  }

  const nudge = (deltaSeconds) => {
    const base = combineMinSec(minutes, seconds) + deltaSeconds
    const { minutes: m, seconds: s } = splitSeconds(base)
    setMinutes(m)
    setSeconds(s)
  }

  const handleSavePresets = () => {
    const cleaned = draftPresets.map((p) => ({
      ...p,
      label: (p.label || `${p.minutes} MIN`).trim().slice(0, 12),
      minutes: Math.min(240, Math.max(1, Number(p.minutes) || 1)),
    }))
    onSavePrefs({ ...timerPrefs, presets: cleaned })
    setEditPresets(false)
  }

  return (
    <div className="w-full max-w-sm mt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2 font-dm text-[10px] tracking-wider text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors"
      >
        <Settings2 size={14} />
        CONFIGURE TIMER
        <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronDown size={14} />
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
            <div
              className="glass-card p-4 mt-2 space-y-4"
              style={{ background: 'var(--bg-elevated)' }}
            >
              {!canEdit && (
                <p className="font-dm text-[10px] text-center text-[var(--neon-amber)]">
                  Pause session to adjust the timer
                </p>
              )}

              {editingRemaining && canEdit && (
                <p className="font-dm text-[10px] text-center text-[var(--neon-violet)]">
                  Editing time remaining · {formatTime(sessionElapsed)} elapsed
                </p>
              )}

              <div className={canEdit ? '' : 'opacity-40 pointer-events-none'}>
                <p className="font-space text-[9px] text-[var(--text-muted)] mb-2 text-center">
                  {editingRemaining ? 'TIME REMAINING' : 'SESSION DURATION'}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <DurationField
                    label="MIN"
                    value={minutes}
                    max={240}
                    onChange={(v) => setMinutes(v)}
                  />
                  <span className="font-orbitron text-2xl text-[var(--neon-cyan)]">:</span>
                  <DurationField
                    label="SEC"
                    value={seconds}
                    max={59}
                    onChange={(v) => setSeconds(v)}
                  />
                </div>

                <div className="flex justify-center gap-2 mt-3">
                  <NudgeButton label="-5m" onClick={() => nudge(-300)} />
                  <NudgeButton label="-1m" onClick={() => nudge(-60)} />
                  <NudgeButton label="+1m" onClick={() => nudge(60)} />
                  <NudgeButton label="+5m" onClick={() => nudge(300)} />
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApply}
                  className="w-full mt-3 py-2 rounded-lg font-orbitron text-xs flex items-center justify-center gap-2"
                  style={{
                    border: '1px solid var(--neon-cyan)',
                    color: 'var(--neon-cyan)',
                    boxShadow: '0 0 12px rgba(0,245,212,0.2)',
                  }}
                >
                  <Check size={14} /> APPLY DURATION
                </motion.button>
              </div>

              <div>
                <p className="font-space text-[9px] text-[var(--text-muted)] mb-2">
                  YOUR PRESETS
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {timerPrefs.presets.map((p) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      disabled={!canEdit}
                      onClick={() => onSelectPreset(p.id)}
                      className="font-dm text-[10px] px-3 py-2 rounded-full border transition-all disabled:opacity-50"
                      style={{
                        borderColor:
                          timerPrefs.activePresetId === p.id
                            ? 'var(--neon-cyan)'
                            : 'var(--glass-border)',
                        color:
                          timerPrefs.activePresetId === p.id
                            ? 'var(--neon-cyan)'
                            : 'var(--text-muted)',
                        boxShadow:
                          timerPrefs.activePresetId === p.id
                            ? '0 0 12px rgba(0,245,212,0.25)'
                            : 'none',
                      }}
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditPresets(!editPresets)}
                className="w-full font-dm text-[10px] text-[var(--text-muted)] hover:text-[var(--neon-violet)] transition-colors"
              >
                {editPresets ? '▲ Hide preset editor' : '▼ Edit saved presets'}
              </button>

              <AnimatePresence>
                {editPresets && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    {draftPresets.map((p, i) => (
                      <div key={p.id} className="flex gap-2 items-center">
                        <input
                          value={p.label}
                          onChange={(e) => {
                            const next = [...draftPresets]
                            next[i] = { ...p, label: e.target.value }
                            setDraftPresets(next)
                          }}
                          placeholder="Label"
                          className="flex-1 px-2 py-1.5 rounded text-[10px] font-dm bg-[var(--bg-void)] border border-[var(--glass-border)]"
                        />
                        <input
                          type="number"
                          min={1}
                          max={240}
                          value={p.minutes}
                          onChange={(e) => {
                            const next = [...draftPresets]
                            next[i] = { ...p, minutes: Number(e.target.value) }
                            setDraftPresets(next)
                          }}
                          className="w-16 px-2 py-1.5 rounded text-[10px] font-dm bg-[var(--bg-void)] border border-[var(--glass-border)] text-center"
                        />
                        <span className="font-dm text-[9px] text-[var(--text-muted)]">min</span>
                      </div>
                    ))}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSavePresets}
                      className="w-full py-2 rounded-lg font-orbitron text-[10px]"
                      style={{
                        background: 'linear-gradient(135deg, var(--neon-violet), #5a1fcc)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      SAVE PRESETS
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wellness Preferences Collapsible Button */}
      {userSettings && (
        <>
          <button
            type="button"
            onClick={() => setWellnessExpanded(!wellnessExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 font-dm text-[10px] tracking-wider text-[var(--text-muted)] hover:text-[var(--neon-violet)] transition-colors mt-2"
          >
            <Settings2 size={14} className="text-[var(--neon-violet)]" />
            WELLNESS PREFERENCES
            <motion.span animate={{ rotate: wellnessExpanded ? 180 : 0 }}>
              <ChevronDown size={14} />
            </motion.span>
          </button>

          <AnimatePresence>
            {wellnessExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="glass-card p-4 mt-2 space-y-4"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  {/* Do Not Disturb Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-orbitron text-[9px] tracking-wider text-[var(--text-muted)] uppercase">
                        DO NOT DISTURB
                      </h4>
                      <p className="font-dm text-[8px] text-[var(--text-muted)] mt-0.5">
                        SUPPRESS WELLNESS NOTIFICATIONS DURING FOCUS
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSaveUserSettings(prev => ({ ...prev, dnd: !prev.dnd }))}
                      className="font-orbitron text-[9px] px-3 py-1.5 rounded border transition-all"
                      style={{
                        borderColor: userSettings.dnd ? 'var(--neon-rose)' : 'var(--glass-border)',
                        color: userSettings.dnd ? 'var(--neon-rose)' : 'var(--text-muted)',
                        background: userSettings.dnd ? 'rgba(255,45,107,0.1)' : 'transparent',
                        boxShadow: userSettings.dnd ? '0 0 10px rgba(255,45,107,0.2)' : 'none',
                      }}
                    >
                      {userSettings.dnd ? 'ACTIVE' : 'INACTIVE'}
                    </motion.button>
                  </div>

                  {/* Posture Reminder Interval */}
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-orbitron text-[9px] tracking-wider text-[var(--text-muted)] uppercase">
                        POSTURE CHECK INTERVAL
                      </h4>
                      <p className="font-dm text-[8px] text-[var(--text-muted)] mt-0.5">
                        TRIGGER REMINDERS EVERY X MINUTES
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {[15, 30, 45, 60].map((mins) => (
                        <motion.button
                          key={mins}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSaveUserSettings(prev => ({ ...prev, postureInterval: mins }))}
                          className="font-dm text-[9px] px-2.5 py-1.5 rounded border transition-all"
                          style={{
                            borderColor: userSettings.postureInterval === mins ? 'var(--neon-amber)' : 'var(--glass-border)',
                            color: userSettings.postureInterval === mins ? 'var(--neon-amber)' : 'var(--text-muted)',
                            background: userSettings.postureInterval === mins ? 'rgba(255,184,0,0.1)' : 'transparent',
                          }}
                        >
                          {mins}M
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Hydration Reminder Daily Goal Target */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-orbitron text-[9px] tracking-wider text-[var(--text-muted)] uppercase">
                        HYDRATION TARGET
                      </h4>
                      <p className="font-dm text-[8px] text-[var(--text-muted)] mt-0.5">
                        DAILY FOCUS ACCUMULATION: {userSettings.hydrationThreshold} MINS
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <NudgeButton
                        label="-10m"
                        onClick={() =>
                          onSaveUserSettings(prev => ({
                            ...prev,
                            hydrationThreshold: Math.max(10, prev.hydrationThreshold - 10),
                          }))
                        }
                      />
                      <NudgeButton
                        label="+10m"
                        onClick={() =>
                          onSaveUserSettings(prev => ({
                            ...prev,
                            hydrationThreshold: prev.hydrationThreshold + 10,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

function DurationField({ label, value, max, onChange }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-space text-[8px] text-[var(--text-muted)] mb-1">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Math.min(max, Math.max(0, parseInt(e.target.value, 10) || 0))
          onChange(v)
        }}
        className="w-16 h-12 text-center font-orbitron text-xl rounded-lg bg-[var(--bg-void)] border border-[var(--glass-border)] focus:border-[var(--neon-cyan)]"
        style={{ color: 'var(--neon-cyan)' }}
      />
    </div>
  )
}

function NudgeButton({ label, onClick }) {
  const isPlus = label.startsWith('+')
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="font-dm text-[9px] px-2 py-1 rounded border border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] flex items-center gap-0.5"
    >
      {isPlus ? <Plus size={10} /> : <Minus size={10} />}
      {label}
    </motion.button>
  )
}
