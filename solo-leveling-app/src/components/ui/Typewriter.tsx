import { useEffect, useState, useRef } from 'react'
import { useSounds } from '../../hooks/useSounds'

interface Props {
  text: string
  speed?: number        // ms por caractere
  delay?: number        // atraso antes de começar (ms)
  sound?: boolean       // toca clique suave a cada caractere
  cursor?: boolean      // mostra cursor piscando enquanto digita
  style?: React.CSSProperties
  className?: string
  onDone?: () => void
}

/** Efeito de máquina de escrever estilo "mensagem do Sistema" (Solo Leveling). */
export default function Typewriter({
  text, speed = 32, delay = 0, sound = false, cursor = true, style, className, onDone,
}: Props) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const sounds = useSounds()
  const soundRef = useRef(sounds.playType)
  soundRef.current = sounds.playType

  useEffect(() => {
    setShown('')
    setDone(false)
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const startTimer = setTimeout(() => {
      const tick = () => {
        i++
        setShown(text.slice(0, i))
        if (sound && soundRef.current && text[i - 1] !== ' ') soundRef.current()
        if (i < text.length) {
          timer = setTimeout(tick, speed)
        } else {
          setDone(true)
          onDone?.()
        }
      }
      tick()
    }, delay)
    return () => { clearTimeout(startTimer); clearTimeout(timer) }
  }, [text, speed, delay]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className={className} style={style}>
      {shown}
      {cursor && !done && (
        <span style={{
          display: 'inline-block', width: '0.6em',
          animation: 'pulse-neon 0.8s steps(2) infinite',
          opacity: 0.8,
        }}>▌</span>
      )}
    </span>
  )
}
