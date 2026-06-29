import type { Metadata } from "next";
import { LoginForm } from "@/features/auth-login/ui/LoginForm";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="bg-card border-border rounded-xl border p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Masuk ke DMS</h1>
        <p className="text-muted-foreground mt-1 mb-6 text-sm">Kelola dokumen Anda dengan aman.</p>
        <LoginForm redirectTo={redirectTo ?? "/dashboard"} />
      </div>
    </main>
  );
}
