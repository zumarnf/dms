"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/brand/Logo";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

const sections = [
  { href: "#fitur", label: "Fitur" },
  { href: "#keamanan", label: "Keamanan" },
  { href: "#cara-kerja", label: "Cara Kerja" },
];

/** Sticky marketing header — turns to glass once the page is scrolled. */
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled ? "glass border-b" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center" aria-label="DMS beranda">
          <Logo markClassName="h-8 w-8" />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Bagian halaman">
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg px-3 py-2 text-sm transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/login"
            className="bg-primary text-primary-foreground ml-1 inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
}
