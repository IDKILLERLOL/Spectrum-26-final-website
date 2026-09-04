import "server-only"
import { getDb, isAdminConfigured } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"

import { team as staticTeamMembers } from "@/content/spectrum"

const COLLECTION = "team"

export interface FirestoreTeamMember {
  id: string
  name: string
  role: string
  group: string
  imageUrl: string
  order?: number
  createdAt?: string | null
  updatedAt?: string | null
}

export const TEAM_GROUPS = [
  "Faculty",
  "Faculty Coordinator",
  "Faculty Coordinators",
  "Core",
  "Core Team",
  "Heads",
  "Tech Team",
  "Design Team",
  "Management",
  "Marketing",
  "Logistics",
  "Media",
  "Other",
] as const

export const TEAM_ROLES = [
  "Faculty Coordinator",
  "Mentor",
  "President",
  "Vice President",
  "Chairperson",
  "Vice Chairperson",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Lead",
  "Co-Lead",
  "Head",
  "Co-Head",
  "Member",
  "Volunteer",
] as const

function getStaticFallback(): FirestoreTeamMember[] {
  return staticTeamMembers.map((m, idx) => ({
    id: m.id || `static-${idx}`,
    name: m.name,
    role: m.role,
    group: m.group || "",
    imageUrl: m.imageUrl || "",
    order: m.order ?? idx + 1,
    createdAt: null,
    updatedAt: null,
  }))
}

export async function listTeamMembers(): Promise<FirestoreTeamMember[]> {
  if (!isAdminConfigured()) {
    console.warn("[listTeamMembers] Firebase Admin SDK not configured. Returning static fallback.")
    return getStaticFallback()
  }
  try {
    const snap = await getDb().collection(COLLECTION).get()
    if (snap.empty) return getStaticFallback()
    const members = snap.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || "",
          role: data.role || "",
          group: data.group || "",
          imageUrl: data.imageUrl || "",
          order: data.order ?? 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === "string" ? data.createdAt : null),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (typeof data.updatedAt === "string" ? data.updatedAt : null),
        }
      })
      .sort((a, b) => {
        // 1. Group — follow TEAM_GROUPS order
        const groupOrder = (g: string) => { const i = TEAM_GROUPS.indexOf(g as any); return i === -1 ? 999 : i }
        const gCmp = groupOrder(a.group) - groupOrder(b.group)
        if (gCmp !== 0) return gCmp
        // 2. Priority ascending (lower = shown first)
        if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0)
        // 3. Role — follow TEAM_ROLES order
        const roleOrder = (r: string) => { const i = TEAM_ROLES.indexOf(r as any); return i === -1 ? 999 : i }
        const rCmp = roleOrder(a.role) - roleOrder(b.role)
        if (rCmp !== 0) return rCmp
        // 4. Tiebreaker: createdAt ascending
        return (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
      })
    return members.length > 0 ? members : getStaticFallback()
  } catch (err) {
    console.warn("[listTeamMembers] Firestore error or quota limit reached:", err)
    return getStaticFallback()
  }
}

export async function createTeamMember(input: {
  name: string
  role: string
  group?: string
  imageUrl?: string
  order?: number
}): Promise<string> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()
  const now = Timestamp.now()
  const ref = await db.collection(COLLECTION).add({
    name: input.name.trim(),
    role: input.role.trim(),
    group: input.group?.trim() || "",
    imageUrl: input.imageUrl?.trim() || "",
    order: input.order ?? 0,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateTeamMember(
  id: string,
  input: Partial<{ name: string; role: string; group: string; imageUrl: string; order: number }>
): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  const db = getDb()
  const updateData: Record<string, any> = { updatedAt: Timestamp.now() }
  if (input.name !== undefined) updateData.name = input.name.trim()
  if (input.role !== undefined) updateData.role = input.role.trim()
  if (input.group !== undefined) updateData.group = input.group.trim()
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl.trim()
  if (input.order !== undefined) updateData.order = input.order
  await db.collection(COLLECTION).doc(id).update(updateData)
}

export async function deleteTeamMember(id: string): Promise<void> {
  if (!isAdminConfigured()) {
    throw new Error("Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.")
  }
  await getDb().collection(COLLECTION).doc(id).delete()
}
