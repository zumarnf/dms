"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { signOut } from "@/shared/lib/auth-client";
import { Button } from "@/shared/ui/atoms";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";
import { MobileNav } from "@/widgets/app-sidebar/MobileNav";
import type { Role } from "@/shared/config/permissions";

export function AppTopbar({
  userName,
  unreadCount,
  role,
}: {
  userName: string;
  unreadCount: number;
  role: Role;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <MobileNav role={role} />
      <div className="flex-1" />
      <span className="text-muted-foreground hidden text-sm sm:inline">{userName}</span>
      <Link
        href="/notifications"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
        className="hover:bg-secondary relative inline-flex h-10 w-10 items-center justify-center rounded-lg"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
      <ThemeToggle />
      <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Keluar">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Keluar</span>
      </Button>
    </header>
  );
}
