import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Mail, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function StartLoginOverlay({
  open,
  emailHasData,
  hasLocalData,
  onConnect,
  onBypass,
}) {
  const [emailInput, setEmailInput] = useState('')
  const [step, setStep] = useState('input') // 'input' | 'syncing' | 'mergePrompt'
  const [syncStage, setSyncStage] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const hasFiredRef = useRef(false)

  const syncLogs = [
    'ESTABLISHING PROTOCOL...',
    'PINGING COGNITIVE DOCK...',
    'RETRIEVING COMPLETED TASKS...',
    'RECONSTRUCTING DAILY STREAK...',
    'SECURE SYNC ANCHORED.'
  ]

  useEffect(() => {
    if (open) {
      setStep('input')
      setEmailInput('')
      setErrorMsg('')
      setSyncStage(0)
      hasFiredRef.current = false
    }
  }, [open])

  useEffect(() => {
    if (step === 'syncing') {
      let stage = 0
      const interval = setInterval(() => {
        stage += 1
        if (stage < syncLogs.length) {
          setSyncStage(stage)
        } else {
          clearInterval(interval)
          if (hasFiredRef.current) return
          hasFiredRef.current = true

          const emailClean = emailInput.toLowerCase().trim()
          const exists = emailHasData(emailClean)
          const localExists = hasLocalData()

          if (localExists && !exists) {
            setStep('mergePrompt')
            hasFiredRef.current = false // Allow merge decision
          } else {
            onConnect(emailClean, false)
            confetti({
              particleCount: 100,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#00f5d4', '#7b2fff'],
            })
          }
        }
      }, 350)
      return () => clearInterval(interval)
    }
  }, [step, emailInput, emailHasData, hasLocalData, onConnect])

  const handleSubmit = (e) => {
    e.preventDefault()
    const emailClean = emailInput.trim()
    if (!emailClean) {
      setErrorMsg('Email signature required')
      return
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(emailClean)) {
      setErrorMsg('Invalid signature format')
      return
    }
    setErrorMsg('')
    setSyncStage(0)
    setStep('syncing')
  }

  const handleMergeDecision = (shouldMerge) => {
    if (hasFiredRef.current) return
    hasFiredRef.current = true
    onConnect(emailInput.toLowerCase().trim(), shouldMerge)
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#7b2fff', '#ffb800'],
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0c0f1d 0%, #04050a 100%)',
      }}
    >
      {/* Moving background details */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full blur-[100px] bg-[var(--neon-cyan)]" />
        <div className="absolute bottom-[10%] right-[20%] w-[25vw] h-[25vw] rounded-full blur-[100px] bg-[var(--neon-violet)]" />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="glass-card w-full max-w-[480px] p-6 md:p-8 flex flex-col relative z-10 overflow-hidden"
        style={{
          background: 'rgba(9, 12, 20, 0.85)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 0 40px rgba(0, 245, 212, 0.15)',
          borderRadius: '16px',
        }}
      >
        {/* STEP: INPUT */}
        {step === 'input' && (
          <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
            <div className="flex flex-col items-center text-center gap-5">
              {/* Rotating outer ring and logo */}
              <div className="relative w-24 h-24 flex items-center justify-center mb-1 select-none">
                <div
                  className="absolute inset-0 rounded-full border border-dashed border-[var(--neon-cyan)] opacity-40"
                  style={{ animation: 'spin 25s linear infinite' }}
                />
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-12 h-12 rounded-full border border-[var(--neon-cyan)] flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 245, 212, 0.2) 0%, transparent 80%)',
                    boxShadow: '0 0 15px rgba(0, 245, 212, 0.3)',
                  }}
                >
                  <Cpu size={20} style={{ color: 'var(--neon-cyan)' }} />
                </motion.div>
              </div>

              <div>
                <span className="font-dm text-[9px] tracking-[0.25em] text-[var(--neon-cyan)] opacity-80 uppercase font-semibold">
                  AUTHENTICATE INTERFACE
                </span>
                <h2
                  className="font-orbitron text-lg md:text-xl tracking-widest text-[var(--neon-cyan)] mt-1 font-bold"
                  style={{ textShadow: '0 0 12px rgba(0, 245, 212, 0.45)' }}
                >
                  HYPER FOCUS
                </h2>
                <p className="font-dm text-[11px] text-[var(--text-muted)] mt-2.5 max-w-sm mx-auto leading-relaxed">
                  Enter your email signature below to anchor your workspace, recover completed tasks, and secure your daily focus streak.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4 font-dm">
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="email"
                  placeholder="agent@nebula.io"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs font-dm bg-[var(--bg-void)] border text-[var(--text-primary)] transition-colors focus:border-[var(--neon-cyan)]"
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg font-orbitron text-xs font-bold tracking-widest cursor-pointer flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                  color: 'var(--bg-void)',
                  boxShadow: '0 0 15px rgba(0, 245, 212, 0.3)',
                }}
              >
                ESTABLISH COGNITIVE LINK <ChevronRight size={12} />
              </motion.button>

              <button
                type="button"
                onClick={onBypass}
                className="w-full text-center font-dm text-[9px] tracking-wider text-[var(--text-muted)] hover:text-[var(--neon-rose)] transition-colors uppercase pt-2 cursor-pointer"
              >
                PROCEED IN GUEST MODE &rarr;
              </button>
            </div>
          </form>
        )}

        {/* STEP: SYNCING */}
        {step === 'syncing' && (
          <div className="flex flex-col items-center py-8 text-center justify-center min-h-[300px]">
            <div className="relative w-20 h-20 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--neon-cyan)] border-b-[var(--neon-violet)]"
              />
              <div className="absolute inset-2 rounded-full border border-dashed border-[var(--glass-border)] flex items-center justify-center">
                <Cpu size={18} className="animate-pulse" style={{ color: 'var(--neon-cyan)' }} />
              </div>
            </div>

            <h3 className="font-orbitron text-xs text-[var(--text-primary)] font-bold tracking-widest uppercase mb-4">
              ESTABLISHING LINK
            </h3>

            <div className="w-full p-4 rounded-lg bg-[var(--bg-void)] border border-[var(--glass-border)] font-dm text-[9px] text-left min-h-[90px] space-y-1.5 overflow-hidden">
              {syncLogs.slice(0, syncStage + 1).map((log, idx) => (
                <motion.div
                  key={log}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={idx === syncStage ? 'text-[var(--neon-cyan)] font-bold' : 'text-[var(--text-muted)]'}
                >
                  {idx === syncStage ? '> ' : '✓ '} {log}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* STEP: MERGE PROMPT */}
        {step === 'mergePrompt' && (
          <div className="flex flex-col text-center justify-center py-4">
            <div
              className="w-12 h-12 rounded-full border flex items-center justify-center mb-4 mx-auto"
              style={{
                borderColor: 'var(--neon-amber)',
                background: 'rgba(255, 184, 0, 0.1)',
                boxShadow: '0 0 15px rgba(255, 184, 0, 0.3)',
              }}
            >
              <ShieldAlert size={22} style={{ color: 'var(--neon-amber)' }} />
            </div>
            <h2 className="font-orbitron text-sm text-[var(--neon-amber)] tracking-wider uppercase font-semibold">
              LOCAL DATA SECTORS DETECTED
            </h2>
            <p className="font-dm text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed max-w-sm mx-auto">
              We found active Guest tasks and focus history on this machine. Would you like to merge them into <strong className="text-[var(--text-primary)]">{emailInput}</strong> to keep your streak, or start fresh?
            </p>

            <div className="space-y-2 mt-6 font-orbitron w-full max-w-xs mx-auto">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMergeDecision(true)}
                className="w-full py-2.5 rounded-lg text-xs font-bold tracking-wider cursor-pointer"
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
                onClick={() => handleMergeDecision(false)}
                className="w-full py-2.5 rounded-lg text-xs font-bold tracking-wider border cursor-pointer"
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
      </motion.div>
    </div>
  )
}
