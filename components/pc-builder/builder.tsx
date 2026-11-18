"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Copy,
  Cpu,
  Loader2,
  Plus,
  Printer,
  Save,
  Search,
  Share2,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { addToCartAction } from "@/lib/actions/cart";
import { saveBuildAction } from "@/lib/actions/builds";
import type { ActionResult } from "@/lib/actions/types";
import { pcComponentLabels, pcComponentOrder, pcUsageOptions } from "@/lib/constants";
import { formatIDR } from "@/lib/format";
import {
  buildTotal,
  checkCompatibility,
  recommendBuild,
  type BuilderSelection,
  type PcComponent,
} from "@/lib/pc-builder/compatibility";
import { cn } from "@/lib/utils";
import type { CompatibilityStatus, PcComponentType, PcUsage } from "@/types/domain";

const MAX_COMPONENTS = 9;

function compatibilityTone(status: CompatibilityStatus): BadgeTone {
  switch (status) {
    case "compatible":
      return "success";
    case "warning":
      return "warning";
    case "incompatible":
      return "coral";
    default:
      return "neutral";
  }
}

function compatibilityLabel(status: CompatibilityStatus) {
  switch (status) {
    case "compatible":
      return "Compatible";
    case "warning":
      return "Check";
    case "incompatible":
      return "Incompatible";
    default:
      return "Unknown";
  }
}

function CompatibilityIcon({ status }: { status: CompatibilityStatus }) {
  if (status === "compatible") return <CheckCircle2 className="size-3.5" />;
  if (status === "warning") return <AlertTriangle className="size-3.5" />;
  if (status === "incompatible") return <XCircle className="size-3.5" />;
  return <CircleHelp className="size-3.5" />;
}

export function PcBuilder({
  components,
  initialSelection,
  signedIn,
}: {
  components: PcComponent[];
  initialSelection: BuilderSelection;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<BuilderSelection>(initialSelection);
  const [activeType, setActiveType] = useState<PcComponentType>("cpu");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [onlyFitting, setOnlyFitting] = useState(false);
  const [budget, setBudget] = useState(15_000_000);
  const [usage, setUsage] = useState<PcUsage>("gaming");
  const [buildName, setBuildName] = useState("My COMPUTECH Build");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saved, setSaved] = useState<{ id: string; shareSlug: string } | null>(null);
  const [recommendationNotes, setRecommendationNotes] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const compatibility = useMemo(() => checkCompatibility(selection), [selection]);
  const total = useMemo(() => buildTotal(selection), [selection]);
  const chosen = useMemo(
    () => pcComponentOrder.filter((type) => Boolean(selection[type])).length,
    [selection],
  );
  const budgetPercent = budget > 0 ? Math.round((total / budget) * 100) : 0;
  const overBudget = total > budget;

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return components
      .filter((component) => component.pc_spec?.component_type === activeType)
      .filter((component) => {
        if (!term) return true;
        return (
          component.name.toLowerCase().includes(term) ||
          component.sku.toLowerCase().includes(term) ||
          (component.brand?.name ?? "").toLowerCase().includes(term)
        );
      })
      .filter((component) => {
        if (!onlyFitting) return true;
        const trial = { ...selection, [activeType]: component } as BuilderSelection;
        return checkCompatibility(trial).status !== "incompatible";
      })
      .slice(0, 60);
  }, [components, activeType, search, onlyFitting, selection]);

  // The part picker is a dialog so the choices appear exactly where the shopper
  // is looking, instead of in a card far below the slot list.
  useEffect(() => {
    if (!pickerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pickerOpen]);

  function openPicker(type: PcComponentType) {
    setActiveType(type);
    setSearch("");
    setPickerOpen(true);
  }

  function choose(component: PcComponent) {
    setSelection((current) => ({ ...current, [activeType]: component }));
    setSaved(null);
    setPickerOpen(false);
  }

  function clear(type: PcComponentType) {
    setSelection((current) => {
      const next = { ...current };
      delete next[type];
      return next;
    });
    setSaved(null);
  }

  function clearAll() {
    setSelection({});
    setRecommendationNotes([]);
    setSaved(null);
  }

  function recommend() {
    if (!components.length) {
      toast.error("No PC components are available in the catalog.");
      return;
    }
    const result = recommendBuild(components, budget, usage);
    setSelection(result.selection);
    setRecommendationNotes(result.messages);
    setSaved(null);
    if (result.overBudget) {
      toast.warning(`The closest compatible build is ${formatIDR(result.total)}.`);
    } else {
      toast.success("A compatible build has been selected from the live catalog.");
    }
  }

  function save() {
    if (!chosen) {
      toast.error("Add at least one component before saving.");
      return;
    }
    const items = pcComponentOrder
      .map((type) => {
        const component = selection[type];
        return component ? { product_id: component.id, component_type: type } : null;
      })
      .filter(Boolean);

    const formData = new FormData();
    formData.set("id", saved?.id ?? "");
    formData.set("name", buildName || "My COMPUTECH Build");
    formData.set("budget", String(budget));
    formData.set("usage", usage);
    formData.set("is_public", isPublic ? "on" : "off");
    formData.set("notes", notes);
    formData.set("items", JSON.stringify(items));

    startTransition(async () => {
      const result: ActionResult<{ id: string; shareSlug: string }> = await saveBuildAction(formData);
      if (result.ok && result.data) {
        setSaved(result.data);
        toast.success(result.message || "Build saved.");
        router.refresh();
      } else {
        toast.error(result.message || "Could not save this build.");
      }
    });
  }

  function addAllToCart() {
    const items = pcComponentOrder
      .map((type) => selection[type])
      .filter((component): component is PcComponent => Boolean(component));
    if (!items.length) {
      toast.error("Choose at least one component first.");
      return;
    }
    startTransition(async () => {
      let added = 0;
      let failed = 0;
      for (const component of items) {
        const result = await addToCartAction(component.id, 1);
        if (result.ok) added += 1;
        else failed += 1;
      }
      if (added) {
        toast.success(
          `${added} component${added === 1 ? "" : "s"} added to your cart.${
            failed ? ` ${failed} could not be added.` : ""
          }`,
        );
        router.refresh();
      } else {
        toast.error("None of the selected components could be added to the cart.");
      }
    });
  }

  async function copyShareLink() {
    if (!saved?.shareSlug) {
      toast.error("Save the build before sharing it.");
      return;
    }
    if (!isPublic) {
      toast.error("Make the build shareable before copying its link.");
      return;
    }
    const url = `${window.location.origin}/builds/${saved.shareSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied.");
    } catch {
      toast.error(`Copy this link: ${url}`);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="min-w-0 space-y-5 print:block">
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Cpu className="size-4 text-violet" />
                Choose your parts
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {chosen} of {MAX_COMPONENTS} component slots filled. Compatibility updates as you
                change parts.
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-soft px-2.5 py-1 text-[11px] font-semibold text-violet-dark">
                <Search className="size-3" /> Click any slot to open the parts picker
              </p>
            </div>
            <div className="flex items-center gap-1.5 print:hidden">
              <Button size="sm" onClick={() => openPicker(pcComponentOrder.find((type) => !selection[type]) ?? activeType)}>
                <Plus /> Choose parts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={!chosen || pending}
              >
                <Trash2 /> Clear build
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            {pcComponentOrder.map((type) => {
              const component = selection[type];
              const relevantChecks = compatibility.checks.filter((check) =>
                check.components.includes(type),
              );
              const worst = relevantChecks.some((check) => check.status === "incompatible")
                ? "incompatible"
                : relevantChecks.some((check) => check.status === "warning")
                  ? "warning"
                  : relevantChecks.some((check) => check.status === "unknown")
                    ? "unknown"
                    : "compatible";
              return (
                <div
                  key={type}
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors sm:flex-nowrap",
                    activeType === type
                      ? "border-violet/40 bg-violet-soft/40"
                      : "border-line bg-white hover:border-ink/15",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openPicker(type)}
                    aria-label={`Choose ${pcComponentLabels[type].toLowerCase()}`}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                        component ? "bg-ink text-white" : "bg-mist text-muted",
                      )}
                    >
                      {component ? <Check className="size-4" /> : <Plus className="size-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {pcComponentLabels[type]}
                      </span>
                      <span className="block truncate text-[13px] font-semibold">
                        {component ? component.name : `Choose ${pcComponentLabels[type].toLowerCase()}`}
                      </span>
                    </span>
                  </button>

                  {component ? (
                    <>
                      <div className="ml-auto text-right">
                        <p className="font-display text-[13px] font-bold">
                          {formatIDR(buildTotal({ [type]: component }))}
                        </p>
                        <p className="text-[10px] text-muted">
                          {(component.inventory?.stock ?? 0) > 0
                            ? `${component.inventory?.stock} in stock`
                            : "Out of stock"}
                        </p>
                      </div>
                      {relevantChecks.length ? (
                        <Badge tone={compatibilityTone(worst as CompatibilityStatus)} className="hidden sm:inline-flex">
                          <CompatibilityIcon status={worst as CompatibilityStatus} />
                          {compatibilityLabel(worst as CompatibilityStatus)}
                        </Badge>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => clear(type)}
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-coral print:hidden"
                        aria-label={`Remove ${pcComponentLabels[type]}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-violet">
                      Choose <ChevronRight className="size-3.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {pickerOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-6 print:hidden"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPickerOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="part-picker-title"
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-3xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet">
                    Pick a part
                  </p>
                  <h2 id="part-picker-title" className="mt-0.5 font-display text-lg font-semibold">
                    Choose {pcComponentLabels[activeType].toLowerCase()}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {candidates.length} option{candidates.length === 1 ? "" : "s"} from the live
                    catalog. Compatibility is checked for every part.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  aria-label="Close part picker"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-ink/20 hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="border-b border-line px-5 py-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Search ${pcComponentLabels[activeType].toLowerCase()} by name or SKU`}
                    className="pl-9"
                    aria-label="Search components"
                    autoFocus
                  />
                </div>
                <label className="mt-3 flex w-fit items-center gap-2 text-[11px] font-medium text-muted">
                  <input
                    type="checkbox"
                    checked={onlyFitting}
                    onChange={(event) => setOnlyFitting(event.target.checked)}
                    className="size-3.5 rounded border-line accent-[#7957FF]"
                  />
                  Show compatible parts only
                </label>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {candidates.length ? (
              <div className="space-y-1">
                {candidates.map((component) => {
                  const trial = { ...selection, [activeType]: component } as BuilderSelection;
                  const trialCompatibility = checkCompatibility(trial);
                  const selected = selection[activeType]?.id === component.id;
                  const price = buildTotal({ [activeType]: component });
                  const stock = component.inventory?.stock ?? 0;
                  return (
                    <button
                      key={component.id}
                      type="button"
                      onClick={() => choose(component)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-violet bg-violet-soft/60"
                          : "border-transparent hover:border-line hover:bg-mist/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          selected ? "bg-violet text-white" : "bg-mist text-muted",
                        )}
                      >
                        {selected ? <Check className="size-4" /> : <Cpu className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                          {component.brand?.name ?? "COMPUTECH"} · {component.sku}
                        </span>
                        <span className="block truncate text-[13px] font-semibold">
                          {component.name}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-muted">
                          <span>{stock > 0 ? `${stock} in stock` : "Out of stock"}</span>
                          {component.pc_spec?.performance_score != null ? (
                            <span>Score {component.pc_spec.performance_score}</span>
                          ) : null}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-display text-[13px] font-bold">
                          {formatIDR(price)}
                        </span>
                        <Badge tone={compatibilityTone(trialCompatibility.status)} className="mt-1">
                          <CompatibilityIcon status={trialCompatibility.status} />
                          {compatibilityLabel(trialCompatibility.status)}
                        </Badge>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-semibold">No matching components</p>
                <p className="mt-1 text-[12px] text-muted">
                  Adjust the search or turn off the compatibility filter.
                </p>
              </div>
            )}
          </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist/40 px-5 py-3">
                <p className="text-[11px] text-muted">
                  Currently selected:{" "}
                  <span className="font-semibold text-ink">
                    {selection[activeType]?.name ?? "Nothing yet"}
                  </span>
                </p>
                <Button size="sm" onClick={() => setPickerOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-32">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Build total
              </p>
              <p className="mt-1 font-display text-3xl font-bold tracking-tight">{formatIDR(total)}</p>
            </div>
            <Badge tone={overBudget ? "coral" : "success"}>
              {overBudget ? "Over budget" : `${Math.max(0, budget - total) ? formatIDR(budget - total) + " left" : "On budget"}`}
            </Badge>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>Budget usage</span>
              <span>{budgetPercent}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  overBudget ? "bg-coral" : budgetPercent >= 90 ? "bg-[#F5B301]" : "bg-violet",
                )}
                style={{ width: `${Math.min(100, budgetPercent)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted">Est. load</p>
              <p className="font-display text-sm font-bold">{compatibility.estimatedWattage} W</p>
            </div>
            <div className="rounded-xl border border-line px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted">Recommended PSU</p>
              <p className="font-display text-sm font-bold">{compatibility.recommendedWattage} W</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 print:hidden">
            <Button
              size="lg"
              className="w-full"
              onClick={addAllToCart}
              disabled={pending || !chosen}
            >
              {pending ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              Add all to cart
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={save} disabled={pending || !chosen}>
                {pending ? <Loader2 className="animate-spin" /> : <Save />}
                Save build
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} disabled={!chosen}>
                <Printer /> Print
              </Button>
            </div>
            <p className="text-center text-[10px] text-muted">
              {signedIn
                ? "Saving keeps this build in your account."
                : "You can add to cart as a guest; sign in to save the build."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
              <Sparkles className="size-4 text-violet" />
              Smart build
            </h2>
            <Badge tone="violet">{pcUsageOptions.find((option) => option.value === usage)?.label}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="builder-budget">Budget (IDR)</Label>
              <Input
                id="builder-budget"
                type="number"
                min={0}
                step={500000}
                value={budget}
                onChange={(event) => setBudget(Math.max(0, Number(event.target.value) || 0))}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="builder-usage">Workload</Label>
              <Select
                id="builder-usage"
                value={usage}
                onChange={(event) => setUsage(event.target.value as PcUsage)}
                className="h-10 text-[12px]"
              >
                {pcUsageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button className="mt-3 w-full" variant="soft" onClick={recommend} disabled={pending}>
            <Sparkles /> Recommend a build
          </Button>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            {pcUsageOptions.find((option) => option.value === usage)?.description}
          </p>
          {recommendationNotes.length ? (
            <ul className="mt-3 space-y-1 rounded-xl border border-line bg-mist/60 p-3">
              {recommendationNotes.map((message) => (
                <li key={message} className="flex items-start gap-1.5 text-[11px] text-muted">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0 text-[#9a6500]" />
                  {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 print:break-inside-avoid">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold">Compatibility</h2>
            <Badge tone={compatibilityTone(compatibility.status)}>
              <CompatibilityIcon status={compatibility.status} />
              {compatibilityLabel(compatibility.status)}
            </Badge>
          </div>

          {compatibility.checks.length ? (
            <ul className="mt-3 space-y-2">
              {compatibility.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span
                    className={cn(
                      "mt-0.5 shrink-0",
                      check.status === "incompatible"
                        ? "text-coral"
                        : check.status === "warning"
                          ? "text-[#9a6500]"
                          : check.status === "compatible"
                            ? "text-[#18794e]"
                            : "text-muted",
                    )}
                  >
                    <CompatibilityIcon status={check.status} />
                  </span>
                  <span>
                    <span className="font-semibold text-ink">{check.label}.</span>{" "}
                    <span className="text-muted">{check.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[11px] text-muted">
              Add a CPU and motherboard to start the compatibility checks.
            </p>
          )}

          {compatibility.missing.length ? (
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Still missing
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {compatibility.missing.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => openPicker(type)}
                    className="rounded-full border border-line px-2.5 py-0.5 text-[10px] font-medium text-muted hover:border-violet/40 hover:text-violet-dark"
                  >
                    {pcComponentLabels[type]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 print:hidden">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
            <Share2 className="size-4 text-violet" />
            Save & share
          </h2>
          <div className="mt-3 space-y-3">
            <div>
              <Label htmlFor="build-name">Build name</Label>
              <Input
                id="build-name"
                value={buildName}
                onChange={(event) => setBuildName(event.target.value)}
                maxLength={120}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="build-notes">Notes (optional)</Label>
              <Textarea
                id="build-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={500}
                className="min-h-20 text-[12px]"
                placeholder="Target software, upgrade plans, colour preferences…"
              />
            </div>
            <label className="flex items-center gap-2 text-[12px] font-medium">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="size-4 rounded border-line accent-[#7957FF]"
              />
              Allow a public share link
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={save} disabled={pending || !chosen} size="sm">
                {pending ? <Loader2 className="animate-spin" /> : <Save />}
                {saved ? "Update" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={copyShareLink} disabled={!saved || !isPublic}>
                <Copy /> Copy link
              </Button>
            </div>
            {saved ? (
              <div className="rounded-xl border border-line bg-mist/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Share link
                </p>
                <p className="mt-1 break-all font-mono text-[10px] text-ink">
                  /builds/{saved.shareSlug}
                </p>
                <a
                  href={`/builds/${saved.shareSlug}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 px-0")}
                >
                  Open public page <ChevronRight />
                </a>
              </div>
            ) : null}
            {!signedIn ? (
              <p className="text-[11px] text-muted">
                <a href="/login?next=%2Fpc-builder" className="font-semibold text-violet hover:underline">
                  Sign in
                </a>{" "}
                to save and share builds.
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-line bg-mist/60 px-4 py-3 text-[10px] text-muted print:flex">
          <Zap className="size-3.5 text-violet" />
          Prices and compatibility generated by COMPUTECH PC Builder.
        </div>
      </aside>

      <div className="hidden print:block">
        <h2 className="font-display text-xl font-bold">Selected components</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {pcComponentOrder.map((type) => {
            const component = selection[type];
            if (!component) return null;
            return (
              <li key={type} className="flex justify-between border-b border-line py-1">
                <span>
                  {pcComponentLabels[type]}: {component.name}
                </span>
                <span className="font-semibold">{formatIDR(buildTotal({ [type]: component }))}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-right font-display text-lg font-bold">Total {formatIDR(total)}</p>
      </div>
    </div>
  );
}
