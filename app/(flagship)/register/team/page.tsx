"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { StepProgress } from "@/components/flagship/StepProgress"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { INK, TEAL, VERMILION, AGED_PAPER, hoardingShadow, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackFunnelStep } from "@/lib/analytics/track"

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

const ticketStyle = { background: AGED_PAPER, borderColor: INK, borderWidth: "4px", boxShadow: hoardingShadow }

function Field({ label, ...inputProps }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
        {label}
      </label>
      <input
        {...inputProps}
        className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50 md:py-1.5 md:text-base"
        style={{ borderColor: INK, color: INK }}
      />
    </div>
  )
}

const MEMBER_LABELS = ["Partner Name", "Member 2 Name", "Member 3 Name"]

export default function RegisterTeamStep() {
  const router = useRouter()
  const { values, setField, selectedEvent } = useQuest()

  const memberCount = Math.max(0, (selectedEvent?.capacity ?? 1) - 1)

  React.useEffect(() => {
    trackFunnelStep("team", selectedEvent?.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    // team members must match the selected event's capacity — resize on entry/change
    if (values.teamMembers.length !== memberCount) {
      const next = [...values.teamMembers]
      next.length = memberCount
      setField("teamMembers", next.map((v) => v ?? ""))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberCount])

  function setMember(index: number, value: string) {
    const next = [...values.teamMembers]
    next[index] = value
    setField("teamMembers", next)
  }

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (memberCount > 0) {
      const missing = values.teamMembers.slice(0, memberCount).some((m) => !m || !m.trim())
      if (missing) {
        setErrorMsg("Please enter all required team member names.")
        return
      }
    }

    if (!values.year) {
      setErrorMsg("Please select your academic year.")
      return
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
              <div className="text-2xl opacity-30 md:text-3xl" style={{ color: INK }}>No. 50</div>
            </div>

            <form className={`${questBody.className} flex flex-col gap-4 md:gap-5`} onSubmit={handleSubmit}>
              {memberCount === 0 && (
                <p className={`${questBody.className} text-xs opacity-60`} style={{ color: INK }}>
                  Solo event — no team members needed.
                </p>
              )}
              {Array.from({ length: memberCount }).map((_, i) => (
                <Field
                  key={i}
                  label={MEMBER_LABELS[i] ?? `Member ${i + 1} Name`}
                  placeholder={`Enter ${MEMBER_LABELS[i] ?? `member ${i + 1}`}`}
                  value={values.teamMembers[i] ?? ""}
                  onChange={(e) => setMember(i, e.target.value)}
                />
              ))}
              <Field
                label="College Name (optional)"
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

              {errorMsg && (
                <p className={`${questBody.className} text-xs font-bold`} style={{ color: VERMILION }}>
                  {errorMsg}
                </p>
              )}

              <AppButton type="submit" className="mt-2 w-full py-3.5 text-sm md:py-4 md:text-base">
                Next
              </AppButton>
            </form>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
