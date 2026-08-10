import { Orbitron, Rajdhani } from "next/font/google"

export const outrunDisplay = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-outrun-display",
})

export const outrunBody = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-outrun-body",
})
