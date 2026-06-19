import { describe, it, expect } from 'vitest'
import { getShadowStageIndex, getShadowProgress, SHADOW_STAGES } from './shadowPath'
import { createInitialStats } from '../utils'
import type { PlayerStats, Shadow } from '../types'

function withShadows(n: number, extra: Partial<PlayerStats> = {}): PlayerStats {
  const shadows: Shadow[] = Array.from({ length: n }, (_, i) => ({
    id: `s${i}`, name: `Sombra ${i}`, missionId: `m${i}`, missionName: `M${i}`,
    tier: 'Comum', daysTotal: 21, basePower: 5, createdAt: '2026-01-01',
  }))
  return { ...createInitialStats('T'), shadows, ...extra }
}

describe('Caminho das Sombras', () => {
  it('começa em The Player', () => {
    expect(getShadowStageIndex(createInitialStats('T'))).toBe(0)
  })
  it('1 sombra → Necromante', () => {
    expect(SHADOW_STAGES[getShadowStageIndex(withShadows(1))].id).toBe('necromante')
  })
  it('5 sombras → Lorde das Sombras', () => {
    expect(SHADOW_STAGES[getShadowStageIndex(withShadows(5))].id).toBe('lorde')
  })
  it('Rank S → Monarca das Sombras', () => {
    expect(SHADOW_STAGES[getShadowStageIndex(withShadows(0, { rank: 'S' }))].id).toBe('monarca')
  })
  it('override de debug eleva o estágio', () => {
    expect(getShadowStageIndex(withShadows(0, { debugShadowStage: 3 }))).toBe(3)
  })
  it('progresso aponta para o próximo estágio', () => {
    const p = getShadowProgress(withShadows(0))
    expect(p.next?.id).toBe('necromante')
    expect(p.pct).toBeGreaterThanOrEqual(0)
  })
})
