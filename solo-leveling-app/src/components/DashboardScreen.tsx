import { useState, useCallback, useEffect } from 'react'
import SLFrame    from './ui/SLFrame'
import XPBar      from './ui/XPBar'
import FloatXP    from './ui/FloatXP'
import MissionCard from './MissionCard'
import StatusPanel from './StatusPanel'
import FocusOverlay from './FocusOverlay'
import { Gear } from './ui/GearDecor'
import { getVerseOfDay } from '../data/verses'
import { getShadowStage } from '../data/shadowPath'
import { useAdmin } from '../hooks/useAdmin'
import { getTodayMissions, getRankProgress, checkHonorDay, todayDayOfWeek } from '../utils'
import { getRankConfig } from '../data/ranks'
import { TITLE_DEFS } from '../data/shop'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { useSounds } from '../hooks/useSounds'
import { useCountdown } from '../hooks/useCountdown'
import type { DayEndResult } from '../utils'
import ProphecyCard from './ProphecyCard'
import type { DayOfWeek, MissionCategory, MissionType, BonusMission } from '../types'

import { CAT_COLORS as CAT_COLOR } from '../data/categoryColors'

function ActiveBonusCard({ mission, onComplete }: { mission: BonusMission; onComplete: () => void }) {
  const color = CAT_COLOR[mission.category] ?? '#3a8fff'
  return (
    <div style={{
      padding: '12px 14px',
      background: `${color}0e`,
      border: `1px solid ${color}44`,
      borderTop: `2px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 18 }}>{mission.icon}</span>
        <div>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: 8,
            letterSpacing: '0.35em', color: `${color}bb`,
            textTransform: 'uppercase',
          }}>⚡ QUEST SURPRESA</div>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: 15,
            fontWeight: 800, color, letterSpacing: '0.04em',
          }}>{mission.name}</div>
        </div>
      </div>
      <div style={{
        fontFamily: 'Rajdhani, sans-serif', fontSize: 13,
        color: '#c8d8f0', lineHeight: 1.5,
      }}>
        {mission.task}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 13, color: '#50e890' }}>+{mission.xpReward} XP</span>
          {mission.goldReward > 0 && <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 13, color: 'var(--gold)' }}>+{mission.goldReward}G</span>}
        </div>
        {!mission.completed ? (
          <button
            onClick={onComplete}
            style={{
              padding: '5px 14px',
              background: `${color}22`,
              border: `1px solid ${color}66`,
              borderRadius: 3,
              color,
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 11, fontWeight: 800,
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            CONCLUIR ✓
          </button>
        ) : (
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: 11,
            color: '#50e890', letterSpacing: '0.1em',
          }}>✓ CONCLUÍDA</span>
        )}
      </div>
    </div>
  )
}

const DAY_PT: Record<string, string> = {
  seg:'Segunda-Feira',ter:'Terça-Feira',qua:'Quarta-Feira',
  qui:'Quinta-Feira',sex:'Sexta-Feira',sab:'Sábado',dom:'Domingo',
}

interface XPEvent { amount: number; positive: boolean; key: number }

interface Props {
  onDayEnd: (result: DayEndResult) => void
}

export default function DashboardScreen({ onDayEnd }: Props) {
  const { stats, toggleMission, toggleEffort, endDay, addCustomMission, deleteCustomMission, completeBonusMission } = usePlayerStore()
  const sounds = useSounds()
  const [showStatus,  setShowStatus]  = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showAddMission, setShowAddMission] = useState(false)
  const [missionDraft, setMissionDraft] = useState({
    name: '',
    icon: '⚔',
    type: 'secundaria' as MissionType,
    category: 'habito' as MissionCategory,
    xpReward: 15,
    xpPenalty: 0,
    estimatedMinutes: 10,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'] as DayOfWeek[],
  })
  const [xpEvent,     setXpEvent]     = useState<XPEvent | null>(null)
  const [dayResult,   setDayResult]   = useState<DayEndResult | null>(null)
  const [focusMission, setFocusMission] = useState<import('../types').Mission | null>(null)
  const [showVerse, setShowVerse] = useState(false)
  const verseOfDay = getVerseOfDay(new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0'))

  useEffect(() => { sounds.playSystemOpen() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const countdown = useCountdown(stats.resetTime)

  const todayMissions = getTodayMissions(stats.customMissions, stats.penaltyMissions)
  const principals    = todayMissions.filter(m => m.type === 'principal')
  const secundarias   = todayMissions.filter(m => m.type === 'secundaria')
  const bonus         = todayMissions.filter(m => m.type === 'bonus')
  const penalties     = todayMissions.filter(m => m.type === 'penalty')

  const { pct } = getRankProgress(stats.totalXp)
  const rankCfg = getRankConfig(stats.rank)
  const shadowStage = getShadowStage(stats)
  const { unlocked: isAdmin } = useAdmin()
  const activeTitleName = stats.activeTitle && stats.activeTitle !== 'iniciante'
    ? TITLE_DEFS.find(t => t.id === stats.activeTitle)?.name ?? ''
    : ''
  const isHonored = checkHonorDay(stats.todayCompleted, stats.customMissions)
  const today = todayDayOfWeek()
  const todayStr2 = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0')
  const todayLog = stats.logs.find(l => l.date === todayStr2)
  const todayLogged = !!todayLog

  const handleToggle = useCallback((id: string) => {
    const wasDone = stats.todayCompleted.includes(id)
    toggleMission(id)
    if (!wasDone) {
      sounds.playMissionComplete()
      const mission = todayMissions.find(m => m.id === id)
      if (mission) setXpEvent({ amount: mission.xpReward, positive: true, key: Date.now() })
    }
  }, [stats.todayCompleted, toggleMission, todayMissions, sounds])

  const completeFromFocus = useCallback((id: string) => {
    if (!stats.todayCompleted.includes(id)) handleToggle(id)
  }, [stats.todayCompleted, handleToggle])

  const handleEndDay = useCallback(() => {
    const result = endDay()
    setDayResult(result)
    onDayEnd(result)
    setShowConfirm(false)
    if (result.failedPrincipals.length > 0) sounds.playPenalty()
    if (result.honorBonus) sounds.playHonorOrRankUp()
  }, [endDay, onDayEnd, sounds])

  const handleDraftDay = (day: DayOfWeek) => {
    setMissionDraft(draft => ({
      ...draft,
      availableDays: draft.availableDays.includes(day)
        ? draft.availableDays.filter(d => d !== day)
        : [...draft.availableDays, day],
    }))
  }

  const handleAddMission = () => {
    if (!missionDraft.name.trim() || missionDraft.availableDays.length === 0) return
    addCustomMission({
      ...missionDraft,
      name: missionDraft.name.trim(),
      xpPenalty: missionDraft.type === 'principal' ? missionDraft.xpPenalty : 0,
    })
    setMissionDraft(d => ({ ...d, name: '' }))
    setShowAddMission(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingBottom: 80 }}>

      {/* Float XP */}
      {xpEvent && (
        <FloatXP key={xpEvent.key} amount={xpEvent.amount} positive={xpEvent.positive} onDone={() => setXpEvent(null)} />
      )}

      {/* Overlay de Foco / Pomodoro */}
      {focusMission && (
        <FocusOverlay
          mission={focusMission}
          onComplete={completeFromFocus}
          onClose={() => setFocusMission(null)}
        />
      )}

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 0' }}>
        <SLFrame style={{ padding: '12px 16px' }}>
          {/* Day label */}
          <div style={{
            fontSize: 9, letterSpacing: '0.3em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            fontFamily: 'Rajdhani, sans-serif',
            marginBottom: 4,
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            {DAY_PT[today]}
            <Gear size={12} color="rgba(125,200,255,0.55)" duration={12} />
          </div>

          {/* Name + rank */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              {/* Avatar = foto do estágio das sombras + anel do rank */}
              <div style={{
                width: 46, height: 46, flexShrink: 0,
                borderRadius: '50%',
                border: `2px solid ${rankCfg.color}`,
                boxShadow: `0 0 14px ${rankCfg.color}55, inset 0 0 12px ${rankCfg.color}22`,
                position: 'relative',
              }}>
                <img
                  src={shadowStage.image}
                  alt={shadowStage.name}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
                />
                {/* Badge do rank */}
                <div style={{
                  position: 'absolute', bottom: -4, right: -4,
                  minWidth: 16, height: 16, padding: '0 3px',
                  borderRadius: 4,
                  background: 'rgba(2,8,28,0.97)',
                  border: `1px solid ${rankCfg.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800,
                  fontFamily: 'Rajdhani, sans-serif',
                  color: rankCfg.color,
                  textShadow: `0 0 6px ${rankCfg.color}`,
                  letterSpacing: '0.02em',
                }}>
                  {stats.rank}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: 21, fontWeight: 700,
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.04em',
                  lineHeight: 1.05,
                }}>
                  {stats.name}
                </div>
                {activeTitleName && (
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    fontFamily: 'Rajdhani, sans-serif',
                    color: 'rgba(240,192,64,0.85)',
                    textShadow: '0 0 6px rgba(240,192,64,0.4)',
                    letterSpacing: '0.08em',
                    lineHeight: 1.3,
                    marginTop: 1,
                  }}>
                    『{activeTitleName}』
                  </div>
                )}
                <div style={{
                  fontSize: 10,
                  fontFamily: "'Share Tech Mono', monospace",
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}>
                  LVL {stats.level} · {stats.totalXp.toLocaleString()} XP
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isHonored && (
                <div style={{
                  fontSize: 10, letterSpacing: '0.12em',
                  color: 'var(--gold)',
                  textShadow: '0 0 8px rgba(240,192,64,0.6)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  border: '1px solid rgba(240,192,64,0.4)',
                  padding: '2px 8px',
                }}>
                  ✦ HONRADO
                </div>
              )}
              <button
                onClick={() => setShowStatus(s => !s)}
                style={{
                  fontSize: 10, letterSpacing: '0.14em',
                  color: 'var(--neon-bright)',
                  textShadow: 'var(--neon-glow)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  border: '1px solid var(--border)',
                  padding: '2px 10px',
                  background: 'rgba(4,16,52,0.6)',
                  cursor: 'pointer',
                }}
              >
                {showStatus ? 'FECHAR' : 'STATUS'}
              </button>
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 9,
              fontFamily: "'Share Tech Mono', monospace",
              color: 'var(--text-muted)',
              marginBottom: 4,
            }}>
              <span>XP TOTAL</span>
              <span>{pct}%</span>
            </div>
            <XPBar pct={pct} />
          </div>

          {/* Streak + Gold + Countdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {stats.currentStreak > 0 && (
                <div style={{
                  fontSize: 10, fontFamily: 'Rajdhani, sans-serif',
                  color: 'rgba(240,192,64,0.8)', letterSpacing: '0.08em',
                }}>
                  🔥 STREAK: {stats.currentStreak} dias
                </div>
              )}
              {stats.gold > 0 && (
                <div style={{
                  fontSize: 10, fontFamily: "'Share Tech Mono', monospace",
                  color: 'var(--gold)', textShadow: '0 0 6px var(--gold)',
                }}>
                  ◈ {stats.gold}G
                </div>
              )}
            </div>
            {!todayLogged && (
              <div style={{
                fontSize: 10, fontFamily: "'Share Tech Mono', monospace",
                color: 'rgba(160,120,255,0.8)',
                letterSpacing: '0.06em',
              }}>
                ⏱ {countdown}
              </div>
            )}
          </div>
        </SLFrame>
      </div>

      {/* Status Panel (collapsible) */}
      {showStatus && (
        <div style={{ padding: '10px 16px 0' }} className="fade-in-up">
          <StatusPanel stats={stats} />
        </div>
      )}

      {/* Versículo do dia (recolhível) */}
      <div style={{ padding: '10px 16px 0' }}>
        <button
          onClick={() => setShowVerse(v => !v)}
          style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: 'rgba(40,30,6,0.35)', border: '1px solid rgba(240,208,96,0.25)',
            borderLeft: '2px solid rgba(240,208,96,0.6)', padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>✝️</span>
          <span style={{ flex: 1, fontFamily: 'Rajdhani', fontSize: 12, color: 'rgba(230,220,180,0.9)', lineHeight: 1.4 }}>
            {showVerse
              ? <>“{verseOfDay.text}” <span style={{ color: 'rgba(240,208,96,0.8)' }}>({verseOfDay.ref})</span></>
              : 'Versículo do dia'}
          </span>
          <span style={{ color: 'rgba(240,208,96,0.6)', fontSize: 11 }}>{showVerse ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* ── Profecia Ativa ── */}
      {stats.activeProphecy && !stats.activeProphecy.failed && (
        <ProphecyCard prophecy={stats.activeProphecy} />
      )}

      {/* ── Quests Surpresa Ativas ── */}
      {!todayLogged && stats.activeBonusMissions.map(mission => (
        <div key={mission.id} style={{ padding: '10px 16px 0' }}>
          <SLFrame glowColor={CAT_COLOR[mission.category] ?? '#3a8fff'}>
            <ActiveBonusCard
              mission={mission}
              onComplete={() => completeBonusMission(mission.id)}
            />
          </SLFrame>
        </div>
      ))}

      {/* ── Mission Sections ── */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {isAdmin && (
        <SLFrame glowColor="#40c8d8">
          <button
            onClick={() => setShowAddMission(s => !s)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#7de8f0',
              textShadow: '0 0 8px #40c8d8',
              textTransform: 'uppercase',
            }}
          >
            {showAddMission ? 'Fechar criação' : '+ Nova Missão'}
          </button>
          {showAddMission && (
            <MissionForm
              draft={missionDraft}
              onChange={setMissionDraft}
              onToggleDay={handleDraftDay}
              onSubmit={handleAddMission}
            />
          )}
        </SLFrame>
        )}

        <MissionSection
          title="⚠ MISSÕES PRINCIPAIS"
          subtitle="penalidade se falhar"
          missions={principals}
          completed={stats.todayCompleted}
          onToggle={handleToggle}
          onDelete={isAdmin ? deleteCustomMission : undefined}
          glowColor="#dc6464"
          headerColor="rgba(220,80,80,0.8)"
          headerBg="rgba(60,10,10,0.4)"
          bonusEffort={stats.todayBonusEffort}
          onFocus={setFocusMission}
          onEffort={toggleEffort}
        />

        <MissionSection
          title="◈ MISSÕES SECUNDÁRIAS"
          subtitle="sem penalidade"
          missions={secundarias}
          completed={stats.todayCompleted}
          onToggle={handleToggle}
          onDelete={isAdmin ? deleteCustomMission : undefined}
          glowColor="#3a8fff"
          headerColor="var(--neon-bright)"
          headerBg="rgba(4,16,52,0.5)"
          bonusEffort={stats.todayBonusEffort}
          onFocus={setFocusMission}
          onEffort={toggleEffort}
        />

        {bonus.length > 0 && (
          <MissionSection
            title="★ MISSÕES BÔNUS"
            subtitle="só ganho"
            missions={bonus}
            completed={stats.todayCompleted}
            onToggle={handleToggle}
            onDelete={isAdmin ? deleteCustomMission : undefined}
            glowColor="#f0c040"
            headerColor="var(--gold)"
            headerBg="rgba(40,28,4,0.4)"
            bonusEffort={stats.todayBonusEffort}
          onFocus={setFocusMission}
            onEffort={toggleEffort}
          />
        )}

        {penalties.length > 0 && (
          <MissionSection
            title="💀 MISSÕES DE PENALIDADE"
            subtitle="complete para expiar"
            missions={penalties}
            completed={stats.todayCompleted}
            onToggle={handleToggle}
            glowColor="#9040c0"
            headerColor="rgba(200,100,255,0.9)"
            headerBg="rgba(30,10,50,0.5)"
          />
        )}

        {/* Weekly missions */}
        {stats.weeklyMissions.length > 0 && (
          <WeeklyPanel missions={stats.weeklyMissions} />
        )}
      </div>

      {/* ── Encerrar Dia ── */}
      <div style={{ padding: '14px 16px 0' }}>
        {!todayLogged && !showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="end-day-btn"
            style={{
              width: '100%', padding: '18px',
              background: 'linear-gradient(135deg, rgba(58,143,255,0.25), rgba(120,80,232,0.25))',
              border: '1px solid var(--neon)',
              borderTop: '2px solid var(--neon-bright)',
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 18, fontWeight: 800,
              letterSpacing: '0.22em',
              color: 'var(--neon-bright)',
              textShadow: '0 0 14px var(--neon)',
              textTransform: 'uppercase',
              boxShadow: '0 0 24px rgba(58,143,255,0.35), inset 0 0 24px rgba(58,143,255,0.08)',
            }}
          >
            ⚔ Encerrar o Dia
          </button>
        )}

        {showConfirm && (
          <SLFrame glowColor="#f0c040" className="fade-in-up">
            <div style={{ padding: '16px' }}>
              <div style={{
                textAlign: 'center', marginBottom: 12,
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 13, letterSpacing: '0.15em',
                color: 'var(--text-secondary)',
              }}>
                Missões não concluídas serão registradas como falha.
                <br/>Confirmar encerramento?
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: 'rgba(6,18,60,0.9)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: 'var(--text-secondary)',
                  }}
                >
                  NO
                </button>
                <button
                  onClick={handleEndDay}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: 'rgba(6,18,60,0.9)',
                    border: '1px solid var(--success)',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: 'var(--success)',
                    textShadow: '0 0 8px var(--success)',
                    boxShadow: '0 0 10px rgba(64,224,128,0.15)',
                  }}
                >
                  YES
                </button>
              </div>
            </div>
          </SLFrame>
        )}

        {/* Day result */}
        {todayLogged && (() => {
          const xpEarned = dayResult?.xpEarned ?? todayLog!.totalXpEarned
          const xpLost   = dayResult?.xpLost   ?? todayLog!.totalXpLost
          const honored  = dayResult?.honorBonus ?? todayLog!.honoredDay
          const failed   = dayResult?.failedPrincipals.length ?? todayLog!.failedPrincipals.length
          return (
            <SLFrame glowColor="#40e080" className="fade-in-up" style={{ padding: '14px 16px' }}>
              <div style={{
                fontSize: 9, letterSpacing: '0.25em',
                color: 'var(--success)',
                textShadow: '0 0 8px var(--success)',
                fontFamily: 'Rajdhani, sans-serif',
                marginBottom: 8,
              }}>
                ◆ DIA ENCERRADO ◆
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 13, color: '#50e890' }}>
                  +{xpEarned} XP
                </span>
                {xpLost > 0 && (
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 13, color: 'var(--danger)' }}>
                    -{xpLost} XP
                  </span>
                )}
                {honored && (
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 13, color: 'var(--gold)' }}>
                    ✦ DIA HONRADO
                  </span>
                )}
              </div>
              {failed > 0 && (
                <div style={{
                  marginTop: 6, fontSize: 11,
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'rgba(220,80,80,0.8)',
                  letterSpacing: '0.05em',
                }}>
                  ⚠ {failed} missão(ões) principal(is) não cumprida(s)
                </div>
              )}
            </SLFrame>
          )
        })()}
      </div>
    </div>
  )
}

/* ── Weekly Panel ────────────────────────────────────────────────────── */

function WeeklyPanel({ missions }: { missions: import('../types').WeeklyMission[] }) {
  const done = missions.filter(m => m.completed).length
  return (
    <SLFrame glowColor="#f0c040">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(40,28,4,0.4)',
        borderBottom: '1px solid rgba(240,192,64,0.2)',
      }}>
        <span style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
          color: 'var(--gold)', textShadow: '0 0 8px rgba(240,192,64,0.4)',
        }}>
          ★ MISSÕES SEMANAIS
        </span>
        <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono'", color: 'var(--text-muted)' }}>
          {done}/{missions.length} completas
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {missions.map((wm, i) => {
          const pct = Math.min(100, Math.round((wm.progress / wm.goal) * 100))
          return (
            <div key={wm.id} style={{
              padding: '10px 14px',
              borderTop: i === 0 ? 'none' : '1px solid rgba(240,192,64,0.1)',
              opacity: wm.completed ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>
                  {wm.completed ? '✅' : wm.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700,
                    color: wm.completed ? 'var(--success)' : 'var(--text-primary)',
                    letterSpacing: '0.02em',
                    textDecoration: wm.completed ? 'line-through' : 'none',
                  }}>
                    {wm.name}
                  </div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {wm.description}
                  </div>
                  <div style={{ height: 3, background: 'rgba(40,28,4,0.8)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', inset: '0 auto 0 0',
                      width: `${pct}%`,
                      background: wm.completed
                        ? 'var(--success)'
                        : 'linear-gradient(90deg, rgba(240,192,64,0.6), var(--gold))',
                      boxShadow: wm.completed ? '0 0 4px var(--success)' : '0 0 4px rgba(240,192,64,0.5)',
                      transition: 'width 0.6s ease',
                    }}/>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: 'var(--gold)' }}>
                    {wm.progress}/{wm.goal}
                  </div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)' }}>
                    +{wm.xpReward}xp
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </SLFrame>
  )
}

/* ── Section ─────────────────────────────────────────────────────────── */

interface SectionProps {
  title: string
  subtitle: string
  missions: import('../types').Mission[]
  completed: string[]
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  glowColor: string
  headerColor: string
  headerBg: string
  bonusEffort?: string[]
  onEffort?: (id: string) => void
  onFocus?: (mission: import('../types').Mission) => void
}

function MissionSection({ title, subtitle, missions, completed, onToggle, onDelete, glowColor, headerColor, headerBg, bonusEffort, onEffort, onFocus }: SectionProps) {
  if (missions.length === 0) return null
  const pending = missions.filter(m => !completed.includes(m.id)).length

  return (
    <SLFrame glowColor={glowColor}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: headerBg,
        borderBottom: `1px solid ${glowColor}44`,
      }}>
        <span style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.2em',
          color: headerColor,
          textShadow: `0 0 8px ${glowColor}`,
        }}>
          {title}
        </span>
        <span style={{
          fontSize: 9,
          fontFamily: "'Share Tech Mono', monospace",
          color: 'var(--text-muted)',
        }}>
          {subtitle} · {pending}/{missions.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {missions.map((m, i) => (
          <div key={m.id} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(40,100,200,0.12)' }}>
            <MissionCard
              mission={m}
              done={completed.includes(m.id)}
              onToggle={onToggle}
              onDelete={onDelete}
              effortActive={bonusEffort?.includes(m.id)}
              onEffort={onEffort}
              onFocus={onFocus}
            />
          </div>
        ))}
      </div>
    </SLFrame>
  )
}

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'seg', label: 'S' },
  { id: 'ter', label: 'T' },
  { id: 'qua', label: 'Q' },
  { id: 'qui', label: 'Q' },
  { id: 'sex', label: 'S' },
  { id: 'sab', label: 'S' },
  { id: 'dom', label: 'D' },
]

function MissionForm({ draft, onChange, onToggleDay, onSubmit }: {
  draft: {
    name: string
    icon: string
    type: MissionType
    category: MissionCategory
    xpReward: number
    xpPenalty: number
    estimatedMinutes: number
    availableDays: DayOfWeek[]
  }
  onChange: React.Dispatch<React.SetStateAction<typeof draft>>
  onToggleDay: (day: DayOfWeek) => void
  onSubmit: () => void
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    minWidth: 0,
    padding: '8px 10px',
    background: 'rgba(4,16,52,0.9)',
    border: '1px solid rgba(64,200,216,0.35)',
    color: 'var(--text-primary)',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: 13,
    outline: 'none',
  }

  return (
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 8 }}>
        <input value={draft.icon} onChange={e => onChange(d => ({ ...d, icon: e.target.value.slice(0, 2) || '⚔' }))} style={inputStyle} />
        <input value={draft.name} placeholder="Nome da missão" onChange={e => onChange(d => ({ ...d, name: e.target.value }))} style={inputStyle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <select value={draft.type} onChange={e => onChange(d => ({ ...d, type: e.target.value as MissionType, xpPenalty: e.target.value === 'principal' ? Math.max(d.xpPenalty, 10) : 0 }))} style={inputStyle}>
          <option value="principal">Principal</option>
          <option value="secundaria">Secundária</option>
          <option value="bonus">Bônus</option>
        </select>
        <select value={draft.category} onChange={e => onChange(d => ({ ...d, category: e.target.value as MissionCategory }))} style={inputStyle}>
          <option value="estudo">Estudo</option>
          <option value="amor">Amor</option>
          <option value="fe">Fé</option>
          <option value="saude">Saúde</option>
          <option value="ingles">Inglês</option>
          <option value="habito">Hábito</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: draft.type === 'principal' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
        <input type="number" min={1} value={draft.xpReward} onChange={e => onChange(d => ({ ...d, xpReward: Number(e.target.value) || 1 }))} style={inputStyle} aria-label="XP" />
        {draft.type === 'principal' && (
          <input type="number" min={0} value={draft.xpPenalty} onChange={e => onChange(d => ({ ...d, xpPenalty: Number(e.target.value) || 0 }))} style={inputStyle} aria-label="Penalidade" />
        )}
        <input type="number" min={0} value={draft.estimatedMinutes} onChange={e => onChange(d => ({ ...d, estimatedMinutes: Number(e.target.value) || 0 }))} style={inputStyle} aria-label="Minutos" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {DAYS.map(day => {
          const active = draft.availableDays.includes(day.id)
          return (
            <button
              key={day.id}
              onClick={() => onToggleDay(day.id)}
              style={{
                height: 28,
                background: active ? 'rgba(64,200,216,0.22)' : 'rgba(4,16,52,0.6)',
                border: `1px solid ${active ? '#40c8d8' : 'rgba(64,200,216,0.25)'}`,
                color: active ? '#7de8f0' : 'var(--text-muted)',
                fontFamily: "'Share Tech Mono', monospace",
                cursor: 'pointer',
              }}
            >
              {day.label}
            </button>
          )
        })}
      </div>

      <button
        onClick={onSubmit}
        style={{
          padding: '9px 0',
          background: 'rgba(6,18,60,0.9)',
          border: '1px solid #40c8d8',
          color: '#7de8f0',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Criar Missão
      </button>
    </div>
  )
}
