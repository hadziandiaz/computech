import { ArrowLeft, Cpu, PackageCheck, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-violet-dark via-violet to-[#9b7cff] p-10 text-white lg:flex lg:flex-col">
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-neon/20 blur-3xl" aria-hidden />
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="relative">
          <Logo tone="light" />
        </div>

        <div className="relative my-auto max-w-md py-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-acid">
            Akun COMPUTECH
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight">
            Satu akun untuk semua kebutuhan build kamu.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Masuk untuk checkout, menyimpan cart, PC build, riwayat pesanan, dan garansi
            dalam satu tempat.
          </p>

          <div className="mt-7 space-y-2.5">
            {[
              { icon: ShoppingBag, title: "Pesanan dan pembayaran", detail: "Status, instruksi transfer, dan resi." },
              { icon: Cpu, title: "PC build tersimpan", detail: "Simpan, bagikan, atau cetak daftar part." },
              { icon: ShieldCheck, title: "Catatan garansi", detail: "Ikuti periode garansi setiap pesanan." },
              { icon: PackageCheck, title: "Lacak Pengiriman", detail: "Cek posisi paket dari akun kamu." },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm"
              >
                <item.icon className="mt-0.5 size-4 shrink-0 text-acid" />
                <div>
                  <p className="text-[12px] font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] text-white/50">
          COMPUTECH · Build Your Setup. Define Your Performance.
        </div>
      </aside>

      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-8">
          <Logo />
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-violet/40 bg-violet-soft/60 text-violet-dark hover:bg-violet-soft",
            )}
          >
            <ArrowLeft />
            Kembali ke toko
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        <div className="px-5 pb-6 text-center text-[11px] text-muted">
          <Link href="/privacy" className="hover:text-ink">
            Privasi
          </Link>
          <span className="mx-2 text-line">|</span>
          <Link href="/terms" className="hover:text-ink">
            Ketentuan
          </Link>
        </div>
      </main>
    </div>
  );
}
