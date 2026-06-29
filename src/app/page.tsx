import Link from "next/link";

// Temporary landing — replaced by auth redirect + dashboard in later phases.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="border-border bg-card text-muted-foreground rounded-full border px-3 py-1 font-mono text-xs">
        scaffold · Phase 0
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">DMS</h1>
      <p className="text-muted-foreground text-balance">
        Document Management System — simpan, organisasi, versioning, cari, dan kelola akses dokumen
        dengan aman.
      </p>
      <Link
        href="/login"
        className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-medium transition-colors hover:opacity-90"
      >
        Masuk
      </Link>
    </main>
  );
}
