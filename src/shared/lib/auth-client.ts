import { createAuthClient } from "better-auth/react";

// Client-side auth hooks/actions. Same-origin, so no baseURL needed.
export const authClient = createAuthClient();
export const { signIn, signUp, signOut, useSession } = authClient;
