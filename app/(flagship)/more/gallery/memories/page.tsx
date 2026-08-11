import { galleryTiles } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { AppButton } from "@/components/flagship/AppButton"
import { questBody } from "@/components/flagship/fonts"

export default function MemoriesPage() {
  const reversed = [...galleryTiles].reverse()
  return (
    <>
      <PageHeader title="Memories" subtitle="Relive the moments, cherish the memories." />
      <PageContainer width="wide">
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {reversed.map((tile, i) => (
            <Card
              key={tile.id}
              className="relative flex h-24 items-end overflow-hidden p-3"
              style={{
                background: `linear-gradient(${i % 2 === 0 ? "135deg" : "225deg"}, ${tile.gradientFrom}, ${tile.gradientTo})`,
                transform: i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage: "radial-gradient(rgba(0,0,0,0.35) 1px, transparent 1.5px)",
                  backgroundSize: "8px 8px",
                }}
              />
              <span
                className={`${questBody.className} relative z-10 text-xs font-bold text-white`}
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
              >
                {tile.caption}
              </span>
            </Card>
          ))}
        </div>
        <AppButton href="/more/gallery" className="w-full py-3 text-xs">
          Explore Gallery
        </AppButton>
      </div>
      </PageContainer>
    </>
  )
}
