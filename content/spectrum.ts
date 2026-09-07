// SINGLE SOURCE OF TRUTH for all copy and data across every theme.
// Themes must never hardcode this content — they only control how it's presented.

export const EVENT_DATE_ISO = "2026-09-30T09:00:00+05:30"
export const EVENT_DATE_DISPLAY = "30 September 2026"
export const EVENT_DATE_SHORT = "30.09.2026"
const REGISTRATION_ENDS_ISO = "2026-09-25T23:59:00+05:30"

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
  prizePool: "₹40,000+",
  prizePoolNumeric: 40000,
  about:
    "Spectrum 5.0 is the annual tech and gaming extravaganza that brings together coders, gamers, designers and dreamers. Compete, collaborate and conquer in an unforgettable experience.",
  aboutShort: "Where passion meets performance.",
} as const

// Widened from a closed union now that events are admin-creatable via Firestore.
// Kept as a named alias (not inlined to `string`) so existing call sites reading
// `EventId` keep their intent documented even though the type itself is open now.
export type EventId = string

export interface SpectrumEvent {
  id: EventId
  index: string // "01".."04", cosmetic display badge
  order: number // explicit sort order — don't rely on `index` being contiguous
  category: string // e.g. "Coding", "Gaming"
  name: string
  shortName: string
  tag: string // "Duo coding face-off"
  format: string // "Duo Partners"
  fee: string // "₹150 / person"
  feeNumeric: number
  capacity: number // 1-4, source of truth for team size
  teamSize: string // display string, derived from capacity
  difficulty: 1 | 2 | 3 | 4 | 5
  color: string // hex accent, distinct per event
  duration: string // "3 Rounds"
  description: string

  rules: string[]
  prizes: { place: string; reward: string }[]
  registrationEnds: string // display string, derived from registrationEndsAt
  registrationEndsAt: string // ISO timestamp, real gating value
  registrationOpen: boolean
  prizePool?: string
  imageUrl: string | null
}

export const events: SpectrumEvent[] = [
  {
    id: "dual-debug",
    index: "01",
    order: 1,
    category: "Coding",
    name: "Dual Debug",
    shortName: "Dual Debug",
    tag: "Duo coding face-off.",
    format: "Duo Partners",
    fee: "₹150 / team",
    feeNumeric: 150,
    capacity: 2,
    teamSize: "2 Participants",
    difficulty: 3,
    color: "#6FBF5B",
    duration: "3 Rounds",
    description:
      "Dual Debug is a duo competition consisting of three rounds.\n\nRound 1: The Swap Challenge\nFormat: Duo (Person A & Person B)\nTotal Time: 65 Minutes (30m Coding + 5m Handoff + 30m Coding)\nProblem Set: 6 Problem Statements (3 for Person A, 3 for Person B)\nStructure:\n- Phase 1 — Independent Coding (30 mins): Separate machines, strict silence rule.\n- Phase 2 — The Handoff Break (5 mins): Strategy break to explain logic and progress.\n- Phase 3 — The Swap (30 mins): Swap machines and complete/optimize partner's code.\n\nRound 2: CodoPoly\nFormat: Duo (Custom Board Strategy)\nGameplay:\n- Matches played in groups (4 teams per match)\n- Monopoly-style board mechanics paired with coding tasks, resource management, and problem solving.\n\nRound 3: Snakes & Ladders (Snakes & Treasure)\nFormat: Duo (Life-sized Board or Simulator)\nSetup: 100-step custom board + life-sized dice; each team starts with 1 Key\nGameplay:\n- Dice roll determines task difficulty (1 = Easiest --> 6 = Hardest) to reverse engineer code/outputs.\n- Ladder Spot: Location clue leading to a Golden Key.\n- Snake Spot: Lose 1 Key (Reaching 0 keys triggers Rapid-Fire elimination).\n- Key Utility: Redeemable as Lifelines or Sabotage handicaps against other teams.",
    rules: [
      "Only college students are allowed to participate, and they must bring a valid proof of identification (college ID).",
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
    registrationEndsAt: REGISTRATION_ENDS_ISO,
    registrationOpen: true,
    imageUrl: null,
  },
  {
    id: "singularity-strike",
    index: "02",
    order: 2,
    category: "Coding",
    name: "Singularity Strike",
    shortName: "Singularity Strike",
    tag: "Solo coding showdown",
    format: "Individual",
    fee: "₹100",
    feeNumeric: 100,
    capacity: 1,
    teamSize: "1 Participant",
    difficulty: 5,
    color: "#FF6F61",
    duration: "3 Rounds",
    description:
      "Singularity Strike is a solo competition with three rounds.\n\nRound 1: Quantum Query (Speed Trivia / Quiz)\nFormat: Solo\n- Rapid elimination round testing core CS fundamentals, tech trivia, and syntax knowledge under a strict time constraint.\n\nRound 2: Binary Bingo (Logic Matrix)\nFormat: Solo\n- Strategic task-matrix challenge where participants solve mini-coding problems or output puzzles to claim squares on their personal grid and complete winning lines.\n\nRound 3: The Overdrive Buzzer (Final Showdown)\nFormat: Solo (Head-to-Head Finale)\n- Live individual buzzer battle featuring rapid-fire logic traps, code analysis, and algorithmic sprints with point deductions for wrong answers.",
    rules: [
      "Only college students are allowed to participate, and they must bring a valid proof of identification (college ID).",
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
    registrationEndsAt: REGISTRATION_ENDS_ISO,
    registrationOpen: true,
    imageUrl: null,
  },
  {
    id: "fifa",
    index: "03",
    order: 3,
    category: "Gaming",
    name: "FC 26",
    shortName: "FC 26",
    tag: "Digital football battle.",
    format: "1v1",
    fee: "₹100",
    feeNumeric: 100,
    capacity: 1,
    teamSize: "1 Participant",
    difficulty: 2,
    color: "#4FA3E3",
    duration: "2 x 5 Min Halves",
    description:
      "One-on-one football knockout. Pick your club, beat your rival, lift the cup.",
    rules: [
      "Only college students are allowed to participate, and they must bring a valid proof of identification (college ID).",
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
    registrationEndsAt: REGISTRATION_ENDS_ISO,
    registrationOpen: true,
    imageUrl: null,
  },
  {
    id: "bgmi",
    index: "04",
    order: 4,
    category: "Gaming",
    name: "BGMI",
    shortName: "BGMI",
    tag: "Squad up. Drop in. Survive.",
    format: "Team / Squad",
    fee: "₹300 / team",
    feeNumeric: 300,
    capacity: 5,
    teamSize: "4 - 5 Participants (4 Main + 1 Substitute)",
    difficulty: 4,
    color: "#E8963C",
    duration: "3 Matches",
    description:
      "Drop into the battleground with your squad. Last team standing takes it all.",
    rules: [
      "Only college students are allowed to participate, and they must bring a valid proof of identification (college ID).",
      "Squad size of 4 players + 1 optional substitute.",
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
    registrationEndsAt: REGISTRATION_ENDS_ISO,
    registrationOpen: true,
    imageUrl: null,
  },
]

export const EVENT_ROUNDS: Record<string, Array<{title: string; content: string}>> = {
  "dual-debug": [
    { title: "Round 1: The Swap Challenge", content: "Format: Duo (Person A & Person B)\\nTotal Time: 65 Minutes (30m Coding + 5m Handoff + 30m Coding)\\nProblem Set: 6 Problem Statements (3 for Person A, 3 for Person B)\\nStructure:\\n- Phase 1 — Independent Coding (30 mins): Separate machines, strict silence rule.\\n- Phase 2 — The Handoff Break (5 mins): Strategy break to explain logic and progress.\\n- Phase 3 — The Swap (30 mins): Swap machines and complete/optimize partner's code." },
    { title: "Round 2: CodoPoly", content: "Format: Duo (Custom Board Strategy)\\nGameplay:\\n- Matches played in groups (4 teams per match)\\n- Monopoly-style board mechanics paired with coding tasks, resource management, and problem solving." },
    { title: "Round 3: Snakes & Ladders (Snakes & Treasure)", content: "Format: Duo (Life-sized Board or Simulator)\\nSetup: 100-step custom board + life-sized dice; each team starts with 1 Key\\nGameplay:\\n- Dice roll determines task difficulty (1 = Easiest --> 6 = Hardest) to reverse engineer code/outputs.\\n- Ladder Spot: Location clue leading to a Golden Key.\\n- Snake Spot: Lose 1 Key (Reaching 0 keys triggers Rapid-Fire elimination).\\n- Key Utility: Redeemable as Lifelines or Sabotage handicaps against other teams." }
  ],
  "singularity-strike": [
    { title: "Round 1: Quantum Query (Speed Trivia / Quiz)", content: "Format: Solo\\n- Rapid elimination round testing core CS fundamentals, tech trivia, and syntax knowledge under a strict time constraint." },
    { title: "Round 2: Binary Bingo (Logic Matrix)", content: "Format: Solo\\n- Strategic task-matrix challenge where participants solve mini-coding problems or output puzzles to claim squares on their personal grid and complete winning lines." },
    { title: "Round 3: The Overdrive Buzzer (Final Showdown)", content: "Format: Solo (Head-to-Head Finale)\\n- Live individual buzzer battle featuring rapid-fire logic traps, code analysis, and algorithmic sprints with point deductions for wrong answers." }
  ]
};

export interface ScheduleItem {
  date: string // "2026-09-30" — enables grouping/sorting by date
  order: number
  time: string
  title: string
  description: string
}

const SCHEDULE_DATE = "2026-09-30"

export const schedule: ScheduleItem[] = [
  { date: SCHEDULE_DATE, order: 1, time: "09:00 AM", title: "Registrations Open", description: "Kickstart your journey!" },
  { date: SCHEDULE_DATE, order: 2, time: "10:30 AM", title: "Opening Ceremony", description: "Let the battle begin!" },
  { date: SCHEDULE_DATE, order: 3, time: "11:00 AM", title: "Events Start", description: "All arenas go live." },
  { date: SCHEDULE_DATE, order: 4, time: "06:00 PM", title: "Finals", description: "Only the best survive." },
  { date: SCHEDULE_DATE, order: 5, time: "08:00 PM", title: "Prize Distribution", description: "Champions will be crowned." },
]

export const highlights = [
  { title: "Epic Competitions", description: "4 thrilling events across technology & gaming." },
  { title: "Amazing Prizes", description: "Exciting goodies, trophies and more." },
  { title: "Unforgettable Fun", description: "Memories, friends and moments that last." },
  { title: "Unforgettable Memories", description: "Make your mark on Spectrum 5.0." },
]

export type SponsorTier = "Gold Sponsor" | "Silver Sponsor" | "Merch Partner"

export interface Sponsor {
  name: string
  tier: SponsorTier
}

export const sponsors: Sponsor[] = [
  { name: "Tech Byte", tier: "Gold Sponsor" },
  { name: "Devfolio", tier: "Gold Sponsor" },
  { name: "Pixel Labs", tier: "Silver Sponsor" },
  { name: "Code Crafters", tier: "Silver Sponsor" },
  { name: "Geek Gear", tier: "Merch Partner" },
]

export type PartnerTag = "Community Partner" | "Student Partner"

export interface Partner {
  name: string
  tag: PartnerTag
}

export const partners: Partner[] = [
  { name: "GitHub", tag: "Community Partner" },
  { name: "Replit", tag: "Community Partner" },
  { name: "CodeChef", tag: "Community Partner" },
  { name: "MLH", tag: "Student Partner" },
]

export interface TeamMember {
  id?: string
  name: string
  role: string
  group?: "Core" | "Heads" | string
  order?: number
  imageUrl?: string
}

export const team: TeamMember[] = [
  // Faculty Coordinators
  { id: "pradnya-natekar", name: "Ms. Pradnya Natekar", role: "Faculty Coordinator", group: "Faculty", order: 1, imageUrl: "/team/pradnya-natekar.jpeg" },
  { id: "rupali-pawar", name: "Ms. Rupali Pawar", role: "Faculty Coordinator", group: "Faculty", order: 2, imageUrl: "/team/rupali-pawar.jpeg" },

  // Core
  { id: "rudra-rane", name: "Rudra Rane", role: "Mentor", group: "Core", order: 3 },
  { id: "divit-shah", name: "Divit Shah", role: "Mentor", group: "Core", order: 4, imageUrl: "/team/divit-shah.jpeg" },
  { id: "kahaan-kapasi", name: "Kahaan Kapasi", role: "Mentor", group: "Core", order: 5 },
  { id: "dhairya-gandhi", name: "Dhairya Gandhi", role: "President", group: "Core", order: 6, imageUrl: "/team/dhairya-gandhi.jpeg" },
  { id: "asiyah-patel", name: "Asiyah Patel", role: "President", group: "Core", order: 7, imageUrl: "/team/asiyah-patel.jpeg" },
  { id: "darsh-bhagat", name: "Darsh Bhagat", role: "Vice President", group: "Core", order: 8, imageUrl: "/team/darsh-bhagat.jpeg" },

  // Heads
  { id: "pratham-poladia", name: "Pratham Poladia", role: "Tech Head", group: "Heads", order: 9, imageUrl: "/team/pratham-poladia.jpeg" },
  { id: "ishaan-doshi", name: "Ishaan Doshi", role: "Tech Head", group: "Heads", order: 10 },
  { id: "bhumi-choksi", name: "Bhumi Choksi", role: "Creatives Head", group: "Heads", order: 11, imageUrl: "/team/bhumi-chokshi.jpeg" },
  { id: "unnati-thotam", name: "Unnati Thotam", role: "Creatives Head", group: "Heads", order: 12, imageUrl: "/team/unnati-thotam.jpeg" },
  { id: "yatharth-kendule", name: "Yatharth Kendule", role: "EA FC 26 Head", group: "Heads", order: 13, imageUrl: "/team/yatharth-kendule.jpeg" },
  { id: "tatsav-dangasiya", name: "Tatsav Dangasiya", role: "EA FC 26 Head", group: "Heads", order: 14, imageUrl: "/team/tatsav-dangasiya.jpeg" },
  { id: "meet-parekh", name: "Meet Parekh", role: "Marketing Head", group: "Heads", order: 15, imageUrl: "/team/meet-parekh.jpeg" },
  { id: "jheel-patel", name: "Jheel Patel", role: "Marketing Head", group: "Heads", order: 16, imageUrl: "/team/jheel-patel.jpeg" },
  { id: "siya-shah", name: "Siya Shah", role: "Registration Head", group: "Heads", order: 17, imageUrl: "/team/siya-shah.jpeg" },
  { id: "swara-gholap", name: "Swara Gholap", role: "Registration Head", group: "Heads", order: 18, imageUrl: "/team/swara-gholap.jpeg" },
  { id: "ishaan-dave", name: "Ishaan Dave", role: "BGMI Head", group: "Heads", order: 19, imageUrl: "/team/ishaan-dave.jpeg" },
  { id: "keehan-patil", name: "Keehan Patil", role: "BGMI Head", group: "Heads", order: 20, imageUrl: "/team/keehan-patil.jpeg" },
  { id: "chaitanya-jande", name: "Chaitanya Jande", role: "Design Head", group: "Heads", order: 21, imageUrl: "/team/chaitanya-jande.jpeg" },
  { id: "shlok-sheth", name: "Shlok Sheth", role: "Social Media Head", group: "Heads", order: 22, imageUrl: "/team/shlok-sheth.jpeg" },
  { id: "shikha-mehta", name: "Shikha Mehta", role: "Social Media Head", group: "Heads", order: 23, imageUrl: "/team/shikha-mehta.jpeg" },
  { id: "aarna-shah", name: "Aarna Shah", role: "Logistics Head", group: "Heads", order: 24, imageUrl: "/team/aarna-shah.jpeg" },
  { id: "tirth-chheda", name: "Tirth Chheda", role: "Logistics Head", group: "Heads", order: 25, imageUrl: "/team/tirth-chheda.jpeg" },
]

export interface OrganizerInfo {
  institutionName: string
  description: string
  ctaLabel: string
}

export const organizerInfo: OrganizerInfo = {
  institutionName: "SVKM's SBMPCE",
  description:
    "Spectrum 5.0 is organized by the students of SVKM's SBMPCE with the support of faculty and amazing partners.",
  ctaLabel: "Meet the Team",
}

export const faqs = [
  { q: "Who can participate?", a: "Any student with a valid college ID can participate in Spectrum 5.0." },
  { q: "Is there any registration fee?", a: "Yes, each event has its own registration fee — see the event details." },
  { q: "Can I change my team later?", a: "Team changes must be finalized before the registration deadline." },
  { q: "What should I bring?", a: "Your college ID, a charged laptop/phone (for relevant events), and your best energy." },
  { q: "Will there be food?", a: "Yes, refreshments will be available for all registered participants." },
]

export interface WinnerEntry {
  place: "1st" | "2nd" | "3rd"
  teamName: string
}

export interface EventWinners {
  eventId: EventId
  winners: WinnerEntry[]
}

export const currentEditionWinners: EventWinners[] = [
  {
    eventId: "dual-debug",
    winners: [
      { place: "1st", teamName: "Code Commanders" },
      { place: "2nd", teamName: "Debug Ninjas" },
      { place: "3rd", teamName: "Syntax Squad" },
    ],
  },
  {
    eventId: "singularity-strike",
    winners: [
      { place: "1st", teamName: "Nova" },
      { place: "2nd", teamName: "Quantum" },
      { place: "3rd", teamName: "Vertex" },
    ],
  },
  {
    eventId: "bgmi",
    winners: [
      { place: "1st", teamName: "Ghost Squad" },
      { place: "2nd", teamName: "Alpha Wolves" },
      { place: "3rd", teamName: "Shadow Strikers" },
    ],
  },
  {
    eventId: "fc26",
    winners: [
      { place: "1st", teamName: "Rohan V." },
      { place: "2nd", teamName: "Aman K." },
      { place: "3rd", teamName: "Ibrahim S." },
    ],
  },
]

export interface HallOfFameEntry {
  edition: string
  eventName: string
  championTeam: string
}

export const hallOfFame: HallOfFameEntry[] = [
  { edition: "Spectrum 4.0", eventName: "Dual Debug", championTeam: "Code Commanders" },
  { edition: "Spectrum 3.0", eventName: "BGMI Tournament", championTeam: "Ghost Squad" },
  { edition: "Spectrum 2.0", eventName: "FC 25 Showdown", championTeam: "Rohan V." },
  { edition: "Spectrum 1.0", eventName: "Code Clash", championTeam: "Nova" },
]

export interface Edition {
  version: string
  year: string
  theme: string
}

export const previousEditions: Edition[] = [
  { version: "Spectrum 4.0", year: "2024", theme: "Neon Nexus" },
  { version: "Spectrum 3.0", year: "2023", theme: "Retro Rewind" },
  { version: "Spectrum 2.0", year: "2022", theme: "Cyber Circuit" },
  { version: "Spectrum 1.0", year: "2021", theme: "Genesis" },
]

export interface GalleryTile {
  id: string
  caption: string
  imageUrl: string
  gradientFrom: string
  gradientTo: string
}

export const galleryTiles: GalleryTile[] = [
  { id: "g1", caption: "Code Clash Arena", imageUrl: "/gallery/slide1.jpg", gradientFrom: "#EC4B8C", gradientTo: "#8B6FD9" },
  { id: "g2", caption: "Spectrum 4.0 Core Team", imageUrl: "/gallery/slide2.jpg", gradientFrom: "#6FBF5B", gradientTo: "#2A9D6E" },
  { id: "g3", caption: "Spectrum 4.0 Wall of Color", imageUrl: "/gallery/slide3.jpg", gradientFrom: "#E8963C", gradientTo: "#C7382F" },
  { id: "g4", caption: "Interactive Tech Challenge", imageUrl: "/gallery/slide4.jpg", gradientFrom: "#4FA3E3", gradientTo: "#242150" },
  { id: "g5", caption: "Console & FC Showdown", imageUrl: "/gallery/slide5.jpg", gradientFrom: "#C9A227", gradientTo: "#8B6FD9" },
  { id: "g6", caption: "Photo Frame & Faculty Coordinators", imageUrl: "/gallery/slide6.jpg", gradientFrom: "#8B6FD9", gradientTo: "#EC4B8C" },
  { id: "g7", caption: "Faculty Team & Binary Portal", imageUrl: "/gallery/slide7.jpg", gradientFrom: "#2A9D6E", gradientTo: "#6FBF5B" },
  { id: "g8", caption: "Spectrum 4.0 Student Committee", imageUrl: "/gallery/slide8.jpg", gradientFrom: "#C7382F", gradientTo: "#E8963C" },
  { id: "g9", caption: "Faculty & Dignitaries Group", imageUrl: "/gallery/slide9.jpg", gradientFrom: "#242150", gradientTo: "#4FA3E3" },
]

export interface ValueProp {
  title: string
  description: string
}

export const valueProps: ValueProp[] = [
  { title: "Learn", description: "Challenge your skills and learn something new." },
  { title: "Compete", description: "Compete with the best and prove yourself." },
  { title: "Connect", description: "Meet like-minded people and grow." },
]

export interface QuickLink {
  label: string
  description: string
  href: string
  icon: string
}

export const quickLinks: QuickLink[] = [
  { label: "Events", description: "Explore all events", href: "/events", icon: "gamepad" },
  { label: "Schedule", description: "Timeline & agenda", href: "/schedule", icon: "calendar" },
  { label: "Sponsors", description: "Our amazing partners", href: "/more/sponsors", icon: "heart" },
  { label: "Register", description: "Be part of the battle", href: "/register", icon: "swords" },
  { label: "Contact", description: "Get in touch", href: "/more/contact", icon: "mail" },
]

export interface SocialLink {
  platform: string
  href: string
  icon: string
}

export const socialLinks: SocialLink[] = [
  { platform: "Instagram", href: "#", icon: "instagram" },
  { platform: "Discord", href: "#", icon: "message-circle" },
  { platform: "WhatsApp", href: "#", icon: "send" },
  { platform: "X", href: "#", icon: "twitter" },
]

export interface NotificationItem {
  title: string
  body: string
}

export const notifications: NotificationItem[] = [
  { title: "Don't forget!", body: "Registrations close on 25 Sept." },
  { title: "Get Ready!", body: "Exciting prizes await the champions." },
  { title: "Stay Tuned!", body: "More surprises coming your way." },
]

export const venueMapsUrl = "https://maps.google.com/?q=SVKM's+Shri+Bhagubhai+Mafatlal+Polytechnic+Vile+Parle"

export const contact = {
  email: "sbmpspectrum@gmail.com",
  phone: `+91 90046 20948 - Dhairya Gandhi\n+91 90201 95204 - Darsh Bhagat\n+91 86574 78886 - Asiyah Patel`,
  hours: "10:00 AM – 6:00 PM",
  hoursNote: "Outside these hours, enquiries will not be entertained.",
  location: "SVKM's Shri Bhagubhai Mafatlal Polytechnic & College of Engineering",
}

export const nav = [
  { label: "Home", href: "" },
  { label: "Events", href: "events" },
  { label: "Schedule", href: "schedule" },
  { label: "Sponsors", href: "sponsors" },
  { label: "More", href: "more" },
]

// Compatibility contract for the imported multi-theme UI.
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

// ---- Quest Board registration contract (backed by real Firestore writes via
// ---- POST /api/registrations — see lib/validation/registration.ts) ----
export interface SubstitutePlayer {
  name: string
  email: string
  phone: string
  college: string
  year: string
}

export interface QuestFormValues {
  fullName: string
  email: string
  phone: string
  eventId: EventId | ""
  teamName?: string
  teamMembers: string[] // sized to selectedEvent.capacity - 1; [] solo, [x] duo, [x,y,z] squad
  substitute?: SubstitutePlayer
  collegeName: string // optional at validation layer, kept as string (not string|undefined) for controlled inputs
  year: string
  paymentRefId: string // 12-digit UPI transaction reference
  pictureUrl?: string
}

export const questFormDefaults: QuestFormValues = {
  fullName: "",
  email: "",
  phone: "",
  eventId: "",
  teamName: "",
  teamMembers: [],
  substitute: {
    name: "",
    email: "",
    phone: "",
    college: "",
    year: "",
  },
  collegeName: "",
  year: "",
  paymentRefId: "",
  pictureUrl: "",
}
