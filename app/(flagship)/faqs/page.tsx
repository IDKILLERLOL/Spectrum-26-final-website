"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { faqs } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { INK, TEAL, AGED_PAPER, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <>
      <PageHeader title="FAQs" />
      <PageContainer width="narrow">
        <div className="flex flex-col gap-3 px-5 py-4 md:gap-4 md:px-0 md:py-8">
          {faqs.map((faq, i) => {
            const open = openIndex === i
            return (
              <div
                key={faq.q}
                className="border-2"
                style={{ borderColor: INK, background: AGED_PAPER, boxShadow: softHoardingShadow }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left md:p-5"
                >
                  <span className={`${questDisplay.className} text-[0.95rem] md:text-lg`} style={{ color: INK }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    color={TEAL}
                    className="shrink-0 transition-transform"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {open && (
                  <p
                    className={`${questBody.className} px-4 pb-4 pt-3 text-xs opacity-70 border-t-2 md:px-5 md:pb-5 md:text-sm`}
                    style={{ color: INK, borderColor: `${INK}33` }}
                  >
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </PageContainer>
    </>
  )
}
