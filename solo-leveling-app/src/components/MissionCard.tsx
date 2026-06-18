import type { Mission } from '../types'

interface Props {
  mission: Mission
  done: boolean
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  onXP?: (amount: number, positive: boolean) => void
  effortActive?: boolean
  onEffort?: (id: string) => void
}

const BORDER_BY_TYPE: Record<string, string> = {
  principal:  'rgba(220,80,80,0.7)',
  secundaria: 'rgba(60,140,255,0.6)',
  bonus:      'rgba(200,160,40,0.7)',
}

const BG_BY_TYPE: Record<string, string> = {
  principal:  'rgba(60,10,10,0.15)',
  secundaria: 'rgba(4,16,52,0.85)',
  bonus:      'rgba(40,28,4,0.15)',
}

export default function MissionCard({ mission, done, onToggle, onDelete, onXP, effortActive, onEffort }: Props) {
  const borderColor = done ? 'rgba(64,224,128,0.5)' : BORDER_BY_TYPE[mission.type]
  const effortBonus = Math.round(mission.xpReward * 0.5)

  const handleClick = () => {
    const wasCompleted = done
    onToggle(mission.id)
    if (!wasCompleted && onXP) onXP(mission.xpReward, true)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: done ? 'rgba(10,40,20,0.3)' : BG_BY_TYPE[mission.type],
        border: `1px solid ${borderColor}`,
        borderLeft: `2px solid ${borderColor}`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        opacity: done ? 0.65 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!done) {
          const el = e.currentTarget
          el.style.borderColor = done ? 'rgba(64,224,128,0.8)' : BORDER_BY_TYPE[mission.type].replace('0.7','1').replace('0.6','0.9')
          el.style.background = done ? '' : BG_BY_TYPE[mission.type].replace('0.85','0.95').replace('0.15','0.25')
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = borderColor
        el.style.background = done ? 'rgba(10,40,20,0.3)' : BG_BY_TYPE[mission.type]
      }}
    >
      {/* Mission icon */}
      <span style={{ fontSize: 20, width: 26, textAlign: 'center', flexShrink: 0 }}>
        {mission.icon}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'Rajdhani, sans-serif',
          color: done ? 'rgba(100,160,255,0.5)' : 'var(--text-primary)',
          textDecoration: done ? 'line-through' : 'none',
          lineHeight: 1.3,
          letterSpacing: '0.02em',
        }}>
          {mission.name}
        </p>
        {mission.estimatedMinutes > 0 && (
          <p style={{
            margin: '2px 0 0',
            fontSize: 10,
            fontFamily: "'Share Tech Mono', monospace",
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}>
            {mission.estimatedMinutes}min
          </p>
        )}

        {/* Esforço extra — opcional, só quando concluída */}
        {done && onEffort && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onEffort(mission.id) }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onEffort(mission.id) }
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginTop: 5, padding: '2px 8px',
              borderRadius: 3,
              border: `1px solid ${effortActive ? 'rgba(240,192,64,0.7)' : 'rgba(240,192,64,0.3)'}`,
              background: effortActive ? 'rgba(240,192,64,0.15)' : 'transparent',
              color: effortActive ? 'var(--gold)' : 'rgba(240,192,64,0.55)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              cursor: 'pointer',
              textShadow: effortActive ? '0 0 6px rgba(240,192,64,0.5)' : 'none',
            }}
          >
            {effortActive ? `⭐ FIZ ALÉM +${effortBonus}` : `+ FAZER A MAIS (+${effortBonus})`}
          </span>
        )}
      </div>

      {/* XP / Penalty */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        <span style={{
          fontSize: 12,
          fontFamily: "'Share Tech Mono', monospace",
          color: '#50e890',
          textShadow: '0 0 6px #40e080',
          fontWeight: 700,
        }}>
          +{mission.xpReward}
        </span>
        {mission.xpPenalty > 0 && !done && (
          <span style={{
            fontSize: 10,
            fontFamily: "'Share Tech Mono', monospace",
            color: 'rgba(220,80,80,0.6)',
          }}>
            -{mission.xpPenalty}
          </span>
        )}
      </div>

      {/* Checkbox */}
      {mission.custom && onDelete && (
        <span
          role="button"
          tabIndex={0}
          onClick={e => { e.stopPropagation(); onDelete(mission.id) }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onDelete(mission.id)
            }
          }}
          title="Excluir missão"
          style={{
            width: 22, height: 22,
            border: '1px solid rgba(220,80,80,0.45)',
            color: 'rgba(220,80,80,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 14,
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          ×
        </span>
      )}

      <div style={{
        width: 22, height: 22,
        border: `1px solid ${done ? '#50e890' : 'rgba(80,140,255,0.5)'}`,
        borderRadius: 2,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: done ? 'rgba(64,224,128,0.15)' : 'transparent',
        boxShadow: done ? '0 0 6px rgba(80,232,144,0.4)' : 'none',
        transition: 'all 0.15s',
      }}>
        {done && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <polyline points="1,5 4.5,8.5 11,1.5" stroke="#50e890" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  )
}
