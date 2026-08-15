"use client"

import * as React from "react"
import type { ThemeMeta, ThemeModule } from "../types"
import type { EventId } from "@/content/spectrum"
import { site, events, schedule, highlights, sponsors, contact } from "@/content/spectrum"
import { useCountdown, pad2 } from "./use-countdown"
import { useRegistration, useRegistrationForm } from "./registration-context"
import { Section } from "./section"

/**
 * Factory that assembles a structurally-complete, contract-compliant ThemeModule
 * from just a ThemeMeta + accent. Used as (a) a working placeholder for every
 * theme before its full build lands, and (b) the floor a full build must clear.
 *
 * Register pattern used throughout: every "Register" affordance calls
 * openRegistration(eventId) then smooth-scrolls to #register — there is a single
 * dedicated registration section rather than a modal, which keeps the primary
 * action simple and consistent across very different visual worlds.
 */
export function createPlaceholderTheme(meta: ThemeMeta): ThemeModule {
  const font = { fontFamily: `var(${meta.fontDisplay}, ui-sans-serif)` }
  const [bg, primary, accent, secondary] = meta.swatch

  function goRegister(eventId?: EventId) {
    return () => {
      const el = document.getElementById("register")
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  function RegisterButton({
    eventId,
    className,
    children = "Register Now",
  }: {
    eventId?: EventId
    className?: string
    children?: React.ReactNode
  }) {
    const { openRegistration } = useRegistration()
    return (
      <button
        type="button"
        onClick={() => {
          openRegistration(eventId)
          goRegister(eventId)()
        }}
        className={className}
        style={{ background: accent, color: bg, ...font }}
      >
        {children}
      </button>
    )
  }

  const Background: ThemeModule["Background"] = () => (
    <div
      aria-hidden
      className="fixed inset-0 -z-10"
      style={{
        background: `radial-gradient(120% 100% at 50% 0%, ${secondary}22, ${bg} 60%)`,
      }}
    />
  )

  const Dock: ThemeModule["Dock"] = () => (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t px-3"
      style={{
        background: primary,
        borderColor: `${accent}33`,
        height: "calc(64px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <nav className="flex flex-1 items-center justify-around text-[11px]" style={{ color: `${bg}` , ...font}}>
        {["Home", "Events", "Schedule", "Sponsors"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="opacity-70 transition-opacity active:opacity-100"
          >
            {label}
          </a>
        ))}
      </nav>
      <RegisterButton
        className="flex h-14 min-w-[128px] shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold tracking-wide active:scale-95 transition-transform"
      >
        Register
      </RegisterButton>
    </div>
  )

  const Hero: ThemeModule["Hero"] = () => {
    const cd = useCountdown()
    return (
      <Section id="home" className="flex flex-col items-center justify-center gap-6 px-6 pb-28 pt-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] opacity-70" style={{ color: accent, ...font }}>
          {site.eyebrow}
        </p>
        <h1 className="text-5xl font-black leading-none" style={{ color: primary, ...font }}>
          {site.name}
        </h1>
        <p className="max-w-xs text-sm opacity-80" style={{ color: primary }}>
          {site.tagline} {site.subTagline}
        </p>
        <RegisterButton className="rounded-full px-8 py-4 text-base font-bold active:scale-95 transition-transform">
          Register Now
        </RegisterButton>
        <div
          className="mt-4 grid w-full max-w-xs grid-cols-4 gap-2 rounded-2xl border p-4 text-center"
          style={{ borderColor: `${primary}22` }}
        >
          {[
            ["Days", cd.days],
            ["Hrs", cd.hours],
            ["Min", cd.minutes],
            ["Sec", cd.seconds],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div className="text-xl font-bold tabular-nums" style={{ color: primary }}>
                {pad2(value as number)}
              </div>
              <div className="text-[10px] uppercase opacity-60" style={{ color: primary }}>
                {label}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs opacity-60" style={{ color: primary }}>
          {site.date} · {site.venue}
        </p>
      </Section>
    )
  }

  const Events: ThemeModule["Events"] = () => {
    const [openId, setOpenId] = React.useState<string | null>(null)
    return (
      <Section id="events" className="flex flex-col gap-4 px-5 py-16">
        <h2 className="text-2xl font-black" style={{ color: primary, ...font }}>
          Events Arena
        </h2>
        {events.map((ev) => (
          <div
            key={ev.id}
            className="rounded-2xl border p-4"
            style={{ borderColor: `${ev.color}55`, background: `${ev.color}0f` }}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setOpenId(openId === ev.id ? null : ev.id)}
            >
              <div>
                <span className="text-xs font-bold opacity-60" style={{ color: primary }}>
                  {ev.index}
                </span>
                <h3 className="text-lg font-bold" style={{ color: primary }}>
                  {ev.name}
                </h3>
                <p className="text-xs opacity-70" style={{ color: primary }}>
                  {ev.tag}
                </p>
              </div>
              <div className="text-right text-xs" style={{ color: primary }}>
                <div>{ev.format}</div>
                <div className="font-bold">{ev.fee}</div>
              </div>
            </button>
            {openId === ev.id && (
              <div className="mt-3 space-y-2 border-t pt-3 text-xs" style={{ borderColor: `${ev.color}33`, color: primary }}>
                <p className="opacity-80">{ev.description}</p>
                <ul className="list-disc space-y-1 pl-4 opacity-70">
                  {ev.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <RegisterButton
              eventId={ev.id}
              className="mt-3 w-full rounded-full py-2.5 text-sm font-bold active:scale-95 transition-transform"
            >
              Register for {ev.shortName}
            </RegisterButton>
          </div>
        ))}
      </Section>
    )
  }

  const Schedule: ThemeModule["Schedule"] = () => (
    <Section id="schedule" className="flex flex-col gap-4 px-5 py-16">
      <h2 className="text-2xl font-black" style={{ color: primary, ...font }}>
        Event Timeline
      </h2>
      <ol className="space-y-4 border-l pl-4" style={{ borderColor: `${accent}55` }}>
        {schedule.map((item) => (
          <li key={item.title}>
            <p className="text-xs font-bold" style={{ color: accent }}>
              {item.time}
            </p>
            <p className="text-sm font-bold" style={{ color: primary }}>
              {item.title}
            </p>
            <p className="text-xs opacity-70" style={{ color: primary }}>
              {item.description}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm font-medium" style={{ color: primary }}>
        {site.venue}
      </p>
    </Section>
  )

  const About: ThemeModule["About"] = () => (
    <Section id="about" className="flex flex-col gap-4 px-5 py-16">
      <h2 className="text-2xl font-black" style={{ color: primary, ...font }}>
        About {site.name}
      </h2>
      <p className="text-sm opacity-80" style={{ color: primary }}>
        {site.about}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {highlights.map((h) => (
          <div key={h.title} className="rounded-xl border p-3" style={{ borderColor: `${primary}22` }}>
            <p className="text-sm font-bold" style={{ color: primary }}>
              {h.title}
            </p>
            <p className="text-xs opacity-70" style={{ color: primary }}>
              {h.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )

  const Sponsors: ThemeModule["Sponsors"] = () => (
    <Section id="sponsors" className="flex flex-col gap-4 px-5 py-16">
      <h2 className="text-2xl font-black" style={{ color: primary, ...font }}>
        Our Sponsors
      </h2>
      <div className="flex flex-wrap gap-2">
        {sponsors.map((s) => (
          <span
            key={s.name}
            className="rounded-full border px-4 py-2 text-sm font-medium"
            style={{ borderColor: `${primary}33`, color: primary }}
          >
            {s.name}
          </span>
        ))}
      </div>
    </Section>
  )

  const Register: ThemeModule["Register"] = () => {
    const { preselectedEvent, submitted, submitting, submit, reset } = useRegistration()
    const { values, setField, isValid } = useRegistrationForm(preselectedEvent)

    if (submitted) {
      return (
        <Section id="register" className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <h2 className="text-2xl font-black" style={{ color: primary, ...font }}>
            You&apos;re In!
          </h2>
          <p className="text-sm opacity-70" style={{ color: primary }}>
            Check your email for confirmation details.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs underline opacity-60"
            style={{ color: primary }}
          >
            Register another
          </button>
        </Section>
      )
    }

    return (
      <Section id="register" className="flex flex-col gap-4 px-5 py-16">
        <h2 className="text-2xl font-black" style={{ color: primary, ...font }}>
          Quest Board — Register
        </h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (isValid) submit(values)
          }}
        >
          <input
            required
            placeholder="Full Name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            className="rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: `${primary}33`, color: primary, background: `${bg}` }}
          />
          <input
            required
            type="email"
            placeholder="Email Address"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            className="rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: `${primary}33`, color: primary, background: `${bg}` }}
          />
          <input
            required
            type="tel"
            placeholder="Phone Number"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className="rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: `${primary}33`, color: primary, background: `${bg}` }}
          />
          <input
            required
            placeholder="College Name"
            value={values.college}
            onChange={(e) => setField("college", e.target.value)}
            className="rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: `${primary}33`, color: primary, background: `${bg}` }}
          />
          <select
            required
            value={values.eventId}
            onChange={(e) => setField("eventId", e.target.value as EventId)}
            className="rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: `${primary}33`, color: primary, background: `${bg}` }}
          >
            <option value="">Select Event</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="mt-2 rounded-full py-3.5 text-sm font-bold disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: accent, color: bg, ...font }}
          >
            {submitting ? "Submitting…" : "Accept Quest"}
          </button>
        </form>
      </Section>
    )
  }

  const Contact: ThemeModule["Contact"] = () => (
    <Section id="contact" className="flex flex-col gap-3 px-5 py-16 pb-32">
      <h2 className="text-2xl font-black" style={{ color: primary, ...font }}>
        Get In Touch
      </h2>
      <p className="text-sm opacity-80" style={{ color: primary }}>
        {contact.email}
      </p>
      <p className="text-sm opacity-80" style={{ color: primary }}>
        {contact.phone}
      </p>
      <p className="text-sm opacity-80" style={{ color: primary }}>
        {contact.location}
      </p>
    </Section>
  )

  const Preview: ThemeModule["Preview"] = () => (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-3xl"
      style={{ background: `linear-gradient(160deg, ${bg}, ${secondary}33)` }}
    >
      <p className="text-xl font-black" style={{ color: primary, ...font }}>
        {meta.name}
      </p>
      <p className="text-xs opacity-70" style={{ color: primary }}>
        {meta.tagline}
      </p>
      <div className="mt-2 flex gap-1.5">
        {meta.swatch.map((c) => (
          <span key={c} className="size-3 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </div>
  )

  return { meta, Background, Dock, Hero, Events, Schedule, About, Sponsors, Register, Contact, Preview }
}
