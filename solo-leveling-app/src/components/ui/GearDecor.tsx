// Engrenagens decorativas (identidade de Engenharia da Computação).
// Mantêm a paleta do System: azul neon + dourado/latão, baixa opacidade.
import { useSyncExternalStore } from 'react'

// ── Estado global de "boost": TODAS as engrenagens (fundo + títulos)
//    aceleram juntas em eventos importantes (rank-up, dia honrado). ──────────
let _boosted = false
const _boostListeners = new Set<() => void>()
let _boostTimer: ReturnType<typeof setTimeout> | null = null

function _emitBoost() { _boostListeners.forEach(l => l()) }

/** Acelera todas as engrenagens por alguns segundos (ex: rank-up). */
export function boostGears() {
  _boosted = true
  _emitBoost()
  if (_boostTimer) clearTimeout(_boostTimer)
  _boostTimer = setTimeout(() => { _boosted = false; _emitBoost() }, 3000)
}

/** Hook: retorna se as engrenagens estão aceleradas no momento. */
function useGearBoost(): boolean {
  return useSyncExternalStore(
    cb => { _boostListeners.add(cb); return () => { _boostListeners.delete(cb) } },
    () => _boosted,
  )
}

interface GearProps {
  size: number
  color: string
  teeth?: number
  duration?: number   // segundos por volta
  reverse?: boolean
  className?: string
  style?: React.CSSProperties
}

/** Uma engrenagem SVG (dentes + anel + furo central), girando via CSS. */
export function Gear({ size, color, teeth = 10, duration = 24, reverse, className, style }: GearProps) {
  const boosted = useGearBoost()
  const effDuration = boosted ? duration / 5 : duration
  const c = 50               // centro num viewBox 100x100
  const rOuter = 46          // ponta dos dentes
  const rRoot  = 37          // base dos dentes / borda do corpo
  const toothW = 7

  const teethEls = Array.from({ length: teeth }, (_, i) => {
    const angle = (360 / teeth) * i
    return (
      <rect
        key={i}
        x={c - toothW / 2}
        y={c - rOuter}
        width={toothW}
        height={rOuter - rRoot + 4}
        rx={1.5}
        fill={color}
        transform={`rotate(${angle} ${c} ${c})`}
      />
    )
  })

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${reverse ? 'gear-spin-rev' : 'gear-spin'} ${className ?? ''}`}
      style={{ animationDuration: `${effDuration}s`, display: 'block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {teethEls}
      {/* Corpo */}
      <circle cx={c} cy={c} r={rRoot} fill="none" stroke={color} strokeWidth={5} />
      {/* Anel interno */}
      <circle cx={c} cy={c} r={rRoot - 9} fill="none" stroke={color} strokeWidth={2.5} opacity={0.7} />
      {/* Furo central */}
      <circle cx={c} cy={c} r={9} fill="none" stroke={color} strokeWidth={4} />
      {/* Raios / parafusos */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 6
        const rr = rRoot - 14
        return <circle key={i} cx={c + rr * Math.cos(a)} cy={c + rr * Math.sin(a)} r={2.2} fill={color} opacity={0.8} />
      })}
    </svg>
  )
}

/** Engrenagens de fundo (app-wide), sutis nos cantos. Aceleram em eventos. */
export default function GearDecor() {
  const blue = 'rgba(58,143,255,0.10)'
  const gold = 'rgba(240,192,64,0.09)'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <Gear size={190} color={blue} teeth={12} duration={70}         style={{ position: 'absolute', top: -60, right: -50 }} />
      <Gear size={120} color={gold} teeth={9}  duration={48} reverse style={{ position: 'absolute', top: 70,  right: 60 }} />
      <Gear size={160} color={blue} teeth={11} duration={60} reverse style={{ position: 'absolute', bottom: -50, left: -45 }} />
      <Gear size={90}  color={gold} teeth={8}  duration={40}         style={{ position: 'absolute', bottom: 80,  left: 55 }} />
    </div>
  )
}
