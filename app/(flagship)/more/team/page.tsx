import { team } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, VERMILION, TEAL, CREAM, INK, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function TeamPage() {
  return (
    <>
      <PageHeader title="Our Team" />
      <PageContainer width="narrow" className="px-5 py-4 md:py-8">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-3">
          {team.map((member, i) => (
          <Card key={member.name} className="flex items-center gap-3 p-4">
            {/* ID-card style initial badge — hard border, alternating vermilion/teal */}
            <span
              className={`${questDisplay.className} flex size-11 shrink-0 items-center justify-center border-2 text-xs`}
              style={{
                background: i % 2 === 0 ? VERMILION : TEAL,
                color: CREAM,
                borderColor: INK,
                boxShadow: softHoardingShadow,
              }}
            >
              {member.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </span>
            <div>
              <p className={questDisplay.className} style={{ color: NAVY, fontSize: "0.95rem" }}>
                {member.name}
              </p>
              <p
                className={`${questBody.className} text-[10px] font-bold uppercase tracking-wide opacity-70`}
                style={{ color: NAVY }}
              >
                {member.role}
              </p>
            </div>
            </Card>
          ))}
        </div>
      </PageContainer>
    </>
  )
}
