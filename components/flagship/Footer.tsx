"use client"

import * as React from "react"
import { INK, VERMILION, AGED_PAPER } from "./tokens"
import { questDisplay, questBody } from "./fonts"
import Link from "next/link"
import { Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t-4 py-4 px-5 md:px-10 mt-auto shrink-0 bg-white" style={{ borderColor: INK }}>
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Copyright */}
        <p className={`${questBody.className} text-xs font-bold text-center md:text-left`} style={{ color: INK }}>
          © 2026 Spectrum 5.0. All Rights Reserved.
        </p>

        {/* Middle: Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 max-w-xl">
          <Link href="/" className={`${questBody.className} text-xs font-bold uppercase hover:underline`} style={{ color: INK }}>
            Home
          </Link>
          <Link href="/more/about" className={`${questBody.className} text-xs font-bold uppercase hover:underline`} style={{ color: INK }}>
            About
          </Link>
          <Link href="/events" className={`${questBody.className} text-xs font-bold uppercase hover:underline`} style={{ color: INK }}>
            Events
          </Link>
          <Link href="/schedule" className={`${questBody.className} text-xs font-bold uppercase hover:underline`} style={{ color: INK }}>
            Schedule
          </Link>
          <Link href="/register" className={`${questBody.className} text-xs font-bold uppercase hover:underline`} style={{ color: INK }}>
            Registration
          </Link>
          <Link href="/more/sponsors" className={`${questBody.className} text-xs font-bold uppercase hover:underline`} style={{ color: INK }}>
            Sponsors
          </Link>
          <Link href="/more/contact" className={`${questBody.className} text-xs font-bold uppercase hover:underline`} style={{ color: INK }}>
            Contact
          </Link>
        </div>

        {/* Right: Social Media */}
        <div className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/spectrum.sbmp?igsh=MWJ4dTA5ajAzZG5zaQ=="
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
