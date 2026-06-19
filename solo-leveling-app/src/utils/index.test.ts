import { describe, it, expect } from 'vitest'
import {
  createInitialStats, applyDayEnd, calcAttributes, calcBaseAttributes,
  calcRank, calcLevel, calcVitals, checkHonorDay, dateStrFor, addDaysStr, todayStr,
  getTodayMissions,
} from './index'
import type { PlayerStats } from '../types'

function freshStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return { ...createInitialStats('Tester'), ...overrides }
}

describe('helpers de data', () => {
  it('dateStrFor usa data local (YYYY-MM-DD)', () => {
    const d = new Date(2026, 0, 5) // 5 jan 2026 local
    expect(dateStrFor(d)).toBe('2026-01-05')
  })
  it('addDaysStr soma dias sem virar o mês errado', () => {
    expect(addDaysStr('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDaysStr('2026-03-01', -1)).toBe('2026-02-28')
  })
  it('todayStr bate com dateStrFor(hoje)', () => {
    expect(todayStr()).toBe(dateStrFor(new Date()))
  })
})

describe('rank e level', () => {
  it('calcRank cresce com XP', () => {
    expect(calcRank(0)).toBe('F')
    expect(calcRank(600)).toBe('E')
    expect(calcRank(25000)).toBe('S')
  })
  it('calcLevel é monotônico e começa em 1', () => {
    expect(calcLevel(0)).toBe(1)
    expect(calcLevel(50000)).toBeGreaterThan(calcLevel(1000))
  })
})

describe('atributos', () => {
  it('atributos base mínimos = 1', () => {
    const a = calcBaseAttributes(freshStats())
    expect(a.forca).toBeGreaterThanOrEqual(1)
    expect(a.inteligencia).toBeGreaterThanOrEqual(1)
  })
  it('pontos alocados somam ao base', () => {
    const base = calcBaseAttributes(freshStats())
    const total = calcAttributes(freshStats({ allocatedPoints: { forca: 3 } }))
    expect(total.forca).toBe(base.forca + 3)
  })
})

describe('vitais (HP/MP)', () => {
  it('ficam entre 10% e 100% e crescem com o nível', () => {
    const v1 = calcVitals(freshStats({ level: 1 }))
    const v5 = calcVitals(freshStats({ level: 5 }))
    expect(v1.hpPct).toBeGreaterThanOrEqual(10)
    expect(v1.hpPct).toBeLessThanOrEqual(100)
    expect(v5.hpMax).toBeGreaterThan(v1.hpMax)
  })
})

describe('dia honrado', () => {
  it('exige mente + amor + fé no mesmo dia', () => {
    expect(checkHonorDay(['ds-30min', 'mensagem-ela', 'orar'])).toBe(true)
    expect(checkHonorDay(['ds-30min', 'orar'])).toBe(false)
  })
})

describe('applyDayEnd — núcleo da progressão', () => {
  it('dia honrado dá XP + bônus e incrementa streak/honra', () => {
    const stats = freshStats()
    // Completa TODAS as missões do dia → sem falhas e garante honra (mente+amor+fé)
    const allToday = getTodayMissions().map(m => m.id)
    const r = applyDayEnd(stats, allToday)
    expect(r.failedPrincipals.length).toBe(0)
    expect(r.honorBonus).toBe(true)
    expect(r.xpEarned).toBeGreaterThan(0)
    expect(r.newStats.currentStreak).toBe(1)
    expect(r.newStats.totalHonorDays).toBe(1)
  })

  it('falhar principal gera penalidade e zera streak', () => {
    const stats = freshStats({ currentStreak: 5, lastActiveDate: addDaysStr(todayStr(), -1) })
    const r = applyDayEnd(stats, []) // não cumpriu nenhuma principal
    expect(r.failedPrincipals.length).toBeGreaterThan(0)
    expect(r.newStats.currentStreak).toBe(0)
  })

  it('Escudo de Streak protege a sequência ao falhar', () => {
    const stats = freshStats({ currentStreak: 7, streakShieldActive: true, lastActiveDate: addDaysStr(todayStr(), -1) })
    const r = applyDayEnd(stats, [])
    expect(r.newStats.currentStreak).toBeGreaterThanOrEqual(1) // não zerou
    expect(r.newStats.streakShieldActive).toBe(false)          // escudo consumido
  })

  it('esforço extra ("fiz a mais") aumenta o XP ganho', () => {
    const base = applyDayEnd(freshStats(), ['ds-30min'])
    const boost = applyDayEnd(freshStats({ todayBonusEffort: ['ds-30min'] }), ['ds-30min'])
    expect(boost.xpEarned).toBeGreaterThan(base.xpEarned)
  })

  it('reseta a sessão do dia ao encerrar', () => {
    const r = applyDayEnd(freshStats(), ['orar'])
    expect(r.newStats.todayCompleted).toEqual([])
    expect(r.newStats.todayBonusEffort).toEqual([])
    expect(r.newStats.logs.length).toBe(1)
  })
})
