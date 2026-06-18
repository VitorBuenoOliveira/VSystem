import type { MonthlyBoss, DamageCondition, PlayerAttributes, MissionCategory } from '../types'

export type BossTier = 'none' | 'min' | 'med' | 'max'

export interface MonthModifier {
  description: string
  categoryXpBonus?: { category: MissionCategory; pct: number }
  bossDamageBonus?: { category: MissionCategory; pct: number }
  penaltyMult?: number
  honorDayBonusXp?: number
  questSurpriseBonus?: number
}

interface MonthlyBossDef {
  name: string
  icon: string
  hpMax: number
  rewXp: number
  rewGold: number
  damageCondition: DamageCondition
  damageConditionLabel: string
  statRequirements: Partial<PlayerAttributes>
  statRequirementsMed: Partial<PlayerAttributes>
  statRequirementsMax: Partial<PlayerAttributes>
  monthModifier: MonthModifier
}

const MONTHLY_BOSS_POOL: MonthlyBossDef[] = [
  // Jan
  {
    name: 'O Procrastinador Eterno',
    icon: '😴', hpMax: 800, rewXp: 180, rewGold: 60,
    damageCondition: 'no_fail',
    damageConditionLabel: 'Só causa dano se não falhar nenhuma principal',
    statRequirements:    { vitalidade: 2, inteligencia: 2 },
    statRequirementsMed: { vitalidade: 4, inteligencia: 4 },
    statRequirementsMax: { vitalidade: 7, inteligencia: 6 },
    monthModifier: {
      description: 'Mês da resistência: Estudo concede +20% XP. Falhas custam mais.',
      categoryXpBonus: { category: 'estudo', pct: 20 },
      penaltyMult: 1.20,
    },
  },
  // Fev
  {
    name: 'A Dúvida Interior',
    icon: '🌫️', hpMax: 900, rewXp: 200, rewGold: 65,
    damageCondition: 'all_principals',
    damageConditionLabel: 'Só causa dano se completar TODAS as principais do dia',
    statRequirements:    { inteligencia: 2, vitalidade: 2 },
    statRequirementsMed: { inteligencia: 4, vitalidade: 3 },
    statRequirementsMax: { inteligencia: 7, vitalidade: 5 },
    monthModifier: {
      description: 'Mês da certeza: Dias Honrados valem +25 XP bônus.',
      honorDayBonusXp: 25,
    },
  },
  // Mar
  {
    name: 'O Vício da Tela',
    icon: '📱', hpMax: 750, rewXp: 160, rewGold: 55,
    damageCondition: 'no_fail',
    damageConditionLabel: 'Só causa dano se não falhar nenhuma principal',
    statRequirements:    { vitalidade: 2, forca: 2 },
    statRequirementsMed: { vitalidade: 5, forca: 3 },
    statRequirementsMax: { vitalidade: 8, forca: 6 },
    monthModifier: {
      description: 'Mês do corpo: Saúde concede +25% XP. Academia causa dano dobrado ao boss.',
      categoryXpBonus: { category: 'saude', pct: 25 },
      bossDamageBonus: { category: 'saude', pct: 100 },
    },
  },
  // Abr
  {
    name: 'A Preguiça do Corpo',
    icon: '🛋️', hpMax: 1000, rewXp: 220, rewGold: 70,
    damageCondition: 'honor',
    damageConditionLabel: 'Só causa dano em Dias Honrados',
    statRequirements:    { forca: 3, vitalidade: 2 },
    statRequirementsMed: { forca: 5, vitalidade: 4 },
    statRequirementsMax: { forca: 8, vitalidade: 7 },
    monthModifier: {
      description: 'Mês do movimento: Academia e exercícios concedem +30% XP.',
      categoryXpBonus: { category: 'saude', pct: 30 },
    },
  },
  // Mai
  {
    name: 'O Medo do Fracasso',
    icon: '👻', hpMax: 850, rewXp: 190, rewGold: 60,
    damageCondition: 'all_principals',
    damageConditionLabel: 'Só causa dano se completar TODAS as principais do dia',
    statRequirements:    { inteligencia: 3, espiritual: 2 },
    statRequirementsMed: { inteligencia: 5, espiritual: 4 },
    statRequirementsMax: { inteligencia: 8, espiritual: 6 },
    monthModifier: {
      description: 'Mês da coragem: Penalidades reduzidas em 20%.',
      penaltyMult: 0.80,
    },
  },
  // Jun
  {
    name: 'A Distração Constante',
    icon: '🌪️', hpMax: 950, rewXp: 210, rewGold: 65,
    damageCondition: 'no_fail',
    damageConditionLabel: 'Só causa dano se não falhar nenhuma principal',
    statRequirements:    { vitalidade: 3, inteligencia: 3 },
    statRequirementsMed: { vitalidade: 6, inteligencia: 5 },
    statRequirementsMax: { vitalidade: 9, inteligencia: 8 },
    monthModifier: {
      description: 'Mês do foco: Estudo e Inglês concedem +20% XP.',
      categoryXpBonus: { category: 'estudo', pct: 20 },
      bossDamageBonus: { category: 'estudo', pct: 50 },
    },
  },
  // Jul
  {
    name: 'O Isolamento',
    icon: '🧊', hpMax: 800, rewXp: 175, rewGold: 55,
    damageCondition: 'honor',
    damageConditionLabel: 'Só causa dano em Dias Honrados',
    statRequirements:    { carisma: 3, espiritual: 2 },
    statRequirementsMed: { carisma: 5, espiritual: 4 },
    statRequirementsMax: { carisma: 8, espiritual: 7 },
    monthModifier: {
      description: 'Mês das conexões: Amor e Fé concedem +25% XP.',
      categoryXpBonus: { category: 'amor', pct: 25 },
    },
  },
  // Ago
  {
    name: 'A Versão Mediocre de Você',
    icon: '🪞', hpMax: 1200, rewXp: 250, rewGold: 80,
    damageCondition: 'all_principals',
    damageConditionLabel: 'Só causa dano se completar TODAS as principais do dia',
    statRequirements:    { forca: 3, inteligencia: 3, espiritual: 3 },
    statRequirementsMed: { forca: 5, inteligencia: 5, espiritual: 4 },
    statRequirementsMax: { forca: 8, inteligencia: 8, espiritual: 7 },
    monthModifier: {
      description: 'Mês da evolução: Quest Surpresa tem +10% de chance de aparecer.',
      questSurpriseBonus: 10,
    },
  },
  // Set
  {
    name: 'O Ceticismo',
    icon: '❄️', hpMax: 700, rewXp: 155, rewGold: 50,
    damageCondition: 'no_fail',
    damageConditionLabel: 'Só causa dano se não falhar nenhuma principal',
    statRequirements:    { inteligencia: 3, vitalidade: 3 },
    statRequirementsMed: { inteligencia: 6, vitalidade: 5 },
    statRequirementsMax: { inteligencia: 9, vitalidade: 8 },
    monthModifier: {
      description: 'Mês da fé: Missões espirituais concedem +30% XP.',
      categoryXpBonus: { category: 'fe', pct: 30 },
    },
  },
  // Out
  {
    name: 'A Ansiedade',
    icon: '⚡', hpMax: 1000, rewXp: 220, rewGold: 70,
    damageCondition: 'honor',
    damageConditionLabel: 'Só causa dano em Dias Honrados',
    statRequirements:    { espiritual: 3, vitalidade: 3 },
    statRequirementsMed: { espiritual: 5, vitalidade: 5 },
    statRequirementsMax: { espiritual: 8, vitalidade: 8 },
    monthModifier: {
      description: 'Mês da paz: Dias Honrados valem +30 XP bônus e penalidades -15%.',
      honorDayBonusXp: 30,
      penaltyMult: 0.85,
    },
  },
  // Nov
  {
    name: 'O Conformismo',
    icon: '🩶', hpMax: 900, rewXp: 200, rewGold: 65,
    damageCondition: 'all_principals',
    damageConditionLabel: 'Só causa dano se completar TODAS as principais do dia',
    statRequirements:    { forca: 4, vitalidade: 4 },
    statRequirementsMed: { forca: 6, vitalidade: 6 },
    statRequirementsMax: { forca: 9, vitalidade: 9 },
    monthModifier: {
      description: 'Mês da ambição: Inglês concede +25% XP.',
      categoryXpBonus: { category: 'ingles', pct: 25 },
    },
  },
  // Dez
  {
    name: 'O Ócio Final',
    icon: '☠️', hpMax: 1100, rewXp: 240, rewGold: 75,
    damageCondition: 'honor',
    damageConditionLabel: 'Só causa dano em Dias Honrados',
    statRequirements:    { forca: 4, inteligencia: 4, espiritual: 4, vitalidade: 4 },
    statRequirementsMed: { forca: 6, inteligencia: 6, espiritual: 6, vitalidade: 6 },
    statRequirementsMax: { forca: 9, inteligencia: 9, espiritual: 9, vitalidade: 9 },
    monthModifier: {
      description: 'Mês do legado: Todos os XP +10% e Dias Honrados valem +40 XP bônus.',
      questSurpriseBonus: 5,
      honorDayBonusXp: 40,
    },
  },
]

// ── Caps de chance por tier ────────────────────────────────────────────────

export const TIER_CAPS: Record<BossTier, number> = {
  none: 0,
  min:  50,
  med:  85,
  max:  100,
}

export const TIER_LABELS: Record<BossTier, string> = {
  none: 'BLOQUEADO',
  min:  'MÍNIMO',
  med:  'MÉDIO',
  max:  'MÁXIMO',
}

export const TIER_COLORS: Record<BossTier, string> = {
  none: '#555',
  min:  '#e08040',
  med:  '#f0c040',
  max:  '#60e080',
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function getMonthStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function meetsAll(attrs: PlayerAttributes, reqs: Partial<PlayerAttributes>): boolean {
  return (Object.keys(reqs) as (keyof PlayerAttributes)[]).every(k => attrs[k] >= (reqs[k] ?? 0))
}

/** Retorna o tier atual do jogador para este boss */
export function getBossTier(attrs: PlayerAttributes, boss: MonthlyBoss): BossTier {
  if (meetsAll(attrs, boss.statRequirementsMax ?? {})) return 'max'
  if (meetsAll(attrs, boss.statRequirementsMed ?? {})) return 'med'
  if (meetsAll(attrs, boss.statRequirements    ?? {})) return 'min'
  return 'none'
}

/**
 * Chance de vitória real = min(hpDrain%, tierCap)
 * Se tier = 'none' → 0. Se HP zerado e tier max → 100%.
 */
export function calcWinChance(boss: MonthlyBoss, attrs: PlayerAttributes): number {
  const tier   = getBossTier(attrs, boss)
  const cap    = TIER_CAPS[tier]
  if (cap === 0) return 0
  const drain  = Math.round(((boss.hpMax - boss.hp) / boss.hpMax) * 100)
  return Math.min(cap, drain)
}

export function generateMonthlyBoss(strengthMultiplier = 1.0): MonthlyBoss {
  const month = getMonthStr()
  const idx   = new Date().getMonth()
  const def   = MONTHLY_BOSS_POOL[idx]
  const hpMax = Math.round(def.hpMax * strengthMultiplier)
  return {
    ...def,
    month,
    hpMax,
    hp: hpMax,
    defeated: false,
    strengthMultiplier,
    winRolled: false,
  }
}

/** Retorna o modificador do mês corrente (baseado no boss do mês) */
export function getCurrentMonthModifier(): MonthModifier {
  const idx = new Date().getMonth()
  return MONTHLY_BOSS_POOL[idx].monthModifier
}

export function resolveBossEndOfMonth(boss: MonthlyBoss, attrs: PlayerAttributes): {
  won: boolean
  nextMultiplier: number
  rewardXp: number
  rewardGold: number
} {
  if (boss.defeated || boss.winRolled) {
    return { won: boss.defeated, nextMultiplier: boss.strengthMultiplier, rewardXp: 0, rewardGold: 0 }
  }

  const winChance = calcWinChance(boss, attrs)
  const won       = Math.random() * 100 < winChance

  const nextMultiplier = won
    ? Math.max(1.0, boss.strengthMultiplier - 0.05)
    : Math.min(2.5, boss.strengthMultiplier + 0.15)

  return {
    won,
    nextMultiplier,
    rewardXp:   won ? boss.rewXp   : 0,
    rewardGold: won ? boss.rewGold : 0,
  }
}
