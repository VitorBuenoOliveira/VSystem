import { useEffect, useState } from 'react'
import type { RankLabel } from '../types'
import { getRankConfig } from '../data/ranks'
import { useSounds } from '../hooks/useSounds'
import { burstParticles } from './ui/ParticleBackground'
import Typewriter from './ui/Typewriter'

interface Props {
  newRank: RankLabel
  onDone: () => void
}

const RANK_TITLE: Record<string, string> = {
  S: 'Monarca das Sombras', A: 'Caçador de Elite', B: 'Caçador Veterano',
  C: 'Caçador', D: 'Explorador', E: 'Iniciante', F: 'Novato',
}

export default function RankUpOverlay({ newRank, onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const cfg = getRankConfig(newRank)
  const sounds = useSounds()

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('hold')
      sounds.playHonorOrRankUp()
      const rgb = newRank === 'S' ? '240,192,64' : '120,200,255'
      burstParticles(rgb)
      setTimeout(() => burstParticles(rgb), 400)
    }, 600)
    const t2 = setTimeout(() => setPhase('out'), 3200)
    const t3 = setTimeout(() => onDone(), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const opacity = phase === 'in' ? 0 : phase === 'hold' ? 1 : 0
  const scale   = phase === 'in' ? 0.6 : phase === 'hold' ? 1 : 1.15

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(2,4,16,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.5s ease',
      opacity: phase === 'out' ? 0 : 1,
      backdropFilter: 'blur(6px)',
    }}>
      {/* Glow ring */}
      <div style={{
        position: 'absolute',
        width: 280, height: 280,
        border: `2px solid ${cfg.color}`,
        borderRadius: '50%',
        boxShadow: `0 0 60px ${cfg.color}66, inset 0 0 60px ${cfg.color}22`,
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        opacity,
        transform: `scale(${scale})`,
      }}/>

      {/* Content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        opacity,
        transform: `scale(${scale})`,
        zIndex: 1,
      }}>
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.4em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          Rank Up
        </div>

        <div style={{
          fontSize: 96, fontWeight: 900,
          fontFamily: 'Rajdhani, sans-serif',
          color: cfg.color,
          textShadow: `0 0 40px ${cfg.color}, 0 0 80px ${cfg.color}88`,
          letterSpacing: '0.05em',
          lineHeight: 1,
        }}>
          {newRank}
        </div>

        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 16, fontWeight: 700,
          letterSpacing: '0.18em',
          color: cfg.color,
          textShadow: `0 0 12px ${cfg.color}`,
          textTransform: 'uppercase',
          minHeight: 20,
        }}>
          {phase === 'hold' && (
            <Typewriter text={RANK_TITLE[newRank] ?? 'Novato'} speed={45} delay={200} cursor={false} />
          )}
        </div>

        {/* Scanlines decorative */}
        <div style={{
          marginTop: 8,
          display: 'flex', gap: 4,
        }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{
              width: i === 3 ? 28 : 8,
              height: 2,
              background: cfg.color,
              opacity: i === 3 ? 1 : 0.3,
              boxShadow: i === 3 ? `0 0 6px ${cfg.color}` : 'none',
            }}/>
          ))}
        </div>
      </div>
    </div>
  )
}
