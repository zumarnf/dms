"use client";

import { useActionState, useRef } from "react";
import { FolderPlus } from "lucide-react";
import { Button, Input } from "@/shared/ui/atoms";
import { createFolderAction, type ActionResult } from "../api/action";

export function CreateFolderForm({ parentId }: { parentId?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await createFolderAction(formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-2">
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <Input
        name="name"
        required
        maxLength={120}
        placeholder="Nama folder baru"
        aria-label="Nama folder baru"
        className="h-9 w-auto"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        <FolderPlus className="h-4 w-4" />
        {pending ? "Membuat…" : "Buat folder"}
      </Button>
      {state?.error && (
        <p role="alert" className="text-destructive w-full text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
