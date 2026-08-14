"use client"

import * as React from "react"
import { Mail, Phone, MapPin } from "lucide-react"
import { contact } from "@/content/spectrum"
import { PageHeader } from "@/components/flagship/PageHeader"
import { AppButton } from "@/components/flagship/AppButton"
import { PageContainer } from "@/components/flagship/PageContainer"
import { NAVY, TEAL, VERMILION, INK } from "@/components/flagship/tokens"
import { questDisplay, questBody } from "@/components/flagship/fonts"

export default function ContactPage() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const fieldStyle: React.CSSProperties = { borderColor: INK, color: INK }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 650))
    setSending(false)
    setSent(true)
  }

  return (
    <>
      <PageHeader title="Get In Touch" subtitle="We'd love to hear from you!" />
      <PageContainer
        width="narrow"
        className="flex flex-col gap-4 px-5 py-4 md:grid md:grid-cols-2 md:items-start md:gap-8 md:py-8"
      >
        {/* Enquiries hoarding board */}
        <div className="border-4 border-dashed p-6 text-center" style={{ borderColor: TEAL, background: "#FFFDF6" }}>
          <p className={`${questDisplay.className} mb-3 text-xs uppercase tracking-widest`} style={{ color: TEAL }}>
            Enquiries
          </p>
          <div className="flex flex-col gap-3 text-left">
            <Row icon={<Mail size={16} color={VERMILION} />} label={contact.email} />
            <Row icon={<Phone size={16} color={VERMILION} />} label={contact.phone} />
            <Row icon={<MapPin size={16} color={VERMILION} />} label={contact.location} />
          </div>
        </div>

        {sent ? (
          <div className="border-4 p-4 text-center" style={{ borderColor: INK, background: "#FFFDF6", boxShadow: `4px 4px 0px ${INK}` }}>
            <p className={questDisplay.className} style={{ color: NAVY, fontSize: "0.95rem" }}>
              Message sent!
            </p>
            <p className={`${questBody.className} text-xs opacity-70`} style={{ color: NAVY }}>
              We&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field label="Your Name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${questBody.className} border-b-2 bg-transparent px-1 py-1.5 text-sm font-bold outline-none`}
                style={fieldStyle}
              />
            </Field>
            <Field label="Email Address">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${questBody.className} border-b-2 bg-transparent px-1 py-1.5 text-sm font-bold outline-none`}
                style={fieldStyle}
              />
            </Field>
            <Field label="Message">
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className={`${questBody.className} resize-none border-b-2 bg-transparent px-1 py-1.5 text-sm font-bold outline-none`}
                style={fieldStyle}
              />
            </Field>
            <AppButton type="submit" disabled={sending} className="mt-1 w-full py-3.5 text-sm">
              {sending ? "Sending…" : "Send Message"}
            </AppButton>
          </form>
        )}
      </PageContainer>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`${questBody.className} text-[10px] font-bold uppercase tracking-wide`} style={{ color: TEAL }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span className={`${questBody.className} text-xs`} style={{ color: NAVY }}>
        {label}
      </span>
    </div>
  )
}
