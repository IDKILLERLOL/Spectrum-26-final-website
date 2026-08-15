import { sponsors as staticSponsors } from "@/content/spectrum"
import { listSponsors } from "@/lib/server/firestore-sponsors"
import { PageHeader } from "@/components/flagship/PageHeader"
import { AppButton } from "@/components/flagship/AppButton"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, VERMILION, TEAL, CREAM, INK, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { isAdminConfigured } from "@/lib/firebase/admin"

export const dynamic = "force-dynamic"

export default async function SponsorsPage() {
  const isConfigured = isAdminConfigured()
  const dynamicSponsors = isConfigured ? await listSponsors() : []
  
  // Format items for display: pull tier from custom fields or fallback
  const displaySponsors = isConfigured
    ? dynamicSponsors.map((s) => ({
        name: s.name,
        tier: s.fields.tier || s.fields.Tier || "Partner",
        fields: s.fields,
      }))
    : staticSponsors.map((s) => ({
        name: s.name,
        tier: s.tier,
        fields: { tier: s.tier },
      }))

  return (
    <>
      <PageHeader title="Our Sponsors" subtitle="Powered by amazing partners." />
      <PageContainer width="narrow" className="flex flex-col gap-3 px-5 py-4 md:py-8">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-3">
        {displaySponsors.length === 0 ? (
          <p className={`${questBody.className} text-sm opacity-60 col-span-2 py-4`}>
            No sponsors listed at the moment.
          </p>
        ) : displaySponsors.map((s) => {
          const extraFields = Object.entries(s.fields || {}).filter(([k]) => k.toLowerCase() !== "tier")

          return (
            <div
              key={s.name}
              className="flex flex-col gap-2 border-4 p-4"
              style={{ borderColor: INK, background: "#FFFDF6", boxShadow: hoardingShadow }}
            >
              <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: INK }}>
                <span className={questDisplay.className} style={{ color: NAVY, fontSize: "1.2rem" }}>
                  {s.name}
                </span>
                <span
                  className={`${questBody.className} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white`}
                  style={{ background: VERMILION }}
                >
                  {s.tier}
                </span>
              </div>

              {extraFields.length > 0 && (
                <div className="flex flex-col gap-1 pt-1 text-xs">
                  {extraFields.map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="font-bold uppercase text-[10px] opacity-70" style={{ color: TEAL }}>{k}</span>
                      <span className="font-medium" style={{ color: INK }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
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
