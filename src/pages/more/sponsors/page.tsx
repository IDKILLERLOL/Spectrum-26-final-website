import { sponsors } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { AppButton } from "@/components/flagship/AppButton"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, VERMILION, TEAL, CREAM, INK, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function SponsorsPage() {
  return (
    <>
      <PageHeader title="Our Sponsors" subtitle="Powered by amazing partners." />
      <PageContainer width="narrow" className="flex flex-col gap-3 px-5 py-4 md:py-8">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-3">
        {sponsors.map((s) => (
          // Signboard nameplate: bordered paper strip, big display name, vermilion tier tag
          <div
            key={s.name}
            className="flex items-center justify-between border-4 px-4 py-3"
            style={{ borderColor: INK, background: "#FFFDF6", boxShadow: hoardingShadow }}
          >
            <span className={questDisplay.className} style={{ color: NAVY, fontSize: "1.1rem" }}>
              {s.name}
            </span>
            <span
              className={`${questBody.className} px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white`}
              style={{ background: VERMILION }}
            >
              {s.tier}
            </span>
          </div>
        ))}
        </div>

        {/* Painted wooden sign CTA */}
        <div
          className="mt-2 flex flex-col items-start gap-2 border-4 p-4"
          style={{ borderColor: INK, background: TEAL, boxShadow: hoardingShadow }}
        >
          <p className={questDisplay.className} style={{ color: CREAM, fontSize: "1rem" }}>
            Want to sponsor Spectrum 5.0?
          </p>
          <p className={`${questBody.className} text-xs opacity-80`} style={{ color: CREAM }}>
            Let&apos;s build something epic together.
          </p>
          <AppButton href="/more/contact" className="mt-1 px-5 py-2.5 text-xs">
            Contact Us
          </AppButton>
        </div>
      </PageContainer>
    </>
  )
}
