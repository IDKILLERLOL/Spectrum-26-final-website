"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { EventId, QuestFormValues } from "@/content/spectrum"
import { questFormDefaults, events as staticEvents } from "@/content/spectrum"

/**
 * Multi-step registration flow for the Quest Board (register/*) pages: name/email/phone
 * -> event select -> team details -> payment -> confirmation, backed by real routes per
 * step so back/forward navigation works naturally. Writes to real Firestore via
 * POST /api/registrations (see lib/server/firestore-registrations.ts for the
 * duplicate-prevention mechanism).
 */
export interface SelectedEvent {
  id: string
  name: string
  capacity: number
  feeNumeric: number
  fee: string
  color: string
}

export type SubmitError = "DUPLICATE" | "VALIDATION" | "UNKNOWN"
export interface SubmitResult {
  ok: boolean
  error?: SubmitError
  message?: string
}

interface QuestContextValue {
  values: QuestFormValues
  setField: <K extends keyof QuestFormValues>(key: K, value: QuestFormValues[K]) => void
  selectedEvent: SelectedEvent | null
  setSelectedEvent: (event: SelectedEvent) => void
  /** With an eventId: preselects it and jumps straight to Step 1 (skips the intro).
   *  Without: goes to the Quest Board intro screen. */
  openQuest: (eventId?: EventId) => void
  submitting: boolean
  submitted: boolean
  submit: () => Promise<SubmitResult>
  reset: () => void
}

const QuestContext = React.createContext<QuestContextValue | null>(null)

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [values, setValues] = React.useState<QuestFormValues>(questFormDefaults)
  const [selectedEvent, setSelectedEventState] = React.useState<SelectedEvent | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  // Auto-sync selectedEvent details from eventId parameter
  React.useEffect(() => {
    if (values.eventId && (!selectedEvent || selectedEvent.id !== values.eventId)) {
      const match = staticEvents.find((e) => e.id === values.eventId)
      if (match) {
        setSelectedEventState({
          id: match.id,
          name: match.name,
          capacity: match.capacity,
          feeNumeric: match.feeNumeric,
          fee: match.fee,
          color: match.color,
        })
      }
    }
  }, [values.eventId, selectedEvent])

  const setField = React.useCallback(
    <K extends keyof QuestFormValues>(key: K, value: QuestFormValues[K]) => {
      setValues((v) => ({ ...v, [key]: value }))
    },
    []
  )

  const setSelectedEvent = React.useCallback((event: SelectedEvent) => {
    setSelectedEventState(event)
    setValues((v) => ({ ...v, eventId: event.id }))
  }, [])

  const openQuest = React.useCallback(
    (eventId?: EventId) => {
      if (eventId) {
        setValues((v) => ({ ...v, eventId }))
        router.push("/register/info")
      } else {
        router.push("/register")
      }
    },
    [router]
  )

  const submit = React.useCallback(async (): Promise<SubmitResult> => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        return { ok: false, error: data?.error ?? "UNKNOWN", message: data?.message }
      }

      setSubmitted(true)
      return { ok: true }
    } catch {
      return { ok: false, error: "UNKNOWN", message: "Network error. Please try again." }
    } finally {
      setSubmitting(false)
    }
  }, [values])

  const reset = React.useCallback(() => {
    setValues(questFormDefaults)
    setSelectedEventState(null)
    setSubmitted(false)
  }, [])

  return (
    <QuestContext.Provider
      value={{ values, setField, selectedEvent, setSelectedEvent, openQuest, submitting, submitted, submit, reset }}
    >
      {children}
    </QuestContext.Provider>
  )
}

export function useQuest() {
  const ctx = React.useContext(QuestContext)
  if (!ctx) throw new Error("useQuest must be used within a QuestProvider")
  return ctx
}
