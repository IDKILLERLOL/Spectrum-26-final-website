"use client"

import * as React from "react"

/** Mirrors prefers-reduced-motion. Every theme MUST branch heavy motion on this. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mql.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  return reduced
}
