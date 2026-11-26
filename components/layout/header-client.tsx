"use client";

import {
  ChevronDown,
  Cpu,
  GitCompareArrows,
  Heart,
  House,
  LayoutGrid,
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
import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/lib/actions/auth";
import {
  COMPARE_EVENT,
  readCompareIds,
} from "@/components/store/compare-button";
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

const iconClass = "size-[19px]";

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
  const [compareCount, setCompareCount] = useState(0);
  const shopButtonRef = useRef<HTMLButtonElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    const sync = () => setCompareCount(readCompareIds().length);
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COMPARE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    function handleResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!shopOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (shopButtonRef.current?.contains(target) || shopMenuRef.current?.contains(target)) return;
      setShopOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShopOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shopOpen]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
    setMobileOpen(false);
  }

  function openMobileSearch() {
    setMobileOpen(true);
    window.setTimeout(() => mobileSearchRef.current?.focus(), 80);
  }

  function isNavActive(href: string) {
    if (pathname === href || pathname.startsWith(`${href}/`)) return true;
    if (href === "/products") {
      return /^\/(categories|brands|promotions|laptops|networking)(\/|$)/.test(pathname);
    }
    if (href === "/pc-builder") {
      return pathname.startsWith("/builds/") || pathname.startsWith("/account/builds");
    }
    if (href === "/cart") return pathname.startsWith("/checkout");
    return false;
  }

  const primaryNav = publicNav.filter((item) =>
    ["/products", "/pc-builder", "/promotions"].includes(item.href),
  );

  const bottomTabs = [
    { id: "home", href: "/", label: "Home", icon: House },
    { id: "shop", href: "/products", label: "Shop", icon: LayoutGrid },
    { id: "build", href: "/pc-builder", label: "Build", icon: Cpu },
    { id: "cart", href: "/cart", label: "Cart", icon: ShoppingCart },
    {
      id: "account",
      href: user ? "/account" : "/login?next=%2Faccount",
      label: "Account",
      icon: UserRound,
    },
  ] as const;

  function isTabActive(id: string) {
    if (id === "home") return pathname === "/";
    return isNavActive(bottomTabs.find((tab) => tab.id === id)?.href ?? "");
  }

  function handleDrawerClick(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95">
      <div
        className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet via-neon to-acid"
        aria-hidden
      />
      <div className="container-page flex h-16 items-center gap-2 lg:gap-5">
        <button
          type="button"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-mist lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="size-5" />
        </button>

        <Logo className="shrink-0" />

        <button
          type="button"
          onClick={openMobileSearch}
          aria-label="Search products"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink/70 hover:bg-mist md:hidden"
        >
          <Search className={iconClass} />
        </button>

        <form onSubmit={submitSearch} className="relative ml-2 hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search laptops, components, networking…"
            aria-label="Search products"
            className="h-10 w-full rounded-full border border-line bg-mist/70 pl-10 pr-4 text-sm outline-none transition-colors focus:border-violet focus:bg-white"
          />
        </form>

        <button
          ref={shopButtonRef}
          type="button"
          onClick={() => setShopOpen((open) => !open)}
          aria-expanded={shopOpen}
          aria-controls="shop-menu"
          className="ml-auto hidden h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold text-ink transition-colors hover:bg-mist lg:inline-flex"
        >
          <Menu className="size-3.5" />
          Shop all
          <ChevronDown className={cn("size-3.5 transition-transform", shopOpen && "rotate-180")} />
        </button>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-2 text-[13px] font-semibold transition-all",
                  active
                    ? "bg-acid text-ink shadow-[3px_3px_0_0_#111126] hover:-translate-y-0.5 hover:bg-violet hover:text-white"
                    : "text-ink/80 hover:bg-mist hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <Link
            href="/compare"
            className={cn(
              "relative hidden size-9 items-center justify-center rounded-full transition-colors sm:inline-flex",
              isNavActive("/compare")
                ? "bg-acid text-ink shadow-[3px_3px_0_0_#111126]"
                : "text-ink/70 hover:bg-mist hover:text-ink",
            )}
            aria-label={`Compare products${compareCount ? `, ${compareCount} selected` : ""}`}
            aria-current={isNavActive("/compare") ? "page" : undefined}
          >
            <GitCompareArrows className={iconClass} />
            {compareCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-violet text-[10px] font-bold text-white">
                {compareCount > 9 ? "9+" : compareCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={user ? "/account/wishlist" : "/login?next=%2Faccount%2Fwishlist"}
            className="hidden size-9 items-center justify-center rounded-full text-ink/70 hover:bg-mist hover:text-ink sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className={iconClass} />
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className="hidden size-9 items-center justify-center rounded-full text-ink/70 hover:bg-mist hover:text-ink sm:inline-flex lg:hidden"
            aria-label={user ? "Account" : "Sign in"}
          >
            <UserRound className={iconClass} />
          </Link>
          <Link
            href="/cart"
            className={cn(
              "relative inline-flex size-9 items-center justify-center rounded-full text-ink hover:bg-mist",
              isNavActive("/cart") && "bg-mist",
            )}
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className={iconClass} />
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
              {user.staff ? (
                <Link
                  href="/admin"
                  className="inline-flex size-9 items-center justify-center rounded-full text-violet hover:bg-violet-soft"
                  aria-label="Admin dashboard"
                  title="Admin"
                >
                  <ShieldCheck className="size-4" />
                </Link>
              ) : null}
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

      {shopOpen ? (
        <div
          ref={shopMenuRef}
          id="shop-menu"
          className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-[0_24px_40px_-30px_rgba(17,17,38,0.35)] lg:block"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setShopOpen(false);
          }}
        >
          <div className="container-page grid grid-cols-5 gap-6 py-6">
            {categories.map((category) => (
              <div key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-[13px] font-bold text-ink hover:text-violet"
                >
                  {category.name}
                </Link>
                <ul className="mt-2 space-y-1">
                  {category.children.slice(0, 6).map((child) => (
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
          <div className="border-t border-line/80 bg-mist/60">
            <div className="container-page flex items-center gap-5 py-2.5 text-[12px] font-medium text-muted">
              <Link href="/track-order" className="inline-flex items-center gap-1.5 hover:text-ink">
                <Package className="size-3.5" /> Track order
              </Link>
              <Link href="/contact" className="hover:text-ink">Support</Link>
              <Link href="/categories" className="hover:text-ink">All categories</Link>
              {user?.staff ? (
                <Link href="/admin" className="inline-flex items-center gap-1.5 font-semibold text-violet hover:text-violet-dark">
                  <ShieldCheck className="size-3.5" /> Admin
                </Link>
              ) : null}
            </div>
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
          <div
            id="mobile-menu"
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl anim-rise"
            onClick={handleDrawerClick}
          >
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
              <form onSubmit={submitSearch} className="relative mb-6">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  ref={mobileSearchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                  className="h-11 w-full rounded-full border border-line bg-mist pl-10 pr-4 text-sm outline-none focus:border-violet focus:bg-white"
                />
              </form>

              <p className="eyebrow px-3 text-muted">Belanja</p>
              <nav className="mt-2 space-y-0.5" aria-label="Mobile shopping">
                {publicNav.map((item) => {
                  const active = isNavActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                        active
                          ? "bg-acid text-ink shadow-[3px_3px_0_0_#111126]"
                          : "text-ink hover:bg-mist",
                      )}
                    >
                      {active ? <span className="size-1.5 rotate-45 bg-violet" /> : null}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <p className="eyebrow mt-6 px-3 text-muted">Kategori</p>
              <div className="mt-2 flex flex-wrap gap-2 px-1">
                <Link
                  href="/categories"
                  className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-violet hover:text-violet"
                >
                  Semua kategori
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="rounded-full border border-line px-3 py-1.5 text-[12px] text-ink/80 hover:border-violet hover:text-violet"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <p className="eyebrow mt-6 px-3 text-muted">Alat & bantuan</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/pc-builder"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  PC Builder
                </Link>
                <Link
                  href="/compare"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Compare{compareCount > 0 ? ` (${compareCount})` : ""}
                </Link>
                <Link
                  href={user ? "/account/wishlist" : "/login?next=%2Faccount%2Fwishlist"}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Wishlist
                </Link>
                <Link href="/track-order" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Track order
                </Link>
                <Link href="/contact" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Support
                </Link>
                {user?.staff ? (
                  <Link href="/admin" className={buttonVariants({ variant: "soft", size: "sm" })}>
                    Admin
                  </Link>
                ) : null}
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
                    <Link href="/account/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Orders
                    </Link>
                  </div>
                  <form
                    action={signOutAction}
                    onClick={(event) => event.stopPropagation()}
                  >
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

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Mobile quick navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.id);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                  active ? "text-violet" : "text-muted",
                )}
              >
                {active ? <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-violet" /> : null}
                <span className="relative">
                  <Icon className="size-[19px]" />
                  {tab.id === "cart" && cartCount > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  ) : null}
                </span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
