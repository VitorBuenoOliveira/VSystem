// ── Tipos do Sistema Monarca — Beta 3.6 ─────────────────────────────────

export type MissionType     = 'principal' | 'secundaria' | 'bonus' | 'penalty' | 'class'
export type MissionCategory = 'estudo' | 'amor' | 'fe' | 'saude' | 'ingles' | 'habito' | 'familia' | 'carater'
export type DayOfWeek       = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'
export type RankLabel       = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export type ShadowTierLabel = 'Comum' | 'Elite' | 'General' | 'Marechal' | 'Comandante' | 'Monarca'

export interface Mission {
  id: string
  name: string
  type: MissionType
  category: MissionCategory
  xpReward: number
  xpPenalty: number
  availableDays: DayOfWeek[]
  dungeonId?: string
  estimatedMinutes: number
  icon: string
  custom?: boolean
}

export interface DailyLog {
  date: string
  completedMissions: string[]
  failedPrincipals: string[]
  totalXpEarned: number
  totalXpLost: number
  honoredDay: boolean
  passiveXp?: number
  bossDefeated?: boolean
}

export interface Dungeon {
  id: string
  name: string
  icon: string
  totalFloors: number
  currentFloor: number
  description: string
  relatedCategory: MissionCategory
}

export interface Achievement {
  id: string
  icon: string
  name: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

// ── Boss ─────────────────────────────────────────────────────────────────

export interface Boss {
  name: string
  icon: string
  hpMax: number
  hp: number
  defeated: boolean
  rewXp: number
  rewGold: number
  createdAt: string
}

// ── Shadow Army ──────────────────────────────────────────────────────────

export interface Shadow {
  id: string
  name: string
  missionId: string         // missão que originou a sombra
  missionName: string
  tier: ShadowTierLabel
  daysTotal: number         // dias acumulados
  basePower: number
  createdAt: string
}

// ── System Log ───────────────────────────────────────────────────────────

export interface SysLog {
  time: string
  text: string
  xp?: number
  gold?: number
}

// ── Floor Gate ───────────────────────────────────────────────────────────

export type FloorGateType = 'streak' | 'level' | 'honor_days' | 'total_missions' | 'shadow' | 'rank' | 'attribute'

export interface FloorGate {
  floor: number
  type: FloorGateType
  value: number | string
  attrKey?: keyof PlayerAttributes  // só para type === 'attribute'
  label: string
  icon: string
}

// ── Player Attributes ────────────────────────────────────────────────────

export interface PlayerAttributes {
  forca: number        // STR — missões de saude/corpo
  inteligencia: number // INT — missões de estudo/ingles
  espiritual: number   // SPR — missões de fe
  carisma: number      // CHA — missões de amor
  vitalidade: number   // VIT — habito + streak
}

// ── Monthly Boss ─────────────────────────────────────────────────────────

export type DamageCondition = 'any' | 'no_fail' | 'all_principals' | 'honor'

export interface MonthlyBoss {
  month: string              // YYYY-MM
  name: string
  icon: string
  hpMax: number
  hp: number
  defeated: boolean
  rewXp: number
  rewGold: number
  damageCondition: DamageCondition
  damageConditionLabel: string
  statRequirements: Partial<PlayerAttributes>     // tier mínimo  — chance cap 50%
  statRequirementsMed: Partial<PlayerAttributes>  // tier médio   — chance cap 85%
  statRequirementsMax: Partial<PlayerAttributes>  // tier máximo  — chance cap 100%
  strengthMultiplier: number
  winRolled: boolean
}

// ── Random Event ─────────────────────────────────────────────────────────

export interface RandomEvent {
  id: string
  name: string
  icon: string
  description: string
  xpBonus: number
  goldBonus: number
  triggeredAt: string  // date string
}

// ── Classes ───────────────────────────────────────────────────────────────

export type ClassId = 'estrategista' | 'guardiao' | 'arcanista' | 'combatente' | 'campeao'

export interface ClassBonuses {
  xpMultByCategory?: Partial<Record<MissionCategory, number>>  // 1.15 = +15%
  penaltyMult?: number          // 0.75 = -25% penalidade
  honorDayBonusXp?: number      // XP extra em Dias Honrados
  bossDamageMult?: number       // boss pessoal
  monthlyBossDamageMult?: number
  questSurpriseChanceBonus?: number  // +N% chance absoluta
  globalXpMult?: number
}

// ── Relics ────────────────────────────────────────────────────────────────

export type RelicRarity = 'comum' | 'rara' | 'lendaria'

export interface RelicBonuses {
  weeklyKeyBonus?: number
  xpMultByCategory?: Partial<Record<MissionCategory, number>>
  globalXpMult?: number
  bossWinChanceBonus?: number   // +N% chance vitória boss mensal
  shadowPowerBonus?: number     // +N poder por sombra
  honorDayBonusXp?: number
  penaltyCancelPerWeek?: number
  bossDamageMult?: number
  ascensionLevelBonus?: number  // +N ao ascender
}

export interface Relic {
  id: string
  name: string
  icon: string
  description: string
  rarity: RelicRarity
  bonuses: RelicBonuses
  obtainedAt: string
}

// ── Prophecy ─────────────────────────────────────────────────────────────

export type ProphecyGoalType = 'category_days' | 'honor_streak' | 'missions_total' | 'no_fail_days'

export interface Prophecy {
  id: string
  name: string
  icon: string
  description: string
  task: string
  goalType: ProphecyGoalType
  goalCategory?: MissionCategory
  goal: number
  progress: number
  issuedAt: string
  expiresAt: string
  completed: boolean
  failed: boolean
  rewardXp: number
  rewardGold: number
  rewardRelicId?: string
  rewardTitle?: string
}

// ── Bonus Mission (Quest Surpresa) ────────────────────────────────────────

export interface BonusMission {
  id: string
  name: string
  icon: string
  description: string
  task: string           // instrução concreta do que fazer
  category: MissionCategory
  xpReward: number
  goldReward: number
  issuedAt: string       // date YYYY-MM-DD
  completed: boolean
}

// ── Weekly Mission ────────────────────────────────────────────────────────

export type WeeklyGoalType = 'missions' | 'category' | 'honor'

export interface WeeklyMission {
  id: string
  name: string
  description: string
  icon: string
  goalType: WeeklyGoalType
  goalCategory?: MissionCategory
  goal: number
  progress: number
  xpReward: number
  goldReward: number
  completed: boolean
  weekStart: string  // segunda-feira YYYY-MM-DD
}

// ── Player ───────────────────────────────────────────────────────────────

export interface PlayerStats {
  name: string
  totalXp: number
  currentXp: number
  rank: RankLabel
  level: number
  gold: number
  totalHonorDays: number
  currentStreak: number
  longestStreak: number

  dungeons: Dungeon[]
  logs: DailyLog[]
  achievements: Achievement[]
  customMissions: Mission[]
  penaltyMissions: Mission[]   // missões de penalidade geradas automaticamente

  // Shadow army
  shadows: Shadow[]
  missionStreaks: Record<string, number>  // missionId → dias seguidos completados

  // Boss atual
  boss: Boss | null

  // Log de atividades
  sysLog: SysLog[]

  // Configurações do sistema
  resetTime: string    // 'HH:MM' — horário de aplicação automática da penalidade
  sleepTime: string    // 'HH:MM' — horário de dormir (futuro uso em fadiga)
  soundEnabled: boolean

  // Loja & progressão
  ownedPerks: string[]
  activeTitle: string
  unlockedTitles: string[]
  ownedConsumables: Record<string, number>  // itemId → quantidade
  streakShieldActive: boolean
  relicScrollActive: boolean
  coldBloodUsedMonth: string  // YYYY-MM do último uso do perk Sangue Frio

  // Aba VIDA
  vidaGoals: Record<string, string>  // areaId → meta pessoal

  // Eventos & Missões Semanais
  lastEventDate: string
  weeklyMissions: WeeklyMission[]

  // Boss Mensal
  monthlyBoss: MonthlyBoss | null

  // Atributos manuais
  allocatedPoints: Partial<PlayerAttributes>
  freeAttributePoints: number

  // Chaves de masmorra
  dungeonKeys: number
  openedGates: string[]   // ids de portões já abertos: `${dungeonId}:${floor}`

  // Quest Surpresa (múltiplas podem coexistir)
  activeBonusMissions: BonusMission[]
  lastBonusMissionDate: string

  // Classes
  unlockedClasses: ClassId[]
  activeClass: ClassId | null

  // Relíquias
  relicInventory: Relic[]
  equippedRelics: string[]     // relic IDs (máx 3)

  // Legado Monarca (Ascensão)
  monarcaLevel: number         // quantidade de ascensões realizadas
  ascensionLog: { date: string; fromLevel: number; fromRank: RankLabel }[]

  // Profecias
  activeProphecy: Prophecy | null
  lastProphecyWeek: string     // weekStart YYYY-MM-DD
  completedProphecies: string[]

  // Controle penalidade semanal (Relíquia da Imortalidade)
  penaltyCancelledThisWeek: number
  penaltyCancelWeek: string

  // Debug/teste: força um estágio mínimo do Caminho das Sombras (0 = sem override)
  debugShadowStage?: number

  // Sessão atual
  todayCompleted: string[]
  todayBonusEffort: string[]   // ids de missões em que o jogador "fez a mais" (XP extra)
  lastActiveDate: string
}
