"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui/atoms";
import { moveDocumentToFolderAction, type ActionResult } from "../api/action";

type FolderOption = { id: string; name: string };

export function MoveDocumentForm({
  documentId,
  folders,
  currentFolderId,
}: {
  documentId: string;
  folders: FolderOption[];
  currentFolderId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => moveDocumentToFolderAction(formData),
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2 text-sm">
      <input type="hidden" name="documentId" value={documentId} />
      <label className="text-muted-foreground">Folder:</label>
      <select
        name="folderId"
        defaultValue={currentFolderId ?? ""}
        className="input h-9 w-auto py-1"
      >
        <option value="">(Root)</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Pindahkan
      </Button>
      {state?.error && (
        <span role="alert" className="text-destructive text-xs">
          {state.error}
        </span>
      )}
    </form>
  );
}
