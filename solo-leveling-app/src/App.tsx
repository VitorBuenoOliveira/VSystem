import { useState, useCallback, useEffect, useRef } from 'react'
import DashboardScreen    from './components/DashboardScreen'
import DungeonsScreen     from './components/DungeonsScreen'
import ArmyScreen         from './components/ArmyScreen'
import StatsScreen        from './components/StatsScreen'
import ProfileScreen      from './components/ProfileScreen'
import ShopScreen          from './components/ShopScreen'
import VidaScreen          from './components/VidaScreen'
import RankUpOverlay          from './components/RankUpOverlay'
import RandomEventOverlay     from './components/RandomEventOverlay'
import BonusMissionOverlay       from './components/BonusMissionOverlay'
import AchievementUnlockOverlay  from './components/AchievementUnlockOverlay'
import { registerEventHandler, registerBonusMissionHandler, registerShadowEvoHandler } from './components/shared/EventBus'
import { usePlayerStore } from './hooks/usePlayerStore'
import { useSounds } from './hooks/useSounds'
import type { RandomEvent, BonusMission } from './types'
import ParticleBackground, { burstParticles } from './components/ui/ParticleBackground'
import GearDecor, { boostGears } from './components/ui/GearDecor'
import { getShadowStageIndex, SHADOW_STAGES } from './data/shadowPath'
import type { ShadowStage } from './data/shadowPath'
import ShadowEvolutionOverlay from './components/ShadowEvolutionOverlay'
import { Toast, registerToastHandler } from './components/shared/Toast'
import type { ToastData } from './components/shared/Toast'
import type { DayEndResult } from './utils'
import type { RankLabel } from './types'

// ── Beta version ──────────────────────────────────────────────────────────
export const APP_VERSION = '7.5'

type Screen = 'dashboard' | 'dungeons' | 'army' | 'vida' | 'shop' | 'stats' | 'profile'

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Missões',  icon: '⚔️' },
  { id: 'dungeons',  label: 'Masmorras',icon: '🏰' },
  { id: 'army',      label: 'Exército', icon: '🌑' },
  { id: 'vida',      label: 'Vida',     icon: '❤️' },
  { id: 'shop',      label: 'Loja',     icon: '◈'  },
  { id: 'stats',     label: 'Stats',    icon: '📊' },
  { id: 'profile',   label: 'Perfil',   icon: '👤' },
]

function App() {
  const { stats, acceptBonusMission, dismissBonusMission } = usePlayerStore()
  const sounds = useSounds()
  const [screen, setScreen]         = useState<Screen>('dashboard')
  const [toasts, setToasts]         = useState<ToastData[]>([])
  const [rankUp, setRankUp]         = useState<RankLabel | null>(null)
  // Filas: pop-ups são exibidos um de cada vez, sem sobreposição
  const [eventQueue, setEventQueue] = useState<RandomEvent[]>([])
  const [bonusQueue, setBonusQueue] = useState<BonusMission[]>([])
  const activeEvent  = eventQueue[0] ?? null
  const pendingBonus = bonusQueue[0] ?? null
  const [pendingAchievements, setPendingAchievements] = useState<{ id: string; icon: string; name: string; description: string }[]>([])
  const prevRankRef                 = useRef<RankLabel>('F')
  const prevShadowStageRef          = useRef<number>(getShadowStageIndex(stats))
  const [shadowEvo, setShadowEvo]   = useState<ShadowStage | null>(null)

  const addToast = useCallback((t: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...t, id }])
  }, [])

  useEffect(() => { registerToastHandler(addToast) }, [addToast])
  useEffect(() => { registerEventHandler(ev => setEventQueue(q => [...q, ev])) }, [])
  useEffect(() => { registerBonusMissionHandler(m => setBonusQueue(q => [...q, m])) }, [])
  useEffect(() => { registerShadowEvoHandler(setShadowEvo) }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleDayEnd = useCallback((result: DayEndResult) => {
    // XP ativo
    if (result.failedPrincipals.length === 0) {
      addToast({ message: `⚔ Dia encerrado! +${result.xpEarned} XP`, type: 'success' })
    } else {
      addToast({ message: `⚠ ${result.failedPrincipals.length} missão(ões) falhou — -${result.xpLost} XP`, type: 'error' })
    }
    if (result.honorBonus) {
      addToast({ message: '✦ Dia Honrado! +30 XP bônus', type: 'honor' })
      burstParticles('240,192,64')
    }
    if (result.passiveXp > 0) {
      addToast({ message: `🌑 Exército gerou +${result.passiveXp} XP passivo`, type: 'info' })
    }
    if (result.dungeonAdvances.length > 0) {
      addToast({ message: `🏰 ${result.dungeonAdvances.length} masmorra(s) avançaram!`, type: 'info' })
    }
    if (result.newShadows.length > 0) {
      addToast({ message: `🌑 ${result.newShadows.length} nova(s) sombra(s) invocada(s)!`, type: 'honor' })
      sounds.playShadowSummon()
    }
    if (result.bossDefeated) {
      addToast({ message: `☠️ BOSS DERROTADO! +${result.newStats.boss?.rewXp ?? 0} XP +${result.newStats.boss?.rewGold ?? 0}G`, type: 'honor' })
      sounds.playBossDefeat()
      burstParticles('220,80,80')
    } else if (result.bossDamageDealt > 0) {
      addToast({ message: `⚔ Boss sofreu ${result.bossDamageDealt} de dano!`, type: 'info' })
    }
    if (result.unlockedAchievements.length > 0) {
      const defs = result.newStats.achievements.filter(a => result.unlockedAchievements.includes(a.id))
      setPendingAchievements(defs.map(a => ({ id: a.id, icon: a.icon, name: a.name, description: a.description })))
    }

    // Missões semanais
    if (result.weeklyCompleted.length > 0) {
      addToast({ message: `★ ${result.weeklyCompleted.length} missão(ões) semanal(is) concluída(s)!`, type: 'honor' })
    }

    // Chaves de masmorra
    if (result.keysEarned > 0) {
      addToast({ message: `🔑 +${result.keysEarned} chave(s) de masmorra!`, type: 'honor' })
    }

    // Rank Up detection
    const newRank = result.newStats.rank
    if (newRank !== prevRankRef.current) {
      setRankUp(newRank)
      boostGears()   // engrenagens aceleram na evolução de rank
    }
    prevRankRef.current = newRank
    if (result.honorBonus) boostGears()

    // Evolução do Caminho das Sombras → overlay dedicado
    const newShadowStage = getShadowStageIndex(result.newStats)
    if (newShadowStage > prevShadowStageRef.current) {
      setShadowEvo(SHADOW_STAGES[newShadowStage])
    }
    prevShadowStageRef.current = newShadowStage
  }, [addToast])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <GearDecor />
      <ParticleBackground />
      <Toast toasts={toasts} onRemove={removeToast} />
      {rankUp && <RankUpOverlay newRank={rankUp} onDone={() => setRankUp(null)} />}
      {shadowEvo && !rankUp && <ShadowEvolutionOverlay stage={shadowEvo} onDone={() => setShadowEvo(null)} />}
      {activeEvent && !rankUp && <RandomEventOverlay event={activeEvent} onDone={() => setEventQueue(q => q.slice(1))} />}
      {pendingAchievements.length > 0 && (
        <AchievementUnlockOverlay
          achievements={pendingAchievements}
          onDone={() => setPendingAchievements([])}
        />
      )}
      {pendingBonus && !rankUp && !activeEvent && (
        <BonusMissionOverlay
          mission={pendingBonus}
          onAccept={() => { acceptBonusMission(pendingBonus); setBonusQueue(q => q.slice(1)); addToast({ message: '⚡ Quest Surpresa aceita! Aparece no dashboard.', type: 'info' }) }}
          onDismiss={() => { dismissBonusMission(); setBonusQueue(q => q.slice(1)) }}
        />
      )}

      <main style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        {screen === 'dashboard' && <DashboardScreen onDayEnd={handleDayEnd} />}
        {screen === 'dungeons'  && <DungeonsScreen />}
        {screen === 'army'      && <ArmyScreen />}
        {screen === 'vida'      && <VidaScreen />}
        {screen === 'shop'      && <ShopScreen />}
        {screen === 'stats'     && <StatsScreen />}
        {screen === 'profile'   && <ProfileScreen />}
      </main>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        display: 'flex',
        background: 'rgba(2,8,28,0.97)',
        borderTop: '1px solid rgba(40,140,255,0.4)',
        backdropFilter: 'blur(16px)',
        zIndex: 50,
        boxShadow: '0 -2px 20px rgba(40,100,255,0.15)',
      }}>
        <div style={{
          position: 'absolute', top: -1, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(58,143,255,0.8), transparent)',
          boxShadow: '0 0 8px rgba(58,143,255,0.6)',
        }}/>

        {NAV.map(item => {
          const active = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '7px 0 5px',
                gap: 1,
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? 'var(--neon-bright)' : 'rgba(100,150,220,0.5)',
                transition: 'color 0.15s',
                position: 'relative',
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
                  background: 'var(--neon-bright)',
                  boxShadow: '0 0 6px var(--neon)',
                }}/>
              )}
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 8, fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textShadow: active ? '0 0 8px var(--neon)' : 'none',
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Version badge */}
      <div style={{
        position: 'fixed', bottom: 62, right: 8,
        fontSize: 8, fontFamily: "'Share Tech Mono'",
        color: 'rgba(40,100,200,0.35)',
        letterSpacing: '0.05em',
        zIndex: 49,
      }}>
        v{APP_VERSION}
      </div>
    </div>
  )
}

export default App
