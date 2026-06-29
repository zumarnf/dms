"use client";

import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/atoms";
import { shareDocumentAction, type ActionResult } from "../api/action";

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "contributor", label: "Contributor" },
  { value: "viewer", label: "Viewer" },
];
const LEVEL_OPTIONS = [
  { value: "view", label: "Lihat" },
  { value: "edit", label: "Edit" },
  { value: "manage", label: "Kelola" },
];

export function ShareForm({ documentId }: { documentId: string }) {
  const [granteeType, setGranteeType] = useState<"user" | "role">("user");
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => shareDocumentAction(formData),
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <input type="hidden" name="documentId" value={documentId} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Bagikan ke</span>
        <select
          name="granteeType"
          value={granteeType}
          onChange={(e) => setGranteeType(e.target.value as "user" | "role")}
          className="input"
        >
          <option value="user">Pengguna (email)</option>
          <option value="role">Peran</option>
        </select>
      </label>

      {granteeType === "user" ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            className="input"
            placeholder="nama@email.com"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Peran</span>
          <select name="role" className="input" defaultValue="viewer">
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Akses</span>
        <select name="level" className="input" defaultValue="view">
          {LEVEL_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Membagikan…" : "Bagikan"}
      </Button>

      {state?.error && (
        <p role="alert" className="text-destructive w-full text-sm">
          {state.error}
        </p>
      )}
      {state?.ok && <p className="text-success w-full text-sm">Akses diberikan.</p>}
    </form>
  );
}
