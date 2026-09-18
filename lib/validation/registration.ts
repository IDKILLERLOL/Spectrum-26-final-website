import { z } from "zod"

/**
 * Structural validation for a registration submission. Capacity-based team-size
 * checks happen in the route handler, since that requires looking up the event first.
 */
export const substituteSchema = z.object({
  name: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  college: z.string().trim().optional().default(""),
  year: z.string().trim().optional().default(""),
}).optional()

// Disallowed disposable / fake bot domains
const BLOCKED_DOMAINS = new Set([
  "a.com",
  "b.com",
  "c.com",
  "test.com",
  "example.com",
  "tempmail.com",
  "throwaway.com",
])

function isAllowedEmail(val: string): boolean {
  const parts = val.toLowerCase().split("@")
  if (parts.length !== 2) return false
  const domain = parts[1]
  if (BLOCKED_DOMAINS.has(domain)) return false
  // Domain must contain a period and at least 2 chars in extension
  const domainParts = domain.split(".")
  if (domainParts.length < 2) return false
  if (domainParts[domainParts.length - 1].length < 2) return false
  return true
}

// Clean phone digits and verify standard 10-digit mobile number
function isValidMobile(val: string): boolean {
  const digits = val.replace(/\D/g, "")
  // Standard 10 digit Indian mobile (starts with 6, 7, 8, 9)
  if (/^[6-9]\d{9}$/.test(digits)) return true
  // With 91 prefix (12 digits)
  if (/^91[6-9]\d{9}$/.test(digits)) return true
  // Obvious spam repeating digits
  if (/^(\d)\1{9}$/.test(digits)) return false
  return false
}

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .toLowerCase()
    .refine(isAllowedEmail, { message: "Please enter a valid, active email address." }),
  phone: z
    .string()
    .trim()
    .refine(isValidMobile, { message: "Enter a valid 10-digit mobile number (e.g. 9876543210)." }),
  eventId: z.string().trim().min(1, "Select an event."),
  teamName: z.string().trim().max(50, "Team name cannot exceed 50 characters.").optional().default(""),
  teamMembers: z.array(z.string().trim().min(1, "Team member name can't be empty.")).max(4),
  substitute: substituteSchema,
  collegeName: z.string().trim().max(100, "College name cannot exceed 100 characters.").optional().default(""),
  year: z.string().trim().min(1, "Select your year."),
  paymentRefId: z
    .string()
    .trim()
    .min(8, "Reference ID must be at least 8 characters.")
    .max(50, "Reference ID cannot exceed 50 characters.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Reference ID can only contain letters, numbers, and dashes."),
  pictureUrl: z.string().optional().default(""),
  // Invisible honeypot field — bots fill this, human users leave it blank
  website_url_check: z.string().optional().default(""),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
