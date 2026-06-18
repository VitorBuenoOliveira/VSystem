// Web Audio API — design de som do "System" estilo Solo Leveling
// Sons sintéticos em camadas + som de notificação (mp3)
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  // Safari/Chrome suspendem o contexto até interação — retoma se preciso
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Lê a preferência de som direto do storage (sem prop drilling). */
function soundsEnabled(): boolean {
  try {
    const raw = localStorage.getItem('monarca-v2')
    if (!raw) return true
    return JSON.parse(raw).soundEnabled !== false
  } catch { return true }
}

// ── Som de notificação do Solo Leveling (mp3 em /public) ──────────────────
let notifAudio: HTMLAudioElement | null = null
let lastNotif = 0

export function playNotificationSound(vol = 0.55) {
  if (!soundsEnabled()) return
  const now = Date.now()
  if (now - lastNotif < 400) return
  lastNotif = now
  try {
    if (!notifAudio) notifAudio = new Audio(`${import.meta.env.BASE_URL}system-notification.mp3`)
    notifAudio.volume = vol
    notifAudio.currentTime = 0
    void notifAudio.play().catch(() => { /* autoplay bloqueado até primeira interação */ })
  } catch { /* ignore */ }
}

// ── Motor de síntese em camadas ───────────────────────────────────────────

interface ToneOpts {
  freq: number
  dur: number
  vol?: number
  type?: OscillatorType
  attack?: number      // tempo de ataque (s)
  delay?: number       // atraso antes de tocar (s)
  detune?: number      // camada extra levemente desafinada para "corpo"
  sweepTo?: number     // varredura de frequência (efeito sci-fi)
}

/** Toca uma nota com envelope ADSR simplificado e camada de detune opcional. */
function tone(o: ToneOpts) {
  const ac = getCtx()
  const t0 = ac.currentTime + (o.delay ?? 0)
  const vol = o.vol ?? 0.08
  const attack = o.attack ?? 0.008

  const make = (freq: number, gainScale: number) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain); gain.connect(ac.destination)
    osc.type = o.type ?? 'sine'
    osc.frequency.setValueAtTime(freq, t0)
    if (o.sweepTo) osc.frequency.exponentialRampToValueAtTime(o.sweepTo, t0 + o.dur)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(vol * gainScale, t0 + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
    osc.start(t0); osc.stop(t0 + o.dur + 0.02)
  }

  make(o.freq, 1)
  if (o.detune) make(o.freq * (1 + o.detune), 0.5)  // camada de corpo
}

/** Acorde: várias frequências simultâneas. */
function chord(freqs: number[], dur: number, vol = 0.06, type: OscillatorType = 'triangle') {
  freqs.forEach(f => tone({ freq: f, dur, vol, type, detune: 0.004, attack: 0.012 }))
}

/** Arpejo ascendente: notas em sequência com leve shimmer. */
function arp(freqs: number[], step = 0.09, dur = 0.22, vol = 0.07, type: OscillatorType = 'triangle') {
  freqs.forEach((f, i) => tone({ freq: f, dur, vol, type, delay: i * step, detune: 0.005, attack: 0.01 }))
}

// Notas (Hz) — escala usada nos sons
const N = {
  C4: 261.6, E4: 329.6, G4: 392.0, A4: 440.0,
  C5: 523.3, D5: 587.3, E5: 659.3, G5: 784.0,
  A5: 880.0, C6: 1046.5, E6: 1318.5,
}

export function useSounds() {
  return {
    // Abrir o System — sopro grave + duas notas claras subindo
    playSystemOpen: () => {
      if (!soundsEnabled()) return
      tone({ freq: 110, dur: 0.5, vol: 0.05, type: 'sine', sweepTo: 220 })
      tone({ freq: N.A4, dur: 0.16, vol: 0.06, delay: 0.05, type: 'triangle' })
      tone({ freq: N.E5, dur: 0.22, vol: 0.07, delay: 0.16, type: 'triangle', detune: 0.005 })
    },

    // Completar missão — duas notas brilhantes ascendentes
    playMissionComplete: () => {
      if (!soundsEnabled()) return
      tone({ freq: N.C5, dur: 0.12, vol: 0.07, type: 'triangle', detune: 0.004 })
      tone({ freq: N.G5, dur: 0.22, vol: 0.08, delay: 0.09, type: 'triangle', detune: 0.004 })
    },

    // Falha / penalidade — tom grave descendente, áspero
    playPenalty: () => {
      if (!soundsEnabled()) return
      tone({ freq: 240, dur: 0.4, vol: 0.09, type: 'sawtooth', sweepTo: 90 })
    },

    // Honra / Rank Up — arpejo épico em camadas + acorde final
    playHonorOrRankUp: () => {
      if (!soundsEnabled()) return
      arp([N.C5, N.E5, N.G5, N.C6], 0.1, 0.3, 0.07)
      chord([N.C5, N.E5, N.G5], 0.7, 0.04, 'triangle')
      tone({ freq: N.E6, dur: 0.5, vol: 0.05, delay: 0.42, type: 'sine', detune: 0.006 })
    },

    // Avançar andar de masmorra — duas notas curtas firmes
    playDungeonFloor: () => {
      if (!soundsEnabled()) return
      tone({ freq: N.E4, dur: 0.08, vol: 0.07, type: 'square' })
      tone({ freq: N.A4, dur: 0.16, vol: 0.07, delay: 0.08, type: 'triangle', detune: 0.004 })
    },

    // Invocar sombra — varredura grave sombria + nota etérea
    playShadowSummon: () => {
      if (!soundsEnabled()) return
      tone({ freq: 160, dur: 0.6, vol: 0.07, type: 'sawtooth', sweepTo: 55 })
      tone({ freq: N.A5, dur: 0.5, vol: 0.04, delay: 0.15, type: 'sine', detune: 0.008 })
    },

    // Boss derrotado — impacto grave + fanfarra ascendente
    playBossDefeat: () => {
      if (!soundsEnabled()) return
      tone({ freq: 80, dur: 0.5, vol: 0.11, type: 'sawtooth' })
      arp([N.G4, N.C5, N.E5, N.G5, N.C6], 0.08, 0.3, 0.07)
    },

    // Ascensão Monarca — coro grandioso em camadas
    playAscension: () => {
      if (!soundsEnabled()) return
      tone({ freq: 65, dur: 1.2, vol: 0.07, type: 'sine', sweepTo: 130 })
      chord([N.C5, N.E5, N.G5, N.C6], 1.4, 0.045, 'triangle')
      arp([N.C5, N.E5, N.G5, N.C6, N.E6], 0.13, 0.5, 0.06)
    },

    // Conquista desbloqueada — sino duplo dourado
    playAchievement: () => {
      if (!soundsEnabled()) return
      tone({ freq: N.E5, dur: 0.18, vol: 0.07, type: 'triangle', detune: 0.004 })
      tone({ freq: N.A5, dur: 0.35, vol: 0.07, delay: 0.12, type: 'triangle', detune: 0.005 })
    },

    // Caractere digitado (typewriter) — clique curtíssimo e suave
    playType: () => {
      if (!soundsEnabled()) return
      tone({ freq: 1200 + Math.random() * 300, dur: 0.025, vol: 0.015, type: 'square' })
    },
  }
}
