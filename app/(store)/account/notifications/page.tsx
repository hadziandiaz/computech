import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

import { InlineButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser } from "@/lib/auth";
import {
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/notifications";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Notifications",
};

export default async function AccountNotificationsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const [notifications, unread] = await Promise.all([
    getNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-violet">Activity</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <Bell className="size-6 text-violet" /> Notifications
          </h1>
          <p className="mt-1 text-sm text-muted">
            {unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You are up to date."}
          </p>
        </div>
        {unread ? (
          <InlineButton
            action={markAllNotificationsReadAction}
            variant="outline"
            size="sm"
            pendingText="Updating…"
          >
            <CheckCheck /> Mark all read
          </InlineButton>
        ) : null}
      </header>

      {notifications.length ? (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={cn(
                "rounded-2xl border bg-white p-4",
                notification.is_read ? "border-line" : "border-violet/30 bg-violet-soft/30",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold">{notification.title}</p>
                    <Badge tone={notification.is_read ? "neutral" : "violet"}>
                      {notification.type.replaceAll("_", " ")}
                    </Badge>
                    {!notification.is_read ? (
                      <span className="size-1.5 rounded-full bg-violet" aria-label="Unread" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{notification.body}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {formatRelative(notification.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                      aria-label="Open related page"
                    >
                      <ExternalLink />
                    </Link>
                  ) : null}
                  {!notification.is_read ? (
                    <InlineButton
                      action={markNotificationReadAction.bind(null, notification.id)}
                      variant="ghost"
                      size="icon-sm"
                      pendingText="Marking read…"
                    >
                      <Check />
                    </InlineButton>
                  ) : null}
                  <InlineButton
                    action={deleteNotificationAction.bind(null, notification.id)}
                    variant="danger-ghost"
                    size="icon-sm"
                    confirm="Delete this notification?"
                    pendingText="Deleting…"
                  >
                    <Trash2 />
                  </InlineButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Bell className="size-5" />}
          title="No notifications"
          description="Order, payment and shipment updates will appear here as they happen."
        />
      )}
    </div>
  );
}
