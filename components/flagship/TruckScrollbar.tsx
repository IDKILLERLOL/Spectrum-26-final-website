"use client"

import React, { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { INK, CREAM, MUSTARD, TEAL } from "./tokens"
import { gsap } from "gsap"

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
        <svg
          width="40"
          height="26"
          viewBox="0 0 40 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[2px_0_2px_rgba(0,0,0,0.4)]"
        >
          {/* Truck Cab */}
          <path d="M26 4H34C37 4 38 6 39 10L40 15H26V4Z" fill={MUSTARD} stroke={INK} strokeWidth="1.5" />
          {/* Cargo Box */}
          <rect x="2" y="4" width="24" height="15" fill={TEAL} stroke={INK} strokeWidth="1.5" />
          {/* Wheels */}
          <circle cx="8" cy="21" r="4" fill="#1A1A1A" stroke={INK} strokeWidth="1.5" />
          <circle cx="8" cy="21" r="1.5" fill="#FFF" className={reduced ? "" : "animate-spin"} />
          <circle cx="20" cy="21" r="4" fill="#1A1A1A" stroke={INK} strokeWidth="1.5" />
          <circle cx="20" cy="21" r="1.5" fill="#FFF" className={reduced ? "" : "animate-spin"} />
          
          {/* Small text "S-26" on cargo bed */}
          <text x="5" y="14" fill="#FFF" fontSize="6" fontWeight="bold" fontFamily="monospace">S-26</text>
        </svg>
      </div>
    </div>
  )
}
