import { useEffect, useState } from 'react'
import type { RandomEvent } from '../types'

interface Props {
  event: RandomEvent
  onDone: () => void
}

export default function RandomEventOverlay({ event, onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 4000)
    const t3 = setTimeout(() => onDone(), 4500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  const visible = phase !== 'out'

  return (
    <div
      onClick={() => { setPhase('out'); setTimeout(onDone, 500) }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(2,4,16,0.88)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'opacity 0.4s ease',
        opacity: phase === 'in' ? 0 : phase === 'hold' ? 1 : 0,
        cursor: 'pointer',
      }}
    >
      {/* Glow rings */}
      <div style={{
        position: 'absolute',
        width: 260, height: 260,
        border: '1px solid rgba(240,192,64,0.3)',
        borderRadius: '50%',
        boxShadow: '0 0 40px rgba(240,192,64,0.15)',
        transition: 'transform 0.6s ease, opacity 0.4s ease',
        transform: visible ? 'scale(1)' : 'scale(1.2)',
        opacity: visible ? 1 : 0,
      }}/>
      <div style={{
        position: 'absolute',
        width: 200, height: 200,
        border: '1px solid rgba(240,192,64,0.15)',
        borderRadius: '50%',
      }}/>

      {/* Card */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        padding: '28px 36px',
        background: 'rgba(6,12,40,0.95)',
        border: '1px solid rgba(240,192,64,0.4)',
        boxShadow: '0 0 40px rgba(240,192,64,0.1), inset 0 0 40px rgba(240,192,64,0.04)',
        maxWidth: 320,
        transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: visible ? 1 : 0,
        zIndex: 1,
      }}>
        {/* System label */}
        <div style={{
          fontSize: 8, letterSpacing: '0.45em',
          color: 'rgba(240,192,64,0.5)',
          fontFamily: 'Rajdhani, sans-serif',
          textTransform: 'uppercase',
        }}>
          ◆ EVENTO DO SISTEMA ◆
        </div>

        {/* Icon */}
        <div style={{ fontSize: 52, lineHeight: 1 }}>{event.icon}</div>

        {/* Name */}
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 20, fontWeight: 900,
          color: 'var(--gold)',
          textShadow: '0 0 20px rgba(240,192,64,0.6)',
          letterSpacing: '0.06em',
          textAlign: 'center',
        }}>
          {event.name}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 13, color: 'var(--text-secondary)',
          letterSpacing: '0.03em', textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {event.description}
        </div>

        {/* Rewards */}
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          {event.xpBonus > 0 && (
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 18, fontWeight: 700,
              color: '#50e890',
              textShadow: '0 0 12px rgba(80,232,144,0.6)',
            }}>
              +{event.xpBonus} XP
            </div>
          )}
          {event.goldBonus > 0 && (
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 18, fontWeight: 700,
              color: 'var(--gold)',
              textShadow: '0 0 12px rgba(240,192,64,0.6)',
            }}>
              +{event.goldBonus}G
            </div>
          )}
        </div>

        <div style={{
          fontSize: 9, color: 'var(--text-muted)',
          fontFamily: 'Rajdhani', letterSpacing: '0.15em',
          marginTop: 4,
        }}>
          toque para fechar
        </div>
      </div>
    </div>
  )
}
