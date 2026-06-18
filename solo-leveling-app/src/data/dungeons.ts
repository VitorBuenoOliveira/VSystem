import type { Dungeon, FloorGate } from '../types'

export const INITIAL_DUNGEONS: Dungeon[] = [
  {
    id: 'dungeon-ds',
    name: 'Masmorra do Data Scientist',
    icon: '💻',
    totalFloors: 30,
    currentFloor: 0,
    description: '30 módulos do curso de Data Science. Cada sessão completa sobe um andar.',
    relatedCategory: 'estudo'
  },
  {
    id: 'dungeon-corpo',
    name: 'Forja do Corpo',
    icon: '🏋️',
    totalFloors: 12,
    currentFloor: 0,
    description: '~3 meses de academia consistente. Cada treino sobe um andar.',
    relatedCategory: 'saude'
  },
  {
    id: 'dungeon-ingles',
    name: 'Caminho da Fluência',
    icon: '🗣️',
    totalFloors: 24,
    currentFloor: 0,
    description: '~6 meses de prática além da aula. Cada sessão avança um andar.',
    relatedCategory: 'ingles'
  },
  {
    id: 'dungeon-amor',
    name: 'Arquiteto do Amor',
    icon: '❤️',
    totalFloors: 21,
    currentFloor: 0,
    description: '21 dias de gestos consistentes — tempo científico para criar hábito.',
    relatedCategory: 'amor'
  },
  {
    id: 'dungeon-fe',
    name: 'Fortaleza da Fé',
    icon: '🙏',
    totalFloors: 21,
    currentFloor: 0,
    description: '21 dias seguidos de oração e gratidão.',
    relatedCategory: 'fe'
  },
  {
    id: 'dungeon-familia',
    name: 'Laços de Sangue',
    icon: '👨‍👩‍👦',
    totalFloors: 21,
    currentFloor: 0,
    description: 'Ser o filho que dá orgulho. Cada contato com os pais avança um andar.',
    relatedCategory: 'familia'
  },
  {
    id: 'dungeon-carater',
    name: 'Têmpera da Alma',
    icon: '🕊️',
    totalFloors: 30,
    currentFloor: 0,
    description: 'Ser uma boa pessoa, todo dia. Cada dia de integridade forja o caráter.',
    relatedCategory: 'carater'
  }
]

// ── Portões de requisito ───────────────────────────────────────────────────
// Bloqueiam o avanço até o jogador atender a condição.

export const DUNGEON_GATES: Record<string, FloorGate[]> = {
  'dungeon-ds': [
    { floor: 8,  type: 'streak',    value: 5,  icon: '🔥', label: 'Streak de 5 dias seguidos' },
    { floor: 15, type: 'attribute', value: 3,  attrKey: 'inteligencia', icon: '📖', label: 'Inteligência 3' },
    { floor: 18, type: 'level',     value: 3,  icon: '⬆', label: 'Alcançar Nível 3' },
    { floor: 25, type: 'attribute', value: 6,  attrKey: 'inteligencia', icon: '📖', label: 'Inteligência 6' },
    { floor: 28, type: 'honor_days',value: 15, icon: '✦', label: '15 Dias Honrados' },
  ],
  'dungeon-corpo': [
    { floor: 4,  type: 'total_missions', value: 20, icon: '⚔', label: '20 missões totais completadas' },
    { floor: 7,  type: 'attribute',      value: 3,  attrKey: 'forca', icon: '⚔', label: 'Força 3' },
    { floor: 9,  type: 'streak',         value: 7,  icon: '🔥', label: 'Streak de 7 dias' },
    { floor: 11, type: 'attribute',      value: 6,  attrKey: 'forca', icon: '⚔', label: 'Força 6' },
  ],
  'dungeon-ingles': [
    { floor: 6,  type: 'total_missions', value: 30, icon: '⚔', label: '30 missões totais completadas' },
    { floor: 12, type: 'attribute',      value: 4,  attrKey: 'inteligencia', icon: '📖', label: 'Inteligência 4' },
    { floor: 16, type: 'level',          value: 4,  icon: '⬆', label: 'Alcançar Nível 4' },
    { floor: 20, type: 'attribute',      value: 7,  attrKey: 'inteligencia', icon: '📖', label: 'Inteligência 7' },
  ],
  'dungeon-amor': [
    { floor: 7,  type: 'honor_days', value: 7,  icon: '✦', label: '7 Dias Honrados' },
    { floor: 12, type: 'attribute',  value: 3,  attrKey: 'carisma', icon: '❤', label: 'Carisma 3' },
    { floor: 14, type: 'shadow',     value: 1,  icon: '🌑', label: 'Invocar primeira Sombra' },
    { floor: 18, type: 'attribute',  value: 6,  attrKey: 'carisma', icon: '❤', label: 'Carisma 6' },
  ],
  'dungeon-fe': [
    { floor: 7,  type: 'streak',    value: 7,  icon: '🔥', label: 'Streak de 7 dias' },
    { floor: 12, type: 'attribute', value: 3,  attrKey: 'espiritual', icon: '✦', label: 'Espiritual 3' },
    { floor: 14, type: 'honor_days',value: 10, icon: '✦', label: '10 Dias Honrados' },
    { floor: 18, type: 'attribute', value: 6,  attrKey: 'espiritual', icon: '✦', label: 'Espiritual 6' },
  ],
  'dungeon-familia': [
    { floor: 7,  type: 'attribute',  value: 3,  attrKey: 'carisma', icon: '❤', label: 'Carisma 3' },
    { floor: 12, type: 'streak',     value: 10, icon: '🔥', label: 'Streak de 10 dias' },
    { floor: 18, type: 'attribute',  value: 6,  attrKey: 'carisma', icon: '❤', label: 'Carisma 6' },
  ],
  'dungeon-carater': [
    { floor: 8,  type: 'streak',     value: 7,  icon: '🔥', label: 'Streak de 7 dias' },
    { floor: 15, type: 'attribute',  value: 4,  attrKey: 'espiritual', icon: '🕊️', label: 'Espiritual 4' },
    { floor: 21, type: 'honor_days', value: 15, icon: '✦', label: '15 Dias Honrados' },
    { floor: 27, type: 'attribute',  value: 7,  attrKey: 'espiritual', icon: '🕊️', label: 'Espiritual 7' },
  ],
}

/** Retorna o próximo portão que ainda bloqueia o avanço */
export function getNextGate(dungeonId: string, currentFloor: number): FloorGate | null {
  const gates = DUNGEON_GATES[dungeonId] ?? []
  return gates.find(g => g.floor > currentFloor) ?? null
}

/** Retorna o portão exato no andar informado (se existir) */
export function getGateAtFloor(dungeonId: string, floor: number): FloorGate | null {
  return DUNGEON_GATES[dungeonId]?.find(g => g.floor === floor) ?? null
}
