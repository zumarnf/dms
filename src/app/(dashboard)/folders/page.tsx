import type { Metadata } from "next";
import Link from "next/link";
import { Folder as FolderIcon } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { folderRepository } from "@/entities/folder/repository";
import { CreateFolderForm } from "@/features/folder-manage/ui/CreateFolderForm";

export const metadata: Metadata = { title: "Folder" };

export default async function FoldersPage() {
  const user = await requireUser();
  const folders = await folderRepository(db).listChildren(user, null);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Folder</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Susun dokumen dalam folder bertingkat agar mudah ditemukan.
          </p>
        </div>
        <CreateFolderForm />
      </div>

      {folders.length === 0 ? (
        <div className="border-border mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed p-12 text-center">
          <span className="bg-primary/12 text-primary mb-1 grid h-12 w-12 place-items-center rounded-2xl">
            <FolderIcon className="h-6 w-6" />
          </span>
          <p className="font-medium">Belum ada folder</p>
          <p className="text-muted-foreground text-sm">Buat folder untuk menata dokumen Anda.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((f) => (
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
    </div>
  );
}
