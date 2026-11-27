import {
  ArrowRight,
  Boxes,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  MemoryStick,
  Monitor,
  Power,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/store/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "PC Components",
  description:
    "Beli komponen PC satuan: processor, motherboard, VGA, RAM, SSD, casing, pendingin dan power supply dari katalog live COMPUTECH.",
};

const pillars = [
  { icon: Cpu, title: "Processor", detail: "CPU untuk gaming, kerja dan server.", slug: "processor" },
  { icon: CircuitBoard, title: "Motherboard", detail: "Socket, chipset dan form factor jelas.", slug: "motherboard" },
  { icon: Monitor, title: "Graphics Card", detail: "VGA untuk gaming dan rendering.", slug: "graphics-card" },
  { icon: MemoryStick, title: "RAM", detail: "DDR4 dan DDR5 sesuai motherboard.", slug: "ram" },
  { icon: HardDrive, title: "SSD & HDD", detail: "Storage NVMe, SATA dan hard disk.", slug: "ssd" },
  { icon: Power, title: "Power Supply", detail: "Daya dan sertifikasi tertampil.", slug: "power-supply" },
  { icon: Fan, title: "CPU Cooler", detail: "Pendingin udara dan cairan.", slug: "cpu-cooler" },
  { icon: Boxes, title: "PC Case", detail: "Casing dengan ukuran pendukung jelas.", slug: "pc-case" },
  { icon: Fan, title: "Case Fan", detail: "Kipas casing dan airflow tambahan.", slug: "case-fan" },
  { icon: HardDrive, title: "Hard Disk", detail: "Penyimpanan kapasitas besar.", slug: "hdd" },
];

const highlights = [
  { icon: ShieldCheck, title: "Data live", detail: "Harga, stok dan spesifikasi dari Supabase." },
  { icon: CircuitBoard, title: "Spesifikasi jelas", detail: "Socket, memori dan daya tercatat." },
  { icon: ShoppingCart, title: "Beli satuan", detail: "Beli satu komponen atau beberapa sekaligus." },
  { icon: Cpu, title: "Builder tetap terpisah", detail: "Cek kecocokan ada di PC Builder." },
];

export default async function PcComponentsPage() {
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: "pc-components", sort: "featured", perPage: 20 }),
    getCategories(),
  ]);

  const root = categories.find((category) => category.slug === "pc-components");
  const children = categories.filter((category) => category.parent_id === root?.id);

  return (
    <>
      <PageHero
        eyebrow="PC Components"
        title={
          <>
            Semua komponen PC.
            <br />
            <span className="text-violet">Beli satuan atau rakit sendiri.</span>
          </>
        }
        description="Halaman ini khusus untuk beli komponen PC per bagian: processor, motherboard, VGA, RAM, storage, casing, pendingin dan power supply. Untuk cek kecocokan otomatis, gunakan PC Builder."
        crumbs={[{ label: "PC Components" }]}
        actions={
          <>
            <Link href="/products?category=pc-components" className={buttonVariants({ size: "md" })}>
              Beli komponen <ArrowRight />
            </Link>
            <Link
              href="/pc-builder"
              className={cn(
                buttonVariants({ variant: "outline", size: "md" }),
                "border-white/20 bg-transparent text-white hover:border-white/50 hover:bg-white/10",
              )}
            >
              Buka PC Builder
            </Link>
          </>
        }
        aside={
          <div className="grid grid-cols-2 gap-2">
            {highlights.map((highlight) => (
              <div key={highlight.title} className="rounded-xl bg-white/5 px-3 py-2.5">
                <highlight.icon className="size-4 text-violet" />
                <p className="mt-1.5 text-[11px] font-bold">{highlight.title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/60">{highlight.detail}</p>
              </div>
            ))}
          </div>
        }
      />

      <section className="border-b border-line bg-white">
        <div className="container-page grid gap-2 py-6 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar) => {
            const category = categories.find((item) => item.slug === pillar.slug);
            return (
              <Link
                key={pillar.slug}
                href={category ? `/categories/${category.slug}` : "/categories/pc-components"}
                className="group flex items-start gap-3 rounded-2xl border border-line px-4 py-3.5 transition-colors hover:border-violet/30 hover:bg-mist/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-soft text-violet-dark">
                  <pillar.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">{pillar.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{pillar.detail}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <SectionHeading
          eyebrow="PC component catalog"
          title="Komponen tersedia"
          description="Semua bagian PC yang bisa dibeli satuan. Buka produk untuk melihat spesifikasi dan stok terbaru."
          action={
            <Link
              href="/products?category=pc-components"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Lihat semua
            </Link>
          }
        />
        {products.products.length ? (
          <ProductGrid products={products.products} className="mt-6" />
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-semibold">Belum ada komponen</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Tambahkan produk dari admin console untuk mengisi halaman ini.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-white py-10 lg:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-line bg-mist/40 p-5 sm:p-6">
            <p className="eyebrow text-violet">Beli per bagian</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
              Butuh satu komponen saja?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Pilih kategori lalu bandingkan harga dan stok tanpa harus merakit satu build penuh.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(children.length ? children : pillars.map((item) => ({ slug: item.slug, name: item.title }))).map(
                (child) => (
                  <Link
                    key={child.slug}
                    href={`/categories/${child.slug}`}
                    className="rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-medium transition-colors hover:border-violet/30 hover:text-violet-dark"
                  >
                    {child.name}
                  </Link>
                ),
              )}
            </div>
            <Link href="/categories/pc-components" className={buttonVariants({ variant: "dark", size: "sm" })}>
              Semua kategori komponen
            </Link>
          </div>
          <div className="rounded-3xl bg-violet p-6 text-white sm:p-8">
            <p className="eyebrow text-white/70">Rakit PC</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Mau dicek kecocokannya?</h2>
            <p className="mt-2 text-sm text-white/75">
              PC Builder memeriksa socket, generasi RAM, slot, ukuran GPU, pendingin dan daya PSU
              sebelum kamu checkout. Beda dengan halaman ini yang fokus ke beli satuan.
            </p>
            <Link
              href="/pc-builder"
              className={cn(buttonVariants({ variant: "dark", size: "sm" }), "mt-5")}
            >
              Buka PC Builder <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
