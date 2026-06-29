"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { revokeShareAction, type ActionResult } from "../api/action";

export function RevokeShareButton({ permissionId }: { permissionId: string }) {
  const [, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => revokeShareAction(formData),
    null,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="permissionId" value={permissionId} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Cabut akses"
        className="text-muted-foreground hover:text-destructive inline-flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
