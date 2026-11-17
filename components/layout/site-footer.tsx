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

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export async function SiteFooter() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);
  const topCategories = categories.filter((category) => !category.parent_id).slice(0, 5);

  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="container-page">
        <div className="grid gap-10 border-b border-white/10 py-14 lg:grid-cols-[1.25fr_1fr_1fr_1.15fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
              {settings.store_tagline}. Systems, components, networking equipment and
              accessories selected for people who care how their machines perform.
            </p>
            {settings.store_email || settings.store_whatsapp || settings.store_address ? (
              <ul className="mt-5 space-y-2 text-[12px] text-white/60">
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
            <h3 className="eyebrow text-white/40">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-7 text-white/40">Categories</h3>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {topCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-white/40">Support</h3>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-7 text-white/40">Company</h3>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <li>
                <Link href="/about" className="text-white/70 hover:text-white">
                  About COMPUTECH
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-white/70 hover:text-white">
                  Brands
                </Link>
              </li>
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-white/40">The build list</h3>
            <p className="mt-4 font-display text-xl font-semibold leading-snug tracking-tight">
              Better parts. Better builds. Straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col gap-4 py-7">
          <div className="flex flex-col gap-2 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {settings.store_name}. All prices in Indonesian Rupiah.
            </p>
            <p className="max-w-xl text-white/30">{demoDisclaimer}</p>
          </div>
          <p className="font-display text-[10vw] font-bold leading-none tracking-[-0.06em] text-white/[0.045] sm:text-[76px]">
            BUILD YOUR SETUP.
          </p>
        </div>
      </div>
    </footer>
  );
}
