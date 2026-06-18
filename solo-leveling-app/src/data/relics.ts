import type { Relic, RelicBonuses, RelicRarity } from '../types'

export interface RelicDef {
  id: string
  name: string
  icon: string
  description: string
  rarity: RelicRarity
  bonuses: RelicBonuses
  source: string   // como obter
}

export const RELIC_DEFS: RelicDef[] = [
  // ── COMUNS ────────────────────────────────────────────────────────────
  {
    id: 'relic_persistence',
    name: 'Relíquia da Persistência',
    icon: '🔗',
    description: 'O tempo transforma esforço em ouro.',
    rarity: 'comum',
    bonuses: { weeklyKeyBonus: 1 },
    source: 'Drop de Boss Pessoal (30%)',
  },
  {
    id: 'relic_beginner',
    name: 'Relíquia do Iniciante',
    icon: '🌱',
    description: 'Todo grande caçador um dia começou pequeno.',
    rarity: 'comum',
    bonuses: { xpMultByCategory: { habito: 1.10 } },
    source: 'Drop de Boss Pessoal (30%)',
  },
  {
    id: 'relic_shadow_bond',
    name: 'Vínculo das Sombras',
    icon: '🌑',
    description: 'Seu exército sente sua força crescer.',
    rarity: 'comum',
    bonuses: { shadowPowerBonus: 2 },
    source: 'Drop de Boss Pessoal (30%)',
  },
  {
    id: 'relic_honor',
    name: 'Cristal da Honra',
    icon: '💎',
    description: 'Cada dia honrado é gravado neste cristal.',
    rarity: 'comum',
    bonuses: { honorDayBonusXp: 10 },
    source: 'Drop de Boss Pessoal (30%)',
  },

  // ── RARAS ─────────────────────────────────────────────────────────────
  {
    id: 'relic_discipline',
    name: 'Relíquia da Disciplina',
    icon: '📚',
    description: 'O conhecimento forjado em constância não tem igual.',
    rarity: 'rara',
    bonuses: { xpMultByCategory: { estudo: 1.15, ingles: 1.10 } },
    source: 'Drop de Boss Mensal (garantido)',
  },
  {
    id: 'relic_courage',
    name: 'Relíquia da Coragem',
    icon: '⚔️',
    description: 'O medo do boss diminui, a chance de vitória cresce.',
    rarity: 'rara',
    bonuses: { bossWinChanceBonus: 5 },
    source: 'Drop de Boss Mensal (garantido)',
  },
  {
    id: 'relic_hunter',
    name: 'Totem do Caçador',
    icon: '🎯',
    description: 'A mira do caçador nunca falha na hora certa.',
    rarity: 'rara',
    bonuses: { bossDamageMult: 1.12 },
    source: 'Drop de Boss Mensal (garantido)',
  },
  {
    id: 'relic_love',
    name: 'Relíquia do Amor',
    icon: '❤️',
    description: 'O que é cultivado com amor cresce o dobro.',
    rarity: 'rara',
    bonuses: { xpMultByCategory: { amor: 1.15 } },
    source: 'Drop de Boss Mensal (garantido)',
  },
  {
    id: 'relic_faith',
    name: 'Relíquia da Fé',
    icon: '✦',
    description: 'A fé move o sistema para além dos limites normais.',
    rarity: 'rara',
    bonuses: { xpMultByCategory: { fe: 1.15 }, honorDayBonusXp: 15 },
    source: 'Drop de Boss Mensal (garantido)',
  },

  // ── LENDÁRIAS ─────────────────────────────────────────────────────────
  {
    id: 'relic_monarch',
    name: 'Fragmento do Monarca',
    icon: '👑',
    description: 'Um fragmento do poder do Rei das Sombras. Impossível de ignorar.',
    rarity: 'lendaria',
    bonuses: { globalXpMult: 1.10 },
    source: 'Completar uma Profecia',
  },
  {
    id: 'relic_ascension',
    name: 'Relíquia da Ascensão',
    icon: '🌟',
    description: 'Cada renascimento carrega mais do que memória — carrega poder.',
    rarity: 'lendaria',
    bonuses: { ascensionLevelBonus: 1, globalXpMult: 1.05 },
    source: 'Completar uma Profecia',
  },
  {
    id: 'relic_immortality',
    name: 'Relíquia da Imortalidade',
    icon: '💀',
    description: 'Até os mortos voltam. Uma penalidade por semana é cancelada.',
    rarity: 'lendaria',
    bonuses: { penaltyCancelPerWeek: 1, globalXpMult: 1.05 },
    source: 'Completar uma Profecia',
  },
]

export const RARITY_COLOR: Record<RelicRarity, string> = {
  comum:    '#94a3b8',
  rara:     '#60a5fa',
  lendaria: '#f0d060',
}

export const RARITY_LABEL: Record<RelicRarity, string> = {
  comum:    'COMUM',
  rara:     'RARA',
  lendaria: 'LENDÁRIA',
}

export function getRelicDef(id: string): RelicDef | undefined {
  return RELIC_DEFS.find(r => r.id === id)
}

/** Cria uma instância de relíquia a partir da definição */
export function instantiateRelic(id: string, date: string): Relic | null {
  const def = getRelicDef(id)
  if (!def) return null
  return {
    id: def.id,
    name: def.name,
    icon: def.icon,
    description: def.description,
    rarity: def.rarity,
    bonuses: def.bonuses,
    obtainedAt: date,
  }
}

/** Pool de relíquias comuns para drop de boss pessoal */
export const COMMON_RELIC_POOL = ['relic_persistence', 'relic_beginner', 'relic_shadow_bond', 'relic_honor']

/** Pool de relíquias raras para drop de boss mensal */
export const RARE_RELIC_POOL = ['relic_discipline', 'relic_courage', 'relic_hunter', 'relic_love', 'relic_faith']

/** Pool de relíquias lendárias para profecias */
export const LEGENDARY_RELIC_POOL = ['relic_monarch', 'relic_ascension', 'relic_immortality']
