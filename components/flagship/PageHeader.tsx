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
    <header className="mx-auto w-full max-w-6xl px-5 pb-2 pt-8 md:px-10 md:pt-10 flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {back && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="group flex h-9 w-9 shrink-0 items-center justify-start overflow-hidden border-[3px] px-1.5 transition-all duration-300 ease-in-out hover:w-[4.6rem] md:h-11 md:w-11 md:px-2.5 md:hover:w-24 hover:bg-neutral-100"
            style={{ borderColor: NAVY }}
          >
            <ChevronLeft size={18} color={NAVY} className="shrink-0" />
            <span 
              className={`${questBody.className} text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-0 transition-opacity duration-200 group-hover:opacity-100 ml-1`} 
              style={{ color: NAVY }}
            >
              Back
            </span>
          </button>
        )}
        <h1 className={`${questDisplay.className} text-lg md:text-3xl leading-none`} style={{ color: NAVY }}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p 
          className={`${questBody.className} text-xs opacity-70 md:text-sm`} 
          style={{ 
            color: NAVY,
            paddingLeft: back ? "3rem" : "0"
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
