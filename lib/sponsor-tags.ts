/**
 * Shared tag definitions for sponsors.
 * This file contains no client-only code so it can be imported by both Server and Client Components.
 */

export const SPONSOR_TAGS = [
  { value: "food",          label: "Food" },
  { value: "beverage",      label: "Beverage" },
  { value: "coffee",        label: "Coffee" },
  { value: "clothing",      label: "Clothing" },
  { value: "accessories",   label: "Accessories" },
  { value: "beauty",        label: "Beauty & Grooming" },
  { value: "tech",          label: "Tech" },
  { value: "gaming",        label: "Gaming" },
  { value: "health",        label: "Health & Wellness" },
  { value: "fitness",       label: "Fitness" },
  { value: "sports",        label: "Sports" },
  { value: "education",     label: "Education" },
  { value: "finance",       label: "Finance & Fintech" },
  { value: "music",         label: "Music & Audio" },
  { value: "entertainment", label: "Entertainment" },
  { value: "photography",   label: "Photography" },
  { value: "media",         label: "Media & Press" },
  { value: "marketing",     label: "Marketing" },
  { value: "travel",        label: "Travel & Hospitality" },
  { value: "automotive",    label: "Automotive" },
  { value: "logistics",     label: "Logistics & Delivery" },
  { value: "consulting",    label: "Consulting & Services" },
  { value: "community",     label: "Community & Youth" },
  { value: "security",      label: "Security" },
  { value: "gifts",         label: "Gifts & Merch" },
  { value: "energy",        label: "Energy & Drinks" },
  { value: "premium",       label: "Premium Partner" },
] as const

export type SponsorTagValue = (typeof SPONSOR_TAGS)[number]["value"]

export function getSponsorTagLabel(value: string): string {
  const found = SPONSOR_TAGS.find((t) => t.value === value)
  return found ? found.label : value
}
