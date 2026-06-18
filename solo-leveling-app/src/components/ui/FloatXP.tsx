import { useEffect, useState } from 'react'

interface FloatXPProps {
  amount: number
  positive?: boolean
  onDone: () => void
}

export default function FloatXP({ amount, positive = true, onDone }: FloatXPProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 800)
    const t2 = setTimeout(onDone, 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      className="xp-float"
      style={{
        position: 'fixed',
        top: '38%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 18,
        fontWeight: 700,
        color: positive ? '#50e890' : '#e04040',
        textShadow: positive
          ? '0 0 10px #40e080, 0 0 24px rgba(64,224,128,0.4)'
          : '0 0 10px #e04040, 0 0 24px rgba(224,64,64,0.4)',
      }}
    >
      {positive ? '+' : ''}{amount} XP
    </div>
  )
}
