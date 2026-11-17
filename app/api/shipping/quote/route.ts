import { NextResponse } from "next/server";
import { z } from "zod";

import { getShippingMethods } from "@/lib/data/shipping";
import { shippingConfig } from "@/lib/env";
import { getRajaOngkirQuotes } from "@/lib/shipping/rajaongkir";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const quoteSchema = z.object({
  destination_city_id: z.string().trim().max(40).optional(),
  weight_grams: z.coerce.number().int().min(1).max(200_000).optional(),
  courier: z.string().trim().max(20).optional(),
});

async function manualQuotes() {
  const methods = await getShippingMethods(true);
  return methods.map((method) => ({
    id: method.id,
    courier: method.courier,
    service: method.name,
    description: method.description ?? method.name,
    cost: method.cost,
    estimatedDays: method.estimated_days,
  }));
}

export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = quoteSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid quote request." },
      { status: 400 },
    );
  }

  const manual = await manualQuotes();

  if (
    shippingConfig.provider === "rajaongkir" &&
    shippingConfig.rajaongkirApiKey &&
    shippingConfig.originCityId &&
    parsed.data.destination_city_id
  ) {
    const live = await getRajaOngkirQuotes({
      destinationCityId: parsed.data.destination_city_id,
      weightGrams: parsed.data.weight_grams ?? 1000,
      courier: parsed.data.courier,
    });
    if (live.length) {
      return NextResponse.json(
        { ok: true, source: "rajaongkir", quotes: live },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  return NextResponse.json(
    { ok: true, source: "manual", quotes: manual },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const manual = await manualQuotes();
  return NextResponse.json(
    { ok: true, source: "manual", quotes: manual },
    { headers: { "Cache-Control": "no-store" } },
  );
}
