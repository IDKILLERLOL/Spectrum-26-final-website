import type { ComponentType } from "react"

export interface ThemeMeta {
  slug: string
  name: string
  tagline: string
  /** Exactly 4 hex colors, drives the World Select chooser card. Order: bg, primary, accent, secondary. */
  swatch: [string, string, string, string]
  /** CSS custom property name holding the display font, e.g. "--font-pixel-quest-display" */
  fontDisplay: string
  vibe: string[]
}

/**
 * Every theme is a sealed module implementing this exact surface.
 * - Read ALL copy from `content/spectrum.ts`. Never hardcode event names, dates, prices, etc.
 * - Scope all CSS under `[data-theme="<slug>"]`. Never touch global styles.
 * - Design at 390x844 first. Desktop is a widened variant, not the source of truth.
 * - Honour `prefers-reduced-motion` — ship a still-beautiful static fallback.
 * - All tap targets >= 44px. All motion GPU-composited (transform/opacity only).
 */
export interface ThemeModule {
  meta: ThemeMeta

  /** Fixed, behind everything. Purely decorative — must not intercept pointer events. */
  Background: ComponentType

  /**
   * REQUIRED. The persistent bottom registration dock — rendered once by the themed
   * layout, NOT by individual sections, so no theme can accidentally scroll it away.
   * Must contain:
   *   1. A primary Register action, min-height 56px, highest-contrast element on screen.
   *   2. Secondary theme-native navigation (may reuse the theme's nav gimmick), demoted
   *      in visual weight relative to Register.
   * See docs/registration-contract.md for the full non-negotiable spec.
   */
  Dock: ComponentType

  /** Title, tagline, countdown, Register visible above the fold (in addition to Dock). */
  Hero: ComponentType

  /** The 4 events. Must support opening a per-event detail (rules/prizes) and a
   *  per-event Register action that pre-selects that event in the registration form. */
  Events: ComponentType

  /** 5-step day timeline + venue. */
  Schedule: ComponentType

  About: ComponentType

  Sponsors: ComponentType

  /** The fake registration form. Exactly 5 fields (see RegistrationFormValues).
   *  Accepts an optional pre-selected eventId via useRegistration() context. */
  Register: ComponentType

  Contact: ComponentType

  /** LIVE animated miniature for the World Select chooser card. Must render meaningfully
   *  at ~340x220 without importing any of this theme's page-only assets/fonts twice. */
  Preview: ComponentType
}
