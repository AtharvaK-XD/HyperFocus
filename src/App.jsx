import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Background from './components/Background'
import TopBar from './components/TopBar'
import TaskNexus from './components/TaskNexus'
import FocusCore from './components/FocusCore'
import SignalLog from './components/SignalLog'
import SessionArchive from './components/SessionArchive'
import FocusHeatmap from './components/FocusHeatmap'
import FocusLockOverlay from './components/FocusLockOverlay'
import { Toast, BreachModal, SummaryModal, StreakAlert } from './components/Modals'
import { useInterval } from './hooks/useInterval'

// Wellness Components
import BreathingExercise from './components/Wellness/BreathingExercise'
import PostureReminder from './components/Wellness/PostureReminder'
import HydrationReminder from './components/Wellness/HydrationReminder'
import EyeRestAlert from './components/Wellness/EyeRestAlert'
import MoodCheckIn from './components/Wellness/MoodCheckIn'
import OnboardingOverlay from './components/Wellness/OnboardingOverlay'

import {
  loadSessions,
  saveSessions,
  loadTasks,
  saveTasks,
  loadTimerPrefs,
  saveTimerPrefs,
  clampDuration,
  generateId,
  playChime,
  calcStreak,
  calculateFocusScore,
  getPersonalBestScore,
  loadDailyGoal,
  saveDailyGoal,
  getTodayFocusSeconds,
  hasSessionToday,
} from './utils/helpers'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [sessions, setSessions] = useState(loadSessions)
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [taskFilter, setTaskFilter] = useState('ALL')

  const initialTimerPrefs = loadTimerPrefs()
  const initialPreset = initialTimerPrefs.presets.find(
    (p) => p.id === initialTimerPrefs.activePresetId
  ) || initialTimerPrefs.presets[0]
  const initialSeconds = clampDuration((initialPreset?.minutes || 25) * 60)

  const [duration, setDuration] = useState(initialSeconds)
  const [remaining, setRemaining] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [timerPrefs, setTimerPrefs] = useState(initialTimerPrefs)

  const [distractions, setDistractions] = useState([])
  const [focusLockActive, setFocusLockActive] = useState(false)
  const [focusLockStartedAt, setFocusLockStartedAt] = useState(null)
  const [focusLockTick, setFocusLockTick] = useState(0)

  const [showBreachModal, setShowBreachModal] = useState(false)
  const [breachReason, setBreachReason] = useState('OTHER')
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [pendingSession, setPendingSession] = useState(null)

  const [shakeTasks, setShakeTasks] = useState(false)
  const [toast, setToast] = useState('')
  const [dailyGoal, setDailyGoal] = useState(loadDailyGoal)
  const [streakAlert, setStreakAlert] = useState(null)
  const [mobileLeft, setMobileLeft] = useState(false)
  const [mobileRight, setMobileRight] = useState(false)
  
  // --- Wellness State Hooks ---
  const [userSettings, setUserSettings] = useState(() => {
    const stored = localStorage.getItem('userSettings')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {}
    }
    return {
      dnd: false,
      postureInterval: 30, // in minutes
      hydrationThreshold: 90, // in minutes
    }
  })

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(userSettings))
  }, [userSettings])

  const [breathingActive, setBreathingActive] = useState(false)
  const [postureAlertActive, setPostureAlertActive] = useState(false)
  const [postureMessageIndex, setPostureMessageIndex] = useState(0)

  const [hydrationAlertActive, setHydrationAlertActive] = useState(false)
  const [hydrationSnoozed, setHydrationSnoozed] = useState(false)
  const [hydrationNextTriggerTime, setHydrationNextTriggerTime] = useState(null)

  const [eyeRestActive, setEyeRestActive] = useState(false)
  const [eyeRestRemaining, setEyeRestRemaining] = useState(20)
  const wasRunningBeforeEyeRestRef = useRef(false)

  const [moodModalActive, setMoodModalActive] = useState(false)
  const [currentSessionMood, setCurrentSessionMood] = useState(null)

  // --- Onboarding Flow States ---
  const [onboardingActive, setOnboardingActive] = useState(() => {
    return localStorage.getItem('onboardingComplete') === null
  })
  const [welcomeToast, setWelcomeToast] = useState(false)

  const handleOnboardingComplete = (settings) => {
    localStorage.setItem('onboardingComplete', 'true')
    
    const nextSettings = {
      ...userSettings,
      dailyGoalHours: settings.dailyGoalHours,
      defaultSessionMinutes: settings.defaultSessionMinutes,
      soundscape: settings.soundscape,
    }
    setUserSettings(nextSettings)
    localStorage.setItem('userSettings', JSON.stringify(nextSettings))

    // Apply daily focus goal setting
    const goalSecs = settings.dailyGoalHours * 3600
    const nextGoal = {
      preset: settings.dailyGoalHours === 1 ? '1hr' : settings.dailyGoalHours === 2 ? '2hr' : settings.dailyGoalHours === 4 ? '4hr' : 'custom',
      goalSeconds: goalSecs,
    }
    setDailyGoal(nextGoal)
    saveDailyGoal(nextGoal)

    // Apply default session duration
    const activeSecs = settings.defaultSessionMinutes * 60
    setDuration(activeSecs)
    setRemaining(activeSecs)

    // Close Onboarding
    setOnboardingActive(false)

    // Show neural link established welcome toast
    setWelcomeToast(true)
    setTimeout(() => setWelcomeToast(false), 4000)
  }

  const streakAlertShownRef = useRef(false)

  const userEndingRef = useRef(false)
  const enteringFocusLockRef = useRef(false)
  const exitingFocusLockRef = useRef(false)
  const focusLockActiveRef = useRef(false)
  const focusLockElRef = useRef(null)
  const sessionActiveRef = useRef(false)

  const activeTask = tasks.find((t) => t.id === activeTaskId)
  const streak = calcStreak(sessions)
  const todayFocusSeconds = useMemo(
    () => getTodayFocusSeconds(sessions),
    [sessions]
  )

  useEffect(() => {
    if (streakAlertShownRef.current) return
    const s = calcStreak(sessions)
    if (s >= 3 && !hasSessionToday(sessions)) {
      streakAlertShownRef.current = true
      setStreakAlert(s)
    }
  }, [sessions])

  sessionActiveRef.current = isRunning || isPaused
  focusLockActiveRef.current = focusLockActive

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const applyDuration = useCallback(
    (seconds, { adjustRemaining = false } = {}) => {
      const secs = clampDuration(seconds)
      if (adjustRemaining && (isRunning || isPaused)) {
        setRemaining(secs)
        setDuration(sessionElapsed + secs)
      } else if (!isRunning && !isPaused) {
        setDuration(secs)
        setRemaining(secs)
      }
    },
    [isRunning, isPaused, sessionElapsed]
  )

  const selectPreset = useCallback(
    (presetId) => {
      const preset = timerPrefs.presets.find((p) => p.id === presetId)
      if (!preset) return
      const secs = clampDuration(preset.minutes * 60)
      const next = { ...timerPrefs, activePresetId: presetId }
      setTimerPrefs(next)
      saveTimerPrefs(next)
      if (!isRunning && !isPaused) {
        setDuration(secs)
        setRemaining(secs)
      } else if (isPaused) {
        setRemaining(secs)
        setDuration(sessionElapsed + secs)
      }
    },
    [timerPrefs, isRunning, isPaused, sessionElapsed]
  )

  const handleSaveTimerPrefs = useCallback((prefs) => {
    setTimerPrefs(prefs)
    saveTimerPrefs(prefs)
    const active = prefs.presets.find((p) => p.id === prefs.activePresetId)
    if (active && !isRunning && !isPaused) {
      const secs = clampDuration(active.minutes * 60)
      setDuration(secs)
      setRemaining(secs)
    }
  }, [isRunning, isPaused])

  const addDistraction = useCallback((type, isAutoLogged = false) => {
    setDistractions((prev) => [
      ...prev,
      { id: generateId(), type, timestamp: Date.now(), isAutoLogged },
    ])
  }, [])

  const finishSession = useCallback(
    (completedFull = false) => {
      const task = tasks.find((t) => t.id === activeTaskId)
      const elapsed = sessionElapsed || duration - remaining
      const endedEarly = remaining > 0 && !(completedFull && remaining <= 0)
      const sessionDistractions = [...distractions]
      const focusScore = calculateFocusScore({
        elapsed: Math.max(elapsed, 0),
        plannedDuration: duration,
        distractions: sessionDistractions,
        endedEarly,
        completedFull: completedFull && remaining <= 0,
      })
      const prevBest = getPersonalBestScore(sessions)
      setPendingSession({
        taskId: activeTaskId,
        taskTitle: task?.title || 'Untitled',
        elapsed: Math.max(elapsed, 0),
        plannedDuration: duration,
        distractions: sessionDistractions,
        completedFull: completedFull && remaining <= 0,
        endedEarly,
        focusScore,
        isPersonalBest: focusScore > prevBest,
        mood: currentSessionMood, // store the logged mood
      })
      setIsRunning(false)
      setIsPaused(false)
      setFocusLockActive(false)
      
      // Auto-trigger breathing exercise overlay first
      setBreathingActive(true)

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    },
    [tasks, activeTaskId, sessionElapsed, duration, remaining, distractions, sessions, currentSessionMood]
  )

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    playChime()
    finishSession(true)
  }, [finishSession])

  // --- Daily Minutes localStorage Key Helper ---
  const getTodayFocusMinutesKey = () => {
    const todayStr = new Date().toLocaleDateString('sv') // 'YYYY-MM-DD'
    return `focusMinutes_${todayStr}`
  }

  const incrementDailyFocusMinutes = () => {
    const key = getTodayFocusMinutesKey()
    const current = parseInt(localStorage.getItem(key) || '0', 10)
    const next = current + 1
    localStorage.setItem(key, next.toString())
    return next
  }

  const triggerEyeRest = () => {
    wasRunningBeforeEyeRestRef.current = isRunning
    setIsRunning(false)
    setEyeRestActive(true)
    setEyeRestRemaining(20)
  }

  const skipEyeRest = () => {
    setEyeRestActive(false)
    if (wasRunningBeforeEyeRestRef.current) {
      setIsRunning(true)
    }
  }

  useInterval(
    () => {
      setRemaining((r) => {
        if (r <= 1) {
          handleTimerComplete()
          return 0
        }
        return r - 1
      })
      setSessionElapsed((e) => {
        const nextElapsed = e + 1
        
        // 1. Increment daily focus minutes every 60s
        if (nextElapsed % 60 === 0) {
          const nextMins = incrementDailyFocusMinutes()
          
          // Check Hydration Threshold triggers (once at threshold, then every 60m)
          if (!userSettings.dnd) {
            const thresh = userSettings.hydrationThreshold
            if (nextMins === thresh || (nextMins > thresh && (nextMins - thresh) % 60 === 0)) {
              setHydrationAlertActive(true)
              setHydrationSnoozed(false)
            }
          }
        }

        // 2. Eye Rest triggers every 20 minutes (1200 seconds)
        if (!userSettings.dnd && nextElapsed % 1200 === 0) {
          triggerEyeRest()
        }

        return nextElapsed
      })
    },
    isRunning && !isPaused ? 1000 : null
  )

  useInterval(
    () => {
      setFocusLockTick((t) => {
        const nextTick = t + 1
        
        // 3. Posture Reminder triggers every postureInterval minutes of Focus Lock
        if (!userSettings.dnd) {
          const intervalSecs = userSettings.postureInterval * 60
          if (nextTick > 0 && nextTick % intervalSecs === 0) {
            setPostureMessageIndex((prev) => prev + 1)
            setPostureAlertActive(true)
          }
        }

        return nextTick
      })
    },
    focusLockActive ? 1000 : null
  )

  // 4. Eye Rest active countdown tick
  useInterval(
    () => {
      setEyeRestRemaining((r) => {
        if (r <= 1) {
          setEyeRestActive(false)
          if (wasRunningBeforeEyeRestRef.current) {
            setIsRunning(true)
          }
          return 20
        }
        return r - 1
      })
    },
    eyeRestActive ? 1000 : null
  )

  // 5. Hydration snooze checker running in the background constantly
  useInterval(
    () => {
      if (hydrationSnoozed && hydrationNextTriggerTime && Date.now() >= hydrationNextTriggerTime) {
        setHydrationSnoozed(false)
        setHydrationAlertActive(true)
      }
    },
    1000
  )

  const focusLockElapsed =
    focusLockActive && focusLockStartedAt
      ? Math.floor((Date.now() - focusLockStartedAt) / 1000)
      : 0
  void focusLockTick

  const breachShownRef = useRef(false)

  const handleUnexpectedExit = useCallback(() => {
    if (userEndingRef.current || enteringFocusLockRef.current) return
    if (!sessionActiveRef.current && !focusLockActive) return
    if (breachShownRef.current) return
    breachShownRef.current = true
    setIsPaused(true)
    setIsRunning(false)
    addDistraction('EXIT', true)
    setShowBreachModal(true)
    
    // Safe buffer to let the browser restore layout before unmounting the overlay
    setTimeout(() => {
      setFocusLockActive(false)
    }, 150)

    setTimeout(() => {
      breachShownRef.current = false
    }, 1000)
  }, [addDistraction, focusLockActive])

  const exitFocusLock = useCallback((intentional = true) => {
    if (intentional) exitingFocusLockRef.current = true
    if (document.fullscreenElement) {
      document.exitFullscreen()
        .then(() => {
          setTimeout(() => {
            setFocusLockActive(false)
          }, 150)
        })
        .catch(() => {
          setTimeout(() => {
            setFocusLockActive(false)
          }, 150)
        })
    } else {
      setTimeout(() => {
        setFocusLockActive(false)
      }, 150)
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      if (enteringFocusLockRef.current) {
        if (document.fullscreenElement) {
          enteringFocusLockRef.current = false
        }
        return
      }
      if (exitingFocusLockRef.current) {
        if (!document.fullscreenElement) {
          exitingFocusLockRef.current = false
        }
        return
      }
      if (!document.fullscreenElement && focusLockActiveRef.current) {
        handleUnexpectedExit()
      }
    }

    const onVisibilityChange = () => {
      if (
        document.hidden &&
        sessionActiveRef.current &&
        focusLockActiveRef.current &&
        !document.fullscreenElement
      ) {
        handleUnexpectedExit()
      }
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && focusLockActiveRef.current) {
        exitFocusLock(true)
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleUnexpectedExit, exitFocusLock])

  const startSession = () => {
    if (!activeTaskId) {
      setShakeTasks(true)
      setTimeout(() => setShakeTasks(false), 600)
      return
    }
    // Intercept with Mood Modal before starting the session
    setMoodModalActive(true)
  }

  const handleMoodSelect = (mood) => {
    setMoodModalActive(false)
    setCurrentSessionMood(mood)
    proceedStartSession()
  }

  const handleMoodSkip = () => {
    setMoodModalActive(false)
    setCurrentSessionMood(null)
    proceedStartSession()
  }

  const handleBreathingFinish = () => {
    setBreathingActive(false)
    setShowSummaryModal(true)
  }

  const proceedStartSession = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === activeTaskId ? { ...t, status: 'ACTIVE' } : t
      )
    )
    setDistractions([])
    setSessionElapsed(0)
    setRemaining(duration)
    setIsRunning(true)
    setIsPaused(false)
  }

  const enterFocusLock = async () => {
    if (!isRunning && !isPaused) return
    setFocusLockStartedAt(Date.now())
    setFocusLockActive(true)

    await new Promise((resolve) => requestAnimationFrame(resolve))

    const el = focusLockElRef.current
    if (!el) return

    enteringFocusLockRef.current = true
    try {
      await el.requestFullscreen()
    } catch {
      enteringFocusLockRef.current = false
      setToast(
        'Fullscreen unavailable — focus mode is active without fullscreen'
      )
      setTimeout(() => setToast(''), 5000)
    }
  }

  const endSession = () => {
    userEndingRef.current = true
    setFocusLockActive(false)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    finishSession(remaining <= 0)
    setTimeout(() => {
      userEndingRef.current = false
    }, 500)
  }

  const saveSession = (note) => {
    if (!pendingSession) return
    const record = {
      id: generateId(),
      date: new Date().toISOString(),
      taskId: pendingSession.taskId,
      taskTitle: pendingSession.taskTitle,
      duration: pendingSession.elapsed,
      distractions: pendingSession.distractions,
      note: note || '',
      completedFullSession: pendingSession.completedFull,
      focusScore: pendingSession.focusScore,
      mood: pendingSession.mood, // Save session mood
    }
    const next = [record, ...sessions]
    setSessions(next)
    saveSessions(next)

    if (pendingSession.taskId) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== pendingSession.taskId) return t
          return {
            ...t,
            completedSessions: t.completedSessions + 1,
            status: 'DONE',
          }
        })
      )
    }

    setShowSummaryModal(false)
    setPendingSession(null)
    setDistractions([])
    setSessionElapsed(0)
    const active = timerPrefs.presets.find((p) => p.id === timerPrefs.activePresetId)
    const secs = clampDuration((active?.minutes || 25) * 60)
    setDuration(secs)
    setRemaining(secs)
  }

  const handleBreachLogResume = () => {
    if (breachReason) addDistraction(breachReason, false)
    setShowBreachModal(false)
    setIsPaused(true)
    setIsRunning(false)
  }

  const handleBreachEnd = () => {
    if (breachReason) addDistraction(breachReason, false)
    setShowBreachModal(false)
    endSession()
  }

  return (
    <div className="relative h-full flex flex-col" style={{ background: 'var(--bg-void)' }}>
      <Background />

      <FocusLockOverlay
        ref={focusLockElRef}
        active={focusLockActive}
        remaining={remaining}
        total={duration}
        taskTitle={activeTask?.title}
        focusLockElapsed={focusLockElapsed}
        onExit={() => exitFocusLock(true)}
      />
      <div className={`relative z-10 flex flex-col h-full pl-7 md:pl-8 transition-all duration-500 ${onboardingActive ? 'blur-[6px] pointer-events-none' : ''}`}>
        <TopBar
          streak={streak}
          dailyGoal={dailyGoal}
          onDailyGoalChange={(goal) => {
            setDailyGoal(goal)
            saveDailyGoal(goal)
          }}
          todayFocusSeconds={todayFocusSeconds}
        />

        <motion.div
          key={onboardingActive ? 'onboarding' : 'main'}
          className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column (Session Archive + Focus Map + Tasks) */}
          <div
            className={`${mobileLeft ? 'flex' : 'hidden'} md:flex flex-col h-[40vh] md:h-full shrink-0 md:w-[280px] border-r`}
            style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-surface)' }}
          >
            <SessionArchive sessions={sessions} />
            <FocusHeatmap sessions={sessions} />
            <div className="flex-1 min-h-0">
              <TaskNexus
                tasks={tasks}
                setTasks={setTasks}
                activeTaskId={activeTaskId}
                setActiveTaskId={setActiveTaskId}
                filter={taskFilter}
                setFilter={setTaskFilter}
                shake={shakeTasks}
                collapsed={false}
              />
            </div>
          </div>

          {/* Center Column (Timer Core) */}
          <FocusCore
            remaining={remaining}
            total={duration}
            taskTitle={activeTask?.title}
            timerState={{ isRunning, isPaused }}
            timerPrefs={timerPrefs}
            sessionElapsed={sessionElapsed}
            onApplyDuration={applyDuration}
            onSelectPreset={selectPreset}
            onSaveTimerPrefs={handleSaveTimerPrefs}
            onStart={startSession}
            onPause={() => {
              setIsPaused(true)
              setIsRunning(false)
            }}
            onResume={() => {
              setIsPaused(false)
              setIsRunning(true)
            }}
            onEnd={endSession}
            onEnterFocusLock={enterFocusLock}
            distractions={distractions}
            streak={streak}
            userSettings={userSettings}
            onSaveUserSettings={setUserSettings}
            eyeRestActive={eyeRestActive}
            eyeRestRemaining={eyeRestRemaining}
            onSkipEyeRest={skipEyeRest}
          />

          {/* Right Column (Log) */}
          <div
            className={`${mobileRight ? 'flex' : 'hidden'} md:flex flex-col h-[40vh] md:h-full shrink-0 md:w-[280px] border-l`}
            style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-surface)' }}
          >
            <div className="flex-1 min-h-0">
              <SignalLog
                distractions={distractions}
                onLog={(type) => addDistraction(type, false)}
                sessionActive={isRunning || isPaused}
                collapsed={false}
              />
            </div>
          </div>
        </motion.div>

        <div className="md:hidden flex border-t shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
              <button
                type="button"
                onClick={() => {
                  setMobileLeft(!mobileLeft)
                  setMobileRight(false)
                }}
                className="flex-1 py-2 font-orbitron text-[10px]"
                style={{
                  color: mobileLeft ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  background: mobileLeft ? 'var(--bg-elevated)' : 'transparent',
                }}
              >
                TASKS
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileLeft(false)
                  setMobileRight(false)
                }}
                className="flex-1 py-2 font-orbitron text-[10px]"
                style={{ color: 'var(--neon-cyan)' }}
              >
                FOCUS
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileRight(!mobileRight)
                  setMobileLeft(false)
                }}
                className="flex-1 py-2 font-orbitron text-[10px]"
                style={{
                  color: mobileRight ? 'var(--neon-violet)' : 'var(--text-muted)',
                  background: mobileRight ? 'var(--bg-elevated)' : 'transparent',
                }}
              >
                LOG
              </button>
            </div>
      </div>

      <BreachModal
        open={showBreachModal}
        focusElapsed={sessionElapsed}
        breachReason={breachReason}
        setBreachReason={setBreachReason}
        onLogResume={handleBreachLogResume}
        onEndSession={handleBreachEnd}
      />

      <SummaryModal
        open={showSummaryModal}
        sessionData={pendingSession}
        onSave={saveSession}
        onClose={() => {
          setShowSummaryModal(false)
          setPendingSession(null)
        }}
      />

      <Toast message={toast} onClose={() => setToast('')} />

      {/* --- Wellness Components & Modals Mounts --- */}
      <MoodCheckIn
        open={moodModalActive}
        onSelect={handleMoodSelect}
        onSkip={handleMoodSkip}
      />

      <BreathingExercise
        open={breathingActive}
        onFinish={handleBreathingFinish}
      />

      <PostureReminder
        open={postureAlertActive}
        onClose={() => setPostureAlertActive(false)}
        messageIndex={postureMessageIndex}
      />

      <HydrationReminder
        open={hydrationAlertActive}
        focusMinutes={parseInt(localStorage.getItem(getTodayFocusMinutesKey()) || '0', 10)}
        onDone={() => setHydrationAlertActive(false)}
        onSnooze={() => {
          setHydrationAlertActive(false)
          setHydrationSnoozed(true)
          setHydrationNextTriggerTime(Date.now() + 10 * 60 * 1000) // 10 minutes snooze
        }}
      />

      <OnboardingOverlay
        open={onboardingActive}
        onComplete={handleOnboardingComplete}
      />

      <AnimatePresence>
        {welcomeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[210] max-w-sm cursor-pointer"
            onClick={() => setWelcomeToast(false)}
          >
            <div
              className="glass-card px-4 py-3 font-dm text-xs font-semibold"
              style={{
                background: 'rgba(9, 12, 20, 0.95)',
                borderLeft: '4px solid var(--neon-cyan)',
                boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
              }}
            >
              ⚡ Neural link established. Welcome to your focus command center.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {streakAlert != null && (
          <StreakAlert
            streak={streakAlert}
            onDismiss={() => setStreakAlert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
