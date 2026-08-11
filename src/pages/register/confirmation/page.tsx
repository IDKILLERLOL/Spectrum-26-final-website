"use client"

import * as React from "react"
import { motion } from "motion/react"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { INK, TEAL, VERMILION, AGED_PAPER, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackFunnelStep } from "@/lib/analytics/track"

const ticketStyle = { background: AGED_PAPER, borderColor: INK, borderWidth: "4px", boxShadow: hoardingShadow }

export default function RegisterConfirmationPage() {
  const { values, selectedEvent, reset } = useQuest()
  const [showDetails, setShowDetails] = React.useState(false)

  React.useEffect(() => {
    trackFunnelStep("confirmation", selectedEvent?.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageHeader title="Register" back={false} />
      <PageContainer width="narrow">
        <div className="flex flex-col items-center gap-4 px-5 py-8 text-center md:gap-6 md:px-0 md:py-12">
          <div className="relative p-8 w-full max-w-sm md:max-w-md md:p-10" style={ticketStyle}>
            <motion.div
              className={`${questDisplay.className} absolute -top-5 right-1 size-24 rounded-full border-4 flex items-center justify-center bg-transparent z-10 md:-top-6 md:right-2 md:size-28`}
              style={{ borderColor: VERMILION, color: VERMILION, background: AGED_PAPER }}
              initial={{ scale: 2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: -15 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <div
                className="border-2 w-[85%] h-[85%] rounded-full flex flex-col items-center justify-center border-dashed"
                style={{ borderColor: VERMILION }}
              >
                <span className="text-sm uppercase leading-none mt-2 md:text-base">Approved</span>
              </div>
            </motion.div>

            <div className="border-b-4 pb-4 mb-5 flex justify-between items-end md:mb-6" style={{ borderColor: INK }}>
              <div>
                <p className={`${questBody.className} text-[10px] font-bold uppercase tracking-widest md:text-xs`} style={{ color: VERMILION }}>
                  Registration Form
                </p>
                <h2 className={`${questDisplay.className} text-[1.6rem] md:text-2xl`} style={{ color: TEAL }}>
                  Quest Accepted!
                </h2>
              </div>
            </div>

            <p className={`${questBody.className} max-w-xs text-xs text-left md:max-w-none md:text-base`} style={{ color: INK }}>
              You&apos;re all set for the battle. Your payment is pending verification — check your email once it&apos;s confirmed.
            </p>

            <AppButton onClick={() => setShowDetails((s) => !s)} variant="outline" className="mt-4 w-full py-3 text-xs md:py-3.5 md:text-sm">
              {showDetails ? "Hide Details" : "View Details"}
            </AppButton>

            {showDetails && (
              <div className="flex flex-col gap-2 p-4 mt-4 text-left border-2 md:gap-2.5 md:p-5" style={{ borderColor: INK }}>
                <Detail label="Name" value={values.fullName} />
                <Detail label="Email" value={values.email} />
                <Detail label="Event" value={selectedEvent?.name ?? "—"} />
                <Detail label="College" value={values.collegeName} />
                <Detail label="Year" value={values.year} />
                <Detail label="Payment Ref" value={values.paymentRefId} />
              </div>
            )}

            <AppButton href="/" onClick={reset} className="mt-4 w-full py-3.5 text-sm md:py-4 md:text-base">
              Back to Home
            </AppButton>
          </div>
        </div>
      </PageContainer>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className={`${questBody.className} text-[11px] opacity-60 md:text-sm`} style={{ color: INK }}>
        {label}
      </span>
      <span className={`${questBody.className} text-[11px] font-bold md:text-sm`} style={{ color: INK }}>
        {value || "—"}
      </span>
    </div>
  )
}
