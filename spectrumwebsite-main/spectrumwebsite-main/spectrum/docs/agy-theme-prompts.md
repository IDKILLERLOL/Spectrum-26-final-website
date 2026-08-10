# Remaining theme prompts — Codex / Gemini / Claude split

3 of 11 themes still need building. The other 8 (`pixel-quest`, `arcade-92`, `holo-deck`, `locker`, `outrun`, `blueprint`, `ukiyo`, `riso-zine`) are done and type-check clean — **do not re-run prompts for those, it will overwrite finished work.**

Suggested split (one theme per tool, run in parallel, each writes to its own isolated folder so there's zero collision risk):

| Theme | Tool | Command |
|---|---|---|
| `side-scroll` | Codex CLI | `codex exec --sandbox workspace-write "<PASTE PROMPT>"` |
| `terminal` | Claude Code CLI (Sonnet) | `claude -p "<PASTE PROMPT>" --model claude-sonnet-5` |
| `desi-retro` | Gemini (via AGY) | `agy -p "<PASTE PROMPT>" --model gemini-3.1-pro-high --mode accept-edits --dangerously-skip-permissions --add-dir /Users/kk/Desktop/spectrum` |

Run all three from the project root:

```bash
cd /Users/kk/Desktop/spectrum
```

All three CLIs are installed on this machine (`codex`, `agy`, `claude`). Reassign freely if you'd rather run any of them elsewhere — the prompt text itself is tool-agnostic, it's just plain instructions to read some files and write code, no AGY-specific syntax in it.

---


## `side-scroll`  — assigned to Codex CLI

```text
You are building ONE theme for a multi-theme college fest website (Spectrum 5.0).
Project root: /Users/kk/Desktop/spectrum

READ FIRST (do not modify these, just read for the contract/reference):
- themes/types.ts — the ThemeModule TypeScript interface every theme must implement exactly.
- content/spectrum.ts — the ONLY source of copy/data (events, schedule, sponsors, contact, site info). Never hardcode text that exists there.
- themes/pixel-quest/index.tsx — a FINISHED reference theme. Copy its patterns: how it uses useCountdown, useReducedMotion, useRegistration/useRegistrationForm from themes/_shared/, how Section wraps each part, how the Dock and per-event Register buttons work. Match this level of polish and completeness, but your visual language must be completely different (see spec below).
- themes/_shared/*.ts(x) — shared hooks you should import and reuse: use-countdown.ts, use-reduced-motion.ts, use-tilt.ts, registration-context.tsx (useRegistration, useRegistrationForm), section.tsx.

YOUR TASK: Replace the contents of themes/side-scroll/index.tsx (currently a generic placeholder) with a fully realized ThemeModule for the world described below. You may split into multiple files inside themes/side-scroll/ (e.g. fonts.ts, Background.tsx, Hero.tsx...) as long as themes/side-scroll/index.tsx default-exports the complete ThemeModule object, matching how themes/pixel-quest/index.tsx does it.

NON-NEGOTIABLE REGISTRATION CONTRACT (a theme that violates this is rejected regardless of visual quality):
1. Dock component: fixed to the bottom of the viewport on every section, min-height 56px, safe-area-inset-bottom aware, NEVER scrolls away. Contains a primary Register action (highest-contrast element in the dock) plus secondary theme-native nav (can be your theme's own nav gimmick — tabs, HUD, pipes, whatever fits the world — but visually secondary to Register).
2. Hero must show a Register action ABOVE THE FOLD (no scrolling required) in addition to the Dock, plus the event date and venue nearby.
3. Register pattern: use the existing convention from pixel-quest — every Register button calls openRegistration(eventId?) from useRegistration(), then smooth-scrolls to `#register` (document.getElementById('register').scrollIntoView(...)). There is ONE dedicated Register section (id="register"), not a modal.
4. The Register section form has EXACTLY 5 fields bound via useRegistrationForm: name, email, phone, college, eventId (select). Do not add or remove fields. Show a submitted/success state when useRegistration().submitted is true (see pixel-quest's Register for the exact pattern), with a "register another" reset link.
5. Every event card in Events must have its own Register button that calls openRegistration(event.id) — i.e. pre-selects that event.
6. No intro/boot/transition animation may block or delay the Dock's Register button being tappable. Keep any such sequence skippable and under ~1.5s.
7. Respect prefers-reduced-motion via the useReducedMotion() hook for any heavy motion (parallax, gyro, continuous loops) — provide a static-but-still-good fallback.
8. Design mobile-first at 390x844. All tap targets >= 44px (Dock register >= 56px tall). Only transform/opacity for animation (GPU-composited), no layout-thrashing properties.
9. Use next/font/google for any custom fonts, imported ONLY within your own themes/side-scroll/ files (never touch app/layout.tsx or any other theme).
10. Read every piece of copy (event names, prices, schedule, sponsors, site name/date/venue, contact info) from content/spectrum.ts. Never hardcode strings that exist there.
11. Do NOT edit: content/spectrum.ts, themes/types.ts, themes/registry.ts, themes/_shared/*, app/*, or any other themes/<other-slug>/ folder. Stay entirely inside themes/side-scroll/.

ThemeModule shape you must default-export (see themes/types.ts for exact types):
{ meta, Background, Dock, Hero, Events, Schedule, About, Sponsors, Register, Contact, Preview }
- Preview: a small LIVE animated miniature of this theme for a "choose your world" chooser grid (renders at roughly 340x220, no page-only assets).

When finished, do a final self-check against the 11 numbered rules above and fix anything that fails. Keep the implementation self-contained and production-quality — this is a real deliverable, not a sketch.

=== YOUR THEME SPEC ===
`side-scroll` — "World 1-1": True 8-bit NES side-scroller. NOT 16-bit, not a cabinet — the differentiator is the layout metaphor: the site scrolls SIDEWAYS.
Palette: hard NES restriction, max 4 colors per element. Sky #5C94FC, brick #C84C0C, ground #E4A672, pipe green #00A800, coin gold #FCBC3C, black outline. No gradients, no anti-aliasing anywhere.
Type: true 8x8 bitmap face (Press Start 2P) at exact 8/16/24px steps only. HUD numerals monospaced zero-padded (e.g. 000400).
Texture: visible 8x8 tile grid — brick blocks, ? blocks, pipes, cloud/bush sprites (same sprite recolored, a real NES trick). Ground is a repeating 2-tile strip. Everything snaps to an 8px grid.
Layout: horizontal snap-scroll, one full-screen "level segment" per section (use CSS scroll-snap-type: x mandatory, or a controlled horizontal transform). A pixel avatar walks left-to-right along the ground as the user swipes/scrolls; sections are gated by pipes (tap a pipe to "enter" that section). The 4 events are `?` blocks floating overhead — tap one and it bounces, spits a coin, and the event panel unfurls. Schedule is the level map with 5 flagpoles. The Register section is styled as the end-of-level flagpole moment.
HUD replaces a conventional header entirely — permanent top bar, NES style: "SPECTRUM x4" (events count) · "SCORE 025000" (the prize pool as a score) · "WORLD 5-0" · a countdown styled as "TIME 30*09".
Motion: strictly 4-frame sprite loops on a ~12fps step timer (use setInterval or a stepped animation, not smooth easing) — coin spin, block bounce, avatar walk cycle, brick-break burst (4 chunks, parabolic, then gone). Add deliberate 8-bit sprite FLICKER when more than 3 sprites would share a scanline row — an authentic touch.
Nav: the pipes themselves are primary navigation; a paused overlay menu opens on tapping "START" in the HUD (this can double as your secondary Dock nav).
Transition in (on first Hero mount): black screen -> "WORLD 5-0" -> avatar sprite -> "x4" -> beat -> level fades up. Must be skippable/instant and never block the Dock.
=== END SPEC ===
```


## `terminal`  — assigned to Claude (Claude Code CLI, Sonnet)

```text
You are building ONE theme for a multi-theme college fest website (Spectrum 5.0).
Project root: /Users/kk/Desktop/spectrum

READ FIRST (do not modify these, just read for the contract/reference):
- themes/types.ts — the ThemeModule TypeScript interface every theme must implement exactly.
- content/spectrum.ts — the ONLY source of copy/data (events, schedule, sponsors, contact, site info). Never hardcode text that exists there.
- themes/pixel-quest/index.tsx — a FINISHED reference theme. Copy its patterns: how it uses useCountdown, useReducedMotion, useRegistration/useRegistrationForm from themes/_shared/, how Section wraps each part, how the Dock and per-event Register buttons work. Match this level of polish and completeness, but your visual language must be completely different (see spec below).
- themes/_shared/*.ts(x) — shared hooks you should import and reuse: use-countdown.ts, use-reduced-motion.ts, use-tilt.ts, registration-context.tsx (useRegistration, useRegistrationForm), section.tsx.

YOUR TASK: Replace the contents of themes/terminal/index.tsx (currently a generic placeholder) with a fully realized ThemeModule for the world described below. You may split into multiple files inside themes/terminal/ (e.g. fonts.ts, Background.tsx, Hero.tsx...) as long as themes/terminal/index.tsx default-exports the complete ThemeModule object, matching how themes/pixel-quest/index.tsx does it.

NON-NEGOTIABLE REGISTRATION CONTRACT (a theme that violates this is rejected regardless of visual quality):
1. Dock component: fixed to the bottom of the viewport on every section, min-height 56px, safe-area-inset-bottom aware, NEVER scrolls away. Contains a primary Register action (highest-contrast element in the dock) plus secondary theme-native nav (can be your theme's own nav gimmick — tabs, HUD, pipes, whatever fits the world — but visually secondary to Register).
2. Hero must show a Register action ABOVE THE FOLD (no scrolling required) in addition to the Dock, plus the event date and venue nearby.
3. Register pattern: use the existing convention from pixel-quest — every Register button calls openRegistration(eventId?) from useRegistration(), then smooth-scrolls to `#register` (document.getElementById('register').scrollIntoView(...)). There is ONE dedicated Register section (id="register"), not a modal.
4. The Register section form has EXACTLY 5 fields bound via useRegistrationForm: name, email, phone, college, eventId (select). Do not add or remove fields. Show a submitted/success state when useRegistration().submitted is true (see pixel-quest's Register for the exact pattern), with a "register another" reset link.
5. Every event card in Events must have its own Register button that calls openRegistration(event.id) — i.e. pre-selects that event.
6. No intro/boot/transition animation may block or delay the Dock's Register button being tappable. Keep any such sequence skippable and under ~1.5s.
7. Respect prefers-reduced-motion via the useReducedMotion() hook for any heavy motion (parallax, gyro, continuous loops) — provide a static-but-still-good fallback.
8. Design mobile-first at 390x844. All tap targets >= 44px (Dock register >= 56px tall). Only transform/opacity for animation (GPU-composited), no layout-thrashing properties.
9. Use next/font/google for any custom fonts, imported ONLY within your own themes/terminal/ files (never touch app/layout.tsx or any other theme).
10. Read every piece of copy (event names, prices, schedule, sponsors, site name/date/venue, contact info) from content/spectrum.ts. Never hardcode strings that exist there.
11. Do NOT edit: content/spectrum.ts, themes/types.ts, themes/registry.ts, themes/_shared/*, app/*, or any other themes/<other-slug>/ folder. Stay entirely inside themes/terminal/.

ThemeModule shape you must default-export (see themes/types.ts for exact types):
{ meta, Background, Dock, Hero, Events, Schedule, About, Sponsors, Register, Contact, Preview }
- Preview: a small LIVE animated miniature of this theme for a "choose your world" chooser grid (renders at roughly 340x220, no page-only assets).

When finished, do a final self-check against the 11 numbered rules above and fix anything that fails. Keep the implementation self-contained and production-quality — this is a real deliverable, not a sketch.

=== YOUR THEME SPEC ===
`terminal` — "Root Access": the whole site is a terminal session. Zero images. Maximum confidence through restraint.
Palette: black #050705, phosphor green #4AF626, amber #FFB000 for warnings/highlights, white for user input, one red reserved for errors/urgency (e.g. countdown final hours).
Type: JetBrains Mono only (next/font/google), one typeface at 2-3 weights. An ASCII-art "SPECTRUM 5.0" banner rendered as preformatted text for the Hero.
Texture: faint scanlines, a soft cursor glow, very subtle screen curvature (radial vignette). Nothing else — no gradients, no images.
Layout: on Hero mount, a boot sequence types out (e.g. "[ OK ] mounting /events", "[ OK ] loading schedule.json"...) using a real typewriter effect (~60 chars/sec) with a blinking block cursor, then settles into a live "prompt" view. Content is framed as command output: `ls /events` lists the 4 events, `cat schedule.txt` shows the timeline, event details render as boxed ASCII/monospace tables (draw borders with box-drawing characters or simple bordered <pre>/<div> blocks). The Register section is framed as `./register --event=<id>`, walking through the 5 fields as sequential prompts OR as one clean form styled like a config file being edited — pick whichever keeps it fast and unambiguous to fill in on mobile (this is still a real usable form, not just decorative).
Motion: typewriter reveal for any new "output," a blinking cursor, progress bars that fill (e.g. for the countdown, or a loading bar for prize pool), an occasional harmless stderr-styled glitch line for flavor (must not read as a real error).
Nav: a command palette — tapping the prompt shows autocomplete chips (events, schedule, sponsors, register); ALSO include a plain persistent tap-menu for non-technical users, since this is your Dock's secondary half — do not make navigation require typing.
Transition in: `ssh spectrum@sbmp.edu` connecting... then "connection established," then the boot sequence. Entire thing skippable with a tap, and never delays the Dock's Register button being usable — render the Dock immediately regardless of boot-sequence progress.
=== END SPEC ===
```


## `desi-retro`  — assigned to Gemini (via AGY)

```text
You are building ONE theme for a multi-theme college fest website (Spectrum 5.0).
Project root: /Users/kk/Desktop/spectrum

READ FIRST (do not modify these, just read for the contract/reference):
- themes/types.ts — the ThemeModule TypeScript interface every theme must implement exactly.
- content/spectrum.ts — the ONLY source of copy/data (events, schedule, sponsors, contact, site info). Never hardcode text that exists there.
- themes/pixel-quest/index.tsx — a FINISHED reference theme. Copy its patterns: how it uses useCountdown, useReducedMotion, useRegistration/useRegistrationForm from themes/_shared/, how Section wraps each part, how the Dock and per-event Register buttons work. Match this level of polish and completeness, but your visual language must be completely different (see spec below).
- themes/_shared/*.ts(x) — shared hooks you should import and reuse: use-countdown.ts, use-reduced-motion.ts, use-tilt.ts, registration-context.tsx (useRegistration, useRegistrationForm), section.tsx.

YOUR TASK: Replace the contents of themes/desi-retro/index.tsx (currently a generic placeholder) with a fully realized ThemeModule for the world described below. You may split into multiple files inside themes/desi-retro/ (e.g. fonts.ts, Background.tsx, Hero.tsx...) as long as themes/desi-retro/index.tsx default-exports the complete ThemeModule object, matching how themes/pixel-quest/index.tsx does it.

NON-NEGOTIABLE REGISTRATION CONTRACT (a theme that violates this is rejected regardless of visual quality):
1. Dock component: fixed to the bottom of the viewport on every section, min-height 56px, safe-area-inset-bottom aware, NEVER scrolls away. Contains a primary Register action (highest-contrast element in the dock) plus secondary theme-native nav (can be your theme's own nav gimmick — tabs, HUD, pipes, whatever fits the world — but visually secondary to Register).
2. Hero must show a Register action ABOVE THE FOLD (no scrolling required) in addition to the Dock, plus the event date and venue nearby.
3. Register pattern: use the existing convention from pixel-quest — every Register button calls openRegistration(eventId?) from useRegistration(), then smooth-scrolls to `#register` (document.getElementById('register').scrollIntoView(...)). There is ONE dedicated Register section (id="register"), not a modal.
4. The Register section form has EXACTLY 5 fields bound via useRegistrationForm: name, email, phone, college, eventId (select). Do not add or remove fields. Show a submitted/success state when useRegistration().submitted is true (see pixel-quest's Register for the exact pattern), with a "register another" reset link.
5. Every event card in Events must have its own Register button that calls openRegistration(event.id) — i.e. pre-selects that event.
6. No intro/boot/transition animation may block or delay the Dock's Register button being tappable. Keep any such sequence skippable and under ~1.5s.
7. Respect prefers-reduced-motion via the useReducedMotion() hook for any heavy motion (parallax, gyro, continuous loops) — provide a static-but-still-good fallback.
8. Design mobile-first at 390x844. All tap targets >= 44px (Dock register >= 56px tall). Only transform/opacity for animation (GPU-composited), no layout-thrashing properties.
9. Use next/font/google for any custom fonts, imported ONLY within your own themes/desi-retro/ files (never touch app/layout.tsx or any other theme).
10. Read every piece of copy (event names, prices, schedule, sponsors, site name/date/venue, contact info) from content/spectrum.ts. Never hardcode strings that exist there.
11. Do NOT edit: content/spectrum.ts, themes/types.ts, themes/registry.ts, themes/_shared/*, app/*, or any other themes/<other-slug>/ folder. Stay entirely inside themes/desi-retro/.

ThemeModule shape you must default-export (see themes/types.ts for exact types):
{ meta, Background, Dock, Hero, Events, Schedule, About, Sponsors, Register, Contact, Preview }
- Preview: a small LIVE animated miniature of this theme for a "choose your world" chooser grid (renders at roughly 340x220, no page-only assets).

When finished, do a final self-check against the 11 numbered rules above and fix anything that fails. Keep the implementation self-contained and production-quality — this is a real deliverable, not a sketch.

=== YOUR THEME SPEC ===
`desi-retro` — "Desi Retro '90s": hand-painted truck art, small-town cinema hoarding, Doordarshan-era nostalgia. Warm, loud, affectionate — never a caricature or mocking tone.
Palette: mustard #E8A13A, jute #D9C9A3, deep teal #12595B, vermilion #C7382F, marigold #F4A300, ink black.
Type: display is a fat brush/hoarding-style face (e.g. Rozha One or Yatra One via next/font/google) — optionally pair with a small Devanagari-style secondary lockup for "SPECTRUM 5.0" IF you can render it correctly and tastefully (a clean font pairing is fine; do not fabricate incorrect Devanagari — if unsure, skip the Devanagari lockup and lean fully on the illustrated/painted English typography instead, which is still authentic to the brief). Body: Mukta.
Texture: khadi/jute weave background texture, distressed hand-painted-wall look (subtle paint-peel edges/gradients), halftone dot pattern on any illustrative blocks (radial-gradient dot grid), hand-painted lorry-ornament style borders (ornate but CSS/SVG-drawn, not photographic), a marigold-garland strung motif across the Hero top edge (simple repeated circular/petal shapes, not a literal photo).
Layout: Hero is styled as a painted cinema hoarding introducing Spectrum 5.0 with bold hand-painted-style event callouts. Events are presented as mela (fair) stalls with a fabric-awning top edge per card (a scalloped/zigzag border). Schedule reads as a school chalkboard timetable (dark green/black board texture, chalk-style type for the times). The Register section is framed as a ration-card/rail-ticket style form, with a rubber "stamp" visual (rotated circular seal) that appears on successful submit.
Motion: a brief Doordarshan-style test-pattern + "tuning bars" loader on first Hero mount (skippable, fast), hand-painted signage that gently sways as if on a rope/hinge (small rotate loop, respects reduced motion), a horizontal marquee ticker somewhere ("Truck-art" horn-please style line) using the site's real info (date/venue), an ink-stamp "thunk" micro-animation on successful registration.
Nav: a rickshaw-flap-styled bottom bar as the Dock's secondary half; a fuller menu can open like a folded newspaper unfolding.
Transition in: old projector reel flicker + light film grain overlay fading to the Hero. Skippable, never blocks Register.
=== END SPEC ===
```
