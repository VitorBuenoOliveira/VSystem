import { useEffect, useState } from 'react'
import { playNotificationSound } from '../../hooks/useSounds'

export interface ToastData {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'honor'
}

interface ToastProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

const TYPE_STYLES: Record<ToastData['type'], { border: string; color: string; glow: string; bg: string }> = {
  success: { border: 'rgba(64,224,128,0.6)', color: '#50e890', glow: 'rgba(64,224,128,0.3)', bg: 'rgba(4,40,20,0.95)' },
  error:   { border: 'rgba(220,64,64,0.6)',  color: '#e05050', glow: 'rgba(220,64,64,0.3)',  bg: 'rgba(40,4,4,0.95)'  },
  info:    { border: 'rgba(58,143,255,0.6)', color: '#7dc8ff', glow: 'rgba(58,143,255,0.3)', bg: 'rgba(2,8,28,0.97)'  },
  honor:   { border: 'rgba(240,192,64,0.7)', color: '#f0d060', glow: 'rgba(240,192,64,0.4)', bg: 'rgba(30,20,2,0.97)' },
}

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div style={{
      position: 'fixed', top: 16,
      left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998,
      display: 'flex', flexDirection: 'column', gap: 8,
      width: 320,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    playNotificationSound()
    requestAnimationFrame(() => setVisible(true))
    const t1 = setTimeout(() => setVisible(false), 2800)
    const t2 = setTimeout(() => onRemove(toast.id), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [toast.id, onRemove])

  const s = TYPE_STYLES[toast.type]

  return (
    <div style={{
      padding: '10px 14px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderLeft: `2px solid ${s.color}`,
      boxShadow: `0 0 16px ${s.glow}, 0 4px 20px rgba(0,0,0,0.5)`,
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: 13, fontWeight: 600,
      letterSpacing: '0.04em',
      color: s.color,
      textShadow: `0 0 8px ${s.glow}`,
      pointerEvents: 'auto',
      transform: visible ? 'translateY(0)' : 'translateY(-10px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s ease',
    }}>
      {toast.message}
    </div>
  )
}

let _addToast: ((t: Omit<ToastData, 'id'>) => void) | null = null
export function registerToastHandler(fn: (t: Omit<ToastData, 'id'>) => void) { _addToast = fn }
export function toast(message: string, type: ToastData['type'] = 'info') { _addToast?.({ message, type }) }
