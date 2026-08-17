"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";

export default function UserRow({
  user,
  canManage,
}: {
  user: User;
  canManage: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function patch(body: object) {
    setSaving(true);
    const res = await fetch(`/api/team/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  const dotClass = !user.active
    ? "status-dot--danger"
    : user.role === "ADMIN"
      ? "status-dot--active"
      : "status-dot--muted";

  return (
    <div className="console-row">
      <span className={`status-dot ${dotClass}`} />
      <span className={user.active ? "" : "text-muted line-through"}>
        {user.email}
      </span>
      {canManage ? (
        <select
          className="field-input w-auto py-1 text-xs"
          value={user.role}
          disabled={saving || !user.active}
          onChange={(e) => patch({ role: e.target.value })}
        >
          <option value="OPERATOR">Operator</option>
          <option value="ADMIN">Admin</option>
        </select>
      ) : (
        <span className="font-mono text-xs uppercase text-muted">{user.role}</span>
      )}
      {canManage ? (
        <button
          className="btn-danger"
          disabled={saving}
          onClick={() => patch({ active: !user.active })}
        >
          {user.active ? "Deactivate" : "Reactivate"}
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
