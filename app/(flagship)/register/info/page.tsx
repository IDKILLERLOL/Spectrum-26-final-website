"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { StepProgress } from "@/components/flagship/StepProgress"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { INK, TEAL, VERMILION, AGED_PAPER, hoardingShadow, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackFunnelStep } from "@/lib/analytics/track"

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"]
const ticketStyle = { background: AGED_PAPER, borderColor: INK, borderWidth: "4px", boxShadow: hoardingShadow }

function EventParamSync() {
  const searchParams = useSearchParams()
  const eventParam = searchParams.get("event")
  const { setSelectedEvent } = useQuest()

  React.useEffect(() => {
    if (eventParam) {
      const { events: staticEvents } = require("@/content/spectrum")
      const match = staticEvents.find((e: any) => e.id === eventParam)
      if (match) {
        setSelectedEvent({
          id: match.id,
          name: match.name,
          capacity: match.capacity,
          feeNumeric: match.feeNumeric,
          fee: match.fee,
          color: match.color,
        })
      }
    }
  }, [eventParam, setSelectedEvent])

  return null
}

function Field({
  label,
  className = "",
  helperText,
  ...inputProps
}: { label: string; helperText?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
        {label}
      </label>
      <input
        {...inputProps}
        className={`border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50 md:py-1.5 md:text-base ${className}`}
        style={{ borderColor: INK, color: INK }}
      />
      {helperText && (
        <p className={`${questBody.className} text-[10px] md:text-xs font-semibold text-neutral-500`}>
          * {helperText}
        </p>
      )}
    </div>
  )
}

export default function RegisterInfoStep() {
  const router = useRouter()
  const { values, setField, selectedEvent } = useQuest()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [checking, setChecking] = React.useState(false)
  const [showSubstituteModal, setShowSubstituteModal] = React.useState(false)

  const isBgmi = selectedEvent?.id?.toLowerCase() === "bgmi"
  // For BGMI: 3 required squad members + 1 optional substitute.
  const memberCount = isBgmi ? 3 : Math.max(0, (selectedEvent?.capacity ?? 1) - 1)
  const [localMembers, setLocalMembers] = React.useState<Array<{ name: string; email: string; phone: string; college: string; year: string }>>([])
  const [substitute, setSubstitute] = React.useState({
    name: values.substitute?.name || "",
    email: values.substitute?.email || "",
    phone: values.substitute?.phone || "",
    college: values.substitute?.college || "",
    year: values.substitute?.year || "",
  })

  React.useEffect(() => {
    trackFunnelStep("info")
  }, [])

  // Initialize and load members
  React.useEffect(() => {
    if (selectedEvent) {
      const count = isBgmi ? 3 : Math.max(0, selectedEvent.capacity - 1)
      const initial = Array.from({ length: count }, (_, i) => {
        try {
          if (values.teamMembers[i]) {
            const parsed = JSON.parse(values.teamMembers[i])
            if (parsed && typeof parsed === "object" && parsed.name) {
              return {
                name: parsed.name || "",
                email: parsed.email || "",
                phone: parsed.phone || "",
                college: parsed.college || "",
                year: parsed.year || "",
              }
            }
          }
        } catch {
          // Ignored
        }
        return { name: "", email: "", phone: "", college: "", year: "" }
      })
      setLocalMembers(initial)
    }
  }, [selectedEvent, isBgmi])

  // Sync back to context
  React.useEffect(() => {
    if (memberCount > 0) {
      const next = localMembers.map((m) => JSON.stringify(m))
      setField("teamMembers", next)
    } else {
      if (values.teamMembers.length !== 0) {
        setField("teamMembers", [])
      }
    }
  }, [localMembers, memberCount, setField, values.teamMembers.length])

  // Sync substitute to context
  React.useEffect(() => {
    if (isBgmi) {
      setField("substitute", substitute)
    }
  }, [substitute, isBgmi, setField])

  async function proceedToPayment() {
    // Check duplicate email and team name before moving to payment step
    setChecking(true)
    try {
      const emailParam = encodeURIComponent(values.email.trim())
      const eventParam = values.eventId ? `&eventId=${encodeURIComponent(values.eventId)}` : ""
      const teamParam = values.teamName ? `&teamName=${encodeURIComponent(values.teamName.trim())}` : ""
      const res = await fetch(`/api/check-email?email=${emailParam}${eventParam}${teamParam}`)
      const data = await res.json()

      if (data.registered) {
        setErrorMsg(data.message || "This email address is already registered in the system.")
        return
      }
    } catch {
      // Proceed on network error
    } finally {
      setChecking(false)
    }

    router.push("/register/payment")
  }

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (!values.fullName.trim() || values.fullName.trim().length < 2) {
      setErrorMsg("Please enter a valid full name.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(values.email)) {
      setErrorMsg("Please enter a valid email address.")
      return
    }

    if (values.phone.trim().length < 7) {
      setErrorMsg("Please enter a valid phone number (at least 7 digits).")
      return
    }

    if (!values.collegeName || !values.collegeName.trim()) {
      setErrorMsg("Please enter your college name.")
      return
    }

    if (!values.year) {
      setErrorMsg("Please select your academic year.")
      return
    }

    if (memberCount > 0) {
      if (!values.teamName || !values.teamName.trim()) {
        setErrorMsg("Please enter team name.")
        return
      }
      for (let i = 0; i < memberCount; i++) {
        const m = localMembers[i]
        if (!m || !m.name.trim() || !m.email.trim() || !m.phone.trim() || !m.college.trim() || !m.year) {
          setErrorMsg(`Please fill in all details for Member ${i + 2}.`)
          return
        }
        if (!m.email.includes("@")) {
          setErrorMsg(`Please enter a valid email for Member ${i + 2}.`)
          return
        }
        if (m.phone.trim().length < 7) {
          setErrorMsg(`Please enter a valid phone number for Member ${i + 2}.`)
          return
        }
      }
    }

    // BGMI Substitute player checks
    if (isBgmi) {
      const isSubstituteBlank =
        !substitute.name.trim() &&
        !substitute.email.trim() &&
        !substitute.phone.trim() &&
        !substitute.college.trim() &&
        !substitute.year.trim()

      if (isSubstituteBlank) {
        setShowSubstituteModal(true)
        return
      }

      // If user partially filled substitute, require all fields or clear
      if (
        !substitute.name.trim() ||
        !substitute.email.trim() ||
        !substitute.phone.trim() ||
        !substitute.college.trim() ||
        !substitute.year.trim()
      ) {
        setErrorMsg("Please fill in all details for the Substitute Player (or leave all substitute fields blank).")
        return
      }

      if (!substitute.email.includes("@")) {
        setErrorMsg("Please enter a valid email for the Substitute Player.")
        return
      }

      if (substitute.phone.trim().length < 7) {
        setErrorMsg("Please enter a valid phone number for the Substitute Player.")
        return
      }
    }

    await proceedToPayment()
  }

  if (!selectedEvent) {
    return (
      <>
        <React.Suspense fallback={null}>
          <EventParamSync />
        </React.Suspense>
        <PageHeader title="Register" />
        <PageContainer width="narrow">
          <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
            <p className={`${questBody.className} text-sm`} style={{ color: INK }}>
              Pick an event first.
            </p>
            <AppButton href="/register" className="px-6 py-3 text-sm">
              Choose Battle
            </AppButton>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <React.Suspense fallback={null}>
        <EventParamSync />
      </React.Suspense>
      <PageHeader title="Register" />
      <PageContainer width="narrow">
        <StepProgress step={2} total={3} />
        <div className="px-5 py-6 md:px-0 md:py-10">
          <div className="p-6 md:p-8" style={ticketStyle}>
            <div className="border-b-4 pb-4 mb-5 flex justify-between items-end md:mb-6" style={{ borderColor: INK }}>
              <div>
                <p className={`${questBody.className} text-[10px] font-bold uppercase tracking-widest md:text-xs`} style={{ color: VERMILION }}>
                  Registration Form
                </p>
                <h2 className={`${questDisplay.className} text-[1.6rem] md:text-2xl`} style={{ color: INK }}>
                  Official Ticket
                </h2>
              </div>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="flex items-center gap-1 text-xs font-bold underline hover:opacity-80"
                style={{ color: INK }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>

            <form className={`${questBody.className} flex flex-col gap-4 md:gap-5`} onSubmit={handleNext}>
              {memberCount > 0 && (
                <div className="border-2 p-4 bg-white/70 mb-2" style={{ borderColor: INK, boxShadow: softHoardingShadow }}>
                  <Field
                    label="Team Name *"
                    placeholder="Enter team / squad name"
                    value={values.teamName || ""}
                    onChange={(e) => setField("teamName", e.target.value)}
                  />
                </div>
              )}

              {/* Leader details */}
              <div className="border-2 p-4 bg-white/50" style={{ borderColor: INK, boxShadow: softHoardingShadow }}>
                {memberCount > 0 && (
                  <p className={`${questDisplay.className} text-xs uppercase tracking-widest mb-3`} style={{ color: VERMILION }}>
                    Team Leader (Member 1)
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="Full Name *"
                    placeholder="Enter Full Name"
                    value={values.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                  />
                  <Field
                    label="Email Address *"
                    type="email"
                    placeholder="Enter Email Address"
                    value={values.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                  <Field
                    label="Phone Number *"
                    type="tel"
                    placeholder="Enter Phone Number"
                    helperText="dont put country code (i.e. +91) only numbers allowed"
                    value={values.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                  />
                  <Field
                    label="College Name *"
                    placeholder="Enter College Name"
                    value={values.collegeName}
                    onChange={(e) => setField("collegeName", e.target.value)}
                  />
                  <div className="flex flex-col gap-1">
                    <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
                      Year *
                    </label>
                    <select
                      value={values.year}
                      onChange={(e) => setField("year", e.target.value)}
                      className="border-2 p-1.5 text-sm outline-none font-bold bg-white"
                      style={{ borderColor: INK, color: INK }}
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Team Members details */}
              {memberCount > 0 && (
                <div className="space-y-4">
                  {localMembers.map((member, i) => (
                    <div key={i} className="border-2 p-4 bg-white/50" style={{ borderColor: INK, boxShadow: softHoardingShadow }}>
                      <p className={`${questDisplay.className} text-xs uppercase tracking-widest mb-3`} style={{ color: VERMILION }}>
                        Squad Member {i + 2}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field
                          label="Full Name *"
                          placeholder="Enter name"
                          value={member.name}
                          onChange={(e) => {
                            const next = [...localMembers]
                            next[i] = { ...member, name: e.target.value }
                            setLocalMembers(next)
                          }}
                        />
                        <Field
                          label="Email *"
                          placeholder="Enter email"
                          type="email"
                          value={member.email}
                          onChange={(e) => {
                            const next = [...localMembers]
                            next[i] = { ...member, email: e.target.value }
                            setLocalMembers(next)
                          }}
                        />
                        <Field
                          label="Phone *"
                          placeholder="Enter phone"
                          type="tel"
                          helperText="dont put country code (i.e. +91) only numbers allowed"
                          value={member.phone}
                          onChange={(e) => {
                            const next = [...localMembers]
                            next[i] = { ...member, phone: e.target.value }
                            setLocalMembers(next)
                          }}
                        />
                        <Field
                          label="College *"
                          placeholder="Enter college"
                          value={member.college}
                          onChange={(e) => {
                            const next = [...localMembers]
                            next[i] = { ...member, college: e.target.value }
                            setLocalMembers(next)
                          }}
                        />
                        <div className="flex flex-col gap-1">
                          <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
                            Year *
                          </label>
                          <select
                            value={member.year}
                            onChange={(e) => {
                              const next = [...localMembers]
                              next[i] = { ...member, year: e.target.value }
                              setLocalMembers(next)
                            }}
                            className="border-2 p-1.5 text-sm outline-none font-bold bg-white"
                            style={{ borderColor: INK, color: INK }}
                          >
                            <option value="">Select Year</option>
                            {YEARS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Substitute Player Section for BGMI */}
              {isBgmi && (
                <div className="border-2 p-4 bg-white/50" style={{ borderColor: INK, boxShadow: softHoardingShadow }}>
                  <p className={`${questDisplay.className} text-xs uppercase tracking-widest mb-3`} style={{ color: VERMILION }}>
                    Substitute Player (Optional)
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field
                      label="Full Name (Optional)"
                      placeholder="Enter substitute name (optional)"
                      value={substitute.name}
                      onChange={(e) => setSubstitute((s) => ({ ...s, name: e.target.value }))}
                    />
                    <Field
                      label="Email (Optional)"
                      placeholder="Enter substitute email (optional)"
                      type="email"
                      value={substitute.email}
                      onChange={(e) => setSubstitute((s) => ({ ...s, email: e.target.value }))}
                    />
                    <Field
                      label="Phone (Optional)"
                      placeholder="Enter substitute phone (optional)"
                      type="tel"
                      helperText="dont put country code (i.e. +91) only numbers allowed"
                      value={substitute.phone}
                      onChange={(e) => setSubstitute((s) => ({ ...s, phone: e.target.value }))}
                    />
                    <Field
                      label="College (Optional)"
                      placeholder="Enter substitute college (optional)"
                      value={substitute.college}
                      onChange={(e) => setSubstitute((s) => ({ ...s, college: e.target.value }))}
                    />
                    <div className="flex flex-col gap-1">
                      <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
                        Year (Optional)
                      </label>
                      <select
                        value={substitute.year}
                        onChange={(e) => setSubstitute((s) => ({ ...s, year: e.target.value }))}
                        className="border-2 p-1.5 text-sm outline-none font-bold bg-white"
                        style={{ borderColor: INK, color: INK }}
                      >
                        <option value="">Select Year (Optional)</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {errorMsg && (
                <p className={`${questBody.className} text-xs font-bold`} style={{ color: VERMILION }}>
                  {errorMsg}
                </p>
              )}

              <AppButton type="submit" disabled={checking} className="mt-2 w-full py-3.5 text-sm md:py-4 md:text-base">
                {checking ? "Checking Email…" : "Next"}
              </AppButton>
            </form>
          </div>
        </div>
      </PageContainer>

      {/* Substitute Confirmation Modal */}
      {showSubstituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="relative w-full max-w-md p-6 border-4 md:p-8"
            style={ticketStyle}
          >
            <div className="border-b-4 pb-3 mb-4 flex justify-between items-center" style={{ borderColor: INK }}>
              <p className={`${questDisplay.className} text-sm uppercase tracking-widest`} style={{ color: VERMILION }}>
                Notice
              </p>
            </div>

            <p className={`${questBody.className} text-sm md:text-base font-semibold leading-relaxed mb-6`} style={{ color: INK }}>
              Substitute is optional if you don&apos;t have one continue, else go back.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubstituteModal(false)}
                className="flex items-center gap-1.5 border-2 px-4 py-2 text-xs md:text-sm font-bold uppercase transition-transform hover:-translate-y-0.5"
                style={{ borderColor: INK, background: AGED_PAPER, color: INK, boxShadow: `2px 2px 0px ${INK}` }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubstituteModal(false)
                  proceedToPayment()
                }}
                className="flex items-center gap-1.5 border-2 px-4 py-2 text-xs md:text-sm font-bold uppercase transition-transform hover:-translate-y-0.5"
                style={{ borderColor: INK, background: VERMILION, color: AGED_PAPER, boxShadow: `2px 2px 0px ${INK}` }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
