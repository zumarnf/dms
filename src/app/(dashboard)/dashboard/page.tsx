import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Bell, ShieldCheck, ArrowRight, type LucideIcon } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireProfile } from "@/processes/auth/guard";
import { documentRepository } from "@/entities/document/repository";
import { notificationRepository } from "@/entities/notification/repository";
import { Reveal } from "@/shared/ui/motion/Reveal";

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

  const cards: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Total Dokumen", value: String(total), icon: FileText },
    { label: "Belum Dibaca", value: String(unread), icon: Bell },
    { label: "Peran", value: user.role, icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-tight">Halo, {user.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Ringkasan dokumen dan aktivitas Anda.</p>
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.label} delay={i * 70}>
            <div className="bg-card border-border hover-lift flex h-full items-center gap-4 rounded-2xl border p-5">
              <span className="bg-primary/12 text-primary grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                <card.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-muted-foreground text-sm">{card.label}</p>
                <p className="font-heading mt-0.5 truncate text-2xl font-semibold capitalize">
                  {card.value}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Dokumen Terbaru</h2>
          <Link
            href="/documents"
            className="text-primary group inline-flex items-center gap-1 text-sm hover:underline"
          >
            Lihat semua
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ul className="border-border bg-card mt-3 divide-y overflow-hidden rounded-2xl border">
          {recent.length === 0 && (
            <li className="text-muted-foreground p-8 text-center text-sm">Belum ada dokumen.</li>
          )}
          {recent.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="hover:bg-secondary/60 flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors"
              >
                <span className="flex min-w-0 items-center gap-2.5 font-medium">
                  <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </span>
                <span className="text-muted-foreground shrink-0">{fmt(doc.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
