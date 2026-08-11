import { cn } from "@/lib/utils"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "wide" for grid-heavy pages (Events, Gallery, More hub). "narrow" for
   *  reading/form-focused pages (Register, FAQs, About, Contact) — stays
   *  comfortably centered instead of stretching edge-to-edge on desktop. */
  width?: "wide" | "narrow"
}

export function PageContainer({ width = "wide", className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        width === "wide" ? "max-w-6xl md:px-10" : "max-w-2xl md:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
