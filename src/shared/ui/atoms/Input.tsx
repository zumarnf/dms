import { cn } from "@/shared/lib/cn";

type InputProps = React.ComponentProps<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-input bg-background w-full rounded-md border px-3 py-2 text-sm transition-colors",
        "focus-visible:border-ring placeholder:text-muted-foreground",
        "aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  );
}
