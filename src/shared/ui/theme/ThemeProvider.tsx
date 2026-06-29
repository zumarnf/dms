"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** App theme provider — class strategy, follows system, persists user choice. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
