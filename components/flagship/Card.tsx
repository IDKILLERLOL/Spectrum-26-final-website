import * as React from "react"
import { cn } from "@/lib/utils"
import { cardStyle } from "./tokens"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div"
  style?: React.CSSProperties
}

/** border-4 INK + hard offset boxShadow on aged-paper, zero radius — the hoarding-panel
 *  primitive reused by event cards, quick-link tiles, info strips, winner cards, gallery tiles. */
export function Card({ className, style, children, ...props }: CardProps) {
  return (
    <div className={cn("border-4", className)} style={{ ...cardStyle, ...style }} {...props}>
      {children}
    </div>
  )
}
