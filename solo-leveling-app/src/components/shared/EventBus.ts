import type { RandomEvent, BonusMission } from '../../types'
import type { ShadowStage } from '../../data/shadowPath'

type EventHandler = (ev: RandomEvent) => void
type BonusMissionHandler = (m: BonusMission) => void
type ShadowEvoHandler = (stage: ShadowStage) => void

let _handler: EventHandler | null = null
let _bonusHandler: BonusMissionHandler | null = null
let _shadowEvoHandler: ShadowEvoHandler | null = null

export function registerEventHandler(fn: EventHandler) { _handler = fn }
export function triggerEvent(ev: RandomEvent) { _handler?.(ev) }

export function registerBonusMissionHandler(fn: BonusMissionHandler) { _bonusHandler = fn }
export function triggerBonusMission(m: BonusMission) { _bonusHandler?.(m) }

export function registerShadowEvoHandler(fn: ShadowEvoHandler) { _shadowEvoHandler = fn }
export function triggerShadowEvo(stage: ShadowStage) { _shadowEvoHandler?.(stage) }
