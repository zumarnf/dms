"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/brand/Logo";
import type { Role } from "@/shared/config/permissions";
import { visibleNavItems } from "./nav";

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname() ?? "";
  const items = visibleNavItems(role);

  return (
    <aside className="bg-card border-border sticky top-0 hidden h-dvh w-60 shrink-0 border-r md:flex md:flex-col">
      <div className="border-border flex h-14 items-center border-b px-5">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1 p-3" aria-label="Navigasi utama">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                active
                  ? "bg-primary/12 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "bg-primary absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              />
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  !active && "group-hover:scale-110",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
