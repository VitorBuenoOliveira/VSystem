import type { Achievement, PlayerStats } from '../types'

interface AchievementDef {
  id: string
  icon: string
  name: string
  description: string
  check: (stats: PlayerStats) => boolean
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ── Primeiros Passos ────────────────────────────────────────────────────
  {
    id: 'first-mission',
    icon: '🌱',
    name: 'Primeiro Passo',
    description: 'Completou sua primeira missão',
    check: (s) => s.logs.some(l => l.completedMissions.length > 0),
  },
  {
    id: 'first-workout',
    icon: '💪',
    name: 'Primeiro Treino',
    description: 'Foi à academia pela primeira vez',
    check: (s) => s.logs.some(l => l.completedMissions.includes('academia')),
  },
  {
    id: 'first-shadow',
    icon: '🌑',
    name: 'Nascimento das Sombras',
    description: 'Invocou a primeira sombra',
    check: (s) => s.shadows.length >= 1,
  },
  {
    id: 'first-dungeon',
    icon: '🏰',
    name: 'Explorador',
    description: 'Avançou o primeiro andar de uma masmorra',
    check: (s) => s.dungeons.some(d => d.currentFloor > 0),
  },
  {
    id: 'first-purchase',
    icon: '◈',
    name: 'Primeiro Investimento',
    description: 'Comprou o primeiro perk na loja',
    check: (s) => s.ownedPerks.length >= 1,
  },

  // ── Streaks ─────────────────────────────────────────────────────────────
  {
    id: 'streak-3',
    icon: '🔥',
    name: 'Em Chamas',
    description: '3 dias de sequência',
    check: (s) => s.currentStreak >= 3 || s.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    icon: '⚡',
    name: 'Imparável',
    description: '7 dias de sequência',
    check: (s) => s.currentStreak >= 7 || s.longestStreak >= 7,
  },
  {
    id: 'streak-21',
    icon: '🏆',
    name: 'Hábito Criado',
    description: '21 dias de sequência',
    check: (s) => s.currentStreak >= 21 || s.longestStreak >= 21,
  },
  {
    id: 'streak-30',
    icon: '🌊',
    name: 'Maré Imparável',
    description: '30 dias de sequência',
    check: (s) => s.currentStreak >= 30 || s.longestStreak >= 30,
  },
  {
    id: 'streak-60',
    icon: '🗡️',
    name: 'Lâmina Afiada',
    description: '60 dias de sequência',
    check: (s) => s.currentStreak >= 60 || s.longestStreak >= 60,
  },
  {
    id: 'streak-100',
    icon: '👁️',
    name: 'Olho do Monarca',
    description: '100 dias de sequência',
    check: (s) => s.currentStreak >= 100 || s.longestStreak >= 100,
  },

  // ── Honra ────────────────────────────────────────────────────────────────
  {
    id: 'honor-1',
    icon: '✨',
    name: 'Dia Honrado',
    description: 'Honrou o dia pela primeira vez',
    check: (s) => s.totalHonorDays >= 1,
  },
  {
    id: 'honor-5',
    icon: '🌟',
    name: 'Guerreiro Constante',
    description: 'Honrou o dia 5 vezes',
    check: (s) => s.totalHonorDays >= 5,
  },
  {
    id: 'honor-30',
    icon: '👑',
    name: 'Monarca',
    description: 'Honrou o dia 30 vezes',
    check: (s) => s.totalHonorDays >= 30,
  },
  {
    id: 'honor-100',
    icon: '🌌',
    name: 'Lenda Viva',
    description: 'Honrou o dia 100 vezes',
    check: (s) => s.totalHonorDays >= 100,
  },

  // ── Ranks ────────────────────────────────────────────────────────────────
  {
    id: 'rank-e',
    icon: '🔰',
    name: 'Caçador Iniciante',
    description: 'Alcançou o rank E',
    check: (s) => ['E','D','C','B','A','S'].includes(s.rank),
  },
  {
    id: 'rank-d',
    icon: '🥈',
    name: 'Caçador Prata',
    description: 'Alcançou o rank D',
    check: (s) => ['D','C','B','A','S'].includes(s.rank),
  },
  {
    id: 'rank-c',
    icon: '🥇',
    name: 'Caçador Ouro',
    description: 'Alcançou o rank C',
    check: (s) => ['C','B','A','S'].includes(s.rank),
  },
  {
    id: 'rank-b',
    icon: '💠',
    name: 'Caçador Elite',
    description: 'Alcançou o rank B',
    check: (s) => ['B','A','S'].includes(s.rank),
  },
  {
    id: 'rank-a',
    icon: '🔮',
    name: 'Caçador Lendário',
    description: 'Alcançou o rank A',
    check: (s) => ['A','S'].includes(s.rank),
  },
  {
    id: 'rank-s',
    icon: '💎',
    name: 'O Soberano',
    description: 'Alcançou o rank S',
    check: (s) => s.rank === 'S',
  },

  // ── Missões totais ───────────────────────────────────────────────────────
  {
    id: 'missions-50',
    icon: '📋',
    name: 'Disciplinado',
    description: 'Completou 50 missões no total',
    check: (s) => s.logs.reduce((acc, l) => acc + l.completedMissions.length, 0) >= 50,
  },
  {
    id: 'missions-100',
    icon: '📜',
    name: 'Veterano',
    description: 'Completou 100 missões no total',
    check: (s) => s.logs.reduce((acc, l) => acc + l.completedMissions.length, 0) >= 100,
  },
  {
    id: 'missions-500',
    icon: '⚔️',
    name: 'Caçador de Elite',
    description: 'Completou 500 missões no total',
    check: (s) => s.logs.reduce((acc, l) => acc + l.completedMissions.length, 0) >= 500,
  },
  {
    id: 'missions-1000',
    icon: '🗡️',
    name: 'Mil Batalhas',
    description: 'Completou 1000 missões no total',
    check: (s) => s.logs.reduce((acc, l) => acc + l.completedMissions.length, 0) >= 1000,
  },

  // ── Academia ─────────────────────────────────────────────────────────────
  {
    id: 'gym-30',
    icon: '🏋️',
    name: 'Atleta',
    description: 'Foi à academia 30 vezes',
    check: (s) => s.logs.filter(l => l.completedMissions.includes('academia')).length >= 30,
  },
  {
    id: 'gym-100',
    icon: '🦾',
    name: 'Corpo de Aço',
    description: 'Foi à academia 100 vezes',
    check: (s) => s.logs.filter(l => l.completedMissions.includes('academia')).length >= 100,
  },

  // ── Exército ─────────────────────────────────────────────────────────────
  {
    id: 'shadows-5',
    icon: '🌑',
    name: 'Comandante',
    description: 'Tem 5 sombras no exército',
    check: (s) => s.shadows.length >= 5,
  },
  {
    id: 'shadows-10',
    icon: '☠️',
    name: 'Senhor das Sombras',
    description: 'Tem 10 sombras no exército',
    check: (s) => s.shadows.length >= 10,
  },
  {
    id: 'shadow-monarca',
    icon: '👑',
    name: 'Sombra Monarca',
    description: 'Uma sombra atingiu o tier Monarca (365 dias)',
    check: (s) => s.shadows.some(sh => sh.tier === 'Monarca'),
  },

  // ── Masmorras ────────────────────────────────────────────────────────────
  {
    id: 'dungeon-complete',
    icon: '🏰',
    name: 'Conquistador',
    description: 'Completou uma masmorra inteira',
    check: (s) => s.dungeons.some(d => d.currentFloor >= d.totalFloors),
  },
  {
    id: 'dungeons-3',
    icon: '⚔️',
    name: 'Desbravador',
    description: 'Completou 3 masmorras',
    check: (s) => s.dungeons.filter(d => d.currentFloor >= d.totalFloors).length >= 3,
  },

  // ── Boss ─────────────────────────────────────────────────────────────────
  {
    id: 'boss-personal',
    icon: '⚔️',
    name: 'Caçador de Bosses',
    description: 'Derrotou o boss pessoal pela primeira vez',
    check: (s) => s.logs.some(l => l.bossDefeated === true),
  },
  {
    id: 'boss-monthly',
    icon: '👹',
    name: 'Matador Mensal',
    description: 'Derrotou o boss mensal',
    check: (s) => (s.monthlyBoss?.winRolled === true) || s.logs.some(l => (l as any).monthlyBossDefeated),
  },

  // ── Relíquias ────────────────────────────────────────────────────────────
  {
    id: 'relic-first',
    icon: '💍',
    name: 'Portador de Relíquias',
    description: 'Obteve a primeira relíquia',
    check: (s) => (s.relicInventory?.length ?? 0) >= 1,
  },
  {
    id: 'relic-legendary',
    icon: '🌟',
    name: 'Lenda das Relíquias',
    description: 'Obteve uma relíquia lendária',
    check: (s) => (s.relicInventory ?? []).some(r => r.rarity === 'lendaria'),
  },

  // ── Legado ───────────────────────────────────────────────────────────────
  {
    id: 'prophecy-complete',
    icon: '📜',
    name: 'Profeta',
    description: 'Completou uma profecia lendária',
    check: (s) => (s.completedProphecies?.length ?? 0) >= 1,
  },
  {
    id: 'ascension-1',
    icon: '🌟',
    name: 'Renascido',
    description: 'Realizou a primeira Ascensão Monarca',
    check: (s) => (s.monarcaLevel ?? 0) >= 1,
  },
  {
    id: 'ascension-3',
    icon: '♾️',
    name: 'Eterno',
    description: 'Realizou 3 Ascensões Monarca',
    check: (s) => (s.monarcaLevel ?? 0) >= 3,
  },
]

export function buildAchievements(stats: PlayerStats): Achievement[] {
  return ACHIEVEMENT_DEFS.map(def => ({
    id: def.id,
    icon: def.icon,
    name: def.name,
    description: def.description,
    unlocked: def.check(stats),
  }))
}
