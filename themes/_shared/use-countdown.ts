"use client"

import * as React from "react"
import { EVENT_DATE_ISO } from "@/content/spectrum"

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function computeCountdown(target: number): Countdown {
  const diff = target - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  }
}

/** Countdown to EVENT_DATE_ISO. Stable across SSR (renders zeros until mounted). */
export function useCountdown(): Countdown {
  const target = React.useMemo(() => new Date(EVENT_DATE_ISO).getTime(), [])
  const [value, setValue] = React.useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    setValue(computeCountdown(target))
    const id = setInterval(() => setValue(computeCountdown(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return mounted ? value : { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false }
}

export function pad2(n: number) {
  return n.toString().padStart(2, "0")
}
