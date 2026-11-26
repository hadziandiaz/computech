"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { LogOut } from "lucide-react";

import { NavIcon } from "@/components/layout/nav-icon";
import { signOutAction } from "@/lib/actions/auth";
import { accountNav } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AccountNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="min-w-0 w-full lg:sticky lg:top-20 lg:self-start">
      <div className="mb-4 hidden items-center gap-3 rounded-2xl border border-line bg-white p-4 lg:flex">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
          {name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-[11px] text-muted">{email}</p>
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 no-scrollbar lg:flex-col lg:overflow-visible lg:p-2"
        aria-label="Account navigation"
      >
        {accountNav.map((item, index) => {
          const active =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href);
          const firstInGroup =
            index === 0 || accountNav[index - 1].group !== item.group;
          return (
            <Fragment key={item.href}>
              {firstInGroup ? (
                <p className="hidden px-3 pb-1 pt-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted/70 lg:block">
                  {item.group}
                </p>
              ) : null}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-violet-soft text-violet-dark"
                    : "text-muted hover:bg-mist hover:text-ink",
                )}
              >
                <NavIcon name={item.icon} className="size-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            </Fragment>
          );
        })}
        <form action={signOutAction} className="lg:mt-1 lg:border-t lg:border-line lg:pt-1">
          <button
            type="submit"
            className="flex w-full shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-coral hover:bg-coral-soft"
          >
            <LogOut className="size-4" />
            <span className="whitespace-nowrap">Sign out</span>
          </button>
        </form>
      </nav>
    </aside>
  );
}
