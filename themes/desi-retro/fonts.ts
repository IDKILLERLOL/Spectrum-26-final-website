import { Yatra_One, Mukta } from "next/font/google"

export const desiDisplay = Yatra_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-desi-retro-display",
})

export const desiBody = Mukta({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-desi-retro-body",
})
