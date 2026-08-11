"use client"

import { cn } from "@/lib/utils"
import { CREAM, NAVY, PINK } from "./tokens"
import { questBody } from "./fonts"

export interface SegmentedTab<T extends string> {
  id: T
  label: string
}

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTab<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

/** Pill tab bar — reused by Schedule (5 views) and Events detail (Details/Rules/Prizes). */
export function SegmentedTabs<T extends string>({ tabs, active, onChange, className }: SegmentedTabsProps<T>) {
  return (
    <div
      className={cn("flex gap-1 overflow-x-auto border-[3px] p-1", className)}
      style={{ borderColor: NAVY, background: CREAM }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`${questBody.className} flex-1 whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors`}
            style={{
              background: isActive ? PINK : "transparent",
              color: isActive ? CREAM : NAVY,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
