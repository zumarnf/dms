import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/shared/lib/auth";

// Better Auth mounts all its endpoints under /api/auth/*.
export const { GET, POST } = toNextJsHandler(auth);
