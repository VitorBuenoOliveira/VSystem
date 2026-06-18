import { useEffect, useState } from 'react'
import SLFrame from './ui/SLFrame'
import { Gear } from './ui/GearDecor'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { PERKS, TITLE_DEFS, CONSUMABLES } from '../data/shop'
import { useSounds } from '../hooks/useSounds'
import { toast } from './shared/Toast'

type Tab = 'perks' | 'items' | 'titles'

const TAB_LABELS: Record<Tab, string> = {
  perks:  '⚡ Perks',
  items:  '🧪 Itens',
  titles: '◈ Títulos',
}

export default function ShopScreen() {
  const { stats, buyPerk, equipTitle, syncTitles, buyConsumable, useConsumable } = usePlayerStore()
  const sounds = useSounds()
  const [tab, setTab] = useState<Tab>('perks')

  useEffect(() => {
    sounds.playSystemOpen()
    syncTitles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuyPerk = (perkId: string, perkName: string, cost: number) => {
    if (stats.gold < cost) { toast(`◈ Ouro insuficiente! Precisa de ${cost}G`, 'error'); return }
    if (buyPerk(perkId)) { sounds.playHonorOrRankUp(); toast(`✦ ${perkName} adquirido!`, 'honor') }
  }

  const handleBuyItem = (itemId: string, itemName: string, cost: number) => {
    if (stats.gold < cost) { toast(`◈ Ouro insuficiente! Precisa de ${cost}G`, 'error'); return }
    if (buyConsumable(itemId)) { sounds.playMissionComplete(); toast(`🧪 ${itemName} comprado!`, 'success') }
  }

  const handleUseItem = (itemId: string, itemName: string) => {
    if (useConsumable(itemId)) { sounds.playHonorOrRankUp(); toast(`✨ ${itemName} usado!`, 'honor') }
  }

  const handleEquip = (titleId: string, titleName: string) => {
    equipTitle(titleId)
    toast(`◈ Título equipado: ${titleName}`, 'success')
  }

  // Agrupa perks por categoria
  const perkCategories = [...new Set(PERKS.map(p => p.category ?? 'Geral'))]
  const ownedConsumables = stats.ownedConsumables ?? {}

  return (
    <div style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <SLFrame glowColor="#f0c040" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: 4 }}>
              SISTEMA — LOJA
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              Loja do Caçador
              <Gear size={15} color="rgba(240,192,64,0.65)" duration={10} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 20, fontWeight: 700, color: 'var(--gold)', textShadow: '0 0 12px rgba(240,192,64,0.6)' }}>
              ◈ {stats.gold}G
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>OURO DISPONÍVEL</div>
          </div>
        </div>
      </SLFrame>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(40,100,200,0.3)' }}>
        {(['perks', 'items', 'titles'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px 0',
            background: tab === t ? 'rgba(58,143,255,0.12)' : 'rgba(4,16,52,0.8)',
            border: 'none',
            borderBottom: tab === t ? '2px solid var(--neon)' : '2px solid transparent',
            fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            color: tab === t ? 'var(--neon-bright)' : 'var(--text-muted)',
            textShadow: tab === t ? 'var(--neon-glow)' : 'none',
            cursor: 'pointer', textTransform: 'uppercase',
          }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── PERKS ── */}
      {tab === 'perks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {perkCategories.map(cat => (
            <SLFrame key={cat} style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
                {cat.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PERKS.filter(p => (p.category ?? 'Geral') === cat).map(perk => {
                  const owned = stats.ownedPerks.includes(perk.id)
                  const canBuy = !owned && stats.gold >= perk.cost
                  return (
                    <div key={perk.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                      background: owned ? 'rgba(40,60,20,0.3)' : 'rgba(4,16,52,0.6)',
                      border: `1px solid ${owned ? 'rgba(64,224,128,0.35)' : 'rgba(40,100,200,0.2)'}`,
                      borderLeft: `2px solid ${owned ? 'var(--success)' : canBuy ? 'var(--gold)' : 'rgba(40,100,200,0.2)'}`,
                      opacity: !owned && stats.gold < perk.cost ? 0.55 : 1,
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{perk.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: owned ? 'var(--success)' : 'var(--text-primary)', letterSpacing: '0.02em' }}>
                          {perk.name}
                        </div>
                        <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                          {perk.description}
                        </div>
                      </div>
                      {owned ? (
                        <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--success)', letterSpacing: '0.12em', border: '1px solid rgba(64,224,128,0.4)', padding: '3px 8px', flexShrink: 0 }}>
                          ATIVO
                        </div>
                      ) : (
                        <button onClick={() => handleBuyPerk(perk.id, perk.name, perk.cost)} disabled={!canBuy} style={{
                          padding: '5px 10px', flexShrink: 0,
                          background: canBuy ? 'rgba(40,28,4,0.6)' : 'rgba(4,16,52,0.8)',
                          border: `1px solid ${canBuy ? 'var(--gold)' : 'rgba(40,100,200,0.2)'}`,
                          color: canBuy ? 'var(--gold)' : 'var(--text-muted)',
                          fontFamily: "'Share Tech Mono'", fontSize: 11, fontWeight: 700,
                          cursor: canBuy ? 'pointer' : 'not-allowed',
                          textShadow: canBuy ? '0 0 6px var(--gold)' : 'none',
                        }}>
                          {perk.cost}G
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </SLFrame>
          ))}
          <div style={{ padding: '8px 10px', background: 'rgba(4,16,52,0.6)', border: '1px solid rgba(40,100,200,0.2)', fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            💡 Perks são melhorias permanentes. Ouro vem de dias honrados e bosses derrotados.
          </div>
        </div>
      )}

      {/* ── ITENS ── */}
      {tab === 'items' && (
        <SLFrame style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
            ITENS CONSUMÍVEIS — USO ÚNICO
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CONSUMABLES.map(item => {
              const qty = ownedConsumables[item.id] ?? 0
              const canBuy = stats.gold >= item.cost
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  background: 'rgba(4,16,52,0.6)',
                  border: '1px solid rgba(40,100,200,0.2)',
                  borderLeft: `2px solid ${qty > 0 ? 'var(--neon)' : canBuy ? 'rgba(240,192,64,0.5)' : 'rgba(40,100,200,0.2)'}`,
                  opacity: !canBuy && qty === 0 ? 0.5 : 1,
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                      {item.name}
                      {qty > 0 && <span style={{ marginLeft: 8, fontFamily: "'Share Tech Mono'", fontSize: 11, color: 'var(--neon-bright)' }}>×{qty}</span>}
                    </div>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                      {item.description}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => handleBuyItem(item.id, item.name, item.cost)} disabled={!canBuy} style={{
                      padding: '4px 8px',
                      background: canBuy ? 'rgba(40,28,4,0.6)' : 'rgba(4,16,52,0.8)',
                      border: `1px solid ${canBuy ? 'var(--gold)' : 'rgba(40,100,200,0.2)'}`,
                      color: canBuy ? 'var(--gold)' : 'var(--text-muted)',
                      fontFamily: "'Share Tech Mono'", fontSize: 10,
                      cursor: canBuy ? 'pointer' : 'not-allowed',
                    }}>
                      {item.cost}G
                    </button>
                    {qty > 0 && (
                      <button onClick={() => handleUseItem(item.id, item.name)} style={{
                        padding: '4px 8px',
                        background: 'rgba(58,143,255,0.15)',
                        border: '1px solid var(--neon)',
                        color: 'var(--neon-bright)',
                        fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.1em',
                      }}>
                        USAR
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(4,16,52,0.6)', border: '1px solid rgba(40,100,200,0.2)', fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            💡 Itens consumíveis são usados uma vez. Podem ser acumulados em estoque.
          </div>
        </SLFrame>
      )}

      {/* ── TÍTULOS ── */}
      {tab === 'titles' && (
        <SLFrame style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
            TÍTULOS — {stats.unlockedTitles.length}/{TITLE_DEFS.length} DESBLOQUEADOS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TITLE_DEFS.map(def => {
              const unlocked = stats.unlockedTitles.includes(def.id)
              const active   = stats.activeTitle === def.id
              return (
                <div key={def.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: active ? 'rgba(40,28,4,0.4)' : unlocked ? 'rgba(4,16,52,0.6)' : 'rgba(4,8,24,0.5)',
                  border: `1px solid ${active ? 'rgba(240,192,64,0.5)' : unlocked ? 'rgba(40,100,200,0.3)' : 'rgba(20,40,80,0.3)'}`,
                  opacity: unlocked ? 1 : 0.4,
                  filter: unlocked ? 'none' : 'grayscale(0.8)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: active ? 'var(--gold)' : unlocked ? 'var(--text-primary)' : 'var(--text-muted)', textShadow: active ? '0 0 8px rgba(240,192,64,0.5)' : 'none', letterSpacing: '0.03em' }}>
                      {unlocked ? `「${def.name}」` : '???'}
                    </div>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                      {def.description}
                    </div>
                  </div>
                  {unlocked && (
                    active ? (
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em', border: '1px solid rgba(240,192,64,0.5)', padding: '3px 10px', flexShrink: 0 }}>
                        EQUIPADO
                      </div>
                    ) : (
                      <button onClick={() => handleEquip(def.id, def.name)} style={{
                        padding: '4px 12px', flexShrink: 0,
                        background: 'rgba(4,16,52,0.8)',
                        border: '1px solid rgba(58,143,255,0.4)',
                        color: 'var(--neon-bright)',
                        fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700,
                        letterSpacing: '0.1em', cursor: 'pointer',
                      }}>
                        EQUIPAR
                      </button>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </SLFrame>
      )}
    </div>
  )
}
