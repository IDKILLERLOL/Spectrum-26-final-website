"use client"

import * as React from "react"
import { useReducedMotion } from "./use-reduced-motion"

export interface TiltState {
  /** -1..1 on each axis. Device gyro when available (with permission), else pointer-relative. */
  x: number
  y: number
  supported: boolean
  requestPermission: () => Promise<void>
}

/** Used by gyro-driven themes (holo-deck, outrun). Falls back to pointermove tilt. */
export function useTilt(ref: React.RefObject<HTMLElement | null>): TiltState {
  const reduced = useReducedMotion()
  const [x, setX] = React.useState(0)
  const [y, setY] = React.useState(0)
  const [supported, setSupported] = React.useState(false)

  const requestPermission = React.useCallback(async () => {
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">
    }
    if (DOE?.requestPermission) {
      try {
        const result = await DOE.requestPermission()
        setSupported(result === "granted")
      } catch {
        setSupported(false)
      }
    } else {
      setSupported(true)
    }
  }, [])

  React.useEffect(() => {
    if (reduced) return

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      setX(Math.max(-1, Math.min(1, e.gamma / 30)))
      setY(Math.max(-1, Math.min(1, e.beta / 30)))
    }

    const el = ref.current
    const onPointerMove = (e: PointerEvent) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      setX(Math.max(-1, Math.min(1, (px - 0.5) * 2)))
      setY(Math.max(-1, Math.min(1, (py - 0.5) * 2)))
    }

    if (supported) {
      window.addEventListener("deviceorientation", onOrientation)
      return () => window.removeEventListener("deviceorientation", onOrientation)
    }
    el?.addEventListener("pointermove", onPointerMove)
    return () => el?.removeEventListener("pointermove", onPointerMove)
  }, [ref, supported, reduced])

  return { x: reduced ? 0 : x, y: reduced ? 0 : y, supported, requestPermission }
}
