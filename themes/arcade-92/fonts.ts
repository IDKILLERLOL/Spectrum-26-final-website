import { Press_Start_2P, VT323 } from "next/font/google"

// Display: chunky pixel headline face — titles, labels, HUD elements.
export const arcadeDisplay = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

// Body: tall, readable CRT-style monospace for longer copy.
export const arcadeBody = VT323({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})
