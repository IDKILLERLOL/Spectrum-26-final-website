/**
 * Shared tag definitions for sponsors.
 * This file contains no client-only code so it can be imported by both Server and Client Components.
 */

export const SPONSOR_TAGS = [
  { value: "food",         label: "Food" },
  { value: "clothing",     label: "Clothing" },
  { value: "accessories",  label: "Accessories" },
  { value: "tech",         label: "Tech" },
  { value: "music",        label: "Music" },
  { value: "photography",  label: "Photography" },
  { value: "coffee",       label: "Coffee" },
  { value: "gifts",        label: "Gifts" },
  { value: "marketing",    label: "Marketing" },
  { value: "energy",       label: "Energy" },
  { value: "premium",      label: "Premium" },
  { value: "media",        label: "Media" },
] as const

export type SponsorTagValue = (typeof SPONSOR_TAGS)[number]["value"]

export function getSponsorTagLabel(value: string): string {
  const found = SPONSOR_TAGS.find((t) => t.value === value)
  return found ? found.label : value
}
