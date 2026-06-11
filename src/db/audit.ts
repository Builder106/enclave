import { getDb, newId } from "./client";
import { auditLog } from "./schema";

/** Persistence-edge log write; must never break the pipeline. */
export async function audit(entry: {
  actor: string;
  action: string;
  documentId?: string | null;
  detail?: string | null;
}): Promise<void> {
  try {
    const { db } = getDb();
    await db.insert(auditLog).values({
      id: newId("AUD"),
      actor: entry.actor,
      action: entry.action,
      documentId: entry.documentId ?? null,
      detail: entry.detail ?? null,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error("audit write failed", err);
  }
}
