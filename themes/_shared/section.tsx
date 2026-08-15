import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
}

/** Thin snap-scroll section wrapper. Purely structural — themes own all visual styling. */
export function Section({ id, className, children, ...props }: SectionProps) {
  return (
    <section id={id} className={cn("min-h-dvh w-full", className)} {...props}>
      {children}
    </section>
  )
}
