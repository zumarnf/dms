"use client";

import { useActionState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/atoms";
import { restoreDocumentAction, type ActionResult } from "../api/action";

export function RestoreDocumentButton({ documentId }: { documentId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => restoreDocumentAction(formData),
    null,
  );

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="documentId" value={documentId} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        <RotateCcw className="h-4 w-4" />
        {pending ? "Memulihkan…" : "Pulihkan"}
      </Button>
      {state?.error && (
        <span role="alert" className="text-destructive text-xs">
          {state.error}
        </span>
      )}
    </form>
  );
}
