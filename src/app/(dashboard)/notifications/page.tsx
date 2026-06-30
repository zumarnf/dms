import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { notificationRepository } from "@/entities/notification/repository";
import { Badge, Button } from "@/shared/ui/atoms";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/api/action";

export const metadata: Metadata = { title: "Notifikasi" };

function fmt(v: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(v),
  );
}

type SharePayload = { documentId?: string; title?: string; level?: string };

function describe(type: string, payload: unknown): { text: string; href?: string } {
  if (type === "document.shared") {
    const p = (payload ?? {}) as SharePayload;
    return {
      text: `Dokumen "${p.title ?? "—"}" dibagikan kepada Anda`,
      href: p.documentId ? `/documents/${p.documentId}` : undefined,
    };
  }
  return { text: type };
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await notificationRepository(db).listForUser(user.id, { page: 1, pageSize: 50 });
  const hasUnread = items.some((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifikasi</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pembaruan tentang dokumen yang dibagikan kepada Anda.
          </p>
        </div>
        {hasUnread && (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="secondary" size="sm">
              Tandai semua dibaca
            </Button>
          </form>
        )}
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {items.length === 0 && (
          <li className="border-border flex flex-col items-center gap-2 rounded-2xl border border-dashed p-12 text-center">
            <span className="bg-secondary text-muted-foreground mb-1 grid h-12 w-12 place-items-center rounded-2xl">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="font-medium">Tidak ada notifikasi</p>
            <p className="text-muted-foreground text-sm">Notifikasi baru akan muncul di sini.</p>
          </li>
        )}
        {items.map((n) => {
          const info = describe(n.type, n.payload);
          return (
            <li
              key={n.id}
              className={
                "border-border hover-lift flex items-center justify-between gap-3 rounded-2xl border p-4 " +
                (n.readAt ? "bg-card" : "bg-primary/4 border-primary/20")
              }
            >
              <div className="min-w-0">
                <p className="truncate text-sm">
                  {info.href ? (
                    <Link href={info.href} className="hover:text-primary font-medium">
                      {info.text}
                    </Link>
                  ) : (
                    info.text
                  )}
                  {!n.readAt && (
                    <Badge variant="primary" className="ml-2">
                      Baru
                    </Badge>
                  )}
                </p>
                <p className="text-muted-foreground text-xs">{fmt(n.createdAt)}</p>
              </div>
              {!n.readAt && (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                  >
                    Tandai dibaca
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
