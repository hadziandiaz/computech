import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Cpu,
  Gift,
  Headphones,
  Laptop,
  Layers3,
  Monitor,
  PackageCheck,
  Percent,
  Router,
  ShieldCheck,
  Smartphone,
  TicketPercent,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBrands } from "@/lib/data/brands";
import { getCategoryTree } from "@/lib/data/categories";
import { primaryImage } from "@/lib/data/mappers";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/data/products";
import { getActivePromotions } from "@/lib/data/promotions";
import { formatDateRange, formatIDR } from "@/lib/format";
import { productUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "COMPUTECH — Laptop, PC, Komponen & Networking",
  description:
    "Belanja laptop, komponen PC, dan perangkat networking dengan harga live. Susun PC kompatibel dengan PC Builder COMPUTECH.",
};

const categoryIcons = [
  Laptop,
  Cpu,
  Router,
  Monitor,
  Boxes,
  Wrench,
  Smartphone,
  Layers3,
  PackageCheck,
  Headphones,
];

const quickBenefits = [
  { icon: Truck, title: "Pengiriman fleksibel", detail: "Pilih kurir saat checkout" },
  { icon: ShieldCheck, title: "Garansi tercatat", detail: "Detail per produk & pesanan" },
  { icon: BadgeCheck, title: "Stok dan harga live", detail: "Dari database COMPUTECH" },
  { icon: Headphones, title: "Bantuan cepat", detail: "CS siap bantu spesifikasi" },
];

export default async function HomePage() {
  const [categories, featured, bestSellers, newArrivals, promotions, brands] =
    await Promise.all([
      getCategoryTree(),
      getFeaturedProducts(10),
      getBestSellers(5),
      getNewArrivals(5),
      getActivePromotions(),
      getBrands(),
    ]);

  const heroProduct = featured[0] ?? bestSellers[0] ?? null;
  const heroImage = heroProduct ? primaryImage(heroProduct) : null;
  const topCategories = categories.slice(0, 10);
  const flashProducts = (featured.length ? featured : bestSellers).slice(0, 5);
  const sidePromotions = promotions.slice(0, 4);

  return (
    <>
      {/* MARKETPLACE HERO */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#6b46f5] via-violet to-[#9d7bff] px-5 py-7 text-white sm:px-8 sm:py-9">
            <div className="absolute -right-16 -top-24 size-64 rounded-full bg-neon/25 blur-3xl" aria-hidden />
            <div className="absolute bottom-0 right-0 h-24 w-40 bg-white/5 blur-2xl" aria-hidden />
            <div className="relative max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                <Zap className="size-3 fill-acid text-acid" /> Store resmi COMPUTECH
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-[42px]">
                Semua kebutuhan PC,
                <br />
                <span className="text-acid">satu tempat.</span>
              </h1>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75 sm:text-sm">
                Laptop, komponen, dan networking dengan stok serta harga langsung dari
                database. Susun build yang kompatibel tanpa menebak.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/products"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className:
                      "border-white/30 bg-white text-violet-dark hover:bg-violet-soft",
                  })}
                >
                  Belanja sekarang <ArrowRight />
                </Link>
                <Link
                  href="/pc-builder"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-white/40 bg-transparent text-white hover:bg-white/10",
                  })}
                >
                  <Cpu /> PC Builder
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-white/75">
                <span>{featured.length}+ produk pilihan</span>
                <span>{categories.length} kategori</span>
                <span>{brands.length} brand</span>
              </div>
            </div>
          </div>

          <Link
            href={heroProduct ? `/products/${heroProduct.slug}` : "/products"}
            className="group relative min-h-52 overflow-hidden rounded-xl border border-line bg-mist sm:min-h-60 lg:min-h-full"
          >
            {heroImage ? (
              <Image
                src={heroImage}
                alt={heroProduct?.name ?? "Produk COMPUTECH"}
                fill
                priority
                sizes="(min-width: 1024px) 340px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-violet/30">
                <Boxes className="size-16" />
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <Badge className="border-0 bg-coral text-white">Pilihan hari ini</Badge>
              <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-white">
                {heroProduct?.name ?? "Jelajahi katalog COMPUTECH"}
              </p>
              {heroProduct ? (
                <p className="mt-1 text-[13px] font-bold text-acid">
                  {formatIDR(heroProduct.effective_price ?? productUnitPrice(heroProduct))}
                </p>
              ) : null}
            </div>
          </Link>
        </div>

        <div className="border-t border-line">
          <div className="container-page grid grid-cols-2 gap-x-4 gap-y-3 py-4 sm:grid-cols-4">
            {quickBenefits.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-soft text-violet">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-bold">{title}</p>
                  <p className="truncate text-[10px] text-muted">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY ICON GRID */}
      <section className="container-page py-7 lg:py-9">
        <SectionHeading
          title="Belanja berdasarkan kategori"
          description="Pilih bagian yang sedang kamu butuhkan."
          action={
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-[12px] font-bold text-violet hover:text-violet-dark"
            >
              Lihat semua <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
          {topCategories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center gap-2 rounded-lg p-2 text-center transition-colors hover:bg-violet-soft/50"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-violet-soft text-violet transition-colors group-hover:bg-violet group-hover:text-white sm:size-14">
                  <Icon className="size-5 sm:size-6" />
                </span>
                <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-ink sm:text-[11px]">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROMO STRIP */}
      {sidePromotions.length ? (
        <section className="bg-violet-soft/40 py-7">
          <div className="container-page">
            <SectionHeading
              eyebrow="Promo aktif"
              title="Penawaran yang lagi berjalan"
              action={
                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-violet hover:text-violet-dark"
                >
                  Semua promo <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {sidePromotions.map((promotion, index) => (
                <Link
                  key={promotion.id}
                  href={`/promotions/${promotion.slug}`}
                  className={cn(
                    "relative flex min-w-[240px] shrink-0 flex-col justify-between overflow-hidden rounded-lg p-4 transition-transform hover:-translate-y-0.5 sm:min-w-0",
                    index % 2 === 0 ? "bg-white" : "bg-ink text-white",
                  )}
                >
                  <span
                    className={cn(
                      "absolute -right-8 -top-8 size-24 rounded-full blur-2xl",
                      index % 2 === 0 ? "bg-coral/20" : "bg-violet/40",
                    )}
                    aria-hidden
                  />
                  <div className="relative flex items-center justify-between gap-2">
                    <Badge tone={index % 2 === 0 ? "coral" : "violet"} className="border-0">
                      <TicketPercent className="size-3" /> Promo
                    </Badge>
                    <Percent className={cn("size-4", index % 2 === 0 ? "text-coral" : "text-acid")} />
                  </div>
                  <div className="relative mt-6">
                    <p className="line-clamp-2 text-sm font-bold leading-snug">{promotion.name}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        index % 2 === 0 ? "text-muted" : "text-white/60",
                      )}
                    >
                      {formatDateRange(promotion.start_date, promotion.end_date)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FLASH DEALS */}
      {flashProducts.length ? (
        <section className="container-page py-8 lg:py-10">
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-violet px-4 py-3 text-white sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/15">
                  <Zap className="size-4 fill-acid text-acid" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold leading-tight sm:text-lg">
                    Pilihan spesial hari ini
                  </h2>
                  <p className="text-[11px] text-white/70">
                    Produk unggulan dengan stok dan harga langsung dari katalog.
                  </p>
                </div>
              </div>
              <Link
                href="/promotions"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-acid hover:text-white"
              >
                Lihat semua <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="bg-white p-3 sm:p-4">
              <ProductGrid products={flashProducts} compact />
            </div>
          </div>
        </section>
      ) : null}

      {/* RECOMMENDATIONS */}
      <section className="border-y border-line bg-mist/60 py-8 lg:py-10">
        <div className="container-page">
          <SectionHeading
            eyebrow="Rekomendasi"
            title="Produk yang paling relevan"
            description="Pilihan dari katalog aktif COMPUTECH, diurutkan dari fitur dan popularitas."
            action={
              <Link
                href="/products"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Semua produk <ArrowRight />
              </Link>
            }
          />
          {featured.length ? (
            <div className="mt-5">
              <ProductGrid products={featured} />
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-line bg-white p-10 text-center">
              <p className="font-display text-lg font-bold">Katalog belum tersedia</p>
              <p className="mt-1 text-sm text-muted">
                Produk akan muncul otomatis setelah data Supabase tersedia.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* PC BUILDER CTA */}
      <section className="container-page py-8 lg:py-10">
        <div className="grid overflow-hidden rounded-xl bg-ink text-white lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 tech-grid opacity-60" aria-hidden />
            <div className="absolute -right-20 -top-20 size-56 rounded-full bg-violet/30 blur-3xl" aria-hidden />
            <div className="relative">
              <Badge className="border-white/20 bg-white/10 text-white">
                <Cpu className="size-3 text-neon" /> PC Builder
              </Badge>
              <h2 className="mt-3 max-w-lg font-display text-2xl font-bold leading-tight sm:text-3xl">
                Rakit PC tanpa takut salah kompatibilitas.
              </h2>
              <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-white/65">
                Kami cek socket, tipe memory, ukuran casing, dan daya saat kamu
                mengganti komponen.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/pc-builder"
                  className={buttonVariants({ size: "sm", className: "bg-acid text-ink hover:bg-[#cbf02f]" })}
                >
                  Mulai build <ArrowRight />
                </Link>
                <Link
                  href="/compare"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-white/25 bg-transparent text-white hover:bg-white/10",
                  })}
                >
                  Bandingkan produk
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neon">
              Yang diperiksa
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                "Socket & chipset",
                "Tipe dan slot memory",
                "Ukuran GPU & casing",
                "Daya dan konektor PSU",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[13px] text-white/80">
                  <ShieldCheck className="size-4 shrink-0 text-acid" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      {bestSellers.length ? (
        <section className="container-page py-6 lg:py-8">
          <SectionHeading
            eyebrow="Terlaris"
            title="Paling banyak dipilih"
            action={
              <Link
                href="/products?sort=popular"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-violet hover:text-violet-dark"
              >
                Lihat semua <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="mt-5">
            <ProductGrid products={bestSellers} compact />
          </div>
        </section>
      ) : null}

      {/* NEW ARRIVALS */}
      {newArrivals.length ? (
        <section className="container-page py-6 lg:py-8">
          <SectionHeading
            eyebrow="Baru masuk"
            title="Produk terbaru di katalog"
            action={
              <Link
                href="/products?sort=newest"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-violet hover:text-violet-dark"
              >
                Lihat semua <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="mt-5">
            <ProductGrid products={newArrivals} compact />
          </div>
        </section>
      ) : null}

      {/* CAMPAIGN CTA */}
      {sidePromotions[0] ? (
        <section className="container-page py-6 lg:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet/20 bg-violet-soft p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet text-white">
                <Gift className="size-5" />
              </span>
              <div>
                <p className="font-display text-base font-bold">Ada promo yang sedang aktif</p>
                <p className="mt-1 text-[13px] text-muted">
                  {sidePromotions[0].name} — berlaku sampai{" "}
                  {formatDateRange(sidePromotions[0].start_date, sidePromotions[0].end_date)}.
                </p>
              </div>
            </div>
            <Link
              href={`/promotions/${sidePromotions[0].slug}`}
              className={buttonVariants({ size: "sm" })}
            >
              Lihat detail promo <ArrowRight />
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
