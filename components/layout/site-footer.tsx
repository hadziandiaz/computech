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
  { label: "PC Components", href: "/pc-components" },
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

const linkClass = "text-[13px] text-muted transition-colors hover:text-violet";

export async function SiteFooter() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);
  const topCategories = categories.filter((category) => !category.parent_id).slice(0, 3);

  return (
    <footer className="mt-12 border-t border-line bg-white">
      <div className="container-page">
        <div className="grid gap-7 border-b border-line py-9 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1.1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted">
              {settings.store_tagline.replace(/\.$/, "")}. Laptops, parts and networking gear
              for people who care how their machines perform.
            </p>
            {settings.store_email || settings.store_whatsapp || settings.store_address ? (
              <ul className="mt-3 space-y-1.5 text-[12px] text-muted">
                {settings.store_email ? (
                  <li className="flex items-start gap-2">
                    <Mail className="mt-0.5 size-3.5 text-violet" />
                    <a href={`mailto:${settings.store_email}`} className="hover:text-ink">
                      {settings.store_email}
                    </a>
                  </li>
                ) : null}
                {settings.store_whatsapp ? (
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 size-3.5 text-violet" />
                    <a
                      href={`https://wa.me/${settings.store_whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink"
                    >
                      {settings.store_whatsapp}
                    </a>
                  </li>
                ) : null}
                {settings.store_address ? (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-3.5 text-violet" />
                    <span>{settings.store_address}</span>
                  </li>
                ) : null}
                {settings.store_hours ? (
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 size-3.5 text-violet" />
                    <span>{settings.store_hours}</span>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">Belanja</h3>
            <ul className="mt-3 space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
              Kategori populer
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link
                href="/categories"
                className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted hover:border-violet hover:text-violet"
              >
                Semua
              </Link>
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted hover:border-violet hover:text-violet"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">Bantuan</h3>
            <ul className="mt-3 space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
              Perusahaan
            </h3>
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

          <div className="rounded-xl bg-violet-soft p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-dark">
              The build list
            </h3>
            <p className="mt-2 font-display text-base font-bold leading-snug text-ink">
              Better parts. Better builds. Straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col gap-2 py-5 text-[11px] text-muted">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {settings.store_name}. All prices in Indonesian Rupiah.
            </p>
            <p className="max-w-xl text-muted/70">{demoDisclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
