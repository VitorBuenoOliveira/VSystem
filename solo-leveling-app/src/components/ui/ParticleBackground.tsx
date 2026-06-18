import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; opacity: number; phase: number
}

interface BurstParticle {
  x: number; y: number
  vx: number; vy: number
  r: number; life: number; maxLife: number
  color: string
}

// ── Disparo global de "explosão" de partículas em eventos importantes ──────
let _burstHandler: ((color: string) => void) | null = null
/** Dispara um jorro de partículas subindo (rank-up, honra, conquista, etc). */
export function burstParticles(color = '240,192,64') { _burstHandler?.(color) }

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId = 0

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = Array.from({ length: 55 }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      vx:      (Math.random() - 0.5) * 0.3,
      vy:      (Math.random() - 0.5) * 0.3,
      r:       0.3 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.1,
      phase:   Math.random() * Math.PI * 2,
    }))

    // Partículas de explosão (eventos)
    let bursts: BurstParticle[] = []
    _burstHandler = (color: string) => {
      const cx = canvas.width / 2
      const cy = canvas.height * 0.55
      for (let i = 0; i < 60; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = 1 + Math.random() * 4
        bursts.push({
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 40,
          vx: Math.cos(ang) * spd * 0.4,
          vy: -Math.abs(Math.sin(ang) * spd) - 1,   // tende a subir (estilo Solo Leveling)
          r: 0.8 + Math.random() * 2.2,
          life: 0, maxLife: 60 + Math.random() * 50,
          color,
        })
      }
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.01

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0)             p.x = canvas.width
        if (p.x > canvas.width)  p.x = 0
        if (p.y < 0)             p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const alpha = p.opacity + Math.sin(t + p.phase) * 0.04
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(60,120,255,${alpha})`
        ctx.fill()
      }

      // Explosões
      if (bursts.length) {
        bursts = bursts.filter(b => b.life < b.maxLife)
        for (const b of bursts) {
          b.life++
          b.x += b.vx
          b.y += b.vy
          b.vy += 0.015          // leve gravidade
          b.vx *= 0.99
          const fade = 1 - b.life / b.maxLife
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r * fade, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${b.color},${fade * 0.9})`
          ctx.shadowBlur = 8
          ctx.shadowColor = `rgba(${b.color},${fade})`
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      _burstHandler = null
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
