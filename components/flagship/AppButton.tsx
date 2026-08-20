"use client"

import * as React from "react"
import Link from "next/link"
import { INK, VERMILION, MUSTARD, AGED_PAPER, hoardingShadow } from "./tokens"
import { questDisplay } from "./fonts"

/**
 * Recreates desi-retro's DesiButton press mechanic: on press, the shadow collapses
 * to flat (0px) while the element translates by the full 4px shadow delta, so the
 * button visually stamps down flush against the page — like a hoarding panel
 * pressed into its own mount.
 */
interface AppButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: "solid" | "outline"
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
}

export function AppButton({
  children,
  onClick,
  href,
  variant = "solid",
  className = "",
  type = "button",
  disabled = false,
}: AppButtonProps) {
  const [pressed, setPressed] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  // Invert colors on hover
  let bg = variant === "solid" ? VERMILION : MUSTARD
  let text = variant === "solid" ? AGED_PAPER : INK

  if (hovered && !disabled) {
    bg = variant === "solid" ? AGED_PAPER : INK
    text = variant === "solid" ? VERMILION : MUSTARD
  }

  let transform = "translate(0,0)"
  let shadow = hoardingShadow

  if (pressed && !disabled) {
    transform = "translate(3px, 3px)"
    shadow = `0px 0px 0px ${INK}`
  } else if (hovered && !disabled) {
    transform = "translate(-2px, -2px)"
    shadow = `5px 5px 0px ${INK}`
  }

  const style: React.CSSProperties = {
    borderColor: INK,
    background: bg,
    color: text,
    boxShadow: shadow,
    transform,
  }

  const sharedProps = {
    className: `${questDisplay.className} relative inline-flex items-center justify-center border-2 uppercase tracking-widest transition-all duration-150 ease-out cursor-pointer ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`,
    style,
    onMouseEnter: () => !disabled && setHovered(true),
    onMouseLeave: () => {
      setHovered(false)
      setPressed(false)
    },
    onPointerDown: () => !disabled && setPressed(true),
    onPointerUp: () => setPressed(false),
  }

  if (href && !disabled) {
    return (
      <Link href={href} onClick={onClick} {...sharedProps}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} {...sharedProps}>
      {children}
    </button>
  )
}
