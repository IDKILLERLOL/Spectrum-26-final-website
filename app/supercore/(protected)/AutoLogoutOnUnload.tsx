"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AutoLogoutOnUnload() {
  const router = useRouter()

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("just_logged_in")
    if (justLoggedIn === "true") {
      // First mount after direct login redirect: keep session, clear flag for future loads
      sessionStorage.removeItem("just_logged_in")
    } else {
      // Subsequent mount (F5 / reload / refresh): force logout and redirect to login
      document.cookie = "spectrum_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
      router.replace("/supercore/login")
    }
  }, [router])

  return null
}
