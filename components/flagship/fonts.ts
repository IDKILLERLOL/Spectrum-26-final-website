import { Yatra_One, Mukta } from "next/font/google"

// Display: hand-painted signboard/hoarding lettering feel, used for titles/labels.
export const questDisplay = Yatra_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

// Body: readable, slightly blocky utility face for longer copy.
export const questBody = Mukta({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
})
