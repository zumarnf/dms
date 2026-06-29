import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/shared/lib/db";
import { storage } from "@/shared/lib/storage-server";
import { getSessionUser } from "@/processes/auth/guard";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import { auditRepository } from "@/entities/audit/repository";
import { toAppError } from "@/shared/lib/errors";

/** Authorized file download. Access is checked before any bytes are served. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const doc = await documentRepository(db).findAccessibleById(id, user);
    const versions = await versionRepository(db).listByDocument(id);
    const current = versions.find((v) => v.id === doc.currentVersionId) ?? versions[0];
    if (!current) return new NextResponse("File tidak tersedia", { status: 404 });

    const bytes = await storage.get(current.storageKey);
    await auditRepository(db).log({
      actorId: user.id,
      action: "document.download",
      targetType: "document",
      targetId: id,
    });

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": current.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.title)}"`,
        "Content-Length": String(current.sizeBytes),
      },
    });
  } catch (err) {
    const e = toAppError(err);
    return new NextResponse(e.publicMessage, { status: e.status });
  }
}
