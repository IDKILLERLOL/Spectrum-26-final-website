import { Press_Start_2P } from "next/font/google"

// True 8x8 bitmap font — the only face used in the entire NES theme.
// All text renders at exact 8/16/24px steps to stay on the pixel grid.
export const nesFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-side-scroll-display",
})
