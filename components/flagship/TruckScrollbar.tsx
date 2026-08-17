"use client"

import React, { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { INK, CREAM, MUSTARD, TEAL } from "./tokens"
import { gsap } from "gsap"
import { Truck } from "lucide-react"

export function TruckScrollbar() {
  const reduced = useReducedMotion()
  const truckRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !truckRef.current) return

    const truck = truckRef.current
    let targetY = 0
    let currentY = 0
    let lastScrollY = window.scrollY
    const directionRef = { current: "down" }

    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight
      const scrolled = window.scrollY
      const maxScroll = docHeight - winHeight

      // Detect direction
      if (scrolled > lastScrollY) {
        directionRef.current = "down"
      } else if (scrolled < lastScrollY) {
        directionRef.current = "up"
      }
      lastScrollY = scrolled

      if (maxScroll > 0) {
        const progress = scrolled / maxScroll
        const trackHeight = winHeight - 48 // 48px is truck size
        targetY = progress * trackHeight
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    // Smooth catch-up loop using GSAP ticker (smooth physical interpolation)
    const tick = () => {
      // 0.1 interpolation factor for smooth inertia
      currentY += (targetY - currentY) * 0.1
      
      // Face direction of travel while keeping wheels on the right:
      // Moving down: scaleX = -1 (flips cabin to face down at 270deg rotation)
      // Moving up: scaleX = 1 (cabin faces up at 270deg rotation)
      const scaleX = directionRef.current === "down" ? -1 : 1
      
      gsap.set(truck, {
        y: currentY,
        x: 8, // Shift right to make wheels flush against the website edge
        rotation: 270,
        scaleX: scaleX,
        force3D: true
      })
    }

    gsap.ticker.add(tick)

    return () => {
      window.removeEventListener("scroll", onScroll)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <div className="fixed top-0 right-0 h-screen w-12 z-40 select-none pointer-events-none overflow-hidden">
      {/* Traveling side-profile retro truck */}
      <div 
        ref={truckRef}
        className="absolute w-12 h-12 flex items-center justify-center will-change-transform"
        style={{ top: 0 }}
      >
        <Truck
          size={36}
          style={{ color: INK, fill: TEAL }}
          strokeWidth={2.2}
          className="drop-shadow-[2px_0_2px_rgba(0,0,0,0.4)]"
        />
      </div>
    </div>
  )
}
