"use client"

import * as React from "react"
import { applyLiquidGlass, LiquidGlassOptions } from "@/lib/liquid-glass"
import { INK } from "./tokens"

interface LiquidGlassModalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  options?: LiquidGlassOptions
  accentColor?: string
}

/**
 * LiquidGlassModalCard — Wraps modal content in Apple-style real refraction liquid glass.
 * Based on deepika-builds/liquid-glass (SVG displacement map refraction with frosted fallback).
 * 
 * To remove or disable: simply replace <LiquidGlassModalCard> with a standard <div>.
 */
export function LiquidGlassModalCard({
  children,
  className = "",
  options,
  accentColor,
  style,
  ...props
}: LiquidGlassModalCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [glarePos, setGlarePos] = React.useState({ x: "30%", y: "20%" })

  React.useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const instance = applyLiquidGlass(el, {
      scale: -112,
      chroma: 6,
      border: 0.07,
      mapBlur: 14,
      blur: 3,
      saturate: 1.6,
      radius: 28,
      ...options,
    })

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setGlarePos({ x: `${x}%`, y: `${y}%` })
    }

    el.addEventListener("pointermove", handlePointerMove)

    return () => {
      el.removeEventListener("pointermove", handlePointerMove)
      instance.destroy()
    }
  }, [options])

  return (
    <div
      ref={cardRef}
      className={`relative w-full max-w-lg sm:max-w-xl p-6 md:p-8 max-h-[85vh] flex flex-col cursor-default overflow-hidden rounded-[28px] ${className}`}
      style={{
        borderRadius: "28px",
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0.22) 50%, rgba(255, 255, 255, 0.38) 100%)",
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.8), inset 0 -8px 20px rgba(255, 255, 255, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {/* Interactive liquid glass glare reflection */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{
          background: `radial-gradient(280px circle at ${glarePos.x} ${glarePos.y}, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.04) 50%, transparent 80%)`,
        }}
        aria-hidden="true"
      />

      {/* Ambient top specular glow */}
      {accentColor && (
        <div
          className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 rounded-full blur-2xl opacity-60"
          style={{ background: accentColor }}
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  )
}
