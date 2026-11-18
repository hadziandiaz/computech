"use client";

import {
  ChevronDown,
  Cpu,
  GitCompareArrows,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { signOutAction } from "@/lib/actions/auth";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { publicNav } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

interface HeaderUser {
  name: string;
  email: string;
  staff: boolean;
}

interface NavCategory {
  name: string;
  slug: string;
  children: Array<{ name: string; slug: string }>;
}

export function HeaderClient({
  user,
  cartCount,
  categories,
}: {
  user: HeaderUser | null;
  cartCount: number;
  categories: NavCategory[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div
        className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet via-neon to-acid"
        aria-hidden
      />
      <div className="container-page flex h-[68px] items-center gap-3 lg:gap-6">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg text-ink hover:bg-mist lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Logo className="shrink-0" />

        <form onSubmit={submitSearch} className="relative hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search laptops, components, networking…"
            aria-label="Search products"
            className="h-10 w-full rounded-full border border-line bg-mist/70 pl-10 pr-4 text-sm outline-none transition-colors focus:border-violet focus:bg-white"
          />
        </form>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {publicNav.slice(0, 3).map((item) => {
            const featured = item.href === "/pc-builder";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-all",
                  featured
                    ? "bg-acid text-ink shadow-[3px_3px_0_0_#111126] hover:-translate-y-0.5 hover:bg-violet hover:text-white"
                    : "text-ink/80 hover:bg-mist hover:text-ink",
                )}
              >
                {featured ? <Cpu className="size-3.5" /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <Link
            href="/compare"
            className="hidden size-10 items-center justify-center rounded-full text-ink/70 hover:bg-mist hover:text-ink sm:inline-flex"
            aria-label="Compare products"
          >
            <GitCompareArrows className="size-[19px]" />
          </Link>
          <Link
            href={user ? "/account/wishlist" : "/login?next=%2Faccount%2Fwishlist"}
            className="hidden size-10 items-center justify-center rounded-full text-ink/70 hover:bg-mist hover:text-ink sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="size-[19px]" />
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className="hidden size-10 items-center justify-center rounded-full text-ink/70 hover:bg-mist hover:text-ink sm:inline-flex"
            aria-label={user ? "Account" : "Sign in"}
          >
            <UserRound className="size-[19px]" />
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-mist"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className="size-[20px]" />
            {cartCount > 0 ? (
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-violet text-[10px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Link>
          {user ? (
            <div className="ml-1 hidden items-center gap-1 lg:flex">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 transition-colors hover:border-violet/40"
                aria-label="Go to account"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="max-w-24 truncate text-xs font-semibold">{user.name}</span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "primary", size: "sm" }), "ml-2 hidden lg:inline-flex")}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="hidden border-t border-line/80 lg:block">
        <div className="container-page flex h-10 items-center gap-1">
          <button
            type="button"
            onClick={() => setShopOpen((open) => !open)}
            aria-expanded={shopOpen}
            className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-ink hover:bg-mist"
          >
            <Menu className="size-3.5" />
            Shop all
            <ChevronDown className={cn("size-3.5 transition-transform", shopOpen && "rotate-180")} />
          </button>
          <span className="mx-1 h-4 w-px bg-line" />
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="flex h-8 items-center rounded-full px-3 text-[12px] font-medium text-muted transition-colors hover:bg-mist hover:text-ink"
            >
              {category.name}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <Link href="/track-order" className="flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink">
              <Package className="size-3.5" /> Track order
            </Link>
            <Link href="/contact" className="text-[12px] font-medium text-muted hover:text-ink">
              Support
            </Link>
            {user?.staff ? (
              <Link href="/admin" className="flex items-center gap-1.5 text-[12px] font-semibold text-violet">
                <ShieldCheck className="size-3.5" /> Admin
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {shopOpen ? (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-[0_24px_40px_-30px_rgba(17,17,38,0.35)] lg:block"
          onMouseLeave={() => setShopOpen(false)}
        >
          <div className="container-page grid grid-cols-5 gap-6 py-7">
            {categories.map((category) => (
              <div key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-[13px] font-bold text-ink hover:text-violet"
                >
                  {category.name}
                </Link>
                <ul className="mt-2 space-y-1">
                  {category.children.slice(0, 7).map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/categories/${child.slug}`}
                        className="text-[12px] text-muted transition-colors hover:text-violet"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl anim-rise">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-mist"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <form onSubmit={submitSearch} className="relative mb-5">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                  className="h-11 w-full rounded-full border border-line bg-mist pl-10 pr-4 text-sm outline-none focus:border-violet focus:bg-white"
                />
              </form>
              <nav className="space-y-1" aria-label="Mobile primary">
                {publicNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <p className="eyebrow mt-6 px-3 text-muted">Categories</p>
              <nav className="mt-2 space-y-0.5">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="block rounded-xl px-3 py-2 text-[13px] text-ink/80 hover:bg-mist"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link href="/compare" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Compare
                </Link>
                <Link href="/track-order" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Track order
                </Link>
              </div>
            </div>

            <div className="border-t border-line px-5 py-4">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                      {initials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-[11px] text-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/account" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      My account
                    </Link>
                    {user.staff ? (
                      <Link href="/admin" className={buttonVariants({ variant: "soft", size: "sm" })}>
                        Admin
                      </Link>
                    ) : (
                      <Link href="/account/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Orders
                      </Link>
                    )}
                  </div>
                  <form action={signOutAction}>
                    <button type="submit" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full text-coral")}>
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className={buttonVariants({ size: "sm" })}>
                    Sign in
                  </Link>
                  <Link href="/register" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
