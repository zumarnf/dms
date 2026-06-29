import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/** Accessible loading spinner (announced to screen readers). */
export function Spinner({ className, label = "Memuat" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <Loader2 className={cn("text-muted-foreground h-4 w-4 animate-spin", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
