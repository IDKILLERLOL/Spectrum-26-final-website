"use client"

import React, { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { INK, CREAM, MUSTARD, VERMILION, SKY, hoardingShadow } from "./tokens"
import { questDisplay, questBody } from "./fonts"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function CassetteScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftReelRef = useRef<SVGSVGElement>(null)
  const rightReelRef = useRef<SVGSVGElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  
  const [trackText, setTrackText] = useState("SIDE A // INTRO")

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return

    // 1. Reels continuous spin + speed change on scroll velocity
    const leftReel = leftReelRef.current
    const rightReel = rightReelRef.current
    
    let rotation = 0
    let velocity = 1

    const ticker = () => {
      rotation += velocity
      if (leftReel) gsap.set(leftReel, { rotation: rotation })
      if (rightReel) gsap.set(rightReel, { rotation: rotation })
    }

    gsap.ticker.add(ticker)

    // Scroll trigger to sync progress bar and track labels
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          // Adjust rotation speed depending on scroll direction & speed
          velocity = 1 + self.getVelocity() * 0.05
          
          // Determine track labels based on scroll percentage
          const progress = self.progress
          if (progress < 0.3) {
            setTrackText("SIDE A // TRACK 01: HERO")
          } else if (progress < 0.7) {
            setTrackText("SIDE A // TRACK 02: EVENTS")
          } else {
            setTrackText("SIDE B // TRACK 03: FOOTER")
          }
          
          // Progress bar width
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, { width: `${progress * 100}%` })
          }
        }
      }
    })

    return () => {
      gsap.ticker.remove(ticker)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="w-full py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden bg-neutral-900 border-y-4"
      style={{ borderColor: INK }}
    >
      {/* Tape Static/VHS Jitter overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 2px)"
        }}
      />

      {/* Cassette Body */}
      <div 
        className="w-full max-w-xl border-4 rounded-xl p-5 flex flex-col items-center relative select-none"
        style={{ background: CREAM, borderColor: INK, boxShadow: hoardingShadow }}
      >
        {/* Cassette Top Header */}
        <div className="w-full flex justify-between items-center px-2 mb-4 border-b-2 pb-2" style={{ borderColor: INK }}>
          <span className={`${questDisplay.className} text-[10px] tracking-widest`} style={{ color: INK }}>
            STEREO
          </span>
          <span className={`${questDisplay.className} text-[10px] tracking-widest text-red-600 animate-pulse`}>
            ● REC
          </span>
          <span className={`${questDisplay.className} text-xs font-bold tracking-widest`} style={{ color: INK }}>
            SPECTRUM '26 MIXTAPE
          </span>
        </div>

        {/* Handwritten Label */}
        <div 
          className="w-full bg-[#FFFDF6] border-2 py-2 px-4 flex items-center justify-between shadow-inner mb-6"
          style={{ borderColor: INK }}
        >
          <span className="font-mono text-xs font-semibold tracking-wider text-neutral-800 animate-pulse">
            {trackText}
          </span>
          <span className={`${questDisplay.className} text-[10px] font-black`} style={{ color: INK }}>
            SIDE A
          </span>
        </div>

        {/* Reels Window */}
        <div 
          className="w-4/5 h-20 bg-neutral-950 border-4 flex justify-around items-center relative overflow-hidden rounded"
          style={{ borderColor: INK }}
        >
          {/* Tape Progress Line (Thin blue tape) */}
          <div className="absolute inset-x-0 h-1 bg-sky-500/20 top-1/2 -translate-y-1/2">
            <div ref={progressBarRef} className="h-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] w-0" />
          </div>

          {/* Left Reel */}
          <div className="relative z-10">
            <div className="absolute inset-0 bg-amber-400/20 blur-md rounded-full animate-pulse pointer-events-none" />
            <svg 
              ref={leftReelRef}
              width="50" 
              height="50" 
              viewBox="0 0 50 50" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_4px_rgba(232,161,58,0.5)]"
            >
              <circle cx="25" cy="25" r="23" stroke={MUSTARD} strokeWidth="3" />
              <circle cx="25" cy="25" r="8" fill={CREAM} stroke={INK} strokeWidth="2" />
              {/* Spoke teeth */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 360) / 6
                return (
                  <line 
                    key={i}
                    x1="25" 
                    y1="5" 
                    x2="25" 
                    y2="15" 
                    stroke={MUSTARD} 
                    strokeWidth="3" 
                    transform={`rotate(${angle} 25 25)`} 
                  />
                )
              })}
            </svg>
          </div>

          {/* Right Reel */}
          <div className="relative z-10">
            <div className="absolute inset-0 bg-red-500/20 blur-md rounded-full animate-pulse pointer-events-none" />
            <svg 
              ref={rightReelRef}
              width="50" 
              height="50" 
              viewBox="0 0 50 50" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_4px_rgba(199,56,47,0.5)]"
            >
              <circle cx="25" cy="25" r="23" stroke={VERMILION} strokeWidth="3" />
              <circle cx="25" cy="25" r="8" fill={CREAM} stroke={INK} strokeWidth="2" />
              {/* Spoke teeth */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 360) / 6
                return (
                  <line 
                    key={i}
                    x1="25" 
                    y1="5" 
                    x2="25" 
                    y2="15" 
                    stroke={VERMILION} 
                    strokeWidth="3" 
                    transform={`rotate(${angle} 25 25)`} 
                  />
                )
              })}
            </svg>
          </div>
        </div>

        {/* Cassette Footer Label */}
        <div className="w-full flex justify-between items-center mt-4 px-4 text-[9px] font-bold opacity-60 text-neutral-800">
          <span>NR [●] SYSTEM</span>
          <span>MADE IN INDIA</span>
          <span>CHROME POSITION</span>
        </div>
      </div>
    </div>
  )
}
