"use client"

import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { INK, VERMILION, AGED_PAPER, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

const ticketStyle = { background: AGED_PAPER, borderColor: INK, borderWidth: "4px", boxShadow: hoardingShadow }

export default function QuestBoardPage() {
  const router = useRouter()

  return (
    <>
      <PageHeader title="Quest Board" subtitle="Accept your quest." back={false} />
      <PageContainer width="narrow">
        <div className="flex flex-col items-center gap-5 px-5 py-8 text-center md:gap-6 md:px-0 md:py-12">
          <div className="flex w-full flex-col items-center gap-3 p-6 md:gap-4 md:p-8" style={ticketStyle}>
            <div className="w-full border-b-4 pb-3 mb-1 flex justify-between items-end" style={{ borderColor: INK }}>
              <p className={`${questBody.className} text-[10px] font-bold uppercase tracking-widest md:text-xs`} style={{ color: VERMILION }}>
                Ticket Counter
              </p>
              <span className="text-lg opacity-30 md:text-xl" style={{ color: INK }}>No. 50</span>
            </div>
            <span className="flex size-16 items-center justify-center md:size-20" style={{ background: VERMILION }}>
              <Sparkles size={28} color={AGED_PAPER} />
            </span>
            <h1 className={`${questDisplay.className} text-[1.1rem] md:text-[1.4rem]`} style={{ color: INK }}>
              Spectrum 5.0 Quest
            </h1>
            <p className={`${questBody.className} text-xs md:text-base`} style={{ color: INK }}>
              Join the ultimate battle and become a legend.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <AppButton onClick={() => router.push("/register/info")} className="w-full py-3.5 text-sm md:py-4 md:text-base">
              Accept Quest
            </AppButton>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
