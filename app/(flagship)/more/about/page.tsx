import { site, highlights } from "@/content/spectrum"
import { Card } from "@/components/flagship/Card"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, SKY, GREEN, INK, MARIGOLD } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About Us" subtitle={site.aboutShort} />
      <PageContainer width="narrow" className="flex flex-col gap-4 px-5 py-4 md:py-8">
        <div className="w-full flex justify-center mb-2">
          <img
            src="/mission-removebg-preview.png"
            alt="Our Mission"
            className="w-full max-w-lg h-auto object-contain"
          />
        </div>

        {/* Hoarding panel with rounded corner dot flourish */}
        <div
          className="relative border-4 p-6"
          style={{ borderColor: INK, background: "#FFF9E6", boxShadow: `4px 4px 0px ${INK}` }}
        >
          <span className="absolute -top-1.5 -left-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <span className="absolute -top-1.5 -right-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <span className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <span className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full border-2" style={{ background: MARIGOLD, borderColor: INK }} />
          <div className="space-y-4 text-left">
            <h2 className={`${questDisplay.className} text-lg md:text-xl font-bold`} style={{ color: NAVY }}>
              About Spectrum 5.0
            </h2>
            <p className={`${questBody.className} text-xs md:text-sm leading-relaxed`} style={{ color: NAVY }}>
              <strong>Spectrum 5.0</strong> is a technical and gaming event designed to bring together students and enthusiasts to showcase their creativity, problem-solving abilities, competitive spirit, and technical skills. The objective of the event is to provide participants with an engaging platform where they can challenge themselves, learn from others, collaborate as a team, and demonstrate their abilities beyond the classroom.
            </p>
            <p className={`${questBody.className} text-xs md:text-sm leading-relaxed`} style={{ color: NAVY }}>
              The event features a diverse range of competitions, including <strong>Dual Debug</strong>, <strong>Singularity Strike</strong>, <strong>FC 26</strong>, and <strong>BGMI</strong>, combining technical challenges with exciting gaming experiences. Participants can expect an energetic and competitive environment filled with opportunities to solve problems, test their skills, communicate effectively, and compete with fellow enthusiasts.
            </p>
            <p className={`${questBody.className} text-xs md:text-sm leading-relaxed`} style={{ color: NAVY }}>
              Through Spectrum 5.0, we aim to promote <strong>innovation, coding, gaming, teamwork, creativity, and technical excellence</strong>. More than just a competition, the event is an opportunity to learn, connect, compete, and push the boundaries of what participants can achieve.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {highlights.map((h) => (
            <div key={h.title} className="relative border-2 bg-white p-3" style={{ borderColor: INK }}>
              <div
                className="absolute -top-2 -left-2 size-4 rounded-full border-2 bg-yellow-400"
                style={{ borderColor: INK }}
              />
              <p className={`${questBody.className} text-xs font-bold`} style={{ color: NAVY }}>
                {h.title}
              </p>
              <p className={`${questBody.className} text-[11px] opacity-70`} style={{ color: NAVY }}>
                {h.description}
              </p>
            </div>
          ))}
        </div>
      </PageContainer>
    </>
  )
}
