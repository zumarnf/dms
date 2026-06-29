import { describe, it, expect } from "vitest";
import { tokenize, toPrefixTsQuery } from "@/shared/lib/fts";

describe("fts", () => {
  it("tokenizes and drops symbols", () => {
    expect(tokenize("Invoice #2026 / final!")).toEqual(["invoice", "2026", "final"]);
  });

  it("builds a prefix tsquery joined by AND", () => {
    expect(toPrefixTsQuery("annual report")).toBe("annual:* & report:*");
  });

  it("returns empty string when nothing searchable", () => {
    expect(toPrefixTsQuery("  ***  ")).toBe("");
  });

  it("caps the number of terms", () => {
    const many = Array.from({ length: 20 }, (_, i) => `t${i}`).join(" ");
    expect(toPrefixTsQuery(many).split(" & ")).toHaveLength(8);
  });
});
