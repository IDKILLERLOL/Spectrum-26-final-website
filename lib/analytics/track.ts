"use client"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** No-ops when GA isn't loaded (measurement ID unset, script blocked, SSR). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("event", name, params)
}

export function trackEventCardView(eventId: string, eventName: string) {
  trackEvent("event_card_view", { event_id: eventId, event_name: eventName })
}

export function trackEventCardClick(eventId: string, eventName: string) {
  trackEvent("event_card_click", { event_id: eventId, event_name: eventName })
}

export function trackFunnelStep(step: string, eventId?: string) {
  trackEvent("registration_funnel_step", { step, event_id: eventId })
}

export function trackPaymentBounce(reason: string, eventId?: string) {
  trackEvent("payment_bounce", { reason, event_id: eventId })
}

export function trackAdminLogin(outcome: "success" | "failure") {
  trackEvent("admin_login", { outcome })
}
