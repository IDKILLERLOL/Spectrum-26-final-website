"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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

export default function RegisterTeamStep() {
  const router = useRouter()
  const { values, setField, selectedEvent } = useQuest()

  const memberCount = Math.max(0, (selectedEvent?.capacity ?? 1) - 1)

  // Generic local state for team members based on memberCount
  const [localMembers, setLocalMembers] = React.useState<Array<{ name: string; email: string; phone: string; college: string; year: string }>>([])

  React.useEffect(() => {
    trackFunnelStep("team", selectedEvent?.id)
  }, [])

  // Initialize and load members
  React.useEffect(() => {
    if (selectedEvent) {
      const count = Math.max(0, selectedEvent.capacity - 1)
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
  }, [selectedEvent])

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
  }, [localMembers, memberCount])

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (memberCount > 0) {
      if (!values.teamName || !values.teamName.trim()) {
        setErrorMsg("Please enter team name.")
        return
      }
      if (!values.collegeName || !values.collegeName.trim()) {
        setErrorMsg("Please enter leader's college name.")
        return
      }
      if (!values.year) {
        setErrorMsg("Please select leader's academic year.")
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
    } else {
      if (!values.collegeName || !values.collegeName.trim()) {
        setErrorMsg("Please enter college name.")
        return
      }
      if (!values.year) {
        setErrorMsg("Please select your academic year.")
        return
      }
    }

    router.push("/register/payment")
  }

  if (!selectedEvent) {
    return (
      <>
        <PageHeader title="Register" />
        <PageContainer width="narrow">
          <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
            <p className={`${questBody.className} text-sm`} style={{ color: INK }}>
              Pick an event first.
            </p>
            <AppButton href="/register/event" className="px-6 py-3 text-sm">
              Choose Battle
            </AppButton>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Register" />
      <PageContainer width="narrow">
        <StepProgress step={3} />
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
                onClick={() => router.push("/register/info")}
                className="flex items-center gap-1 text-xs font-bold underline hover:opacity-80"
                style={{ color: INK }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>

            <form className={`${questBody.className} flex flex-col gap-4 md:gap-5`} onSubmit={handleSubmit}>
              {memberCount > 0 ? (
                <div className="space-y-6">
                  {/* Team Name Input */}
                  <div className="border-2 p-4 bg-white/70" style={{ borderColor: INK, boxShadow: softHoardingShadow }}>
                    <Field
                      label="Team Name *"
                      placeholder="Enter team / squad name"
                      value={values.teamName}
                      onChange={(e) => setField("teamName", e.target.value)}
                    />
                  </div>

                  {/* Leader Card (Member 1) */}
                  <div className="border-2 p-4 bg-white/50" style={{ borderColor: INK, boxShadow: softHoardingShadow }}>
                    <p className={`${questDisplay.className} text-xs uppercase tracking-widest mb-3`} style={{ color: VERMILION }}>
                      Team Leader (Member 1)
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Full Name" value={values.fullName} disabled className="bg-neutral-100/50 opacity-70" />
                      <Field label="Email" value={values.email} disabled className="bg-neutral-100/50 opacity-70" />
                      <Field label="Phone" value={values.phone} disabled className="bg-neutral-100/50 opacity-70" />
                      <Field
                        label="College *"
                        placeholder="Enter college name"
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
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Team Members Cards */}
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
              ) : (
                <>
                  <p className={`${questBody.className} text-xs opacity-60`} style={{ color: INK }}>
                    Solo event — no team members needed.
                  </p>
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
                      className="border-2 p-2 text-sm outline-none font-bold bg-white md:p-3 md:text-base"
                      style={{ borderColor: INK, color: INK, boxShadow: softHoardingShadow }}
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {errorMsg && (
                <p className={`${questBody.className} text-xs font-bold`} style={{ color: VERMILION }}>
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-3 mt-2">
                <AppButton
                  type="button"
                  onClick={() => router.push("/register/info")}
                  className="w-1/3 py-3.5 text-sm md:py-4 md:text-base"
                >
                  Back
                </AppButton>
                <AppButton type="submit" className="w-2/3 py-3.5 text-sm md:py-4 md:text-base">
                  Next
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
