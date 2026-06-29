import { z } from "zod";

/** Shared auth form schemas (reused by the form and any server validation). */
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
