"use client"

import * as React from "react"
import { INK, VERMILION, AGED_PAPER } from "./tokens"
import { questDisplay, questBody } from "./fonts"
import { Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t-4 py-8 px-5 md:px-10 mt-auto shrink-0 bg-white" style={{ borderColor: INK }}>
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Copyright */}
        <p className={`${questBody.className} text-xs font-bold text-center sm:text-left`} style={{ color: INK }}>
          © 2026 Spectrum 5.0. All Rights Reserved.
        </p>

        {/* Right: Social Media */}
        <div className="flex flex-col items-center sm:items-end gap-2">
          <p className={`${questDisplay.className} text-[10px] uppercase tracking-widest font-bold`} style={{ color: INK }}>
            Social Media
          </p>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${questBody.className} text-xs font-bold flex items-center gap-1.5 uppercase transition-colors hover:opacity-80`}
            style={{ color: INK }}
          >
            <span
              className="flex size-7 items-center justify-center border-2 rounded-sm text-white"
              style={{ background: VERMILION, borderColor: INK }}
            >
              <Instagram size={14} />
            </span>
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
