import { z } from "zod"

/**
 * Structural validation for a registration submission. Capacity-based team-size
 * checks (teamMembers.length === event.capacity - 1) happen in the route handler,
 * since that requires looking up the event first — not expressible here alone.
 */
export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  eventId: z.string().trim().min(1, "Select an event."),
  teamName: z.string().trim().optional().default(""),
  teamMembers: z.array(z.string().trim().min(1, "Team member name can't be empty.")).max(3),
  collegeName: z.string().trim().optional().default(""),
  year: z.string().trim().min(1, "Select your year."),
  paymentRefId: z.string().trim().min(1, "Enter a valid reference ID.").max(50, "Reference ID cannot exceed 50 characters."),
  pictureUrl: z.string().optional().default(""),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
