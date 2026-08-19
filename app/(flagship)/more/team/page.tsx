import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { Card } from "@/components/flagship/Card"
import { NAVY, TEAL, INK } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { Users } from "lucide-react"
import { listTeamMembers } from "@/lib/server/firestore-team"

export const dynamic = "force-dynamic"

export default async function TeamPage() {
  const members = await listTeamMembers()

  return (
    <>
      <PageHeader title="Our Team" subtitle="The people behind Spectrum 5.0." />
      <PageContainer width="wide" className="px-5 py-8">
        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div
              className="flex size-16 items-center justify-center rounded-full border-2"
              style={{ borderColor: TEAL }}
            >
              <Users size={28} style={{ color: NAVY }} />
            </div>
            <div
              className="w-full max-w-md border-4 border-dashed p-6 md:p-10"
              style={{ borderColor: TEAL, background: "#FFFDF6" }}
            >
              <h2 className={questDisplay.className} style={{ color: NAVY, fontSize: "1.5rem" }}>
                The Core Team
              </h2>
              <p
                className={`${questBody.className} mt-4 text-center text-sm`}
                style={{ color: NAVY }}
              >
                Our team details will be updated here soon. Stay tuned!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {members.map((member) => (
              <Card key={member.id} className="flex flex-col items-center gap-3 p-4 text-center">
                {member.imageUrl ? (
                  <div
                    className="size-16 overflow-hidden border-2"
                    style={{ borderColor: INK }}
                  >
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`${questDisplay.className} flex size-16 shrink-0 items-center justify-center border-2 text-lg text-white`}
                    style={{ background: TEAL, borderColor: INK }}
                  >
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p
                    className={`${questBody.className} text-sm font-bold leading-tight`}
                    style={{ color: NAVY }}
                  >
                    {member.name}
                  </p>
                  <p
                    className={`${questBody.className} mt-0.5 text-xs opacity-70`}
                    style={{ color: NAVY }}
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

