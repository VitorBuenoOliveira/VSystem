import type { PlayerStats } from '../types'

// ── Caminho das Sombras (evolução canônica do Solo Leveling) ───────────────
// Sem Classe (The Player) → Necromante → Lorde das Sombras → Monarca das Sombras
// Progressão única e linear, distinta das 5 classes de especialização (bônus).

export interface ShadowStage {
  id: string
  name: string
  icon: string
  image: string      // arte temática do estágio (em /shadow/)
  color: string
  lore: string
  /** Requisito legível para ALCANÇAR este estágio */
  requirement: string
  /** Atinge este estágio? */
  check: (s: PlayerStats) => boolean
}

export const SHADOW_STAGES: ShadowStage[] = [
  {
    id: 'player',
    name: 'Sem Classe — The Player',
    icon: '🎮',
    image: '/shadow/player.png',
    color: '#94a3b8',
    lore: 'O Sistema te escolheu. Você é o único capaz de evoluir além dos limites.',
    requirement: 'Início da jornada',
    check: () => true,
  },
  {
    id: 'necromante',
    name: 'Necromante',
    icon: '💀',
    image: '/shadow/necromante.png',
    color: '#9b7bff',
    lore: 'Você aprendeu a erguer sombras dos que caíram. Seu exército começa a nascer.',
    requirement: 'Invocar a 1ª Sombra',
    check: s => (s.shadows?.length ?? 0) >= 1,
  },
  {
    id: 'lorde',
    name: 'Lorde das Sombras',
    icon: '🌑',
    image: '/shadow/lorde.png',
    color: '#b388ff',
    lore: 'Seu exército cresce e te obedece. As trevas curvam-se à sua vontade.',
    requirement: 'Comandar 5 Sombras',
    check: s => (s.shadows?.length ?? 0) >= 5,
  },
  {
    id: 'monarca',
    name: 'Monarca das Sombras',
    icon: '👑',
    image: '/shadow/monarca.png',
    color: '#f0c040',
    lore: 'O ápice. Soberano absoluto das sombras — nada mais limita sua ascensão.',
    requirement: 'Atingir Rank S ou Ascender',
    check: s => s.rank === 'S' || (s.monarcaLevel ?? 0) >= 1,
  },
]

/** Índice do estágio atual (o maior alcançado; respeita override de debug). */
export function getShadowStageIndex(stats: PlayerStats): number {
  let idx = 0
  for (let i = 0; i < SHADOW_STAGES.length; i++) {
    if (SHADOW_STAGES[i].check(stats)) idx = i
  }
  return Math.max(idx, stats.debugShadowStage ?? 0)
}

export function getShadowStage(stats: PlayerStats): ShadowStage {
  return SHADOW_STAGES[getShadowStageIndex(stats)]
}

/** Progresso (0–1) rumo ao próximo estágio, quando mensurável (nº de sombras). */
export function getShadowProgress(stats: PlayerStats): { next: ShadowStage | null; pct: number; label: string } {
  const idx = getShadowStageIndex(stats)
  const next = SHADOW_STAGES[idx + 1] ?? null
  if (!next) return { next: null, pct: 100, label: 'Evolução máxima alcançada' }

  const shadows = stats.shadows?.length ?? 0
  if (next.id === 'necromante') return { next, pct: Math.min(100, shadows * 100), label: `${shadows}/1 sombra` }
  if (next.id === 'lorde')      return { next, pct: Math.min(100, (shadows / 5) * 100), label: `${shadows}/5 sombras` }
  if (next.id === 'monarca')    return { next, pct: stats.rank === 'S' ? 100 : 0, label: `Rank ${stats.rank} → S` }
  return { next, pct: 0, label: next.requirement }
}
