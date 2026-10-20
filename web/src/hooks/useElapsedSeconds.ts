import { useEffect, useState } from 'react'

export function useElapsedSeconds(since: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  return Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000))
}
