"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import { NavIcon } from "@/components/layout/nav-icon";
import { signOutAction } from "@/lib/actions/auth";
import { adminNav } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

export function AdminNav({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "admin" | "staff";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visible = adminNav.filter(
    (item) => item.href !== "/admin/settings" || role === "admin",
  );

  const links = (
    <>
      <div className="flex items-center gap-2.5 px-3 py-4">
        <span className="flex size-9 items-center justify-center rounded-xl bg-violet">
          <ShieldCheck className="size-5 text-white" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold tracking-[0.08em] text-white">
            COMPUTECH
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            {role} console
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2" aria-label="Admin navigation">
        {visible.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              <NavIcon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/admin/support"
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
            pathname.startsWith("/admin/support")
              ? "bg-white/10 text-white"
              : "text-white/55 hover:bg-white/5 hover:text-white",
          )}
        >
          <NavIcon name="Bell" className="size-4" />
          Support inbox
        </Link>
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{name}</p>
            <p className="truncate text-[10px] text-white/40">{email}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-1 rounded-lg bg-white/5 py-2 text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-3" /> Store
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1 rounded-lg bg-white/5 py-2 text-[11px] font-medium text-white/60 hover:bg-coral/20 hover:text-white"
            >
              <LogOut className="size-3" /> Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet">
            <ShieldCheck className="size-4 text-white" />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.08em]">COMPUTECH</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-line"
          aria-label="Open admin menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink">
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10"
                aria-label="Close admin menu"
              >
                <X className="size-4" />
              </button>
            </div>
            {links}
          </div>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink lg:flex">
        {links}
      </aside>
    </>
  );
}
