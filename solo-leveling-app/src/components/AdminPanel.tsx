import { useState } from 'react'
import SLFrame from './ui/SLFrame'
import { useAdmin } from '../hooks/useAdmin'

export default function AdminPanel() {
  const { unlocked, unlock, lock, changePin, pinIsDefault } = useAdmin()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [changing, setChanging] = useState(false)
  const [newPin, setNewPin] = useState('')

  const handleUnlock = () => {
    if (unlock(pin)) { setPin(''); setError(false) }
    else { setError(true) }
  }

  const handleChange = () => {
    if (newPin.trim().length >= 4) {
      changePin(newPin.trim())
      setNewPin(''); setChanging(false)
    }
  }

  const color = unlocked ? '#40e080' : '#e0a030'

  return (
    <SLFrame glowColor={color} style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: unlocked ? 8 : 10 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
          {unlocked ? '🔓 ACESSO ADMIN' : '🔒 ACESSO ADMIN'}
        </div>
        <span style={{
          fontFamily: 'Rajdhani', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          color, border: `1px solid ${color}66`, padding: '1px 8px',
        }}>
          {unlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
        </span>
      </div>

      {!unlocked ? (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="PIN"
              style={{
                flex: 1, padding: '8px 12px',
                background: 'rgba(4,16,52,0.9)',
                border: `1px solid ${error ? 'var(--danger)' : 'rgba(224,160,48,0.4)'}`,
                color: 'var(--text-primary)',
                fontFamily: "'Share Tech Mono', monospace", fontSize: 15, letterSpacing: '0.3em',
                outline: 'none',
              }}
            />
            <button
              onClick={handleUnlock}
              style={{
                padding: '8px 18px',
                background: 'rgba(40,28,4,0.6)',
                border: '1px solid rgba(224,160,48,0.6)',
                color: '#e0a030',
                fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              DESBLOQUEAR
            </button>
          </div>
          {error && (
            <div style={{ fontFamily: 'Rajdhani', fontSize: 10, color: 'var(--danger)', marginTop: 6 }}>
              PIN incorreto.
            </div>
          )}
          {pinIsDefault && (
            <div style={{ fontFamily: 'Rajdhani', fontSize: 9, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.04em' }}>
              PIN padrão: <span style={{ color: '#e0a030' }}>1234</span> — desbloqueie e troque-o.
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.03em' }}>
            Ações de gestão (criar/excluir missões, backup, reset, testes) liberadas.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={lock}
              style={{
                flex: 1, padding: '8px 0',
                background: 'rgba(6,18,60,0.9)',
                border: '1px solid rgba(40,100,200,0.4)',
                color: 'var(--text-secondary)',
                fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              🔒 BLOQUEAR
            </button>
            <button
              onClick={() => setChanging(c => !c)}
              style={{
                flex: 1, padding: '8px 0',
                background: 'rgba(6,18,60,0.9)',
                border: '1px solid rgba(180,120,255,0.4)',
                color: 'rgba(200,160,255,0.9)',
                fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              TROCAR PIN
            </button>
          </div>
          {changing && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChange()}
                placeholder="Novo PIN (mín. 4)"
                style={{
                  flex: 1, padding: '8px 12px',
                  background: 'rgba(4,16,52,0.9)',
                  border: '1px solid rgba(180,120,255,0.4)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Share Tech Mono', monospace", fontSize: 14, letterSpacing: '0.2em',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleChange}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(4,16,52,0.9)',
                  border: '1px solid var(--success)',
                  color: 'var(--success)',
                  fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>
          )}
        </>
      )}
    </SLFrame>
  )
}
