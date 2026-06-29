import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Search } from "lucide-react";
import { requireUser } from "@/processes/auth/guard";
import { db } from "@/shared/lib/db";
import { documentRepository } from "@/entities/document/repository";
import { UploadForm } from "@/features/document-upload/ui/UploadForm";

export const metadata: Metadata = { title: "Dokumen" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const repo = documentRepository(db);
  const docs = q
    ? await repo.searchAccessible(user, { page: 1, pageSize: 20 }, q)
    : await repo.listAccessible(user, { page: 1, pageSize: 20 });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dokumen</h1>
        <UploadForm />
      </div>

      <form className="relative mt-5 max-w-sm" role="search">
        <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari dokumen…"
          aria-label="Cari dokumen"
          className="input pl-9"
        />
      </form>

      <div className="border-border mt-5 overflow-hidden rounded-xl border">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <FileText className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">{q ? "Tidak ada hasil" : "Belum ada dokumen"}</p>
            <p className="text-muted-foreground text-sm">
              {q ? "Coba kata kunci lain atau hapus filter." : "Unggah dokumen pertama Anda."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Nama</th>
                <th className="px-4 py-2.5 font-medium">Diperbarui</th>
                <th className="sr-only px-4 py-2.5 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-border border-t">
                  <td className="px-4 py-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="hover:text-primary flex items-center gap-2 font-medium"
                    >
                      <FileText className="text-muted-foreground h-4 w-4" />
                      {doc.title}
                    </Link>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{formatDate(doc.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/api/documents/${doc.id}`}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Unduh {doc.title}</span>
                    </a>
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
