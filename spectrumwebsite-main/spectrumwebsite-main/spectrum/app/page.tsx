"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ComponentType } from "react"
import { themeMetas, loadTheme } from "@/themes/registry"
import { site } from "@/content/spectrum"

function ThemeCard({ slug, name, tagline, swatch }: (typeof themeMetas)[number]) {
  const router = useRouter()
  const [Preview, setPreview] = React.useState<ComponentType | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadTheme(slug)?.then((mod) => setPreview(() => mod.default.Preview))
          io.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [slug])

  return (
    <div
      ref={ref}
      onClick={() => router.push(`/t/${slug}`)}
      className="relative flex h-[calc(100dvh-2rem)] w-full shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-white/10 active:scale-[0.98] transition-transform"
      style={{ background: swatch[0] }}
    >
      <div className="absolute inset-0">
        {Preview ? (
          <Preview />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <div className="flex gap-1.5">
              {swatch.map((c) => (
                <span key={c} className="size-3 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="relative mt-auto flex items-end justify-between gap-3 bg-gradient-to-t from-black/60 to-transparent p-5">
        <div>
          <p className="text-lg font-bold text-white drop-shadow">{name}</p>
          <p className="text-xs text-white/80 drop-shadow">{tagline}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-black">
          Enter →
        </span>
      </div>
    </div>
  )
}

export default function WorldSelectPage() {
  return (
    <div className="min-h-dvh w-full bg-black">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4">
        <p className="text-sm font-bold text-white">{site.name}</p>
        <p className="text-xs text-white/60">Choose your world</p>
      </header>
      <div className="flex snap-y snap-mandatory flex-col gap-4 overflow-y-auto px-4 pb-4 pt-16" style={{ scrollSnapType: "y mandatory" }}>
        {themeMetas.map((meta) => (
          <ThemeCard key={meta.slug} {...meta} />
        ))}
      </div>
    </div>
  )
}
