import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Search, GitBranch } from "lucide-react";
import { LoginForm } from "@/features/auth-login/ui/LoginForm";
import { Logo } from "@/shared/ui/brand/Logo";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

export const metadata: Metadata = { title: "Masuk" };

const highlights = [
  { icon: ShieldCheck, text: "Otorisasi dipaksakan di server & lapisan data" },
  { icon: GitBranch, text: "Versioning otomatis untuk setiap perubahan" },
  { icon: Search, text: "Pencarian full-text yang cepat dan akurat" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Brand panel — premium emerald, hidden on small screens. */}
      <aside className="bg-primary text-primary-foreground relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="blob animate-float -top-20 -right-16 h-72 w-72 bg-white/25" aria-hidden />
        <div
          className="blob bg-accent animate-float -bottom-24 -left-12 h-72 w-72"
          style={{ animationDelay: "1.5s", opacity: 0.4 }}
          aria-hidden
        />

        <Link href="/" className="relative flex items-center">
          <Logo markClassName="h-8 w-8 text-white" />
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight xl:text-4xl">
            Dokumen Anda, tenang dan terkendali.
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 backdrop-blur">
                  <h.icon className="h-5 w-5" />
                </span>
                <span className="text-sm opacity-90">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs opacity-70">
          Document Management System — aman, modern, rapi.
        </p>
      </aside>

      {/* Form panel. */}
      <div className="relative flex min-h-dvh flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Beranda
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="animate-fade-up w-full max-w-md">
            {/* Compact brand mark for small screens. */}
            <Logo className="mb-6 lg:hidden" markClassName="h-9 w-9" />

            <div className="bg-card border-border elevate rounded-2xl border p-7 sm:p-8">
              <h1 className="text-2xl font-semibold tracking-tight">Selamat datang kembali</h1>
              <p className="text-muted-foreground mt-1.5 mb-7 text-sm">
                Masuk untuk mengelola dokumen Anda dengan aman.
              </p>
              <LoginForm redirectTo={redirectTo ?? "/dashboard"} />
            </div>

            <p className="text-muted-foreground mt-6 text-center text-xs">
              Dengan masuk, Anda menyetujui pengelolaan dokumen sesuai kebijakan organisasi.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
