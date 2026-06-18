import { useState, useEffect } from 'react'
import SLFrame from './ui/SLFrame'
import { Gear } from './ui/GearDecor'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { calcAreaScore, calcAreaDetail, calcMonarcaScore } from '../utils'
import { useSounds } from '../hooks/useSounds'

interface VidaAreaDef {
  id: string
  name: string
  icon: string
  description: string
  color: string
  hint: string
}

const VIDA_AREAS: VidaAreaDef[] = [
  {
    id: 'relacionamento',
    name: 'Relacionamento',
    icon: '❤️',
    description: 'Amor e cuidado com ela',
    color: '#e06080',
    hint: 'Ex: Ser o namorado que ela merece todos os dias',
  },
  {
    id: 'espiritual',
    name: 'Espiritual',
    icon: '🙏',
    description: 'Fé e conexão com Deus',
    color: '#a080ff',
    hint: 'Ex: Orar todo dia e me aproximar da Palavra',
  },
  {
    id: 'saude',
    name: 'Saúde & Corpo',
    icon: '🏋️',
    description: 'Corpo saudável e energia',
    color: '#40c880',
    hint: 'Ex: Treinar 3x por semana e beber 2L de água',
  },
  {
    id: 'conhecimento',
    name: 'Conhecimento',
    icon: '📚',
    description: 'Estudos e crescimento profissional',
    color: '#40a8ff',
    hint: 'Ex: Me tornar cientista de dados em 18 meses',
  },
]

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r      = (size - 8) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(40,100,200,0.15)" strokeWidth={5}/>
      {/* Progress */}
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 0.8s ease' }}
      />
      {/* Label */}
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 16, fontWeight: 700,
          fill: color,
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      >
        {score}
      </text>
    </svg>
  )
}

export default function VidaScreen() {
  const { stats, setVidaGoal } = usePlayerStore()
  const sounds = useSounds()
  const [editingArea, setEditingArea] = useState<string | null>(null)
  const [goalDraft,   setGoalDraft]   = useState('')

  useEffect(() => { sounds.playSystemOpen() }, []) // eslint-disable-line

  const monarcaScore = calcMonarcaScore(stats)
  const daysConsidered = Math.min(14, stats.logs.length)
  const daysLabel = daysConsidered === 0
    ? 'sem dias registrados'
    : daysConsidered === 1
      ? 'último 1 dia'
      : `últimos ${daysConsidered} dias`

  const handleEditGoal = (areaId: string) => {
    setGoalDraft(stats.vidaGoals[areaId] ?? '')
    setEditingArea(areaId)
  }

  const handleSaveGoal = (areaId: string) => {
    setVidaGoal(areaId, goalDraft.trim())
    setEditingArea(null)
  }

  return (
    <div style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', height: '100%' }}>

      {/* ── BARRA MONARCA ── */}
      <SLFrame glowColor="#f0c040" style={{ padding: '16px' }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.35em',
          color: 'var(--text-muted)', fontFamily: 'Rajdhani',
          textTransform: 'uppercase', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          ◆ ÍNDICE MONARCA
          <Gear size={13} color="rgba(240,192,64,0.55)" duration={10} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          {/* Big ring */}
          <ScoreRing score={monarcaScore} color="#f0c040" size={90} />

          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 22, fontWeight: 900,
              color: 'var(--gold)',
              textShadow: '0 0 20px rgba(240,192,64,0.6)',
              letterSpacing: '0.03em',
              lineHeight: 1.1,
            }}>
              {monarcaScore < 20  ? 'Dormindo'  :
               monarcaScore < 40  ? 'Acordando' :
               monarcaScore < 60  ? 'Evoluindo' :
               monarcaScore < 80  ? 'Caçador'   :
               monarcaScore < 95  ? 'Elite'      : 'Monarca'}
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Score composto de todas as áreas da vida
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Rank', value: (['F','E','D','C','B','A','S'].indexOf(stats.rank) / 6) * 100, color: '#a080ff' },
            { label: 'Streak', value: Math.min(100, (stats.longestStreak / 30) * 100), color: '#f0c040' },
            { label: 'Honra', value: Math.min(100, (stats.totalHonorDays / 50) * 100), color: '#40e080' },
            { label: 'VIDA', value: Math.round(VIDA_AREAS.reduce((s, a) => s + calcAreaScore(a.id, stats), 0) / VIDA_AREAS.length), color: '#40a8ff' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', width: 42, flexShrink: 0, letterSpacing: '0.08em' }}>
                {label}
              </span>
              <div style={{ flex: 1, height: 4, background: 'rgba(20,40,100,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: '0 auto 0 0',
                  width: `${Math.round(value)}%`,
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                  transition: 'width 0.8s ease',
                }}/>
              </div>
              <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color, width: 30, textAlign: 'right', flexShrink: 0 }}>
                {Math.round(value)}%
              </span>
            </div>
          ))}
        </div>
      </SLFrame>

      {/* ── ÁREA CARDS ── */}
      <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', paddingLeft: 2 }}>
        ÁREAS DA VIDA — {daysLabel.toUpperCase()}
      </div>

      {VIDA_AREAS.map(area => {
        const detail   = calcAreaDetail(area.id, stats)
        const score    = detail.score
        const goal     = stats.vidaGoals[area.id] ?? ''
        const isEdit   = editingArea === area.id

        return (
          <SLFrame key={area.id} glowColor={area.color} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <ScoreRing score={score} color={area.color} size={72} />

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{area.icon}</span>
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 15, fontWeight: 700,
                    color: area.color,
                    textShadow: `0 0 8px ${area.color}`,
                    letterSpacing: '0.03em',
                  }}>
                    {area.name}
                  </div>
                </div>

                <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {area.description}
                </div>

                {/* Score bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ height: 4, background: 'rgba(20,40,100,0.5)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', inset: '0 auto 0 0',
                      width: `${score}%`,
                      background: `linear-gradient(90deg, ${area.color}88, ${area.color})`,
                      boxShadow: `0 0 8px ${area.color}`,
                      transition: 'width 0.8s ease',
                    }}/>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 3, fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)',
                  }}>
                    <span>Taxa de conclusão ({daysLabel})</span>
                    <span style={{ color: area.color }}>
                      {detail.total > 0 ? `${score}% · ${detail.done}/${detail.total}` : 'sem missões'}
                    </span>
                  </div>
                </div>

                {/* Goal */}
                {isEdit ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      autoFocus
                      value={goalDraft}
                      onChange={e => setGoalDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal(area.id); if (e.key === 'Escape') setEditingArea(null) }}
                      placeholder={area.hint}
                      style={{
                        flex: 1, padding: '5px 10px',
                        background: 'rgba(4,16,52,0.9)',
                        border: `1px solid ${area.color}66`,
                        color: 'var(--text-primary)',
                        fontFamily: 'Rajdhani, sans-serif', fontSize: 12,
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleSaveGoal(area.id)}
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(4,16,52,0.9)',
                        border: `1px solid ${area.color}`,
                        color: area.color, fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.08em',
                      }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditGoal(area.id)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '5px 8px',
                      background: goal ? `${area.color}0d` : 'rgba(4,16,52,0.5)',
                      border: `1px solid ${goal ? area.color + '33' : 'rgba(40,100,200,0.2)'}`,
                      color: goal ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontFamily: 'Rajdhani, sans-serif', fontSize: 11,
                      cursor: 'pointer', letterSpacing: '0.02em',
                    }}
                  >
                    {goal ? `🎯 ${goal}` : `✎ Definir meta para ${area.name.toLowerCase()}…`}
                  </button>
                )}
              </div>
            </div>
          </SLFrame>
        )
      })}

      {/* Info */}
      <div style={{
        padding: '8px 12px',
        background: 'rgba(4,16,52,0.5)',
        border: '1px solid rgba(40,100,200,0.2)',
        fontFamily: 'Rajdhani', fontSize: 10,
        color: 'var(--text-muted)', letterSpacing: '0.05em',
      }}>
        💡 Os scores consideram só os dias que você encerrou (até 14). 100% significa que você completou as missões da área nesses dias — quanto mais dias acumular, mais real fica o índice.
      </div>
    </div>
  )
}
