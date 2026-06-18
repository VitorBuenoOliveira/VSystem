import type { WeeklyMission, MissionCategory } from '../types'

interface WeeklyTemplate {
  name: string
  description: string
  icon: string
  goalType: 'missions' | 'category' | 'honor'
  goalCategory?: MissionCategory
  goal: number
  xpReward: number
  goldReward: number
}

const WEEKLY_POOL: WeeklyTemplate[] = [
  {
    name: 'Caçador Ativo',
    description: 'Complete 30 missões esta semana',
    icon: '⚔️',
    goalType: 'missions', goal: 30,
    xpReward: 100, goldReward: 20,
  },
  {
    name: 'Semana Honrada',
    description: '3 dias honrados esta semana',
    icon: '✦',
    goalType: 'honor', goal: 3,
    xpReward: 120, goldReward: 20,
  },
  {
    name: 'Semana do Estudioso',
    description: 'Complete 5 missões de estudo',
    icon: '📚',
    goalType: 'category', goalCategory: 'estudo', goal: 5,
    xpReward: 80, goldReward: 15,
  },
  {
    name: 'Semana Espiritual',
    description: 'Complete 7 missões de fé',
    icon: '🙏',
    goalType: 'category', goalCategory: 'fe', goal: 7,
    xpReward: 80, goldReward: 15,
  },
  {
    name: 'Semana do Amor',
    description: 'Complete 7 missões de amor',
    icon: '❤️',
    goalType: 'category', goalCategory: 'amor', goal: 7,
    xpReward: 80, goldReward: 15,
  },
  {
    name: 'Semana Saudável',
    description: 'Complete 5 missões de saúde',
    icon: '💪',
    goalType: 'category', goalCategory: 'saude', goal: 5,
    xpReward: 90, goldReward: 15,
  },
  {
    name: 'Semana do Inglês',
    description: 'Complete 6 missões de inglês',
    icon: '🌎',
    goalType: 'category', goalCategory: 'ingles', goal: 6,
    xpReward: 85, goldReward: 15,
  },
  {
    name: 'Maratona Semanal',
    description: 'Complete 45 missões esta semana',
    icon: '🏆',
    goalType: 'missions', goal: 45,
    xpReward: 160, goldReward: 35,
  },
  {
    name: 'Semana Imaculada',
    description: '5 dias honrados esta semana',
    icon: '👑',
    goalType: 'honor', goal: 5,
    xpReward: 200, goldReward: 40,
  },
]

/** Calcula a data da segunda-feira da semana atual */
export function getWeekStart(): string {
  const d   = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const dd = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/** Gera 3 missões semanais para a semana indicada (seed pelo weekStart) */
export function generateWeeklyMissions(weekStart: string): WeeklyMission[] {
  // Seed pseudo-aleatório determinístico pelo weekStart
  const seed = weekStart.replace(/-/g, '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pool = [...WEEKLY_POOL]
  const picked: WeeklyTemplate[] = []

  let s = seed
  while (picked.length < 3 && pool.length > 0) {
    s = (s * 1664525 + 1013904223) >>> 0
    const idx = s % pool.length
    picked.push(pool.splice(idx, 1)[0])
  }

  return picked.map((t, i) => ({
    id: `wm-${weekStart}-${i}`,
    name: t.name,
    description: t.description,
    icon: t.icon,
    goalType: t.goalType,
    goalCategory: t.goalCategory,
    goal: t.goal,
    progress: 0,
    xpReward: t.xpReward,
    goldReward: t.goldReward,
    completed: false,
    weekStart,
  }))
}
