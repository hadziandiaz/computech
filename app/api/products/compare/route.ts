import { NextResponse } from "next/server";

import { getProductsByIds } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[0-9a-f-]{36}$/i.test(id))
    .slice(0, 4);

  if (!ids.length) {
    return NextResponse.json({ products: [] });
  }

  const products = await getProductsByIds(ids);
  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "no-store" } },
  );
}
