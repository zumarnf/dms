"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/shared/ui/atoms";
import { addVersionAction, type ActionResult } from "../api/action";

export function AddVersionForm({ documentId }: { documentId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await addVersionAction(formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="documentId" value={documentId} />
      <input
        type="file"
        name="file"
        required
        aria-label="Pilih file versi baru"
        className="file:bg-secondary file:text-secondary-foreground text-muted-foreground text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Mengunggah…" : "Unggah versi baru"}
      </Button>
      {state?.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
