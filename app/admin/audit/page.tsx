import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AuditLogPage() {
  await getCurrentUser(); // any authenticated, active user may view — visibility itself is a control

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: true },
  });

  return (
    <div>
      <h1 className="mb-8 text-lg font-semibold">Audit log</h1>
      <div>
        {entries.map((entry) => (
          <div key={entry.id} className="console-row">
            <span className="status-dot status-dot--muted" />
            <div>
              <p>
                <span className="font-mono text-xs text-active">{entry.action}</span>{" "}
                <span className="text-muted">on</span>{" "}
                <span className="font-mono text-xs">{entry.target}</span>
              </p>
              <p className="text-xs text-muted">{entry.actor.email}</p>
            </div>
            <span className="font-mono text-xs text-muted">
              {entry.createdAt.toLocaleString()}
            </span>
            <span />
          </div>
        ))}
        {entries.length === 0 && (
          <p className="py-6 text-sm text-muted">No actions recorded yet.</p>
        )}
      </div>
    </div>
  );
}
