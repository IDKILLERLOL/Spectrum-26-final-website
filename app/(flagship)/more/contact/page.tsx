import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { contact } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, TEAL, VERMILION, INK, hoardingShadow } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function ContactPage() {
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.0076211786676!2d72.83446057596001!3d19.106263950325414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9c676018b43%3A0x75f39a04a6217435!2sShri%20Bhagubhai%20Mafatlal%20Polytechnic!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"

  return (
    <>
      <PageHeader title="Venue & Contact" subtitle="Find us in Mumbai or get in touch!" />
      <PageContainer
        width="narrow"
        className="flex flex-col gap-6 px-5 py-6 md:py-10"
      >
        {/* Contact info card */}
        <div
          className="border-4 border-dashed p-6"
          style={{ borderColor: TEAL, background: "#FFFDF6", boxShadow: hoardingShadow }}
        >
          <p
            className={`${questDisplay.className} mb-4 text-xs uppercase tracking-widest text-center md:text-left`}
            style={{ color: TEAL }}
          >
            Enquiries & Venue
          </p>
          <div className="flex flex-col gap-4 text-left">
            <a href={`mailto:${contact.email}`} className="hover:underline w-fit">
              <Row icon={<Mail size={18} color={VERMILION} />} label={contact.email} />
            </a>
            {contact.phone.split("\n").map((phoneNum, index) => {
              const parts = phoneNum.split("-")
              const numberOnly = parts[0].trim()
              const cleanedNumber = numberOnly.replace(/\s+/g, "")
              return (
                <a key={index} href={`tel:${cleanedNumber}`} className="hover:underline w-fit">
                  <Row icon={<Phone size={18} color={VERMILION} />} label={phoneNum} />
                </a>
              )
            })}
            <div className="flex flex-col gap-1">
              <Row icon={<Clock size={18} color={VERMILION} />} label={`Working Hours: ${contact.hours}`} />
              <p className={`${questBody.className} text-xs font-semibold pl-7 text-neutral-500`}>
                * {contact.hoursNote}
              </p>
            </div>
            <Row icon={<MapPin size={18} color={VERMILION} />} label={contact.location} />
          </div>
        </div>

        {/* Embedded Google Map */}
        <div
          className="flex flex-col gap-2 border-4 p-2 bg-white"
          style={{ borderColor: INK, boxShadow: hoardingShadow }}
        >
          <div className="flex items-center justify-between px-2 py-1">
            <span className={`${questDisplay.className} text-xs uppercase tracking-wider`} style={{ color: NAVY }}>
              Google Maps Location
            </span>
            <a
              href="https://maps.app.goo.gl/ShriBhagubhaiMafatlal"
              target="_blank"
              rel="noopener noreferrer"
              className={`${questBody.className} text-[11px] font-bold underline hover:opacity-80`}
              style={{ color: VERMILION }}
            >
              Open in Google Maps ↗
            </a>
          </div>
          <div className="relative w-full h-[320px] md:h-[400px] border-2 border-neutral-900 overflow-hidden">
            <iframe
              title="Shri Bhagubhai Mafatlal Polytechnic Map"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
      <span className={`${questBody.className} text-sm font-bold md:text-base`} style={{ color: NAVY }}>
        {label}
      </span>
    </div>
  )
}
