import type { Metadata } from "next";
import { db } from "@/shared/lib/db";
import { requireCan } from "@/processes/auth/guard";
import { auditRepository } from "@/entities/audit/repository";
import { Badge } from "@/shared/ui/atoms";

export const metadata: Metadata = { title: "Aktivitas" };

function fmt(v: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(v),
  );
}

export default async function ActivityPage() {
  // Requires audit:read (admin/manager) — enforced server-side.
  await requireCan("audit:read");
  const entries = await auditRepository(db).listWithActor({}, { page: 1, pageSize: 50 });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Aktivitas</h1>
      <p className="text-muted-foreground mt-1 text-sm">Jejak audit aksi pada sistem.</p>

      <div className="border-border mt-5 overflow-x-auto rounded-2xl border">
        {entries.length === 0 ? (
          <p className="text-muted-foreground p-12 text-center text-sm">Belum ada aktivitas.</p>
        ) : (
          <table className="w-full min-w-136 text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Aksi</th>
                <th className="px-4 py-2.5 font-medium">Oleh</th>
                <th className="px-4 py-2.5 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-border border-t">
                  <td className="px-4 py-2.5">
                    <Badge variant="outline">{e.action}</Badge>
                  </td>
                  <td className="px-4 py-2.5">{e.actorName ?? "—"}</td>
                  <td className="text-muted-foreground px-4 py-2.5">{fmt(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
