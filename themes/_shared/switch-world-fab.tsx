"use client"

import Link from "next/link"
import { LayoutGrid } from "lucide-react"

/**
 * Persistent "back to World Select" button. Rendered above the Dock, offset so it
 * never overlaps the Register tap target. Purely a pitch-tool affordance — remove
 * this import (and only this) when a single theme is chosen and promoted to `/`.
 */
export function SwitchWorldFab() {
  return (
    <Link
      href="/"
      aria-label="Switch world / theme"
      className="fixed right-3 z-40 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-transform active:scale-90"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <LayoutGrid size={18} />
    </Link>
  )
}
