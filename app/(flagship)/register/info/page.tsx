"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X } from "lucide-react"
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
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    trackFunnelStep("info")
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErrorMsg(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, WEBP, etc.).")
      return
    }

    if (file.size > 1024 * 1024) {
      setErrorMsg("Image size must be under 1 MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setField("pictureUrl", dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function handleNext(e: React.FormEvent) {
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

              {/* Photo Upload Section */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label className={`${questBody.className} text-[10px] font-bold uppercase md:text-xs`} style={{ color: TEAL }}>
                  Profile Picture (Optional, max 1 MB)
                </label>
                
                {values.pictureUrl ? (
                  <div className="relative flex items-center gap-3 border-2 p-2 bg-white" style={{ borderColor: INK }}>
                    <Image
                      src={values.pictureUrl}
                      alt="Uploaded profile"
                      width={56}
                      height={56}
                      className="size-14 object-cover border"
                      style={{ borderColor: INK }}
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold" style={{ color: INK }}>Photo Uploaded</p>
                      <p className="text-[10px] opacity-70">Ready for ticket profile</p>
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
                      <Upload size={16} color={TEAL} /> Upload Photo (Max 1MB)
                    </button>
                  </div>
                )}
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
