import type {
  ShippingAddressSnapshot,
  ShippingMethod,
  ShippingQuote,
  ShippingZone,
  ShippingZoneRate,
} from "@/types/domain";

/** Pure fallback used when the SQL quote RPC is unavailable. The RPC remains
 * authoritative when placing the order. */
export function computeShippingQuotes(
  methods: ShippingMethod[],
  zones: ShippingZone[],
  rates: ShippingZoneRate[],
  address: Pick<ShippingAddressSnapshot, "province" | "city" | "district">,
): ShippingQuote[] {
  const haystack = [address.province, address.city, address.district]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("id-ID");

  const zone =
    zones
      .filter(
        (candidate) =>
          candidate.matchers.length === 0 ||
          candidate.matchers.some((token) =>
            haystack.includes(token.toLocaleLowerCase("id-ID")),
          ),
      )
      .sort((a, b) => {
        const aFallback = a.matchers.length === 0 ? 1 : 0;
        const bFallback = b.matchers.length === 0 ? 1 : 0;
        return aFallback - bFallback || a.sort_order - b.sort_order;
      })[0] ?? null;

  return methods
    .filter((method) => method.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((method) => {
      const rate = zone
        ? rates.find(
            (candidate) =>
              candidate.zone_id === zone.id && candidate.method_id === method.id,
          )
        : undefined;
      return {
        method_id: method.id,
        cost: Math.max(0, rate?.cost ?? method.cost),
        zone_id: zone?.id ?? null,
        zone_code: zone?.code ?? null,
        zone_name: zone?.name ?? null,
      };
    });
}
