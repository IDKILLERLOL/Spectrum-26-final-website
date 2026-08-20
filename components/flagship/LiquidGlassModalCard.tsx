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

  React.useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const instance = applyLiquidGlass(el, {
      scale: -90,
      chroma: 5,
      border: 0.06,
      mapBlur: 12,
      blur: 4,
      saturate: 1.4,
      ...options,
    })

    return () => {
      instance.destroy()
    }
  }, [options])

  return (
    <div
      ref={cardRef}
      className={`relative w-full max-w-lg sm:max-w-xl p-6 border-4 max-h-[85vh] flex flex-col cursor-default overflow-hidden rounded-md shadow-2xl ${className}`}
      style={{
        borderColor: INK,
        boxShadow: `8px 8px 0px ${INK}, inset 0 1px 2px rgba(255, 255, 255, 0.95), inset 0 -1px 2px rgba(0, 0, 0, 0.1)`,
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.78) 50%, rgba(255, 255, 255, 0.88) 100%)",
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {/* Specular glass highlight reflection sweep */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-48 w-96 rotate-12 rounded-full bg-gradient-to-r from-white/60 via-white/20 to-transparent blur-xl"
        aria-hidden="true"
      />
      {accentColor && (
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-1.5 opacity-80"
          style={{ background: accentColor }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}
