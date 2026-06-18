import { useState, useEffect, useCallback, useRef } from 'react'

// ── Lembretes locais do System ──────────────────────────────────────────────
// Observação: sem servidor de push, notificações agendadas só disparam de forma
// confiável enquanto o app/PWA está aberto ou recém-fechado. Isso cobre o caso
// real de um PWA pessoal: ao abrir o app, agendamos o lembrete do dia.

const STORAGE_KEY = 'monarca-notif'

interface NotifConfig {
  enabled: boolean
  reminderTime: string  // 'HH:MM'
}

function load(): NotifConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { enabled: false, reminderTime: '20:00', ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { enabled: false, reminderTime: '20:00' }
}

function save(cfg: NotifConfig) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)) } catch { /* ignore */ }
}

async function showNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      reg.showNotification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: 'monarca-reminder' })
    } else {
      new Notification(title, { body, icon: '/icons/icon-192.png' })
    }
  } catch {
    try { new Notification(title, { body }) } catch { /* ignore */ }
  }
}

/** ms até o próximo horário HH:MM (hoje ou amanhã) */
function msUntil(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

export function useNotifications(todayLogged: boolean) {
  const [config, setConfig] = useState<NotifConfig>(load)
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supported = typeof window !== 'undefined' && 'Notification' in window

  const requestPermission = useCallback(async () => {
    if (!supported) return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      showNotification('⚔ System Online', 'Os lembretes do Sistema estão ativos, Jogador.')
    }
    return result
  }, [supported])

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig(c => { const next = { ...c, enabled }; save(next); return next })
  }, [])

  const setReminderTime = useCallback((reminderTime: string) => {
    setConfig(c => { const next = { ...c, reminderTime }; save(next); return next })
  }, [])

  const sendTest = useCallback(() => {
    showNotification('⚔ Missões diárias designadas', 'Jogador, suas missões aguardam. Não falhe.')
  }, [])

  // Agenda o lembrete enquanto o app está aberto
  useEffect(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (!config.enabled || permission !== 'granted') return

    const delay = msUntil(config.reminderTime)
    timerRef.current = setTimeout(() => {
      // Só lembra se o dia ainda não foi encerrado
      if (!todayLogged) {
        showNotification('⚔ O System te chama', 'Jogador, ainda há missões pendentes hoje. Encerre o dia com honra.')
      }
    }, delay)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [config.enabled, config.reminderTime, permission, todayLogged])

  return {
    supported,
    permission,
    enabled: config.enabled,
    reminderTime: config.reminderTime,
    requestPermission,
    setEnabled,
    setReminderTime,
    sendTest,
  }
}
