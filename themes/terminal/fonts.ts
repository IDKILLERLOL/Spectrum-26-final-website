import { JetBrains_Mono } from "next/font/google"

// One typeface, three weights — 400 for body/output, 500 for UI chrome, 700 for headers.
export const termMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-terminal-display",
})
