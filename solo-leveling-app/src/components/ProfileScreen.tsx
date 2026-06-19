import { useState, useEffect, useRef } from 'react'
import SLFrame from './ui/SLFrame'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { getRankConfig, RANKS } from '../data/ranks'
import { useSounds } from '../hooks/useSounds'
import { useNotifications } from '../hooks/useNotifications'
import { triggerEvent, triggerBonusMission, triggerShadowEvo } from './shared/EventBus'
import { SHADOW_STAGES, getShadowStage } from '../data/shadowPath'
import SteampunkGoggles from './ui/SteampunkGoggles'
import ShadowPathPanel from './ShadowPathPanel'
import AdminPanel from './AdminPanel'
import { useAdmin } from '../hooks/useAdmin'
import { APP_VERSION } from '../App'
import AscensionOverlay from './AscensionOverlay'
import { TITLE_DEFS } from '../data/shop'

// ícone do título ativo (fallback se não tiver no def)
function getTitleDef(id: string) {
  return TITLE_DEFS.find(t => t.id === id)
}

// cores por "prestígio" do título (posição na lista)
function getTitleColor(id: string): string {
  const idx = TITLE_DEFS.findIndex(t => t.id === id)
  if (idx >= 15) return '#e0b0ff' // lendário
  if (idx >= 10) return '#f0c040' // épico/ouro
  if (idx >= 5)  return '#7dc8ff' // raro/azul
  return 'var(--text-secondary)'  // comum
}

export default function ProfileScreen() {
  const {
    stats, updateName, resetData, exportData, importData,
    setResetTime, setSleepTime, setSoundEnabled, ascend,
    equipTitle, syncTitles, applyEventReward, setDebugShadowStage,
  } = usePlayerStore()

  const fileRef = useRef<HTMLInputElement>(null)
  const [editing,        setEditing]        = useState(false)
  const [nameInput,      setNameInput]      = useState(stats.name)
  const [showReset,      setShowReset]      = useState(false)
  const [showAscension,  setShowAscension]  = useState(false)
  const [showAscConfirm, setShowAscConfirm] = useState(false)
  const [titleSection,   setTitleSection]   = useState(false)
  const [evoTestIdx,     setEvoTestIdx]     = useState(1)
  const sounds = useSounds()
  const rankCfg = getRankConfig(stats.rank)
  const shadowStage = getShadowStage(stats)
  const { unlocked: isAdmin } = useAdmin()

  const todayStr = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0')
  const todayLogged = stats.logs.some(l => l.date === todayStr)
  const notif = useNotifications(todayLogged)

  useEffect(() => {
    sounds.playSystemOpen()
    syncTitles()
  }, []) // eslint-disable-line

  const handleSave = () => {
    if (nameInput.trim()) updateName(nameInput.trim())
    setEditing(false)
  }

  const unlocked = stats.achievements.filter(a => a.unlocked)
  const locked   = stats.achievements.filter(a => !a.unlocked)

  const activeTitleDef = getTitleDef(stats.activeTitle)
  const titleColor = getTitleColor(stats.activeTitle)

  const unlockedTitleDefs = TITLE_DEFS.filter(t => stats.unlockedTitles.includes(t.id))
  const lockedTitleDefs   = TITLE_DEFS.filter(t => !stats.unlockedTitles.includes(t.id))

  return (
    <div style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', height: '100%' }}>
      {showAscension && (
        <AscensionOverlay monarcaLevel={stats.monarcaLevel} onDone={() => setShowAscension(false)} />
      )}

      {/* ── Avatar + Identidade ──────────────────────────────────── */}
      <SLFrame glowColor={rankCfg.color} style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

          {/* Emblema steampunk — identidade de Engenharia */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginBottom: 2 }}>
            <SteampunkGoggles width={104} />
            <span style={{
              fontFamily: 'Rajdhani, sans-serif', fontSize: 8, fontWeight: 700,
              letterSpacing: '0.35em', color: 'rgba(240,192,64,0.55)', textTransform: 'uppercase',
            }}>
              Engenharia ⚙ Sistema
            </span>
          </div>

          {/* Avatar = foto do estágio atual do Caminho das Sombras */}
          <div style={{
            position: 'relative', width: 92, height: 92,
            borderRadius: '50%',
            border: `2px solid ${shadowStage.color}`,
            boxShadow: `0 0 20px ${shadowStage.color}66, inset 0 0 20px ${shadowStage.color}22`,
            background: rankCfg.bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', fontSize: 40,
          }}>
            {/* fallback (ícone do estágio) atrás */}
            <span style={{ position: 'absolute' }}>{shadowStage.icon}</span>
            <img
              src={shadowStage.image}
              alt={shadowStage.name}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
                borderRadius: '50%', display: 'block',
              }}
            />
            {/* Badge de rank */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              minWidth: 22, height: 22, padding: '0 5px', borderRadius: 6,
              background: 'rgba(4,16,52,0.95)',
              border: `1px solid ${rankCfg.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, fontFamily: 'Rajdhani, sans-serif',
              color: rankCfg.color, textShadow: `0 0 6px ${rankCfg.color}`,
            }}>{stats.rank}</div>
          </div>

          {/* Nome */}
          {editing ? (
            <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 260 }}>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
                style={{
                  flex: 1, padding: '6px 12px',
                  background: 'rgba(4,16,52,0.9)',
                  border: '1px solid var(--neon)',
                  color: 'var(--text-primary)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: 15, fontWeight: 600,
                  letterSpacing: '0.04em',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(4,16,52,0.9)',
                  border: '1px solid var(--success)',
                  color: 'var(--success)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                }}
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setEditing(true); setNameInput(stats.name) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 20, fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.05em',
                textShadow: 'var(--neon-glow)',
              }}
            >
              {stats.name} <span style={{ fontSize: 13, color: 'var(--neon)' }}>✎</span>
            </button>
          )}

          {/* Título ativo */}
          {activeTitleDef && (
            <div style={{
              padding: '3px 14px',
              background: 'rgba(4,8,32,0.8)',
              border: `1px solid ${titleColor}55`,
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.18em',
              color: titleColor,
              textShadow: `0 0 8px ${titleColor}88`,
            }}>
              『 {activeTitleDef.name} 』
            </div>
          )}

          {/* Rank badge */}
          <div style={{
            padding: '4px 16px',
            border: `1px solid ${rankCfg.color}`,
            background: rankCfg.bgColor,
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.2em',
            color: rankCfg.color,
            textShadow: `0 0 10px ${rankCfg.color}`,
          }}>
            RANK {stats.rank} — {RANKS.find(r => r.rank === stats.rank)?.label}
          </div>

          {/* Strip de stats rápidos */}
          <div style={{
            display: 'flex', gap: 0,
            width: '100%', maxWidth: 280,
            border: '1px solid rgba(40,100,200,0.25)',
            overflow: 'hidden',
          }}>
            {[
              { label: 'NÍVEL', value: stats.level, color: 'var(--neon-bright)' },
              { label: 'STREAK', value: `${stats.currentStreak}d`, color: '#40e080' },
              { label: 'HONRA', value: stats.totalHonorDays, color: 'var(--gold)' },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center', padding: '6px 4px',
                background: 'rgba(4,16,52,0.5)',
                borderRight: i < 2 ? '1px solid rgba(40,100,200,0.2)' : 'none',
              }}>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 15, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Legenda dos eixos de progressão */}
          <div style={{
            fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)',
            letterSpacing: '0.03em', textAlign: 'center', lineHeight: 1.5,
            maxWidth: 300, marginTop: 2,
          }}>
            <span style={{ color: rankCfg.color }}>Rank</span> = poder geral (XP) ·{' '}
            <span style={{ color: '#b388ff' }}>Sombras</span> = evolução ·{' '}
            <span style={{ color: '#50e890' }}>Classe</span> = especialização
          </div>
        </div>
      </SLFrame>

      {/* ── Caminho das Sombras (evolução) ───────────────────────── */}
      <ShadowPathPanel stats={stats} />

      {/* ── Títulos ──────────────────────────────────────────────── */}
      <SLFrame style={{ padding: '12px 14px' }}>
        <button
          onClick={() => setTitleSection(v => !v)}
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 0,
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
            TÍTULOS — {stats.unlockedTitles.length}/{TITLE_DEFS.length} DESBLOQUEADOS
          </div>
          <span style={{ color: 'var(--neon-dim)', fontSize: 12 }}>{titleSection ? '▲' : '▼'}</span>
        </button>

        {titleSection && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {/* Desbloqueados */}
            {unlockedTitleDefs.map(t => {
              const active = stats.activeTitle === t.id
              const color = getTitleColor(t.id)
              return (
                <button
                  key={t.id}
                  onClick={() => equipTitle(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px',
                    background: active ? `${color}18` : 'rgba(4,16,52,0.4)',
                    border: `1px solid ${active ? color : 'rgba(40,100,200,0.2)'}`,
                    borderLeft: `2px solid ${active ? color : 'rgba(40,100,200,0.15)'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700,
                      color: active ? color : 'var(--text-secondary)',
                      textShadow: active ? `0 0 6px ${color}66` : 'none',
                      letterSpacing: '0.06em',
                    }}>
                      『 {t.name} 』
                    </div>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                      {t.description}
                    </div>
                  </div>
                  {active && (
                    <span style={{ fontSize: 10, color, fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: '0.1em', flexShrink: 0 }}>
                      ✦ ATIVO
                    </span>
                  )}
                </button>
              )
            })}

            {/* Bloqueados */}
            {lockedTitleDefs.length > 0 && (
              <div style={{ marginTop: 4, opacity: 0.35 }}>
                {lockedTitleDefs.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 12px',
                    background: 'rgba(4,16,52,0.2)',
                    border: '1px solid rgba(40,100,200,0.1)',
                    marginBottom: 4,
                    filter: 'grayscale(0.8)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                        ???
                      </div>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)' }}>
                        {t.description}
                      </div>
                    </div>
                    <span style={{ fontSize: 14 }}>🔒</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SLFrame>

      {/* ── Conquistas ───────────────────────────────────────────── */}
      <SLFrame style={{ padding: '12px 14px' }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.25em',
          color: 'var(--text-muted)',
          fontFamily: 'Rajdhani, sans-serif',
          marginBottom: 10,
        }}>
          CONQUISTAS — {unlocked.length}/{stats.achievements.length}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {unlocked.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              background: 'rgba(40,28,4,0.3)',
              border: '1px solid rgba(240,192,64,0.35)',
              borderLeft: '2px solid rgba(240,192,64,0.7)',
            }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--gold)',
                  textShadow: '0 0 6px rgba(240,192,64,0.4)',
                }}>
                  {a.name}
                </div>
                <div style={{
                  fontSize: 10, marginTop: 1,
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--text-muted)',
                }}>
                  {a.description}
                </div>
              </div>
              {a.unlockedAt && (
                <span style={{
                  fontFamily: "'Share Tech Mono'", fontSize: 9,
                  color: 'var(--text-muted)',
                }}>
                  {formatDate(a.unlockedAt)}
                </span>
              )}
            </div>
          ))}

          {locked.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              background: 'rgba(4,16,52,0.4)',
              border: '1px solid rgba(40,100,200,0.15)',
              opacity: 0.45,
              filter: 'grayscale(0.7)',
            }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                  ???
                </div>
                <div style={{ fontSize: 10, fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-muted)' }}>
                  {a.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SLFrame>

      {/* ── Legado Monarca ───────────────────────────────────────── */}
      {stats.monarcaLevel > 0 && (
        <SLFrame glowColor="rgba(240,192,64,0.6)" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(240,192,64,0.5)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
            👑 LEGADO MONARCA — NÍVEL {stats.monarcaLevel}
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 22, color: 'var(--gold)', textShadow: '0 0 12px rgba(240,192,64,0.6)' }}>
                {stats.monarcaLevel}
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ASCENSÕES</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 22, color: '#50e890', textShadow: '0 0 8px rgba(80,232,144,0.4)' }}>
                +{stats.monarcaLevel * 5}%
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>XP GLOBAL</div>
            </div>
          </div>
          {stats.ascensionLog.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {stats.ascensionLog.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '3px 8px',
                  background: 'rgba(40,28,4,0.3)',
                  border: '1px solid rgba(240,192,64,0.15)',
                  fontFamily: 'Rajdhani', fontSize: 10,
                  color: 'rgba(240,192,64,0.6)',
                  letterSpacing: '0.05em',
                }}>
                  <span>Ascensão #{i + 1} — Rank {entry.fromRank} Nv.{entry.fromLevel}</span>
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9 }}>{entry.date}</span>
                </div>
              ))}
            </div>
          )}
        </SLFrame>
      )}

      {/* ── Ascensão Monarca (só Rank S) ─────────────────────────── */}
      {stats.rank === 'S' && (
        <SLFrame glowColor="rgba(240,192,64,0.8)" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(240,192,64,0.6)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
            ◆ ASCENSÃO MONARCA DISPONÍVEL
          </div>
          <div style={{
            fontFamily: 'Rajdhani', fontSize: 12,
            color: 'rgba(200,220,255,0.7)', marginBottom: 12,
            lineHeight: 1.6,
          }}>
            Você atingiu o Rank S. O renascimento aguarda.<br/>
            XP, Nível e Masmorras serão zerados.<br/>
            <span style={{ color: '#50e890' }}>Conquistas, Relíquias, Títulos e Sombras permanecem.</span>
          </div>
          {!showAscConfirm ? (
            <button
              onClick={() => setShowAscConfirm(true)}
              style={{
                width: '100%', padding: '10px 0',
                background: 'rgba(40,28,4,0.5)',
                border: '1px solid rgba(240,192,64,0.7)',
                cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 13, fontWeight: 800, letterSpacing: '0.2em',
                color: 'var(--gold)',
                textShadow: '0 0 12px rgba(240,192,64,0.7)',
                textTransform: 'uppercase',
              }}
            >
              🌟 ASCENSÃO MONARCA
            </button>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 10, fontFamily: 'Rajdhani', fontSize: 12, color: 'rgba(240,192,64,0.9)', letterSpacing: '0.1em' }}>
                Confirmar renascimento?
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowAscConfirm(false)} style={{ ...btnStyle('var(--border)'), flex: 1 }}>CANCELAR</button>
                <button
                  onClick={() => { ascend(); setShowAscConfirm(false); setShowAscension(true) }}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: 'rgba(40,28,4,0.8)',
                    border: '1px solid rgba(240,192,64,0.8)',
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 13, fontWeight: 800, letterSpacing: '0.15em',
                    color: 'var(--gold)',
                    textShadow: '0 0 10px rgba(240,192,64,0.7)',
                  }}
                >
                  CONFIRMAR
                </button>
              </div>
            </div>
          )}
        </SLFrame>
      )}

      {/* ── Configurações ────────────────────────────────────────── */}
      <SLFrame style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
          CONFIGURAÇÕES DO SISTEMA
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Horário de Reset</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)' }}>Penalidade aplicada automaticamente</div>
            </div>
            <input type="time" value={stats.resetTime} onChange={e => setResetTime(e.target.value)} style={timeInputStyle} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Horário de Dormir</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)' }}>Referência pessoal</div>
            </div>
            <input type="time" value={stats.sleepTime} onChange={e => setSleepTime(e.target.value)} style={timeInputStyle} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Sons do Sistema</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)' }}>Efeitos sonoros ao completar missões</div>
            </div>
            <button
              onClick={() => setSoundEnabled(!stats.soundEnabled)}
              style={{
                padding: '5px 16px',
                background: stats.soundEnabled ? 'rgba(58,143,255,0.15)' : 'rgba(4,16,52,0.9)',
                border: `1px solid ${stats.soundEnabled ? 'var(--neon)' : 'rgba(40,100,200,0.3)'}`,
                color: stats.soundEnabled ? 'var(--neon-bright)' : 'var(--text-muted)',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                cursor: 'pointer',
                textShadow: stats.soundEnabled ? 'var(--neon-glow)' : 'none',
                minWidth: 70,
              }}
            >
              {stats.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Lembretes do System */}
          <div style={{ borderTop: '1px solid rgba(40,100,200,0.15)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>🔔 Lembretes do System</div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)' }}>
                  {!notif.supported ? 'Não suportado neste navegador'
                    : notif.permission === 'denied' ? 'Permissão bloqueada nas config. do navegador'
                    : 'Aviso diário para não esquecer as missões'}
                </div>
              </div>
              {notif.supported && notif.permission !== 'denied' && (
                <button
                  onClick={async () => {
                    if (notif.permission !== 'granted') {
                      const r = await notif.requestPermission()
                      if (r === 'granted') notif.setEnabled(true)
                    } else {
                      notif.setEnabled(!notif.enabled)
                    }
                  }}
                  style={{
                    padding: '5px 16px',
                    background: notif.enabled && notif.permission === 'granted' ? 'rgba(58,143,255,0.15)' : 'rgba(4,16,52,0.9)',
                    border: `1px solid ${notif.enabled && notif.permission === 'granted' ? 'var(--neon)' : 'rgba(40,100,200,0.3)'}`,
                    color: notif.enabled && notif.permission === 'granted' ? 'var(--neon-bright)' : 'var(--text-muted)',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                    cursor: 'pointer',
                    textShadow: notif.enabled && notif.permission === 'granted' ? 'var(--neon-glow)' : 'none',
                    minWidth: 70,
                  }}
                >
                  {notif.enabled && notif.permission === 'granted' ? 'ON' : 'OFF'}
                </button>
              )}
            </div>

            {/* Horário + teste (só quando ativo) */}
            {notif.supported && notif.permission === 'granted' && notif.enabled && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <input
                  type="time"
                  value={notif.reminderTime}
                  onChange={e => notif.setReminderTime(e.target.value)}
                  style={timeInputStyle}
                />
                <button
                  onClick={notif.sendTest}
                  style={{
                    padding: '5px 12px',
                    background: 'rgba(4,16,52,0.9)',
                    border: '1px solid rgba(180,120,255,0.5)',
                    color: 'rgba(200,160,255,0.9)',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >
                  TESTAR
                </button>
              </div>
            )}
          </div>
        </div>
      </SLFrame>

      {/* ── Acesso Admin ─────────────────────────────────────────── */}
      <AdminPanel />

      {/* ── Teste de Pop-ups (admin) ─────────────────────────────── */}
      {isAdmin && (
      <SLFrame glowColor="#b080ff" style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(180,128,255,0.7)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
          🧪 TESTE DE POP-UPS
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => triggerBonusMission({
              id: `bm_teste-${Date.now().toString(36)}`,
              name: 'Quest de Teste',
              icon: '⚡',
              description: 'Pop-up de teste disparado manualmente.',
              task: 'Confirme que este pop-up apareceu corretamente.',
              category: 'habito',
              xpReward: 50, goldReward: 15,
              issuedAt: todayStr, completed: false,
            })}
            style={btnStyle('rgba(180,128,255,0.6)')}
          >
            ⚡ QUEST SURPRESA
          </button>
          <button
            onClick={() => {
              const ev = {
                id: 'ev_teste',
                name: 'Evento de Teste',
                icon: '🔮',
                description: 'Pop-up de evento disparado manualmente.',
                xpBonus: 80, goldBonus: 20,
                triggeredAt: todayStr,
              }
              applyEventReward(ev)  // credita XP/gold como no fluxo real
              triggerEvent(ev)      // mostra o overlay
            }}
            style={btnStyle('rgba(64,200,216,0.6)')}
          >
            🔮 EVENTO
          </button>
        </div>
        <button
          onClick={() => {
            triggerShadowEvo(SHADOW_STAGES[evoTestIdx])
            setDebugShadowStage(evoTestIdx)   // reflete no painel Caminho das Sombras
            setEvoTestIdx(i => (i >= SHADOW_STAGES.length - 1 ? 0 : i + 1))
          }}
          style={{ ...btnStyle('rgba(155,123,255,0.6)'), width: '100%', marginTop: 8 }}
        >
          🌑 EVOLUÇÃO DAS SOMBRAS
        </button>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)', marginTop: 8, letterSpacing: '0.04em' }}>
          O botão de evolução cicla entre os estágios (Necromante → Lorde → Monarca → Player) e atualiza o painel + avatar. As pop-ups não afetam o sorteio diário.
        </div>
      </SLFrame>
      )}

      {/* ── Backup (admin) ──────────────────────────────────────── */}
      {isAdmin && (
      <SLFrame style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
          DADOS — BACKUP &amp; RESTAURAÇÃO
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportData} style={btnStyle('var(--neon)', true)}>↓ EXPORTAR JSON</button>
          <button onClick={() => fileRef.current?.click()} style={btnStyle('rgba(180,120,255,0.6)')}>↑ IMPORTAR JSON</button>
        </div>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) importData(f) }} />
      </SLFrame>
      )}

      {/* ── Log de Atividades ────────────────────────────────────── */}
      {stats.sysLog.length > 0 && (
        <SLFrame style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
            LOG DE ATIVIDADES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 220, overflowY: 'auto' }}>
            {stats.sysLog.slice(0, 20).map((entry, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 8px',
                background: i % 2 === 0 ? 'rgba(4,16,52,0.5)' : 'transparent',
                borderLeft: '1px solid rgba(40,100,200,0.2)',
              }}>
                <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>
                  {entry.text}
                </span>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                  {entry.xp !== undefined && <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: '#50e890' }}>+{entry.xp}xp</span>}
                  {entry.gold !== undefined && <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--gold)' }}>+{entry.gold}g</span>}
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: 'var(--text-muted)' }}>{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        </SLFrame>
      )}

      <div style={{ textAlign: 'center', fontFamily: "'Share Tech Mono'", fontSize: 9, color: 'rgba(40,100,200,0.3)', padding: '4px 0' }}>
        VSYSTEM · BETA {APP_VERSION}
      </div>

      {/* ── Reset (admin) ────────────────────────────────────────── */}
      {isAdmin && (
      <SLFrame glowColor="#e04040" style={{ padding: '12px 14px' }}>
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.2em',
              color: 'rgba(220,80,80,0.6)',
              textTransform: 'uppercase',
              padding: '4px 0',
            }}
          >
            Resetar Progresso
          </button>
        ) : (
          <div>
            <div style={{
              textAlign: 'center', marginBottom: 12,
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 12, letterSpacing: '0.1em',
              color: 'rgba(220,80,80,0.9)',
            }}>
              Isso apagará todo o progresso. Tem certeza?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowReset(false)} style={btnStyle('var(--border)')}>NO</button>
              <button onClick={() => { resetData(); setShowReset(false) }} style={btnStyle('var(--danger)', true)}>YES</button>
            </div>
          </div>
        )}
      </SLFrame>
      )}
    </div>
  )
}

const timeInputStyle: React.CSSProperties = {
  padding: '5px 10px',
  background: 'rgba(4,16,52,0.9)',
  border: '1px solid rgba(58,143,255,0.4)',
  color: 'var(--neon-bright)',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 14,
  outline: 'none',
  width: 110,
}

function btnStyle(borderColor: string, primary?: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '8px 0',
    background: primary ? 'rgba(4,16,52,0.9)' : 'rgba(6,18,60,0.9)',
    border: `1px solid ${borderColor}`,
    cursor: 'pointer',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: 14, fontWeight: 700, letterSpacing: '0.12em',
    color: primary ? 'var(--neon-bright)' : 'var(--text-secondary)',
    textShadow: primary ? 'var(--neon-glow)' : 'none',
  }
}

function formatDate(s: string) {
  const [,m,d] = s.split('-'); return `${d}/${m}`
}
