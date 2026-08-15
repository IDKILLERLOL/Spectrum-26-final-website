"use client"

import Script from "next/script"
import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

function PageviewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchString = searchParams?.toString() ?? ""

  React.useEffect(() => {
    if (typeof window.gtag !== "function") return
    const url = searchString ? `${pathname}?${searchString}` : pathname
    window.gtag("event", "page_view", { page_path: url })
  }, [pathname, searchString, measurementId])

  return null
}

/** Renders nothing when unconfigured — GA4 wiring is opt-in via env var. */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (!measurementId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <React.Suspense fallback={null}>
        <PageviewTracker measurementId={measurementId} />
      </React.Suspense>
    </>
  )
}
