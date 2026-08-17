import { prisma } from "./prisma";

/**
 * AUDIT LOGGING — single write path for every privileged action.
 *
 * Coding standard: no route handler writes to AuditLog directly. Every
 * mutating action (invite, deactivate, role change, config edit) calls
 * this function. That's what makes Project 6's access review trustworthy —
 * an audit trail with gaps is worse than no audit trail, because it
 * creates false confidence that "we'd know if something happened."
 *
 * NEVER pass secret values into `metadata` — it's stored as plain JSON
 * and is meant to be readable by anyone with OPERATOR access.
 */
export async function logAudit(params: {
  actorId: string;
  action: string;
  target: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      target: params.target,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
