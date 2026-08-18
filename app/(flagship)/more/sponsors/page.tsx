import { sponsors as staticSponsors } from "@/content/spectrum"
import { listSponsors } from "@/lib/server/firestore-sponsors"
import { PageHeader } from "@/components/flagship/PageHeader"
import { AppButton } from "@/components/flagship/AppButton"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, VERMILION, TEAL, CREAM, INK, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { isAdminConfigured } from "@/lib/firebase/admin"
import { getSponsorTagLabel } from "@/lib/sponsor-tags"
import {
  Utensils, Shirt, ShoppingBag, Laptop, Music, Camera,
  Coffee, Gift, Megaphone, Zap, Star, Globe, Tag, MapPin
} from "lucide-react"

export const dynamic = "force-dynamic"

// Icon lookup for tag badge rendering (server component)
const TAG_ICON_MAP: Record<string, React.ReactNode> = {
  food:         <Utensils size={10} />,
  clothing:     <Shirt size={10} />,
  accessories:  <ShoppingBag size={10} />,
  tech:         <Laptop size={10} />,
  music:        <Music size={10} />,
  photography:  <Camera size={10} />,
  coffee:       <Coffee size={10} />,
  gifts:        <Gift size={10} />,
  marketing:    <Megaphone size={10} />,
  energy:       <Zap size={10} />,
  premium:      <Star size={10} />,
  media:        <Globe size={10} />,
}

function TagBadge({ tagValue }: { tagValue: string }) {
  const icon = TAG_ICON_MAP[tagValue] ?? <Tag size={10} />
  const label = getSponsorTagLabel(tagValue)

  return (
    <span
      style={{ background: `${TEAL}22`, border: `1px solid ${TEAL}66`, color: TEAL }}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
    >
      {icon}
      {label}
    </span>
  )
}

export default async function SponsorsPage() {
  const isConfigured = isAdminConfigured()
  const dynamicSponsors = isConfigured ? await listSponsors() : []

  const displaySponsors = isConfigured
    ? dynamicSponsors.map((s) => ({
        name: s.name,
        tier: s.fields.tier || s.fields.Tier || "Partner",
        fields: s.fields,
        tags: s.tags || [],
      }))
    : staticSponsors.map((s) => ({
        name: s.name,
        tier: s.tier,
        fields: { tier: s.tier },
        tags: [] as string[],
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
          // All fields except tier
          const extraFields = Object.entries(s.fields || {}).filter(([k]) => k.toLowerCase() !== "tier")

          return (
            <div
              key={s.name}
              className="flex flex-col gap-2 border-4 p-4"
              style={{ borderColor: INK, background: "#FFFDF6", boxShadow: hoardingShadow }}
            >
              <div className="flex items-start justify-between border-b-2 pb-2" style={{ borderColor: INK }}>
                <span className={questDisplay.className} style={{ color: NAVY, fontSize: "1.2rem" }}>
                  {s.name}
                </span>
                <span
                  className={`${questBody.className} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shrink-0`}
                  style={{ background: VERMILION }}
                >
                  {s.tier}
                </span>
              </div>

              {/* Tags */}
              {s.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {s.tags.map((tv) => (
                    <TagBadge key={tv} tagValue={tv} />
                  ))}
                </div>
              )}

              {/* Extra fields (skip tier) */}
              {extraFields.length > 0 && (
                <div className="flex flex-col gap-1 pt-1 text-xs">
                  {extraFields.map(([k, v]) => {
                    const key = k.toLowerCase()
                    const isInstagram = key === "instagram"
                    const isLocation = key === "location"

                    if (isInstagram) {
                      const href = v.startsWith("http") ? v : `https://instagram.com/${v.replace(/^@/, "")}`
                      return (
                        <div key={k} className="flex justify-between items-center">
                          <span className="font-bold uppercase text-[10px] opacity-70" style={{ color: TEAL }}>{k}</span>
                          <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline" style={{ color: "#E1306C" }}>
                            {v}
                          </a>
                        </div>
                      )
                    }

                    if (isLocation) {
                      return (
                        <div key={k} className="flex justify-between items-center">
                          <span className="font-bold uppercase text-[10px] opacity-70" style={{ color: TEAL }}>{k}</span>
                          <a
                            href={v}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                            style={{ borderColor: INK, color: INK, background: "#FFFDF6" }}
                          >
                            <MapPin size={10} />
                            View on Maps
                          </a>
                        </div>
                      )
                    }

                    return (
                      <div key={k} className="flex justify-between items-center">
                        <span className="font-bold uppercase text-[10px] opacity-70" style={{ color: TEAL }}>{k}</span>
                        <span className="font-medium" style={{ color: INK }}>{v}</span>
                      </div>
                    )
                  })}
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
