"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/atoms";
import { deleteFolderAction, type ActionResult } from "../api/action";

export function DeleteFolderButton({ folderId }: { folderId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => deleteFolderAction(formData),
    null,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Hapus folder ini? Dokumen di dalamnya tidak ikut terhapus.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="folderId" value={folderId} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        <Trash2 className="h-4 w-4" />
        Hapus folder
      </Button>
      {state?.error && (
        <span role="alert" className="text-destructive ml-2 text-xs">
          {state.error}
        </span>
      )}
    </form>
  );
}
