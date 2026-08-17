"use client"

import * as React from "react"
import { INK, CREAM, MUSTARD, VERMILION } from "./tokens"
import { questDisplay, questBody } from "./fonts"
import { Car } from "lucide-react"

export function RickshawLoader({ isComplete, onComplete }: { isComplete: boolean; onComplete?: () => void }) {
  const [progress, setProgress] = React.useState(0)
  const [statusText, setStatusText] = React.useState("REGISTERING...")

  // Progress simulation (slows down near 92% until complete)
  React.useEffect(() => {
    if (isComplete) {
      setProgress(100)
      setStatusText("REGISTRATION COMPLETE ✓")
      const timeout = setTimeout(() => {
        onComplete?.()
      }, 1200)
      return () => clearTimeout(timeout)
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(interval)
          return prev
        }
        // Slow down progress increments as it gets higher
        const step = prev < 50 ? 5 : prev < 75 ? 3 : prev < 85 ? 1.5 : 0.5
        const next = Math.min(prev + step, 92)

        // Dynamically update status text based on progress
        if (next < 25) {
          setStatusText("REGISTERING...")
        } else if (next < 55) {
          setStatusText("CONNECTING...")
        } else if (next < 80) {
          setStatusText("SAVING REGISTRATION...")
        } else {
          setStatusText("CONFIRMING...")
        }

        return next
      })
    }, 150)

    return () => clearInterval(interval)
  }, [isComplete, onComplete])

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950/80 px-5 backdrop-blur-sm pointer-events-auto"
    >
      <div 
        className="w-full max-w-md border-4 p-8 text-center flex flex-col items-center relative"
        style={{ background: CREAM, borderColor: INK, boxShadow: `6px 6px 0px ${INK}` }}
      >
        {/* Road Track Header */}
        <h3 className={`${questDisplay.className} text-sm tracking-widest mb-6 uppercase`} style={{ color: INK }}>
          Booking Your Ride
        </h3>

        {/* Progress Track Container */}
        <div className="relative w-full h-12 flex items-center mb-4">
          {/* Progress Track Line */}
          <div className="absolute inset-x-0 h-2 bg-neutral-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-150 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          {/* Dotted lane markings */}
          <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-white/40 top-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Traveling Rickshaw */}
          <div 
            className="absolute -translate-y-1/2 top-1/2 -ml-6 transition-all duration-150 ease-out"
            style={{ left: `${progress}%` }}
          >
            {/* Bounce animation */}
            <div className="animate-[bounce_0.6s_infinite_alternate] ease-in-out">
              <Car
                size={36}
                style={{ color: INK, fill: MUSTARD }}
                strokeWidth={2.2}
                className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Loading status details */}
        <div className="flex flex-col gap-1 items-center">
          <p className={`${questDisplay.className} text-xs tracking-wider`} style={{ color: VERMILION }}>
            {statusText}
          </p>
          <p className={`${questBody.className} text-[10px] opacity-60`} style={{ color: INK }}>
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  )
}
