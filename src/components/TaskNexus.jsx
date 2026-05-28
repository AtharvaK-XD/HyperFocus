import { useState } from 'react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import { Plus, GripVertical, X } from 'lucide-react'

const FILTERS = ['ALL', 'QUEUE', 'ACTIVE', 'DONE']

const panelVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function TaskNexus({
  tasks,
  setTasks,
  activeTaskId,
  setActiveTaskId,
  filter,
  setFilter,
  shake,
  collapsed,
  onExpand,
}) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sessions, setSessions] = useState(1)

  const filtered =
    filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter)

  const addTask = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      estimatedSessions: Math.max(1, Number(sessions) || 1),
      completedSessions: 0,
      status: 'QUEUE',
      createdAt: Date.now(),
    }
    setTasks([task, ...tasks])
    setTitle('')
    setDescription('')
    setSessions(1)
    setShowForm(false)
  }

  const deleteTask = (id, e) => {
    e.stopPropagation()
    setTasks(tasks.filter((t) => t.id !== id))
    if (activeTaskId === id) setActiveTaskId(null)
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 glass-card px-2 py-4 rounded-r-lg"
        style={{ borderLeft: '2px solid var(--neon-cyan)' }}
        aria-label="Open Task Nexus"
      >
        <span className="font-orbitron text-[10px] writing-mode-vertical text-[var(--neon-cyan)]">
          TASKS
        </span>
      </button>
    )
  }

  return (
    <motion.aside
      variants={panelVariants}
      className={`flex flex-col h-full w-full md:w-[280px] shrink-0 glass-card p-4 ${shake ? 'shake' : ''}`}
      style={{ background: 'var(--bg-surface)' }}
    >
      <header className="mb-4">
        <h2
          className="font-orbitron text-xs tracking-[0.3em] neon-flicker"
          style={{ color: 'var(--neon-cyan)' }}
        >
          TASK NEXUS
        </h2>
      </header>

      <div className="flex gap-1 mb-3 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="font-dm text-[10px] px-2 py-1 rounded border transition-all duration-300"
            style={{
              borderColor: filter === f ? 'var(--neon-cyan)' : 'var(--glass-border)',
              color: filter === f ? 'var(--neon-cyan)' : 'var(--text-muted)',
              boxShadow: filter === f ? '0 0 12px rgba(0,245,212,0.25)' : 'none',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="font-dm text-xs w-full py-2 mb-3 rounded-lg border flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
        style={{
          borderColor: 'var(--neon-cyan)',
          color: 'var(--neon-cyan)',
          boxShadow: '0 0 12px rgba(0,245,212,0.15)',
        }}
      >
        <Plus size={14} /> ADD TASK
      </motion.button>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={addTask}
            className="mb-3 space-y-2 overflow-hidden"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2 rounded-lg text-xs font-dm bg-[var(--bg-elevated)] border border-[var(--glass-border)] focus:border-[var(--neon-cyan)]"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-xs font-dm bg-[var(--bg-elevated)] border border-[var(--glass-border)] resize-none"
            />
            <div className="flex items-center gap-2">
              <label className="font-dm text-[10px] text-[var(--text-muted)]">
                Est. sessions
              </label>
              <input
                type="number"
                min={1}
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                className="w-16 px-2 py-1 rounded text-xs bg-[var(--bg-elevated)] border border-[var(--glass-border)]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-orbitron text-xs"
              style={{
                background: 'linear-gradient(135deg, var(--neon-cyan), #00c4a7)',
                color: 'var(--bg-void)',
              }}
            >
              INITIALIZE
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
        {filtered.length === 0 ? (
          <div className="empty-dash p-8 text-center">
            <p className="font-dm text-xs text-[var(--text-muted)]">
              Initialize first task
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={filtered}
            onReorder={(newOrder) => {
              const ids = new Set(newOrder.map((t) => t.id))
              const rest = tasks.filter((t) => !ids.has(t.id))
              setTasks([...newOrder, ...rest])
            }}
            className="space-y-2"
          >
            <AnimatePresence initial={false}>
              {filtered.map((task) => (
                <Reorder.Item
                  key={task.id}
                  value={task}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTaskId(task.id)}
                  className="glass-card p-3 cursor-pointer transition-shadow"
                  style={{
                    borderLeft:
                      activeTaskId === task.id
                        ? '3px solid var(--neon-cyan)'
                        : '3px solid transparent',
                    boxShadow:
                      activeTaskId === task.id
                        ? '0 0 20px rgba(0,245,212,0.2)'
                        : 'none',
                  }}
                >
                  <div className="flex gap-2">
                    <GripVertical
                      size={14}
                      className="shrink-0 mt-0.5 text-[var(--text-muted)] cursor-grab active:cursor-grabbing"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-1">
                        <h3 className="font-dm text-sm truncate">{task.title}</h3>
                        <button
                          type="button"
                          onClick={(e) => deleteTask(task.id, e)}
                          className="text-[var(--text-muted)] hover:text-[var(--neon-rose)]"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      {task.description && (
                        <p className="font-dm text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <StatusPill status={task.status} />
                        <span className="font-space text-[9px] text-[var(--text-muted)]">
                          {task.completedSessions}/{task.estimatedSessions} sessions
                        </span>
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </motion.aside>
  )
}

function StatusPill({ status }) {
  const classes = {
    QUEUE: 'pill-queue',
    ACTIVE: 'pill-active',
    DONE: 'pill-done',
  }
  return (
    <span
      className={`font-space text-[9px] px-2 py-0.5 rounded-full border transition-colors duration-300 ${classes[status] || classes.QUEUE}`}
    >
      {status}
    </span>
  )
}
