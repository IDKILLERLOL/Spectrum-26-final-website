import type { Metadata, Viewport } from "next"
import "./globals.css"
import { site } from "@/content/spectrum"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: `${site.about} ${site.date} · ${site.venue}`,
  icons: {
    icon: [
      { url: "/icon-light-32x32.png" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1026",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""} />
      </body>
    </html>
  )
}
