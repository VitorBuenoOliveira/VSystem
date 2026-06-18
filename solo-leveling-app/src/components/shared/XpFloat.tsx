import { useEffect, useState } from 'react'

interface XpFloatProps {
  amount: number
  positive?: boolean
  onDone: () => void
}

export function XpFloat({ amount, positive = true, onDone }: XpFloatProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 400) }, 1200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className={`fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50 font-orbitron font-bold text-xl transition-all duration-1200 ${
        visible ? 'opacity-100 -translate-y-0' : 'opacity-0 -translate-y-16'
      } ${positive ? 'text-green-400' : 'text-red-400'}`}
    >
      {positive ? '+' : ''}{amount} XP
    </div>
  )
}
