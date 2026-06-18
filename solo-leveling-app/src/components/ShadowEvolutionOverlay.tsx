import { useEffect, useState } from 'react'
import { useSounds } from '../hooks/useSounds'
import { burstParticles } from './ui/ParticleBackground'
import { boostGears } from './ui/GearDecor'
import Typewriter from './ui/Typewriter'
import type { ShadowStage } from '../data/shadowPath'

interface Props {
  stage: ShadowStage
  onDone: () => void
}

export default function ShadowEvolutionOverlay({ stage, onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const [imgOk, setImgOk] = useState(true)
  const sounds = useSounds()

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('hold')
      sounds.playHonorOrRankUp()
      burstParticles('176,136,255')
      boostGears()
      setTimeout(() => burstParticles('176,136,255'), 400)
    }, 600)
    const t2 = setTimeout(() => setPhase('out'), 3600)
    const t3 = setTimeout(() => onDone(), 4200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const opacity = phase === 'hold' ? 1 : 0
  const scale   = phase === 'in' ? 0.6 : phase === 'hold' ? 1 : 1.15

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(2,4,16,0.93)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.5s ease',
      opacity: phase === 'out' ? 0 : 1,
      backdropFilter: 'blur(6px)',
    }}>
      {/* Brilho suave (sem linha, para não cruzar o texto) */}
      <div style={{
        position: 'absolute',
        width: 340, height: 340,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${stage.color}33 0%, ${stage.color}10 45%, transparent 70%)`,
        filter: 'blur(8px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        opacity,
        transform: `scale(${scale})`,
      }}/>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        opacity, transform: `scale(${scale})`, zIndex: 1,
      }}>
        <div style={{
          fontFamily: 'Rajdhani, sans-serif', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.4em', color: 'var(--text-muted)', textTransform: 'uppercase',
        }}>
          Evolução do Caçador
        </div>

        {imgOk ? (
          <img
            src={stage.image}
            alt={stage.name}
            onError={() => setImgOk(false)}
            style={{
              width: 200, height: 200, objectFit: 'cover',
              borderRadius: 16,
              border: `2px solid ${stage.color}`,
              boxShadow: `0 0 30px ${stage.color}88, inset 0 0 20px ${stage.color}44`,
            }}
          />
        ) : (
          <div style={{ fontSize: 88, lineHeight: 1, filter: `drop-shadow(0 0 24px ${stage.color})` }}>
            {stage.icon}
          </div>
        )}

        {/* Nome só quando a imagem não carregou (a arte já traz o nome) */}
        {!imgOk && (
          <div style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 800,
            letterSpacing: '0.1em', color: stage.color,
            textShadow: `0 0 18px ${stage.color}`, textAlign: 'center',
            minHeight: 26,
          }}>
            {phase === 'hold' && <Typewriter text={stage.name} speed={42} delay={200} cursor={false} />}
          </div>
        )}

        {/* Scanlines decorativas */}
        <div style={{ marginTop: 2, display: 'flex', gap: 4 }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{
              width: i === 3 ? 28 : 8, height: 2,
              background: stage.color,
              opacity: i === 3 ? 1 : 0.3,
              boxShadow: i === 3 ? `0 0 6px ${stage.color}` : 'none',
            }}/>
          ))}
        </div>

        <div style={{
          fontFamily: 'Rajdhani, sans-serif', fontSize: 12,
          color: 'rgba(210,218,245,0.85)', maxWidth: 300, textAlign: 'center', lineHeight: 1.55,
          padding: '0 24px', marginTop: 4,
        }}>
          {phase === 'hold' && stage.lore}
        </div>
      </div>
    </div>
  )
}
