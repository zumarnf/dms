"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/shared/lib/auth-client";
import { Button } from "@/shared/ui/atoms";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

export function AppTopbar({ userName }: { userName: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4 backdrop-blur">
      <div className="flex-1" />
      <span className="text-muted-foreground hidden text-sm sm:inline">{userName}</span>
      <ThemeToggle />
      <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Keluar">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Keluar</span>
      </Button>
    </header>
  );
}
