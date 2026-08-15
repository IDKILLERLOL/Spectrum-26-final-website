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

  const style: React.CSSProperties = {
    borderColor: INK,
    background: variant === "solid" ? VERMILION : MUSTARD,
    color: variant === "solid" ? AGED_PAPER : INK,
    boxShadow: pressed ? "0px 0px 0 " + INK : hoardingShadow,
    transform: pressed ? "translate(4px, 4px)" : "translate(0,0)",
  }

  const sharedProps = {
    className: `${questDisplay.className} relative inline-flex items-center justify-center border-2 uppercase tracking-widest transition-transform ${disabled ? "opacity-40" : ""} ${className}`,
    style,
    onPointerDown: () => !disabled && setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
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
