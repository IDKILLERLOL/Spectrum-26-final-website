import { Anton, Archivo, Space_Mono } from "next/font/google"

export const risoDisplay = Anton({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-riso-display" })
export const risoBody = Archivo({ subsets: ["latin"], display: "swap" })
export const risoMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" })
