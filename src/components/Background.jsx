import { useMemo } from 'react'

const HEX_CHARS = '0123456789ABCDEF'

function randomHex(len) {
  let s = ''
  for (let i = 0; i < len; i++) {
    s += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]
  }
  return s
}

export default function Background() {
  const particles = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        dur: `${6 + Math.random() * 10}s`,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    []
  )

  const streamText = useMemo(() => {
    const lines = []
    for (let i = 0; i < 40; i++) {
      lines.push(randomHex(8) + ' ' + randomHex(4))
    }
    return lines.join(' · ')
  }, [])

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob" />
      </div>
      <div className="scanlines" />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden
      >
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              '--delay': p.delay,
              '--dur': p.dur,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>
      <div className="data-stream" aria-hidden>
        <div className="data-stream-inner">
          {streamText}
          {streamText}
        </div>
      </div>
    </>
  )
}
