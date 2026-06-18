import SLFrame from './ui/SLFrame'
import type { Prophecy } from '../types'
import { RARITY_COLOR } from '../data/relics'
import { getRelicDef } from '../data/relics'

interface Props {
  prophecy: Prophecy
}

export default function ProphecyCard({ prophecy }: Props) {
  const pct = Math.round((prophecy.progress / prophecy.goal) * 100)
  const relic = prophecy.rewardRelicId ? getRelicDef(prophecy.rewardRelicId) : null

  const state = prophecy.completed ? 'completed' : prophecy.failed ? 'failed' : 'active'
  const color = state === 'completed' ? '#f0d060' : state === 'failed' ? '#e05050' : '#a060ff'

  return (
    <div style={{ padding: '10px 16px 0' }}>
      <SLFrame glowColor={color}>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{prophecy.icon}</span>
            <div>
              <div style={{
                fontSize: 8, letterSpacing: '0.4em',
                color: `${color}bb`, fontFamily: 'Rajdhani', textTransform: 'uppercase',
              }}>
                {state === 'completed' ? '✦ PROFECIA CONCLUÍDA' : state === 'failed' ? '✗ PROFECIA EXPIRADA' : '📜 PROFECIA LENDÁRIA'}
              </div>
              <div style={{
                fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 800,
                color, letterSpacing: '0.04em',
              }}>
                {prophecy.name}
              </div>
            </div>
          </div>

          <div style={{
            fontFamily: 'Rajdhani', fontSize: 12,
            color: 'rgba(180,200,240,0.7)', marginBottom: 8,
            lineHeight: 1.5,
          }}>
            {prophecy.task}
          </div>

          {/* Progresso */}
          {!prophecy.completed && !prophecy.failed && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontFamily: 'Rajdhani', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                  PROGRESSO
                </span>
                <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono'", color }}>
                  {prophecy.progress}/{prophecy.goal}
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(40,60,120,0.5)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                  boxShadow: `0 0 8px ${color}66`,
                  transition: 'width 0.5s ease',
                }}/>
              </div>
            </div>
          )}

          {/* Recompensas */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 12, color: '#50e890' }}>
              +{prophecy.rewardXp} XP
            </span>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 12, color: 'var(--gold)' }}>
              +{prophecy.rewardGold}G
            </span>
            {relic && (
              <span style={{
                fontSize: 10, fontFamily: 'Rajdhani',
                color: RARITY_COLOR[relic.rarity], letterSpacing: '0.05em',
              }}>
                {relic.icon} {relic.name}
              </span>
            )}
            {prophecy.rewardTitle && (
              <span style={{ fontSize: 10, fontFamily: 'Rajdhani', color: '#f0d060' }}>
                「{prophecy.rewardTitle}」
              </span>
            )}
          </div>

          {!prophecy.completed && !prophecy.failed && (
            <div style={{
              marginTop: 6, fontSize: 9, fontFamily: 'Rajdhani',
              color: 'var(--text-muted)', letterSpacing: '0.1em',
            }}>
              expira em: {prophecy.expiresAt}
            </div>
          )}
        </div>
      </SLFrame>
    </div>
  )
}
