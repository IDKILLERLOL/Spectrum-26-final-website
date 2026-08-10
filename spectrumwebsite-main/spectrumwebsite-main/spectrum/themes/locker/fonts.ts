import { Permanent_Marker, Bebas_Neue, Caveat } from "next/font/google"

// Display: spray-paint / marker script for headlines — gritty, physical feel.
export const lockerDisplay = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

// Stat / number face: tall condensed sans for countdown, indexes, prices.
export const lockerStat = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

// Body: handwriting-adjacent face for "notebook paper" copy blocks.
export const lockerBody = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})
