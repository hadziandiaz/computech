import { describe, expect, it } from "vitest";

import { computeShippingQuotes } from "@/lib/shipping/quotes";
import type {
  ShippingMethod,
  ShippingZone,
  ShippingZoneRate,
} from "@/types/domain";

const methods = [
  {
    id: "m1",
    name: "Reguler",
    courier: "JNE",
    description: null,
    cost: 15000,
    estimated_days: "2-3 days",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "m2",
    name: "Ekspres",
    courier: "JNE",
    description: null,
    cost: 30000,
    estimated_days: "1 day",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "m3",
    name: "Nonaktif",
    courier: "POS",
    description: null,
    cost: 10000,
    estimated_days: "4 days",
    is_active: false,
    sort_order: 3,
  },
] as ShippingMethod[];

const zones = [
  {
    id: "z1",
    code: "jabodetabek",
    name: "Jabodetabek",
    description: null,
    matchers: ["jakarta", "depok"],
    is_active: true,
    sort_order: 1,
  },
  {
    id: "z2",
    code: "luar_jawa",
    name: "Luar Jawa",
    description: null,
    matchers: [],
    is_active: true,
    sort_order: 2,
  },
] as ShippingZone[];

const rates = [
  { id: "r1", zone_id: "z1", method_id: "m1", cost: 12000 },
  { id: "r2", zone_id: "z1", method_id: "m2", cost: 25000 },
  { id: "r3", zone_id: "z2", method_id: "m1", cost: 32000 },
] as ShippingZoneRate[];

describe("computeShippingQuotes", () => {
  it("matches a zone token from province, city or district", () => {
    const quotes = computeShippingQuotes(
      methods,
      zones,
      rates,
      { province: "DKI Jakarta", city: "Kota Jakarta Selatan", district: "Kebayoran" },
    );
    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toMatchObject({
      method_id: "m1",
      cost: 12000,
      zone_code: "jabodetabek",
    });
  });

  it("uses the empty-token zone as a fallback", () => {
    const quotes = computeShippingQuotes(
      methods,
      zones,
      rates,
      { province: "Sulawesi Selatan", city: "Kota Makassar", district: "Bonto" },
    );
    expect(quotes[0]).toMatchObject({
      cost: 32000,
      zone_code: "luar_jawa",
    });
    expect(quotes[1]).toMatchObject({ cost: 30000, zone_code: "luar_jawa" });
  });

  it("falls back to the method cost when a rate is missing", () => {
    const quotes = computeShippingQuotes(
      methods,
      zones,
      rates,
      { province: "Jawa Barat", city: "Kota Bandung", district: "Coblong" },
    );
    expect(quotes[0]).toMatchObject({ cost: 32000, zone_code: "luar_jawa" });
  });
});
