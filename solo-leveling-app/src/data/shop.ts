import type { PlayerStats } from '../types'

export interface Perk {
  id: string
  name: string
  icon: string
  description: string
  cost: number
  category?: string
}

export interface TitleDef {
  id: string
  name: string
  description: string
  check: (stats: PlayerStats) => boolean
}

export interface ConsumableItem {
  id: string
  name: string
  icon: string
  description: string
  cost: number
  effect: string
}

// ── Perks Permanentes ────────────────────────────────────────────────────────
export const PERKS: Perk[] = [
  // XP
  {
    id: 'hunter_focus',
    name: 'Foco do Caçador',
    icon: '🎯',
    description: '+10% XP de missões principais',
    cost: 50,
    category: 'XP',
  },
  {
    id: 'scholar_mind',
    name: 'Mente de Estudioso',
    icon: '📚',
    description: '+15% XP de missões de estudo',
    cost: 40,
    category: 'XP',
  },
  {
    id: 'iron_body',
    name: 'Corpo de Ferro',
    icon: '💪',
    description: '+15% XP de missões de saúde',
    cost: 40,
    category: 'XP',
  },
  {
    id: 'sharp_tongue',
    name: 'Língua Afiada',
    icon: '🌐',
    description: '+15% XP de missões de inglês',
    cost: 40,
    category: 'XP',
  },
  {
    id: 'faith_boost',
    name: 'Fé Inabalável',
    icon: '✝️',
    description: '+20% XP de missões de fé',
    cost: 45,
    category: 'XP',
  },
  {
    id: 'bond_power',
    name: 'Laços Eternos',
    icon: '❤️',
    description: '+15% XP de missões de amor',
    cost: 40,
    category: 'XP',
  },
  {
    id: 'habit_shield',
    name: 'Escudo do Hábito',
    icon: '🔰',
    description: 'Penalidade de hábito reduzida em 30%',
    cost: 55,
    category: 'Defesa',
  },
  // Defesa / Utilidade
  {
    id: 'iron_will',
    name: 'Vontade de Ferro',
    icon: '🔩',
    description: 'Penalidade de XP reduzida em 20%',
    cost: 80,
    category: 'Defesa',
  },
  {
    id: 'cold_blood',
    name: 'Sangue Frio',
    icon: '🧊',
    description: 'Streak não quebra 1x por mês (1 falta permitida)',
    cost: 120,
    category: 'Defesa',
  },
  {
    id: 'shadow_boost',
    name: 'Força das Sombras',
    icon: '🌑',
    description: '+20% poder do Exército das Sombras',
    cost: 60,
    category: 'Exército',
  },
  {
    id: 'shadow_treasury',
    name: 'Cofre das Sombras',
    icon: '💰',
    description: '+2G por sombra invocada ao encerrar dia',
    cost: 50,
    category: 'Exército',
  },
  // Ouro
  {
    id: 'gold_sense',
    name: 'Instinto do Ouro',
    icon: '◈',
    description: '+5G ao encerrar um dia honrado',
    cost: 35,
    category: 'Ouro',
  },
  {
    id: 'gold_hunter',
    name: 'Caçador de Ouro',
    icon: '🏅',
    description: '+10G ao derrotar qualquer boss',
    cost: 60,
    category: 'Ouro',
  },
  // Bônus especiais
  {
    id: 'double_honor',
    name: 'Honra em Dobro',
    icon: '⭐',
    description: 'Bônus de dia honrado +50% (30→45 XP)',
    cost: 90,
    category: 'XP',
  },
  {
    id: 'dungeon_master',
    name: 'Mestre das Masmorras',
    icon: '🗝️',
    description: '+1 chave por andar de masmorra avançado no dia',
    cost: 70,
    category: 'Masmorra',
  },
]

// ── Consumíveis ──────────────────────────────────────────────────────────────
export const CONSUMABLES: ConsumableItem[] = [
  {
    id: 'xp_potion',
    name: 'Poção de XP',
    icon: '🧪',
    description: '+50 XP instantâneo',
    cost: 30,
    effect: 'xp:50',
  },
  {
    id: 'xp_potion_grande',
    name: 'Poção de XP Grande',
    icon: '⚗️',
    description: '+150 XP instantâneo',
    cost: 80,
    effect: 'xp:150',
  },
  {
    id: 'streak_shield',
    name: 'Escudo de Streak',
    icon: '🛡️',
    description: 'Protege seu streak por 1 dia',
    cost: 50,
    effect: 'streak_shield:1',
  },
  {
    id: 'dungeon_key',
    name: 'Chave de Masmorra',
    icon: '🔑',
    description: '+1 chave de masmorra',
    cost: 60,
    effect: 'key:1',
  },
  {
    id: 'gold_bag',
    name: 'Saco de Ouro',
    icon: '💰',
    description: '+40G instantâneo',
    cost: 20,
    effect: 'gold:40',
  },
  {
    id: 'elixir_monarca',
    name: 'Elixir do Monarca',
    icon: '✨',
    description: '+200 XP + +20G instantâneo',
    cost: 150,
    effect: 'xp:200,gold:20',
  },
  {
    id: 'scroll_relic',
    name: 'Pergaminho de Relíquia',
    icon: '📜',
    description: 'Garante drop de relíquia comum no próximo boss',
    cost: 100,
    effect: 'relic_scroll:1',
  },
]

// ── Títulos ──────────────────────────────────────────────────────────────────
export const TITLE_DEFS: TitleDef[] = [
  {
    id: 'iniciante',
    name: 'O Iniciante',
    description: 'Começar a jornada',
    check: () => true,
  },
  {
    id: 'dedicado',
    name: 'Dedicado',
    description: 'Alcançar 7 dias de streak',
    check: s => s.currentStreak >= 7 || s.longestStreak >= 7,
  },
  {
    id: 'invocador',
    name: 'Invocador',
    description: 'Invocar a primeira sombra',
    check: s => s.shadows.length >= 1,
  },
  {
    id: 'honrado',
    name: 'O Honrado',
    description: 'Acumular 10 dias honrados',
    check: s => s.totalHonorDays >= 10,
  },
  {
    id: 'hunter',
    name: 'Caçador',
    description: 'Atingir Rank C',
    check: s => ['C', 'B', 'A', 'S'].includes(s.rank),
  },
  {
    id: 'inabalavel',
    name: 'Inabalável',
    description: 'Alcançar 30 dias de streak',
    check: s => s.currentStreak >= 30 || s.longestStreak >= 30,
  },
  {
    id: 'general',
    name: 'General das Sombras',
    description: 'Ter 5 sombras no exército',
    check: s => s.shadows.length >= 5,
  },
  {
    id: 'monarca',
    name: 'O Monarca',
    description: 'Atingir Rank S',
    check: s => s.rank === 'S',
  },
  {
    id: 'maratonista',
    name: 'Maratonista',
    description: 'Alcançar 60 dias de streak',
    check: s => s.currentStreak >= 60 || s.longestStreak >= 60,
  },
  {
    id: 'centenario',
    name: 'O Centenário',
    description: 'Alcançar 100 dias de streak',
    check: s => s.currentStreak >= 100 || s.longestStreak >= 100,
  },
  {
    id: 'estudioso',
    name: 'O Estudioso',
    description: 'Honrar 30 dias com missões de estudo',
    check: s => s.logs.filter(l => l.completedMissions.some(id => id.includes('estud') || id.includes('ingles') || id.includes('leitura'))).length >= 30,
  },
  {
    id: 'atleta',
    name: 'O Atleta',
    description: 'Ir à academia 50 vezes',
    check: s => s.logs.filter(l => l.completedMissions.includes('academia')).length >= 50,
  },
  {
    id: 'senhor_sombras',
    name: 'Senhor das Sombras',
    description: 'Ter 10 sombras no exército',
    check: s => s.shadows.length >= 10,
  },
  {
    id: 'lenda_reliquia',
    name: 'Portador Lendário',
    description: 'Obter uma relíquia lendária',
    check: s => (s.relicInventory ?? []).some(r => r.rarity === 'lendaria'),
  },
  {
    id: 'profeta',
    name: 'O Profeta',
    description: 'Completar uma profecia lendária',
    check: s => (s.completedProphecies?.length ?? 0) >= 1,
  },
  {
    id: 'renascido',
    name: 'Renascido',
    description: 'Realizar a primeira Ascensão Monarca',
    check: s => (s.monarcaLevel ?? 0) >= 1,
  },
  {
    id: 'eterno',
    name: 'O Eterno',
    description: 'Realizar 3 Ascensões Monarca',
    check: s => (s.monarcaLevel ?? 0) >= 3,
  },
  {
    id: 'caçador_bosses',
    name: 'Caçador de Bosses',
    description: 'Derrotar o boss pessoal pela primeira vez',
    check: s => s.logs.some(l => l.bossDefeated === true),
  },
]
