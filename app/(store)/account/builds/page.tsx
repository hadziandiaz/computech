import {
  ArrowRight,
  Cpu,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { InlineButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser } from "@/lib/auth";
import {
  addBuildToCartAction,
  deleteBuildAction,
  setBuildVisibilityAction,
} from "@/lib/actions/builds";
import { getUserBuilds } from "@/lib/data/builds";
import { primaryImage } from "@/lib/data/mappers";
import { pcComponentLabels, pcComponentOrder, pcUsageOptions } from "@/lib/constants";
import { formatDate, formatIDR } from "@/lib/format";
import { formatBudgetStatus } from "@/lib/pricing";

export const metadata = {
  title: "Saved builds",
};

export default async function AccountBuildsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const builds = await getUserBuilds(user.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-violet">PC Builder</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Saved builds
          </h1>
          <p className="mt-1 text-sm text-muted">
            Every saved configuration keeps its parts and current total. Share a public build with a
            single link.
          </p>
        </div>
        <Link href="/pc-builder" className={buttonVariants({ size: "sm" })}>
          <Cpu /> New build
        </Link>
      </header>

      {builds.length ? (
        <div className="space-y-4">
          {builds.map((build) => {
            const usage =
              pcUsageOptions.find((option) => option.value === build.usage)?.label ?? build.usage;
            const budget = formatBudgetStatus(Number(build.total_price ?? 0), Number(build.budget ?? 0));
            const items = [...(build.items ?? [])].sort(
              (a, b) =>
                pcComponentOrder.indexOf(a.component_type) - pcComponentOrder.indexOf(b.component_type),
            );

            return (
              <article key={build.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold tracking-tight">{build.name}</h2>
                      <Badge tone={build.is_public ? "cyan" : "neutral"}>
                        {build.is_public ? (
                          <>
                            <Globe2 className="size-3" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="size-3" /> Private
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {usage} · updated {formatDate(build.updated_at)} · {items.length} component
                      {items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold">{formatIDR(build.total_price)}</p>
                    <p className="text-[11px] text-muted">
                      Budget {formatIDR(build.budget)} ·{" "}
                      <span
                        className={
                          budget.overBudget
                            ? "font-semibold text-coral"
                            : budget.tone === "warning"
                              ? "font-semibold text-[#9a6500]"
                              : "font-semibold text-[#18794e]"
                        }
                      >
                        {budget.overBudget
                          ? `${formatIDR(Math.abs(budget.remaining))} over`
                          : `${formatIDR(budget.remaining)} left`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    const image = primaryImage(product);
                    return (
                      <Link
                        key={item.id}
                        href={`/products/${product.slug}`}
                        className="flex items-center gap-2.5 rounded-xl border border-line p-2 transition-colors hover:border-violet/30"
                      >
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-mist">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-muted">
                              <Cpu className="size-4" />
                            </span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                            {pcComponentLabels[item.component_type] ?? item.component_type}
                          </p>
                          <p className="line-clamp-1 text-[12px] font-semibold">{product.name}</p>
                        </div>
                      </Link>
                    );
                  })}
                  {!items.length ? (
                    <p className="text-[12px] text-muted">This build has no components.</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-line bg-mist/40 px-4 py-3">
                  <InlineButton
                    action={addBuildToCartAction.bind(null, build.id)}
                    variant="primary"
                    size="sm"
                    pendingText="Adding…"
                  >
                    <ShoppingCart /> Add all to cart
                  </InlineButton>
                  <InlineButton
                    action={setBuildVisibilityAction.bind(null, build.id, !build.is_public)}
                    variant="outline"
                    size="sm"
                    pendingText="Updating…"
                  >
                    {build.is_public ? <EyeOff /> : <Eye />}
                    {build.is_public ? "Make private" : "Make public"}
                  </InlineButton>
                  {build.is_public ? (
                    <Link
                      href={`/builds/${build.share_slug}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      <Globe2 /> View share page
                    </Link>
                  ) : null}
                  <Link
                    href={`/pc-builder?product=${items[0]?.product_id ?? ""}`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    <Cpu /> Start from this
                  </Link>
                  <InlineButton
                    action={deleteBuildAction.bind(null, build.id)}
                    variant="danger-ghost"
                    size="sm"
                    confirm="Delete this saved build? This cannot be undone."
                    className="ml-auto"
                    pendingText="Deleting…"
                  >
                    <Trash2 /> Delete
                  </InlineButton>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Cpu className="size-5" />}
          title="No builds saved yet"
          description="Use the PC Builder to pick compatible parts against a budget, then save the configuration here."
          action={
            <Link href="/pc-builder" className={buttonVariants({ size: "sm" })}>
              Build a PC <ArrowRight />
            </Link>
          }
        />
      )}
    </div>
  );
}
