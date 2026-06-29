"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signUp } from "@/shared/lib/auth-client";
import { loginSchema, signupSchema } from "@/features/auth-login/model/schema";

type Mode = "login" | "signup";
type FormValues = { email: string; password: string; name?: string };

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // Email/password are always validated; `name` is checked manually in signup.
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);

    if (mode === "signup") {
      const parsedName = signupSchema.shape.name.safeParse(values.name);
      if (!parsedName.success) {
        setError("name", { message: parsedName.error.issues[0]?.message });
        return;
      }
    }

    const result =
      mode === "login"
        ? await signIn.email({ email: values.email, password: values.password })
        : await signUp.email({
            email: values.email,
            password: values.password,
            name: values.name!,
          });

    if (result.error) {
      // Generic message — do not reveal which field was wrong (security.md).
      setFormError(mode === "login" ? "Email atau password salah" : "Gagal mendaftar, coba lagi");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {mode === "signup" && (
        <Field label="Nama" error={errors.name?.message}>
          <input
            type="text"
            autoComplete="name"
            className="input"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
      )}

      <Field label="Email" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          className="input"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="input"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </Field>

      {formError && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 font-medium transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "login" ? "signup" : "login"));
          setFormError(null);
        }}
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-destructive text-xs">{error}</span>}
    </label>
  );
}
