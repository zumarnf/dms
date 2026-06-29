"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/atoms";

/**
 * Route-level error boundary. Shows a generic message — internal details and
 * stack traces never reach the user (security.md). `error.digest` correlates to
 * the server log entry.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side trace for debugging; server logs hold the full detail.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
      <p className="text-muted-foreground text-sm">
        Maaf, sesuatu tidak berjalan semestinya. Silakan coba lagi.
      </p>
      {error.digest && (
        <p className="text-muted-foreground font-mono text-xs">Ref: {error.digest}</p>
      )}
      <Button onClick={reset}>Coba lagi</Button>
    </main>
  );
}
