import type { Metadata } from "next";
import { requireProfile } from "@/processes/auth/guard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireProfile();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Halo, {user.name}</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Ringkasan dokumen dan aktivitas Anda akan tampil di sini.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Dokumen", value: "—" },
          { label: "Storage Terpakai", value: "—" },
          { label: "Aktivitas Terbaru", value: "—" },
        ].map((card) => (
          <div key={card.label} className="bg-card border-border rounded-xl border p-5">
            <p className="text-muted-foreground text-sm">{card.label}</p>
            <p className="font-heading mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
