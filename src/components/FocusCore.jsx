import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Music, ExternalLink } from 'lucide-react'
import TimerRing from './TimerRing'
import TimerPreferences from './TimerPreferences'
import HoldToEndButton from './HoldToEndButton'
import EyeRestAlert from './Wellness/EyeRestAlert'
import { formatTime, formatDuration } from '../utils/helpers'

const panelVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function FocusCore({
  remaining,
  total,
  taskTitle,
  timerState,
  timerPrefs,
  sessionElapsed,
  onApplyDuration,
  onSelectPreset,
  onSaveTimerPrefs,
  onStart,
  onPause,
  onResume,
  onEnd,
  onEnterFocusLock,
  distractions,
  streak,
  userSettings,
  onSaveUserSettings,
  eyeRestActive,
  eyeRestRemaining,
  onSkipEyeRest,
}) {
  const { isRunning, isPaused } = timerState
  const [rageQuitWarning, setRageQuitWarning] = useState(false)
  const [timerShake, setTimerShake] = useState(false)

  const sparkline = buildSparkline(distractions, sessionElapsed)
  const canRageQuit = remaining > 0 && (isRunning || isPaused)

  const handleEndAttempt = () => {
    if (canRageQuit) {
      setRageQuitWarning(true)
      setTimerShake(true)
      setTimeout(() => setTimerShake(false), 500)
      return
    }
    onEnd()
  }

  const handleHoldConfirm = () => {
    setRageQuitWarning(false)
    onEnd()
  }

  const handleHoldCancel = () => {
    setRageQuitWarning(false)
  }

  return (
    <motion.main
      variants={panelVariants}
      className="flex flex-col h-full flex-1 min-w-0 p-4 md:p-6 overflow-y-auto custom-scroll relative"
    >
      <div className="flex flex-col items-center justify-start md:justify-center py-2 gap-3.5 min-h-full w-full relative">
        <TimerRing
          remaining={remaining}
          total={total}
          taskTitle={taskTitle}
          large
          shake={timerShake}
        />

        <TimerPreferences
          remaining={remaining}
          total={total}
          sessionElapsed={sessionElapsed}
          timerState={timerState}
          timerPrefs={timerPrefs}
          onApplyDuration={onApplyDuration}
          onSelectPreset={onSelectPreset}
          onSavePrefs={onSaveTimerPrefs}
          userSettings={userSettings}
          onSaveUserSettings={onSaveUserSettings}
        />

        <AnimatePresence>
          {eyeRestActive && (
            <EyeRestAlert
              remaining={eyeRestRemaining}
              onSkip={onSkipEyeRest}
            />
          )}
        </AnimatePresence>

        {/* Spotify Quick Access */}
        <div className="w-full max-w-xs shrink-0">
          <div
            className="glass-card px-4 py-3 flex flex-col gap-2 w-full"
            style={{
              background: 'var(--bg-elevated)',
              borderLeft: '3px solid #1db954',
              borderRadius: '12px',
            }}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-space text-[9px] tracking-wider text-[#1db954] flex items-center gap-1.5 font-bold uppercase">
                <Music size={12} /> Spotify Player
              </span>
              <span className="font-space text-[8px] text-[var(--text-muted)]">
                quick access
              </span>
            </div>
            <a
              href="https://open.spotify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-xl font-orbitron text-xs no-underline transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1db954, #1aa34a)',
                color: '#04050a',
                boxShadow: '0 0 16px rgba(29,185,84,0.25)',
                fontWeight: 'bold',
              }}
            >
              <span>OPEN SPOTIFY</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {rageQuitWarning && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-dm text-xs text-center px-4"
            style={{ color: 'var(--neon-amber)' }}
          >
            ⚠ {formatDuration(remaining)} remaining — are you sure?
          </motion.p>
        )}

        <div className="w-full max-w-xs space-y-2">
          {!isRunning && !isPaused && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="w-full py-4 rounded-xl font-orbitron text-sm tracking-wider"
              style={{
                background: 'linear-gradient(135deg, var(--neon-cyan), #00c4a7)',
                color: 'var(--bg-void)',
                boxShadow: '0 0 24px rgba(0,245,212,0.35)',
              }}
            >
              START
            </motion.button>
          )}

          {isRunning && !isPaused && (
            <div className="flex gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onPause}
                className="flex-1 py-3 rounded-xl font-orbitron text-xs border"
                style={{ borderColor: 'var(--neon-violet)', color: 'var(--neon-violet)' }}
              >
                PAUSE
              </motion.button>
              {rageQuitWarning ? (
                <HoldToEndButton onConfirm={handleHoldConfirm} onCancel={handleHoldCancel} />
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEndAttempt}
                  className="flex-1 py-3 rounded-xl font-orbitron text-xs border"
                  style={{ borderColor: 'var(--neon-rose)', color: 'var(--neon-rose)' }}
                >
                  END SESSION
                </motion.button>
              )}
            </div>
          )}

          {isPaused && (
            <div className="flex gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setRageQuitWarning(false)
                  onResume()
                }}
                className="flex-1 py-3 rounded-xl font-orbitron text-xs"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), #00c4a7)',
                  color: 'var(--bg-void)',
                }}
              >
                RESUME
              </motion.button>
              {rageQuitWarning ? (
                <HoldToEndButton onConfirm={handleHoldConfirm} onCancel={handleHoldCancel} />
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEndAttempt}
                  className="flex-1 py-3 rounded-xl font-orbitron text-xs border"
                  style={{ borderColor: 'var(--neon-rose)', color: 'var(--neon-rose)' }}
                >
                  END SESSION
                </motion.button>
              )}
            </div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onEnterFocusLock}
            disabled={!isRunning && !isPaused}
            className="w-full py-3 rounded-xl font-orbitron text-xs flex items-center justify-center gap-2 focus-lock-pulse disabled:opacity-40 disabled:animate-none"
            style={{
              background: 'linear-gradient(135deg, var(--neon-violet), #5a1fcc)',
              color: 'var(--text-primary)',
            }}
          >
            <Zap size={16} /> ENTER FOCUS LOCK
          </motion.button>
        </div>
      </div>

      {(isRunning || isPaused) && (
        <div
          className="glass-card p-3 mt-4 shrink-0"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <Stat label="Elapsed" value={formatTime(sessionElapsed)} />
            <Stat
              label="Distractions"
              value={String(distractions.length)}
              accent="var(--neon-amber)"
            />
            <Stat label="Streak" value={`${streak}d`} accent="var(--neon-violet)" />
          </div>
          <div className="h-8 flex items-end gap-0.5">
            {sparkline.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${Math.max(8, h * 100)}%`,
                  background:
                    h > 0 ? 'var(--neon-amber)' : 'var(--glass-border)',
                  opacity: h > 0 ? 0.8 : 0.3,
                }}
              />
            ))}
          </div>
          <p className="font-space text-[8px] text-[var(--text-muted)] text-center mt-1">
            interference timeline
          </p>
        </div>
      )}
    </motion.main>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <p className="font-space text-[8px] text-[var(--text-muted)]">{label}</p>
      <p className="font-orbitron text-sm" style={{ color: accent || 'var(--neon-cyan)' }}>
        {value}
      </p>
    </div>
  )
}

function buildSparkline(distractions, sessionElapsed) {
  const buckets = 12
  const result = new Array(buckets).fill(0)
  if (!sessionElapsed) return result
  const start = Date.now() - sessionElapsed * 1000
  distractions.forEach((d) => {
    const rel = (d.timestamp - start) / 1000
    const idx = Math.min(buckets - 1, Math.floor((rel / sessionElapsed) * buckets))
    if (idx >= 0) result[idx] += 1
  })
  const max = Math.max(1, ...result)
  return result.map((v) => v / max)
}
