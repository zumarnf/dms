import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, Badge } from "@/shared/ui/atoms";

describe("Button", () => {
  it("renders children and applies the primary variant by default", () => {
    render(<Button>Simpan</Button>);
    const btn = screen.getByRole("button", { name: "Simpan" });
    expect(btn.className).toContain("bg-primary");
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Klik" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is not clickable when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Nonaktif
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Nonaktif" })).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge variant="success">Aktif</Badge>);
    expect(screen.getByText("Aktif")).toBeInTheDocument();
  });
});
