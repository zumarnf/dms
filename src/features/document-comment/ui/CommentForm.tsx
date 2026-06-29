"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/shared/ui/atoms";
import { addCommentAction, type ActionResult } from "../api/action";

export function CommentForm({ documentId }: { documentId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await addCommentAction(formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="documentId" value={documentId} />
      <textarea
        name="body"
        required
        rows={3}
        maxLength={2000}
        placeholder="Tulis komentar…"
        aria-label="Tulis komentar"
        className="input resize-y"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim"}
        </Button>
        {state?.error && (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
