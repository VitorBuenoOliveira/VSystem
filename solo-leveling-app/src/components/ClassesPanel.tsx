import { useState } from 'react'
import SLFrame from './ui/SLFrame'
import { CLASS_DEFS, meetsClassRequirements } from '../data/classes'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { calcAttributes } from '../utils'
import type { ClassDef } from '../data/classes'

export default function ClassesPanel() {
  const { stats, selectClass } = usePlayerStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const attrs = calcAttributes(stats)

  return (
    <SLFrame style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
        ◆ SISTEMA DE CLASSES
      </div>

      {stats.activeClass && (
        <div style={{
          marginBottom: 10, padding: '8px 12px',
          background: `${CLASS_DEFS.find(c => c.id === stats.activeClass)?.color ?? '#3a8fff'}18`,
          border: `1px solid ${CLASS_DEFS.find(c => c.id === stats.activeClass)?.color ?? '#3a8fff'}55`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>{CLASS_DEFS.find(c => c.id === stats.activeClass)?.icon}</span>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(180,200,240,0.5)', fontFamily: 'Rajdhani' }}>CLASSE ATIVA</div>
            <div style={{
              fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 800,
              color: CLASS_DEFS.find(c => c.id === stats.activeClass)?.color,
              letterSpacing: '0.05em',
            }}>
              {CLASS_DEFS.find(c => c.id === stats.activeClass)?.name}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CLASS_DEFS.map(cls => {
          const unlocked = stats.unlockedClasses.includes(cls.id)
          const meets = meetsClassRequirements(cls, attrs, stats)
          const active = stats.activeClass === cls.id
          const isExpanded = expanded === cls.id

          return (
            <div key={cls.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : cls.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px',
                  background: active
                    ? `${cls.color}20`
                    : unlocked
                    ? 'rgba(4,16,52,0.8)'
                    : 'rgba(4,8,24,0.6)',
                  border: `1px solid ${active ? cls.color + '88' : unlocked ? cls.color + '33' : 'rgba(40,60,100,0.3)'}`,
                  borderLeft: `2px solid ${unlocked ? cls.color : 'rgba(40,60,100,0.3)'}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 20, filter: unlocked ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                  {cls.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 800,
                    color: unlocked ? cls.color : 'rgba(100,120,160,0.5)',
                    letterSpacing: '0.04em',
                  }}>
                    {cls.name}
                    {active && <span style={{ fontSize: 9, marginLeft: 8, letterSpacing: '0.2em' }}>● ATIVA</span>}
                    {!unlocked && meets && <span style={{ fontSize: 9, marginLeft: 8, color: '#50e890', letterSpacing: '0.15em' }}>DISPONÍVEL</span>}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'Rajdhani', color: 'var(--text-muted)' }}>
                    {cls.description}
                  </div>
                </div>
                <span style={{ color: 'rgba(100,140,200,0.5)', fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(4,8,24,0.8)',
                  border: `1px solid ${cls.color}22`,
                  borderTop: 'none',
                }}>
                  {/* Lore */}
                  <div style={{
                    fontFamily: 'Rajdhani', fontSize: 12,
                    color: 'rgba(180,200,240,0.6)',
                    fontStyle: 'italic',
                    marginBottom: 10, lineHeight: 1.5,
                  }}>
                    "{cls.lore}"
                  </div>

                  {/* Requisitos */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 4 }}>
                      REQUISITOS
                    </div>
                    <RequirementsList cls={cls} attrs={attrs} stats={stats} />
                  </div>

                  {/* Bônus */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 4 }}>
                      BÔNUS DA CLASSE
                    </div>
                    {cls.bonusLabels.map((b, i) => (
                      <div key={i} style={{ fontSize: 11, fontFamily: 'Rajdhani', color: cls.color, marginBottom: 2 }}>
                        ✦ {b}
                      </div>
                    ))}
                  </div>

                  {/* Botão */}
                  {unlocked && !active && (
                    <button
                      onClick={() => { selectClass(cls.id); setExpanded(null) }}
                      style={{
                        width: '100%', padding: '8px 0',
                        background: `${cls.color}22`,
                        border: `1px solid ${cls.color}66`,
                        color: cls.color,
                        fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 800,
                        letterSpacing: '0.15em', cursor: 'pointer',
                        textShadow: `0 0 8px ${cls.color}66`,
                      }}
                    >
                      EQUIPAR CLASSE
                    </button>
                  )}
                  {!unlocked && (
                    <div style={{
                      textAlign: 'center', fontSize: 10,
                      color: meets ? '#50e890' : 'rgba(100,120,160,0.5)',
                      fontFamily: 'Rajdhani', letterSpacing: '0.15em',
                      padding: '6px 0',
                    }}>
                      {meets ? '✓ REQUISITOS ATENDIDOS — abra o app novamente' : '🔒 BLOQUEADA'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SLFrame>
  )
}

function RequirementsList({ cls, attrs, stats }: {
  cls: ClassDef
  attrs: ReturnType<typeof calcAttributes>
  stats: ReturnType<typeof usePlayerStore>['stats']
}) {
  const RANK_ORDER = ['F','E','D','C','B','A','S'] as const
  const req = cls.requirements
  const items: { label: string; met: boolean }[] = []

  if (req.minAttr) {
    const ATTR_LABEL: Record<string, string> = {
      forca: 'Força', inteligencia: 'INT', espiritual: 'SPR', carisma: 'CHA', vitalidade: 'VIT'
    }
    for (const [k, v] of Object.entries(req.minAttr)) {
      const cur = attrs[k as keyof typeof attrs]
      items.push({ label: `${ATTR_LABEL[k] ?? k} ≥ ${v} (atual: ${cur})`, met: cur >= v })
    }
  }
  if (req.minRank) {
    items.push({
      label: `Rank ${req.minRank} (atual: ${stats.rank})`,
      met: RANK_ORDER.indexOf(stats.rank as typeof RANK_ORDER[number]) >= RANK_ORDER.indexOf(req.minRank as typeof RANK_ORDER[number]),
    })
  }
  if (req.minStreak !== undefined) {
    items.push({ label: `Streak ≥ ${req.minStreak} dias (atual: ${stats.currentStreak})`, met: stats.currentStreak >= req.minStreak })
  }
  if (req.minHonorDays !== undefined) {
    items.push({ label: `${req.minHonorDays} Dias Honrados (atual: ${stats.totalHonorDays})`, met: stats.totalHonorDays >= req.minHonorDays })
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{
          fontSize: 11, fontFamily: 'Rajdhani',
          color: item.met ? '#50e890' : 'rgba(180,100,100,0.8)',
          marginBottom: 2,
        }}>
          {item.met ? '✓' : '✗'} {item.label}
        </div>
      ))}
    </div>
  )
}
