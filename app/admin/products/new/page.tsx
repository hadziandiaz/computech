import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";

export const metadata = {
  title: "New product",
};

export default async function AdminNewProductPage() {
  const [categories, brands] = await Promise.all([getCategories(false), getBrands(false)]);

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
        title="New product"
        description="Create a product record, its inventory row, images and specification list in one save."
      />
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
