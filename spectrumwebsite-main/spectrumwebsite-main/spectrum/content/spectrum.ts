// SINGLE SOURCE OF TRUTH for all copy and data across every theme.
// Themes must never hardcode this content — they only control how it's presented.

export const EVENT_DATE_ISO = "2026-09-30T09:00:00+05:30"
export const EVENT_DATE_DISPLAY = "30 September 2026"
export const EVENT_DATE_SHORT = "30.09.2026"

export const site = {
  name: "Spectrum 5.0",
  shortName: "Spectrum",
  version: "5.0",
  eyebrow: "4 Events. 1 Ultimate Battle.",
  tagline: "The ultimate tech and gaming showdown.",
  subTagline: "Code. Compete. Conquer.",
  legacyLine: "4 Events • One Legacy",
  motto: "Think. Code. Compete. Conquer.",
  host: "SVKM's Shri Bhagubhai Mafatlal Polytechnic & College of Engineering",
  hostShort: "SBMP College of Engineering",
  venue: "SBMP Building, Vile Parle (West), Mumbai",
  date: EVENT_DATE_DISPLAY,
  dateShort: EVENT_DATE_SHORT,
  dateISO: EVENT_DATE_ISO,
  prizePool: "₹25,000+",
  prizePoolNumeric: 25000,
  about:
    "Spectrum 5.0 is the annual tech and gaming extravaganza that brings together coders, gamers, designers and dreamers. Compete, collaborate and conquer in an unforgettable experience.",
  aboutShort: "Where passion meets performance.",
} as const

export type EventId = "dual-debug" | "singularity-strike" | "bgmi" | "fc26"

export interface SpectrumEvent {
  id: EventId
  index: string // "01".."04"
  name: string
  shortName: string
  tag: string // "Duo coding face-off"
  format: string // "Duo Partners"
  fee: string // "₹150 / person"
  feeNumeric: number
  teamSize: string
  difficulty: 1 | 2 | 3 | 4 | 5
  color: string // hex accent, distinct per event
  description: string
  rules: string[]
  prizes: { place: string; reward: string }[]
  registrationEnds: string
}

export const events: SpectrumEvent[] = [
  {
    id: "dual-debug",
    index: "01",
    name: "Dual Debug",
    shortName: "Dual Debug",
    tag: "Duo coding face-off.",
    format: "Duo Partners",
    fee: "₹150 / person",
    feeNumeric: 150,
    teamSize: "2 Participants",
    difficulty: 3,
    color: "#6FBF5B",
    description:
      "Two minds, one goal. Solve, debug and conquer together against the clock.",
    rules: [
      "Each team must have exactly 2 participants.",
      "Use of external resources is strictly prohibited.",
      "The organizers' decision is final in all matters.",
      "Any form of misconduct results in disqualification.",
    ],
    prizes: [
      { place: "1st Place", reward: "Trophy + Goodies" },
      { place: "2nd Place", reward: "Trophy + Goodies" },
      { place: "3rd Place", reward: "Certificate + Goodies" },
    ],
    registrationEnds: "25 Sept 2026, 11:59 PM",
  },
  {
    id: "singularity-strike",
    index: "02",
    name: "Singularity Strike",
    shortName: "Sing. Strike",
    tag: "Solo arena battle.",
    format: "Individual",
    fee: "₹50",
    feeNumeric: 50,
    teamSize: "1 Participant",
    difficulty: 4,
    color: "#8B6FD9",
    description:
      "Enter the arena alone. Speed, precision and nerve decide who survives.",
    rules: [
      "Individual participation only, no teams.",
      "Use of external resources is strictly prohibited.",
      "The organizers' decision is final in all matters.",
      "Any form of misconduct results in disqualification.",
    ],
    prizes: [
      { place: "1st Place", reward: "Trophy + Goodies" },
      { place: "2nd Place", reward: "Trophy + Goodies" },
      { place: "3rd Place", reward: "Certificate + Goodies" },
    ],
    registrationEnds: "25 Sept 2026, 11:59 PM",
  },
  {
    id: "bgmi",
    index: "03",
    name: "BGMI Tournament",
    shortName: "BGMI",
    tag: "Squad up. Drop in. Survive.",
    format: "Team / Squad",
    fee: "₹800 / team",
    feeNumeric: 800,
    teamSize: "4 Participants",
    difficulty: 4,
    color: "#E8963C",
    description:
      "Drop into the battleground with your squad. Last team standing takes it all.",
    rules: [
      "Squad size fixed at 4 players.",
      "Emulator use is strictly prohibited.",
      "The organizers' decision is final in all matters.",
      "Any form of misconduct results in disqualification.",
    ],
    prizes: [
      { place: "1st Place", reward: "Trophy + Goodies" },
      { place: "2nd Place", reward: "Trophy + Goodies" },
      { place: "3rd Place", reward: "Certificate + Goodies" },
    ],
    registrationEnds: "25 Sept 2026, 11:59 PM",
  },
  {
    id: "fc26",
    index: "04",
    name: "FC 26 Showdown",
    shortName: "FC 26",
    tag: "Digital football battle.",
    format: "1v1",
    fee: "₹100",
    feeNumeric: 100,
    teamSize: "1 Participant",
    difficulty: 2,
    color: "#4FA3E3",
    description:
      "One-on-one football knockout. Pick your club, beat your rival, lift the cup.",
    rules: [
      "Single elimination, 1v1 matches.",
      "Match settings are fixed by organizers.",
      "The organizers' decision is final in all matters.",
      "Any form of misconduct results in disqualification.",
    ],
    prizes: [
      { place: "1st Place", reward: "Trophy + Goodies" },
      { place: "2nd Place", reward: "Trophy + Goodies" },
      { place: "3rd Place", reward: "Certificate + Goodies" },
    ],
    registrationEnds: "25 Sept 2026, 11:59 PM",
  },
]

export interface ScheduleItem {
  time: string
  title: string
  description: string
}

export const schedule: ScheduleItem[] = [
  { time: "09:00 AM", title: "Registrations Open", description: "Kickstart your journey!" },
  { time: "10:30 AM", title: "Opening Ceremony", description: "Let the battle begin!" },
  { time: "11:00 AM", title: "Events Start", description: "All arenas go live." },
  { time: "06:00 PM", title: "Finals", description: "Only the best survive." },
  { time: "08:00 PM", title: "Prize Distribution", description: "Champions will be crowned." },
]

export const highlights = [
  { title: "Epic Competitions", description: "4 thrilling events across technology & gaming." },
  { title: "Amazing Prizes", description: "Exciting goodies, trophies and more." },
  { title: "Unforgettable Fun", description: "Memories, friends and moments that last." },
  { title: "Unforgettable Memories", description: "Make your mark on Spectrum 5.0." },
]

export const sponsors = [
  { name: "Tech Byte" },
  { name: "Devfolio" },
  { name: "Pixel Labs" },
  { name: "Code Crafters" },
  { name: "Geek Gear" },
]

export const faqs = [
  { q: "Who can participate?", a: "Any student with a valid college ID can participate in Spectrum 5.0." },
  { q: "Is there any registration fee?", a: "Yes, each event has its own registration fee — see the event details." },
  { q: "Can I change my team later?", a: "Team changes must be finalized before the registration deadline." },
  { q: "What should I bring?", a: "Your college ID, a charged laptop/phone (for relevant events), and your best energy." },
  { q: "Will there be food?", a: "Yes, refreshments will be available for all registered participants." },
]

export const contact = {
  email: "spectrum5.0@svkm.ac.in",
  phone: "+91 98765 43210",
  location: "SVKM's Shri Bhagubhai Mafatlal Polytechnic & College of Engineering",
}

export const nav = [
  { label: "Home", href: "" },
  { label: "Events", href: "events" },
  { label: "Schedule", href: "schedule" },
  { label: "Sponsors", href: "sponsors" },
  { label: "More", href: "more" },
]

// ---- Registration form contract (shared by every theme's Dock/Register flow) ----
// Exactly 5 fields. No theme may add or remove fields from the primary form.
export interface RegistrationFormValues {
  name: string
  email: string
  phone: string
  college: string
  eventId: EventId | ""
}

export const registrationFormDefaults: RegistrationFormValues = {
  name: "",
  email: "",
  phone: "",
  college: "",
  eventId: "",
}
