import type { ClassId, ClassBonuses, RankLabel, PlayerAttributes } from '../types'

export interface ClassDef {
  id: ClassId
  name: string
  icon: string
  color: string
  description: string
  lore: string       // texto estilo Solo Leveling
  requirements: {
    minAttr?: Partial<PlayerAttributes>
    minRank?: RankLabel
    minStreak?: number
    minHonorDays?: number
  }
  bonuses: ClassBonuses
  bonusLabels: string[]   // descrição legível dos bônus
}

export const CLASS_DEFS: ClassDef[] = [
  {
    id: 'estrategista',
    name: 'Estrategista',
    icon: '🧠',
    color: '#8060ff',
    description: 'Mestre da mente que converte conhecimento em poder.',
    lore: 'O Sistema reconhece sua mente afiada. Cada hora de estudo é uma batalha vencida antes de começar.',
    requirements: { minAttr: { inteligencia: 10 }, minRank: 'D' },
    bonuses: {
      xpMultByCategory: { estudo: 1.15, ingles: 1.15 },
      monthlyBossDamageMult: 1.08,
    },
    bonusLabels: ['+15% XP de Estudo e Inglês', '+8% dano no Boss Mensal'],
  },
  {
    id: 'guardiao',
    name: 'Guardião',
    icon: '🛡️',
    color: '#50e890',
    description: 'A constância é sua armadura. Nunca para, nunca quebra.',
    lore: 'Forjado pela disciplina diária. O Sistema registra cada dia mantido — e o recompensa em dobro.',
    requirements: { minAttr: { vitalidade: 10 }, minStreak: 14 },
    bonuses: {
      penaltyMult: 0.75,
      honorDayBonusXp: 20,
    },
    bonusLabels: ['-25% em todas as penalidades', '+20 XP bônus em Dias Honrados'],
  },
  {
    id: 'arcanista',
    name: 'Arcanista',
    icon: '✦',
    color: '#f0d060',
    description: 'Conectado a forças além da compreensão comum.',
    lore: 'Sua fé move montanhas — e destrói bosses. O Sistema amplifica o que vem do espírito.',
    requirements: { minAttr: { espiritual: 10 }, minHonorDays: 30 },
    bonuses: {
      questSurpriseChanceBonus: 8,
      monthlyBossDamageMult: 1.10,
      honorDayBonusXp: 15,
    },
    bonusLabels: ['+8% chance de Quest Surpresa', '+10% dano no Boss Mensal', '+15 XP em Dias Honrados'],
  },
  {
    id: 'combatente',
    name: 'Combatente',
    icon: '⚔️',
    color: '#e05050',
    description: 'O corpo é a primeira arma. Forjado no suor e no esforço.',
    lore: 'Cada treino é um golpe na versão fraca de si mesmo. O Sistema amplifica quem age.',
    requirements: { minAttr: { forca: 10 }, minRank: 'C' },
    bonuses: {
      xpMultByCategory: { saude: 1.20 },
      bossDamageMult: 1.15,
    },
    bonusLabels: ['+20% XP de Saúde', '+15% dano no Boss Pessoal'],
  },
  {
    id: 'campeao',
    name: 'Campeão',
    icon: '👑',
    color: '#3a8fff',
    description: 'Equilíbrio absoluto entre todas as formas de poder.',
    lore: 'Raramente um caçador domina todos os campos. O Sistema reconhece o verdadeiro Monarca.',
    requirements: { minAttr: { forca: 5, inteligencia: 5, espiritual: 5, carisma: 5, vitalidade: 5 }, minRank: 'B' },
    bonuses: {
      globalXpMult: 1.05,
      bossDamageMult: 1.10,
      monthlyBossDamageMult: 1.10,
      honorDayBonusXp: 10,
    },
    bonusLabels: ['+5% XP global', '+10% dano em todos os bosses', '+10 XP em Dias Honrados'],
  },
]

export function getClassDef(id: ClassId | null): ClassDef | undefined {
  if (!id) return undefined
  return CLASS_DEFS.find(c => c.id === id)
}

/** Verifica se o jogador atende os requisitos de uma classe */
export function meetsClassRequirements(
  def: ClassDef,
  attrs: import('../types').PlayerAttributes,
  stats: { rank: import('../types').RankLabel; currentStreak: number; totalHonorDays: number },
): boolean {
  const RANK_ORDER: import('../types').RankLabel[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S']
  const req = def.requirements

  if (req.minAttr) {
    for (const [k, v] of Object.entries(req.minAttr) as [keyof import('../types').PlayerAttributes, number][]) {
      if (attrs[k] < v) return false
    }
  }
  if (req.minRank) {
    if (RANK_ORDER.indexOf(stats.rank) < RANK_ORDER.indexOf(req.minRank)) return false
  }
  if (req.minStreak !== undefined && stats.currentStreak < req.minStreak) return false
  if (req.minHonorDays !== undefined && stats.totalHonorDays < req.minHonorDays) return false

  return true
}
