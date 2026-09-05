import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { Card } from "@/components/flagship/Card"
import { NAVY, TEAL, INK } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { Users } from "lucide-react"
import { listTeamMembers, FirestoreTeamMember } from "@/lib/server/firestore-team"

export const dynamic = "force-dynamic"

function getInitials(name: string): string {
  const clean = name.replace(/^(Ms\.|Mr\.|Dr\.|Prof\.)\s+/i, "").trim()
  const parts = clean.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

const TEAM_IMAGE_MAP: Record<string, string> = {
  "aarna shah": "/team/aarna-shah.jpeg",
  "asiyah patel": "/team/asiyah-patel.jpeg",
  "bhumi choksi": "/team/bhumi-chokshi.jpeg",
  "bhumi chokshi": "/team/bhumi-chokshi.jpeg",
  "chaitanya jande": "/team/chaitanya-jande.jpeg",
  "darsh bhagat": "/team/darsh-bhagat.jpeg",
  "dhairya gandhi": "/team/dhairya-gandhi.jpeg",
  "ishaan dave": "/team/ishaan-dave.jpeg",
  "keehan patil": "/team/keehan-patil.jpeg",
  "meet parekh": "/team/meet-parekh.jpeg",
  "parth khambhla": "/team/parth-khambhla.jpeg",
  "shikha mehta": "/team/shikha-mehta.jpeg",
  "shlok sheth": "/team/shlok-sheth.jpeg",
  "tatsav dangasiya": "/team/tatsav-dangasiya.jpeg",
  "tirth chheda": "/team/tirth-chheda.jpeg",
  "tirth chedda": "/team/tirth-chheda.jpeg",
  "unnati thotam": "/team/unnati-thotam.jpeg",
  "yatharth kendule": "/team/yatharth-kendule.jpeg",
}

function MemberCard({ member }: { member: FirestoreTeamMember }) {
  const imgUrl = member.imageUrl || TEAM_IMAGE_MAP[member.name.toLowerCase().trim()]

  return (
    <Card className="flex flex-col items-center gap-3 p-4 text-center">
      {imgUrl ? (
        <div
          className="size-16 overflow-hidden border-2"
          style={{ borderColor: INK }}
        >
          <img
            src={imgUrl}
            alt={member.name}
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`${questDisplay.className} flex size-16 shrink-0 items-center justify-center border-2 text-lg text-white`}
          style={{ background: TEAL, borderColor: INK }}
        >
          {getInitials(member.name)}
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
  )
}

export default async function TeamPage() {
  const members = await listTeamMembers()

  const facultyMembers = members.filter((m) => {
    const g = (m.group || "").toLowerCase()
    const r = (m.role || "").toLowerCase()
    return g.includes("faculty") || r.includes("faculty")
  })
  const coreMembers = members.filter((m) => {
    if (facultyMembers.includes(m)) return false
    const g = (m.group || "").toLowerCase()
    return g === "core" || g === "core team"
  })
  const headMembers = members.filter((m) => {
    if (facultyMembers.includes(m) || coreMembers.includes(m)) return false
    const g = (m.group || "").toLowerCase()
    return (
      g === "heads" ||
      g === "head" ||
      (m.role || "").toLowerCase().includes("head")
    )
  })
  const otherMembers = members.filter(
    (m) =>
      !facultyMembers.includes(m) &&
      !coreMembers.includes(m) &&
      !headMembers.includes(m)
  )

  const hasGroups =
    facultyMembers.length > 0 ||
    coreMembers.length > 0 ||
    headMembers.length > 0

  return (
    <>
      <PageHeader title="Our Team" subtitle="The people behind Spectrum 5.0." />
      <PageContainer width="wide" className="px-5 py-8 md:py-10">
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
        ) : hasGroups ? (
          <div className="flex flex-col gap-10">
            {facultyMembers.length > 0 && (
              <div>
                <div
                  className="flex items-center gap-3 mb-5 border-b-2 pb-2.5"
                  style={{ borderColor: `${INK}20` }}
                >
                  <span className="h-1.5 w-6 bg-[#D97706]" />
                  <h2
                    className={`${questDisplay.className} text-xl md:text-2xl uppercase tracking-wider`}
                    style={{ color: NAVY }}
                  >
                    Faculty Coordinator
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {facultyMembers.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}

            {coreMembers.length > 0 && (
              <div>
                <div
                  className="flex items-center gap-3 mb-5 border-b-2 pb-2.5"
                  style={{ borderColor: `${INK}20` }}
                >
                  <span className="h-1.5 w-6 bg-[#C7382F]" />
                  <h2
                    className={`${questDisplay.className} text-xl md:text-2xl uppercase tracking-wider`}
                    style={{ color: NAVY }}
                  >
                    Core
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {coreMembers.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}

            {headMembers.length > 0 && (
              <div>
                <div
                  className="flex items-center gap-3 mb-5 border-b-2 pb-2.5"
                  style={{ borderColor: `${INK}20` }}
                >
                  <span className="h-1.5 w-6 bg-[#12595B]" />
                  <h2
                    className={`${questDisplay.className} text-xl md:text-2xl uppercase tracking-wider`}
                    style={{ color: NAVY }}
                  >
                    Heads
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {headMembers.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}

            {otherMembers.length > 0 && (
              <div>
                <div
                  className="flex items-center gap-3 mb-5 border-b-2 pb-2.5"
                  style={{ borderColor: `${INK}20` }}
                >
                  <span className="h-1.5 w-6 bg-[#1A1A1A]" />
                  <h2
                    className={`${questDisplay.className} text-xl md:text-2xl uppercase tracking-wider`}
                    style={{ color: NAVY }}
                  >
                    Team
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {otherMembers.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </PageContainer>
    </>
  )
}

