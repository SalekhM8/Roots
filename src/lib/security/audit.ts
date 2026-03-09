import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

interface AuditLogEntry {
  actorUserId?: string;
  actorRole?: string;
  entityType: string;
  entityId: string;
  action: string;
  previousState?: Prisma.InputJsonValue;
  newState?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Append-only audit log. Called on every privileged action.
 * Never update or delete audit log entries.
 */
export async function writeAuditLog(entry: AuditLogEntry) {
  return db.auditLog.create({
    data: {
      actorUserId: entry.actorUserId,
      actorRole: entry.actorRole,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      previousStateJson: entry.previousState,
      newStateJson: entry.newState,
      metadataJson: entry.metadata,
    },
  });
}
