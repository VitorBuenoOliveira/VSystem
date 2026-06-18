import type { RandomEvent } from '../types'

interface EventDef {
  id: string
  name: string
  icon: string
  description: string
  xpBonus: number
  goldBonus: number
}

const EVENT_POOL: EventDef[] = [
  {
    id: 'ancient_rune',
    name: 'Runa Antiga',
    icon: '🔮',
    description: 'Uma runa de poder emana energia das sombras.',
    xpBonus: 80, goldBonus: 0,
  },
  {
    id: 'dungeon_chest',
    name: 'Baú da Masmorra',
    icon: '📦',
    description: 'Um baú misterioso foi encontrado numa passagem esquecida.',
    xpBonus: 0, goldBonus: 40,
  },
  {
    id: 'shadow_whisper',
    name: 'Sussurro das Sombras',
    icon: '🌑',
    description: 'As sombras do exército sussurram segredos do além.',
    xpBonus: 60, goldBonus: 20,
  },
  {
    id: 'hunters_mark',
    name: 'Marca do Caçador',
    icon: '🎯',
    description: 'O Sistema reconhece sua persistência e recompensa o esforço.',
    xpBonus: 100, goldBonus: 0,
  },
  {
    id: 'golden_gate',
    name: 'Portal Dourado',
    icon: '✨',
    description: 'Um portal raro se abre brevemente, liberando riqueza.',
    xpBonus: 0, goldBonus: 50,
  },
  {
    id: 'monarch_favor',
    name: 'Favor do Monarca',
    icon: '👑',
    description: 'O próprio Monarca das Sombras abençoa sua jornada hoje.',
    xpBonus: 120, goldBonus: 30,
  },
  {
    id: 'iron_trial',
    name: 'Provação de Ferro',
    icon: '⚔️',
    description: 'Uma provação surgiu. Você superou — e foi recompensado.',
    xpBonus: 90, goldBonus: 10,
  },
  {
    id: 'forgotten_scroll',
    name: 'Pergaminho Esquecido',
    icon: '📜',
    description: 'Um pergaminho antigo revela conhecimento perdido.',
    xpBonus: 70, goldBonus: 15,
  },
]

/** Rola um evento aleatório. Retorna null se não acionar (70% de chance). */
export function rollRandomEvent(date: string): RandomEvent | null {
  if (Math.random() > 0.30) return null
  const def = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]
  return { ...def, triggeredAt: date }
}
