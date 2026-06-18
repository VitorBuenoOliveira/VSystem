import type { ShadowTierLabel, Boss } from '../types'

export interface ShadowTierConfig {
  days: number
  tier: ShadowTierLabel
  icon: string
  powerMult: number
  color: string
}

export const SHADOW_TIERS: ShadowTierConfig[] = [
  { days: 21,  tier: 'Comum',      icon: '🌑', powerMult: 1.0, color: 'rgba(140,160,200,0.8)' },
  { days: 50,  tier: 'Elite',      icon: '⚔️', powerMult: 1.6, color: 'rgba(80,180,255,0.9)'  },
  { days: 100, tier: 'General',    icon: '🛡️', powerMult: 2.8, color: 'rgba(180,120,255,0.9)' },
  { days: 180, tier: 'Marechal',   icon: '⚜️', powerMult: 4.5, color: 'rgba(255,140,60,0.95)' },
  { days: 270, tier: 'Comandante', icon: '🗡️', powerMult: 7.0, color: 'rgba(220,60,60,0.95)'  },
  { days: 365, tier: 'Monarca',    icon: '👑', powerMult: 12.0, color: 'rgba(240,192,64,1)'   },
]

export function getShadowTierConfig(daysTotal: number): ShadowTierConfig {
  let result = SHADOW_TIERS[0]
  for (const t of SHADOW_TIERS) {
    if (daysTotal >= t.days) result = t
  }
  return result
}

export function getShadowPower(basePower: number, daysTotal: number): number {
  return Math.round(basePower * getShadowTierConfig(daysTotal).powerMult)
}

// Qual é o próximo tier e quantos dias faltam
export function nextTierInfo(daysTotal: number): { tier: ShadowTierLabel; daysLeft: number } | null {
  for (const t of SHADOW_TIERS) {
    if (daysTotal < t.days) return { tier: t.tier, daysLeft: t.days - daysTotal }
  }
  return null
}

// Boss padrão ao iniciar
export const DEFAULT_BOSS: Boss = {
  name: 'A Versão Medíocre de Mim',
  icon: '☠️',
  hpMax: 1200,
  hp: 1200,
  defeated: false,
  rewXp: 200,
  rewGold: 100,
  createdAt: new Date().toISOString().slice(0, 10),
}

// Nomes automáticos das sombras baseado no tipo de missão
export function shadowNameFor(missionName: string): string {
  const templates = [
    'Sombra do ', 'Espírito de ', 'Eco de ', 'Guardião de ', 'Sentinela de ',
  ]
  const t = templates[Math.abs(missionName.charCodeAt(0)) % templates.length]
  // Pega até 2 palavras significativas do nome da missão
  const words = missionName.replace(/[^a-zA-ZÀ-ú\s]/g, '').trim().split(/\s+/).filter(w => w.length > 3)
  const short = words.slice(0, 2).join(' ') || missionName.slice(0, 12)
  return t + short
}
