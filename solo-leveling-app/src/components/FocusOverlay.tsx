import { useEffect, useRef, useState } from 'react'
import { useSounds } from '../hooks/useSounds'
import { burstParticles } from './ui/ParticleBackground'
import { getVerseOfDay } from '../data/verses'
import { todayStr } from '../utils'
import type { Mission } from '../types'

interface Props {
  mission: Mission
  onComplete: (id: string) => void
  onClose: () => void
}

const CAT_GLOW: Record<string, string> = {
  saude: '#3a8fff', amor: '#e05080', estudo: '#8060ff', ingles: '#40c0e0',
  fe: '#f0d060', habito: '#50e890', familia: '#e0903a', carater: '#c8a0ff',
}

export default function FocusOverlay({ mission, onComplete, onClose }: Props) {
  const sounds = useSounds()
  const color = CAT_GLOW[mission.category] ?? '#3a8fff'

  const presetMin = mission.estimatedMinutes && mission.estimatedMinutes > 0 ? mission.estimatedMinutes : 10
  const [pomodoro, setPomodoro] = useState(false)
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [totalSec, setTotalSec] = useState(presetMin * 60)
  const [remaining, setRemaining] = useState(presetMin * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const completedRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const verse = mission.category === 'fe' ? getVerseOfDay(todayStr()) : null

  // Reconfigura o tempo ao trocar de modo/preset (só quando parado)
  function setMinutes(min: number, p: 'focus' | 'break' = 'focus') {
    setPhase(p)
    setTotalSec(min * 60)
    setRemaining(min * 60)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          // Fim do bloco
          clearInterval(intervalRef.current!)
          sounds.playHonorOrRankUp()
          if (phase === 'focus') {
            // Conclui a missão uma única vez
            if (!completedRef.current) {
              completedRef.current = true
              onComplete(mission.id)
              burstParticles('120,200,255')
            }
            if (pomodoro) {
              // Inicia a pausa automaticamente
              setPhase('break')
              setTotalSec(5 * 60)
              setRunning(true)
              return 5 * 60
            }
            setDone(true)
            setRunning(false)
            setTimeout(onClose, 2200)
            return 0
          } else {
            // Fim da pausa → volta pro foco, aguardando o usuário
            setPhase('focus')
            setTotalSec(presetMin * 60)
            setRunning(false)
            return presetMin * 60
          }
        }
        return r - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, pomodoro]) // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const pct = totalSec > 0 ? (1 - remaining / totalSec) * 100 : 0

  // Anel SVG de progresso
  const R = 130, C = 2 * Math.PI * R
  const dash = (pct / 100) * C

  const phaseColor = phase === 'break' ? '#50e890' : color
  const phaseLabel = done ? 'CONCLUÍDO'
    : phase === 'break' ? 'PAUSA'
    : pomodoro ? 'FOCO (POMODORO)' : 'FOCO'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 210,
      background: 'rgba(2,4,12,0.96)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
      padding: 24,
    }}>
      {/* Fechar */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 18, right: 18,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(8,16,40,0.8)', border: '1px solid rgba(120,160,220,0.3)',
          color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer',
        }}
      >✕</button>

      <div style={{ fontFamily: 'Rajdhani', fontSize: 10, letterSpacing: '0.35em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {phaseLabel}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>{mission.icon}</span>
        <span style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', maxWidth: 280 }}>
          {mission.name}
        </span>
      </div>

      {/* Relógio circular */}
      <div style={{ position: 'relative', width: 300, height: 300 }}>
        <svg width="300" height="300" viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(40,80,140,0.25)" strokeWidth="10" />
          <circle
            cx="150" cy="150" r={R} fill="none" stroke={phaseColor} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            style={{ filter: `drop-shadow(0 0 8px ${phaseColor})`, transition: 'stroke-dasharray 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 54, fontWeight: 700, color: 'var(--text-primary)', textShadow: `0 0 16px ${phaseColor}66`, lineHeight: 1 }}>
            {done ? '✓' : `${mm}:${ss}`}
          </div>
          {!done && (
            <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {Math.round(pct)}%
            </div>
          )}
        </div>
      </div>

      {/* Versículo (missões de fé) */}
      {verse && !done && (
        <div style={{ maxWidth: 320, textAlign: 'center', fontFamily: 'Rajdhani', fontSize: 12, color: 'rgba(220,210,160,0.85)', lineHeight: 1.5 }}>
          “{verse.text}” <span style={{ color: 'rgba(240,208,96,0.7)' }}>({verse.ref})</span>
        </div>
      )}

      {done ? (
        <div style={{ fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, color: 'var(--success)', letterSpacing: '0.1em', textShadow: '0 0 10px var(--success)' }}>
          MISSÃO CONCLUÍDA
        </div>
      ) : (
        <>
          {/* Presets (só quando parado e em foco) */}
          {!running && phase === 'focus' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[presetMin, 10, 25].filter((v, i, a) => a.indexOf(v) === i).map(min => (
                <button
                  key={min}
                  onClick={() => { setPomodoro(min === 25); setMinutes(min) }}
                  style={chip(totalSec === min * 60, color)}
                >
                  {min} min{min === 25 ? ' 🍅' : ''}
                </button>
              ))}
            </div>
          )}

          {/* Controles */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setRunning(r => !r)} style={mainBtn(phaseColor)}>
              {running ? '⏸ PAUSAR' : '▶ INICIAR'}
            </button>
            <button onClick={() => setRemaining(r => r + 300)} style={ghostBtn()}>+5 min</button>
            <button
              onClick={() => { if (!completedRef.current) { completedRef.current = true; onComplete(mission.id) } onClose() }}
              style={ghostBtn('rgba(64,224,128,0.6)', 'var(--success)')}
            >
              ✓ Concluir
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function chip(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '6px 14px',
    background: active ? `${color}22` : 'rgba(8,16,40,0.7)',
    border: `1px solid ${active ? color : 'rgba(80,120,180,0.3)'}`,
    color: active ? color : 'var(--text-muted)',
    fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
    cursor: 'pointer', borderRadius: 4,
  }
}
function mainBtn(color: string): React.CSSProperties {
  return {
    padding: '12px 28px',
    background: `${color}1e`, border: `1px solid ${color}`,
    color, fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 800, letterSpacing: '0.12em',
    cursor: 'pointer', textShadow: `0 0 10px ${color}88`, borderRadius: 4,
  }
}
function ghostBtn(border = 'rgba(120,160,220,0.4)', color = 'var(--text-secondary)'): React.CSSProperties {
  return {
    padding: '10px 16px',
    background: 'rgba(8,16,40,0.7)', border: `1px solid ${border}`,
    color, fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
    cursor: 'pointer', borderRadius: 4,
  }
}
