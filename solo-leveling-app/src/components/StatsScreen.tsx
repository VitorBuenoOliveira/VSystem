import { useEffect, useRef, useLayoutEffect, useState } from 'react'
import SLFrame from './ui/SLFrame'
import { usePlayerStore } from '../hooks/usePlayerStore'
import { useSounds } from '../hooks/useSounds'
import { calcAttributes, calcBaseAttributes } from '../utils'
import { RANKS } from '../data/ranks'
import { Gear } from './ui/GearDecor'
import ClassesPanel from './ClassesPanel'
import RelicPanel from './RelicPanel'
import type { DailyLog, PlayerAttributes, PlayerStats } from '../types'

// ── Canvas helpers ─────────────────────────────────────────────────────────

function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const dpr = window.devicePixelRatio || 1
  canvas.width  = w * dpr
  canvas.height = h * dpr
  canvas.style.width  = w + 'px'
  canvas.style.height = h + 'px'
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  return ctx
}

// ── XP Bar Chart (last 21 days) ────────────────────────────────────────────

function XPBarChart({ logs }: { logs: DailyLog[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(320)

  useLayoutEffect(() => {
    if (wrapRef.current) setW(wrapRef.current.clientWidth)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const H   = 140
    const ctx = setupCanvas(canvas, W, H)
    ctx.clearRect(0, 0, W, H)

    const DAYS = 21
    const days: { date: string; log: DailyLog | undefined }[] = []
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      days.push({ date, log: logs.find(l => l.date === date) })
    }

    const vals   = days.map(d => d.log?.totalXpEarned ?? 0)
    const maxXp  = Math.max(...vals, 60)
    const avgXp  = vals.filter(v => v > 0).reduce((a, b) => a + b, 0) / Math.max(1, vals.filter(v => v > 0).length)
    const pad    = 10
    const barArea = H - 26
    const barW   = (W - pad * 2) / DAYS

    // Grid lines (4 levels)
    for (let r = 1; r <= 4; r++) {
      const yg = H - 20 - barArea * (r / 4)
      ctx.strokeStyle = 'rgba(40,100,200,0.1)'
      ctx.lineWidth   = 1
      ctx.setLineDash([3, 4])
      ctx.beginPath(); ctx.moveTo(pad, yg); ctx.lineTo(W - pad, yg); ctx.stroke()
      ctx.setLineDash([])
      // XP label
      ctx.fillStyle   = 'rgba(80,120,200,0.35)'
      ctx.font        = '8px "Share Tech Mono"'
      ctx.textAlign   = 'right'
      ctx.fillText(String(Math.round(maxXp * r / 4)), pad - 2, yg + 3)
    }

    // Average line
    if (avgXp > 0) {
      const yAvg = H - 20 - (avgXp / maxXp) * barArea
      ctx.strokeStyle = 'rgba(240,192,64,0.4)'
      ctx.lineWidth   = 1
      ctx.setLineDash([4, 3])
      ctx.beginPath(); ctx.moveTo(pad, yAvg); ctx.lineTo(W - pad, yAvg); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(240,192,64,0.5)'
      ctx.font      = '8px "Share Tech Mono"'
      ctx.textAlign = 'left'
      ctx.fillText(`⌀${Math.round(avgXp)}`, pad + 2, yAvg - 3)
    }

    days.forEach(({ log }, i) => {
      const xp = log?.totalXpEarned ?? 0
      const x  = pad + i * barW
      const h  = log ? Math.max(4, (xp / maxXp) * barArea) : 2
      const y  = H - 20 - h

      const color = !log ? 'rgba(30,50,100,0.35)'
        : log.honoredDay ? '#f0c040'
        : (log.failedPrincipals?.length ?? 0) > 0 ? '#e04040'
        : '#40e080'

      ctx.shadowColor = color
      ctx.shadowBlur  = log ? 6 : 0

      // Bar gradient
      if (log) {
        const grad = ctx.createLinearGradient(0, y, 0, H - 20)
        grad.addColorStop(0, color)
        grad.addColorStop(1, color.replace(')', ', 0.3)').replace('rgb', 'rgba') || color)
        ctx.fillStyle = grad
      } else {
        ctx.fillStyle = color
      }
      ctx.fillRect(x + 2, y, barW - 4, h)
      ctx.shadowBlur  = 0
    })

    // Baseline
    ctx.strokeStyle = 'rgba(40,100,200,0.4)'
    ctx.lineWidth   = 1
    ctx.beginPath(); ctx.moveTo(pad, H - 20); ctx.lineTo(W - pad, H - 20); ctx.stroke()

    // Day labels (every 3)
    ctx.fillStyle   = 'rgba(100,140,200,0.45)'
    ctx.font        = '8px "Share Tech Mono"'
    ctx.textAlign   = 'center'
    days.forEach(({ date }, i) => {
      if (i % 3 !== 0) return
      const d = new Date(date + 'T12:00:00')
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2,'0')}`
      ctx.fillText(label, pad + i * barW + barW / 2, H - 6)
    })
  }, [logs, W])

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 140 }} />
    </div>
  )
}

// ── Radar Chart — 5 atributos ──────────────────────────────────────────────

const RADAR_AXES: { key: keyof PlayerAttributes; label: string; color: string; icon: string }[] = [
  { key: 'forca',        label: 'Força',        color: '#e05050', icon: '⚔' },
  { key: 'inteligencia', label: 'Inteligência',  color: '#40a8ff', icon: '📖' },
  { key: 'espiritual',   label: 'Espiritual',    color: '#b080ff', icon: '✦' },
  { key: 'carisma',      label: 'Carisma',       color: '#f06090', icon: '❤' },
  { key: 'vitalidade',   label: 'Vitalidade',    color: '#40c880', icon: '🛡' },
]

function AttributeRadar({ attrs, maxVal }: { attrs: PlayerAttributes; maxVal: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const S = 220

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = setupCanvas(canvas, S, S)
    ctx.clearRect(0, 0, S, S)

    const cx = S / 2, cy = S / 2
    const R  = 76
    const N  = RADAR_AXES.length
    const values = RADAR_AXES.map(a => Math.min(1, attrs[a.key] / Math.max(maxVal, 1)))

    // Grid rings
    for (let r = 1; r <= 5; r++) {
      const rr = (R * r) / 5
      ctx.strokeStyle = r === 5 ? 'rgba(40,100,200,0.3)' : 'rgba(40,100,200,0.12)'
      ctx.lineWidth   = r === 5 ? 1 : 0.5
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const angle = (Math.PI * 2 * i) / N - Math.PI / 2
        const x = cx + rr * Math.cos(angle)
        const y = cy + rr * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.closePath(); ctx.stroke()

      // Ring label
      if (r % 2 === 0) {
        ctx.fillStyle   = 'rgba(80,120,200,0.3)'
        ctx.font        = '7px "Share Tech Mono"'
        ctx.textAlign   = 'center'
        ctx.fillText(String(Math.round((maxVal * r) / 5)), cx + 4, cy - rr - 2)
      }
    }

    // Axes
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2
      ctx.strokeStyle = 'rgba(40,100,200,0.2)'
      ctx.lineWidth   = 0.5
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle))
      ctx.stroke()
    }

    // Filled polygon (glow)
    const pts = values.map((v, i) => {
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2
      return { x: cx + R * v * Math.cos(angle), y: cy + R * v * Math.sin(angle) }
    })

    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.closePath()
    ctx.fillStyle   = 'rgba(58,143,255,0.12)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(58,143,255,0.7)'
    ctx.lineWidth   = 1.5
    ctx.shadowColor = '#3a8fff'
    ctx.shadowBlur  = 10
    ctx.stroke()
    ctx.shadowBlur  = 0

    // Points + colored fill segments
    pts.forEach((p, i) => {
      const color = RADAR_AXES[i].color
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle   = color
      ctx.shadowColor = color
      ctx.shadowBlur  = 10
      ctx.fill()
      ctx.shadowBlur  = 0
      ctx.strokeStyle = '#0a1830'
      ctx.lineWidth   = 1
      ctx.stroke()
    })

    // Labels
    RADAR_AXES.forEach((axis, i) => {
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2
      const dist  = R + 20
      const lx    = cx + dist * Math.cos(angle)
      const ly    = cy + dist * Math.sin(angle)
      const val   = attrs[axis.key]

      ctx.fillStyle    = axis.color
      ctx.font         = 'bold 10px Rajdhani, sans-serif'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor  = axis.color
      ctx.shadowBlur   = 6
      ctx.fillText(axis.label, lx, ly - 6)
      ctx.shadowBlur   = 0
      ctx.fillStyle    = 'rgba(160,200,255,0.7)'
      ctx.font         = 'bold 10px "Share Tech Mono"'
      ctx.fillText(String(val), lx, ly + 8)
    })

  }, [attrs, maxVal])

  return <canvas ref={canvasRef} style={{ display: 'block', width: S, height: S, margin: '0 auto' }} />
}

// ── Heatmap (last 84 days) ─────────────────────────────────────────────────

function ActivityHeatmap({ logs }: { logs: DailyLog[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const WEEKS = 14, CELL = 16, GAP = 3
    const W = WEEKS * (CELL + GAP) + GAP
    const H = 7 * (CELL + GAP) + GAP + 20
    const ctx = setupCanvas(canvas, W, H)
    ctx.clearRect(0, 0, W, H)

    const countMap: Record<string, number> = {}
    logs.forEach(l => { countMap[l.date] = l.completedMissions.length })
    const maxCount = Math.max(...Object.values(countMap), 1)

    const today    = new Date()
    const startDay = new Date(today)
    const dow      = today.getDay()
    startDay.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) - (WEEKS - 1) * 7)

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < 7; day++) {
        const d = new Date(startDay)
        d.setDate(startDay.getDate() + week * 7 + day)
        const dateStr  = d.toISOString().slice(0, 10)
        const count    = countMap[dateStr] ?? -1
        const isFuture = d > today
        const log      = logs.find(l => l.date === dateStr)

        const x = GAP + week * (CELL + GAP)
        const y = GAP + day  * (CELL + GAP)

        // Cell bg
        if (isFuture) {
          ctx.fillStyle = 'rgba(8,16,40,0.25)'
        } else if (count < 0) {
          ctx.fillStyle = 'rgba(20,40,80,0.35)'
        } else {
          const intensity = count / maxCount
          const base = log?.honoredDay ? [240, 192, 64]
            : (log?.failedPrincipals?.length ?? 0) > 0 ? [220, 64, 64]
            : [64, 220, 128]
          ctx.fillStyle = `rgba(${base[0]},${base[1]},${base[2]},${0.15 + intensity * 0.75})`
        }
        ctx.fillRect(x, y, CELL, CELL)

        // Border
        ctx.strokeStyle = 'rgba(40,100,200,0.12)'
        ctx.lineWidth   = 0.5
        ctx.strokeRect(x, y, CELL, CELL)

        // Mission count if any
        if (!isFuture && count > 0) {
          ctx.fillStyle   = 'rgba(255,255,255,0.5)'
          ctx.font        = '7px "Share Tech Mono"'
          ctx.textAlign   = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(count), x + CELL / 2, y + CELL / 2)
        }
      }

      // Week label at bottom
      if (week % 2 === 0) {
        const d = new Date(startDay); d.setDate(startDay.getDate() + week * 7)
        const label = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
        ctx.fillStyle    = 'rgba(80,120,200,0.4)'
        ctx.font         = '8px "Share Tech Mono"'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(label, GAP + week * (CELL + GAP) + CELL / 2, 7 * (CELL + GAP) + GAP + 3)
      }
    }

    // Day labels on the left of week 0

  }, [logs])

  return (
    <div style={{ overflowX: 'auto' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}

// ── Escalada Cumulativa de XP (a jornada rumo ao Rank S) ────────────────────

function CumulativeXPChart({ logs }: { logs: DailyLog[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(320)

  useLayoutEffect(() => {
    if (wrapRef.current) setW(wrapRef.current.clientWidth)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const H   = 170
    const ctx = setupCanvas(canvas, W, H)
    ctx.clearRect(0, 0, W, H)

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date))
    // Série cumulativa de XP líquido
    let acc = 0
    const series = sorted.map(l => {
      acc += (l.totalXpEarned ?? 0) - (l.totalXpLost ?? 0)
      return { date: l.date, xp: Math.max(0, acc) }
    })

    const padL = 4, padR = 4, padT = 12, padB = 18
    const plotW = W - padL - padR
    const plotH = H - padT - padB

    const maxXp = Math.max(series[series.length - 1]?.xp ?? 0, 600)
    const yFor  = (xp: number) => padT + plotH - (xp / maxXp) * plotH
    const xFor  = (i: number) => padL + (series.length <= 1 ? plotW / 2 : (i / (series.length - 1)) * plotW)

    // Linhas de threshold de rank
    RANKS.forEach(r => {
      if (r.minXp <= 0 || r.minXp > maxXp) return
      const y = yFor(r.minXp)
      ctx.strokeStyle = r.color + '40'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = r.color + 'cc'
      ctx.font = 'bold 8px Rajdhani, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`${r.rank}`, padL + 2, y - 2)
    })

    if (series.length === 0) return

    // Área preenchida sob a curva
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB)
    grad.addColorStop(0, 'rgba(58,143,255,0.35)')
    grad.addColorStop(1, 'rgba(58,143,255,0.02)')
    ctx.beginPath()
    ctx.moveTo(xFor(0), H - padB)
    series.forEach((p, i) => ctx.lineTo(xFor(i), yFor(p.xp)))
    ctx.lineTo(xFor(series.length - 1), H - padB)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Linha da curva
    ctx.beginPath()
    series.forEach((p, i) => i === 0 ? ctx.moveTo(xFor(i), yFor(p.xp)) : ctx.lineTo(xFor(i), yFor(p.xp)))
    ctx.strokeStyle = '#7dc8ff'
    ctx.lineWidth = 2
    ctx.shadowColor = '#3a8fff'
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0

    // Ponto final (estado atual)
    const last = series[series.length - 1]
    const lx = xFor(series.length - 1), ly = yFor(last.xp)
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#7dc8ff'; ctx.shadowColor = '#3a8fff'; ctx.shadowBlur = 10
    ctx.fill(); ctx.shadowBlur = 0

    // Datas (início / fim)
    ctx.fillStyle = 'rgba(100,140,200,0.5)'
    ctx.font = '8px "Share Tech Mono"'
    const fmt = (s: string) => { const [, m, d] = s.split('-'); return `${d}/${m}` }
    ctx.textAlign = 'left';  ctx.fillText(fmt(series[0].date), padL, H - 5)
    ctx.textAlign = 'right'; ctx.fillText(fmt(last.date), W - padR, H - 5)
  }, [logs, W])

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 170 }} />
    </div>
  )
}

// ── Linha do tempo de marcos ────────────────────────────────────────────────

interface Milestone { date: string; icon: string; label: string; color: string }

function buildMilestones(stats: PlayerStats): Milestone[] {
  const ms: Milestone[] = []
  const sorted = [...stats.logs].sort((a, b) => a.date.localeCompare(b.date))

  // Cruzamentos de rank (a partir do XP cumulativo)
  let acc = 0
  const reached = new Set<string>()
  for (const l of sorted) {
    acc += (l.totalXpEarned ?? 0) - (l.totalXpLost ?? 0)
    for (const r of RANKS) {
      if (r.minXp > 0 && acc >= r.minXp && !reached.has(r.rank)) {
        reached.add(r.rank)
        ms.push({ date: l.date, icon: '⬆', label: `Alcançou Rank ${r.rank} — ${r.label}`, color: r.color })
      }
    }
  }

  // Ascensões Monarca
  for (const a of (stats.ascensionLog ?? [])) {
    ms.push({ date: a.date, icon: '♛', label: `Ascensão Monarca (de Rank ${a.fromRank})`, color: '#f0c040' })
  }

  // Conquistas desbloqueadas com data
  for (const ach of stats.achievements) {
    if (ach.unlocked && ach.unlockedAt) {
      ms.push({ date: ach.unlockedAt, icon: ach.icon, label: ach.name, color: '#b080ff' })
    }
  }

  return ms.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12)
}

// ── Attribute Allocation Panel ─────────────────────────────────────────────

const ATTR_META: { key: keyof PlayerAttributes; label: string; icon: string; color: string; desc: string }[] = [
  { key: 'forca',        label: 'Força',        icon: '⚔', color: '#e05050', desc: 'Missões de saúde/corpo' },
  { key: 'inteligencia', label: 'Inteligência',  icon: '📖', color: '#40a8ff', desc: 'Missões de estudo/inglês' },
  { key: 'espiritual',   label: 'Espiritual',    icon: '✦', color: '#b080ff', desc: 'Missões de fé' },
  { key: 'carisma',      label: 'Carisma',       icon: '❤', color: '#f06090', desc: 'Missões de amor' },
  { key: 'vitalidade',   label: 'Vitalidade',    icon: '🛡', color: '#40c880', desc: 'Hábitos + streak' },
]

function AllocationPanel() {
  const { stats, allocatePoint, deallocatePoint } = usePlayerStore()
  const base    = calcBaseAttributes(stats)
  const alloc   = stats.allocatedPoints ?? {}
  const total   = calcAttributes(stats)
  const free    = stats.freeAttributePoints ?? 0

  return (
    <SLFrame glowColor={free > 0 ? '#f0c040' : '#3a8fff'} style={{ padding: '14px 16px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
          ◈ ATRIBUTOS
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 10px',
          background: free > 0 ? 'rgba(60,40,0,0.6)' : 'rgba(4,16,52,0.6)',
          border: `1px solid ${free > 0 ? 'rgba(240,192,64,0.5)' : 'rgba(40,100,200,0.3)'}`,
        }}>
          <span style={{ fontSize: 10, color: free > 0 ? '#f0c040' : 'var(--text-muted)', fontFamily: 'Rajdhani', fontWeight: 700 }}>
            {free > 0 ? `✦ ${free} PONTOS LIVRES` : 'SEM PONTOS LIVRES'}
          </span>
        </div>
      </div>

      {free > 0 && (
        <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'rgba(240,192,64,0.6)', marginBottom: 10 }}>
          Você subiu de nível! Distribua seus pontos nos atributos abaixo.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ATTR_META.map(({ key, label, icon, color, desc }) => {
          const baseVal  = base[key]
          const allocated = alloc[key] ?? 0
          const finalVal = total[key]

          return (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px',
              background: 'rgba(4,12,40,0.5)',
              border: `1px solid ${color}22`,
              borderLeft: `2px solid ${color}88`,
            }}>
              <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{icon}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)' }}>
                  {desc}
                </div>
              </div>

              {/* Values */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: 'var(--text-muted)' }}>
                  {baseVal}
                </span>
                {allocated > 0 && (
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: '#f0c040' }}>
                    +{allocated}
                  </span>
                )}
                <span style={{
                  fontFamily: "'Share Tech Mono'", fontSize: 16, fontWeight: 700,
                  color, textShadow: `0 0 8px ${color}`,
                  minWidth: 24, textAlign: 'center',
                }}>
                  {finalVal}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => deallocatePoint(key)}
                  disabled={allocated <= 0}
                  style={{
                    width: 26, height: 26,
                    background: allocated > 0 ? 'rgba(80,20,10,0.7)' : 'rgba(20,20,40,0.4)',
                    border: `1px solid ${allocated > 0 ? 'rgba(200,60,40,0.5)' : 'rgba(40,60,100,0.3)'}`,
                    color: allocated > 0 ? '#e06040' : '#333',
                    cursor: allocated > 0 ? 'pointer' : 'default',
                    fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  −
                </button>
                <button
                  onClick={() => allocatePoint(key)}
                  disabled={free <= 0}
                  style={{
                    width: 26, height: 26,
                    background: free > 0 ? 'rgba(20,60,20,0.7)' : 'rgba(20,20,40,0.4)',
                    border: `1px solid ${free > 0 ? 'rgba(60,200,80,0.5)' : 'rgba(40,60,100,0.3)'}`,
                    color: free > 0 ? '#50e080' : '#333',
                    cursor: free > 0 ? 'pointer' : 'default',
                    fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 8, fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        Base (automático) + Alocado manual = Total. Você ganha 2 pontos por nível.
      </div>
    </SLFrame>
  )
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const { stats } = usePlayerStore()
  const sounds = useSounds()
  useEffect(() => { sounds.playSystemOpen() }, []) // eslint-disable-line

  const last7 = getLast7Days()
  const logMap = Object.fromEntries(stats.logs.map(l => [l.date, l]))

  const totalCompleted = stats.logs.reduce((s, l) => s + l.completedMissions.length, 0)
  const totalEarned    = stats.logs.reduce((s, l) => s + l.totalXpEarned, 0)
  const honorRate      = stats.logs.length > 0
    ? Math.round((stats.totalHonorDays / stats.logs.length) * 100)
    : 0

  const attrs  = calcAttributes(stats)
  const maxVal = Math.max(10, ...Object.values(attrs))
  const free   = stats.freeAttributePoints ?? 0
  const milestones = buildMilestones(stats)

  return (
    <div style={{ padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <SLFrame style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.3em', color: 'var(--neon-bright)', textShadow: 'var(--neon-glow)' }}>
          <Gear size={15} color="rgba(125,200,255,0.7)" duration={11} reverse />
          ◆ Estatísticas ◆
          <Gear size={15} color="rgba(125,200,255,0.7)" duration={9} />
        </div>
      </SLFrame>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatCard label="DIAS HONRADOS"  value={stats.totalHonorDays}      icon="✦" color="var(--gold)" />
        <StatCard label="TAXA DE HONRA"  value={`${honorRate}%`}           icon="◈" color="var(--gold)" />
        <StatCard label="STREAK ATUAL"   value={`${stats.currentStreak}d`} icon="🔥" color="#f0a030" />
        <StatCard label="MELHOR STREAK"  value={`${stats.longestStreak}d`} icon="⚡" color="var(--neon-bright)" />
        <StatCard label="MISSÕES TOTAIS" value={totalCompleted}            icon="⚔" color="var(--success)" />
        <StatCard label="XP GANHO"       value={totalEarned}               icon="▲" color="#50e890" mono />
      </div>

      {/* ── Jornada: escalada cumulativa de XP ── */}
      <SLFrame style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
          JORNADA — ESCALADA RUMO AO RANK S
        </div>
        <CumulativeXPChart logs={stats.logs} />
        <div style={{ fontSize: 8, fontFamily: 'Rajdhani', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: 4 }}>
          XP acumulado ao longo do tempo. As linhas tracejadas marcam cada Rank.
        </div>
      </SLFrame>

      {/* ── Linha do tempo de marcos ── */}
      {milestones.length > 0 && (
        <SLFrame style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
            MARCOS DA JORNADA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(40,100,200,0.1)' }}>
                <span style={{
                  width: 26, height: 26, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, borderRadius: '50%',
                  border: `1px solid ${m.color}66`, background: `${m.color}14`,
                  color: m.color, textShadow: `0 0 6px ${m.color}`,
                }}>{m.icon}</span>
                <span style={{ flex: 1, fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                  {m.label}
                </span>
                <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {(() => { const [, mo, d] = m.date.split('-'); return `${d}/${mo}` })()}
                </span>
              </div>
            ))}
          </div>
        </SLFrame>
      )}

      {/* ── Attribute Radar ── */}
      <SLFrame glowColor={free > 0 ? '#f0c040' : '#3a8fff'} style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
            RADAR DE ATRIBUTOS
          </div>
          {free > 0 && (
            <div style={{ fontSize: 9, color: '#f0c040', fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: '0.1em' }}>
              ✦ {free} PONTOS LIVRES ↓
            </div>
          )}
        </div>
        <AttributeRadar attrs={attrs} maxVal={maxVal} />
      </SLFrame>

      {/* ── Allocation Panel ── */}
      <AllocationPanel />

      {/* ── XP Bar Chart ── */}
      <SLFrame style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
          XP POR DIA — ÚLTIMOS 21 DIAS
        </div>
        <XPBarChart logs={stats.logs} />
        <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 9, fontFamily: 'Rajdhani', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          <span><span style={{ color: 'var(--gold)' }}>■</span> Honrado</span>
          <span><span style={{ color: 'var(--success)' }}>■</span> Cumprido</span>
          <span><span style={{ color: 'var(--danger)' }}>■</span> Falhou</span>
          <span><span style={{ color: 'rgba(240,192,64,0.5)' }}>—</span> Média</span>
        </div>
      </SLFrame>

      {/* ── Activity Heatmap ── */}
      <SLFrame style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
          ATIVIDADE — ÚLTIMAS 14 SEMANAS
        </div>
        <ActivityHeatmap logs={stats.logs} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 9, fontFamily: 'Rajdhani', color: 'var(--text-muted)' }}>
          <span><span style={{ color: 'rgba(240,192,64,0.8)' }}>■</span> Honrado</span>
          <span><span style={{ color: 'rgba(64,220,128,0.8)' }}>■</span> Cumprido</span>
          <span><span style={{ color: 'rgba(220,64,64,0.8)' }}>■</span> Falhou</span>
          <span><span style={{ color: 'rgba(20,40,80,0.6)' }}>■</span> Sem dado</span>
        </div>
      </SLFrame>

      {/* 7-day calendar */}
      <SLFrame style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 10 }}>
          ÚLTIMOS 7 DIAS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {last7.map(({ date, label }) => {
            const log     = logMap[date]
            const honored = log?.honoredDay
            const failed  = log && (log.failedPrincipals?.length ?? 0) > 0
            const hasLog  = !!log
            const bg      = honored ? 'rgba(240,192,64,0.15)' : failed ? 'rgba(220,64,64,0.12)' : hasLog ? 'rgba(64,224,128,0.1)' : 'rgba(20,40,80,0.4)'
            const border  = honored ? 'rgba(240,192,64,0.5)' : failed ? 'rgba(220,64,64,0.4)' : hasLog ? 'rgba(64,224,128,0.35)' : 'rgba(40,100,200,0.2)'
            const symbol  = honored ? '✦' : failed ? '⚠' : hasLog ? '✓' : '·'
            const symColor = honored ? 'var(--gold)' : failed ? 'var(--danger)' : hasLog ? 'var(--success)' : 'var(--text-muted)'
            return (
              <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>{label}</span>
                <div style={{
                  width: 34, height: 34, background: bg, border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: symColor,
                  textShadow: honored ? '0 0 8px var(--gold)' : hasLog ? '0 0 6px var(--success)' : 'none',
                }}>
                  {symbol}
                </div>
              </div>
            )
          })}
        </div>
      </SLFrame>

      {/* Recent history */}
      {stats.logs.length > 0 && (
        <SLFrame style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 8 }}>
            HISTÓRICO RECENTE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[...stats.logs].reverse().slice(0, 7).map(log => (
              <div key={log.date} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(4,16,52,0.6)',
                border: '1px solid rgba(40,100,200,0.2)',
                borderLeft: `2px solid ${log.honoredDay ? 'rgba(240,192,64,0.6)' : (log.failedPrincipals?.length ?? 0) > 0 ? 'rgba(220,80,80,0.5)' : 'rgba(64,224,128,0.4)'}`,
              }}>
                <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--text-muted)' }}>
                  {formatDate(log.date)}
                </span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: '#50e890' }}>
                    +{log.totalXpEarned}
                  </span>
                  {log.totalXpLost > 0 && (
                    <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--danger)' }}>-{log.totalXpLost}</span>
                  )}
                  {log.honoredDay && (
                    <span style={{ fontSize: 10, color: 'var(--gold)', textShadow: '0 0 6px var(--gold)' }}>✦</span>
                  )}
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'var(--text-muted)' }}>
                    {log.completedMissions.length}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SLFrame>
      )}

      {/* ── Classes ── */}
      <ClassesPanel />

      {/* ── Relíquias ── */}
      <RelicPanel />
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, mono }: {
  label: string; value: string | number; icon: string; color: string; mono?: boolean
}) {
  return (
    <SLFrame glowColor={color.startsWith('var') ? '#3a8fff' : color} style={{ padding: '12px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{
        fontSize: 24, fontWeight: 700,
        fontFamily: mono ? "'Share Tech Mono', monospace" : 'Rajdhani, sans-serif',
        color, textShadow: `0 0 10px ${color.startsWith('var') ? 'rgba(58,143,255,0.5)' : color}`,
        lineHeight: 1,
      }}>
        {value}
      </div>
    </SLFrame>
  )
}

function getLast7Days() {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const date  = d.toISOString().slice(0, 10)
    const label = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]
    result.push({ date, label })
  }
  return result
}

function formatDate(s: string) {
  const [,m,d] = s.split('-'); return `${d}/${m}`
}
