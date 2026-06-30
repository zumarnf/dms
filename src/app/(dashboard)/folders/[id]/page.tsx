import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Download, FileText, Folder as FolderIcon } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { folderRepository } from "@/entities/folder/repository";
import { documentRepository } from "@/entities/document/repository";
import { CreateFolderForm } from "@/features/folder-manage/ui/CreateFolderForm";
import { DeleteFolderButton } from "@/features/folder-manage/ui/DeleteFolderButton";
import { UploadForm } from "@/features/document-upload/ui/UploadForm";

export const metadata: Metadata = { title: "Folder" };

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const folder = await folderRepository(db).getById(id);
  const privileged = user.role === "admin" || user.role === "manager";
  if (!folder || (!privileged && folder.ownerId !== user.id)) notFound();

  const [crumbs, subfolders, docs] = await Promise.all([
    folderRepository(db).breadcrumb(id),
    folderRepository(db).listChildren(user, id),
    documentRepository(db).listByFolder(user, id, { page: 1, pageSize: 50 }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground flex items-center gap-1 text-sm"
      >
        <Link href="/folders" className="hover:text-foreground">
          Folder
        </Link>
        {crumbs.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/folders/${c.id}`} className="hover:text-foreground">
              {c.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="bg-primary/12 text-primary grid h-9 w-9 shrink-0 place-items-center rounded-xl">
            <FolderIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 truncate">{folder.name}</span>
        </h1>
        <DeleteFolderButton folderId={id} />
      </div>

      <div className="mt-5 grid gap-4">
        <section
          className="bg-card border-border rounded-2xl border p-5"
          aria-label="Unggah dokumen"
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <FileText className="text-primary h-4 w-4" />
            Unggah ke folder ini
          </h2>
          <UploadForm folderId={id} />
        </section>
        <CreateFolderForm parentId={id} />
      </div>

      {subfolders.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subfolders.map((f) => (
            <li key={f.id}>
              <Link
                href={`/folders/${f.id}`}
                className="bg-card border-border hover-lift group flex items-center gap-3 rounded-2xl border p-4"
              >
                <span className="bg-primary/12 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105">
                  <FolderIcon className="h-5 w-5" />
                </span>
                <span className="truncate font-medium">{f.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="border-border mt-6 overflow-x-auto rounded-2xl border">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <span className="bg-secondary text-muted-foreground grid h-11 w-11 place-items-center rounded-2xl">
              <FileText className="h-5 w-5" />
            </span>
            <p className="text-muted-foreground text-sm">Belum ada dokumen di folder ini.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-border border-t first:border-t-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="hover:text-primary flex items-center gap-2 font-medium"
                    >
                      <FileText className="text-muted-foreground h-4 w-4" />
                      {doc.title}
                    </Link>
                  </td>
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
