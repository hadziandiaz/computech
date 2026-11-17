import { Inbox, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { InlineButton } from "@/components/ui/action-form";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { setSupportStatusAction } from "@/lib/actions/admin/moderation";
import { getSupportMessages } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Support inbox",
};

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
] as const;

const NEXT_STATUS: Record<string, { label: string; value: string }[]> = {
  new: [
    { label: "Start working", value: "in_progress" },
    { label: "Resolve", value: "resolved" },
  ],
  in_progress: [
    { label: "Resolve", value: "resolved" },
    { label: "Close", value: "closed" },
  ],
  resolved: [
    { label: "Reopen", value: "in_progress" },
    { label: "Close", value: "closed" },
  ],
  closed: [{ label: "Reopen", value: "in_progress" }],
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filterRaw = single(params.status);
  const filter = (FILTERS.find((item) => item.key === filterRaw)?.key ?? "open") as
    | "open"
    | "new"
    | "in_progress"
    | "resolved"
    | "closed"
    | "all";

  const messages = await getSupportMessages();
  const filtered = messages.filter((message) => {
    if (filter === "all") return true;
    if (filter === "open") return message.status === "new" || message.status === "in_progress";
    return message.status === filter;
  });
  const newCount = messages.filter((message) => message.status === "new").length;
  const openCount = messages.filter(
    (message) => message.status === "new" || message.status === "in_progress",
  ).length;

  return (
    <div>
      <AdminHeader
        eyebrow="Support"
        title="Support inbox"
        description="Messages submitted from the contact form. Replies happen over email or WhatsApp; this inbox tracks triage state."
        actions={
          <Link
            href="/contact"
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold hover:bg-mist"
          >
            Open contact form
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            New messages
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{newCount}</p>
          <p className="text-[11px] text-muted">Awaiting first response</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Open</p>
          <p className="mt-1 font-display text-2xl font-bold">{openCount}</p>
          <p className="text-[11px] text-muted">New plus in progress</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            All messages
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{messages.length}</p>
          <p className="text-[11px] text-muted">Full history</p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {FILTERS.map((item) => (
              <Link
                key={item.key}
                href={
                  item.key === "open"
                    ? "/admin/support"
                    : `/admin/support?status=${item.key}`
                }
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  filter === item.key
                    ? "bg-violet-soft text-violet-dark"
                    : "text-muted hover:bg-mist hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Badge tone="neutral">{filtered.length} shown</Badge>
        </div>

        {filtered.length ? (
          <ul className="divide-y divide-line">
            {filtered.map((message) => (
              <li key={message.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold">{message.subject}</p>
                      <Badge tone={statusTone(message.status)}>
                        {message.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-3" />
                        {message.name}
                      </span>
                      <a
                        href={`mailto:${message.email}`}
                        className="inline-flex items-center gap-1 hover:text-violet"
                      >
                        <Mail className="size-3" />
                        {message.email}
                      </a>
                      {message.phone ? (
                        <a
                          href={`https://wa.me/${message.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-violet"
                        >
                          <Phone className="size-3" />
                          {message.phone}
                        </a>
                      ) : null}
                      <span>{formatDateTime(message.created_at)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {(NEXT_STATUS[message.status] ?? []).map((next) => (
                      <InlineButton
                        key={next.value}
                        action={setSupportStatusAction.bind(null, message.id, next.value)}
                        variant={next.value === "resolved" ? "primary" : "outline"}
                        size="sm"
                        pendingText="Updating…"
                      >
                        {next.label}
                      </InlineButton>
                    ))}
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line rounded-xl border border-line bg-mist/40 p-3 text-[12px] leading-relaxed">
                  {message.message}
                </p>
                <p className="mt-1.5 text-[10px] text-muted">
                  Last updated {formatDateTime(message.updated_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<Inbox className="size-5" />}
              title={filter === "open" ? "Inbox zero" : "No messages in this view"}
              description={
                filter === "open"
                  ? "New contact form submissions will appear here for triage."
                  : "Switch filters to see messages in another state."
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
