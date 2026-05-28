import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  MessageSquare,
  Globe,
  Volume2,
  Brain,
  Zap,
} from 'lucide-react'
import { DISTRACTION_TYPES, relativeTime, absoluteTime } from '../utils/helpers'

const QUICK_LOG = [
  { type: 'PHONE', Icon: Phone },
  { type: 'CHAT', Icon: MessageSquare },
  { type: 'NEW_TAB', Icon: Globe },
  { type: 'NOISE', Icon: Volume2 },
  { type: 'THOUGHTS', Icon: Brain },
  { type: 'OTHER', Icon: Zap },
]

const panelVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function SignalLog({
  distractions,
  onLog,
  sessionActive,
  collapsed,
  onExpand,
}) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40 glass-card px-2 py-4 rounded-l-lg"
        style={{ borderRight: '2px solid var(--neon-violet)' }}
        aria-label="Open Signal Log"
      >
        <span className="font-orbitron text-[10px] writing-mode-vertical text-[var(--neon-violet)]">
          LOG
        </span>
      </button>
    )
  }

  const sorted = [...distractions].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <motion.aside
      variants={panelVariants}
      className="flex flex-col h-full w-full md:w-[320px] shrink-0 glass-card p-4"
      style={{ background: 'var(--bg-surface)' }}
    >
      <header className="mb-4">
        <h2
          className="font-orbitron text-xs tracking-[0.3em]"
          style={{ color: 'var(--neon-violet)' }}
        >
          SIGNAL LOG
        </h2>
      </header>

      <p className="font-dm text-[10px] text-[var(--text-muted)] mb-2 tracking-wider">
        LOG INTERFERENCE
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {QUICK_LOG.map(({ type, Icon }) => {
          const meta = DISTRACTION_TYPES[type]
          return (
            <motion.button
              key={type}
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{
                boxShadow: '0 0 16px rgba(255,184,0,0.35)',
              }}
              disabled={!sessionActive}
              onClick={() => onLog(type)}
              className="glass-card flex flex-col items-center gap-1 p-2 rounded-lg disabled:opacity-40 transition-all"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <Icon size={18} style={{ color: 'var(--neon-amber)' }} />
              <span className="font-dm text-[8px] text-[var(--text-muted)]">
                {meta.label.toUpperCase()}
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
        {sorted.length === 0 ? (
          <p className="font-dm text-xs text-center text-[var(--text-muted)] py-8">
            No interference logged
          </p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {sorted.map((d) => {
                const meta = DISTRACTION_TYPES[d.type] || DISTRACTION_TYPES.OTHER
                const isExit = d.type === 'EXIT'
                return (
                  <motion.li
                    key={d.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="glass-card px-3 py-2 flex items-center gap-3"
                    style={{
                      borderLeft: isExit
                        ? '3px solid var(--neon-rose)'
                        : '3px solid var(--neon-amber)',
                      background: isExit
                        ? 'rgba(255,45,107,0.08)'
                        : 'var(--bg-elevated)',
                    }}
                  >
                    <span className="text-lg">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-dm text-xs"
                        style={{ color: isExit ? 'var(--neon-rose)' : 'var(--text-primary)' }}
                      >
                        {meta.label}
                        {d.isAutoLogged && (
                          <span className="font-space text-[9px] ml-1 opacity-70">
                            (auto)
                          </span>
                        )}
                      </p>
                      <Timestamp ts={d.timestamp} />
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </motion.aside>
  )
}

function Timestamp({ ts }) {
  return (
    <span
      className="font-space text-[9px] text-[var(--text-muted)] cursor-default"
      title={absoluteTime(ts)}
    >
      {relativeTime(ts)}
    </span>
  )
}
