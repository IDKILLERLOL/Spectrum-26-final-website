"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import type { ThemeModule } from "@/themes/types"
import { loadTheme } from "@/themes/registry"
import { RegistrationProvider } from "@/themes/_shared/registration-context"
import { SwitchWorldFab } from "@/themes/_shared/switch-world-fab"

export default function ThemedSitePage() {
  const params = useParams<{ theme: string }>()
  const router = useRouter()
  const slug = params.theme
  const [T, setT] = React.useState<ThemeModule | null>(null)
  const [notFound, setNotFound] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const loader = loadTheme(slug)
    if (!loader) {
      setNotFound(true)
      return
    }
    loader.then((mod) => {
      if (!cancelled) setT(mod.default)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (notFound) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
        <p className="text-lg font-bold">World not found</p>
        <button onClick={() => router.push("/")} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">
          Back to World Select
        </button>
      </div>
    )
  }

  if (!T) {
    return <div className="min-h-dvh w-full bg-black" />
  }

  return (
    <div data-theme={T.meta.slug} className="relative min-h-dvh w-full">
      <RegistrationProvider>
        <T.Background />
        <main className="relative pb-24">
          <T.Hero />
          <T.Events />
          <T.Schedule />
          <T.About />
          <T.Sponsors />
          <T.Register />
          <T.Contact />
        </main>
        <T.Dock />
        <SwitchWorldFab />
      </RegistrationProvider>
    </div>
  )
}
