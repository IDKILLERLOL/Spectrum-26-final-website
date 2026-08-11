"use client"

import * as React from "react"
import type { ThemeModule } from "../types"
import { useReducedMotion } from "../_shared/use-reduced-motion"
import { TerminalStyles } from "./TermUI"
import { BLACK, GREEN } from "./palette"

/** Fixed CRT backdrop: scanlines, a soft phosphor glow, and a subtle vignette for
 *  screen curvature. Purely decorative — never intercepts pointer events. */
const Background: ThemeModule["Background"] = () => {
  const reduced = useReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: BLACK }}>
      <TerminalStyles />

      {/* phosphor glow, top-center */}
      <div
        className={reduced ? "" : "term-glow"}
        style={{
          position: "absolute",
          left: "50%",
          top: "-10%",
          width: "140%",
          height: "60%",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse at center, ${GREEN}26 0%, transparent 65%)`,
          opacity: 0.32,
        }}
      />

      {/* scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)`,
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />
      <div
        className={reduced ? "" : "term-flicker"}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, ${GREEN}0d 0px, transparent 1px, transparent 3px)`,
        }}
      />

      {/* vignette / screen curvature */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 18vw rgba(0,0,0,0.65)" }} />
    </div>
  )
}

export default Background
