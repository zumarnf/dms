import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { authorizeDocument } from "@/processes/auth/authorizeDocument";
import { can } from "@/shared/lib/rbac";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import { permissionRepository } from "@/entities/permission/repository";
import { commentRepository } from "@/entities/comment/repository";
import { Badge } from "@/shared/ui/atoms";
import { AddVersionForm } from "@/features/document-versioning/ui/AddVersionForm";
import { setCurrentVersionAction } from "@/features/document-versioning/api/action";
import { CommentForm } from "@/features/document-comment/ui/CommentForm";
import { DeleteDocumentButton } from "@/features/document-trash/ui/DeleteDocumentButton";

function fmtDate(v: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(v),
  );
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  let doc;
  try {
    doc = await authorizeDocument(db, user, id, "document:read");
  } catch {
    // Do not reveal whether the document exists when unauthorized.
    notFound();
  }

  const level = await permissionRepository(db).effectiveLevel("document", id, user);
  const ctx = { ownerId: doc.ownerId, shareLevel: level ?? undefined };
  const canEdit = can(user, "document:update", ctx);
  const canDelete = can(user, "document:delete", ctx);

  const [versions, comments] = await Promise.all([
    versionRepository(db).listByDocument(id),
    commentRepository(db).listWithAuthor(id),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{doc.title}</h1>
          {doc.category && <Badge className="mt-2">{doc.category}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/documents/${id}`}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Unduh
          </a>
          {canDelete && <DeleteDocumentButton documentId={id} />}
        </div>
      </div>

      {doc.description && <p className="text-muted-foreground mt-3 text-sm">{doc.description}</p>}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Versi</h2>
        <ul className="border-border mt-3 divide-y rounded-xl border">
          {versions.map((v) => {
            const active = v.id === doc.currentVersionId;
            return (
              <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className="font-mono">v{v.versionNo}</span>
                  {active && <Badge variant="success">Aktif</Badge>}
                  <span className="text-muted-foreground">
                    {fmtSize(v.sizeBytes)} · {fmtDate(v.createdAt)}
                  </span>
                </span>
                {canEdit && !active && (
                  <form action={setCurrentVersionAction}>
                    <input type="hidden" name="documentId" value={id} />
                    <input type="hidden" name="versionId" value={v.id} />
                    <button
                      type="submit"
                      className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      Jadikan aktif
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
        {canEdit && (
          <div className="mt-4">
            <AddVersionForm documentId={id} />
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Komentar</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {comments.length === 0 && (
            <li className="text-muted-foreground text-sm">Belum ada komentar.</li>
          )}
          {comments.map((c) => (
            <li key={c.id} className="bg-card border-border rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{c.authorName}</span>
                <span className="text-muted-foreground text-xs">{fmtDate(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <CommentForm documentId={id} />
        </div>
      </section>
    </div>
  );
}
