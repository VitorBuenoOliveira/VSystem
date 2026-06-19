import { useState, useRef, useEffect } from 'react'
import SLFrame from './ui/SLFrame'
import { PSALMS, getVerseOfDay } from '../data/verses'
import { todayStr } from '../utils'
import type { Psalm } from '../data/verses'

const KEY = 'vsystem-why'

interface WhyData { why: string; photos: string[] }

function load(): WhyData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { why: '', photos: [], ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { why: '', photos: [] }
}
function save(d: WhyData) {
  try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* ignore (cota) */ }
}

// Redimensiona a foto p/ caber no localStorage (máx 600px, JPEG 0.8)
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 600
        let { width, height } = img
        if (width > max || height > max) {
          if (width >= height) { height = Math.round(height * max / width); width = max }
          else { width = Math.round(width * max / height); height = max }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function MeuPorque() {
  const [data, setData] = useState<WhyData>(load)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.why)
  const [reading, setReading] = useState<Psalm | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const verse = getVerseOfDay(todayStr())

  const update = (d: WhyData) => { setData(d); save(d) }

  const addPhoto = async (file: File) => {
    if (data.photos.length >= 3) return
    try {
      const dataUrl = await resizeImage(file)
      update({ ...data, photos: [...data.photos, dataUrl] })
    } catch { /* ignore */ }
  }

  const removePhoto = (i: number) => update({ ...data, photos: data.photos.filter((_, idx) => idx !== i) })

  const saveWhy = () => { update({ ...data, why: draft.trim() }); setEditing(false) }

  return (
    <SLFrame glowColor="#e05080" style={{ padding: '14px 16px' }}>
      {reading && <PsalmReader psalm={reading} onClose={() => setReading(null)} />}

      <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: 12 }}>
        ❤️ POR QUE EU LUTO
      </div>

      {/* Fotos */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {data.photos.map((src, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img src={src} alt="" style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(224,80,128,0.4)' }} />
            <button
              onClick={() => removePhoto(i)}
              style={{
                position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(2,8,28,0.95)', border: '1px solid rgba(220,80,80,0.6)', color: '#e06060',
                fontSize: 11, cursor: 'pointer', lineHeight: 1,
              }}
            >×</button>
          </div>
        ))}
        {data.photos.length < 3 && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: 88, height: 88, borderRadius: 8,
              background: 'rgba(4,16,52,0.5)', border: '1px dashed rgba(224,80,128,0.4)',
              color: 'rgba(224,80,128,0.7)', fontSize: 22, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}
          >
            ＋<span style={{ fontSize: 8, fontFamily: 'Rajdhani', letterSpacing: '0.1em' }}>FOTO</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) addPhoto(f); e.target.value = '' }} />
      </div>

      {/* Meu motivo */}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Escreva por que você está lutando… (sua família, ela, seus sonhos)"
            rows={3}
            style={{
              width: '100%', padding: '8px 10px', resize: 'vertical',
              background: 'rgba(4,16,52,0.9)', border: '1px solid rgba(224,80,128,0.4)',
              color: 'var(--text-primary)', fontFamily: 'Rajdhani', fontSize: 13, outline: 'none',
            }}
          />
          <button onClick={saveWhy} style={{
            padding: '8px 0', background: 'rgba(40,8,20,0.6)', border: '1px solid rgba(224,80,128,0.6)',
            color: '#ff8eb0', fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
          }}>SALVAR</button>
        </div>
      ) : (
        <div
          onClick={() => { setDraft(data.why); setEditing(true) }}
          style={{
            cursor: 'pointer', padding: '10px 12px', minHeight: 40,
            background: 'rgba(40,8,20,0.25)', border: '1px solid rgba(224,80,128,0.2)',
            borderLeft: '2px solid rgba(224,80,128,0.6)',
            fontFamily: 'Rajdhani', fontSize: 14, color: data.why ? 'var(--text-secondary)' : 'var(--text-muted)',
            lineHeight: 1.5, fontStyle: data.why ? 'italic' : 'normal',
          }}
        >
          {data.why || 'Toque para escrever seu porquê ✎'}
        </div>
      )}

      {/* Versículo */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(40,100,200,0.15)', fontFamily: 'Rajdhani', fontSize: 12, color: 'rgba(230,220,180,0.85)', lineHeight: 1.5 }}>
        ✝️ “{verse.text}” <span style={{ color: 'rgba(240,208,96,0.8)' }}>({verse.ref})</span>
      </div>

      {/* Salmos */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: 6 }}>
          📖 Salmos para meditar
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PSALMS.map(p => (
            <button key={p.id} onClick={() => setReading(p)} style={{
              padding: '6px 12px', background: 'rgba(4,16,52,0.6)', border: '1px solid rgba(120,160,220,0.3)',
              color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600, cursor: 'pointer', borderRadius: 4,
            }}>
              {p.title.split('—')[0].trim()}
            </button>
          ))}
        </div>
      </div>
    </SLFrame>
  )
}

// ── Leitor de Salmo com cronômetro de leitura ──────────────────────────────
function PsalmReader({ psalm, onClose }: { psalm: Psalm; onClose: () => void }) {
  const [sec, setSec] = useState(0)

  // Cronômetro crescente simples
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setSec(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(2,4,12,0.97)', backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column', padding: '20px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, color: '#f0d060', letterSpacing: '0.05em' }}>{psalm.title}</span>
        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 13, color: 'var(--text-muted)' }}>⏱ {mm}:{ss}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
        {psalm.text.map((line, i) => (
          <p key={i} style={{ margin: 0, fontFamily: 'Rajdhani', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <span style={{ color: 'rgba(240,208,96,0.5)', fontSize: 11, marginRight: 8 }}>{i + 1}</span>{line}
          </p>
        ))}
      </div>
      <button onClick={onClose} style={{
        marginTop: 14, padding: '12px 0', background: 'rgba(40,30,6,0.5)', border: '1px solid rgba(240,208,96,0.5)',
        color: '#f0d060', fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer',
      }}>✓ CONCLUIR LEITURA</button>
    </div>
  )
}
