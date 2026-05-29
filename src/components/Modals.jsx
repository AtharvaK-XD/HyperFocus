import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Mail, CheckCircle2, Cpu, LogOut, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import FocusScoreDisplay from './FocusScoreDisplay'
import {
  DISTRACTION_TYPES,
  formatTime,
  formatDuration,
  BREACH_REASONS,
} from '../utils/helpers'

export function StreakAlert({ streak, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed top-4 right-4 z-[110] max-w-xs cursor-pointer"
      onClick={onDismiss}
      role="alert"
    >
      <div
        className="glass-card px-4 py-3 font-dm text-xs"
        style={{
          background: 'var(--bg-elevated)',
          borderLeft: '3px solid var(--neon-amber)',
          boxShadow: '0 0 20px rgba(255,184,0,0.15)',
        }}
      >
        🔥 {streak}-day streak at risk — start a session to protect it
      </div>
    </motion.div>
  )
}

export function Toast({ message, onClose }) {
  if (!message) return null
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] toast-enter">
      <div
        className="glass-card px-4 py-3 font-dm text-xs max-w-sm text-center"
        style={{ borderColor: 'var(--neon-amber)', boxShadow: '0 0 20px rgba(255,184,0,0.2)' }}
      >
        {message}
        <button
          type="button"
          onClick={onClose}
          className="ml-3 text-[var(--neon-cyan)] underline"
        >
          dismiss
        </button>
      </div>
    </div>
  )
}

export function BreachModal({
  open,
  focusElapsed,
  breachReason,
  setBreachReason,
  onLogResume,
  onEndSession,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] backdrop-blur-md"
            style={{ background: 'rgba(4,5,10,0.85)' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[95] glass-card rounded-t-2xl p-6 max-w-lg mx-auto"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle style={{ color: 'var(--neon-rose)' }} />
              <h2 className="font-orbitron text-lg" style={{ color: 'var(--neon-rose)' }}>
                FOCUS BREACH DETECTED
              </h2>
            </div>
            <p className="font-dm text-sm text-[var(--text-muted)] mb-4">
              After {formatTime(focusElapsed)} of focus, your session was interrupted.
            </p>
            <p className="font-dm text-[10px] mb-2 text-[var(--text-muted)]">
              What caused the breach?
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {BREACH_REASONS.map((type) => {
                const meta = DISTRACTION_TYPES[type]
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBreachReason(type)}
                    className="py-2 rounded-lg border font-dm text-[10px] transition-all"
                    style={{
                      borderColor:
                        breachReason === type ? 'var(--neon-rose)' : 'var(--glass-border)',
                      color: breachReason === type ? 'var(--neon-rose)' : 'var(--text-muted)',
                      boxShadow:
                        breachReason === type
                          ? '0 0 12px rgba(255,45,107,0.3)'
                          : 'none',
                    }}
                  >
                    {meta.icon} {meta.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onLogResume}
                className="flex-1 py-3 rounded-lg font-orbitron text-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), #00c4a7)',
                  color: 'var(--bg-void)',
                }}
              >
                LOG & RESUME
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onEndSession}
                className="flex-1 py-3 rounded-lg font-orbitron text-sm border"
                style={{
                  borderColor: 'var(--neon-rose)',
                  color: 'var(--neon-rose)',
                }}
              >
                END SESSION
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function SummaryModal({
  open,
  sessionData,
  onSave,
  onClose,
}) {
  const [note, setNote] = useState('')

  const handleSave = () => {
    const distCount = sessionData?.distractions?.length ?? 0
    if (distCount === 0) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#7b2fff', '#ffb800'],
      })
    }
    onSave(note)
    setNote('')
  }

  if (!sessionData) return null

  const distCount = sessionData.distractions?.length ?? 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] backdrop-blur-md"
            style={{ background: 'rgba(4,5,10,0.8)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass-card p-6 max-w-md w-full pointer-events-auto"
              style={{ background: 'var(--bg-elevated)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-orbitron text-xl mb-2 text-[var(--neon-cyan)] text-center">
                SESSION COMPLETE
              </h2>

              {sessionData.focusScore != null && (
                <FocusScoreDisplay
                  score={sessionData.focusScore}
                  isPersonalBest={sessionData.isPersonalBest}
                />
              )}

              <div className="space-y-2 font-dm text-sm mb-4">
                <p>
                  Focus time:{' '}
                  <span className="text-[var(--neon-cyan)]">
                    {formatDuration(sessionData.elapsed)}
                  </span>
                </p>
                <p>
                  Distractions:{' '}
                  <span
                    style={{
                      color:
                        distCount === 0
                          ? '#4ade80'
                          : distCount <= 3
                            ? 'var(--neon-amber)'
                            : 'var(--neon-rose)',
                    }}
                  >
                    {distCount}
                  </span>
                </p>
                <p>
                  Task: <span className="text-[var(--text-primary)]">{sessionData.taskTitle}</span>
                </p>
                {sessionData.completedFull && (
                  <p className="text-[#4ade80] text-xs">Full session completed ✓</p>
                )}
                {sessionData.mood && (
                  <p className="text-[var(--text-muted)] text-xs mt-1">
                    You started this session feeling{' '}
                    <span className="text-[var(--neon-cyan)] uppercase font-semibold">
                      {sessionData.mood === 'tired' && '😴 TIRED'}
                      {sessionData.mood === 'neutral' && '😐 NEUTRAL'}
                      {sessionData.mood === 'good' && '🙂 GOOD'}
                      {sessionData.mood === 'energized' && '⚡ ENERGIZED'}
                      {sessionData.mood === 'in_the_zone' && '🔥 IN THE ZONE'}
                    </span>
                  </p>
                )}
              </div>
              <label className="font-dm text-[10px] text-[var(--text-muted)] block mb-1">
                What went well?
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Optional reflection..."
                className="w-full px-3 py-2 rounded-lg text-xs font-dm bg-[var(--bg-void)] border border-[var(--glass-border)] resize-none mb-4"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="w-full py-3 rounded-lg font-orbitron text-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                  color: 'var(--bg-void)',
                }}
              >
                SAVE SESSION
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function NeuralIdentityModal({
  open,
  currentEmail,
  hasLocalData,
  emailHasData,
  onConnect,
  onDisconnect,
  onClose,
}) {
  const [emailInput, setEmailInput] = useState('')
  const [step, setStep] = useState('input') // 'input' | 'syncing' | 'mergePrompt' | 'connected'
  const [syncStage, setSyncStage] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const syncLogs = [
    'ESTABLISHING NEURAL LINK...',
    'DECRYPTING REMOTE ARCHIVES...',
    'SYNCING TASK NEXUS...',
    'ANCHORING FOCUS STREAK...',
    'IDENTITY SYNC COMPLETE.'
  ]



  const callbackRefs = useRef({ onConnect, onClose, emailHasData, hasLocalData, emailInput })
  const hasFiredRef = useRef(false)

  useEffect(() => {
    callbackRefs.current = { onConnect, onClose, emailHasData, hasLocalData, emailInput }
  })

  useEffect(() => {
    if (open) {
      if (currentEmail) {
        setStep('connected')
      } else {
        setStep('input')
        setEmailInput('')
        setErrorMsg('')
        setSyncStage(0)
        hasFiredRef.current = false // Reset fail-safe on modal reopen
      }
    }
  }, [open, currentEmail])

  useEffect(() => {
    if (step === 'syncing') {
      hasFiredRef.current = false // Reset when starting sync animation
      let stage = 0
      const interval = setInterval(() => {
        stage += 1
        if (stage < syncLogs.length) {
          setSyncStage(stage)
        } else {
          clearInterval(interval)
          if (hasFiredRef.current) return // Double trigger fail-safe
          hasFiredRef.current = true

          const { onConnect, onClose, emailHasData, hasLocalData, emailInput } = callbackRefs.current
          const emailClean = emailInput.toLowerCase().trim()
          const exists = emailHasData(emailClean)
          if (hasLocalData && !exists) {
            setStep('mergePrompt')
            hasFiredRef.current = false // Allow merge click
          } else {
            onConnect(emailClean, false)
            confetti({
              particleCount: 80,
              spread: 50,
              origin: { y: 0.6 },
              colors: ['#00f5d4', '#7b2fff'],
            })
            onClose()
          }
        }
      }, 350)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleConnectClick = (e) => {
    e.preventDefault()
    const emailClean = emailInput.trim()
    if (!emailClean) {
      setErrorMsg('Email signature required')
      return
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(emailClean)) {
      setErrorMsg('Invalid quantum address format')
      return
    }
    setErrorMsg('')
    setSyncStage(0)
    setStep('syncing')
  }

  const handleMergeAction = (shouldMerge) => {
    if (hasFiredRef.current) return // Double click fail-safe
    hasFiredRef.current = true

    onConnect(emailInput.toLowerCase().trim(), shouldMerge)
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#7b2fff', '#ffb800'],
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] backdrop-blur-md"
            style={{ background: 'rgba(4,5,10,0.85)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass-card p-6 max-w-sm w-full pointer-events-auto"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 0 30px rgba(0, 245, 212, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* STEP: INPUT EMAIL */}
              {step === 'input' && (
                <form onSubmit={handleConnectClick}>
                  <div className="flex flex-col items-center mb-4 text-center">
                    <div
                      className="w-10 h-10 rounded-full border flex items-center justify-center mb-2"
                      style={{
                        borderColor: 'var(--neon-cyan)',
                        background: 'rgba(0, 245, 212, 0.1)',
                        boxShadow: '0 0 10px rgba(0, 245, 212, 0.3)',
                      }}
                    >
                      <Cpu size={18} style={{ color: 'var(--neon-cyan)' }} />
                    </div>
                    <h2 className="font-orbitron text-sm md:text-base text-[var(--neon-cyan)] tracking-wider uppercase font-semibold">
                      SYNC NEURAL IDENTITY
                    </h2>
                    <p className="font-dm text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                      Scope your daily streaks, focus minutes, and tasks to your email. Sync seamlessly across reload cycles.
                    </p>
                  </div>

                  <div className="space-y-3 font-dm">
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <input
                        type="email"
                        placeholder="agent@nebula.io"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value)
                          if (errorMsg) setErrorMsg('')
                        }}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-dm bg-[var(--bg-void)] border text-[var(--text-primary)] transition-colors focus:border-[var(--neon-cyan)]"
                        style={{ borderColor: errorMsg ? 'var(--neon-rose)' : 'var(--glass-border)' }}
                      />
                    </div>
                    {errorMsg && (
                      <p className="text-[var(--neon-rose)] text-[9px] font-dm text-center uppercase tracking-wide">
                        ⚡ {errorMsg}
                      </p>
                    )}
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-2.5 rounded-lg font-orbitron text-xs font-bold tracking-wider"
                      style={{
                        background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                        color: 'var(--bg-void)',
                        boxShadow: '0 0 12px rgba(0, 245, 212, 0.25)',
                      }}
                    >
                      CONNECT NEURAL NODE
                    </motion.button>
                  </div>
                </form>
              )}

              {/* STEP: SYNCING ANIMATION */}
              {step === 'syncing' && (
                <div className="flex flex-col items-center py-6 text-center">
                  {/* Cyber Spinner */}
                  <div className="relative w-16 h-16 mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--neon-cyan)] border-b-[var(--neon-violet)]"
                    />
                    <div className="absolute inset-2 rounded-full border border-dashed border-[var(--glass-border)] flex items-center justify-center">
                      <Cpu size={14} className="animate-pulse" style={{ color: 'var(--neon-cyan)' }} />
                    </div>
                  </div>

                  <h3 className="font-orbitron text-xs text-[var(--text-primary)] font-bold tracking-widest uppercase mb-4">
                    ESTABLISHING PROTOCOL
                  </h3>

                  {/* Terminal log streams */}
                  <div className="w-full p-3 rounded-lg bg-[var(--bg-void)] border border-[var(--glass-border)] font-dm text-[9px] text-left min-h-[76px] space-y-1 overflow-hidden">
                    {syncLogs.slice(0, syncStage + 1).map((log, index) => (
                      <motion.div
                        key={log}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={index === syncStage ? 'text-[var(--neon-cyan)]' : 'text-[var(--text-muted)]'}
                      >
                        {index === syncStage ? '> ' : '✓ '} {log}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: DATA MERGE DIALOG */}
              {step === 'mergePrompt' && (
                <div className="flex flex-col text-center">
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-2 mx-auto"
                    style={{
                      borderColor: 'var(--neon-amber)',
                      background: 'rgba(255, 184, 0, 0.1)',
                      boxShadow: '0 0 10px rgba(255, 184, 0, 0.25)',
                    }}
                  >
                    <AlertTriangle size={18} style={{ color: 'var(--neon-amber)' }} />
                  </div>
                  <h2 className="font-orbitron text-sm text-[var(--neon-amber)] tracking-wider uppercase font-semibold">
                    LOCAL SECTORS DETECTED
                  </h2>
                  <p className="font-dm text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
                    You have active Guest tasks and focus history. Would you like to merge them into <strong className="text-[var(--text-primary)]">{emailInput}</strong> to keep your streak, or start fresh?
                  </p>

                  <div className="space-y-2 mt-4 font-orbitron">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMergeAction(true)}
                      className="w-full py-2.5 rounded-lg text-xs font-bold tracking-wider"
                      style={{
                        background: 'var(--neon-cyan)',
                        color: 'var(--bg-void)',
                        boxShadow: '0 0 10px rgba(0, 245, 212, 0.25)',
                      }}
                    >
                      MERGE LOCAL DATA
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMergeAction(false)}
                      className="w-full py-2.5 rounded-lg text-xs font-bold tracking-wider border"
                      style={{
                        borderColor: 'var(--glass-border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      START CLEAN
                    </motion.button>
                  </div>
                </div>
              )}

              {/* STEP: CONNECTED PROFILE */}
              {step === 'connected' && (
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-2"
                    style={{
                      borderColor: 'rgba(74, 222, 128, 0.8)',
                      background: 'rgba(74, 222, 128, 0.1)',
                      boxShadow: '0 0 10px rgba(74, 222, 128, 0.3)',
                    }}
                  >
                    <CheckCircle2 size={18} style={{ color: '#4ade80' }} />
                  </div>
                  <h2 className="font-orbitron text-sm text-[#4ade80] tracking-wider uppercase font-semibold">
                    NEURAL LINK ESTABLISHED
                  </h2>
                  <p className="font-dm text-[10px] text-[var(--text-muted)] mt-1 mb-4 leading-relaxed">
                    System operations and streaks are secured under the email signature:
                  </p>

                  <div
                    className="px-4 py-2 rounded-lg border font-dm text-xs text-[var(--neon-cyan)] w-full mb-6 text-center select-all cursor-pointer font-bold break-all"
                    style={{
                      borderColor: 'var(--glass-border)',
                      background: 'var(--bg-void)',
                    }}
                  >
                    👤 {currentEmail}
                  </div>

                  <div className="flex gap-2 w-full font-orbitron">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setStep('input')
                        setEmailInput('')
                        setErrorMsg('')
                      }}
                      className="flex-1 py-2.5 rounded-lg text-[10px] border tracking-wider font-bold"
                      style={{
                        borderColor: 'var(--glass-border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      SWITCH SIGNATURE
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onDisconnect()
                        onClose()
                      }}
                      className="flex-1 py-2.5 rounded-lg text-[10px] border tracking-wider font-bold flex items-center justify-center gap-1"
                      style={{
                        borderColor: 'var(--neon-rose)',
                        color: 'var(--neon-rose)',
                      }}
                    >
                      <LogOut size={10} /> DISCONNECT
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

