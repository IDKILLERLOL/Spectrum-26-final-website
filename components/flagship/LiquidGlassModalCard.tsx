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
      className={`relative w-full max-w-lg sm:max-w-xl p-6 border-4 max-h-[85vh] flex flex-col cursor-default overflow-hidden rounded-sm ${className}`}
      style={{
        borderColor: INK,
        boxShadow: `8px 8px 0px ${INK}, inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.9), inset 0 0 0 1px rgba(255, 255, 255, 0.4), inset 0 -6px 16px 0 rgba(0, 0, 0, 0.05)`,
        background: "linear-gradient(140deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.50) 45%, rgba(255, 255, 255, 0.68) 100%)",
        backdropFilter: "blur(20px) saturate(180%) contrast(102%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%) contrast(102%)",
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {/* Specular glass glare reflection sweep */}
      <div
        className="pointer-events-none absolute -top-28 -left-28 h-56 w-[120%] rotate-12 bg-gradient-to-b from-white/40 via-white/10 to-transparent blur-md"
        aria-hidden="true"
      />
      {accentColor && (
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-1.5 opacity-90 shadow-sm"
          style={{ background: accentColor }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}
