import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, TEAL, INK, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function SponsorsPage() {
  return (
    <>
      <PageHeader title="Our Sponsors" subtitle="Powered by amazing partners." />
      <PageContainer width="narrow" className="flex flex-col items-center justify-center gap-4 px-5 py-12 md:py-20 text-center">
        <div
          className="flex flex-col items-center gap-3 border-4 border-dashed p-10 w-full"
          style={{ borderColor: TEAL, background: "#FFFDF6", boxShadow: hoardingShadow }}
        >
          <p className={questDisplay.className} style={{ color: NAVY, fontSize: "1.4rem" }}>
            Sponsors Coming Soon
          </p>
          <p className={`${questBody.className} text-sm opacity-70 max-w-xs`} style={{ color: INK }}>
            We&apos;re partnering with some amazing organizations. Check back soon!
          </p>
        </div>
      </PageContainer>
    </>
  )
}
