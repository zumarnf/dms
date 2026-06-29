import { test, expect } from "@playwright/test";

/**
 * Auth smoke tests. These exercise routes that do not touch the database
 * (the login page and proxy redirect), so they run without a seeded DB.
 * Full document-journey e2e (login → upload → search → share) requires a
 * running PostgreSQL and a seeded user; run it in an environment with both.
 *
 * Prerequisite: `npx playwright install` (browsers) and a dev server
 * (started automatically by playwright.config webServer).
 */

test("login page renders the form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Masuk ke DMS" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
});

test("protected route redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/documents");
  await expect(page).toHaveURL(/\/login/);
});
