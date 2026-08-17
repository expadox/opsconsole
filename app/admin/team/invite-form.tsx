"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "OPERATOR">("OPERATOR");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not send invite.");
      return;
    }
    setEmail("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex items-end gap-3">
      <div className="flex-1">
        <label className="field-label" htmlFor="email">
          Invite by email
        </label>
        <input
          id="email"
          type="email"
          required
          maxLength={200}
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          className="field-input"
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "OPERATOR")}
        >
          <option value="OPERATOR">Operator</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Sending…" : "Send invite"}
      </button>
      {error && <p className="ml-3 text-sm text-danger">{error}</p>}
    </form>
  );
}
