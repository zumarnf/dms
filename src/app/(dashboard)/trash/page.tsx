import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { documentRepository } from "@/entities/document/repository";
import { RestoreDocumentButton } from "@/features/document-trash/ui/RestoreDocumentButton";

export const metadata: Metadata = { title: "Sampah" };

function fmtDate(v: Date | null) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(v));
}

export default async function TrashPage() {
  const user = await requireUser();
  const docs = await documentRepository(db).listTrashed(user, { page: 1, pageSize: 20 });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Sampah</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Dokumen yang dihapus dapat dipulihkan dari sini.
      </p>

      <div className="border-border mt-6 overflow-x-auto rounded-2xl border">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <span className="bg-secondary text-muted-foreground mb-1 grid h-12 w-12 place-items-center rounded-2xl">
              <Trash2 className="h-6 w-6" />
            </span>
            <p className="font-medium">Sampah kosong</p>
            <p className="text-muted-foreground text-sm">
              Dokumen yang Anda hapus akan muncul di sini.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-136 text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Nama</th>
                <th className="px-4 py-2.5 font-medium">Dihapus</th>
                <th className="sr-only px-4 py-2.5 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-border border-t">
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="text-muted-foreground px-4 py-3">{fmtDate(doc.deletedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <RestoreDocumentButton documentId={doc.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
