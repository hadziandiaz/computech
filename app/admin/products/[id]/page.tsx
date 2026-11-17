import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";
import { InlineButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { deleteProductAction } from "@/lib/actions/admin/catalog";
import { getAuthUser } from "@/lib/auth";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { getProductById } from "@/lib/data/products";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Edit product",
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands, user] = await Promise.all([
    getProductById(id),
    getCategories(false),
    getBrands(false),
    getAuthUser(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to products
      </Link>
      <AdminHeader
        eyebrow="Catalog"
        title={product.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={product.status === "active" ? "success" : "neutral"}>
              {product.status.replaceAll("_", " ")}
            </Badge>
            <span className="font-mono text-[11px]">{product.sku}</span>
            <span className="text-[11px] text-muted">Updated {formatDate(product.updated_at)}</span>
            {product.is_demo ? <Badge tone="warning">Demo data</Badge> : null}
          </span>
        }
        actions={
          <>
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink /> View on store
            </Link>
            {user?.role === "admin" ? (
              <InlineButton
                action={deleteProductAction.bind(null, product.id)}
                variant="danger-ghost"
                size="sm"
                confirm={`Permanently delete ${product.name}? Order history keeps its snapshots.`}
                pendingText="Deleting…"
              >
                <Trash2 /> Delete
              </InlineButton>
            ) : null}
          </>
        }
      />
      <ProductForm product={product} categories={categories} brands={brands} />
    </div>
  );
}
