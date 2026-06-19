import SLFrame from './ui/SLFrame'
import { getRankConfig } from '../data/ranks'
import { calcAttributes, calcVitals } from '../utils'
import { Gear } from './ui/GearDecor'
import { getShadowStage, getShadowProgress } from '../data/shadowPath'
import { TITLE_DEFS } from '../data/shop'
import type { PlayerStats, PlayerAttributes } from '../types'

// ── Os 5 atributos reais do sistema (iguais aos da aba Stats) ──────────
const ATTRS: { key: keyof PlayerAttributes; label: string; icon: string; color: string }[] = [
  { key: 'forca',        label: 'Força',        icon: '⚔', color: '#e05050' },
  { key: 'inteligencia', label: 'Inteligência', icon: '📖', color: '#40a8ff' },
  { key: 'espiritual',   label: 'Espiritual',   icon: '✦', color: '#b080ff' },
  { key: 'carisma',      label: 'Carisma',      icon: '❤', color: '#f06090' },
  { key: 'vitalidade',   label: 'Vitalidade',   icon: '🛡', color: '#40c880' },
]

interface Props { stats: PlayerStats }

export default function StatusPanel({ stats }: Props) {
  const rankCfg  = getRankConfig(stats.rank)
  const attrs    = calcAttributes(stats)
  const vitals   = calcVitals(stats)
  const shadow   = getShadowStage(stats)
  const shadowProg = getShadowProgress(stats)

  const titleName = TITLE_DEFS.find(t => t.id === stats.activeTitle)?.name ?? rankCfg.label

  return (
    <SLFrame style={{ padding: '14px 16px' }}>
      {/* Title */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.3em',
        color: 'var(--neon-bright)',
        textShadow: '0 0 10px var(--neon), 0 0 24px rgba(58,143,255,0.3)',
        marginBottom: 10,
        textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        ◆ Status ◆
        <Gear size={15} color="rgba(125,200,255,0.7)" duration={9} />
      </div>

      <div className="sl-divider"/>

      {/* Avatar + identidade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
        <div style={{
          width: 54, height: 54, flexShrink: 0,
          borderRadius: '50%',
          border: `2px solid ${rankCfg.color}`,
          boxShadow: `0 0 16px ${rankCfg.color}55, inset 0 0 14px ${rankCfg.color}22`,
          overflow: 'hidden', position: 'relative',
          background: rankCfg.bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>
          <span style={{ position: 'absolute' }}>{shadow.icon}</span>
          <img
            src={shadow.image}
            alt={shadow.name}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 18, fontWeight: 700,
            fontFamily: 'Rajdhani, sans-serif',
            color: 'var(--text-primary)',
            letterSpacing: '0.03em', lineHeight: 1.1,
          }}>
            {stats.name}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            fontFamily: 'Rajdhani, sans-serif',
            color: 'rgba(240,192,64,0.85)',
            textShadow: '0 0 6px rgba(240,192,64,0.4)',
            letterSpacing: '0.06em', marginTop: 1,
          }}>
            『{titleName}』
          </div>
        </div>
        <div style={{
          padding: '4px 12px',
          border: `1px solid ${rankCfg.color}`,
          background: rankCfg.bgColor,
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 14, fontWeight: 800,
          letterSpacing: '0.1em',
          color: rankCfg.color,
          textShadow: `0 0 10px ${rankCfg.color}`,
        }}>
          {stats.rank}
        </div>
      </div>

      <div className="sl-divider"/>

      {/* Caminho das Sombras (resumo) */}
      <div style={{
        margin: '4px 0 2px', padding: '8px 10px',
        background: `${shadow.color}10`,
        border: `1px solid ${shadow.color}40`,
        borderLeft: `2px solid ${shadow.color}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, filter: `drop-shadow(0 0 5px ${shadow.color})` }}>{shadow.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>
              Caminho das Sombras
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: shadow.color, textShadow: `0 0 6px ${shadow.color}66`, letterSpacing: '0.02em' }}>
              {shadow.name}
            </div>
          </div>
        </div>
        {shadowProg.next && (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 8, fontFamily: 'Rajdhani', color: 'var(--text-muted)' }}>→ {shadowProg.next.name}</span>
              <span style={{ fontSize: 8, fontFamily: "'Share Tech Mono'", color: shadowProg.next.color }}>{shadowProg.label}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(20,40,100,0.7)', border: `1px solid ${shadowProg.next.color}33`, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${shadowProg.pct}%`, background: shadowProg.next.color, boxShadow: `0 0 5px ${shadowProg.next.color}`, transition: 'width 0.8s ease' }}/>
            </div>
          </div>
        )}
      </div>

      <div className="sl-divider"/>

      {/* Level / Rank label */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, margin: '10px 0' }}>
        <InfoBlock label="Level" value={String(stats.level)} mono />
        <InfoBlock
          label="Classe" value={rankCfg.label} valueSize={11}
          style={{ color: rankCfg.color, textShadow: `0 0 8px ${rankCfg.color}` }}
        />
      </div>

      <div className="sl-divider"/>

      {/* HP / MP bars — reais (vitais por comportamento recente) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0' }}>
        <BarRow label="HP" pct={vitals.hpPct} color="#40e080" glow="#40e080" current={vitals.hp} max={vitals.hpMax} />
        <BarRow label="MP" pct={vitals.mpPct} color="#3a8fff" glow="#3a8fff" current={vitals.mp} max={vitals.mpMax} />
      </div>
      <div style={{ fontSize: 8, fontFamily: 'Rajdhani', color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: -2 }}>
        HP = saúde física · MP = energia mental/espiritual (últimos 7 dias)
      </div>

      <div className="sl-divider"/>

      {/* Atributos reais (iguais à aba Stats) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
        {ATTRS.map(a => (
          <StatBlock key={a.key} icon={a.icon} label={a.label} color={a.color} value={attrs[a.key]} />
        ))}
      </div>
    </SLFrame>
  )
}

function InfoBlock({ label, value, mono, valueSize, style }: {
  label: string; value: string; mono?: boolean; valueSize?: number; style?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{
        fontSize: valueSize ?? 13,
        fontWeight: 700,
        fontFamily: mono ? "'Share Tech Mono', monospace" : 'Rajdhani, sans-serif',
        color: 'var(--text-primary)',
        letterSpacing: mono ? '0.05em' : '0.02em',
        ...style,
      }}>
        {value}
      </span>
    </div>
  )
}

function BarRow({ label, pct, color, glow, current, max }: {
  label: string; pct: number; color: string; glow: string; current: number; max: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 22, fontSize: 10, fontWeight: 700,
        fontFamily: 'Rajdhani, sans-serif',
        letterSpacing: '0.12em',
        color,
        textShadow: `0 0 6px ${glow}`,
      }}>{label}</span>
      <div style={{ flex: 1, position: 'relative', height: 5, background: 'rgba(20,40,100,0.8)', border: `1px solid ${color}33` }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: color === '#40e080'
            ? 'linear-gradient(90deg, #1a6040, #40e080)'
            : 'linear-gradient(90deg, #1a3a80, #3a8fff)',
          boxShadow: `0 0 6px ${glow}`,
          transition: 'width 0.8s ease',
        }}/>
      </div>
      <span style={{
        fontSize: 9, fontFamily: "'Share Tech Mono', monospace",
        color: 'var(--text-muted)', whiteSpace: 'nowrap',
      }}>
        {current}/{max}
      </span>
    </div>
  )
}

function StatBlock({ icon, label, color, value }: { icon: string; label: string; color: string; value: number }) {
  return (
    <div style={{
      background: 'rgba(4,16,52,0.7)',
      border: '1px solid rgba(40,100,200,0.25)',
      borderLeft: `2px solid ${color}`,
      padding: '7px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{ fontSize: 18, lineHeight: 1, filter: `drop-shadow(0 0 4px ${color})` }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          fontSize: 9, letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontFamily: 'Rajdhani, sans-serif',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 19, fontWeight: 700,
          fontFamily: "'Share Tech Mono', monospace",
          color,
          textShadow: `0 0 8px ${color}`,
          lineHeight: 1,
        }}>
          {value}
        </span>
      </div>
    </div>
  )
}
