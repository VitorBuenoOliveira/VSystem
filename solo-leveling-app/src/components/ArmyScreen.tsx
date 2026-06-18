import { useState } from 'react'
import SLFrame from './ui/SLFrame'
import { Gear } from './ui/GearDecor'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { getShadowTierConfig, getShadowPower, nextTierInfo, SHADOW_TIERS } from '../data/shadows'
import { getMissionName } from '../utils'
import type { Shadow } from '../types'

export default function ArmyScreen() {
  const { stats, createBoss } = usePlayerStore()
  const [showCreateBoss, setShowCreateBoss] = useState(false)
  const [bossName, setBossName] = useState('')
  const [bossHp,   setBossHp]   = useState('1200')
  const [view, setView] = useState<'hq' | 'boss'>('hq')

  const boss    = stats.boss
  const bossHpPct = boss ? Math.round((boss.hp / boss.hpMax) * 100) : 0
  const totalPower = stats.shadows.reduce((sum, s) => sum + getShadowPower(s.basePower, s.daysTotal), 0)

  const handleCreateBoss = () => {
    const hp = parseInt(bossHp) || 1200
    if (bossName.trim()) {
      createBoss(bossName.trim(), hp)
      setBossName('')
      setShowCreateBoss(false)
    }
  }

  // Agrupa sombras por tier
  const byTier = SHADOW_TIERS.slice().reverse().reduce<Record<string, Shadow[]>>((acc, t) => {
    acc[t.tier] = stats.shadows.filter(s => getShadowTierConfig(s.daysTotal).tier === t.tier)
    return acc
  }, {})

  return (
    <div style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', height: '100%' }}>

      {/* Tabs internas */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(40,100,200,0.3)', overflow: 'hidden' }}>
        {(['hq', 'boss'] as const).map(tab => (
          <button key={tab} onClick={() => setView(tab)} style={{
            flex: 1, padding: '8px 0',
            background: view === tab ? 'rgba(30,60,140,0.5)' : 'rgba(4,8,28,0.8)',
            border: 'none',
            borderBottom: view === tab ? '2px solid var(--neon-bright)' : '2px solid transparent',
            fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.15em', color: view === tab ? 'var(--neon-bright)' : 'var(--text-muted)',
            cursor: 'pointer', textTransform: 'uppercase',
          }}>
            {tab === 'hq' ? '🌑 Quartel General' : '☠️ Boss'}
          </button>
        ))}
      </div>

      {view === 'boss' && (
        <>
          <BossPanel
            boss={boss} bossHpPct={bossHpPct}
            showCreate={showCreateBoss}
            bossName={bossName} bossHp={bossHp}
            onToggleCreate={() => setShowCreateBoss(s => !s)}
            onNameChange={setBossName} onHpChange={setBossHp}
            onCreateBoss={handleCreateBoss}
          />
          <MissionStreakPanel stats={stats} />
        </>
      )}

      {view === 'hq' && (
        <>
          {/* ── Painel de comando ── */}
          <SLFrame style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
              ◆ COMANDO DAS SOMBRAS
              <Gear size={13} color="rgba(125,200,255,0.6)" duration={10} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <StatBox label="SOLDADOS" value={stats.shadows.length.toString()} color="var(--neon-bright)" />
              <StatBox label="PODER TOTAL" value={`⚡${totalPower}`} color="var(--gold)" />
              <StatBox label="XP PASSIVO" value={`~${Math.min(Math.round(totalPower * 0.3), 99)}/dia`} color="#50e890" />
            </div>
          </SLFrame>

          {/* ── Hierarquia ── */}
          <SLFrame style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
              ◆ HIERARQUIA DO EXÉRCITO
            </div>

            {stats.shadows.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '20px 0',
                fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text-muted)',
              }}>
                Nenhuma sombra ainda.<br/>
                <span style={{ fontSize: 11, color: 'rgba(80,130,200,0.4)' }}>
                  Mantenha uma missão por 21 dias para invocar um soldado.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SHADOW_TIERS.slice().reverse().map(tierCfg => {
                  const shadows = byTier[tierCfg.tier] ?? []
                  if (shadows.length === 0) return null
                  return (
                    <div key={tierCfg.tier}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                        paddingBottom: 4,
                        borderBottom: `1px solid ${tierCfg.color}33`,
                      }}>
                        <span style={{ fontSize: 14 }}>{tierCfg.icon}</span>
                        <span style={{
                          fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 800,
                          color: tierCfg.color, letterSpacing: '0.1em',
                          textShadow: `0 0 8px ${tierCfg.color}66`,
                        }}>
                          {tierCfg.tier.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--text-muted)' }}>
                          × {shadows.length}
                        </span>
                        <span style={{ flex: 1 }}/>
                        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: tierCfg.color }}>
                          ⚡{shadows.reduce((s, sh) => s + getShadowPower(sh.basePower, sh.daysTotal), 0)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {shadows.map(s => <ShadowCard key={s.id} shadow={s} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SLFrame>

          {/* ── Progressão de tiers ── */}
          <SLFrame style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
              PROGRESSÃO DE TIERS
            </div>
            {SHADOW_TIERS.map(t => (
              <div key={t.tier} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: t.color, width: 90 }}>
                  {t.tier}
                </span>
                <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--text-muted)' }}>
                  {t.days} dias · ×{t.powerMult} poder
                </span>
              </div>
            ))}
          </SLFrame>

          {/* ── Streaks de missões ── */}
          <MissionStreakPanel stats={stats} />
        </>
      )}
    </div>
  )
}

// ── Stat Box ───────────────────────────────────────────────────────────────

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '8px 4px',
      background: 'rgba(4,16,52,0.5)',
      border: '1px solid rgba(40,100,200,0.2)',
    }}>
      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 14, color, fontWeight: 700 }}>
        {value}
      </div>
      <div style={{ fontSize: 8, fontFamily: 'Rajdhani', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  )
}

// ── Boss Panel ─────────────────────────────────────────────────────────────

function BossPanel({ boss, bossHpPct, showCreate, bossName, bossHp, onToggleCreate, onNameChange, onHpChange, onCreateBoss }: {
  boss: ReturnType<typeof usePlayerStore>['stats']['boss']
  bossHpPct: number
  showCreate: boolean
  bossName: string
  bossHp: string
  onToggleCreate: () => void
  onNameChange: (v: string) => void
  onHpChange: (v: string) => void
  onCreateBoss: () => void
}) {
  const defeated = boss?.defeated ?? false
  const glowColor = defeated ? '#f0c040' : boss ? '#e04040' : '#3a8fff'

  return (
    <SLFrame glowColor={glowColor} style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
        ◆ BOSS ATUAL
      </div>

      {!boss ? (
        <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontFamily: 'Rajdhani', fontSize: 13 }}>
          Nenhum boss ativo.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 36, filter: defeated ? 'grayscale(0.3)' : 'none' }}>{boss.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700,
                color: defeated ? 'var(--gold)' : 'var(--text-primary)',
                textShadow: defeated ? '0 0 10px var(--gold)' : 'none',
              }}>
                {boss.name}
              </div>
              {defeated ? (
                <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: "'Share Tech Mono'", marginTop: 2 }}>
                  DERROTADO ✦ +{boss.rewXp} XP +{boss.rewGold}G
                </div>
              ) : (
                <div style={{ fontSize: 10, fontFamily: "'Share Tech Mono'", color: 'var(--text-muted)', marginTop: 2 }}>
                  HP: {boss.hp} / {boss.hpMax}
                </div>
              )}
            </div>
          </div>

          {!defeated && (
            <>
              <div style={{ marginBottom: 6 }}>
                <div style={{
                  height: 8, background: 'rgba(40,10,10,0.8)',
                  border: '1px solid rgba(220,64,64,0.4)', overflow: 'hidden', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', inset: '0 auto 0 0',
                    width: `${bossHpPct}%`,
                    background: bossHpPct > 50
                      ? 'linear-gradient(90deg, #a02020, #e04040)'
                      : bossHpPct > 20
                      ? 'linear-gradient(90deg, #e04040, #ff8040)'
                      : 'linear-gradient(90deg, #ff4040, #ffaa00)',
                    boxShadow: '0 0 8px rgba(220,64,64,0.6)',
                    transition: 'width 1s ease',
                  }}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono'", color: 'rgba(220,80,80,0.7)' }}>HP RESTANTE</span>
                  <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono'", color: 'rgba(220,80,80,0.7)' }}>{bossHpPct}%</span>
                </div>
              </div>
              <div style={{
                fontSize: 10, fontFamily: 'Rajdhani', color: 'var(--text-muted)',
                background: 'rgba(40,10,10,0.4)', border: '1px solid rgba(220,64,64,0.2)',
                padding: '6px 10px',
              }}>
                Recompensa: <span style={{ color: '#50e890' }}>+{boss.rewXp} XP</span>
                {' '}e <span style={{ color: 'var(--gold)' }}>+{boss.rewGold}G</span>
                {' '}+ chance de <span style={{ color: '#60a5fa' }}>Relíquia Comum</span>
              </div>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: 10 }}>
        {!showCreate ? (
          <button onClick={onToggleCreate} style={{
            width: '100%', padding: '7px 0',
            background: 'rgba(6,18,60,0.9)', border: '1px solid rgba(58,143,255,0.4)',
            fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.15em', color: 'var(--neon-bright)', cursor: 'pointer',
          }}>
            {defeated || !boss ? '+ INVOCAR NOVO BOSS' : '↺ SUBSTITUIR BOSS'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={bossName} onChange={e => onNameChange(e.target.value)} placeholder="Nome do boss..." style={inputStyle} />
            <input value={bossHp} onChange={e => onHpChange(e.target.value)} placeholder="HP (padrão: 1200)" type="number" style={inputStyle} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onToggleCreate} style={btnStyle('var(--border)')}>CANCELAR</button>
              <button onClick={onCreateBoss} style={btnStyle('var(--success)', true)}>INVOCAR</button>
            </div>
          </div>
        )}
      </div>
    </SLFrame>
  )
}

// ── Shadow Card ─────────────────────────────────────────────────────────────

function ShadowCard({ shadow: s }: { shadow: Shadow }) {
  const tierCfg  = getShadowTierConfig(s.daysTotal)
  const power    = getShadowPower(s.basePower, s.daysTotal)
  const nextTier = nextTierInfo(s.daysTotal)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: 'rgba(4,16,52,0.7)',
      border: `1px solid ${tierCfg.color}33`,
      borderLeft: `2px solid ${tierCfg.color}`,
    }}>
      <span style={{ fontSize: 18 }}>{tierCfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700,
          color: tierCfg.color, letterSpacing: '0.02em',
        }}>
          {s.name}
        </div>
        <div style={{ fontSize: 9, fontFamily: "'Share Tech Mono'", color: 'var(--text-muted)', marginTop: 1 }}>
          {s.daysTotal} dias · {s.missionName.slice(0, 20)}
        </div>
        {nextTier && (
          <div style={{ fontSize: 9, color: 'rgba(80,180,255,0.5)', fontFamily: "'Share Tech Mono'" }}>
            → {nextTier.tier} em {nextTier.daysLeft}d
          </div>
        )}
      </div>
      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 14, fontWeight: 700, color: 'var(--neon-bright)' }}>
        ⚡{power}
      </div>
    </div>
  )
}

// ── Mission Streak Panel ───────────────────────────────────────────────────

function MissionStreakPanel({ stats }: { stats: ReturnType<typeof usePlayerStore>['stats'] }) {
  const entries = Object.entries(stats.missionStreaks)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  if (entries.length === 0) return null

  return (
    <SLFrame style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
        SEQUÊNCIAS ATIVAS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map(([id, streak]) => {
          const name = getMissionName(id, stats)
          const hasShadow = stats.shadows.some(s => s.missionId === id)
          const pctTo21 = Math.min(100, Math.round((streak / 21) * 100))
          return (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
              background: 'rgba(4,16,52,0.5)', border: '1px solid rgba(40,100,200,0.2)',
            }}>
              <span style={{ fontSize: 14 }}>{hasShadow ? '🌑' : '🔥'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 600,
                  color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {name}
                </div>
                {!hasShadow && (
                  <div style={{ height: 2, background: 'rgba(20,40,100,0.6)', marginTop: 3 }}>
                    <div style={{
                      height: '100%', width: `${pctTo21}%`,
                      background: 'linear-gradient(90deg, #1a4aaa, #3a8fff)',
                    }}/>
                  </div>
                )}
              </div>
              <div style={{
                fontFamily: "'Share Tech Mono'", fontSize: 12,
                color: streak >= 21 ? 'var(--gold)' : 'var(--neon-bright)',
              }}>
                {streak}d {hasShadow ? '✦' : `/ 21`}
              </div>
            </div>
          )
        })}
      </div>
    </SLFrame>
  )
}

// ── Style helpers ──────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 12px',
  background: 'rgba(4,16,52,0.9)',
  border: '1px solid rgba(58,143,255,0.35)',
  color: 'var(--text-primary)',
  fontFamily: 'Rajdhani, sans-serif', fontSize: 14, outline: 'none',
}

function btnStyle(border: string, primary?: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '7px 0',
    background: 'rgba(6,18,60,0.9)', border: `1px solid ${border}`,
    fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700,
    letterSpacing: '0.12em',
    color: primary ? 'var(--success)' : 'var(--text-secondary)',
    textShadow: primary ? '0 0 8px var(--success)' : 'none',
    cursor: 'pointer',
  }
}
