"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { StepProgress } from "@/components/flagship/StepProgress"
import { AppButton } from "@/components/flagship/AppButton"
import { useQuest } from "@/components/flagship/quest-context"
import { INK, TEAL, VERMILION, AGED_PAPER, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { trackFunnelStep, trackPaymentBounce } from "@/lib/analytics/track"

const ticketStyle = { background: AGED_PAPER, borderColor: INK, borderWidth: "4px", boxShadow: hoardingShadow }

export function RegisterPaymentStepClient({ upiVpa }: { upiVpa: string }) {
  const router = useRouter()
  const { values, setField, selectedEvent, submit, submitting } = useQuest()
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    trackFunnelStep("payment", selectedEvent?.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (!selectedEvent) return
    fetch(`/api/upi-qr?amount=${selectedEvent.feeNumeric}`)
      .then((r) => r.json())
      .then((data) => setQrDataUrl(data.qrDataUrl ?? null))
      .catch(() => setQrDataUrl(null))
  }, [selectedEvent])

  const isValid = /^\d{12}$/.test(values.paymentRefId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setErrorMessage(null)
    const result = await submit()
    if (result.ok) {
      router.push("/register/confirmation")
    } else if (result.error === "DUPLICATE") {
      trackPaymentBounce("duplicate", selectedEvent?.id)
      setErrorMessage("You've already registered for this event with this email.")
    } else {
      trackPaymentBounce(result.error === "VALIDATION" ? "validation" : "unknown", selectedEvent?.id)
      setErrorMessage(result.message ?? "Something went wrong. Please try again.")
    }
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
        <StepProgress step={4} />
        <div className="px-5 py-6 md:px-0 md:py-10">
          <div className="p-6 md:p-8" style={ticketStyle}>
            <div className="border-b-4 pb-4 mb-5 flex justify-between items-end md:mb-6" style={{ borderColor: INK }}>
              <div>
                <p className={`${questBody.className} text-[10px] font-bold uppercase tracking-widest md:text-xs`} style={{ color: VERMILION }}>
                  Registration Form
                </p>
                <h2 className={`${questDisplay.className} text-[1.6rem] md:text-2xl`} style={{ color: INK }}>
                  Pay &amp; Confirm
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mb-6">
              {qrDataUrl ? (
                <Image src={qrDataUrl} alt="UPI payment QR code" width={200} height={200} className="border-2" style={{ borderColor: INK }} unoptimized />
              ) : (
                <div
                  className="flex size-[200px] items-center justify-center border-2 text-center text-xs"
                  style={{ borderColor: INK, color: INK }}
                >
                  {upiVpa ? "Generating QR…" : "QR unavailable — pay via VPA below"}
                </div>
              )}
              <p className={`${questDisplay.className} text-lg`} style={{ color: VERMILION }}>
                ₹{selectedEvent.feeNumeric}
              </p>
              <p className={`${questBody.className} text-xs`} style={{ color: INK }}>
                Pay to: <span className="font-bold">{upiVpa || "—"}</span>
              </p>
            </div>

            <form className={`${questBody.className} flex flex-col gap-4 md:gap-5`} onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
                  UPI Transaction Reference ID (12 digits)
                </label>
                <input
                  required
                  inputMode="numeric"
                  pattern="\d{12}"
                  maxLength={12}
                  placeholder="123456789012"
                  value={values.paymentRefId}
                  onChange={(e) => setField("paymentRefId", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="border-b-2 bg-transparent px-2 py-1 text-sm outline-none font-bold placeholder:opacity-50 md:py-1.5 md:text-base"
                  style={{ borderColor: INK, color: INK }}
                />
              </div>

              {errorMessage && (
                <p className={`${questBody.className} text-xs font-bold`} style={{ color: VERMILION }}>
                  {errorMessage}
                </p>
              )}

              <AppButton type="submit" disabled={!isValid || submitting} className="mt-2 w-full py-3.5 text-sm md:py-4 md:text-base">
                {submitting ? "Confirming…" : "Confirm Payment"}
              </AppButton>
            </form>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
