import Image from "next/image"
import { listTeamMembers } from "@/lib/server/firestore-team"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, VERMILION, TEAL, CREAM, INK, softHoardingShadow, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export const revalidate = 60

export default async function TeamPage() {
  const members = await listTeamMembers()

  return (
    <>
      <PageHeader title="Our Team" subtitle="The minds behind Spectrum 5.0" />
      <PageContainer width="narrow" className="px-5 py-6 md:py-10">
        {members.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 border-4 border-dashed p-10 text-center"
            style={{ borderColor: TEAL, background: "#FFFDF6", boxShadow: hoardingShadow }}
          >
            <p className={questDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
              Team Members Coming Soon
            </p>
            <p className={`${questBody.className} text-sm opacity-70 max-w-xs`} style={{ color: INK }}>
              Our organizing committee will be announced shortly. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
            {members.map((member, i) => (
              <Card key={member.id} className="flex items-center gap-4 p-4">
                {/* Photo or initial badge */}
                {member.imageUrl ? (
                  <div
                    className="relative size-14 shrink-0 overflow-hidden border-2 rounded-md"
                    style={{ borderColor: INK, boxShadow: softHoardingShadow }}
                  >
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <span
                    className={`${questDisplay.className} flex size-14 shrink-0 items-center justify-center border-2 text-sm rounded-md`}
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
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
                <div>
                  <p className={questDisplay.className} style={{ color: NAVY, fontSize: "1.1rem" }}>
                    {member.name}
                  </p>
                  <p
                    className={`${questBody.className} text-xs font-bold uppercase tracking-wide opacity-75`}
                    style={{ color: VERMILION }}
                  >
                    {member.role}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </>
  )
}
