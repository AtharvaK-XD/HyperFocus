import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Web Audio API Synthesizer Helper
class SoundscapeSynth {
  constructor() {
    this.audioCtx = null
    this.timeoutId = null
    this.nodes = []
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.nodes.forEach((n) => {
      try { n.stop() } catch (e) {}
      try { n.disconnect() } catch (e) {}
    })
    this.nodes = []
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close()
      this.audioCtx = null
    }
  }

  playPreview(type) {
    this.stop()

    if (type === 'spotify') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return
      this.audioCtx = new AudioContextClass()
      const now = this.audioCtx.currentTime
      const osc = this.audioCtx.createOscillator()
      const gainNode = this.audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now) // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15) // sweep up to A5 note
      gainNode.gain.setValueAtTime(0.15, now)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
      osc.connect(gainNode)
      gainNode.connect(this.audioCtx.destination)
      osc.start()
      osc.stop(now + 0.3)
      this.nodes.push(osc)
      this.timeoutId = setTimeout(() => this.stop(), 300)
      return
    }
  }
}

export default function OnboardingOverlay({ open, onComplete }) {
  const [step, setStep] = useState(1)
  const [initializing, setInitializing] = useState(false)

  // Quick Setup States
  const [dailyGoal, setDailyGoal] = useState(2) // Default: 2 HRS
  const [customGoal, setCustomGoal] = useState('')
  const [isCustomGoalOpen, setIsCustomGoalOpen] = useState(false)

  const [sessionMinutes, setSessionMinutes] = useState(25) // Default: 25 MIN
  const [soundscape, setSoundscape] = useState('spotify') // Default: SPOTIFY

  const synthRef = useRef(null)

  useEffect(() => {
    synthRef.current = new SoundscapeSynth()
    return () => {
      if (synthRef.current) {
        synthRef.current.stop()
      }
    }
  }, [])

  if (!open) return null

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Trigger Launch!
      setInitializing(true)
      if (synthRef.current) {
        synthRef.current.stop()
      }

      // 1.2s loading state
      setTimeout(() => {
        const finalGoal = isCustomGoalOpen ? Math.max(1, Number(customGoal) || 2) : dailyGoal
        onComplete({
          dailyGoalHours: finalGoal,
          defaultSessionMinutes: sessionMinutes,
          soundscape,
        })
        setInitializing(false)
        setStep(1)
      }, 1200)
    }
  }

  const handleSkip = () => {
    if (synthRef.current) {
      synthRef.current.stop()
    }
    onComplete({
      dailyGoalHours: 2,
      defaultSessionMinutes: 25,
      soundscape: 'spotify',
    })
  }

  const selectSound = (type) => {
    setSoundscape(type)
    if (synthRef.current) {
      synthRef.current.playPreview(type)
    }
    if (type === 'spotify') {
      window.open('https://open.spotify.com/', '_blank')
    }
  }

  const stepVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md"
      style={{
        background: 'rgba(4, 5, 10, 0.92)',
      }}
    >
      {/* Central Onboarding Card */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 25 }}
        className="glass-card w-full max-w-[560px] p-6 md:p-8 flex flex-col relative overflow-hidden"
        style={{
          background: 'rgba(9, 12, 20, 0.85)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 0 40px rgba(0, 245, 212, 0.12)',
          borderRadius: '16px',
        }}
      >
        {/* Top Progress Dots */}
        <div className="flex justify-center gap-3.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative w-2 h-2 flex items-center justify-center">
              {step === s ? (
                <motion.div
                  layoutId="activeDotGlow"
                  className="absolute w-4 h-4 rounded-full bg-[rgba(0,245,212,0.15)] blur-sm"
                />
              ) : null}
              <motion.div
                className="w-2 h-2 rounded-full border transition-all"
                style={{
                  borderColor: step === s ? 'var(--neon-cyan)' : 'var(--glass-border)',
                  background: step === s ? 'var(--neon-cyan)' : 'transparent',
                  boxShadow: step === s ? '0 0 8px var(--neon-cyan)' : 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Content Wizard (AnimatePresence Step transitions) */}
        <div className="flex-1 min-h-[360px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={step}>
            <motion.div
              key={step}
              custom={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex-1 flex flex-col justify-start"
            >
              {/* STEP 1: WELCOME SCREEN */}
              {step === 1 && (
                <div className="flex flex-col items-center text-center gap-6">
                  {/* Glowing Pulse Brain/Neural Node Logo */}
                  <div className="relative w-32 h-32 flex items-center justify-center mb-1 select-none">
                    {/* Rotating outer ring */}
                    <div
                      className="absolute inset-0 rounded-full border border-dashed border-[var(--neon-cyan)] opacity-40"
                      style={{ animation: 'spin 20s linear infinite' }}
                    />
                    {/* Inner glowing pulse node */}
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-16 h-16 rounded-full border border-[var(--neon-cyan)] flex items-center justify-center relative"
                      style={{
                        background: 'radial-gradient(circle, rgba(0, 245, 212, 0.25) 0%, transparent 80%)',
                        boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)',
                      }}
                    >
                      {/* Neural Connections Drawing inside SVG */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="4" x2="12" y2="9" />
                        <line x1="12" y1="15" x2="12" y2="20" />
                        <line x1="4" y1="12" x2="9" y2="12" />
                        <line x1="15" y1="12" x2="20" y2="12" />
                        <line x1="6.34" y1="6.34" x2="9.88" y2="9.88" />
                        <line x1="14.12" y1="14.12" x2="17.66" y2="17.66" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Header tags */}
                  <div>
                    <span className="font-dm text-[9px] tracking-[0.25em] text-[var(--neon-cyan)] opacity-80 uppercase font-semibold">
                      WELCOME TO
                    </span>
                    <h2
                      className="font-orbitron text-lg md:text-xl tracking-widest text-[var(--neon-cyan)] mt-1 font-bold"
                      style={{ textShadow: '0 0 12px rgba(0, 245, 212, 0.45)' }}
                    >
                      HYPER FOCUS
                    </h2>
                    <p className="font-dm text-[11px] text-[var(--text-muted)] mt-2.5 max-w-sm mx-auto leading-relaxed">
                      A deep-work command center that tracks where your attention goes — and what breaks it.
                    </p>
                  </div>

                  {/* Features Pills Row */}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {['⚡ Focus Lock', '📊 Distraction Logs', '🔥 Streaks'].map((chip) => (
                      <span
                        key={chip}
                        className="font-dm text-[10px] px-3 py-1 rounded-full border"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderColor: 'var(--glass-border)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: HOW IT WORKS TIMELINE */}
              {step === 2 && (
                <div className="flex flex-col gap-5 w-full">
                  <div className="text-center mb-1">
                    <h2
                      className="font-orbitron text-base md:text-lg tracking-widest text-[var(--neon-violet)] font-bold uppercase"
                      style={{ textShadow: '0 0 12px rgba(123, 47, 255, 0.35)' }}
                    >
                      HOW IT WORKS
                    </h2>
                    <p className="font-dm text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                      Three simple steps to a focused session
                    </p>
                  </div>

                  {/* Timeline container */}
                  <div className="relative flex flex-col gap-4 mt-1 pl-4">
                    {/* Running Connection Line */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '80%' }}
                      transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
                      className="absolute left-[30px] top-[24px] w-0.5 bg-[var(--neon-cyan)] opacity-50 z-0"
                    />

                    {/* Stagger Steps */}
                    <motion.div
                      variants={{
                        show: {
                          transition: { staggerChildren: 0.2 },
                        },
                      }}
                      initial="hidden"
                      animate="show"
                      className="space-y-3"
                    >
                      {[
                        {
                          num: '01',
                          icon: '🎯',
                          title: 'Pick a Task',
                          desc: 'Select one task from your Task Nexus. One task. One session. Full focus.',
                        },
                        {
                          num: '02',
                          icon: '⚡',
                          title: 'Enter Focus Lock',
                          desc: 'Hit Focus Lock to go fullscreen. The app hides everything except your timer.',
                        },
                        {
                          num: '03',
                          icon: '📊',
                          title: 'Review Your Session',
                          desc: 'See your Focus Score, distractions logged, and session history after every session.',
                        },
                      ].map((item, idx) => (
                        <motion.div
                          key={item.num}
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            show: { opacity: 1, y: 0 },
                          }}
                          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                          className="glass-card p-3 flex items-start gap-4 z-10 relative"
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderColor: 'var(--glass-border)',
                            borderRadius: '10px',
                          }}
                        >
                          {/* Circle Number */}
                          <div
                            className="shrink-0 w-8 h-8 rounded-full border border-[var(--neon-cyan)] flex items-center justify-center font-orbitron text-xs text-[var(--neon-cyan)] font-bold shadow-[0_0_8px_rgba(0,245,212,0.2)] bg-[rgba(9,12,20,0.6)]"
                          >
                            {item.num}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-orbitron text-xs text-[var(--text-primary)] font-bold flex items-center gap-1.5 uppercase">
                              <span>{item.icon}</span> {item.title}
                            </h4>
                            <p className="font-dm text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              )}

              {/* STEP 3: QUICK SETUP */}
              {step === 3 && (
                <div className="flex flex-col gap-5 w-full">
                  <div className="text-center">
                    <h2
                      className="font-orbitron text-base md:text-lg tracking-widest text-[var(--neon-cyan)] font-bold uppercase"
                      style={{ textShadow: '0 0 12px rgba(0, 245, 212, 0.35)' }}
                    >
                      QUICK SETUP
                    </h2>
                    <p className="font-dm text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                      Personalize before you begin
                    </p>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-4 font-dm text-xs">
                    
                    {/* INPUT 1: Daily Focus Goal */}
                    <div className="space-y-1.5">
                      <label className="font-dm text-[9px] tracking-wider text-[var(--text-muted)] uppercase font-semibold">
                        DAILY FOCUS GOAL
                      </label>
                      <div className="flex flex-wrap gap-2 items-center">
                        {[
                          { hours: 1, label: '1 HR' },
                          { hours: 2, label: '2 HRS' },
                          { hours: 4, label: '4 HRS' },
                        ].map((item) => (
                          <motion.button
                            key={item.hours}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setDailyGoal(item.hours)
                              setIsCustomGoalOpen(false)
                            }}
                            className="py-1.5 px-3 rounded-lg border font-orbitron text-[10px] tracking-wider transition-all uppercase"
                            style={{
                              borderColor: !isCustomGoalOpen && dailyGoal === item.hours ? 'var(--neon-cyan)' : 'var(--glass-border)',
                              color: !isCustomGoalOpen && dailyGoal === item.hours ? 'var(--bg-void)' : 'var(--text-muted)',
                              background: !isCustomGoalOpen && dailyGoal === item.hours ? 'var(--neon-cyan)' : 'transparent',
                              boxShadow: !isCustomGoalOpen && dailyGoal === item.hours ? '0 0 10px rgba(0,245,212,0.3)' : 'none',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.label}
                          </motion.button>
                        ))}
                        
                        {/* CUSTOM Pill */}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsCustomGoalOpen(true)
                          }}
                          className="py-1.5 px-3 rounded-lg border font-orbitron text-[10px] tracking-wider transition-all uppercase"
                          style={{
                            borderColor: isCustomGoalOpen ? 'var(--neon-cyan)' : 'var(--glass-border)',
                            color: isCustomGoalOpen ? 'var(--bg-void)' : 'var(--text-muted)',
                            background: isCustomGoalOpen ? 'var(--neon-cyan)' : 'transparent',
                            boxShadow: isCustomGoalOpen ? '0 0 10px rgba(0,245,212,0.3)' : 'none',
                            fontWeight: 'bold',
                          }}
                        >
                          CUSTOM
                        </motion.button>

                        {/* Inline Number input for Custom */}
                        {isCustomGoalOpen && (
                          <motion.input
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            type="number"
                            min="1"
                            max="24"
                            placeholder="Hours"
                            value={customGoal}
                            onChange={(e) => setCustomGoal(e.target.value)}
                            className="w-16 px-2 py-1.5 rounded-lg text-[10px] font-dm bg-[var(--bg-void)] border border-[var(--neon-cyan)] text-center text-[var(--neon-cyan)]"
                          />
                        )}
                      </div>
                    </div>

                    {/* INPUT 2: Default Session Length */}
                    <div className="space-y-1.5">
                      <label className="font-dm text-[9px] tracking-wider text-[var(--text-muted)] uppercase font-semibold">
                        DEFAULT SESSION LENGTH
                      </label>
                      <div className="flex gap-2">
                        {[25, 50, 90].map((mins) => (
                          <motion.button
                            key={mins}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSessionMinutes(mins)}
                            className="py-1.5 px-3 rounded-lg border font-orbitron text-[10px] tracking-wider transition-all uppercase"
                            style={{
                              borderColor: sessionMinutes === mins ? 'var(--neon-violet)' : 'var(--glass-border)',
                              color: sessionMinutes === mins ? 'var(--text-primary)' : 'var(--text-muted)',
                              background: sessionMinutes === mins ? 'linear-gradient(135deg, var(--neon-violet), #5a1fcc)' : 'transparent',
                              boxShadow: sessionMinutes === mins ? '0 0 10px rgba(123,47,255,0.3)' : 'none',
                              fontWeight: 'bold',
                            }}
                          >
                            {mins} MIN
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* INPUT 3: Soundscape Preference */}
                    <div className="space-y-1.5">
                      <label className="font-dm text-[9px] tracking-wider text-[var(--text-muted)] uppercase font-semibold">
                        FOCUS SOUNDSCAPE (CLICK FOR PREVIEW)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'spotify', label: '🎵 SPOTIFY' },
                        ].map((scape) => (
                          <motion.button
                            key={scape.id}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectSound(scape.id)}
                            className="py-1.5 px-2.5 rounded-lg border font-orbitron text-[10px] tracking-wider transition-all uppercase"
                            style={{
                              borderColor: soundscape === scape.id ? 'var(--neon-amber)' : 'var(--glass-border)',
                              color: soundscape === scape.id ? 'var(--text-primary)' : 'var(--text-muted)',
                              background: soundscape === scape.id ? 'rgba(255,184,0,0.15)' : 'transparent',
                              boxShadow: soundscape === scape.id ? '0 0 10px rgba(255,184,0,0.25)' : 'none',
                              fontWeight: 'bold',
                            }}
                          >
                            {scape.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CTA & Skip Navigation Footer */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-[var(--glass-border)] shrink-0">
            {/* Skip Tour */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={handleSkip}
              className="font-dm text-[9px] tracking-widest text-[var(--text-muted)] hover:text-[var(--neon-rose)] transition-colors uppercase font-bold"
            >
              SKIP TOUR &rarr;
            </motion.button>

            {/* Next Step CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={initializing}
              onClick={handleNext}
              className="py-3 px-6 rounded-lg font-orbitron text-xs tracking-wider flex items-center justify-center gap-2 select-none"
              style={{
                background:
                  step === 1
                    ? 'linear-gradient(135deg, var(--neon-cyan), #00c4a7)'
                    : step === 2
                    ? 'linear-gradient(135deg, var(--neon-violet), #5a1fcc)'
                    : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                color: step === 1 ? 'var(--bg-void)' : 'var(--text-primary)',
                boxShadow:
                  step === 3
                    ? '0 0 15px rgba(0, 245, 212, 0.3)'
                    : step === 1
                    ? '0 0 12px rgba(0, 245, 212, 0.25)'
                    : '0 0 12px rgba(123, 47, 255, 0.25)',
                fontWeight: 'bold',
              }}
            >
              {initializing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>INITIALIZING...</span>
                </>
              ) : step === 1 ? (
                'INITIALIZE SYSTEM →'
              ) : step === 2 ? (
                'GOT IT →'
              ) : (
                'LAUNCH HYPER FOCUS ⚡'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
