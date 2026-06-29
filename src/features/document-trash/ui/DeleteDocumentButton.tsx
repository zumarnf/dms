"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/atoms";
import { deleteDocumentAction, type ActionResult } from "../api/action";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => deleteDocumentAction(formData),
    null,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Pindahkan dokumen ini ke Sampah?")) e.preventDefault();
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="documentId" value={documentId} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        <Trash2 className="h-4 w-4" />
        Hapus
      </Button>
      {state?.error && (
        <span role="alert" className="text-destructive text-xs">
          {state.error}
        </span>
      )}
    </form>
  );
}
