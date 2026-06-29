import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireProfile } from "@/processes/auth/guard";
import { documentRepository } from "@/entities/document/repository";
import { notificationRepository } from "@/entities/notification/repository";

export const metadata: Metadata = { title: "Dashboard" };

function fmt(v: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(v));
}

export default async function DashboardPage() {
  const user = await requireProfile();
  const docs = documentRepository(db);

  const [total, unread, recent] = await Promise.all([
    docs.countAccessible(user),
    notificationRepository(db).countUnread(user.id),
    docs.listAccessible(user, { page: 1, pageSize: 5 }),
  ]);

  const cards = [
    { label: "Total Dokumen", value: String(total) },
    { label: "Notifikasi Belum Dibaca", value: String(unread) },
    { label: "Peran", value: user.role },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Halo, {user.name}</h1>
      <p className="text-muted-foreground mt-1 text-sm">Ringkasan dokumen dan aktivitas Anda.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border-border rounded-xl border p-5">
            <p className="text-muted-foreground text-sm">{card.label}</p>
            <p className="font-heading mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dokumen Terbaru</h2>
          <Link href="/documents" className="text-primary text-sm hover:underline">
            Lihat semua
          </Link>
        </div>
        <ul className="border-border mt-3 divide-y rounded-xl border">
          {recent.length === 0 && (
            <li className="text-muted-foreground p-6 text-center text-sm">Belum ada dokumen.</li>
          )}
          {recent.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="hover:bg-secondary/50 flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2 font-medium">
                  <FileText className="text-muted-foreground h-4 w-4" />
                  {doc.title}
                </span>
                <span className="text-muted-foreground">{fmt(doc.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
