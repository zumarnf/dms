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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Folder</h1>
        <CreateFolderForm />
      </div>

      {folders.length === 0 ? (
        <div className="border-border mt-5 flex flex-col items-center gap-2 rounded-xl border p-12 text-center">
          <FolderIcon className="text-muted-foreground h-8 w-8" />
          <p className="font-medium">Belum ada folder</p>
          <p className="text-muted-foreground text-sm">Buat folder untuk menata dokumen Anda.</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((f) => (
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
    </div>
  );
}
