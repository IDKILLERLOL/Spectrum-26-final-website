import { Press_Start_2P, Silkscreen } from "next/font/google"

// Display: tight pixel-grid headline face, used sparingly (titles/labels only).
export const pixelDisplay = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

// Body: readable pixel-adjacent face for longer copy.
export const pixelBody = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})
