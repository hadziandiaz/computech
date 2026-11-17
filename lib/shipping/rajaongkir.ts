import "server-only";

import { shippingConfig } from "@/lib/env";

export interface ShippingQuote {
  courier: string;
  service: string;
  description: string;
  cost: number;
  estimatedDays: string;
}

interface RajaOngkirCost {
  service: string;
  description: string;
  cost: Array<{ value: number; etd: string; note?: string }>;
}

/**
 * Optional live shipping quote adapter. The storefront still uses staff
 * maintained shipping_methods by default (manual mode). Enable by setting
 * SHIPPING_PROVIDER=rajaongkir plus the API key and origin city id.
 */
export async function getRajaOngkirQuotes(input: {
  destinationCityId: string;
  weightGrams: number;
  courier?: string;
}): Promise<ShippingQuote[]> {
  const { rajaongkirApiKey, originCityId } = shippingConfig;
  if (!rajaongkirApiKey || !originCityId) return [];

  const body = new URLSearchParams({
    origin: originCityId,
    destination: input.destinationCityId,
    weight: String(Math.max(1, input.weightGrams)),
    courier: input.courier ?? "jne",
  });

  const response = await fetch("https://api.rajaongkir.com/starter/cost", {
    method: "POST",
    headers: {
      key: rajaongkirApiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) return [];
  const data = (await response.json().catch(() => null)) as
    | { rajaongkir?: { results?: Array<{ code: string; costs?: RajaOngkirCost[] }> } }
    | null;

  const results = data?.rajaongkir?.results ?? [];
  return results.flatMap((result) =>
    (result.costs ?? []).flatMap((service) =>
      service.cost.map((cost) => ({
        courier: result.code.toUpperCase(),
        service: service.service,
        description: service.description,
        cost: cost.value,
        estimatedDays: cost.etd ? `${cost.etd} days` : "Contact us",
      })),
    ),
  );
}
