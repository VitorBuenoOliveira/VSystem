import { useEffect, useCallback, useSyncExternalStore } from 'react'
import type { Mission, PlayerStats, Boss, PlayerAttributes } from '../types'
import { createInitialStats, applyDayEnd, todayStr, sysLogEntry, addDaysStr, calcAttributes, checkGateRequirement, gateId } from '../utils'
import { getGateAtFloor, INITIAL_DUNGEONS } from '../data/dungeons'
import { DEFAULT_BOSS } from '../data/shadows'
import { PERKS, TITLE_DEFS, CONSUMABLES } from '../data/shop'
import { rollRandomEvent } from '../data/events'
import { rollBonusMission } from '../data/bonusMissions'
import { rollProphecy, updateProphecyProgress } from '../data/prophecies'
import { CLASS_DEFS, meetsClassRequirements } from '../data/classes'
import { instantiateRelic, COMMON_RELIC_POOL, RARE_RELIC_POOL } from '../data/relics'
import { MISSIONS } from '../data/missions'
import { triggerBonusMission } from '../components/shared/EventBus'
import type { ClassId } from '../types'
import { generateWeeklyMissions, getWeekStart } from '../data/weeklyPool'
import { generateMonthlyBoss, getMonthStr, resolveBossEndOfMonth } from '../data/monthlyBoss'
import { triggerEvent } from '../components/shared/EventBus'
import type { DayEndResult } from '../utils'

const STORAGE_KEY = 'monarca-v2'

function migrate(raw: PlayerStats): PlayerStats {
  const base = createInitialStats(raw.name)
  // Campo legado (slot único de quest surpresa) → migra para array
  const legacyBonus = (raw as unknown as { activeBonusMission?: import('../types').BonusMission }).activeBonusMission
  // Merge: adiciona masmorras novas que ainda não existem no save do usuário
  const existingDungeonIds = new Set((raw.dungeons ?? []).map(d => d.id))
  const mergedDungeons = [
    ...(raw.dungeons ?? []),
    ...INITIAL_DUNGEONS.filter(d => !existingDungeonIds.has(d.id)),
  ]
  return {
    ...base,
    ...raw,
    dungeons: mergedDungeons,
    // Campos novos do 3.6
    gold:            raw.gold            ?? 0,
    shadows:         raw.shadows         ?? [],
    missionStreaks:  raw.missionStreaks   ?? {},
    boss:            raw.boss            ?? { ...DEFAULT_BOSS, createdAt: todayStr() },
    sysLog:          raw.sysLog          ?? [],
    penaltyMissions: raw.penaltyMissions ?? [],
    customMissions:  raw.customMissions  ?? [],
    // Campos novos do 3.7
    resetTime:       raw.resetTime       ?? '23:00',
    sleepTime:       raw.sleepTime       ?? '23:00',
    soundEnabled:    raw.soundEnabled    ?? true,
    // Campos novos do 3.8
    ownedPerks:      raw.ownedPerks      ?? [],
    activeTitle:     raw.activeTitle     ?? 'iniciante',
    unlockedTitles:  raw.unlockedTitles  ?? ['iniciante'],
    // Campos novos do 3.9
    vidaGoals:       raw.vidaGoals       ?? {},
    // Campos novos do 4.0
    lastEventDate:   raw.lastEventDate   ?? '',
    weeklyMissions:  raw.weeklyMissions  ?? [],
    // Campos novos do 4.2
    monthlyBoss:         raw.monthlyBoss         ?? null,
    // Campos novos do 4.3
    allocatedPoints:     raw.allocatedPoints     ?? {},
    freeAttributePoints: raw.freeAttributePoints ?? 0,
    // Campos novos do 4.4
    dungeonKeys:         raw.dungeonKeys         ?? 0,
    openedGates:         raw.openedGates         ?? [],
    todayBonusEffort:    raw.todayBonusEffort    ?? [],
    // Campos novos do 4.5
    activeBonusMissions:  raw.activeBonusMissions ?? (legacyBonus ? [legacyBonus] : []),
    lastBonusMissionDate: raw.lastBonusMissionDate ?? '',
    // Campos novos do 5.0
    unlockedClasses:      raw.unlockedClasses      ?? [],
    activeClass:          raw.activeClass          ?? null,
    relicInventory:       raw.relicInventory       ?? [],
    equippedRelics:       raw.equippedRelics       ?? [],
    monarcaLevel:         raw.monarcaLevel         ?? 0,
    ascensionLog:         raw.ascensionLog         ?? [],
    activeProphecy:       raw.activeProphecy       ?? null,
    lastProphecyWeek:     raw.lastProphecyWeek     ?? '',
    completedProphecies:  raw.completedProphecies  ?? [],
    penaltyCancelledThisWeek: raw.penaltyCancelledThisWeek ?? 0,
    penaltyCancelWeek:    raw.penaltyCancelWeek    ?? '',
    // Campos novos do 5.1
    ownedConsumables:     raw.ownedConsumables     ?? {},
    streakShieldActive:   raw.streakShieldActive   ?? false,
    relicScrollActive:    raw.relicScrollActive    ?? false,
    coldBloodUsedMonth:   raw.coldBloodUsedMonth   ?? '',
    // Debug de teste não persiste entre sessões
    debugShadowStage:     undefined,
  }
}

function load(): PlayerStats {
  // Tenta v2 primeiro, depois v1 (migração de versão)
  try {
    const raw2 = localStorage.getItem(STORAGE_KEY)
    if (raw2) return migrate(JSON.parse(raw2) as PlayerStats)

    const raw1 = localStorage.getItem('monarca-v1')
    if (raw1) {
      const parsed = migrate(JSON.parse(raw1) as PlayerStats)
      save(parsed)
      return parsed
    }
  } catch { /* ignore */ }
  return createInitialStats()
}

function save(stats: PlayerStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

// ── Store global compartilhado ──────────────────────────────────────────────
// Estado único para todas as instâncias de usePlayerStore. Sem isto, cada
// componente teria sua própria cópia e não veria mudanças feitas por outro
// (ex: aceitar Quest Surpresa no App não atualizava o Dashboard).
let globalStats: PlayerStats = load()
const listeners = new Set<() => void>()

function setGlobalStats(next: PlayerStats) {
  globalStats = next
  save(next)
  listeners.forEach(l => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

let didInit = false

export function usePlayerStore() {
  const stats = useSyncExternalStore(subscribe, () => globalStats)

  const setStats = useCallback((next: PlayerStats) => {
    setGlobalStats(next)
  }, [])

  // Mount: auto-reset + evento aleatório + missões semanais (roda só UMA vez)
  useEffect(() => {
    if (didInit) return
    didInit = true
    const today     = todayStr()
    const weekStart = getWeekStart()
    let current     = { ...stats }

    // 1) Auto-reset: processa CADA dia perdido uma única vez, sem reprocessar
    //    dias que já têm log (evita penalidade/log duplicado ao reabrir o app).
    const loggedDates = new Set(current.logs.map(l => l.date))
    let cursor: string | null = null
    if (current.lastActiveDate && current.lastActiveDate < today && !loggedDates.has(current.lastActiveDate)) {
      // O último dia ativo não foi encerrado: começa por ele (usando o que foi marcado)
      cursor = current.lastActiveDate
    } else if (current.logs.length > 0) {
      // Começa no dia seguinte ao último log encerrado
      const next = addDaysStr(current.logs[current.logs.length - 1].date, 1)
      if (next < today) cursor = next
    }

    let firstDay = true
    let guard = 0
    while (cursor && cursor < today && guard++ < 120) {
      if (!loggedDates.has(cursor)) {
        const completed = (firstDay && cursor === current.lastActiveDate) ? current.todayCompleted : []
        const result = applyDayEnd(current, completed, cursor, true)
        current = result.newStats
        loggedDates.add(cursor)
      }
      cursor = addDaysStr(cursor, 1)
      firstDay = false
    }
    // Marca que estamos em dia até hoje (impede reprocessamento na próxima abertura)
    if (current.lastActiveDate < today) {
      current = { ...current, lastActiveDate: today, todayCompleted: [] }
    }

    // 2) Resolve boss do mês anterior e gera novo se o mês mudou
    const currentMonth = getMonthStr()
    const bossOutdated = current.monthlyBoss && !current.monthlyBoss.statRequirementsMed
    if (!current.monthlyBoss || current.monthlyBoss.month !== currentMonth || bossOutdated) {
      let nextMultiplier = 1.0
      if (current.monthlyBoss && !current.monthlyBoss.winRolled && !bossOutdated) {
        const resolution = resolveBossEndOfMonth(current.monthlyBoss, calcAttributes(current))
        nextMultiplier = resolution.nextMultiplier
        if (resolution.rewardXp > 0 || resolution.rewardGold > 0) {
          const logEntry = sysLogEntry(
            resolution.won
              ? `👑 Boss Mensal derrotado na batalha final: ${current.monthlyBoss.name}`
              : `💀 Boss Mensal escapou: ${current.monthlyBoss.name} — ficou mais forte!`,
            resolution.rewardXp || undefined,
            resolution.rewardGold || undefined,
          )
          current = {
            ...current,
            totalXp:   current.totalXp   + resolution.rewardXp,
            currentXp: current.currentXp + resolution.rewardXp,
            gold:      current.gold      + resolution.rewardGold,
            sysLog:    [logEntry, ...current.sysLog].slice(0, 100),
          }
        }
      }
      current = { ...current, monthlyBoss: generateMonthlyBoss(nextMultiplier) }
    }

    // 4) Gera missões semanais se não existem para esta semana
    const hasThisWeek = current.weeklyMissions.some(wm => wm.weekStart === weekStart)
    if (!hasThisWeek) {
      current = { ...current, weeklyMissions: generateWeeklyMissions(weekStart) }
    }

    // 5) Evento aleatório (máx 1 por dia)
    if (current.lastEventDate !== today) {
      const ev = rollRandomEvent(today)
      if (ev) {
        current = {
          ...current,
          totalXp:  current.totalXp  + ev.xpBonus,
          currentXp: current.currentXp + ev.xpBonus,
          gold:     current.gold     + ev.goldBonus,
          lastEventDate: today,
          sysLog: [sysLogEntry(`✨ Evento: ${ev.name}`, ev.xpBonus || undefined, ev.goldBonus || undefined), ...current.sysLog].slice(0, 100),
        }
        // Só dispara o pop-up se o dia ainda não foi encerrado
        if (!loggedDates.has(today)) setTimeout(() => triggerEvent(ev), 800)
      } else {
        current = { ...current, lastEventDate: today }
      }
    }

    // 6) Quest Surpresa (máx 1 por dia, 25% de chance)
    //    Expira quests de dias anteriores que não foram completadas
    const liveBonus = (current.activeBonusMissions ?? []).filter(m => m.issuedAt === today)
    if (liveBonus.length !== (current.activeBonusMissions ?? []).length) {
      current = { ...current, activeBonusMissions: liveBonus }
    }
    const todayAlreadyLogged = loggedDates.has(today)
    if (current.lastBonusMissionDate !== today) {
      const bm = rollBonusMission(today, (current.activeBonusMissions ?? []).length > 0)
      current = { ...current, lastBonusMissionDate: today }
      // Só dispara o pop-up se o dia ainda não foi encerrado
      if (bm && !todayAlreadyLogged) {
        const captured = bm
        setTimeout(() => triggerBonusMission(captured), 1400)
      }
    }

    // 7) Profecia semanal (1% de chance na segunda-feira)
    // weekStart já declarado acima
    if (current.lastProphecyWeek !== weekStart) {
      // Expirar profecia antiga se não completada
      if (current.activeProphecy && !current.activeProphecy.completed) {
        const expired = today > current.activeProphecy.expiresAt
        if (expired) {
          current = { ...current, activeProphecy: { ...current.activeProphecy, failed: true } }
        }
      }
      current = { ...current, lastProphecyWeek: weekStart }
      if (!current.activeProphecy || current.activeProphecy.completed || current.activeProphecy.failed) {
        const prophecy = rollProphecy(weekStart, false)
        if (prophecy) {
          current = { ...current, activeProphecy: prophecy }
          const entry = sysLogEntry(`📜 PROFECIA LENDÁRIA: ${prophecy.name}`)
          current = { ...current, sysLog: [entry, ...current.sysLog].slice(0, 100) }
        }
      }
    }

    // 8) Verificar novas classes desbloqueadas
    const attrs = calcAttributes(current)
    for (const cls of CLASS_DEFS) {
      if (!current.unlockedClasses.includes(cls.id) && meetsClassRequirements(cls, attrs, current)) {
        current = {
          ...current,
          unlockedClasses: [...current.unlockedClasses, cls.id],
          sysLog: [sysLogEntry(`⚡ CLASSE DESBLOQUEADA: ${cls.name}!`), ...current.sysLog].slice(0, 100),
        }
      }
    }

    if (JSON.stringify(current) !== JSON.stringify(stats)) {
      setStats(current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────

  const toggleMission = useCallback((missionId: string) => {
    const today   = todayStr()
    const already = stats.todayCompleted.includes(missionId)
    const todayCompleted = already
      ? stats.todayCompleted.filter(id => id !== missionId)
      : [...stats.todayCompleted, missionId]
    // Ao desmarcar, remove também o "esforço extra" daquela missão
    const todayBonusEffort = already
      ? (stats.todayBonusEffort ?? []).filter(id => id !== missionId)
      : (stats.todayBonusEffort ?? [])
    setStats({ ...stats, todayCompleted, todayBonusEffort, lastActiveDate: today })
  }, [stats, setStats])

  /** Debug/teste: força o estágio mínimo do Caminho das Sombras. */
  const setDebugShadowStage = useCallback((idx: number) => {
    setStats({ ...stats, debugShadowStage: idx })
  }, [stats, setStats])

  /** Marca/desmarca que o jogador "fez a mais" numa missão concluída (XP extra). */
  const toggleEffort = useCallback((missionId: string) => {
    if (!stats.todayCompleted.includes(missionId)) return  // só vale para concluídas
    const effort = stats.todayBonusEffort ?? []
    const todayBonusEffort = effort.includes(missionId)
      ? effort.filter(id => id !== missionId)
      : [...effort, missionId]
    setStats({ ...stats, todayBonusEffort })
  }, [stats, setStats])

  const endDay = useCallback((): DayEndResult => {
    const result = applyDayEnd(stats, stats.todayCompleted)
    let next = result.newStats
    const date = todayStr()

    // ── Drop de relíquia (boss pessoal derrotado: 30% comum, ou 100% com Pergaminho) ──
    let newRelicObtained: string | null = null
    if (result.bossDefeated) {
      const scrollActive = next.relicScrollActive === true
      const dropped = scrollActive || Math.random() < 0.30
      if (dropped) {
        const pool = COMMON_RELIC_POOL.filter(id => !next.relicInventory.some(r => r.id === id))
        if (pool.length > 0) {
          const rid = pool[Math.floor(Math.random() * pool.length)]
          const relic = instantiateRelic(rid, date)
          if (relic) {
            next = {
              ...next,
              relicInventory: [...next.relicInventory, relic],
              sysLog: [sysLogEntry(`💎 Relíquia obtida: ${relic.name}!${scrollActive ? ' (Pergaminho)' : ''}`), ...next.sysLog].slice(0, 100),
            }
            newRelicObtained = rid
          }
        }
      }
      // Consome o pergaminho ao enfrentar o boss (independente de ter pool disponível)
      if (scrollActive) next = { ...next, relicScrollActive: false }
    }

    // ── Drop de relíquia rara (boss mensal derrotado: 100%) ──
    const monthlyDefeatedNow = result.newStats.monthlyBoss?.defeated && !stats.monthlyBoss?.defeated
    if (monthlyDefeatedNow) {
      const pool = RARE_RELIC_POOL.filter(id => !next.relicInventory.some(r => r.id === id))
      if (pool.length > 0) {
        const rid = pool[Math.floor(Math.random() * pool.length)]
        const relic = instantiateRelic(rid, date)
        if (relic) {
          next = {
            ...next,
            relicInventory: [...next.relicInventory, relic],
            sysLog: [sysLogEntry(`👑 Relíquia RARA obtida: ${relic.name}!`), ...next.sysLog].slice(0, 100),
          }
          newRelicObtained = rid
        }
      }
    }

    // ── Atualizar profecia ──
    let prophecyCompleted = false
    if (next.activeProphecy && !next.activeProphecy.completed && !next.activeProphecy.failed) {
      const lastLog = next.logs[next.logs.length - 1]
      const noFail = lastLog.failedPrincipals.length === 0
      const honored = lastLog.honoredDay
      const allMs = [...MISSIONS, ...(next.customMissions ?? [])]
      const updatedProphecy = updateProphecyProgress(
        next.activeProphecy, date,
        stats.todayCompleted,
        honored, noFail,
        allMs,
      )

      if (updatedProphecy.completed && !next.activeProphecy.completed) {
        prophecyCompleted = true
        // Recompensas
        next = {
          ...next,
          totalXp: next.totalXp + updatedProphecy.rewardXp,
          currentXp: next.currentXp + updatedProphecy.rewardXp,
          gold: next.gold + updatedProphecy.rewardGold,
          completedProphecies: [...(next.completedProphecies ?? []), updatedProphecy.id],
          sysLog: [sysLogEntry(
            `📜 PROFECIA CONCLUÍDA: ${updatedProphecy.name}!`,
            updatedProphecy.rewardXp, updatedProphecy.rewardGold,
          ), ...next.sysLog].slice(0, 100),
        }
        // Relíquia lendária da profecia
        if (updatedProphecy.rewardRelicId) {
          const relic = instantiateRelic(updatedProphecy.rewardRelicId, date)
          if (relic && !next.relicInventory.some(r => r.id === relic.id)) {
            next = {
              ...next,
              relicInventory: [...next.relicInventory, relic],
              sysLog: [sysLogEntry(`🌟 Relíquia LENDÁRIA: ${relic.name}!`), ...next.sysLog].slice(0, 100),
            }
            newRelicObtained = relic.id
          }
        }
        // Título da profecia
        if (updatedProphecy.rewardTitle && !next.unlockedTitles.includes(updatedProphecy.rewardTitle)) {
          next = { ...next, unlockedTitles: [...next.unlockedTitles, updatedProphecy.rewardTitle] }
        }
      }
      next = { ...next, activeProphecy: updatedProphecy }
    }

    // ── Verificar novas classes ──
    let newClassUnlocked: ClassId | null = null
    for (const cls of CLASS_DEFS) {
      if (!next.unlockedClasses.includes(cls.id) && meetsClassRequirements(cls, calcAttributes(next), next)) {
        next = {
          ...next,
          unlockedClasses: [...next.unlockedClasses, cls.id],
          sysLog: [sysLogEntry(`⚡ CLASSE DESBLOQUEADA: ${cls.name}!`), ...next.sysLog].slice(0, 100),
        }
        newClassUnlocked = cls.id
      }
    }

    // Quests surpresa saem do dashboard ao encerrar o dia
    next = { ...next, activeBonusMissions: [] }

    setStats(next)
    return { ...result, newStats: next, newRelicObtained, prophecyCompleted, newClassUnlocked }
  }, [stats, setStats])

  const addCustomMission = useCallback((mission: Omit<Mission, 'id' | 'custom'>) => {
    const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const entry = sysLogEntry(`✚ Missão criada: ${mission.name}`)
    setStats({
      ...stats,
      customMissions: [...stats.customMissions, { ...mission, id, custom: true }],
      sysLog: [entry, ...stats.sysLog].slice(0, 100),
    })
  }, [stats, setStats])

  const deleteCustomMission = useCallback((missionId: string) => {
    setStats({
      ...stats,
      customMissions:  stats.customMissions.filter(m => m.id !== missionId),
      todayCompleted:  stats.todayCompleted.filter(id => id !== missionId),
    })
  }, [stats, setStats])

  const completePenaltyMission = useCallback((missionId: string) => {
    setStats({
      ...stats,
      penaltyMissions: stats.penaltyMissions.filter(m => m.id !== missionId),
      todayCompleted:  stats.todayCompleted.filter(id => id !== missionId),
      sysLog: [sysLogEntry('💀 Missão de penalidade concluída'), ...stats.sysLog].slice(0, 100),
    })
  }, [stats, setStats])

  // ── Boss actions ─────────────────────────────────────────────────────

  const createBoss = useCallback((name: string, hp: number) => {
    const newBoss: Boss = {
      name,
      icon: '☠️',
      hpMax: hp,
      hp,
      defeated: false,
      rewXp: Math.round(hp / 6),
      rewGold: Math.round(hp / 12),
      createdAt: todayStr(),
    }
    const entry = sysLogEntry(`☠️ Novo boss invocado: ${name}`)
    setStats({
      ...stats,
      boss: newBoss,
      sysLog: [entry, ...stats.sysLog].slice(0, 100),
    })
  }, [stats, setStats])

  // ── Shop ─────────────────────────────────────────────────────────────

  const buyPerk = useCallback((perkId: string): boolean => {
    const perk = PERKS.find(p => p.id === perkId)
    if (!perk || stats.gold < perk.cost || stats.ownedPerks.includes(perkId)) return false
    const entry = sysLogEntry(`◈ Perk comprado: ${perk.name}`, undefined, perk.cost)
    setStats({
      ...stats,
      gold: stats.gold - perk.cost,
      ownedPerks: [...stats.ownedPerks, perkId],
      sysLog: [entry, ...stats.sysLog].slice(0, 100),
    })
    return true
  }, [stats, setStats])

  const equipTitle = useCallback((titleId: string) => {
    if (!stats.unlockedTitles.includes(titleId)) return
    setStats({ ...stats, activeTitle: titleId })
  }, [stats, setStats])

  const syncTitles = useCallback(() => {
    const newUnlocks = TITLE_DEFS
      .filter(t => !stats.unlockedTitles.includes(t.id) && t.check(stats))
      .map(t => t.id)
    if (newUnlocks.length === 0) return
    setStats({
      ...stats,
      unlockedTitles: [...stats.unlockedTitles, ...newUnlocks],
    })
  }, [stats, setStats])

  const buyConsumable = useCallback((itemId: string): boolean => {
    const item = CONSUMABLES.find(c => c.id === itemId)
    if (!item || stats.gold < item.cost) return false
    const owned = stats.ownedConsumables ?? {}
    const entry = sysLogEntry(`🧪 Item comprado: ${item.name}`, undefined, item.cost)
    setStats({
      ...stats,
      gold: stats.gold - item.cost,
      ownedConsumables: { ...owned, [itemId]: (owned[itemId] ?? 0) + 1 },
      sysLog: [entry, ...stats.sysLog].slice(0, 100),
    })
    return true
  }, [stats, setStats])

  const useConsumable = useCallback((itemId: string): boolean => {
    const item = CONSUMABLES.find(c => c.id === itemId)
    const owned = stats.ownedConsumables ?? {}
    if (!item || (owned[itemId] ?? 0) <= 0) return false

    let next = {
      ...stats,
      ownedConsumables: { ...owned, [itemId]: owned[itemId] - 1 },
    }

    // Aplica efeito
    for (const part of item.effect.split(',')) {
      const [type, val] = part.split(':')
      const v = parseInt(val)
      if (type === 'xp') {
        next = { ...next, totalXp: next.totalXp + v, currentXp: next.currentXp + v }
      } else if (type === 'gold') {
        next = { ...next, gold: next.gold + v }
      } else if (type === 'key') {
        next = { ...next, dungeonKeys: Math.min(10, (next.dungeonKeys ?? 0) + v) }
      } else if (type === 'streak_shield') {
        next = { ...next, streakShieldActive: true }
      } else if (type === 'relic_scroll') {
        next = { ...next, relicScrollActive: true }
      }
    }

    const entry = sysLogEntry(`✨ Item usado: ${item.name}`)
    next = { ...next, sysLog: [entry, ...next.sysLog].slice(0, 100) }
    setStats(next)
    return true
  }, [stats, setStats])

  // ── VIDA ─────────────────────────────────────────────────────────────

  const setVidaGoal = useCallback((areaId: string, goal: string) => {
    setStats({ ...stats, vidaGoals: { ...stats.vidaGoals, [areaId]: goal } })
  }, [stats, setStats])

  // ── Chaves de masmorra ────────────────────────────────────────────────

  /** Tenta abrir o portão do próximo andar gastando 1 chave. */
  const openGate = useCallback((dungeonId: string): { ok: boolean; reason?: string } => {
    const dungeon = stats.dungeons.find(d => d.id === dungeonId)
    if (!dungeon) return { ok: false, reason: 'Masmorra não encontrada' }

    const nextFloor = dungeon.currentFloor + 1
    const gate = getGateAtFloor(dungeonId, nextFloor)
    if (!gate) return { ok: false, reason: 'Sem portão neste andar' }

    const id = gateId(dungeonId, nextFloor)
    if ((stats.openedGates ?? []).includes(id)) return { ok: false, reason: 'Portão já aberto' }

    const totalMissions = stats.logs.reduce((s, l) => s + l.completedMissions.length, 0)
    if (!checkGateRequirement(gate, stats, totalMissions)) return { ok: false, reason: 'Requisito não atendido' }
    if ((stats.dungeonKeys ?? 0) < 1) return { ok: false, reason: 'Sem chaves' }

    setStats({
      ...stats,
      dungeonKeys: stats.dungeonKeys - 1,
      openedGates: [...(stats.openedGates ?? []), id],
      sysLog: [sysLogEntry(`🔑 Portão aberto: ${dungeon.name} — andar ${nextFloor}`), ...stats.sysLog].slice(0, 100),
    })
    return { ok: true }
  }, [stats, setStats])

  // ── Classes ───────────────────────────────────────────────────────────

  const selectClass = useCallback((classId: ClassId): boolean => {
    if (!stats.unlockedClasses.includes(classId)) return false
    const entry = sysLogEntry(`⚡ Classe equipada: ${CLASS_DEFS.find(c => c.id === classId)?.name}`)
    setStats({ ...stats, activeClass: classId, sysLog: [entry, ...stats.sysLog].slice(0, 100) })
    return true
  }, [stats, setStats])

  // ── Relíquias ─────────────────────────────────────────────────────────

  const equipRelic = useCallback((relicId: string): boolean => {
    if (!stats.relicInventory.some(r => r.id === relicId)) return false
    if ((stats.equippedRelics ?? []).includes(relicId)) return false
    if ((stats.equippedRelics ?? []).length >= 3) return false
    setStats({ ...stats, equippedRelics: [...(stats.equippedRelics ?? []), relicId] })
    return true
  }, [stats, setStats])

  const unequipRelic = useCallback((relicId: string) => {
    setStats({ ...stats, equippedRelics: (stats.equippedRelics ?? []).filter(id => id !== relicId) })
  }, [stats, setStats])

  // ── Ascensão Monarca ──────────────────────────────────────────────────

  /** Executa a Ascensão. Só disponível no Rank S. */
  const ascend = useCallback((): boolean => {
    if (stats.rank !== 'S') return false
    const entry = sysLogEntry(
      `🌟 ASCENSÃO MONARCA — Nível ${(stats.monarcaLevel ?? 0) + 1}! O renascimento foi aceito pelo Sistema.`,
    )
    // Reseta progressão, mantém legado
    const next: typeof stats = {
      ...stats,
      totalXp: 0,
      currentXp: 0,
      rank: 'F',
      level: 1,
      dungeons: stats.dungeons.map(d => ({ ...d, currentFloor: 0 })),
      openedGates: [],
      monarcaLevel: (stats.monarcaLevel ?? 0) + 1,
      ascensionLog: [
        ...(stats.ascensionLog ?? []),
        { date: todayStr(), fromLevel: stats.level, fromRank: stats.rank },
      ],
      sysLog: [entry, ...stats.sysLog].slice(0, 100),
    }
    setStats(next)
    return true
  }, [stats, setStats])

  // ── Quest Surpresa ────────────────────────────────────────────────────

  /** Aceita a quest surpresa — salva no estado para aparecer no Dashboard. */
  const acceptBonusMission = useCallback((mission: import('../types').BonusMission) => {
    // Evita duplicatas: se já existe uma quest com o mesmo id, não adiciona de novo
    if (stats.activeBonusMissions.some(m => m.id === mission.id)) return
    const entry = sysLogEntry(`⚡ Quest Surpresa aceita: ${mission.name}`)
    setStats({
      ...stats,
      activeBonusMissions: [...stats.activeBonusMissions, mission],
      sysLog: [entry, ...stats.sysLog].slice(0, 100),
    })
  }, [stats, setStats])

  /** Marca uma quest surpresa específica como concluída e concede a recompensa. */
  const completeBonusMission = useCallback((id: string) => {
    const bm = stats.activeBonusMissions.find(m => m.id === id)
    if (!bm || bm.completed) return
    const entry = sysLogEntry(`⚡ Quest Surpresa concluída: ${bm.name}`, bm.xpReward, bm.goldReward)
    setStats({
      ...stats,
      totalXp:  stats.totalXp  + bm.xpReward,
      currentXp: stats.currentXp + bm.xpReward,
      gold:     stats.gold     + bm.goldReward,
      activeBonusMissions: stats.activeBonusMissions.map(m => m.id === id ? { ...m, completed: true } : m),
      sysLog: [entry, ...stats.sysLog].slice(0, 100),
    })
  }, [stats, setStats])

  /** Declina o pop-up — a quest não é adicionada ao dashboard. */
  const dismissBonusMission = useCallback(() => {
    // Nenhuma mudança de estado: a quest simplesmente não é aceita.
  }, [])

  /** Credita a recompensa de um evento aleatório (mesmo efeito do fluxo real). */
  const applyEventReward = useCallback((ev: import('../types').RandomEvent) => {
    setStats({
      ...stats,
      totalXp:   stats.totalXp   + ev.xpBonus,
      currentXp: stats.currentXp + ev.xpBonus,
      gold:      stats.gold      + ev.goldBonus,
      sysLog: [sysLogEntry(`✨ Evento: ${ev.name}`, ev.xpBonus || undefined, ev.goldBonus || undefined), ...stats.sysLog].slice(0, 100),
    })
  }, [stats, setStats])

  // ── Attribute allocation ──────────────────────────────────────────────

  const allocatePoint = useCallback((attr: keyof PlayerAttributes): boolean => {
    if ((stats.freeAttributePoints ?? 0) <= 0) return false
    const prev = stats.allocatedPoints ?? {}
    setStats({
      ...stats,
      freeAttributePoints: (stats.freeAttributePoints ?? 0) - 1,
      allocatedPoints: { ...prev, [attr]: (prev[attr] ?? 0) + 1 },
    })
    return true
  }, [stats, setStats])

  const deallocatePoint = useCallback((attr: keyof PlayerAttributes): boolean => {
    const prev = stats.allocatedPoints ?? {}
    if ((prev[attr] ?? 0) <= 0) return false
    setStats({
      ...stats,
      freeAttributePoints: (stats.freeAttributePoints ?? 0) + 1,
      allocatedPoints: { ...prev, [attr]: (prev[attr] ?? 0) - 1 },
    })
    return true
  }, [stats, setStats])

  // ── Settings ─────────────────────────────────────────────────────────

  const setResetTime = useCallback((time: string) => {
    setStats({ ...stats, resetTime: time })
  }, [stats, setStats])

  const setSleepTime = useCallback((time: string) => {
    setStats({ ...stats, sleepTime: time })
  }, [stats, setStats])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setStats({ ...stats, soundEnabled: enabled })
  }, [stats, setStats])

  // ── Data export/import ───────────────────────────────────────────────

  const exportData = useCallback(() => {
    const json = JSON.stringify(stats, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `monarca-${stats.name}-${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [stats])

  const importData = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as PlayerStats
        setStats(migrate(parsed))
      } catch { /* ignore bad files */ }
    }
    reader.readAsText(file)
  }, [setStats])

  // ── Profile ──────────────────────────────────────────────────────────

  const updateName = useCallback((name: string) => {
    setStats({ ...stats, name })
  }, [stats, setStats])

  const resetData = useCallback(() => {
    setStats(createInitialStats(stats.name))
  }, [stats.name, setStats])

  return {
    stats,
    toggleMission,
    toggleEffort,
    setDebugShadowStage,
    endDay,
    addCustomMission,
    deleteCustomMission,
    completePenaltyMission,
    createBoss,
    buyPerk,
    equipTitle,
    syncTitles,
    buyConsumable,
    useConsumable,
    setVidaGoal,
    setResetTime,
    setSleepTime,
    setSoundEnabled,
    exportData,
    importData,
    allocatePoint,
    deallocatePoint,
    openGate,
    acceptBonusMission,
    completeBonusMission,
    dismissBonusMission,
    applyEventReward,
    selectClass,
    equipRelic,
    unequipRelic,
    ascend,
    updateName,
    resetData,
  }
}
