import { useSyncExternalStore } from 'react'

// ── Modo Admin ───────────────────────────────────────────────────────────────
// Protege ações de gestão (criar/excluir missões, backup, reset, testes) atrás
// de um PIN. O desbloqueio é por sessão (reseta ao fechar/recarregar o app).

const PIN_KEY = 'vsystem-admin-pin'
const DEFAULT_PIN = '1234'

let _unlocked = false
const _listeners = new Set<() => void>()
function _emit() { _listeners.forEach(l => l()) }

export function getAdminPin(): string {
  try { return localStorage.getItem(PIN_KEY) ?? DEFAULT_PIN } catch { return DEFAULT_PIN }
}

/** Acesso síncrono (fora de componentes). */
export function isAdminUnlocked(): boolean { return _unlocked }

export function useAdmin() {
  const unlocked = useSyncExternalStore(
    cb => { _listeners.add(cb); return () => { _listeners.delete(cb) } },
    () => _unlocked,
  )

  const unlock = (pin: string): boolean => {
    if (pin === getAdminPin()) { _unlocked = true; _emit(); return true }
    return false
  }
  const lock = () => { _unlocked = false; _emit() }
  const changePin = (newPin: string) => {
    try { localStorage.setItem(PIN_KEY, newPin) } catch { /* ignore */ }
  }

  return { unlocked, unlock, lock, changePin, pinIsDefault: getAdminPin() === DEFAULT_PIN }
}
