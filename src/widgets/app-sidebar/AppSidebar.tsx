"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import type { Role } from "@/shared/config/permissions";
import { visibleNavItems } from "./nav";

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname() ?? "";
  const items = visibleNavItems(role);

  return (
    <aside className="bg-card border-border hidden w-60 shrink-0 border-r md:flex md:flex-col">
      <div className="border-border flex h-14 items-center gap-2 border-b px-5">
        <span className="bg-primary text-primary-foreground font-heading grid h-7 w-7 place-items-center rounded-md text-sm font-bold">
          D
        </span>
        <span className="font-heading text-lg font-semibold">DMS</span>
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/12 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
