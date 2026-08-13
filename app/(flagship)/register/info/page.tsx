"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { StepProgress } from "@/components/flagship/StepProgress"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { INK, TEAL, VERMILION, AGED_PAPER, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackFunnelStep } from "@/lib/analytics/track"

const ticketStyle = { background: AGED_PAPER, borderColor: INK, borderWidth: "4px", boxShadow: hoardingShadow }

function Field({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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

export default function RegisterInfoStep() {
  const router = useRouter()
  const { values, setField } = useQuest()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [checking, setChecking] = React.useState(false)

  React.useEffect(() => {
    trackFunnelStep("info")
  }, [])

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

    // Check duplicate email before moving to event step
    setChecking(true)
    try {
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(values.email.trim())}${values.eventId ? `&eventId=${encodeURIComponent(values.eventId)}` : ""}`)
      const data = await res.json()

      if (data.registered) {
        setErrorMsg(data.isDuplicateEvent ? (data.message || "You are already registered for this event with this email.") : "This email address is already registered in the system.")
        return
      }
    } catch {
      // Proceed on network error
    } finally {
      setChecking(false)
    }

    router.push("/register/event")
  }

  return (
    <>
      <PageHeader title="Register" />
      <PageContainer width="narrow">
        <StepProgress step={1} />
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

            <form className={`${questBody.className} flex flex-col gap-4 md:gap-5`} onSubmit={handleNext}>
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
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />

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
    </>
  )
}
