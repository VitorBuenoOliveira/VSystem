import SLFrame from './ui/SLFrame'
import { Gear } from './ui/GearDecor'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { useSounds } from '../hooks/useSounds'
import { DUNGEON_GATES } from '../data/dungeons'
import { checkGateRequirement, calcAttributes } from '../utils'
import { calcWinChance, getBossTier, TIER_CAPS, TIER_COLORS, TIER_LABELS } from '../data/monthlyBoss'
import type { BossTier } from '../data/monthlyBoss'
import type { Dungeon, FloorGate, MonthlyBoss, PlayerAttributes } from '../types'
import { useEffect, useState } from 'react'
import { CAT_COLORS } from '../data/categoryColors'

export default function DungeonsScreen() {
  const { stats, openGate } = usePlayerStore()
  const sounds = useSounds()

  useEffect(() => { sounds.playSystemOpen() }, []) // eslint-disable-line

  const totalMissions = stats.logs.reduce((s, l) => s + l.completedMissions.length, 0)
  const attrs         = calcAttributes(stats)
  const keys          = stats.dungeonKeys ?? 0
  const MAX_KEYS      = 10

  // Próximo portão que ainda pode ser desbloqueado (req atendido mas sem chave, ou qualquer futuro)
  const nextReadyGate = (() => {
    for (const d of stats.dungeons) {
      const gates = DUNGEON_GATES[d.id] ?? []
      const gate  = gates.find(g => g.floor > d.currentFloor)
      if (!gate) continue
      const id    = `${d.id}:${gate.floor}`
      if ((stats.openedGates ?? []).includes(id)) continue
      return { dungeon: d, gate }
    }
    return null
  })()

  return (
    <div style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <SLFrame style={{ padding: '12px 16px' }}>
        <div style={{
          textAlign: 'center',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 13, fontWeight: 700,
          letterSpacing: '0.3em',
          color: 'var(--neon-bright)', textShadow: 'var(--neon-glow)',
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Gear size={15} color="rgba(125,200,255,0.7)" duration={11} reverse />
          ◆ Masmorras ◆
          <Gear size={15} color="rgba(125,200,255,0.7)" duration={9} />
        </div>
        <div style={{
          textAlign: 'center', marginTop: 4,
          fontSize: 10, letterSpacing: '0.1em',
          color: 'var(--text-muted)', fontFamily: 'Rajdhani',
        }}>
          Use chaves 🔑 para abrir os portões dos andares
        </div>

        {/* Contador de chaves */}
        <div style={{
          marginTop: 8, padding: '8px 0 4px',
          borderTop: '1px solid rgba(40,100,200,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔑</span>
            <span style={{
              fontFamily: "'Share Tech Mono'", fontSize: 18, fontWeight: 700,
              color: keys >= MAX_KEYS ? '#e08000' : keys > 0 ? 'var(--gold)' : 'var(--text-muted)',
              textShadow: keys > 0 ? `0 0 10px ${keys >= MAX_KEYS ? '#e08000' : 'var(--gold)'}` : 'none',
            }}>
              {keys}
            </span>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              / {MAX_KEYS} CHAVE{keys === 1 ? '' : 'S'}
            </span>
            {keys >= MAX_KEYS && (
              <span style={{ fontFamily: 'Rajdhani', fontSize: 9, letterSpacing: '0.1em', color: '#e08000', border: '1px solid rgba(224,128,0,0.4)', padding: '1px 5px' }}>
                CAP MÁXIMO
              </span>
            )}
          </div>
          {/* Próximo portão disponível */}
          {nextReadyGate && (
            <div style={{
              marginTop: 6, textAlign: 'center',
              fontFamily: 'Rajdhani', fontSize: 10, color: 'rgba(160,180,220,0.6)',
              letterSpacing: '0.05em',
            }}>
              próximo portão: <span style={{ color: CAT_COLORS[nextReadyGate.dungeon.relatedCategory] ?? 'var(--neon)' }}>
                {nextReadyGate.dungeon.name}
              </span> — andar {nextReadyGate.gate.floor}
            </div>
          )}
        </div>
      </SLFrame>

      {/* Boss Mensal */}
      {stats.monthlyBoss && (
        <MonthlyBossPanel boss={stats.monthlyBoss} attrs={attrs} />
      )}

      {/* Dungeons */}
      {stats.dungeons.map(d => (
        <DungeonCard key={d.id} dungeon={d} stats={stats} totalMissions={totalMissions} keys={keys} onOpenGate={openGate} />
      ))}
    </div>
  )
}

// ── Monthly Boss Panel ─────────────────────────────────────────────────────

const ATTR_LABELS: Record<keyof PlayerAttributes, string> = {
  forca: 'Força', inteligencia: 'INT', espiritual: 'SPR', carisma: 'CHA', vitalidade: 'VIT',
}
const ATTR_ICONS: Record<keyof PlayerAttributes, string> = {
  forca: '⚔', inteligencia: '📖', espiritual: '✦', carisma: '❤', vitalidade: '🛡',
}

function TierCard({
  tier, label, reqs, attrs, current, cap, selected, onClick,
}: {
  tier: BossTier
  label: string
  reqs: Partial<PlayerAttributes>
  attrs: PlayerAttributes
  current: boolean
  cap: number
  selected: boolean
  onClick: () => void
}) {
  const keys  = Object.keys(reqs) as (keyof PlayerAttributes)[]
  const allOk = keys.every(k => attrs[k] >= (reqs[k] ?? 0))
  const color = current ? TIER_COLORS[tier] : allOk ? 'rgba(60,200,80,0.5)' : 'rgba(100,100,100,0.4)'
  const bg    = current
    ? `rgba(${tier === 'max' ? '20,50,20' : tier === 'med' ? '50,40,10' : '50,20,10'},0.6)`
    : selected ? 'rgba(20,30,60,0.7)' : allOk ? 'rgba(10,30,10,0.4)' : 'rgba(10,10,20,0.4)'

  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 8px 10px',
        background: bg,
        border: `1px solid ${selected && !current ? 'rgba(58,143,255,0.6)' : color}`,
        borderTop: current ? `2px solid ${TIER_COLORS[tier]}` : selected ? '2px solid rgba(58,143,255,0.7)' : `1px solid ${color}`,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        fontFamily: 'Rajdhani', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
        color: current ? TIER_COLORS[tier] : allOk ? 'rgba(80,200,80,0.6)' : '#666',
        marginBottom: 4,
        textShadow: current ? `0 0 6px ${TIER_COLORS[tier]}` : 'none',
      }}>
        {current ? '▶ ' : ''}{label}
      </div>

      <div style={{
        fontFamily: "'Share Tech Mono'", fontSize: 13, fontWeight: 700,
        color: current ? TIER_COLORS[tier] : allOk ? 'rgba(80,200,80,0.6)' : '#555',
        marginBottom: 4, lineHeight: 1,
        textShadow: current ? `0 0 8px ${TIER_COLORS[tier]}` : 'none',
      }}>
        cap {cap}%
      </div>

      <div style={{ fontFamily: 'Rajdhani', fontSize: 8, color: selected ? 'rgba(58,143,255,0.7)' : 'rgba(80,100,160,0.5)', letterSpacing: '0.05em' }}>
        {selected ? '▲ fechar' : `${keys.length} req.`}
      </div>
    </div>
  )
}

function TierDetail({
  tier, label, reqs, attrs, cap,
}: {
  tier: BossTier
  label: string
  reqs: Partial<PlayerAttributes>
  attrs: PlayerAttributes
  cap: number
}) {
  const keys  = Object.keys(reqs) as (keyof PlayerAttributes)[]
  const allOk = keys.every(k => attrs[k] >= (reqs[k] ?? 0))
  const color = TIER_COLORS[tier]

  return (
    <div style={{
      padding: '10px 12px',
      background: `rgba(${tier === 'max' ? '10,30,10' : tier === 'med' ? '30,24,6' : '30,12,6'},0.7)`,
      border: `1px solid ${color}44`,
      borderTop: `2px solid ${color}`,
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color, letterSpacing: '0.15em', textShadow: `0 0 6px ${color}` }}>
          TIER {label} — cap {cap}%
        </span>
        <span style={{ fontFamily: 'Rajdhani', fontSize: 9, color: allOk ? '#60e080' : '#e06040' }}>
          {allOk ? '✓ REQUISITOS ATENDIDOS' : '✗ REQUISITOS PENDENTES'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {keys.map(k => {
          const have    = attrs[k]
          const need    = reqs[k] ?? 0
          const ok      = have >= need
          const pct     = Math.min(100, Math.round((have / need) * 100))
          return (
            <div key={k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: ok ? color : '#888' }}>
                  {ATTR_ICONS[k]} {ATTR_LABELS[k]}
                </span>
                <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: ok ? color : '#e06040' }}>
                  {have} / {need} {ok ? '✓' : '✗'}
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(10,20,50,0.7)', border: `1px solid ${ok ? color : '#e06040'}33`, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: ok ? color : '#e06040',
                  opacity: 0.7,
                  transition: 'width 0.6s ease',
                }}/>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 8, fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)' }}>
        {allOk
          ? `Com este tier, sua chance de vitória vai até ${cap}%.`
          : `Evolua os atributos acima completando missões das categorias correspondentes.`}
      </div>
    </div>
  )
}

function MonthlyBossPanel({ boss, attrs }: { boss: MonthlyBoss; attrs: PlayerAttributes }) {
  const [expandedTier, setExpandedTier] = useState<BossTier | null>(null)

  const hpPct    = Math.round((boss.hp / boss.hpMax) * 100)
  const defeated = boss.defeated
  const tier     = getBossTier(attrs, boss)
  const winChance = calcWinChance(boss, attrs)
  const tierColor = defeated ? '#f0c040' : TIER_COLORS[tier]

  const tiers: { key: BossTier; label: string; reqs: Partial<PlayerAttributes>; cap: number }[] = [
    { key: 'min', label: 'MÍNIMO',  reqs: boss.statRequirements    ?? {}, cap: TIER_CAPS.min },
    { key: 'med', label: 'MÉDIO',   reqs: boss.statRequirementsMed ?? {}, cap: TIER_CAPS.med },
    { key: 'max', label: 'MÁXIMO',  reqs: boss.statRequirementsMax ?? {}, cap: TIER_CAPS.max },
  ]

  const handleTierClick = (t: BossTier) => setExpandedTier(prev => prev === t ? null : t)

  return (
    <SLFrame glowColor={tierColor} style={{ padding: '14px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
          ☠ BOSS MENSAL
          {(boss.strengthMultiplier ?? 1) > 1 && (
            <span style={{ marginLeft: 6, color: '#e08040' }}>×{boss.strengthMultiplier.toFixed(2)}</span>
          )}
        </div>
        {defeated ? (
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--gold)', border: '1px solid rgba(240,192,64,0.5)', padding: '2px 8px', fontFamily: 'Rajdhani', fontWeight: 700 }}>
            DERROTADO
          </div>
        ) : (
          <div style={{
            fontSize: 9, letterSpacing: '0.12em', padding: '2px 8px',
            border: `1px solid ${tierColor}66`,
            color: tierColor, fontFamily: 'Rajdhani', fontWeight: 700,
            textShadow: tier !== 'none' ? `0 0 6px ${tierColor}` : 'none',
          }}>
            {TIER_LABELS[tier]}
          </div>
        )}
      </div>

      {/* Boss identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 36, filter: tier === 'none' && !defeated ? 'grayscale(1) opacity(0.35)' : 'none' }}>
          {boss.icon}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700,
            color: defeated ? 'var(--gold)' : tier === 'none' ? '#555' : 'var(--text-primary)',
            textShadow: defeated ? '0 0 10px var(--gold)' : 'none',
          }}>
            {boss.name}
          </div>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {defeated ? `RECOMPENSA: +${boss.rewXp} XP  +${boss.rewGold}G` : `HP: ${boss.hp} / ${boss.hpMax}`}
          </div>
        </div>
      </div>

      {/* 3 tier cards */}
      {!defeated && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            {tiers.map(t => (
              <TierCard
                key={t.key}
                tier={t.key}
                label={t.label}
                reqs={t.reqs}
                attrs={attrs}
                cap={t.cap}
                current={tier === t.key}
                selected={expandedTier === t.key}
                onClick={() => handleTierClick(t.key)}
              />
            ))}
          </div>

          {/* Tier detail expandido */}
          {expandedTier && (() => {
            const t = tiers.find(x => x.key === expandedTier)!
            return (
              <TierDetail
                tier={t.key}
                label={t.label}
                reqs={t.reqs}
                attrs={attrs}
                cap={t.cap}
              />
            )
          })()}
        </>
      )}

      {/* HP + Win chance (só se pode lutar) */}
      {!defeated && tier !== 'none' && (
        <>
          {/* HP Bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 7, background: 'rgba(40,10,10,0.8)', border: '1px solid rgba(220,64,64,0.3)', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '0 auto 0 0', width: `${hpPct}%`,
                background: hpPct > 50 ? 'linear-gradient(90deg,#a02020,#e04040)' : hpPct > 20 ? 'linear-gradient(90deg,#e04040,#ff8040)' : 'linear-gradient(90deg,#ff4040,#ffaa00)',
                boxShadow: '0 0 6px rgba(220,64,64,0.5)', transition: 'width 1s ease',
              }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 8, fontFamily: "'Share Tech Mono'", color: 'rgba(220,80,80,0.6)' }}>HP BOSS</span>
              <span style={{ fontSize: 8, fontFamily: "'Share Tech Mono'", color: 'rgba(220,80,80,0.6)' }}>{hpPct}%</span>
            </div>
          </div>

          {/* Win Chance Bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, alignItems: 'baseline' }}>
              <span style={{ fontSize: 9, fontFamily: 'Rajdhani', letterSpacing: '0.12em', color: tierColor }}>
                CHANCE DE VITÓRIA
              </span>
              <span style={{ fontSize: 13, fontFamily: "'Share Tech Mono'", fontWeight: 700, color: tierColor, textShadow: `0 0 8px ${tierColor}` }}>
                {winChance}%
              </span>
            </div>
            {/* Bar with cap marker */}
            <div style={{ height: 8, background: 'rgba(10,20,10,0.8)', border: `1px solid ${tierColor}33`, overflow: 'visible', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '0 auto 0 0', width: `${winChance}%`,
                background: `linear-gradient(90deg, ${tierColor}88, ${tierColor})`,
                boxShadow: `0 0 8px ${tierColor}`,
                transition: 'width 1.5s ease',
              }}/>
              {/* Cap marker */}
              <div style={{
                position: 'absolute', top: -3, bottom: -3,
                left: `${TIER_CAPS[tier]}%`,
                width: 1.5,
                background: tierColor,
                opacity: 0.7,
              }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 8, fontFamily: 'Rajdhani', color: 'var(--text-muted)' }}>
                {winChance === 0 ? 'Cause dano para aumentar a chance'
                  : winChance < TIER_CAPS[tier] ? `Dano atual limita a ${winChance}% — causa mais dano!`
                  : `Cap ${TIER_CAPS[tier]}% atingido com tier ${TIER_LABELS[tier].toLowerCase()}`}
              </span>
              <span style={{ fontSize: 8, fontFamily: 'Rajdhani', color: tierColor }}>cap {TIER_CAPS[tier]}%</span>
            </div>
          </div>

          {/* Condition */}
          <div style={{ padding: '7px 10px', background: 'rgba(40,10,10,0.4)', border: '1px solid rgba(220,64,64,0.2)', borderLeft: '2px solid rgba(220,64,64,0.5)' }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(220,80,80,0.6)', marginBottom: 2 }}>CONDIÇÃO DE DANO</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--text-secondary)' }}>{boss.damageConditionLabel}</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
              Recompensa: <span style={{ color: '#50e890' }}>+{boss.rewXp} XP</span>{' '}
              <span style={{ color: 'var(--gold)' }}>+{boss.rewGold}G</span>
            </div>
          </div>
        </>
      )}

      {/* Bloqueado */}
      {!defeated && tier === 'none' && (
        <div style={{ padding: '8px 10px', background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(80,80,100,0.2)', borderLeft: '2px solid #444' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: '#666' }}>
            Evolua seus atributos para entrar no tier Mínimo e começar a causar dano. Complete missões nas categorias exigidas.
          </div>
        </div>
      )}
    </SLFrame>
  )
}

// ── Dungeon Card ───────────────────────────────────────────────────────────

function DungeonCard({ dungeon: d, stats, totalMissions, keys, onOpenGate }: {
  dungeon: Dungeon
  stats: ReturnType<typeof usePlayerStore>['stats']
  totalMissions: number
  keys: number
  onOpenGate: (dungeonId: string) => { ok: boolean; reason?: string }
}) {
  const pct   = Math.round((d.currentFloor / d.totalFloors) * 100)
  const done  = d.currentFloor >= d.totalFloors
  const color = CAT_COLORS[d.relatedCategory] ?? 'var(--neon)'
  const glow  = done ? '#f0c040' : color

  // Próximo portão
  const gates      = DUNGEON_GATES[d.id] ?? []
  const nextGate   = gates.find(g => g.floor > d.currentFloor) ?? null

  // Portão imediatamente no próximo andar (bloqueando agora)
  const gateOnNext = gates.find(g => g.floor === d.currentFloor + 1)
  const reqMet     = gateOnNext ? checkGateRequirement(gateOnNext, stats, totalMissions) : true
  const isOpened   = gateOnNext ? (stats.openedGates ?? []).includes(`${d.id}:${d.currentFloor + 1}`) : true
  const isBlocked  = !!gateOnNext && (!reqMet || !isOpened)

  return (
    <SLFrame glowColor={isBlocked ? '#e08000' : glow}>
      <div style={{ padding: '12px 14px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 26 }}>{d.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
                color: done ? 'var(--gold)' : 'var(--text-primary)',
                textShadow: done ? '0 0 8px var(--gold)' : 'none',
              }}>
                {d.name}
              </span>
              {done && (
                <span style={{
                  fontSize: 9, letterSpacing: '0.2em', color: 'var(--gold)',
                  textShadow: '0 0 8px var(--gold)', fontFamily: 'Rajdhani', fontWeight: 700,
                  border: '1px solid rgba(240,192,64,0.4)', padding: '1px 6px',
                }}>
                  CONQUISTADA
                </span>
              )}
              {isBlocked && !done && (
                <span style={{
                  fontSize: 9, letterSpacing: '0.15em', color: '#e08000',
                  fontFamily: 'Rajdhani', fontWeight: 700,
                  border: '1px solid rgba(224,128,0,0.5)', padding: '1px 6px',
                }}>
                  🔒 PORTÃO
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, marginTop: 2, fontFamily: 'Rajdhani', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
              {d.description}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, background: 'rgba(20,40,100,0.8)',
          border: `1px solid ${isBlocked ? 'rgba(224,128,0,0.4)' : color + '44'}`,
          position: 'relative', overflow: 'hidden', marginBottom: 6,
        }}>
          <div style={{
            position: 'absolute', inset: '0 auto 0 0',
            width: `${pct}%`,
            background: done
              ? 'linear-gradient(90deg, #a08020, #f0c040)'
              : isBlocked
              ? 'linear-gradient(90deg, rgba(224,128,0,0.6), #e08000)'
              : `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${glow}`,
            transition: 'width 1s ease',
          }}/>
        </div>

        {/* Floor counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--text-muted)' }}>
          <span>Andar {d.currentFloor} / {d.totalFloors}</span>
          <span style={{ color: glow, textShadow: `0 0 6px ${glow}` }}>{pct}%</span>
        </div>

        {/* Gate indicator (portão próximo) */}
        {!done && nextGate && (
          <GateIndicator
            gate={nextGate}
            stats={stats}
            totalMissions={totalMissions}
            currentFloor={d.currentFloor}
            dungeonId={d.id}
            keys={keys}
            isOpened={(stats.openedGates ?? []).includes(`${d.id}:${nextGate.floor}`)}
            onOpenGate={onOpenGate}
          />
        )}
      </div>
    </SLFrame>
  )
}

// ── Gate Indicator ─────────────────────────────────────────────────────────

function GateIndicator({ gate, stats, totalMissions, currentFloor, dungeonId, keys, isOpened, onOpenGate }: {
  gate: FloorGate
  stats: ReturnType<typeof usePlayerStore>['stats']
  totalMissions: number
  currentFloor: number
  dungeonId: string
  keys: number
  isOpened: boolean
  onOpenGate: (dungeonId: string) => { ok: boolean; reason?: string }
}) {
  const met         = checkGateRequirement(gate, stats, totalMissions)
  const isNextBlock = gate.floor === currentFloor + 1  // bloqueia o próximo avanço

  // Estado do portão: aberto / pronto p/ abrir (req. atendido, falta chave) / bloqueado por requisito / futuro
  const readyToOpen = isNextBlock && met && !isOpened
  const opened      = isNextBlock && met && isOpened

  const color = opened ? 'var(--success)'
    : readyToOpen ? 'var(--gold)'
    : isNextBlock ? '#e08000'
    : 'var(--text-muted)'
  const bg = opened ? 'rgba(40,80,20,0.3)'
    : readyToOpen ? 'rgba(60,50,0,0.4)'
    : isNextBlock ? 'rgba(60,30,0,0.4)'
    : 'rgba(4,16,52,0.4)'

  const canAfford = keys >= 1

  return (
    <div style={{
      marginTop: 8,
      padding: '8px 10px',
      background: bg,
      border: `1px solid ${color}44`,
      borderLeft: `2px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{opened ? '✅' : readyToOpen ? '🔑' : isNextBlock ? '🔒' : gate.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color, textTransform: 'uppercase' }}>
            {opened ? 'Portão Aberto'
              : readyToOpen ? 'Pronto para abrir'
              : isNextBlock ? 'Portão Bloqueado'
              : `Portão — Andar ${gate.floor}`}
          </div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {gate.icon} {gate.label}{!isNextBlock ? ` (andar ${gate.floor})` : ''}
          </div>
        </div>
        {opened && (
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: 'var(--success)' }}>LIBERADO</div>
        )}
      </div>

      {/* Botão de abrir portão com chave */}
      {readyToOpen && (
        <button
          onClick={() => onOpenGate(dungeonId)}
          disabled={!canAfford}
          style={{
            marginTop: 8, width: '100%',
            padding: '7px 0',
            background: canAfford ? 'rgba(80,60,0,0.7)' : 'rgba(30,30,40,0.5)',
            border: `1px solid ${canAfford ? 'rgba(240,192,64,0.6)' : 'rgba(80,80,100,0.3)'}`,
            color: canAfford ? 'var(--gold)' : '#666',
            cursor: canAfford ? 'pointer' : 'default',
            fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
            textShadow: canAfford ? '0 0 8px rgba(240,192,64,0.5)' : 'none',
          }}
        >
          {canAfford ? '🔑 ABRIR PORTÃO (1 CHAVE)' : '🔒 SEM CHAVES — COMPLETE DIAS HONRADOS'}
        </button>
      )}
    </div>
  )
}
