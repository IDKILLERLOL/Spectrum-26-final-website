"use client"

import * as React from "react"
import { useReducedMotion } from "../_shared/use-reduced-motion"

interface TypewriterResult {
  output: string
  done: boolean
  skip: () => void
}

/** Types `text` out at `cps` chars/sec. Reduced motion renders the full text instantly. */
export function useTypewriter(text: string, opts?: { cps?: number; startDelay?: number }): TypewriterResult {
  const reduced = useReducedMotion()
  const cps = opts?.cps ?? 60
  const startDelay = opts?.startDelay ?? 0
  const [count, setCount] = React.useState(reduced ? text.length : 0)
  const [done, setDone] = React.useState(reduced)

  React.useEffect(() => {
    if (reduced) {
      setCount(text.length)
      setDone(true)
      return
    }
    setCount(0)
    setDone(false)
    let raf = 0
    let cancelled = false
    const msPerChar = 1000 / cps
    const timeout = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        if (cancelled) return
        const chars = Math.min(text.length, Math.floor((now - start) / msPerChar))
        setCount(chars)
        if (chars < text.length) raf = requestAnimationFrame(tick)
        else setDone(true)
      }
      raf = requestAnimationFrame(tick)
    }, startDelay)
    return () => {
      cancelled = true
      clearTimeout(timeout)
      cancelAnimationFrame(raf)
    }
  }, [text, cps, startDelay, reduced])

  const skip = React.useCallback(() => {
    setCount(text.length)
    setDone(true)
  }, [text])

  return { output: text.slice(0, count), done, skip }
}

/** Types `text` out once its element scrolls into view. Fires once, honours reduced motion. */
export function useRevealTypewriter<T extends HTMLElement = HTMLElement>(text: string, cps = 70) {
  const ref = React.useRef<T | null>(null)
  const [visible, setVisible] = React.useState(false)
  const reduced = useReducedMotion()

  React.useEffect(() => {
    if (reduced || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const tw = useTypewriter(visible || reduced ? text : "", { cps })
  return { ref, ...tw }
}
