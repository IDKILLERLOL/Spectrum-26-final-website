import { NextResponse } from "next/server"

/**
 * Temporary debug endpoint — returns which env vars are present.
 * Remove after sign-in is working.
 * Access at: /api/admin/debug-env
 */
export async function GET() {
  const vars = {
    ADMIN_GATE_SECRET: !!process.env.ADMIN_GATE_SECRET,
    ADMIN_GATE_PASSWORD: !!process.env.ADMIN_GATE_PASSWORD,
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    APPS_SCRIPT_URL: !!process.env.APPS_SCRIPT_URL,
  }
  return NextResponse.json({ env: vars })
}
