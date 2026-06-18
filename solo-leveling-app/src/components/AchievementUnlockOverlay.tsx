import { useEffect, useState } from 'react'
import { useSounds } from '../hooks/useSounds'
import { burstParticles } from './ui/ParticleBackground'

interface AchievementInfo {
  id: string
  icon: string
  name: string
  description: string
}

interface Props {
  achievements: AchievementInfo[]
  onDone: () => void
}

export default function AchievementUnlockOverlay({ achievements, onDone }: Props) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const sounds = useSounds()

  const current = achievements[index]

  useEffect(() => {
    sounds.playAchievement()
    burstParticles('240,192,64')
    const t1 = setTimeout(() => setPhase('hold'), 200)
    const t2 = setTimeout(() => setPhase('out'), 3200)
    const t3 = setTimeout(() => {
      if (index < achievements.length - 1) {
        setIndex(i => i + 1)
        setPhase('in')
      } else {
        onDone()
      }
    }, 3700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null

  const visible = phase === 'hold'

  return (
    <div
      onClick={() => {
        if (index < achievements.length - 1) {
          setIndex(i => i + 1)
          setPhase('in')
        } else {
          onDone()
        }
      }}
      style={{
        position: 'fixed',
        bottom: 90, left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 40}px)`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        zIndex: 200,
        width: 'calc(100% - 32px)',
        maxWidth: 440,
        cursor: 'pointer',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        background: 'rgba(6,4,20,0.97)',
        border: '1px solid rgba(240,192,64,0.6)',
        borderLeft: '3px solid rgba(240,192,64,0.9)',
        boxShadow: '0 4px 32px rgba(240,192,64,0.15), 0 0 0 1px rgba(240,192,64,0.1)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(40,28,4,0.6)',
          border: '1px solid rgba(240,192,64,0.4)',
          fontSize: 26,
        }}>
          {current.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 8, letterSpacing: '0.4em',
            color: 'rgba(240,192,64,0.6)',
            fontFamily: 'Rajdhani', textTransform: 'uppercase',
            marginBottom: 2,
          }}>
            ✦ CONQUISTA DESBLOQUEADA
          </div>
          <div style={{
            fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 800,
            color: 'var(--gold)',
            textShadow: '0 0 12px rgba(240,192,64,0.6)',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {current.name}
          </div>
          <div style={{
            fontFamily: 'Rajdhani', fontSize: 11,
            color: 'rgba(180,200,240,0.7)',
            marginTop: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {current.description}
          </div>
        </div>

        {/* Counter if multiple */}
        {achievements.length > 1 && (
          <div style={{
            fontFamily: "'Share Tech Mono'", fontSize: 10,
            color: 'rgba(240,192,64,0.5)',
            flexShrink: 0,
          }}>
            {index + 1}/{achievements.length}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(40,28,4,0.8)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, rgba(240,192,64,0.4), rgba(240,192,64,0.9))',
          animation: visible ? 'shrink 3s linear forwards' : 'none',
        }}/>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
