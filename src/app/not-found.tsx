import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-primary font-mono text-sm">404</p>
      <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground text-sm">
        Halaman yang Anda cari tidak ada atau Anda tidak memiliki akses.
      </p>
      <Link
        href="/dashboard"
        className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        Kembali ke Dashboard
      </Link>
    </main>
  );
}
