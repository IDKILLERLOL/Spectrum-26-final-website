"use client"

/**
 * liquid-glass.ts — Apple-style liquid glass refraction effect from deepika-builds/liquid-glass
 * Provides real GPU-accelerated SVG displacement refraction at the edges with frosted fallback.
 */

const SVG_NS = "http://www.w3.org/2000/svg"
let uid = 0
let svgDefs: SVGDefsElement | null = null

export interface LiquidGlassOptions {
  scale?: number       // Displacement strength; default: -80
  chroma?: number      // Prism fringe stagger; default: 4
  border?: number      // Neutral interior inset fraction; default: 0.05
  mapBlur?: number     // Edge curvature softness (px); default: 10
  blur?: number        // Interior backdrop blur (px); default: 4
  saturate?: number    // Saturation boost; default: 1.3
  radius?: number | null // Corner radius override (px); default: null (reads border-radius)
  fallbackBlur?: number // Fallback blur (px); default: 16
}

export interface LiquidGlassInstance {
  supported: boolean
  refresh: () => void
  destroy: () => void
}

function checkSupport(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false
  const ua = navigator.userAgent
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)
  const isFirefox = /Firefox/.test(ua)
  if (isSafari || isFirefox) return false
  return true
}

function ensureDefs(): SVGDefsElement {
  if (svgDefs && document.body.contains(svgDefs)) return svgDefs
  const svg = document.createElementNS(SVG_NS, "svg")
  svg.setAttribute("width", "0")
  svg.setAttribute("height", "0")
  svg.setAttribute("aria-hidden", "true")
  svg.style.position = "absolute"
  svgDefs = document.createElementNS(SVG_NS, "defs")
  svg.appendChild(svgDefs)
  document.body.appendChild(svg)
  return svgDefs
}

function makeMap(w: number, h: number, radius: number, border: number, mapBlur: number): string {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  const gx = ctx.createLinearGradient(0, 0, w, 0)
  gx.addColorStop(0, "rgb(0,0,0)")
  gx.addColorStop(1, "rgb(255,0,0)")
  ctx.fillStyle = gx
  ctx.fillRect(0, 0, w, h)

  const gy = ctx.createLinearGradient(0, 0, 0, h)
  gy.addColorStop(0, "rgb(0,0,0)")
  gy.addColorStop(1, "rgb(0,0,255)")
  ctx.globalCompositeOperation = "difference"
  ctx.fillStyle = gy
  ctx.fillRect(0, 0, w, h)

  ctx.globalCompositeOperation = "source-over"
  const inset = border * Math.min(w, h)
  ctx.filter = `blur(${mapBlur}px)`
  ctx.fillStyle = "rgba(128,128,128,0.93)"
  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, Math.max(radius - inset, 2))
  } else {
    ctx.rect(inset, inset, w - inset * 2, h - inset * 2)
  }
  ctx.fill()
  ctx.filter = "none"
  return canvas.toDataURL()
}

function buildFilter(id: string, scales: number[]) {
  const filter = document.createElementNS(SVG_NS, "filter")
  filter.setAttribute("id", id)
  filter.setAttribute("x", "0")
  filter.setAttribute("y", "0")
  filter.setAttribute("width", "100%")
  filter.setAttribute("height", "100%")
  filter.setAttribute("color-interpolation-filters", "sRGB")

  const feImage = document.createElementNS(SVG_NS, "feImage")
  feImage.setAttribute("x", "0")
  feImage.setAttribute("y", "0")
  feImage.setAttribute("result", "map")
  feImage.setAttribute("preserveAspectRatio", "none")
  filter.appendChild(feImage)

  const keep = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  ]
  const channels: string[] = []
  for (let i = 0; i < 3; i++) {
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap")
    disp.setAttribute("in", "SourceGraphic")
    disp.setAttribute("in2", "map")
    disp.setAttribute("scale", String(scales[i]))
    disp.setAttribute("xChannelSelector", "R")
    disp.setAttribute("yChannelSelector", "B")
    disp.setAttribute("result", `d${i}`)
    filter.appendChild(disp)

    const cm = document.createElementNS(SVG_NS, "feColorMatrix")
    cm.setAttribute("in", `d${i}`)
    cm.setAttribute("type", "matrix")
    cm.setAttribute("values", keep[i])
    cm.setAttribute("result", `c${i}`)
    filter.appendChild(cm)
    channels.push(`c${i}`)
  }

  const blend1 = document.createElementNS(SVG_NS, "feBlend")
  blend1.setAttribute("in", channels[0])
  blend1.setAttribute("in2", channels[1])
  blend1.setAttribute("mode", "screen")
  blend1.setAttribute("result", "c01")
  filter.appendChild(blend1)

  const blend2 = document.createElementNS(SVG_NS, "feBlend")
  blend2.setAttribute("in", "c01")
  blend2.setAttribute("in2", channels[2])
  blend2.setAttribute("mode", "screen")
  filter.appendChild(blend2)

  ensureDefs().appendChild(filter)
  return { filter, feImage }
}

function resolveRadius(el: HTMLElement, w: number, h: number, override?: number | null): number {
  if (override != null) return override
  const raw = getComputedStyle(el).borderTopLeftRadius || "0px"
  const v = parseFloat(raw) || 0
  return raw.trim().endsWith("%") ? (v / 100) * Math.min(w, h) : v
}

export function applyLiquidGlass(el: HTMLElement, opts?: LiquidGlassOptions): LiquidGlassInstance {
  const o = Object.assign(
    {
      scale: -80,
      chroma: 4,
      border: 0.05,
      mapBlur: 10,
      blur: 4,
      saturate: 1.3,
      radius: null,
      fallbackBlur: 16,
    },
    opts
  )

  const isSupported = checkSupport()

  if (!isSupported) {
    const frosted = `blur(${o.fallbackBlur}px) saturate(${o.saturate})`
    el.style.backdropFilter = frosted
    ;(el.style as any).webkitBackdropFilter = frosted
    el.classList.add("lg-fallback")
    return {
      supported: false,
      refresh: () => {},
      destroy: () => {
        el.style.backdropFilter = ""
        ;(el.style as any).webkitBackdropFilter = ""
        el.classList.remove("lg-fallback")
      },
    }
  }

  const id = `lg-filter-${++uid}`
  const scales = [o.scale, o.scale + o.chroma, o.scale + 2 * o.chroma]
  const parts = buildFilter(id, scales)

  function refresh() {
    const w = el.offsetWidth
    const h = el.offsetHeight
    if (!w || !h) return
    const radius = resolveRadius(el, w, h, o.radius)
    parts.feImage.setAttribute("href", makeMap(w, h, radius, o.border, o.mapBlur))
    parts.feImage.setAttribute("width", String(w))
    parts.feImage.setAttribute("height", String(h))
  }

  refresh()
  requestAnimationFrame(refresh)
  setTimeout(refresh, 50)
  setTimeout(refresh, 150)

  try {
    el.style.backdropFilter = `url(#${id}) blur(${o.blur}px) saturate(${o.saturate})`
    ;(el.style as any).webkitBackdropFilter = `blur(${o.blur + 10}px) saturate(${o.saturate})`
  } catch {}

  let timer: any = null
  const ro = new ResizeObserver(() => {
    clearTimeout(timer)
    timer = setTimeout(refresh, 80)
  })
  ro.observe(el)

  return {
    supported: true,
    refresh,
    destroy: () => {
      ro.disconnect()
      clearTimeout(timer)
      try {
        parts.filter.remove()
      } catch {}
      el.style.backdropFilter = ""
      ;(el.style as any).webkitBackdropFilter = ""
    },
  }
}
