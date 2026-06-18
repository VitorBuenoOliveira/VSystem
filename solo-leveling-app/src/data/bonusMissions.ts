import type { BonusMission, MissionCategory } from '../types'

interface BonusMissionDef {
  id: string
  name: string
  icon: string
  description: string
  task: string
  category: MissionCategory
  xpReward: number
  goldReward: number
}

const BONUS_POOL: BonusMissionDef[] = [
  // ── Corpo / Saúde ─────────────────────────────────────────────────────
  {
    id: 'bm_flexoes',
    name: 'Provação do Corpo',
    icon: '💪',
    description: 'O Sistema exige uma prova de força agora.',
    task: 'Faça 20 flexões antes do fim do dia.',
    category: 'saude',
    xpReward: 60, goldReward: 15,
  },
  {
    id: 'bm_caminhada',
    name: 'Marcha das Sombras',
    icon: '🏃',
    description: 'Um caçador não fica parado. Mova-se.',
    task: 'Caminhe ou corra pelo menos 2km hoje.',
    category: 'saude',
    xpReward: 70, goldReward: 20,
  },
  {
    id: 'bm_agua',
    name: 'Purificação do Sistema',
    icon: '💧',
    description: 'O corpo é o recipiente da sua evolução.',
    task: 'Beba pelo menos 2 litros de água hoje.',
    category: 'saude',
    xpReward: 40, goldReward: 10,
  },
  // ── Amor ──────────────────────────────────────────────────────────────
  {
    id: 'bm_mensagem',
    name: 'Missão Coração',
    icon: '💌',
    description: 'Os laços fortes são a armadura de um Monarca.',
    task: 'Mande uma mensagem carinhosa pra ela agora.',
    category: 'amor',
    xpReward: 45, goldReward: 15,
  },
  {
    id: 'bm_ligacao',
    name: 'Vínculo do Monarca',
    icon: '❤️',
    description: 'O amor cultivado hoje é força amanhã.',
    task: 'Ligue ou mande um áudio especial pra ela.',
    category: 'amor',
    xpReward: 55, goldReward: 20,
  },
  // ── Estudo / DS ───────────────────────────────────────────────────────
  {
    id: 'bm_codigo',
    name: 'Sprint do Caçador',
    icon: '💻',
    description: 'Rank S não espera. Código extra agora.',
    task: 'Estude ou programe por 30 minutos extras hoje.',
    category: 'estudo',
    xpReward: 75, goldReward: 25,
  },
  {
    id: 'bm_revisao',
    name: 'Pergaminho Secreto',
    icon: '📋',
    description: 'Um caçador revisa o que aprendeu.',
    task: 'Revise anotações ou explique um conceito em voz alta.',
    category: 'estudo',
    xpReward: 50, goldReward: 15,
  },
  // ── Inglês ────────────────────────────────────────────────────────────
  {
    id: 'bm_ingles_extra',
    name: 'Língua do Além',
    icon: '🌐',
    description: 'O Sistema lança um desafio de linguagem.',
    task: 'Estude inglês por 10 minutos extras agora.',
    category: 'ingles',
    xpReward: 55, goldReward: 15,
  },
  {
    id: 'bm_frases',
    name: 'Código Cifrado',
    icon: '✍️',
    description: 'Escreva para gravar na memória.',
    task: 'Escreva 5 frases em inglês sobre seu dia.',
    category: 'ingles',
    xpReward: 45, goldReward: 10,
  },
  // ── Fé ────────────────────────────────────────────────────────────────
  {
    id: 'bm_oracao',
    name: 'Conexão Divina',
    icon: '🙏',
    description: 'O Monarca que ora, reina.',
    task: 'Ore ou medite por pelo menos 5 minutos agora.',
    category: 'fe',
    xpReward: 50, goldReward: 15,
  },
  {
    id: 'bm_versiculo',
    name: 'Luz nas Trevas',
    icon: '📖',
    description: 'Uma mensagem do Sistema chegou pelas escrituras.',
    task: 'Leia um versículo e reflita sobre ele por 3 minutos.',
    category: 'fe',
    xpReward: 40, goldReward: 10,
  },
  // ── Hábito ────────────────────────────────────────────────────────────
  {
    id: 'bm_dormir',
    name: 'Protocolo do Sistema',
    icon: '🌙',
    description: 'O descanso é parte do treino. Respeite-o.',
    task: 'Durma antes de meia-noite esta noite.',
    category: 'habito',
    xpReward: 50, goldReward: 10,
  },
  {
    id: 'bm_gratidao',
    name: 'Inventário do Guerreiro',
    icon: '⭐',
    description: 'Um caçador sabe o que tem e por quê luta.',
    task: 'Escreva 3 coisas pelas quais é grato hoje.',
    category: 'habito',
    xpReward: 40, goldReward: 10,
  },
]

/** 25% de chance por dia. Retorna null se não acionar ou se já tem missão ativa. */
export function rollBonusMission(date: string, hasActive: boolean): BonusMission | null {
  if (hasActive) return null
  if (Math.random() > 0.25) return null
  const def = BONUS_POOL[Math.floor(Math.random() * BONUS_POOL.length)]
  return {
    ...def,
    issuedAt: date,
    completed: false,
  }
}
