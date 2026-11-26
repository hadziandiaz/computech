import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { demoDisclaimer } from "@/lib/constants";
import { getCategories } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/settings";

import { NewsletterForm } from "./newsletter-form";

const shopLinks = [
  { label: "All products", href: "/products" },
  { label: "Laptops", href: "/laptops" },
  { label: "PC Builder", href: "/pc-builder" },
  { label: "Networking", href: "/networking" },
  { label: "Promotions", href: "/promotions" },
  { label: "Compare", href: "/compare" },
];

const supportLinks = [
  { label: "Contact us", href: "/contact" },
  { label: "Track order", href: "/track-order" },
  { label: "Shipping", href: "/shipping" },
  { label: "Warranty", href: "/warranty" },
  { label: "FAQ", href: "/faq" },
  { label: "My account", href: "/account" },
];

const companyLinks = [
  { label: "About COMPUTECH", href: "/about" },
  { label: "Brands", href: "/brands" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const linkClass =
  "text-[13px] text-white/70 transition-all hover:translate-x-0.5 hover:text-acid";

export async function SiteFooter() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);
  const topCategories = categories.filter((category) => !category.parent_id).slice(0, 3);

  return (
    <footer className="mt-14 border-t-4 border-acid bg-ink text-white">
      <div className="container-page">
        <div className="grid gap-8 border-b border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.15fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/55">
              {settings.store_tagline.replace(/\.$/, "")}. Laptops, parts and networking gear
              for people who care how their machines perform.
            </p>
            {settings.store_email || settings.store_whatsapp || settings.store_address ? (
              <ul className="mt-4 space-y-1.5 text-[12px] text-white/60">
                {settings.store_email ? (
                  <li className="flex items-start gap-2">
                    <Mail className="mt-0.5 size-3.5 text-neon" />
                    <a href={`mailto:${settings.store_email}`} className="hover:text-white">
                      {settings.store_email}
                    </a>
                  </li>
                ) : null}
                {settings.store_whatsapp ? (
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 size-3.5 text-neon" />
                    <a
                      href={`https://wa.me/${settings.store_whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white"
                    >
                      {settings.store_whatsapp}
                    </a>
                  </li>
                ) : null}
                {settings.store_address ? (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-3.5 text-neon" />
                    <span>{settings.store_address}</span>
                  </li>
                ) : null}
                {settings.store_hours ? (
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 size-3.5 text-neon" />
                    <span>{settings.store_hours}</span>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          <div>
            <h3 className="eyebrow text-acid/80">Belanja</h3>
            <ul className="mt-3 space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-5 text-acid/60">Kategori populer</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link href="/categories" className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60 hover:border-acid hover:text-acid">
                Semua
              </Link>
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60 hover:border-acid hover:text-acid"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="eyebrow text-acid/80">Bantuan</h3>
            <ul className="mt-3 space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-5 text-acid/60">Perusahaan</h3>
            <ul className="mt-2 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-acid/80">The build list</h3>
            <p className="mt-3 font-display text-lg font-black uppercase leading-tight tracking-[-0.03em]">
              Better parts. Better builds. Straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col gap-3 py-5">
          <div className="flex flex-col gap-2 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {settings.store_name}. All prices in Indonesian Rupiah.
            </p>
            <p className="max-w-xl text-white/30">{demoDisclaimer}</p>
          </div>
          <p className="hidden font-display text-[7vw] font-black uppercase leading-none tracking-[-0.06em] text-acid/[0.06] sm:block sm:text-[54px]">
            BUILD YOUR SETUP.
          </p>
        </div>
      </div>
    </footer>
  );
}
