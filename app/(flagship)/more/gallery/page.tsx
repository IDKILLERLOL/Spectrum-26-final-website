"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { galleryTiles } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { NAVY, CREAM, INK, MUSTARD, VERMILION, hoardingShadow, softHoardingShadow } from "@/components/flagship/tokens"
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X } from "lucide-react"

export default function GalleryPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [direction, setDirection] = useState(1)

  const currentSlide = galleryTiles[currentIndex] || galleryTiles[0]

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % galleryTiles.length)
  }, [])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + galleryTiles.length) % galleryTiles.length)
  }, [])

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoplay || isFullscreen) return
    const timer = setInterval(() => {
      handleNext()
    }, 4000)
    return () => clearInterval(timer)
  }, [isAutoplay, isFullscreen, handleNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrev, isFullscreen])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" },
    }),
  }

  return (
    <>
      <PageHeader title="Gallery Showcase" back={false} />
      <PageContainer width="wide">
        <div className="flex flex-col gap-6 px-4 py-6">
          {/* Main Slideshow Player Frame */}
          <div
            className="relative overflow-hidden rounded-xl border-4 bg-black p-1 md:p-2"
            style={{
              borderColor: INK,
              boxShadow: hoardingShadow,
            }}
          >
            {/* Top Toolbar / Status Bar */}
            <div className="flex items-center justify-between border-b-2 border-white/20 bg-zinc-900/90 px-4 py-2 text-white">
              <div className="flex items-center gap-2">
                <span
                  className={`${questDisplay.className} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-black`}
                  style={{ background: MUSTARD, color: INK }}
                >
                  SLIDE {String(currentIndex + 1).padStart(2, "0")} / {String(galleryTiles.length).padStart(2, "0")}
                </span>
                <span className={`${questBody.className} hidden sm:inline text-xs font-semibold text-zinc-300`}>
                  {currentSlide.caption}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className="flex items-center gap-1 rounded border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-medium transition hover:bg-white/20"
                  title={isAutoplay ? "Pause Slideshow" : "Play Slideshow"}
                >
                  {isAutoplay ? <Pause size={12} /> : <Play size={12} />}
                  <span className="hidden sm:inline">{isAutoplay ? "PAUSE" : "AUTO PLAY"}</span>
                </button>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="rounded border border-white/20 bg-white/10 p-1.5 transition hover:bg-white/20"
                  title="Expand Fullscreen"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            {/* Slideshow Display Area */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/90">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.caption}
                    className="h-full w-full object-contain"
                  />
                  {/* Subtle Gradient Shadow Overlay at bottom */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 sm:p-6" />
                  
                  {/* Caption badge */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 flex justify-between items-end">
                    <div
                      className={`${questDisplay.className} inline-block border-2 px-3 py-1.5 text-xs sm:text-base font-bold text-white shadow-lg`}
                      style={{
                        borderColor: INK,
                        background: VERMILION,
                        boxShadow: softHoardingShadow,
                      }}
                    >
                      {currentSlide.caption}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Nav Overlay Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white/90 p-2 text-black shadow-md transition-all hover:scale-110 hover:bg-white active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white/90 p-2 text-black shadow-md transition-all hover:scale-110 hover:bg-white active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Bottom Dots & Thumbnail Selector */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-white/20 bg-zinc-900 px-4 py-3">
              {galleryTiles.map((tile, idx) => (
                <button
                  key={tile.id}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                  }}
                  className={`group relative h-12 w-16 sm:h-14 sm:w-20 overflow-hidden rounded border-2 transition-all ${
                    idx === currentIndex
                      ? "border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/50"
                      : "border-zinc-700 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={tile.imageUrl} alt={tile.caption} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 rounded-full border-2 border-white bg-black/50 p-2 text-white transition hover:bg-white hover:text-black"
            >
              <X size={24} />
            </button>

            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.caption}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain border-2 border-white/30"
              />
              <div
                className={`${questDisplay.className} mt-3 text-center text-sm sm:text-lg font-bold text-white uppercase tracking-widest`}
              >
                {currentSlide.caption}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
