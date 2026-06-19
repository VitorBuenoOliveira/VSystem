import { useEffect, useState } from 'react'
import type { BonusMission } from '../types'
import { playNotificationSound } from '../hooks/useSounds'
import { CAT_COLORS as CAT_COLOR } from '../data/categoryColors'

interface Props {
  mission: BonusMission
  onAccept: () => void
  onDismiss: () => void
}

export default function BonusMissionOverlay({ mission, onAccept, onDismiss }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const color = CAT_COLOR[mission.category] ?? '#3a8fff'

  useEffect(() => {
    playNotificationSound(0.7)
    const t = setTimeout(() => setPhase('hold'), 300)
    return () => clearTimeout(t)
  }, [])

  const handleAccept = () => {
    setPhase('out')
    setTimeout(onAccept, 400)
  }

  const handleDismiss = () => {
    setPhase('out')
    setTimeout(onDismiss, 400)
  }

  const visible = phase === 'hold'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 210,
        background: 'rgba(2,4,16,0.92)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        opacity: phase === 'in' ? 0 : phase === 'hold' ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Rings */}
      <div style={{
        position: 'absolute',
        width: 280, height: 280,
        border: `1px solid ${color}44`,
        borderRadius: '50%',
        boxShadow: `0 0 60px ${color}22`,
        transform: visible ? 'scale(1)' : 'scale(1.15)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s ease, opacity 0.3s ease',
      }}/>
      <div style={{
        position: 'absolute',
        width: 210, height: 210,
        border: `1px solid ${color}22`,
        borderRadius: '50%',
      }}/>

      {/* Card */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        padding: '28px 32px',
        background: 'rgba(4,8,32,0.97)',
        border: `1px solid ${color}55`,
        borderTop: `2px solid ${color}`,
        boxShadow: `0 0 40px ${color}18, inset 0 0 40px ${color}08`,
        maxWidth: 320, width: '88%',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.94)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          fontSize: 8, letterSpacing: '0.45em',
          color: `${color}bb`,
          fontFamily: 'Rajdhani, sans-serif',
          textTransform: 'uppercase',
        }}>
          ⚡ QUEST SURPRESA ⚡
        </div>

        {/* Icon */}
        <div style={{ fontSize: 54, lineHeight: 1 }}>{mission.icon}</div>

        {/* Name */}
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 20, fontWeight: 900,
          color,
          textShadow: `0 0 20px ${color}88`,
          letterSpacing: '0.06em',
          textAlign: 'center',
        }}>
          {mission.name}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 13, color: 'var(--text-secondary)',
          letterSpacing: '0.03em', textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {mission.description}
        </div>

        {/* Task */}
        <div style={{
          width: '100%',
          padding: '10px 14px',
          background: `${color}12`,
          border: `1px solid ${color}33`,
          borderRadius: 4,
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 13, fontWeight: 700,
          color: '#e0eaff',
          textAlign: 'center',
          letterSpacing: '0.03em',
          lineHeight: 1.5,
        }}>
          {mission.task}
        </div>

        {/* Rewards */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 16, fontWeight: 700,
            color: '#50e890',
            textShadow: '0 0 10px rgba(80,232,144,0.5)',
          }}>
            +{mission.xpReward} XP
          </div>
          {mission.goldReward > 0 && (
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 16, fontWeight: 700,
              color: 'var(--gold)',
              textShadow: '0 0 10px rgba(240,192,64,0.5)',
            }}>
              +{mission.goldReward}G
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
          <button
            onClick={handleAccept}
            style={{
              flex: 2,
              padding: '10px 0',
              background: `${color}22`,
              border: `1px solid ${color}88`,
              borderRadius: 4,
              color,
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 13, fontWeight: 900,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              textShadow: `0 0 8px ${color}66`,
              boxShadow: `0 0 12px ${color}22`,
              transition: 'background 0.2s',
            }}
          >
            ⚡ ACEITAR
          </button>
          <button
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 4,
              color: 'rgba(180,200,220,0.5)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            IGNORAR
          </button>
        </div>

        <div style={{
          fontSize: 9, color: 'var(--text-muted)',
          fontFamily: 'Rajdhani', letterSpacing: '0.12em',
        }}>
          expira ao virar o dia
        </div>
      </div>
    </div>
  )
}
