import SLFrame from './ui/SLFrame'
import { SHADOW_STAGES, getShadowStageIndex, getShadowProgress } from '../data/shadowPath'
import { SHADOW_TIERS } from '../data/shadows'
import { getMissionName } from '../utils'
import type { PlayerStats } from '../types'

const SHADOW_DAYS = SHADOW_TIERS[0].days   // 21 dias para virar sombra

export default function ShadowPathPanel({ stats }: { stats: PlayerStats }) {
  const idx = getShadowStageIndex(stats)
  const { next, pct, label } = getShadowProgress(stats)
  const current = SHADOW_STAGES[idx]

  // Missões a caminho de virar sombra (streak entre 1 e 20, sem sombra ainda)
  const incubating = Object.entries(stats.missionStreaks ?? {})
    .filter(([id, days]) => days >= 1 && days < SHADOW_DAYS && !stats.shadows.some(s => s.missionId === id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <SLFrame glowColor={current.color} style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <img
          src={current.image}
          alt={current.name}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          style={{
            width: 56, height: 56, objectFit: 'cover', flexShrink: 0,
            borderRadius: 10,
            border: `2px solid ${current.color}`,
            boxShadow: `0 0 12px ${current.color}66`,
          }}
        />
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
            🌑 CAMINHO DAS SOMBRAS
          </div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 800, color: current.color, textShadow: `0 0 8px ${current.color}66`, letterSpacing: '0.02em', marginTop: 2 }}>
            {current.name}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {SHADOW_STAGES.map((stage, i) => {
          const reached = i <= idx
          const isCurrent = i === idx
          return (
            <div key={stage.id} style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
              {/* Trilha + nó */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 30 }}>
                <div style={{
                  width: 30, height: 30, flexShrink: 0,
                  borderRadius: '50%',
                  border: `2px solid ${reached ? stage.color : 'rgba(80,100,140,0.3)'}`,
                  background: reached ? `${stage.color}1e` : 'rgba(8,16,40,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                  boxShadow: isCurrent ? `0 0 12px ${stage.color}` : 'none',
                  filter: reached ? 'none' : 'grayscale(0.8) opacity(0.5)',
                  zIndex: 1,
                }}>
                  {stage.icon}
                </div>
                {i < SHADOW_STAGES.length - 1 && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 22,
                    background: i < idx ? stage.color : 'rgba(80,100,140,0.2)',
                    opacity: i < idx ? 0.6 : 1,
                  }}/>
                )}
              </div>

              {/* Texto */}
              <div style={{ flex: 1, paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700,
                    color: reached ? stage.color : 'var(--text-muted)',
                    textShadow: isCurrent ? `0 0 8px ${stage.color}88` : 'none',
                    letterSpacing: '0.03em',
                  }}>
                    {stage.name}
                  </span>
                  {isCurrent && (
                    <span style={{
                      fontSize: 8, letterSpacing: '0.12em', color: stage.color,
                      border: `1px solid ${stage.color}66`, padding: '1px 6px',
                      fontFamily: 'Rajdhani', fontWeight: 700,
                    }}>ATUAL</span>
                  )}
                </div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.35 }}>
                  {reached ? stage.lore : `🔒 ${stage.requirement}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progresso rumo ao próximo */}
      {next && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Próximo: <span style={{ color: next.color }}>{next.name}</span>
            </span>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: next.color }}>{label}</span>
          </div>
          <div style={{ height: 5, background: 'rgba(20,40,100,0.7)', border: `1px solid ${next.color}33`, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: `linear-gradient(90deg, ${next.color}88, ${next.color})`,
              boxShadow: `0 0 6px ${next.color}`,
              transition: 'width 0.8s ease',
            }}/>
          </div>
        </div>
      )}

      {/* Sombras em formação */}
      {incubating.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(40,100,200,0.15)' }}>
          <div style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: 8 }}>
            🕯️ Sombras em formação — {SHADOW_DAYS} dias seguidos
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {incubating.map(([id, days]) => {
              const p = Math.round((days / SHADOW_DAYS) * 100)
              return (
                <div key={id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '72%' }}>
                      {getMissionName(id, stats)}
                    </span>
                    <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: 'rgba(155,123,255,0.9)' }}>
                      {days}/{SHADOW_DAYS}d
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(20,40,100,0.7)', border: '1px solid rgba(155,123,255,0.25)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: 'linear-gradient(90deg, rgba(155,123,255,0.6), #9b7bff)', boxShadow: '0 0 5px #9b7bff', transition: 'width 0.6s ease' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SLFrame>
  )
}
