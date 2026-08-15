"use client"

import * as React from "react"
import { termMono } from "./fonts"
import { BLACK, GREEN, GREEN_DIM, AMBER } from "./palette"

/** Global keyframes for the theme — injected once (Background always mounts). Class names are
 *  prefixed `term-` so they can't collide with any other theme's injected styles. */
export function TerminalStyles() {
  return (
    <style>{`
      @keyframes term-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
      @keyframes term-glow-pulse { 0%, 100% { opacity: 0.28 } 50% { opacity: 0.5 } }
      @keyframes term-fade-in { from { opacity: 0; transform: translateY(2px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes term-flicker { 0%, 100% { opacity: 0.96 } 50% { opacity: 1 } }
      @keyframes term-bar-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
      .term-cursor { animation: term-blink 1s steps(1) infinite; }
      .term-fade-in { animation: term-fade-in 0.4s ease-out both; }
      .term-glow { animation: term-glow-pulse 4s ease-in-out infinite; }
      .term-flicker { animation: term-flicker 7s ease-in-out infinite; }
      .term-bar-fill { transform-origin: left; animation: term-bar-fill 1.1s ease-out both; }
      @media (prefers-reduced-motion: reduce) {
        .term-cursor, .term-glow, .term-flicker, .term-bar-fill { animation: none !important; opacity: 1; transform: none !important; }
      }
    `}</style>
  )
}

export function Cursor({ className = "", color = GREEN }: { className?: string; color?: string }) {
  return (
    <span aria-hidden className={`term-cursor inline-block ${className}`} style={{ color }}>
      █
    </span>
  )
}

export function PromptRow({
  children,
  color = GREEN,
  className = "",
}: {
  children: React.ReactNode
  color?: string
  className?: string
}) {
  return (
    <p className={`${termMono.className} flex items-baseline gap-2 text-xs leading-relaxed ${className}`} style={{ color }}>
      <span style={{ color: AMBER }}>$</span>
      <span className="break-words">{children}</span>
    </p>
  )
}

export function SectionHeading({
  command,
  className = "",
}: {
  command: string
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={termMono.className} style={{ color: AMBER }}>
        $
      </span>
      <h2 className={`${termMono.className} text-lg font-bold tracking-tight`} style={{ color: GREEN }}>
        {command}
      </h2>
      <Cursor className="text-sm" />
    </div>
  )
}

export function TermPanel({
  label,
  tone = GREEN,
  className = "",
  children,
}: {
  label?: string
  tone?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative border ${className}`}
      style={{ borderColor: `${tone}4d`, background: "rgba(74, 246, 38, 0.035)" }}
    >
      {label && (
        <span
          className={`${termMono.className} absolute -top-[0.6em] left-3 px-1.5 text-[10px] uppercase tracking-wide`}
          style={{ background: BLACK, color: tone }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

export function TermButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: GREEN, color: BLACK, borderColor: GREEN },
    secondary: { background: "transparent", color: GREEN, borderColor: GREEN },
    ghost: { background: "transparent", color: AMBER, borderColor: `${AMBER}66` },
  }
  return (
    <button
      type="button"
      className={`${termMono.className} border font-medium uppercase tracking-wide transition-transform active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 ${className}`}
      style={styles[variant]}
      {...props}
    >
      {children}
    </button>
  )
}

export function DifficultyBar({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <span className={`${termMono.className} text-[11px] tabular-nums`} style={{ color: GREEN }} aria-label={`difficulty ${level} of ${max}`}>
      [{"█".repeat(level)}
      {"░".repeat(Math.max(0, max - level))}]
    </span>
  )
}

export function TermField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={`${termMono.className} flex flex-col gap-1.5 border-b px-1 pb-2`} style={{ borderColor: GREEN_DIM }}>
      <span className="text-[10px] uppercase tracking-wide" style={{ color: GREEN }}>
        {label}
      </span>
      {children}
    </label>
  )
}
