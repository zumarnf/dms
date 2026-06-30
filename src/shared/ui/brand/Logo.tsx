import { cn } from "@/shared/lib/cn";

type LogoMarkProps = React.ComponentProps<"svg"> & { label?: string };

/**
 * DMS brand mark — a "D" ring (the monogram) whose counter holds a single gold
 * line (a document). Minimal, scalable, and ownable. The ring inherits
 * `currentColor`, so set the text color (emerald by default, white on emerald
 * surfaces); the gold document line uses the accent token in any theme.
 */
export function LogoMark({ label = "DMS", className, ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={label}
      className={cn("text-primary", className)}
      {...props}
    >
      {/* D ring (monogram) */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 6 H16 A10 10 0 0 1 16 26 H8 Z M12 11 H15 A5 5 0 0 1 15 21 H12 Z"
      />
      {/* Document line (accent) */}
      <rect x="13" y="15" width="5" height="2" rx="1" style={{ fill: "var(--color-accent)" }} />
    </svg>
  );
}

type LogoProps = {
  /** Hide the "DMS" wordmark and render only the mark. */
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
};

/** Mark + "DMS" wordmark lockup. */
export function Logo({ markOnly = false, className, markClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("h-7 w-7", markClassName)} />
      {!markOnly && <span className="font-heading text-lg font-semibold tracking-tight">DMS</span>}
    </span>
  );
}
