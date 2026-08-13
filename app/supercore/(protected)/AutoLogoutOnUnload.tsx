"use client"

import { useEffect } from "react"

export function AutoLogoutOnUnload() {
  useEffect(() => {
    // When the user reloads or navigates away, clear the admin session cookie via beacon/fetch
    const handleUnload = () => {
      document.cookie = "spectrum_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    }

    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [])

  return null
}
