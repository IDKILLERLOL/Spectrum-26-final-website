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

  React.useEffect(() => {
    trackFunnelStep("info")
  }, [])

  const isValid = values.fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(values.email) && values.phone.trim().length >= 7

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

            <form
              className={`${questBody.className} flex flex-col gap-4 md:gap-5`}
              onSubmit={(e) => {
                e.preventDefault()
                if (isValid) router.push("/register/event")
              }}
            >
              <Field
                label="Full Name"
                required
                placeholder="Enter Full Name"
                value={values.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
              />
              <Field
                label="Email Address"
                required
                type="email"
                placeholder="Enter Email Address"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
              />
              <Field
                label="Phone Number"
                required
                type="tel"
                placeholder="Enter Phone Number"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
              <AppButton type="submit" disabled={!isValid} className="mt-2 w-full py-3.5 text-sm md:py-4 md:text-base">
                Next
              </AppButton>
            </form>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
