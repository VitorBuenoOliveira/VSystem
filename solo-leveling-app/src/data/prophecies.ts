import type { Prophecy, ProphecyGoalType, MissionCategory } from '../types'
import { addDaysStr } from '../utils'
import { LEGENDARY_RELIC_POOL } from './relics'

interface ProphecyTemplate {
  id: string
  name: string
  icon: string
  description: string
  task: string
  goalType: ProphecyGoalType
  goalCategory?: MissionCategory
  goal: number
  durationDays: number
  rewardXp: number
  rewardGold: number
  rewardTitle?: string
}

export const PROPHECY_TEMPLATES: ProphecyTemplate[] = [
  {
    id: 'proph_mind_forge',
    name: 'A Forja da Mente',
    icon: '🧠',
    description: 'O Sistema escolheu você para um desafio de conhecimento. Mostre que é digno.',
    task: 'Complete missões de Estudo ou Inglês por 7 dias consecutivos.',
    goalType: 'category_days',
    goalCategory: 'estudo',
    goal: 7,
    durationDays: 14,
    rewardXp: 500,
    rewardGold: 120,
    rewardTitle: 'Arquimago',
  },
  {
    id: 'proph_iron_discipline',
    name: 'Disciplina de Ferro',
    icon: '⚔️',
    description: 'Sete dias sem falha. Sem desculpa. Sem fraqueza.',
    task: 'Complete todos os dias sem falhar nenhuma missão principal por 7 dias seguidos.',
    goalType: 'no_fail_days',
    goal: 7,
    durationDays: 14,
    rewardXp: 600,
    rewardGold: 150,
    rewardTitle: 'Monarca da Disciplina',
  },
  {
    id: 'proph_holy_week',
    name: 'Semana Sagrada',
    icon: '✦',
    description: 'O Sistema aguarda 5 Dias Honrados. Pode você honrar a cada passo?',
    task: 'Alcance 5 Dias Honrados dentro de 10 dias.',
    goalType: 'honor_streak',
    goal: 5,
    durationDays: 10,
    rewardXp: 550,
    rewardGold: 130,
    rewardTitle: 'Guardião da Honra',
  },
  {
    id: 'proph_body_trial',
    name: 'Provação do Corpo',
    icon: '💪',
    description: 'Cinquenta missões. O Sistema mede sua capacidade de agir.',
    task: 'Complete 50 missões (qualquer tipo) nos próximos 14 dias.',
    goalType: 'missions_total',
    goal: 50,
    durationDays: 14,
    rewardXp: 480,
    rewardGold: 110,
    rewardTitle: 'Caçador Implacável',
  },
  {
    id: 'proph_faith_trial',
    name: 'Caminho da Fé',
    icon: '🙏',
    description: 'Dez dias caminhando na fé. O Sistema observa cada passo.',
    task: 'Complete missões de Fé por 10 dias consecutivos.',
    goalType: 'category_days',
    goalCategory: 'fe',
    goal: 10,
    durationDays: 14,
    rewardXp: 520,
    rewardGold: 100,
    rewardTitle: 'Guardião Espiritual',
  },
]

/** 1% de chance por semana de uma profecia aparecer */
export function rollProphecy(weekStart: string, hasProphecy: boolean): Prophecy | null {
  if (hasProphecy) return null
  if (Math.random() > 0.01) return null

  const tmpl = PROPHECY_TEMPLATES[Math.floor(Math.random() * PROPHECY_TEMPLATES.length)]
  const relicPool = LEGENDARY_RELIC_POOL
  const relicId = relicPool[Math.floor(Math.random() * relicPool.length)]

  return {
    id: `${tmpl.id}_${weekStart}`,
    name: tmpl.name,
    icon: tmpl.icon,
    description: tmpl.description,
    task: tmpl.task,
    goalType: tmpl.goalType,
    goalCategory: tmpl.goalCategory,
    goal: tmpl.goal,
    progress: 0,
    issuedAt: weekStart,
    expiresAt: addDaysStr(weekStart, tmpl.durationDays),
    completed: false,
    failed: false,
    rewardXp: tmpl.rewardXp,
    rewardGold: tmpl.rewardGold,
    rewardRelicId: relicId,
    rewardTitle: tmpl.rewardTitle,
  }
}

/** Atualiza progresso de uma profecia com base no dia encerrado */
export function updateProphecyProgress(
  prophecy: Prophecy,
  date: string,
  todayCompleted: string[],
  honoredToday: boolean,
  noFailToday: boolean,
  allMissions: import('../types').Mission[],
): Prophecy {
  if (prophecy.completed || prophecy.failed) return prophecy

  // Expirada
  if (date > prophecy.expiresAt) return { ...prophecy, failed: true }

  let progress = prophecy.progress

  switch (prophecy.goalType) {
    case 'honor_streak':
      if (honoredToday) progress += 1
      break
    case 'no_fail_days':
      if (noFailToday) progress += 1
      else progress = 0  // precisa ser consecutivo
      break
    case 'category_days': {
      const cat = prophecy.goalCategory
      const catMissions = allMissions.filter(m => m.category === cat || (cat === 'estudo' && m.category === 'ingles'))
      const completedCatToday = catMissions.some(m => todayCompleted.includes(m.id))
      if (completedCatToday) progress += 1
      else progress = 0  // consecutivo
      break
    }
    case 'missions_total':
      progress += todayCompleted.length
      break
  }

  const completed = progress >= prophecy.goal
  return { ...prophecy, progress: Math.min(progress, prophecy.goal), completed }
}
