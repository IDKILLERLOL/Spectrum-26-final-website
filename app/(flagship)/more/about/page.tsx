import { site, highlights } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, SKY, GREEN, INK, MARIGOLD } from "@/components/flagship/tokens"
import { questBody } from "@/components/flagship/fonts"

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About Us" subtitle={site.aboutShort} />
      <PageContainer width="narrow" className="flex flex-col gap-4 px-5 py-4 md:py-8">
        <Card className="flex h-32 items-center justify-center" style={{ background: SKY }}>
          <div className="h-16 w-24" style={{ background: GREEN, clipPath: "polygon(10% 0,90% 10%,100% 60%,70% 100%,0 80%)" }} />
        </Card>

        {/* Hoarding panel with rounded corner dot flourish */}
        <div
          className="relative border-4 p-6"
          style={{ borderColor: INK, background: "#FFF9E6", boxShadow: `4px 4px 0px ${INK}` }}
        >
          <span className="absolute -top-1.5 -left-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <span className="absolute -top-1.5 -right-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <span className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <span className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <p className={`${questBody.className} text-sm`} style={{ color: NAVY }}>
            {site.about}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {highlights.map((h) => (
            <div key={h.title} className="relative border-2 bg-white p-3" style={{ borderColor: INK }}>
              <div
                className="absolute -top-2 -left-2 size-4 rounded-full border-2 bg-yellow-400"
                style={{ borderColor: INK }}
              />
              <p className={`${questBody.className} text-xs font-bold`} style={{ color: NAVY }}>
                {h.title}
              </p>
              <p className={`${questBody.className} text-[11px] opacity-70`} style={{ color: NAVY }}>
                {h.description}
              </p>
            </div>
          ))}
        </div>
      </PageContainer>
    </>
  )
}
