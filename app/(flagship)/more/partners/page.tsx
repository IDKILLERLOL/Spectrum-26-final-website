import { partners } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, TEAL, INK, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function PartnersPage() {
  return (
    <>
      <PageHeader title="Our Partners" />
      <PageContainer width="narrow" className="px-5 py-4 md:py-8">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-3">
        {partners.map((p) => (
          // Simpler nameplate than sponsors — lighter border/shadow, lower visual weight
          <div
            key={p.name}
            className="flex items-center justify-between border-2 px-4 py-2.5"
            style={{ borderColor: INK, background: "#FFFDF6", boxShadow: softHoardingShadow }}
          >
            <span className={questDisplay.className} style={{ color: NAVY, fontSize: "0.95rem" }}>
              {p.name}
            </span>
            <span
              className={`${questBody.className} text-[9px] font-bold uppercase tracking-wide`}
              style={{ color: TEAL }}
            >
              {p.tag}
            </span>
          </div>
        ))}
        </div>
      </PageContainer>
    </>
  )
}
