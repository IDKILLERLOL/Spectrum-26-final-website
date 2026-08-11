import { CREAM } from "./tokens"
import { BottomNav } from "./BottomNav"
import { DesktopNav } from "./DesktopNav"

/** Persistent chrome for every flagship route: safe-area-aware bottom nav on mobile,
 *  a sticky top nav on desktop (md+), and a responsive content container in between. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div data-app="flagship" className="relative min-h-dvh w-full" style={{ background: CREAM }}>
      <DesktopNav />
      <div className="pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</div>
      <BottomNav />
    </div>
  )
}
