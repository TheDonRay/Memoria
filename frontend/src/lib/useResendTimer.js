// HOOK: a countdown so "Resend code" can't be spammed.
// timer.start() begins a 30s wait, timer.seconds is what's left (0 = ready).

import { useCallback, useEffect, useState } from 'react'

export default function useResendTimer(wait = 30) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  const start = useCallback(() => setSeconds(wait), [wait])

  return { seconds, start }
}
