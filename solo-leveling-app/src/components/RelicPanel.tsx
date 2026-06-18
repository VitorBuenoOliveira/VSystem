import SLFrame from './ui/SLFrame'
import { RARITY_COLOR, RARITY_LABEL } from '../data/relics'
import { usePlayerStore } from '../hooks/usePlayerStore'
import type { Relic } from '../types'

export default function RelicPanel() {
  const { stats, equipRelic, unequipRelic } = usePlayerStore()
  const inventory = stats.relicInventory ?? []
  const equipped = stats.equippedRelics ?? []

  if (inventory.length === 0) {
    return (
      <SLFrame style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
          ◆ RELÍQUIAS
        </div>
        <div style={{
          textAlign: 'center', padding: '20px 0',
          fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text-muted)',
        }}>
          Nenhuma relíquia ainda.<br/>
          <span style={{ fontSize: 11, color: 'rgba(80,130,200,0.4)' }}>
            Derrote bosses para obter relíquias.
          </span>
        </div>
      </SLFrame>
    )
  }

  const equippedItems = inventory.filter(r => equipped.includes(r.id))
  const unequippedItems = inventory.filter(r => !equipped.includes(r.id))

  return (
    <SLFrame style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
          ◆ RELÍQUIAS
        </div>
        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'rgba(100,150,220,0.6)' }}>
          {equipped.length}/3 equipadas
        </div>
      </div>

      {/* Slots equipados */}
      {equippedItems.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#50e890', fontFamily: 'Rajdhani', marginBottom: 4 }}>
            EQUIPADAS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {equippedItems.map(r => (
              <RelicCard key={r.id} relic={r} equipped
                onAction={() => unequipRelic(r.id)}
                actionLabel="REMOVER"
              />
            ))}
          </div>
        </div>
      )}

      {/* Inventário */}
      {unequippedItems.length > 0 && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 4 }}>
            INVENTÁRIO
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {unequippedItems.map(r => (
              <RelicCard key={r.id} relic={r}
                onAction={() => equipRelic(r.id)}
                actionLabel={equipped.length >= 3 ? 'CHEIO' : 'EQUIPAR'}
                disabled={equipped.length >= 3}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: 10, padding: '6px 10px',
        background: 'rgba(4,16,52,0.5)',
        border: '1px solid rgba(40,80,180,0.2)',
        fontSize: 9, fontFamily: 'Rajdhani',
        color: 'var(--text-muted)', letterSpacing: '0.05em',
      }}>
        Comum: boss pessoal (30%) · Rara: boss mensal (100%) · Lendária: profecia
      </div>
    </SLFrame>
  )
}

function RelicCard({ relic, equipped, onAction, actionLabel, disabled }: {
  relic: Relic
  equipped?: boolean
  onAction: () => void
  actionLabel: string
  disabled?: boolean
}) {
  const color = RARITY_COLOR[relic.rarity]
  const rarLabel = RARITY_LABEL[relic.rarity]

  const bonusText = Object.entries(relic.bonuses).map(([k, v]) => {
    if (k === 'weeklyKeyBonus')       return `+${v} 🔑/semana`
    if (k === 'globalXpMult')         return `+${Math.round(((v as number)-1)*100)}% XP global`
    if (k === 'bossWinChanceBonus')   return `+${v}% chance boss mensal`
    if (k === 'shadowPowerBonus')     return `+${v} poder/sombra`
    if (k === 'honorDayBonusXp')      return `+${v} XP Dia Honrado`
    if (k === 'penaltyCancelPerWeek') return `Cancela ${v} penalidade/sem.`
    if (k === 'bossDamageMult')       return `+${Math.round(((v as number)-1)*100)}% dano boss`
    if (k === 'ascensionLevelBonus')  return `+${v} nível de ascensão`
    if (k === 'xpMultByCategory') {
      return Object.entries(v as Record<string,number>).map(([cat, m]) =>
        `+${Math.round((m-1)*100)}% XP ${cat}`
      ).join(', ')
    }
    return null
  }).filter(Boolean).join(' · ')

  return (
    <div style={{
      padding: '8px 10px',
      background: equipped ? `${color}12` : 'rgba(4,8,24,0.6)',
      border: `1px solid ${color}${equipped ? '66' : '33'}`,
      borderLeft: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 20 }}>{relic.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 800,
            color, letterSpacing: '0.03em',
          }}>
            {relic.name}
          </span>
          <span style={{
            fontSize: 7, letterSpacing: '0.2em',
            color, fontFamily: 'Rajdhani',
            border: `1px solid ${color}55`, padding: '0 4px',
          }}>
            {rarLabel}
          </span>
        </div>
        <div style={{ fontSize: 10, fontFamily: "'Share Tech Mono'", color: '#50e890' }}>
          {bonusText}
        </div>
      </div>
      <button
        onClick={disabled ? undefined : onAction}
        disabled={disabled}
        style={{
          padding: '4px 8px',
          background: disabled ? 'rgba(40,40,60,0.4)' : `${color}22`,
          border: `1px solid ${disabled ? 'rgba(60,70,100,0.3)' : color + '55'}`,
          color: disabled ? 'rgba(100,110,140,0.4)' : color,
          fontFamily: 'Rajdhani', fontSize: 9, fontWeight: 800,
          letterSpacing: '0.1em', cursor: disabled ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {actionLabel}
      </button>
    </div>
  )
}
