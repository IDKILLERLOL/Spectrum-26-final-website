import { galleryTiles } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { NAVY, CREAM } from "@/components/flagship/tokens"
import { questBody } from "@/components/flagship/fonts"

export default function GalleryPage() {
  return (
    <>
      <PageHeader title="Gallery" back={false} />
      <PageContainer width="wide">
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {galleryTiles.map((tile) => (
            <Card
              key={tile.id}
              className="relative flex h-28 items-end overflow-hidden p-2"
              style={{ background: `linear-gradient(135deg, ${tile.gradientFrom}, ${tile.gradientTo})` }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage: "radial-gradient(rgba(0,0,0,0.35) 1px, transparent 1.5px)",
                  backgroundSize: "8px 8px",
                }}
              />
              <span
                className={`${questBody.className} relative z-10 text-[10px] font-bold text-white`}
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
              >
                {tile.caption}
              </span>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AppButton href="/more/gallery/editions" variant="outline" className="py-3 text-xs">
            Previous Editions
          </AppButton>
          <AppButton href="/more/gallery/memories" variant="outline" className="py-3 text-xs">
            Memories
          </AppButton>
        </div>
      </div>
      </PageContainer>
    </>
  )
}
