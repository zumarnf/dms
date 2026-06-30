"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/brand/Logo";
import type { Role } from "@/shared/config/permissions";
import { visibleNavItems } from "./nav";

/** Hamburger + slide-in drawer navigation for screens below the md breakpoint. */
export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const items = visibleNavItems(role);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu navigasi"
        aria-expanded={open}
        className="hover:bg-secondary inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigasi">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <nav className="bg-card animate-fade-up absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col p-3 shadow-xl">
            <div className="border-border mb-2 flex h-12 items-center justify-between border-b px-2">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu navigasi"
                className="hover:bg-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
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
        </div>
      )}
    </div>
  );
}
