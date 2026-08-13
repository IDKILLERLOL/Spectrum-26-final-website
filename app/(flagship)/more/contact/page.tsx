import React from "react"
import { Mail, Phone, MapPin } from "lucide-react"
import { contact } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, TEAL, VERMILION, INK } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Get In Touch" subtitle="We'd love to hear from you!" />
      <PageContainer width="narrow" className="flex flex-col gap-4 px-5 py-8 md:py-12">
        {/* Enquiries hoarding board */}
        <div
          className="border-4 border-dashed p-8"
          style={{ borderColor: TEAL, background: "#FFFDF6" }}
        >
          <p
            className={`${questDisplay.className} mb-5 text-xs uppercase tracking-widest text-center`}
            style={{ color: TEAL }}
          >
            Enquiries
          </p>
          <div className="flex flex-col gap-4">
            <Row icon={<Mail size={17} color={VERMILION} />} label={contact.email} />
            <Row icon={<Phone size={17} color={VERMILION} />} label={contact.phone} />
            <Row icon={<MapPin size={17} color={VERMILION} />} label={contact.location} />
          </div>
        </div>
      </PageContainer>
    </>
  )
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className={`${questBody.className} text-sm`} style={{ color: NAVY }}>
        {label}
      </span>
    </div>
  )
}
