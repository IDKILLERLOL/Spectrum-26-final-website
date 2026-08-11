import { previousEditions } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { NAVY, PINK, INK, CREAM, softHoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function EditionsPage() {
  return (
    <>
      <PageHeader title="Previous Editions" />
      <PageContainer width="narrow">
      <div className="flex flex-col gap-3 px-5 py-4">
        {previousEditions.map((ed) => (
          <Card
            key={ed.version}
            className="flex items-center justify-between border-dashed p-4"
          >
            <div>
              <p className={questDisplay.className} style={{ color: NAVY, fontSize: "0.9rem" }}>
                {ed.version}
              </p>
              <p className={`${questBody.className} text-[11px] italic opacity-70`} style={{ color: NAVY }}>
                {ed.theme}
              </p>
            </div>
            <span
              className={`${questBody.className} border-2 px-2 py-1 text-xs font-bold`}
              style={{ borderColor: INK, background: PINK, color: CREAM, boxShadow: softHoardingShadow }}
            >
              {ed.year}
            </span>
          </Card>
        ))}
        <AppButton href="/more/gallery/memories" className="w-full py-3 text-xs">
          See Memories
        </AppButton>
      </div>
      </PageContainer>
    </>
  )
}
