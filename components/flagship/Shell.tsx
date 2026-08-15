import { CREAM } from "./tokens"
import { DesktopNav } from "./DesktopNav"

/** Persistent chrome for every flagship route: a sticky top nav on desktop (md+),
 *  a responsive top bar + sidebar on mobile, and a content container. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div data-app="flagship" className="relative min-h-dvh w-full" style={{ background: CREAM }}>
      <DesktopNav />
      <div className="w-full">{children}</div>
    </div>
  )
}
