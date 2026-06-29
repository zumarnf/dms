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
        <h1 className="text-2xl font-semibold">{folder.name}</h1>
        <DeleteFolderButton folderId={id} />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <CreateFolderForm parentId={id} />
        <UploadForm folderId={id} />
      </div>

      {subfolders.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subfolders.map((f) => (
            <li key={f.id}>
              <Link
                href={`/folders/${f.id}`}
                className="bg-card border-border hover:border-primary/50 flex items-center gap-3 rounded-xl border p-4 transition-colors"
              >
                <FolderIcon className="text-primary h-5 w-5" />
                <span className="truncate font-medium">{f.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="border-border mt-6 overflow-hidden rounded-xl border">
        {docs.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center text-sm">
            Belum ada dokumen di folder ini.
          </p>
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
