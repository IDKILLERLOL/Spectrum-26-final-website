"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { galleryTiles } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { INK, MUSTARD, VERMILION, hoardingShadow, softHoardingShadow } from "@/components/flagship/tokens"
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from "lucide-react"

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

  // Keep latest handlers in refs to guarantee stable useEffect dependencies
  const handleNextRef = useRef(handleNext)
  const handlePrevRef = useRef(handlePrev)
  const isFullscreenRef = useRef(isFullscreen)

  useEffect(() => {
    handleNextRef.current = handleNext
    handlePrevRef.current = handlePrev
    isFullscreenRef.current = isFullscreen
  }, [handleNext, handlePrev, isFullscreen])

  // Auto-slide timer (stable dependency array: [isAutoplay])
  useEffect(() => {
    if (!isAutoplay) return
    const timer = setInterval(() => {
      handleNextRef.current()
    }, 4000)
    return () => clearInterval(timer)
  }, [isAutoplay])

  // Global Keyboard shortcuts (stable dependency array: [])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextRef.current()
      if (e.key === "ArrowLeft") handlePrevRef.current()
      if (e.key === " ") {
        e.preventDefault()
        setIsAutoplay((prev) => !prev)
      }
      if (e.key === "Escape" && isFullscreenRef.current) setIsFullscreen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.25,
      transition: { duration: 0.25, ease: "easeIn" },
    }),
  }

  return (
    <>
      <PageHeader title="Gallery Showcase" back={false} />
      <PageContainer width="wide">
        <div className="flex flex-col gap-6 px-4 py-6">
          {/* Main Inline Slideshow Frame */}
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
                  className="flex items-center gap-1.5 rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium transition hover:bg-white/20 active:scale-95"
                  title={isAutoplay ? "Pause Slideshow (Space)" : "Play Slideshow (Space)"}
                >
                  {isAutoplay ? <Pause size={13} /> : <Play size={13} />}
                  <span className="hidden sm:inline">{isAutoplay ? "PAUSE" : "AUTO PLAY"}</span>
                </button>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="rounded border border-white/20 bg-white/10 p-1.5 transition hover:bg-white/20 active:scale-95"
                  title="Expand Fullscreen Slideshow"
                >
                  <Maximize2 size={14} />
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
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white/90 p-2 text-black shadow-md transition-all hover:scale-110 hover:bg-white active:scale-95 z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white/90 p-2 text-black shadow-md transition-all hover:scale-110 hover:bg-white active:scale-95 z-20"
                aria-label="Next Slide"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Bottom Thumbnail Strip */}
            <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto border-t-2 border-white/20 bg-zinc-900 p-3 no-scrollbar">
              {galleryTiles.map((tile, idx) => (
                <button
                  key={tile.id}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                  }}
                  className={`group relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded border-2 transition-all ${
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

      {/* FULLSCREEN SLIDESHOW MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md text-white select-none"
          >
            {/* Fullscreen Header Controls */}
            <div className="flex items-center justify-between border-b border-white/20 bg-zinc-950/80 px-6 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`${questDisplay.className} text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-black`}
                  style={{ background: MUSTARD, color: INK }}
                >
                  {String(currentIndex + 1).padStart(2, "0")} / {String(galleryTiles.length).padStart(2, "0")}
                </span>
                <span className={`${questDisplay.className} text-sm sm:text-base font-bold tracking-wide text-white`}>
                  {currentSlide.caption}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20 active:scale-95"
                >
                  {isAutoplay ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isAutoplay ? "PAUSE" : "PLAY"}</span>
                </button>

                <button
                  onClick={() => setIsFullscreen(false)}
                  className="rounded-full border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white hover:text-black active:scale-95"
                  title="Close Fullscreen (Esc)"
                >
                  <Minimize2 size={18} />
                </button>
              </div>
            </div>

            {/* Fullscreen Main Image Viewer with Motion Slide Effect */}
            <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-4 flex items-center justify-center"
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.caption}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-2xl border border-white/10"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Fullscreen Arrow Controls */}
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 bg-black/60 p-3.5 text-white backdrop-blur transition hover:scale-110 hover:bg-white hover:text-black active:scale-95 z-30"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 bg-black/60 p-3.5 text-white backdrop-blur transition hover:scale-110 hover:bg-white hover:text-black active:scale-95 z-30"
                aria-label="Next Slide"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Fullscreen Bottom Thumbnail Navigation Strip */}
            <div className="border-t border-white/20 bg-zinc-950/90 p-4">
              <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
                {galleryTiles.map((tile, idx) => (
                  <button
                    key={tile.id}
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1)
                      setCurrentIndex(idx)
                    }}
                    className={`group relative h-14 w-20 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      idx === currentIndex
                        ? "border-amber-400 scale-105 ring-2 ring-amber-400/80 shadow-lg"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={tile.imageUrl} alt={tile.caption} className="h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
