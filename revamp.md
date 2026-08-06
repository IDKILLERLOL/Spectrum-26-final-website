# SPECTRUM 26 — FULL APPLICATION REVAMP PROMPT

> **Context**: Spectrum 26 is a college tech fest web application for **SVKM's Shri Bhagubhai Mafatlal Polytechnic, Irla, Vile Parle West**. It handles public event information, participant registration, team management, UPI payment verification, QR entry passes, scheduling, winner announcements, and a full admin dashboard. The app is built with React + Vite + TypeScript + Firebase (Firestore + Auth).

---

## DESIGN SYSTEM

- **Primary Font**: Bangers (Google Fonts) — used for all headings, event names, hero titles
- **Body Font**: Space Grotesk (Google Fonts)
- **Aesthetic**: Comic-book brutalist with dark mode default, light mode support
- **Primary Color**: Vibrant red (customizable via CSS variable `--color-primary`)
- **Backgrounds**: `--color-bg-base`, `--color-bg-card`, `--color-bg-elevated`
- **Text**: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- **Borders**: `--color-border-default`, `--color-border-strong`
- **Animations**: CSS transitions, Framer Motion for page/card transitions, `expand-in` keyframe for inline panels
- **Audio**: Laser/synth click feedback on key CTA buttons
- **Theme**: Sun/Moon toggle for light/dark mode, persisted to localStorage

---

## GLOBAL CONFIG

| Key | Description |
|-----|-------------|
| `EVENT_DATE` | `2026-09-30T09:00:00+05:30` — Used for live countdown |
| `UPI_ID` | From `.env` `VITE_UPI_ID`, fallback `spectrum26@upi` |
| `HELP_EMAIL` | From `.env` `VITE_HELP_EMAIL`, fallback `spectrum26help@example.com` |
| `SENDER_EMAIL` | From `.env` `VITE_SENDER_EMAIL` |
| `ADMIN_GATE_PASSWORD` | From `.env` `VITE_ADMIN_GATE_PASSWORD` |
| `BOOTSTRAP_ADMIN_EMAIL` | From `.env` `VITE_BOOTSTRAP_ADMIN_EMAIL` |
| `FEST_NAME` | `'SPECTRUM 26'` |

---

## THE 4 EVENTS

### Event 1: Dual Debug
- **Category**: TECH
- **Format**: Duo (Team of exactly 2)
- **Min / Max Players**: 2 / 2
- **Entry Fee**: Rs.150 per person (Rs.300 total per duo)
- **Max Teams**: No cap
- **Registration**: Open
- **Sub-Events**:
  1. **Codopoly** — 2v2v2v2 board game using DSA / Networks / OS / DBMS topic tiles
  2. **Swap Challenge** — Duos each solve coding problems, then swap to solve each other's unsolved challenges
  3. **Snakes & Ladders** — Shared board game: climb ladders by solving easy problems, dodge snakes by answering hard tech challenges

### Event 2: Singularity Strike
- **Category**: TECH
- **Format**: Solo
- **Min / Max Players**: 1 / 1
- **Entry Fee**: Rs.50
- **Max Teams**: No cap
- **Registration**: Open
- **Sub-Events**:
  1. **MCQ Round** — Rapid-fire multiple-choice questions with timer-based scoring
  2. **Bingo** — 4-5 participants share a CS topic grid. Complete a line first to win
  3. **Buzzer Round** — 31 escalating questions, fastest-finger buzzer, wrong answer penalties

### Event 3: BGMI
- **Category**: NON-TECH
- **Format**: Squad
- **Min / Max Players**: 4 / 4
- **Entry Fee**: Rs.800 per person (Rs.3200 total per squad)
- **Max Teams**: 50 (hard cap)
- **Registration**: Open

### Event 4: FC 26
- **Category**: NON-TECH
- **Format**: Solo
- **Min / Max Players**: 1 / 1
- **Entry Fee**: Rs.100
- **Max Teams**: No cap
- **Registration**: Open

---

## ROUTE MAP

### Public Routes (PublicLayout with Navbar + Footer)
| Route | Page |
|-------|------|
| `/` | Landing Page |
| `/events` | Events Page |
| `/schedule` | Schedule Page |
| `/winners` | Winners / Hall of Fame |
| `/login` | Login Page |
| `/contact` | Contact Page |
| `/event/:id` | Public Event Detail |
| `/registrations` | Public Registrations |
| `/pass/:id` | Public Pass Page |
| `/register/:eventId` | Register Page |

### Auth-Protected Routes
| Route | Page |
|-------|------|
| `/my-registrations` | My Registrations (RequireAuth) |
| `/event-dashboard` | Event Detail Dashboard (RequireAuth) |

### Admin Routes (AdminLayout with Sidebar)
| Route | Page |
|-------|------|
| `/admin` | Admin Gate (2-factor: password + Google) |
| `/admin/registrations` | Admin Registrations |
| `/admin/registrations/new` | Admin Create Registration |
| `/admin/registrations/edit/:id` | Admin Edit Registration |
| `/admin/events` | Admin Events |
| `/admin/schedule` | Admin Schedule |
| `/admin/winners` | Admin Winners |
| `/admin/users` | Admin Whitelist |
| `/admin/accounts` | Admin Accounts |
| `/admin/audit-log` | Audit Log |

---

## PAGE SPECIFICATIONS

### Landing Page (/)
**Sections**:
1. SpeedLines Background — animated comic-style diagonal speed lines
2. Hero — "SPECTRUM 26" in Bangers font (~100px, skewed -3deg), subtitle "// CRISIS COMBAT ENGINE READY"
3. Live Countdown — real-time Days/Hours/Minutes/Seconds ticker to Sep 30 2026 09:00 IST
4. VIEW EVENTS CTA button — large, plays laser synth sound, navigates to /events
5. Venue + Contact Section — location from Firestore eventDetails (fallback: SVKM's Shri Bhagubhai Mafatlal Polytechnic, Irla, Vile Parle West), CONTACT US button to /contact
6. Google Maps iframe — pointer-events disabled, hover shows "Open in Google Maps" overlay, click opens in new tab

### Events Page (/events)
**Layout**: Two sections — "TECH COMBATANTS" and "TACTICAL GAMING", each a 2-column card grid

**Event Cards (collapsed)**:
- Category badge + live participant count ("X enlisted") via Firestore aggregation
- Event name (Bangers 32px), description
- DETAILS button → /event/:id
- REGISTER button → /register/:id (shows FULL or CLOSED if unavailable)

**Expanded Card** (Framer Motion AnimatePresence):
- Format / Team Size / Entry Fee grid
- Round mechanics collapsible (tech events)
- Inline registration form

**Inline Registration Form**:
- Team Name (team events)
- Leader: Name*, Email*, Phone*, College*
- Password (guests only)
- Team members: dynamic rows with Name*, Email*, Phone, College, Remove button
- Add Member button (capped at maxMembers-1)
- Duplicate name/email/phone validation
- "Complete Registration" submit → /event-dashboard on success

### Public Event Detail Page (/event/:id)
- Framer Motion shared element animation from EventsPage (layoutId)
- Category badge, Solo/Duo/Squad badge
- Event name, description, info grid (Format/Team Size/Entry Fee)
- Round mechanics collapsible
- Register CTA → /login?redirect=register&eventId=... (or FULL/CLOSED state)
- Loading skeletons + Error state

### Register Page (/register/:eventId)
- Context: "Registering for [EVENT NAME]"
- Form card with border border-border-default
- Live Counter badge ("LIVE COUNTER: X PARTICIPANTS") via Firestore server-side count
- Team Name (team events), Leader details, Team Members (dynamic rows)
- Password field for guests
- Auto-redirect to /pass/:id if already registered
- Pre-fills from Firestore user profile if logged in
- Guest creates Firestore user doc with djb2 hash + anonymous Firebase Auth
- On success → /pass/:newReg.id

### Login Page (/login)
- Google OAuth button
- Email + Password form (custom Firestore-based djb2 auth)
- Redirect intent preserved via ?redirect=register&eventId=X query params
- After login: redirects to intent, /my-registrations, or /

### Profile Page (/profile)
- Edit form: Name, Email, Phone, College + Save Changes button
- Account Meta: Auth Method, Account ID, Sign Out button
- Email change triggers notifyEmailChanged notification

### My Registrations (/my-registrations)
- "YOUR CLEARANCES" badge + "My Panels" heading
- Registration cards: category, event name, team name, payment status badge (PENDING/PAID with icons)
- Click → stores ID in sessionStorage → /event-dashboard
- Empty state: "NO PANELS YET!" + VIEW EVENTS link

### Event Detail Dashboard (/event-dashboard)
**Left Column (8/12) — Team Roster**:
- Team Name block (editable by leader, inline expand)
- "Team Roster" heading + Add Member button (leader only, if under maxMembers)
- Member rows: Name (Bangers), role badge, "(you)" label, email/phone/college
- Per-member actions: Edit, Remove (with confirm), Make Leader (with confirm)
- Inline panels (state machine, one open at a time): Edit form, Remove confirm, Leader confirm, Add Member form
- "Need help with this team?" mailto support link

**Right Column (4/12) — Payment + Entry Pass**:
- Fee display: total (breakdown for teams: Rs.X x N members)
- UPI ID display + Copy button
- Payment QR (qrserver.com, upi://pay?pa=...&am=totalPrice)
- Entry Pass Card (locked if unpaid):
  - Lock icon (or pulsing Clock if UTR submitted)
  - "Entry Pass Locked" / "Payment Pending"
  - Embedded Submit Payment form:
    - UTR/Transaction ID input
    - Screenshot upload (canvas compress to max 800px JPEG 75%)
    - Preview thumbnail + clear button
    - Previous proof display if exists
    - Submit/Update button
- Entry Pass Card (unlocked if paid):
  - QR code → /pass/:id?memberId=...
  - Member ID + Team ID with Expand View popups
  - Hide Pass toggle (EyeOff/Eye)
  - Security modal for reveal
- Admin-only: Toggle fee status PAID/PENDING button

**Email Notifications**: member added/removed, team edited, leadership transferred, fee PAID

### Public Pass Page (/pass/:id)
- No auth required — URL is the credential
- Corner tag: Verified (green) / Unpaid (red)
- Event name + category
- Full roster: name, email, college, role badge
- "Scanned" badge highlights specific member when ?memberId=X matches
- Verification status: green PAID or red PENDING
- Submit Payment Details (if unpaid): UTR input, screenshot upload, preview, submit button
- Footer: Registration ID (masked by default) + Show/Hide toggle

### Schedule Page (/schedule)
- "TIMELINE — SPECTRUM 26" badge + Schedule heading
- Day tab buttons (synth audio on switch)
- ScheduleCards: rotated time badge, location tag, type badge, title
- Data from Firestore, sorted by sortTime + sortOrder
- Empty state + loading skeletons

### Winners / Hall of Fame (/winners)
- Header: "THE CHAMPIONS" + "Hall of Fame"
- Per-event panels:
  - Left (4/12): event name, description, fee/size badges
  - Center (5/12): Podium — 2nd (silver 90px), 1st (gold 130px), 3rd (bronze 70px) — shows team name or "TBA"
  - Right (3/12): "ROSTER" + contender list (first 3 shown, "+N More" expandable)
- Winners from Firestore winners collection

### Contact Page (/contact)
- Registration Desk: email (clickable mailto), phone (clickable tel), hours
- Venue Details: location from Firestore (fallback: SVKM's Bhagubhai Mafatlal Polytechnic)
- Google Maps iframe (click opens in new tab)

### Public Registrations (/registrations)
- Public list of all registrations (team names, event names, member counts)

---

## ADMIN PANEL PAGES

### Admin Gate (/admin)
- 2-factor: Password input → Google OAuth
- Rate limiting + lockout countdown timer
- IP logging via api.ipify.org on failures
- Theme toggle (light/dark)

### Admin Registrations (/admin/registrations)
- Filters: Search, Event, Payment status, Check-in status, Sort
- Sync to Google Sheets button
- Expandable registration rows:
  - Collapsed: ID, event, leader, team name, member count, status badges
  - Expanded: member table, QR code, fee toggle, check-in toggle, delete button
- + New Registration link

### Admin Events (/admin/events)
- Events table with inline Create/Edit/Delete forms
- Fields: Name, Category, isTeamEvent, minMembers, maxMembers, maxTeams, registrationOpen, Price, Description, rulesUrl, roundDetails (array)

### Admin Schedule (/admin/schedule)
- Schedule slot list with inline Create/Edit/Delete
- Slot fields: Day label, date, sortTime, displayTime, Location, Title, Type (TECH/NON_TECH/GENERAL/BREAK), sortOrder
- Event Details panel: event name, venue, date, countdown target, helpline phone/email
- Payment Details panel: UPI ID, QR code URL

### Admin Winners (/admin/winners)
- Per-event, per-placement (1st/2nd/3rd): current winner display or "Not set"
- Inline Select Winner panel: dropdown of all registrations → Save
- Clear (trash) button per placement

### Admin Users / Whitelist (/admin/users)
- List of admin-whitelisted emails with Add/Remove actions

### Admin Accounts (/admin/accounts)
- All user accounts table: email, name, phone, college, auth method, registration count
- Filters: search, with/without registrations
- "Ghost" account detection (account but no registrations)
- Delete account action

### Audit Log (/admin/audit-log)
- Filters: action type, event, team name/reg ID search
- Paginated (7/page), up to 500 entries
- Expandable rows with diffOld/diffNew data
- Sync to Google Sheets button

---

## AUDIT LOG ACTION TYPES (20 total)
REGISTRATION_CREATED, MEMBER_ADDED, MEMBER_REMOVED, MEMBER_EDITED,
LEADERSHIP_TRANSFERRED, FEE_STATUS_CHANGED, CHECKED_IN_TOGGLED,
EVENT_CREATED, EVENT_UPDATED, EVENT_DELETED,
WINNER_RECORDED, WINNER_UPDATED,
ADMIN_ADDED, ADMIN_REMOVED,
PROFILE_UPDATED,
SCHEDULE_CREATED, SCHEDULE_UPDATED, SCHEDULE_DELETED,
GATE_FAILED, UNAUTHORIZED_ADMIN_ATTEMPT

---

## FIRESTORE COLLECTIONS

| Collection | Purpose |
|------------|---------|
| `events` | Event definitions |
| `registrations` | Registration documents |
| `teamMembers` | Individual member records (status: ACTIVE/REMOVED) |
| `users` | User accounts with djb2 password hash |
| `adminWhitelist` | Admin email whitelist |
| `schedule` | Schedule slot documents |
| `eventDetails` | Single doc: event name, date, venue, helpline, countdown |
| `paymentDetails` | Single doc: UPI ID, QR code URL |
| `winners` | Winner records keyed by {eventId}_{placement} |
| `auditLog` | Full system audit trail with diffs and IP |

---

## EMAIL NOTIFICATIONS
- Registration Created: to leader
- Member Added: to new member
- Member Removed: to removed member + team
- Team Edited: to all team members
- Leadership Transferred: to all team members
- Fee set to PAID: to all team members
- Welcome (new Google sign-up): to new user
- Email Changed: to user's new email

---

## KEY SPECIAL FEATURES
- Live countdown timer (Days/Hrs/Mins/Secs) on Landing Page
- Live participant count via Firestore server-side aggregation
- Shared element animation between Events and Event Detail (Framer Motion layoutId)
- Google OAuth + custom djb2 email/password auth
- Guest registration (creates Firestore user doc, anonymous Firebase Auth)
- Payment QR code (UPI deep link, qrserver.com API, auto-includes total amount)
- Entry pass QR code (/pass/:id?memberId=...)
- Payment screenshot canvas compression (max 800px wide, JPEG 75%)
- Public pass page (no auth, URL is credential, scannable at event gate)
- Scanned member highlight via ?memberId= query param
- Inline state machine in EventDetailPage (one panel open at a time)
- Admin two-factor gate (password + Google OAuth)
- Admin lockout with countdown timer + IP logging
- Google Sheets sync for registrations + audit logs
- Ghost account detection in Admin Accounts
- Soft-delete for team members (status: REMOVED)
- All venue/contact/payment details dynamically from Firestore
- 20-action-type audit logging with before/after data diffs
