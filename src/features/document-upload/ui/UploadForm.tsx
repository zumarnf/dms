"use client";

import { useActionState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/shared/ui/atoms";
import { uploadDocumentsAction, type UploadResult } from "../api/action";

const initialState: UploadResult | null = null;

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: UploadResult | null, formData: FormData) => {
      const result = await uploadDocumentsAction(formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    initialState,
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-3">
      <input
        type="file"
        name="files"
        multiple
        required
        aria-label="Pilih file untuk diunggah"
        className="file:bg-secondary file:text-secondary-foreground text-muted-foreground text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm"
      />
      <Button type="submit" disabled={pending} size="sm">
        <UploadCloud className="h-4 w-4" />
        {pending ? "Mengunggah…" : "Unggah"}
      </Button>

      {state?.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
      {state?.ok && <p className="text-success text-sm">{state.count} dokumen berhasil diunggah</p>}
    </form>
  );
}
