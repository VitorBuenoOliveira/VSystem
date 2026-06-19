import type { DayOfWeek, RankLabel, PlayerStats, DailyLog, Mission, Shadow, SysLog, WeeklyMission, FloorGate, PlayerAttributes, MissionCategory, ClassId } from '../types'
import { getBossTier, getCurrentMonthModifier } from '../data/monthlyBoss'
import { getClassDef } from '../data/classes'
import { MISSIONS } from '../data/missions'
import { RANKS, HONOR_BONUS_XP, MAX_DAILY_PENALTY } from '../data/ranks'
import { INITIAL_DUNGEONS, getGateAtFloor } from '../data/dungeons'
import { ACHIEVEMENT_DEFS } from '../data/achievements'
import { DEFAULT_BOSS, getShadowTierConfig, getShadowPower, shadowNameFor, SHADOW_TIERS } from '../data/shadows'

// ── Data helpers ──────────────────────────────────────────────────────────

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function dateStrFor(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return dateStrFor(d)
}

const DAY_MAP: DayOfWeek[] = ['dom','seg','ter','qua','qui','sex','sab']

export function todayDayOfWeek(): DayOfWeek {
  return DAY_MAP[new Date().getDay()]
}

export function dayOfWeekFromDate(dateStr: string): DayOfWeek {
  return DAY_MAP[new Date(dateStr + 'T12:00:00').getDay()]
}

/** Retorna true se dateStr é estritamente anterior a hoje */
export function isBeforeToday(dateStr: string): boolean {
  return dateStr !== '' && dateStr < todayStr()
}

// ── Countdown ─────────────────────────────────────────────────────────────

/** Calcula quantos segundos faltam até o próximo resetTime 'HH:MM' */
export function secondsUntilReset(resetTime: string): number {
  const [h, m] = resetTime.split(':').map(Number)
  const now    = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return Math.floor((target.getTime() - now.getTime()) / 1000)
}

export function formatCountdown(seconds: number): string {
  const h  = Math.floor(seconds / 3600)
  const m  = Math.floor((seconds % 3600) / 60)
  const s  = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

// ── Missões ───────────────────────────────────────────────────────────────

export function getAllMissions(customMissions: Mission[] = [], penaltyMissions: Mission[] = []) {
  return [...MISSIONS, ...customMissions, ...penaltyMissions]
}

export function getMissionsForDay(day: DayOfWeek, customMissions: Mission[] = [], penaltyMissions: Mission[] = []) {
  return getAllMissions(customMissions, penaltyMissions).filter(m => m.availableDays.includes(day))
}

export function getTodayMissions(customMissions: Mission[] = [], penaltyMissions: Mission[] = []) {
  return getMissionsForDay(todayDayOfWeek(), customMissions, penaltyMissions)
}

/** Busca nome de uma missão em todas as fontes (base + custom + penalty) */
export function getMissionName(id: string, stats: PlayerStats): string {
  return getAllMissions(stats.customMissions, stats.penaltyMissions).find(m => m.id === id)?.name
    ?? MISSIONS.find(m => m.id === id)?.name
    ?? id
}

// ── Player Attributes ─────────────────────────────────────────────────────

/** Calcula os atributos base (só por histórico de missões, sem alocação manual) */
export function calcBaseAttributes(stats: PlayerStats): PlayerAttributes {
  const allMs  = getAllMissions(stats.customMissions, stats.penaltyMissions)
  const catMap = new Map(allMs.map(m => [m.id, m.category]))

  const counts: Record<string, number> = {}
  for (const log of stats.logs) {
    for (const id of log.completedMissions) {
      const cat = catMap.get(id) ?? 'habito'
      counts[cat] = (counts[cat] ?? 0) + 1
    }
  }

  // Curva de raiz quadrada: ~4 conclusões = nível 2, ~9 = nível 3, ~16 = nível 4...
  // Progresso visível cedo e que naturalmente exige constância para os níveis altos.
  const curve = (n: number) => Math.max(1, Math.floor(Math.sqrt(n)))

  return {
    forca:        curve(counts['saude'] ?? 0),
    inteligencia: curve((counts['estudo'] ?? 0) + (counts['ingles'] ?? 0)),
    espiritual:   curve((counts['fe'] ?? 0) + (counts['carater'] ?? 0)),
    carisma:      curve((counts['amor'] ?? 0) + (counts['familia'] ?? 0)),
    vitalidade:   curve(counts['habito'] ?? 0) + Math.floor(stats.longestStreak / 10),
  }
}

/** Atributos finais = base automático + pontos alocados manualmente */
export function calcAttributes(stats: PlayerStats): PlayerAttributes {
  const base = calcBaseAttributes(stats)
  const alloc = stats.allocatedPoints ?? {}
  return {
    forca:        base.forca        + (alloc.forca        ?? 0),
    inteligencia: base.inteligencia + (alloc.inteligencia ?? 0),
    espiritual:   base.espiritual   + (alloc.espiritual   ?? 0),
    carisma:      base.carisma      + (alloc.carisma      ?? 0),
    vitalidade:   base.vitalidade   + (alloc.vitalidade   ?? 0),
  }
}

/**
 * Sinais vitais REAIS, derivados do comportamento recente (últimos 7 dias).
 * HP = saúde física (saúde/hábito cumpridos, penalizado por falhas).
 * MP = energia mental/espiritual (fé/estudo/caráter cumpridos).
 * Ambos crescem com o nível (sensação de RPG) e refletem o estado atual.
 */
export function calcVitals(stats: PlayerStats): {
  hp: number; hpMax: number; hpPct: number
  mp: number; mpMax: number; mpPct: number
} {
  const allMs  = getAllMissions(stats.customMissions, stats.penaltyMissions)
  const catMap = new Map(allMs.map(m => [m.id, m.category]))

  const last7 = stats.logs.slice(-7)
  const dayN  = Math.max(1, last7.length)

  let healthDays = 0, mindDays = 0, failPenalty = 0
  for (const log of last7) {
    const cats = log.completedMissions.map(id => catMap.get(id) ?? 'habito')
    if (cats.some(c => c === 'saude' || c === 'habito')) healthDays++
    if (cats.some(c => c === 'fe' || c === 'estudo' || c === 'carater')) mindDays++
    failPenalty += (log.failedPrincipals?.length ?? 0)
  }

  // Pools crescem com o nível
  const hpMax = 100 + (stats.level - 1) * 20
  const mpMax = 100 + (stats.level - 1) * 20

  // Base + consistência − falhas (HP). MP não é penalizado por falha, só reflete energia.
  const hpRatio = Math.max(0.1, Math.min(1, 0.4 + (healthDays / dayN) * 0.6 - failPenalty * 0.05))
  const mpRatio = Math.max(0.1, Math.min(1, 0.3 + (mindDays / dayN) * 0.7))

  return {
    hp: Math.round(hpMax * hpRatio), hpMax, hpPct: Math.round(hpRatio * 100),
    mp: Math.round(mpMax * mpRatio), mpMax, mpPct: Math.round(mpRatio * 100),
  }
}

// ── Class / Relic bonus helpers ───────────────────────────────────────────

/** XP mult para uma categoria específica (classe + relíquias + modificador mensal) */
export function getCategoryXpMult(category: MissionCategory, stats: PlayerStats): number {
  let mult = 1.0

  // Classe ativa
  const cls = getClassDef(stats.activeClass ?? null)
  if (cls?.bonuses.xpMultByCategory?.[category]) {
    mult *= cls.bonuses.xpMultByCategory[category]!
  }
  if (cls?.bonuses.globalXpMult) mult *= cls.bonuses.globalXpMult

  // Relíquias equipadas
  const equipped = (stats.equippedRelics ?? [])
  for (const rId of equipped) {
    const r = (stats.relicInventory ?? []).find(r => r.id === rId)
    if (!r) continue
    if (r.bonuses.xpMultByCategory?.[category]) mult *= r.bonuses.xpMultByCategory[category]!
    if (r.bonuses.globalXpMult) mult *= r.bonuses.globalXpMult
  }

  // Modificador mensal
  const mod = getCurrentMonthModifier()
  if (mod.categoryXpBonus?.category === category) {
    mult *= 1 + mod.categoryXpBonus.pct / 100
  }

  // Monarca level: +5% por nível de ascensão
  const monarcaBonus = 1 + ((stats.monarcaLevel ?? 0) * 0.05)
  mult *= monarcaBonus

  // Perks da loja
  const perks = stats.ownedPerks ?? []
  if (perks.includes('hunter_focus') && category === 'saude') mult *= 1.1    // principal é saúde/habito — aplicado abaixo por tipo
  if (perks.includes('scholar_mind') && (category === 'estudo' || category === 'ingles')) mult *= 1.15
  if (perks.includes('iron_body')    && category === 'saude')  mult *= 1.15
  if (perks.includes('sharp_tongue') && category === 'ingles') mult *= 1.15
  if (perks.includes('faith_boost')  && category === 'fe')     mult *= 1.20
  if (perks.includes('bond_power')   && category === 'amor')   mult *= 1.15
  if (perks.includes('double_honor')) mult *= 1.0  // aplicado no honorXp

  return mult
}

/** Penalty mult (classe + relíquias + perks) */
function getPenaltyMult(stats: PlayerStats): number {
  let mult = 1.0
  const cls = getClassDef(stats.activeClass ?? null)
  if (cls?.bonuses.penaltyMult) mult *= cls.bonuses.penaltyMult
  for (const rId of (stats.equippedRelics ?? [])) {
    void rId
  }
  const mod = getCurrentMonthModifier()
  if (mod.penaltyMult) mult *= mod.penaltyMult
  // Perk: Vontade de Ferro -20%, Escudo do Hábito -30% (habit missions)
  if ((stats.ownedPerks ?? []).includes('iron_will')) mult *= 0.80
  return mult
}

/** Bonus XP de Dia Honrado (classe + relíquias + modificador + perks) */
function getHonorBonusXp(stats: PlayerStats): number {
  let bonus = HONOR_BONUS_XP
  const cls = getClassDef(stats.activeClass ?? null)
  if (cls?.bonuses.honorDayBonusXp) bonus += cls.bonuses.honorDayBonusXp
  for (const rId of (stats.equippedRelics ?? [])) {
    const r = (stats.relicInventory ?? []).find(r => r.id === rId)
    if (r?.bonuses.honorDayBonusXp) bonus += r.bonuses.honorDayBonusXp
  }
  const mod = getCurrentMonthModifier()
  if (mod.honorDayBonusXp) bonus += mod.honorDayBonusXp
  // Perk: Honra em Dobro +50%
  if ((stats.ownedPerks ?? []).includes('double_honor')) bonus = Math.round(bonus * 1.5)
  return bonus
}

/** Boss personal dano mult (classe + relíquias) */
function getBossDamageMult(stats: PlayerStats): number {
  let mult = 1.0
  const cls = getClassDef(stats.activeClass ?? null)
  if (cls?.bonuses.bossDamageMult) mult *= cls.bonuses.bossDamageMult
  for (const rId of (stats.equippedRelics ?? [])) {
    const r = (stats.relicInventory ?? []).find(r => r.id === rId)
    if (r?.bonuses.bossDamageMult) mult *= r.bonuses.bossDamageMult
  }
  return mult
}

/** Boss mensal dano mult */
function getMonthlyBossDamageMult(stats: PlayerStats): number {
  let mult = 1.0
  const cls = getClassDef(stats.activeClass ?? null)
  if (cls?.bonuses.monthlyBossDamageMult) mult *= cls.bonuses.monthlyBossDamageMult
  return mult
}

/** Checa se a relíquia da imortalidade pode cancelar penalidade */
function canCancelPenalty(stats: PlayerStats): boolean {
  const week = getWeekStartStr()
  const cancelRelic = (stats.equippedRelics ?? []).some(rId => {
    const r = (stats.relicInventory ?? []).find(r => r.id === rId)
    return (r?.bonuses.penaltyCancelPerWeek ?? 0) > 0
  })
  if (!cancelRelic) return false
  if (stats.penaltyCancelWeek !== week) return true  // nova semana, contador zerou
  return (stats.penaltyCancelledThisWeek ?? 0) < 1
}

function getWeekStartStr(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return dateStrFor(d)
}

// ── Rank / Level ──────────────────────────────────────────────────────────

export function calcRank(totalXp: number): RankLabel {
  let result: RankLabel = 'F'
  for (const r of RANKS) {
    if (totalXp >= r.minXp) result = r.rank
  }
  return result
}

export function getRankProgress(totalXp: number): { current: number; needed: number; pct: number } {
  const rank = RANKS.find(r => calcRank(totalXp) === r.rank) ?? RANKS[0]
  const next  = RANKS.find(r => r.minXp > rank.minXp)
  if (!next) return { current: totalXp - rank.minXp, needed: totalXp - rank.minXp, pct: 100 }
  const current = totalXp - rank.minXp
  const needed  = next.minXp - rank.minXp
  return { current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) }
}

export function calcLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 50)) + 1
}

// ── Honrar o Dia ─────────────────────────────────────────────────────────

export function checkHonorDay(completedIds: string[], customMissions: Mission[] = []): boolean {
  const completed = getAllMissions(customMissions).filter(m => completedIds.includes(m.id))
  // Dia Honrado = cuidou da mente (estudo OU inglês) + do amor + da fé
  return (
    completed.some(m => m.category === 'estudo' || m.category === 'ingles') &&
    completed.some(m => m.category === 'amor') &&
    completed.some(m => m.category === 'fe')
  )
}

// ── Boss helpers ──────────────────────────────────────────────────────────

export function missionBossDamage(xpReward: number): number {
  return Math.max(5, Math.round(xpReward / 4))
}

// ── Shadow helpers ────────────────────────────────────────────────────────

export function calcPassiveShadowXp(shadows: Shadow[], activeXpToday: number): number {
  const raw = shadows.reduce((sum, s) => sum + getShadowPower(s.basePower, s.daysTotal), 0)
  const cap = Math.max(10, Math.round(activeXpToday * 0.30))
  return Math.min(raw, cap)
}

// ── Syslog helper ─────────────────────────────────────────────────────────

export function sysLogEntry(text: string, xp?: number, gold?: number): SysLog {
  const now  = new Date()
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return { time, text, ...(xp   !== undefined ? { xp }   : {}),
                        ...(gold !== undefined ? { gold } : {}) }
}

// ── Encerrar dia (núcleo) ─────────────────────────────────────────────────

/** Recalcula progresso das missões semanais com base nos logs da semana */
function updateWeeklyProgress(
  weeklyMissions: WeeklyMission[],
  logs: DailyLog[],
  allMissions: Mission[],
): { updated: WeeklyMission[]; xpBonus: number; goldBonus: number; newlyCompleted: string[] } {
  let xpBonus = 0, goldBonus = 0
  const newlyCompleted: string[] = []

  const updated = weeklyMissions.map(wm => {
    const weekLogs = logs.filter(l => l.date >= wm.weekStart)
    let progress = 0
    if (wm.goalType === 'missions') {
      progress = weekLogs.reduce((sum, l) => sum + l.completedMissions.length, 0)
    } else if (wm.goalType === 'category' && wm.goalCategory) {
      const catIds = allMissions.filter(m => m.category === wm.goalCategory).map(m => m.id)
      progress = weekLogs.reduce(
        (sum, l) => sum + l.completedMissions.filter(id => catIds.includes(id)).length, 0
      )
    } else if (wm.goalType === 'honor') {
      progress = weekLogs.filter(l => l.honoredDay).length
    }

    const justCompleted = !wm.completed && progress >= wm.goal
    if (justCompleted) {
      xpBonus += wm.xpReward
      goldBonus += wm.goldReward
      newlyCompleted.push(wm.id)
    }
    return { ...wm, progress: Math.min(progress, wm.goal), completed: wm.completed || justCompleted }
  })

  return { updated, xpBonus, goldBonus, newlyCompleted }
}

export interface DayEndResult {
  xpEarned: number
  xpLost: number
  netXp: number
  passiveXp: number
  failedPrincipals: string[]
  honorBonus: boolean
  newTotalXp: number
  newRank: RankLabel
  newLevel: number
  newStats: PlayerStats
  unlockedAchievements: string[]
  dungeonAdvances: { dungeonId: string; newFloor: number }[]
  newShadows: Shadow[]
  upgradedShadows: string[]
  bossDefeated: boolean
  bossDamageDealt: number
  wasAutoReset: boolean
  weeklyCompleted: string[]
  keysEarned: number
  penaltyCancelled: boolean       // relíquia da imortalidade cancelou penalidade
  newRelicObtained: string | null // ID da relíquia obtida hoje (boss drop)
  prophecyCompleted: boolean
  newClassUnlocked: ClassId | null
}

/**
 * Aplica encerramento de dia.
 * @param forDate  Data no formato YYYY-MM-DD do dia que está sendo encerrado
 *                 (default = hoje). Usado no reset automático para processar
 *                 o dia anterior corretamente.
 */
export function applyDayEnd(
  stats: PlayerStats,
  todayCompleted: string[],
  forDate?: string,
  wasAutoReset = false,
): DayEndResult {
  const date       = forDate ?? todayStr()
  const day        = dayOfWeekFromDate(date)
  const allMissions = getAllMissions(stats.customMissions, stats.penaltyMissions)
  const dayMissions = getMissionsForDay(day, stats.customMissions, stats.penaltyMissions)
  const principals  = dayMissions.filter(m => m.type === 'principal')
  const failed      = principals.filter(m => !todayCompleted.includes(m.id))

  // XP ativo com multiplicadores de classe + relíquias + modificador mensal + perks
  const completedMissions = dayMissions.filter(m => todayCompleted.includes(m.id))
  const baseEarned = completedMissions.reduce((sum, m) => {
    let mult = getCategoryXpMult(m.category, stats)
    // Perk: Foco do Caçador +10% em principais
    if ((stats.ownedPerks ?? []).includes('hunter_focus') && m.type === 'principal') mult *= 1.10
    return sum + Math.round(m.xpReward * mult)
  }, 0)

  // Esforço extra: missões marcadas como "fiz a mais" rendem +50% de XP (sobre a base)
  const effortIds = stats.todayBonusEffort ?? []
  const effortBonus = completedMissions
    .filter(m => effortIds.includes(m.id))
    .reduce((sum, m) => sum + Math.round(m.xpReward * 0.5), 0)

  const earned = baseEarned + effortBonus

  // Penalidade com multiplicadores
  const penaltyMult = getPenaltyMult(stats)
  const rawLost = failed.reduce((sum, m) => sum + m.xpPenalty, 0)
  // Relíquia da Imortalidade cancela 1 penalidade/semana
  const penaltyCancelled = failed.length > 0 && canCancelPenalty(stats)
  // Perk habit_shield: -30% penalidade em missões de hábito
  const habitPerkMult = (stats.ownedPerks ?? []).includes('habit_shield') ? 0.70 : 1.0
  const effectiveLost = penaltyCancelled ? 0 : Math.round(rawLost * penaltyMult * habitPerkMult)
  const lost = Math.min(effectiveLost, MAX_DAILY_PENALTY)

  // Honra com bônus de classe/relíquias/modificador
  const honored = checkHonorDay(todayCompleted, stats.customMissions)
  const honorXp = honored ? getHonorBonusXp(stats) : 0

  // ── Shadow Army ───────────────────────────────────────────────────────

  const newStreaks: Record<string, number> = { ...stats.missionStreaks }
  for (const m of allMissions) {
    if (todayCompleted.includes(m.id)) {
      newStreaks[m.id] = (newStreaks[m.id] ?? 0) + 1
    } else if (dayMissions.find(dm => dm.id === m.id)) {
      newStreaks[m.id] = 0
    }
  }

  const newShadows: Shadow[]    = []
  const upgradedShadows: string[] = []
  let updatedShadows = [...stats.shadows]

  for (const m of allMissions) {
    const streak = newStreaks[m.id] ?? 0
    if (streak === 0) continue

    const existingShadow = updatedShadows.find(s => s.missionId === m.id)

    if (!existingShadow && streak >= SHADOW_TIERS[0].days) {
      const shadow: Shadow = {
        id: `shadow-${m.id}`,
        name: shadowNameFor(m.name),
        missionId: m.id,
        missionName: m.name,
        tier: 'Comum',
        daysTotal: streak,
        basePower: Math.max(3, Math.round(m.xpReward / 8)),
        createdAt: date,
      }
      newShadows.push(shadow)
      updatedShadows.push(shadow)
    } else if (existingShadow) {
      const prevTier = existingShadow.tier
      const newTier  = getShadowTierConfig(streak).tier
      if (newTier !== prevTier) upgradedShadows.push(existingShadow.id)
      updatedShadows = updatedShadows.map(s =>
        s.id === existingShadow.id ? { ...s, daysTotal: streak, tier: newTier } : s
      )
    }
  }

  const passiveXp = calcPassiveShadowXp(updatedShadows, earned)

  // ── Boss ─────────────────────────────────────────────────────────────

  let bossDamageDealt = 0
  let bossDefeated    = false
  let updatedBoss     = stats.boss

  if (updatedBoss && !updatedBoss.defeated) {
    const completedMs = dayMissions.filter(m => todayCompleted.includes(m.id))
    const damageMult = getBossDamageMult(stats)
    bossDamageDealt = Math.round(completedMs.reduce((sum, m) => sum + missionBossDamage(m.xpReward), 0) * damageMult)
    const newHp = Math.max(0, updatedBoss.hp - bossDamageDealt)
    bossDefeated = newHp <= 0
    updatedBoss  = { ...updatedBoss, hp: newHp, defeated: bossDefeated }
  }

  const bossRewardXp   = bossDefeated ? (updatedBoss?.rewXp   ?? 0) : 0
  const bossRewardGold = bossDefeated ? (updatedBoss?.rewGold ?? 0) : 0

  // ── Penalty quests ────────────────────────────────────────────────────

  let updatedPenalty = stats.penaltyMissions.filter(m => !todayCompleted.includes(m.id))
  if (failed.length > 0 && !updatedPenalty.some(p => p.type === 'penalty')) {
    updatedPenalty.push({
      id: `penalty-${date}`,
      name: `⚠ PENALIDADE [${date}]: Conclua ${failed.length} missão(ões) extra hoje`,
      type: 'penalty',
      category: 'habito',
      xpReward: 0,
      xpPenalty: 0,
      availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
      estimatedMinutes: 0,
      icon: '💀',
    })
  }

  // ── Totais ────────────────────────────────────────────────────────────

  // Total de missões completadas em todos os logs (para portões)
  const totalMissions = stats.logs.reduce((s, l) => s + l.completedMissions.length, 0) + todayCompleted.length

  // Avanço de masmorras (calculado aqui para alimentar o perk dungeon_master)
  const newDungeons = applyDungeonAdvances(stats.dungeons, allMissions, todayCompleted, stats, totalMissions)
  const dungeonsAdvancedToday = newDungeons.filter(nd => {
    const prev = stats.dungeons.find(d => d.id === nd.id)
    return prev ? nd.currentFloor > prev.currentFloor : false
  }).length

  // ── Boss Mensal ───────────────────────────────────────────────────────

  let updatedMonthlyBoss = stats.monthlyBoss
  let monthlyBossRewardXp   = 0
  let monthlyBossRewardGold = 0

  if (updatedMonthlyBoss && !updatedMonthlyBoss.defeated) {
    const attrs      = calcAttributes(stats)
    const tier       = getBossTier(attrs, updatedMonthlyBoss)
    const cond       = updatedMonthlyBoss.damageCondition
    const condMet    = tier !== 'none' && (
      cond === 'any'            ? true :
      cond === 'no_fail'        ? failed.length === 0 :
      cond === 'all_principals' ? principals.every(p => todayCompleted.includes(p.id)) :
      cond === 'honor'          ? (checkHonorDay(todayCompleted, stats.customMissions) && failed.length === 0) :
      false
    )

    if (condMet) {
      const completedMs = dayMissions.filter(m => todayCompleted.includes(m.id))
      const monthlyMult = getMonthlyBossDamageMult(stats)
      // Modificador mensal: categoria com dano bônus
      const mod = getCurrentMonthModifier()
      const mDmg = Math.round(completedMs.reduce((s, m) => {
        let dmg = missionBossDamage(m.xpReward)
        if (mod.bossDamageBonus?.category === m.category) {
          dmg = Math.round(dmg * (1 + mod.bossDamageBonus.pct / 100))
        }
        return s + dmg
      }, 0) * monthlyMult)
      const newHp = Math.max(0, updatedMonthlyBoss.hp - mDmg)
      updatedMonthlyBoss = { ...updatedMonthlyBoss, hp: newHp, defeated: newHp <= 0 }
      if (updatedMonthlyBoss.defeated) {
        monthlyBossRewardXp   = updatedMonthlyBoss.rewXp
        monthlyBossRewardGold = updatedMonthlyBoss.rewGold
      }
    }
  }

  const totalXpGain = earned + honorXp + passiveXp + bossRewardXp + monthlyBossRewardXp
  const newTotalXp  = Math.max(0, stats.totalXp + totalXpGain - lost)
  const newRank     = calcRank(newTotalXp)
  const newLevel    = calcLevel(newTotalXp)

  // Ouro base + bônus de perks
  const perks = stats.ownedPerks ?? []
  let goldBonus = 0
  if (honored && perks.includes('gold_sense'))    goldBonus += 5
  if (honored && perks.includes('double_honor'))  goldBonus += 5   // bônus extra por honra em dobro
  if (bossDefeated && perks.includes('gold_hunter')) goldBonus += 10
  if (updatedMonthlyBoss?.defeated && perks.includes('gold_hunter')) goldBonus += 10
  if (perks.includes('shadow_treasury')) goldBonus += updatedShadows.length * 2
  const newGold = stats.gold + bossRewardGold + monthlyBossRewardGold + goldBonus

  // Streak: conta se o dia foi LIMPO (nenhuma principal falhou), independente de
  // ter sido encerrado manualmente ou pelo auto-reset. Assim, esquecer de apertar
  // "Encerrar Dia" não quebra a sequência se as missões foram cumpridas — só um
  // dia realmente perdido (com principais falhadas) zera a streak.
  const yesterday    = new Date(date + 'T12:00:00'); yesterday.setDate(yesterday.getDate() - 1)
  const prevDay      = dateStrFor(yesterday)

  // Proteção de streak: Escudo de Streak (consumível) ou Sangue Frio (perk, 1x/mês).
  // Se uma principal falhou mas há proteção ativa, o streak NÃO quebra (mantém o valor).
  const monthOf            = date.slice(0, 7)  // YYYY-MM
  const ownedPerksList     = stats.ownedPerks ?? []
  const shieldActive       = stats.streakShieldActive === true
  const coldBloodAvailable = ownedPerksList.includes('cold_blood') && stats.coldBloodUsedMonth !== monthOf
  let   streakConsumeShield   = false
  let   streakConsumeColdBlood = false
  if (failed.length > 0) {
    if (shieldActive)            streakConsumeShield   = true
    else if (coldBloodAvailable) streakConsumeColdBlood = true
  }
  const streakProtected = streakConsumeShield || streakConsumeColdBlood

  const newStreak    = (failed.length === 0)
    ? (stats.lastActiveDate === prevDay || stats.lastActiveDate === date ? stats.currentStreak + 1 : 1)
    : (streakProtected ? Math.max(1, stats.currentStreak) : 0)
  const newLongest   = Math.max(stats.longestStreak, newStreak)

  // Log do dia
  const log: DailyLog = {
    date,
    completedMissions: todayCompleted,
    failedPrincipals: failed.map(m => m.id),
    totalXpEarned: totalXpGain,
    totalXpLost: lost,
    honoredDay: honored,
    passiveXp,
    bossDefeated,
  }

  // Syslog
  const newSysLogs: SysLog[] = [...stats.sysLog]
  const label = wasAutoReset ? '⚡ Reset automático' : 'Dia encerrado'
  if (earned > 0 || lost > 0)
    newSysLogs.unshift(sysLogEntry(`${label} — ${todayCompleted.length} missões completadas`, earned + honorXp, undefined))
  if (passiveXp > 0)
    newSysLogs.unshift(sysLogEntry(`🌑 Exército treinou (${updatedShadows.length} sombras)`, passiveXp))
  if (bossDefeated)
    newSysLogs.unshift(sysLogEntry(`☠️ Boss derrotado: ${stats.boss?.name}`, bossRewardXp, bossRewardGold))
  if (updatedMonthlyBoss?.defeated && !stats.monthlyBoss?.defeated)
    newSysLogs.unshift(sysLogEntry(`👑 Boss Mensal derrotado: ${updatedMonthlyBoss.name}`, monthlyBossRewardXp, monthlyBossRewardGold))
  if (failed.length && penaltyCancelled)
    newSysLogs.unshift(sysLogEntry(`💀 Relíquia da Imortalidade cancelou a penalidade desta semana!`))
  if (failed.length && !penaltyCancelled)
    newSysLogs.unshift(sysLogEntry(`⚠ ${failed.length} missão(ões) principal(is) falharam`))
  if (streakConsumeShield)
    newSysLogs.unshift(sysLogEntry(`🛡️ Escudo de Streak protegeu sua sequência (${newStreak} dias)`))
  else if (streakConsumeColdBlood)
    newSysLogs.unshift(sysLogEntry(`🧊 Sangue Frio absorveu a falta deste mês — streak mantido (${newStreak} dias)`))
  newShadows.forEach(s => newSysLogs.unshift(sysLogEntry(`🌑 Nova sombra: ${s.name}`)))
  upgradedShadows.forEach(id => {
    const s = updatedShadows.find(x => x.id === id)
    if (s) newSysLogs.unshift(sysLogEntry(`⬆ Sombra evoluiu: ${s.name} → ${s.tier}`))
  })

  // Level-up: 2 pontos de atributo por nível ganho.
  // Se o nível cair (penalidade), os pontos NÃO são removidos — só somamos em subida.
  const levelsGained = newLevel - stats.level
  const newFreePoints = (stats.freeAttributePoints ?? 0) + (levelsGained > 0 ? levelsGained * 2 : 0)
  if (levelsGained > 0)
    newSysLogs.unshift(sysLogEntry(`⬆ Level ${newLevel}! +${levelsGained * 2} pontos de atributo`))

  // Chaves de masmorra: dia honrado (+1), boss (+2), boss mensal (+3)
  const monthlyDefeatedNow = !!updatedMonthlyBoss?.defeated && !stats.monthlyBoss?.defeated
  // Perk dungeon_master: +1 chave por andar de masmorra avançado hoje
  const dungeonMasterBonus = (stats.ownedPerks ?? []).includes('dungeon_master') ? dungeonsAdvancedToday : 0
  const MAX_KEYS = 10
  let keysEarned = (honored ? 1 : 0) + (bossDefeated ? 2 : 0) + (monthlyDefeatedNow ? 3 : 0) + dungeonMasterBonus
  // Aplicar cap: não ultrapassa MAX_KEYS
  const currentKeys = stats.dungeonKeys ?? 0
  keysEarned = Math.max(0, Math.min(keysEarned, MAX_KEYS - currentKeys))
  if (keysEarned > 0)
    newSysLogs.unshift(sysLogEntry(`🔑 +${keysEarned} chave(s) de masmorra`))

  // Penalty cancel tracking
  const weekStr = getWeekStartStr()
  const newPenaltyCancelledThisWeek = penaltyCancelled
    ? (stats.penaltyCancelWeek === weekStr ? (stats.penaltyCancelledThisWeek ?? 0) + 1 : 1)
    : (stats.penaltyCancelWeek === weekStr ? (stats.penaltyCancelledThisWeek ?? 0) : 0)

  // Novo estado
  const newStats: PlayerStats = {
    ...stats,
    totalXp: newTotalXp,
    currentXp: newTotalXp,
    rank: newRank,
    level: newLevel,
    gold: newGold,
    totalHonorDays: honored ? stats.totalHonorDays + 1 : stats.totalHonorDays,
    currentStreak: newStreak,
    longestStreak: newLongest,
    dungeons: newDungeons,
    logs: [...stats.logs, log],
    lastActiveDate: date,
    todayCompleted: [],
    todayBonusEffort: [],
    shadows: updatedShadows,
    missionStreaks: newStreaks,
    boss: updatedBoss,
    monthlyBoss: updatedMonthlyBoss,
    penaltyMissions: updatedPenalty,
    freeAttributePoints: newFreePoints,
    dungeonKeys: (stats.dungeonKeys ?? 0) + keysEarned,
    penaltyCancelledThisWeek: newPenaltyCancelledThisWeek,
    penaltyCancelWeek: weekStr,
    // Consome a proteção de streak usada hoje
    streakShieldActive: streakConsumeShield ? false : stats.streakShieldActive,
    coldBloodUsedMonth: streakConsumeColdBlood ? monthOf : stats.coldBloodUsedMonth,
    sysLog: newSysLogs.slice(0, 100),
  }

  // ── Weekly missions ───────────────────────────────────────────────────

  const logsWithToday = [...stats.logs, log]
  const weeklyResult  = updateWeeklyProgress(newStats.weeklyMissions, logsWithToday, allMissions)
  newStats.weeklyMissions = weeklyResult.updated
  if (weeklyResult.xpBonus > 0 || weeklyResult.goldBonus > 0) {
    newStats.totalXp  += weeklyResult.xpBonus
    newStats.currentXp += weeklyResult.xpBonus
    newStats.gold     += weeklyResult.goldBonus
    newStats.rank      = calcRank(newStats.totalXp)
    newStats.level     = calcLevel(newStats.totalXp)
    if (weeklyResult.xpBonus > 0)
      newSysLogs.unshift(sysLogEntry('★ Missão semanal concluída!', weeklyResult.xpBonus, weeklyResult.goldBonus || undefined))
  }
  // Cada missão semanal concluída também rende 1 chave (respeitando cap)
  if (weeklyResult.newlyCompleted.length > 0) {
    const weeklyKeys = Math.max(0, Math.min(weeklyResult.newlyCompleted.length, MAX_KEYS - newStats.dungeonKeys))
    if (weeklyKeys > 0) {
      newStats.dungeonKeys += weeklyKeys
      keysEarned += weeklyKeys
      newSysLogs.unshift(sysLogEntry(`🔑 +${weeklyKeys} chave(s) por missão semanal`))
    }
  }
  newStats.sysLog = newSysLogs.slice(0, 100)

  // Achievements
  const unlockedNow = ACHIEVEMENT_DEFS
    .filter(def => !stats.achievements.find(a => a.id === def.id && a.unlocked))
    .filter(def => def.check(newStats))
    .map(def => ({ id: def.id, icon: def.icon, name: def.name, description: def.description, unlocked: true, unlockedAt: date }))

  newStats.achievements = [
    ...stats.achievements.filter(a => !unlockedNow.find(u => u.id === a.id)),
    ...unlockedNow,
  ]

  const dungeonAdvances = newStats.dungeons
    .map((d, i) => ({ d, old: stats.dungeons[i] }))
    .filter(({ d, old }) => d.currentFloor > old.currentFloor)
    .map(({ d }) => ({ dungeonId: d.id, newFloor: d.currentFloor }))

  return {
    xpEarned: earned + honorXp,
    xpLost: lost,
    netXp: totalXpGain - lost,
    passiveXp,
    failedPrincipals: failed.map(m => m.id),
    honorBonus: honored,
    newTotalXp,
    newRank,
    newLevel,
    newStats,
    unlockedAchievements: unlockedNow.map(a => a.id),
    dungeonAdvances,
    newShadows,
    upgradedShadows,
    bossDefeated,
    bossDamageDealt,
    wasAutoReset,
    weeklyCompleted: weeklyResult.newlyCompleted,
    keysEarned,
    penaltyCancelled,
    newRelicObtained: null,   // preenchido no usePlayerStore após drop
    prophecyCompleted: false, // preenchido no usePlayerStore
    newClassUnlocked: null,   // preenchido no usePlayerStore
  }
}

function applyDungeonAdvances(
  dungeons: PlayerStats['dungeons'],
  allMissions: Mission[],
  todayCompleted: string[],
  stats: PlayerStats,
  totalMissions: number,
) {
  return dungeons.map(d => {
    const missionDone = allMissions.some(m => m.dungeonId === d.id && todayCompleted.includes(m.id))
    if (!missionDone || d.currentFloor >= d.totalFloors) return d

    // Verifica se o próximo andar tem um portão bloqueando
    const nextFloor = d.currentFloor + 1
    const gate = getGateAtFloor(d.id, nextFloor)
    if (gate) {
      // Bloqueado se requisito não atendido OU se o portão ainda não foi aberto com uma chave
      if (!checkGateRequirement(gate, stats, totalMissions)) return d
      if (!(stats.openedGates ?? []).includes(gateId(d.id, nextFloor))) return d
    }

    return { ...d, currentFloor: nextFloor }
  })
}

/** ID canônico de um portão para o registro de portões abertos */
export function gateId(dungeonId: string, floor: number): string {
  return `${dungeonId}:${floor}`
}

// ── Auto-reset ────────────────────────────────────────────────────────────

/**
 * Verifica se o app foi aberto depois de um dia sem "Encerrar Dia" manual.
 * Retorna a data do dia perdido, ou null se não há reset pendente.
 */
export function getPendingResetDate(stats: PlayerStats): string | null {
  const last = stats.lastActiveDate
  if (!last || last === todayStr()) return null
  // Há pelo menos um dia entre lastActiveDate e hoje
  return last
}

// ── Floor Gate helpers ────────────────────────────────────────────────────

export function checkGateRequirement(gate: FloorGate, stats: PlayerStats, totalMissions: number): boolean {
  const RANK_ORDER: RankLabel[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S']
  switch (gate.type) {
    case 'streak':         return stats.currentStreak >= (gate.value as number)
    case 'level':          return stats.level          >= (gate.value as number)
    case 'honor_days':     return stats.totalHonorDays >= (gate.value as number)
    case 'total_missions': return totalMissions         >= (gate.value as number)
    case 'shadow':         return stats.shadows.length  >= (gate.value as number)
    case 'rank':           return RANK_ORDER.indexOf(stats.rank) >= RANK_ORDER.indexOf(gate.value as RankLabel)
    case 'attribute': {
      if (!gate.attrKey) return true
      return calcAttributes(stats)[gate.attrKey] >= (gate.value as number)
    }
    default:               return true
  }
}

// ── VIDA scores ──────────────────────────────────────────────────────────

const VIDA_CATEGORIES: Record<string, import('../types').MissionCategory[]> = {
  relacionamento: ['amor', 'familia'],
  espiritual:     ['fe', 'carater'],
  saude:          ['saude'],
  conhecimento:   ['estudo', 'ingles'],
}

/**
 * Calcula score (0–100) de uma área da VIDA baseado nos últimos 14 logs.
 * Mede a taxa de conclusão das missões relevantes nesses dias.
 */
export function calcAreaScore(
  areaId: string,
  stats: PlayerStats,
): number {
  return calcAreaDetail(areaId, stats).score
}

/** Detalhe do score de uma área: score (0–100) + missões feitas/total no período. */
export function calcAreaDetail(
  areaId: string,
  stats: PlayerStats,
): { score: number; done: number; total: number } {
  const categories = VIDA_CATEGORIES[areaId] ?? []
  const allMissions = getAllMissions(stats.customMissions, stats.penaltyMissions)
  const relevant = allMissions.filter(m => categories.includes(m.category) && m.type !== 'penalty')
  if (relevant.length === 0) return { score: 0, done: 0, total: 0 }

  const logs = stats.logs.slice(-14)
  if (logs.length === 0) return { score: 0, done: 0, total: 0 }

  let total = 0, done = 0
  for (const log of logs) {
    const dow = dayOfWeekFromDate(log.date)
    const dayMissions = relevant.filter(m => m.availableDays.includes(dow))
    total += dayMissions.length
    done  += dayMissions.filter(m => log.completedMissions.includes(m.id)).length
  }
  const score = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100))
  return { score, done, total }
}

/** Score composto 0–100 representando o progresso geral do Monarca */
export function calcMonarcaScore(stats: PlayerStats): number {
  const RANK_ORDER: RankLabel[] = ['F','E','D','C','B','A','S']
  const rankIdx    = RANK_ORDER.indexOf(stats.rank)
  const rankScore  = Math.round((rankIdx / (RANK_ORDER.length - 1)) * 100)

  const streakScore = Math.min(100, Math.round((stats.longestStreak / 30) * 100))
  const honorScore  = Math.min(100, Math.round((stats.totalHonorDays / 50) * 100))

  const areaIds   = Object.keys(VIDA_CATEGORIES)
  const vidaAvg   = Math.round(
    areaIds.reduce((sum, id) => sum + calcAreaScore(id, stats), 0) / areaIds.length
  )

  return Math.round(
    rankScore  * 0.30 +
    streakScore * 0.25 +
    honorScore  * 0.20 +
    vidaAvg     * 0.25
  )
}

/** Estado inicial padrão */
export function createInitialStats(name = 'Caçador'): PlayerStats {
  return {
    name,
    totalXp: 0,
    currentXp: 0,
    rank: 'F',
    level: 1,
    gold: 0,
    totalHonorDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    dungeons: INITIAL_DUNGEONS.map(d => ({ ...d })),
    logs: [],
    achievements: ACHIEVEMENT_DEFS.map(def => ({
      id: def.id, icon: def.icon, name: def.name,
      description: def.description, unlocked: false,
    })),
    customMissions: [],
    penaltyMissions: [],
    shadows: [],
    missionStreaks: {},
    boss: { ...DEFAULT_BOSS, createdAt: todayStr() },
    sysLog: [],
    resetTime: '23:00',
    sleepTime: '23:00',
    soundEnabled: true,
    ownedPerks: [],
    activeTitle: 'iniciante',
    unlockedTitles: ['iniciante'],
    ownedConsumables: {},
    streakShieldActive: false,
    relicScrollActive: false,
    coldBloodUsedMonth: '',
    vidaGoals: {},
    lastEventDate: '',
    weeklyMissions: [],
    monthlyBoss: null,
    allocatedPoints: {},
    freeAttributePoints: 0,
    dungeonKeys: 0,
    openedGates: [],
    activeBonusMissions: [],
    lastBonusMissionDate: '',
    // Classes
    unlockedClasses: [],
    activeClass: null,
    // Relíquias
    relicInventory: [],
    equippedRelics: [],
    // Legado Monarca
    monarcaLevel: 0,
    ascensionLog: [],
    // Profecias
    activeProphecy: null,
    lastProphecyWeek: '',
    completedProphecies: [],
    // Controle penalidade semanal
    penaltyCancelledThisWeek: 0,
    penaltyCancelWeek: '',
    todayCompleted: [],
    todayBonusEffort: [],
    lastActiveDate: '',
  }
}
