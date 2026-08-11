import { organizerInfo } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { AppButton } from "@/components/flagship/AppButton"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, VERMILION, TEAL, CREAM } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"
import { Shield } from "lucide-react"

export default function OrganizersPage() {
  return (
    <>
      <PageHeader title="Organizers" />
      <PageContainer width="narrow" className="flex flex-col items-center gap-4 px-5 py-6 text-center md:py-10">
        <span className="flex size-16 items-center justify-center border-2" style={{ background: VERMILION, borderColor: TEAL }}>
          <Shield size={28} color={CREAM} />
        </span>

        {/* Institutional plaque — stamped-document dashed border */}
        <div className="w-full border-4 border-dashed p-5 md:p-8" style={{ borderColor: TEAL, background: "#FFFDF6" }}>
          <h2 className={questDisplay.className} style={{ color: NAVY, fontSize: "1.15rem" }}>
            {organizerInfo.institutionName}
          </h2>
          <p className={`${questBody.className} mt-3 text-left text-xs`} style={{ color: NAVY }}>
            {organizerInfo.description}
          </p>
        </div>

        <AppButton href="/more/team" className="w-full py-3.5 text-sm md:w-auto md:px-10">
          {organizerInfo.ctaLabel}
        </AppButton>
      </PageContainer>
    </>
  )
}
