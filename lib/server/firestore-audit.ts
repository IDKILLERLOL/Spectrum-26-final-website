import "server-only"
import { Timestamp } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase/admin"
import { syncToSheet, buildAuditLogRow } from "@/lib/google/apps-script"
import type { AuditLogEntry } from "@/types/firestore"

const COLLECTION = "auditLogs"

interface WriteAuditLogInput {
  actorEmail: string
  action: string
  targetCollection: string
  targetId: string
  metadata?: Record<string, unknown>
}

/** Lightweight action+target summary, not full before/after diffs — see plan §6. */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    await getDb()
      .collection(COLLECTION)
      .add({
        actorEmail: input.actorEmail,
        action: input.action,
        targetCollection: input.targetCollection,
        targetId: input.targetId,
        metadata: input.metadata ?? {},
        createdAt: Timestamp.now(),
      })

    // Fire-and-forget mirror to the Sheets ledger; never awaited, never fatal.
    syncToSheet(
      buildAuditLogRow({
        type: "auditLog",
        actorEmail: input.actorEmail,
        action: input.action,
        targetCollection: input.targetCollection,
        targetId: input.targetId,
        createdAt: new Date().toISOString(),
      })
    ).catch(() => {})
  } catch (err) {
    // Audit logging must never break the underlying admin action it's recording.
    console.error("[firestore-audit] writeAuditLog failed (non-fatal):", err)
  }
}

export async function listAuditLogs(limit = 100): Promise<(AuditLogEntry & { id: string })[]> {
  try {
    const snap = await getDb().collection(COLLECTION).orderBy("createdAt", "desc").limit(limit).get()
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AuditLogEntry) }))
  } catch (err) {
    console.warn("[listAuditLogs] Error or Quota limit reached:", err)
    return []
  }
}
