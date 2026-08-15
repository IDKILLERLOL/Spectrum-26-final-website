import { Cinzel, Inter, JetBrains_Mono } from "next/font/google"

// Display: sharp condensed serif for card names & headings.
export const holoDisplay = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
})

// Body: clean grotesk for readable copy.
export const holoBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

// Mono: stat blocks, countdown, etc.
export const holoMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})
