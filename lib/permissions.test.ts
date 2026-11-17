import { describe, expect, it } from "vitest";

import type { UserRole } from "@/types/domain";
import { can, isAdmin, isStaff } from "@/lib/permissions";
import { clamp, initials, parseNumber, slugify, truncate } from "@/lib/utils";

describe("permissions", () => {
  it("grants every staff permission to administrators", () => {
    expect(can("admin", "admin.access")).toBe(true);
    expect(can("admin", "customers.write")).toBe(true);
    expect(can("admin", "roles.write")).toBe(true);
    expect(can("admin", "settings.write")).toBe(true);
  });

  it("limits staff to operational permissions", () => {
    expect(can("staff", "catalog.write")).toBe(true);
    expect(can("staff", "orders.write")).toBe(true);
    expect(can("staff", "customers.read")).toBe(true);
    expect(can("staff", "customers.write")).toBe(false);
    expect(can("staff", "roles.write")).toBe(false);
    expect(can("staff", "settings.write")).toBe(false);
  });

  it("gives customers no admin permissions", () => {
    expect(can("customer", "admin.access")).toBe(false);
    expect(can("customer", "catalog.read")).toBe(false);
  });

  it("treats a missing role as unauthenticated", () => {
    expect(can(null, "admin.access")).toBe(false);
    expect(can(undefined, "catalog.read")).toBe(false);
  });

  it("identifies staff and admin roles", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("staff")).toBe(false);
    expect(isStaff("admin")).toBe(true);
    expect(isStaff("staff")).toBe(true);
    expect(isStaff("customer")).toBe(false);
    const role: UserRole = "customer";
    expect(isStaff(role)).toBe(false);
  });
});

describe("utils", () => {
  it("slugifies product names", () => {
    expect(slugify("NVIDIA GeForce RTX 5080 — Founders Edition")).toBe(
      "nvidia-geforce-rtx-5080-founders-edition",
    );
    expect(slugify("  ASUS ROG Strix B650E-F  ")).toBe("asus-rog-strix-b650e-f");
  });

  it("derives initials for avatars", () => {
    expect(initials("Budi Santoso")).toBe("BS");
    expect(initials("COMPUTECH")).toBe("C");
    expect(initials(null)).toBe("CT");
  });

  it("clamps numbers into a range", () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-2, 0, 100)).toBe(0);
    expect(clamp(250, 0, 100)).toBe(100);
  });

  it("parses formatted rupiah input", () => {
    expect(parseNumber("Rp 1.250.000")).toBe(1_250_000);
    expect(parseNumber("1,250,000.50")).toBe(1_250_000.5);
    expect(parseNumber("1.250.000,50")).toBe(1_250_000.5);
    expect(parseNumber("2500000")).toBe(2_500_000);
    expect(parseNumber("", 42)).toBe(42);
    expect(parseNumber("not a number", 7)).toBe(7);
  });

  it("truncates long text without cutting mid-word when avoidable", () => {
    expect(truncate("Short", 10)).toBe("Short");
    expect(truncate("A very long product description", 12)).toBe("A very long…");
  });
});
