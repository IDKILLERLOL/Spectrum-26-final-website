import type { ThemeMeta, ThemeModule } from "./types"

/**
 * Static metadata for all themes — used by World Select without loading any
 * theme's actual component code. Order here is display order in the chooser.
 */
export const themeMetas: ThemeMeta[] = [
  {
    slug: "pixel-quest",
    name: "Pixel Quest",
    tagline: "16-bit floating-castle RPG",
    swatch: ["#F5EFE1", "#242150", "#EC4B8C", "#6FBF5B"],
    fontDisplay: "--font-pixel-quest-display",
    vibe: ["16-bit", "quest", "cozy"],
  },
  {
    slug: "side-scroll",
    name: "World 1-1",
    tagline: "True 8-bit NES side-scroller",
    swatch: ["#5C94FC", "#C84C0C", "#FCBC3C", "#00A800"],
    fontDisplay: "--font-side-scroll-display",
    vibe: ["8-bit", "NES", "side-scroll"],
  },
  {
    slug: "arcade-92",
    name: "Arcade Cabinet '92",
    tagline: "Coin-op CRT cabinet",
    swatch: ["#0A0A0F", "#FF2E88", "#25E5E5", "#FFB000"],
    fontDisplay: "--font-arcade-92-display",
    vibe: ["CRT", "neon", "coin-op"],
  },
  {
    slug: "holo-deck",
    name: "Holo Deck",
    tagline: "Holographic TCG cards",
    swatch: ["#0B1026", "#C9A227", "#6FBF5B", "#EC4B8C"],
    fontDisplay: "--font-holo-deck-display",
    vibe: ["foil", "cards", "gyro"],
  },
  {
    slug: "locker",
    name: "Locker Room",
    tagline: "Spray-paint & torn notes",
    swatch: ["#4A2472", "#F2B705", "#1A1A1A", "#F5F0E1"],
    fontDisplay: "--font-locker-display",
    vibe: ["gritty", "physical", "school"],
  },
  {
    slug: "terminal",
    name: "Root Access",
    tagline: "Hacker terminal session",
    swatch: ["#050705", "#4AF626", "#FFB000", "#FFFFFF"],
    fontDisplay: "--font-terminal-display",
    vibe: ["terminal", "mono", "boot"],
  },
  {
    slug: "ukiyo",
    name: "Neo-Tokyo Ukiyo-e",
    tagline: "Woodblock print meets Shibuya night",
    swatch: ["#F2EDE4", "#1C1A17", "#D8443C", "#2A4B7C"],
    fontDisplay: "--font-ukiyo-display",
    vibe: ["ink", "washi", "vermilion"],
  },
  {
    slug: "desi-retro",
    name: "Desi Retro '90s",
    tagline: "Truck art & cinema hoarding",
    swatch: ["#E8A13A", "#12595B", "#C7382F", "#D9C9A3"],
    fontDisplay: "--font-desi-retro-display",
    vibe: ["truck-art", "hoarding", "doordarshan"],
  },
  {
    slug: "outrun",
    name: "Outrun Synthwave",
    tagline: "Chrome grid horizon",
    swatch: ["#08050F", "#FF3D81", "#7B2FF7", "#22D3EE"],
    fontDisplay: "--font-outrun-display",
    vibe: ["synthwave", "chrome", "vhs"],
  },
  {
    slug: "riso-zine",
    name: "Riso Zine",
    tagline: "Brutalist overprint editorial",
    swatch: ["#FAF7F2", "#111111", "#FF48B0", "#0050FF"],
    fontDisplay: "--font-riso-zine-display",
    vibe: ["brutalist", "riso", "editorial"],
  },
  {
    slug: "blueprint",
    name: "Blueprint Lab",
    tagline: "Cyanotype drafting sheets",
    swatch: ["#0B3D6B", "#FFFFFF", "#5BE1FF", "#FFB000"],
    fontDisplay: "--font-blueprint-display",
    vibe: ["cyanotype", "drafting", "technical"],
  },
]

export type ThemeSlug = (typeof themeMetas)[number]["slug"]

export const themeSlugs = themeMetas.map((t) => t.slug) as ThemeSlug[]

export function getThemeMeta(slug: string): ThemeMeta | undefined {
  return themeMetas.find((t) => t.slug === slug)
}

/**
 * Lazy loader map — one dynamic import() per theme so visiting one theme never
 * pulls in another theme's fonts or components. Each theme folder must default-export
 * a ThemeModule from its index.tsx.
 */
const loaders: Record<ThemeSlug, () => Promise<{ default: ThemeModule }>> = {
  "pixel-quest": () => import("./pixel-quest"),
  "side-scroll": () => import("./side-scroll"),
  "arcade-92": () => import("./arcade-92"),
  "holo-deck": () => import("./holo-deck"),
  locker: () => import("./locker"),
  terminal: () => import("./terminal"),
  ukiyo: () => import("./ukiyo"),
  "desi-retro": () => import("./desi-retro"),
  outrun: () => import("./outrun"),
  "riso-zine": () => import("./riso-zine"),
  blueprint: () => import("./blueprint"),
}

export function loadTheme(slug: string): Promise<{ default: ThemeModule }> | undefined {
  const loader = loaders[slug as ThemeSlug]
  return loader?.()
}
