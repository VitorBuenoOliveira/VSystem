import { useState, useEffect } from 'react'
import { secondsUntilReset, formatCountdown } from '../utils'

export function useCountdown(resetTime: string): string {
  const [secs, setSecs] = useState(() => secondsUntilReset(resetTime))

  useEffect(() => {
    setSecs(secondsUntilReset(resetTime))
    const id = setInterval(() => setSecs(secondsUntilReset(resetTime)), 1000)
    return () => clearInterval(id)
  }, [resetTime])

  return formatCountdown(secs)
}
