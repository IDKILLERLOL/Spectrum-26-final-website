import { galleryTiles } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { questBody } from "@/components/flagship/fonts"

export default function GalleryPage() {
  return (
    <>
      <PageHeader title="Gallery" back={false} />
      <PageContainer width="wide">
        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {galleryTiles.map((tile) => (
              <Card
                key={tile.id}
                className="group relative flex h-48 md:h-56 items-end overflow-hidden p-3 border-2 border-black rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
              >
                {/* Background image */}
                <img
                  src={tile.imageUrl}
                  alt={tile.caption}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay gradient for contrast */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90"
                />

                {/* Caption */}
                <span
                  className={`${questBody.className} relative z-10 text-xs md:text-sm font-bold text-white tracking-wide`}
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {tile.caption}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}
