import "server-only";

import { PRODUCT_CARD_SELECT, mapProduct } from "@/lib/data/mappers";
import { applyPromotions, getActivePromotions } from "@/lib/data/promotions";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { PcBuild, PcBuildItem, Product } from "@/types/domain";

const BUILD_SELECT = `
  *,
  items:pc_build_items(
    *,
    product:products(${PRODUCT_CARD_SELECT})
  )
`;

function hydrateBuild(row: any, promotions: Awaited<ReturnType<typeof getActivePromotions>>) {
  const items = ((row.items ?? []) as any[]).map((item) => {
    const raw = Array.isArray(item.product) ? item.product[0] : item.product;
    const product: Product | undefined = raw ? mapProduct(raw) : undefined;
    return {
      ...item,
      product: product
        ? applyPromotions([product], promotions)[0]
        : undefined,
    } satisfies PcBuildItem;
  });
  return { ...(row as PcBuild), items } satisfies PcBuild;
}

export async function getUserBuilds(userId: string): Promise<PcBuild[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("pc_builds")
    .select(BUILD_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  const promotions = await getActivePromotions();
  return data.map((row: any) => hydrateBuild(row, promotions));
}

export async function getUserBuild(
  userId: string,
  buildId: string,
): Promise<PcBuild | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("pc_builds")
    .select(BUILD_SELECT)
    .eq("user_id", userId)
    .eq("id", buildId)
    .maybeSingle();
  if (error || !data) return null;
  return hydrateBuild(data, await getActivePromotions());
}

export async function getPublicBuild(slug: string): Promise<PcBuild | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("pc_builds")
    .select(BUILD_SELECT)
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (error || !data) return null;
  return hydrateBuild(data, await getActivePromotions());
}

export async function getBuildBySlugForUser(
  userId: string,
  slug: string,
): Promise<PcBuild | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("pc_builds")
    .select(BUILD_SELECT)
    .eq("share_slug", slug)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return hydrateBuild(data, await getActivePromotions());
}
