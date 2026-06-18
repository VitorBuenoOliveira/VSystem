import { useEffect, useState } from 'react'
import { useSounds } from '../hooks/useSounds'
import { burstParticles } from './ui/ParticleBackground'

interface Props {
  monarcaLevel: number   // o NOVO nível após ascensão
  onDone: () => void
}

export default function AscensionOverlay({ monarcaLevel, onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const sounds = useSounds()

  useEffect(() => {
    sounds.playAscension()
    const b1 = setTimeout(() => burstParticles('240,192,64'), 500)
    const b2 = setTimeout(() => burstParticles('240,192,64'), 1100)
    const b3 = setTimeout(() => burstParticles('255,230,150'), 1700)
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 6000)
    const t3 = setTimeout(onDone, 6500)
    return () => { [b1,b2,b3,t1,t2,t3].forEach(clearTimeout) }
  }, [onDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const visible = phase === 'hold'

  return (
    <div
      onClick={() => { setPhase('out'); setTimeout(onDone, 500) }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(2,2,10,0.97)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(16px)',
        opacity: phase === 'in' ? 0 : phase === 'hold' ? 1 : 0,
        transition: 'opacity 0.5s ease',
        cursor: 'pointer',
      }}
    >
      {/* Rings de ouro */}
      {[320, 240, 160].map((size, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: size, height: size,
          border: `1px solid rgba(240,192,64,${0.15 - i * 0.04})`,
          borderRadius: '50%',
          boxShadow: i === 0 ? '0 0 80px rgba(240,192,64,0.1)' : 'none',
          transform: visible ? 'scale(1)' : `scale(${1 + i * 0.1})`,
          opacity: visible ? 1 : 0,
          transition: `transform ${0.6 + i * 0.1}s ease, opacity 0.5s ease`,
        }}/>
      ))}

      {/* Card */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        padding: '36px 40px',
        background: 'rgba(6,4,20,0.98)',
        border: '1px solid rgba(240,192,64,0.5)',
        borderTop: '2px solid rgba(240,192,64,0.9)',
        boxShadow: '0 0 60px rgba(240,192,64,0.12), inset 0 0 40px rgba(240,192,64,0.04)',
        maxWidth: 340,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.92)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.5em',
          color: 'rgba(240,192,64,0.5)',
          fontFamily: 'Rajdhani', textTransform: 'uppercase',
        }}>
          ◆ O SISTEMA PROCLAMA ◆
        </div>

        <div style={{ fontSize: 64, lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(240,192,64,0.6))' }}>
          🌟
        </div>

        <div style={{
          fontFamily: 'Rajdhani', fontSize: 24, fontWeight: 900,
          color: 'var(--gold)',
          textShadow: '0 0 30px rgba(240,192,64,0.7)',
          letterSpacing: '0.08em',
          textAlign: 'center',
        }}>
          ASCENSÃO MONARCA
        </div>

        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 36, fontWeight: 700,
          color: 'var(--gold)',
          textShadow: '0 0 20px rgba(240,192,64,0.8)',
        }}>
          NÍVEL {monarcaLevel}
        </div>

        <div style={{
          fontFamily: 'Rajdhani', fontSize: 13,
          color: 'var(--text-secondary)', letterSpacing: '0.04em',
          textAlign: 'center', lineHeight: 1.6,
        }}>
          Você renasceu. O progresso zera — o legado permanece.<br/>
          <span style={{ color: '#50e890' }}>+{monarcaLevel * 5}% XP global</span> a partir de agora.
        </div>

        <div style={{
          width: '100%', padding: '10px 14px',
          background: 'rgba(240,192,64,0.06)',
          border: '1px solid rgba(240,192,64,0.25)',
          fontFamily: 'Rajdhani', fontSize: 12,
          color: 'rgba(240,192,64,0.7)', textAlign: 'center',
          letterSpacing: '0.08em',
        }}>
          Conquistas · Relíquias · Títulos · Sombras mantidos
        </div>

        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'Rajdhani', letterSpacing: '0.15em' }}>
          toque para continuar
        </div>
      </div>
    </div>
  )
}
