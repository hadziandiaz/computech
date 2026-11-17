import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { saveProductAction } from "@/lib/actions/admin/catalog";
import type { Brand, Category, Product } from "@/types/domain";

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
}) {
  const images = (product?.images ?? []).map((image) => image.url).join("\n");
  const specs = (product?.specifications ?? [])
    .map((spec) => `${spec.name} | ${spec.value}`)
    .join("\n");

  return (
    <ActionForm action={saveProductAction} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-base font-semibold">Identity</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Product name" htmlFor="name" required className="md:col-span-2">
            <Input id="name" name="name" defaultValue={product?.name} required />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Leave blank to generate from the name.">
            <Input id="slug" name="slug" defaultValue={product?.slug} />
          </Field>
          <Field label="SKU" htmlFor="sku" required>
            <Input id="sku" name="sku" defaultValue={product?.sku} required />
          </Field>
          <Field label="Brand" htmlFor="brand_id">
            <Select id="brand_id" name="brand_id" defaultValue={product?.brand_id ?? ""}>
              <option value="">Unbranded</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" htmlFor="category_id">
            <Select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""}>
              <option value="">Uncategorised</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.parent_id ? "— " : ""}
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Short description" htmlFor="short_description" className="md:col-span-2">
            <Textarea
              id="short_description"
              name="short_description"
              rows={2}
              maxLength={300}
              defaultValue={product?.short_description ?? ""}
            />
          </Field>
          <Field label="Full description" htmlFor="description" className="md:col-span-2">
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={product?.description ?? ""}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-base font-semibold">Pricing and stock</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Price (IDR)" htmlFor="price" required>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1000}
              defaultValue={product?.price ?? 0}
              required
            />
          </Field>
          <Field label="Discount price" htmlFor="discount_price" hint="Blank when not discounted.">
            <Input
              id="discount_price"
              name="discount_price"
              type="number"
              min={0}
              step={1000}
              defaultValue={product?.discount_price ?? ""}
            />
          </Field>
          <Field label="Stock on hand" htmlFor="stock" required>
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              defaultValue={product?.inventory?.stock ?? 0}
              required
            />
          </Field>
          <Field label="Low-stock threshold" htmlFor="low_stock_threshold">
            <Input
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              min={0}
              defaultValue={product?.inventory?.low_stock_threshold ?? 5}
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={product?.status ?? "active"}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Weight (grams)" htmlFor="weight_grams">
            <Input
              id="weight_grams"
              name="weight_grams"
              type="number"
              min={0}
              defaultValue={product?.weight_grams ?? 0}
            />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-[13px]">
            <Checkbox name="is_featured" defaultChecked={product?.is_featured} />
            Feature on the storefront
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-base font-semibold">Warranty</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Duration (months)" htmlFor="warranty_months">
            <Input
              id="warranty_months"
              name="warranty_months"
              type="number"
              min={0}
              max={120}
              defaultValue={product?.warranty_months ?? 12}
            />
          </Field>
          <Field label="Warranty type" htmlFor="warranty_type">
            <Select id="warranty_type" name="warranty_type" defaultValue={product?.warranty_type ?? "manufacturer"}>
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="store">Store</option>
              <option value="none">None</option>
            </Select>
          </Field>
          <Field label="Warranty provider" htmlFor="warranty_provider">
            <Input
              id="warranty_provider"
              name="warranty_provider"
              defaultValue={product?.warranty_provider ?? ""}
              placeholder="e.g. COMPUTECH official"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-base font-semibold">Media and specifications</h2>
        <div className="mt-4 grid gap-4">
          <Field
            label="Image URLs"
            htmlFor="image_urls"
            hint="One https URL per line. The first image becomes the primary image."
          >
            <Textarea id="image_urls" name="image_urls" rows={3} defaultValue={images} />
          </Field>
          <Field
            label="Specifications"
            htmlFor="specifications"
            hint="One per line in the form Name | Value. Example: Socket | AM5"
          >
            <Textarea id="specifications" name="specifications" rows={6} defaultValue={specs} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Meta title" htmlFor="meta_title">
              <Input
                id="meta_title"
                name="meta_title"
                maxLength={160}
                defaultValue={product?.meta_title ?? ""}
              />
            </Field>
            <Field label="Meta description" htmlFor="meta_description">
              <Input
                id="meta_description"
                name="meta_description"
                maxLength={320}
                defaultValue={product?.meta_description ?? ""}
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingText="Saving product…">
          {product ? "Save product" : "Create product"}
        </SubmitButton>
        <p className="text-[11px] text-muted">
          Inventory, images and specifications are replaced with the values above when saved.
        </p>
      </div>
    </ActionForm>
  );
}
