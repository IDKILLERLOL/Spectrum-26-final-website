"use client"

import * as React from "react"
import type { EventId, RegistrationFormValues } from "@/content/spectrum"
import { registrationFormDefaults } from "@/content/spectrum"

/**
 * The one seam between "fake" and "real" registration. Every theme's Register
 * component calls submitRegistration() instead of doing its own fetch/fake logic.
 * Swapping this file's internals for a real API call is the only change needed
 * to go live — no theme code changes.
 */
async function submitRegistration(
  values: RegistrationFormValues
): Promise<{ ok: true }> {
  // Deliberately fake: no backend exists yet. Simulated latency only.
  await new Promise((r) => setTimeout(r, 650))
  return { ok: true }
}

interface RegistrationContextValue {
  isOpen: boolean
  openRegistration: (eventId?: EventId) => void
  closeRegistration: () => void
  preselectedEvent: EventId | ""
  submitted: boolean
  submitting: boolean
  submit: (values: RegistrationFormValues) => Promise<void>
  reset: () => void
}

const RegistrationContext = React.createContext<RegistrationContextValue | null>(null)

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [preselectedEvent, setPreselectedEvent] = React.useState<EventId | "">("")
  const [submitted, setSubmitted] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const openRegistration = React.useCallback((eventId?: EventId) => {
    setPreselectedEvent(eventId ?? "")
    setSubmitted(false)
    setIsOpen(true)
  }, [])

  const closeRegistration = React.useCallback(() => setIsOpen(false), [])

  const submit = React.useCallback(async (values: RegistrationFormValues) => {
    setSubmitting(true)
    try {
      await submitRegistration(values)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }, [])

  const reset = React.useCallback(() => {
    setSubmitted(false)
    setPreselectedEvent("")
  }, [])

  return (
    <RegistrationContext.Provider
      value={{
        isOpen,
        openRegistration,
        closeRegistration,
        preselectedEvent,
        submitted,
        submitting,
        submit,
        reset,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const ctx = React.useContext(RegistrationContext)
  if (!ctx) {
    throw new Error("useRegistration must be used within a RegistrationProvider")
  }
  return ctx
}

export function useRegistrationForm(preselectedEvent: EventId | "") {
  const [values, setValues] = React.useState<RegistrationFormValues>({
    ...registrationFormDefaults,
    eventId: preselectedEvent,
  })

  React.useEffect(() => {
    setValues((v) => ({ ...v, eventId: preselectedEvent }))
  }, [preselectedEvent])

  const setField = React.useCallback(
    <K extends keyof RegistrationFormValues>(key: K, value: RegistrationFormValues[K]) => {
      setValues((v) => ({ ...v, [key]: value }))
    },
    []
  )

  const isValid =
    values.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(values.email) &&
    values.phone.trim().length >= 7 &&
    values.college.trim().length > 1 &&
    values.eventId !== ""

  return { values, setField, isValid }
}
