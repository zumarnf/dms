"use client";

import { useActionState, useRef, useState } from "react";
import { UploadCloud, Paperclip, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/atoms";
import { UPLOAD_ACCEPT, ALLOWED_TYPES_LABEL, MAX_FILE_SIZE_MB } from "@/shared/lib/storage";
import { uploadDocumentsAction, type UploadResult } from "../api/action";

const initialState: UploadResult | null = null;

export function UploadForm({ folderId }: { folderId?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const [state, formAction, pending] = useActionState(
    async (_prev: UploadResult | null, formData: FormData) => {
      const result = await uploadDocumentsAction(formData);
      if (result.ok) {
        formRef.current?.reset();
        setSelected([]);
      }
      return result;
    },
    initialState,
  );

  const selectionLabel =
    selected.length === 0
      ? "Belum ada file dipilih"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} file dipilih`;

  return (
    <form ref={formRef} action={formAction} className="w-full">
      {folderId && <input type="hidden" name="folderId" value={folderId} />}

      <div className="flex flex-wrap items-center gap-3">
        <label className="border-input bg-background hover:bg-secondary inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors">
          <Paperclip className="h-4 w-4" />
          Pilih file
          <input
            type="file"
            name="files"
            multiple
            required
            accept={UPLOAD_ACCEPT}
            aria-label="Pilih file untuk diunggah"
            onChange={(e) => setSelected(Array.from(e.target.files ?? [], (f) => f.name))}
            className="sr-only"
          />
        </label>

        <span
          className={
            selected.length === 0
              ? "text-muted-foreground min-w-0 flex-1 truncate text-sm"
              : "text-foreground min-w-0 flex-1 truncate text-sm font-medium"
          }
        >
          {selectionLabel}
        </span>

        <Button type="submit" disabled={pending || selected.length === 0}>
          <UploadCloud className="h-4 w-4" />
          {pending ? "Mengunggah…" : "Unggah"}
        </Button>
      </div>

      {/* Persistent rules so the user knows what is accepted before trying. */}
      <p className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Format didukung: {ALLOWED_TYPES_LABEL}. Ukuran maksimum {MAX_FILE_SIZE_MB} MB per file.
        </span>
      </p>

      {state?.error && (
        <p role="alert" className="text-destructive mt-2 flex items-center gap-1.5 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-success mt-2 flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.count} dokumen berhasil diunggah
        </p>
      )}
    </form>
  );
}
