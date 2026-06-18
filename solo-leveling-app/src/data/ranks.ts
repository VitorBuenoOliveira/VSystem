import type { RankLabel } from '../types'

export interface RankConfig {
  rank: RankLabel
  minXp: number
  maxXp: number
  label: string
  color: string        // cor da borda/badge
  bgColor: string      // fundo do badge
}

export const RANKS: RankConfig[] = [
  { rank: 'F', minXp: 0,     maxXp: 500,      label: 'Caçador Iniciante',  color: '#94a3b8', bgColor: 'rgba(148,163,184,0.15)' },
  { rank: 'E', minXp: 500,   maxXp: 1500,     label: 'Caçador Bronze',     color: '#cd7f32', bgColor: 'rgba(205,127,50,0.15)'  },
  { rank: 'D', minXp: 1500,  maxXp: 3500,     label: 'Caçador Prata',      color: '#94a3b8', bgColor: 'rgba(148,163,184,0.2)'  },
  { rank: 'C', minXp: 3500,  maxXp: 7000,     label: 'Caçador Ouro',       color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)'  },
  { rank: 'B', minXp: 7000,  maxXp: 13000,    label: 'Caçador Elite',      color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)'   },
  { rank: 'A', minXp: 13000, maxXp: 22000,    label: 'Caçador Mestre',     color: '#7c5cbf', bgColor: 'rgba(124,92,191,0.2)'   },
  { rank: 'S', minXp: 22000, maxXp: Infinity, label: 'Caçador Lendário',   color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)'   },
]

// Bônus ao honrar o dia (estudo + amor + fé no mesmo dia)
export const HONOR_BONUS_XP = 30

// Teto de penalidade por dia (para não destruir o progresso em dias ruins)
export const MAX_DAILY_PENALTY = 50

export function getRankConfig(rank: RankLabel): RankConfig {
  return RANKS.find(r => r.rank === rank) ?? RANKS[0]
}
