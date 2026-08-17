"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfigRow({
  configKey,
  value,
  canEdit,
}: {
  configKey: string;
  value: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const dirty = draft !== value;

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/config/${configKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: draft }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="console-row">
      <span className="status-dot status-dot--muted" />
      <div>
        <p className="font-mono text-xs text-muted">{configKey}</p>
        <input
          className="field-input mt-1 max-w-sm"
          value={draft}
          disabled={!canEdit}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
        />
      </div>
      <span />
      {canEdit ? (
        <button
          className="btn-secondary"
          disabled={!dirty || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
