// Desi Retro '90s — truck art & cinema hoarding visual system for the flagship app.
// Exact palette/motifs match the original themes/desi-retro reference (now removed —
// this is the single, canonical, independent copy).

import type { CSSProperties } from "react"

export const MUSTARD = "#E8A13A"
export const JUTE = "#D9C9A3"
export const TEAL = "#12595B"
export const VERMILION = "#C7382F"
export const MARIGOLD = "#F4A300"
export const INK = "#1A1A1A"
export const AGED_PAPER = "#F4EBD9"

export const hoardingShadow = `4px 4px 0px ${INK}`
export const softHoardingShadow = `2px 2px 0px ${INK}`

/** Standard bordered-panel treatment: hard 4px ink border, aged-paper surface, offset shadow. */
export const cardStyle: CSSProperties = {
  borderColor: INK,
  background: AGED_PAPER,
  boxShadow: hoardingShadow,
}

// ---- Back-compat aliases -------------------------------------------------
// Every flagship route was built against these role-based names. Aliasing keeps
// all existing files compiling/rendering correctly in the new palette immediately;
// individual files are being reskinned with real desi-retro motifs (garlands,
// awnings, stamps, chalkboard) on top of this, not just a colour swap.
export const CREAM = AGED_PAPER
export const NAVY = INK
export const PINK = VERMILION
export const GREEN = TEAL
export const SKY = MUSTARD
export const questShadow = hoardingShadow
export const questShadowLg = `5px 5px 0px ${INK}`
