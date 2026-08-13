"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X, ArrowLeft } from "lucide-react"
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
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file for payment screenshot.")
      return
    }

    if (file.size > 1024 * 1024) {
      setErrorMessage("Image size must be under 1 MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setField("pictureUrl", dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) {
      setErrorMessage("Please enter a valid 12-digit UPI transaction reference ID.")
      return
    }
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
              <button
                type="button"
                onClick={() => router.push("/register/team")}
                className="flex items-center gap-1 text-xs font-bold underline hover:opacity-80"
                style={{ color: INK }}
              >
                <ArrowLeft size={14} /> Back
              </button>
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
                  UPI Transaction Reference ID (12 digits) *
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

              {/* Payment Verification Screenshot Upload */}
              <div className="flex flex-col gap-1.5">
                <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
                  Payment Screenshot (Optional, max 1 MB)
                </label>
                
                {values.pictureUrl ? (
                  <div className="relative flex items-center gap-3 border-2 p-2 bg-white" style={{ borderColor: INK }}>
                    <Image
                      src={values.pictureUrl}
                      alt="Payment screenshot"
                      width={56}
                      height={56}
                      className="size-14 object-cover border"
                      style={{ borderColor: INK }}
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold" style={{ color: INK }}>Screenshot Attached</p>
                      <p className="text-[10px] opacity-70">Payment proof ready</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField("pictureUrl", "")}
                      className="p-1 border text-red-600 hover:bg-red-50"
                      style={{ borderColor: INK }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 border-2 border-dashed py-3 px-4 w-full bg-white text-xs font-bold transition-colors hover:bg-neutral-50"
                      style={{ borderColor: INK, color: INK }}
                    >
                      <Upload size={16} color={TEAL} /> Upload Payment Screenshot (Max 1MB)
                    </button>
                  </div>
                )}
              </div>

              {errorMessage && (
                <p className={`${questBody.className} text-xs font-bold`} style={{ color: VERMILION }}>
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-3 mt-2">
                <AppButton
                  type="button"
                  onClick={() => router.push("/register/team")}
                  className="w-1/3 py-3.5 text-sm md:py-4 md:text-base opacity-80"
                >
                  Back
                </AppButton>
                <AppButton type="submit" disabled={!isValid || submitting} className="w-2/3 py-3.5 text-sm md:py-4 md:text-base">
                  {submitting ? "Confirming…" : "Confirm Payment"}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
