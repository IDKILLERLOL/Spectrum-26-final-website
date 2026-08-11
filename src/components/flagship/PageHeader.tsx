"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { NAVY } from "./tokens"
import { questDisplay, questBody } from "./fonts"

interface PageHeaderProps {
  title: string
  subtitle?: string
  back?: boolean
}

export function PageHeader({ title, subtitle, back = true }: PageHeaderProps) {
  const router = useRouter()
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 pb-2 pt-8 md:px-10 md:pt-10">
      {back && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex size-9 shrink-0 items-center justify-center border-[3px] md:size-11 md:hidden"
          style={{ borderColor: NAVY }}
        >
          <ChevronLeft size={16} color={NAVY} />
        </button>
      )}
      <div>
        <h1 className={`${questDisplay.className} text-lg md:text-3xl`} style={{ color: NAVY }}>
          {title}
        </h1>
        {subtitle && (
          <p className={`${questBody.className} text-xs opacity-70 md:text-sm`} style={{ color: NAVY }}>
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
