export const DISTRACTION_TYPES = {
  PHONE: { label: 'Phone', icon: '📱', key: 'PHONE' },
  CHAT: { label: 'Chat', icon: '💬', key: 'CHAT' },
  NEW_TAB: { label: 'New Tab', icon: '🌐', key: 'NEW_TAB' },
  NOISE: { label: 'Noise', icon: '🔊', key: 'NOISE' },
  THOUGHTS: { label: 'Thoughts', icon: '💭', key: 'THOUGHTS' },
  OTHER: { label: 'Other', icon: '⚡', key: 'OTHER' },
  EXIT: { label: 'Focus Exit', icon: '🚪', key: 'EXIT' },
}

export const BREACH_REASONS = ['PHONE', 'CHAT', 'NEW_TAB', 'NOISE', 'THOUGHTS', 'OTHER']

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function relativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const days = Math.floor(hr / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export function absoluteTime(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 440
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1)
  } catch {
    /* audio unavailable */
  }
}

export function loadSessions() {
  try {
    const raw = localStorage.getItem('fsb-sessions')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSessions(sessions) {
  localStorage.setItem('fsb-sessions', JSON.stringify(sessions))
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem('fsb-tasks')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  localStorage.setItem('fsb-tasks', JSON.stringify(tasks))
}

export const DEFAULT_TIMER_PREFS = {
  presets: [
    { id: 'p1', label: '25 MIN', minutes: 25 },
    { id: 'p2', label: '50 MIN', minutes: 50 },
    { id: 'p3', label: '90 MIN', minutes: 90 },
  ],
  activePresetId: 'p1',
}

export const MIN_TIMER_SECONDS = 60
export const MAX_TIMER_SECONDS = 4 * 60 * 60

export function clampDuration(seconds) {
  return Math.min(MAX_TIMER_SECONDS, Math.max(MIN_TIMER_SECONDS, Math.floor(seconds)))
}

export function splitSeconds(totalSeconds) {
  const s = clampDuration(totalSeconds)
  return { minutes: Math.floor(s / 60), seconds: s % 60 }
}

export function combineMinSec(minutes, seconds) {
  return clampDuration((Number(minutes) || 0) * 60 + (Number(seconds) || 0))
}

export function loadTimerPrefs() {
  try {
    const raw = localStorage.getItem('fsb-timer-prefs')
    if (!raw) return { ...DEFAULT_TIMER_PREFS, presets: [...DEFAULT_TIMER_PREFS.presets] }
    const parsed = JSON.parse(raw)
    return {
      presets: parsed.presets?.length
        ? parsed.presets
        : [...DEFAULT_TIMER_PREFS.presets],
      activePresetId: parsed.activePresetId || DEFAULT_TIMER_PREFS.activePresetId,
    }
  } catch {
    return { ...DEFAULT_TIMER_PREFS, presets: [...DEFAULT_TIMER_PREFS.presets] }
  }
}

export function saveTimerPrefs(prefs) {
  localStorage.setItem('fsb-timer-prefs', JSON.stringify(prefs))
}

export function calcStreak(sessions) {
  if (!sessions.length) return 0
  const days = new Set(
    sessions.map((s) => new Date(s.date).toDateString())
  )
  let streak = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (days.has(d.toDateString())) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function getWeekSessions(sessions) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return sessions.filter((s) => new Date(s.date) >= weekStart)
}

export function getMonthSessions(sessions) {
  const now = new Date()
  return sessions.filter((s) => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
}

export function toDayKey(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function isToday(date) {
  return toDayKey(date) === toDayKey(new Date())
}

export function hasSessionToday(sessions) {
  return sessions.some((s) => isToday(s.date))
}

export function getTodayFocusSeconds(sessions) {
  const key = toDayKey(new Date())
  return sessions
    .filter((s) => toDayKey(s.date) === key)
    .reduce((acc, s) => acc + (s.duration || 0), 0)
}

export function calculateFocusScore({
  elapsed,
  plannedDuration,
  distractions = [],
  endedEarly,
  completedFull,
}) {
  const planned = Math.max(1, plannedDuration || elapsed || 1)
  const completionRatio = Math.min(1, (elapsed || 0) / planned)
  let score = completionRatio * 60

  const exitCount = distractions.filter((d) => d.type === 'EXIT').length
  const distCount = distractions.length - exitCount

  score -= distCount * 8
  score -= exitCount * 12

  if (distractions.length === 0) score += 10
  if (completedFull || (!endedEarly && completionRatio >= 0.99)) score += 10

  return Math.round(Math.max(0, Math.min(100, score)))
}

export function getScoreTier(score) {
  if (score >= 80) return { color: 'var(--neon-cyan)', label: 'ELITE' }
  if (score >= 50) return { color: 'var(--neon-amber)', label: 'SOLID' }
  return { color: 'var(--neon-rose)', label: 'FRAGILE' }
}

export function getPersonalBestScore(sessions) {
  return sessions.reduce((best, s) => Math.max(best, s.focusScore ?? 0), 0)
}

export function buildHeatmapDays(sessions, numDays = 90) {
  const byDay = {}
  sessions.forEach((s) => {
    const key = toDayKey(s.date)
    if (!byDay[key]) byDay[key] = { minutes: 0, sessions: 0 }
    byDay[key].minutes += (s.duration || 0) / 60
    byDay[key].sessions += 1
  })

  const days = []
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const key = toDayKey(d)
    const data = byDay[key] || { minutes: 0, sessions: 0 }
    days.push({ date: d, key, ...data })
  }
  return days
}

export function heatmapCellStyle(minutes) {
  if (minutes <= 0) {
    return {
      background: 'var(--glass-border)',
      boxShadow: 'none',
    }
  }
  if (minutes <= 30) {
    return {
      background: 'rgba(0, 245, 212, 0.25)',
      boxShadow: 'none',
    }
  }
  if (minutes <= 60) {
    return {
      background: 'rgba(0, 245, 212, 0.55)',
      boxShadow: 'none',
    }
  }
  if (minutes <= 120) {
    return {
      background: 'rgba(0, 245, 212, 0.8)',
      boxShadow: 'none',
    }
  }
  return {
    background: 'var(--neon-cyan)',
    boxShadow: '0 0 8px rgba(0, 245, 212, 0.5)',
  }
}

export function formatHeatmapTooltip(date, minutes, sessionCount) {
  const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  const time =
    h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${Math.round(minutes)}m`
  return `${label} — ${time} focused, ${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
}

export const DEFAULT_DAILY_GOAL = {
  preset: '1h',
  goalSeconds: 3600,
}

export function loadDailyGoal() {
  try {
    const raw = localStorage.getItem('fsb-daily-goal')
    return raw ? { ...DEFAULT_DAILY_GOAL, ...JSON.parse(raw) } : { ...DEFAULT_DAILY_GOAL }
  } catch {
    return { ...DEFAULT_DAILY_GOAL }
  }
}

export function saveDailyGoal(goal) {
  localStorage.setItem('fsb-daily-goal', JSON.stringify(goal))
}

export const GOAL_PRESETS = [
  { id: '1h', label: '1H', seconds: 3600 },
  { id: '2h', label: '2H', seconds: 7200 },
  { id: '4h', label: '4H', seconds: 14400 },
  { id: 'custom', label: 'CUSTOM', seconds: null },
]

