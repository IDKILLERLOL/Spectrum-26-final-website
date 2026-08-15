import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, TEAL } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { Users } from "lucide-react"

export default function TeamPage() {
  return (
    <>
      <PageHeader title="Our Team" />
      <PageContainer width="narrow" className="flex flex-col items-center gap-6 px-5 py-8 text-center md:py-16">
        <div className="flex size-16 items-center justify-center rounded-full border-2" style={{ borderColor: TEAL }}>
          <Users size={28} style={{ color: NAVY }} />
        </div>

        <div className="w-full border-4 border-dashed p-6 md:p-10" style={{ borderColor: TEAL, background: "#FFFDF6" }}>
          <h2 className={questDisplay.className} style={{ color: NAVY, fontSize: "1.5rem" }}>
            The Core Team
          </h2>
          <p className={`${questBody.className} mt-4 text-center text-sm`} style={{ color: NAVY }}>
            Our team details will be updated here soon. Stay tuned!
          </p>
        </div>
      </PageContainer>
    </>
  )
}
