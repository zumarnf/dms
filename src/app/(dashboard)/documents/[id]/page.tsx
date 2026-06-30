import { notFound } from "next/navigation";
import { Download, FileText, History, Share2, MessageSquare } from "lucide-react";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { authorizeDocument } from "@/processes/auth/authorizeDocument";
import { can } from "@/shared/lib/rbac";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import { permissionRepository } from "@/entities/permission/repository";
import { commentRepository } from "@/entities/comment/repository";
import { userRepository } from "@/entities/user/repository";
import { folderRepository } from "@/entities/folder/repository";
import { MoveDocumentForm } from "@/features/folder-manage/ui/MoveDocumentForm";
import { Badge } from "@/shared/ui/atoms";
import { ShareForm } from "@/features/document-share/ui/ShareForm";
import { RevokeShareButton } from "@/features/document-share/ui/RevokeShareButton";
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
  const canShare = can(user, "document:share", ctx);

  const [versions, comments] = await Promise.all([
    versionRepository(db).listByDocument(id),
    commentRepository(db).listWithAuthor(id),
  ]);

  // Resolve share grants with display labels (only when the viewer may manage sharing).
  const grants = canShare
    ? await Promise.all(
        (await permissionRepository(db).listForResource("document", id)).map(async (g) => {
          const label =
            g.granteeType === "user"
              ? ((await userRepository(db).findById(g.granteeId))?.email ?? g.granteeId)
              : `Peran: ${g.granteeId}`;
          return { id: g.id, label, level: g.level };
        }),
      )
    : [];
  const levelLabel: Record<string, string> = { view: "Lihat", edit: "Edit", manage: "Kelola" };
  const folders = canEdit ? await folderRepository(db).listAll(user) : [];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header card */}
      <div className="bg-card border-border rounded-2xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <FileText className="h-3.5 w-3.5" />
              Dokumen
            </span>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight break-words">
              {doc.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {doc.category && <Badge>{doc.category}</Badge>}
              <span className="text-muted-foreground text-xs">
                Diperbarui {fmtDate(doc.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/documents/${id}`}
              className="bg-primary text-primary-foreground elevate inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Unduh
            </a>
            {canDelete && <DeleteDocumentButton documentId={id} />}
          </div>
        </div>

        {doc.description && (
          <p className="text-muted-foreground mt-4 text-sm whitespace-pre-wrap">
            {doc.description}
          </p>
        )}

        {canEdit && (
          <div className="border-border mt-4 border-t pt-4">
            <MoveDocumentForm
              documentId={id}
              folders={folders.map((f) => ({ id: f.id, name: f.name }))}
              currentFolderId={doc.folderId}
            />
          </div>
        )}
      </div>

      {/* Versi */}
      <section className="bg-card border-border mt-5 rounded-2xl border p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <History className="text-primary h-4 w-4" />
          Versi
        </h2>
        <ul className="divide-border mt-3 divide-y">
          {versions.map((v) => {
            const active = v.id === doc.currentVersionId;
            return (
              <li key={v.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs">v{v.versionNo}</span>
                    {v.fileName && <span className="truncate font-medium">{v.fileName}</span>}
                    {active && <Badge variant="success">Aktif</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {fmtSize(v.sizeBytes)} · {fmtDate(v.createdAt)}
                  </p>
                </div>
                {canEdit && !active && (
                  <form action={setCurrentVersionAction}>
                    <input type="hidden" name="documentId" value={id} />
                    <input type="hidden" name="versionId" value={v.id} />
                    <button
                      type="submit"
                      className="text-primary shrink-0 text-sm underline-offset-4 hover:underline"
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
          <div className="border-border mt-4 border-t pt-4">
            <AddVersionForm documentId={id} />
          </div>
        )}
      </section>

      {/* Berbagi */}
      {canShare && (
        <section className="bg-card border-border mt-5 rounded-2xl border p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Share2 className="text-primary h-4 w-4" />
            Berbagi
          </h2>
          {grants.length > 0 ? (
            <ul className="divide-border mt-3 divide-y">
              {grants.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate">
                    {g.label} <Badge variant="outline">{levelLabel[g.level]}</Badge>
                  </span>
                  <RevokeShareButton permissionId={g.id} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">Belum dibagikan ke siapa pun.</p>
          )}
          <div className="border-border mt-4 border-t pt-4">
            <ShareForm documentId={id} />
          </div>
        </section>
      )}

      {/* Komentar */}
      <section className="bg-card border-border mt-5 rounded-2xl border p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="text-primary h-4 w-4" />
          Komentar
        </h2>
        <ul className="divide-border mt-3 divide-y">
          {comments.length === 0 && (
            <li className="text-muted-foreground py-2 text-sm">Belum ada komentar.</li>
          )}
          {comments.map((c) => (
            <li key={c.id} className="py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{c.authorName}</span>
                <span className="text-muted-foreground text-xs">{fmtDate(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
        <div className="border-border mt-4 border-t pt-4">
          <CommentForm documentId={id} />
        </div>
      </section>
    </div>
  );
}
