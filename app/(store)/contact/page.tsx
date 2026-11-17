import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Input, Label, Textarea } from "@/components/ui/input";
import { submitSupportMessageAction } from "@/lib/actions/support";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Contact",
  description:
    "Contact COMPUTECH about an order, a product specification, a warranty claim or a business enquiry.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const channels = [
    {
      icon: Mail,
      label: "Email",
      value: settings.store_email || "Not configured yet",
      href: settings.store_email ? `mailto:${settings.store_email}` : undefined,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.store_whatsapp || "Not configured yet",
      href: settings.store_whatsapp
        ? `https://wa.me/${settings.store_whatsapp.replace(/[^0-9]/g, "")}`
        : undefined,
    },
    {
      icon: Clock,
      label: "Opening hours",
      value: settings.store_hours,
    },
    {
      icon: MapPin,
      label: "Store address",
      value: settings.store_address || "Not configured yet",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Ask a specific question.
            <br />
            <span className="text-violet">Get a specific answer.</span>
          </>
        }
        description="Order questions, compatibility checks, warranty claims and business enquiries all reach the same team. Include your order number when you have one."
        crumbs={[{ label: "Contact" }]}
        aside={
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: MessageCircle, title: "Replies by email", detail: "We respond using the address you provide." },
              { icon: ShieldCheck, title: "No account needed", detail: "Guests can contact us about any order." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <item.icon className="size-4 text-neon" />
                <p className="mt-2 text-[11px] font-semibold text-white">{item.title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-white/45">{item.detail}</p>
              </div>
            ))}
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-violet-soft text-violet">
                <Send className="size-4" />
              </span>
              <div>
                <h1 className="font-display text-lg font-semibold">Send a message</h1>
                <p className="text-xs text-muted">
                  Messages are stored in the support inbox and can be tracked by staff.
                </p>
              </div>
            </div>

            <ActionForm action={submitSupportMessageAction} className="mt-6 space-y-4" resetOnSuccess>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" required>
                    Full name
                  </Label>
                  <Input id="name" name="name" autoComplete="name" required minLength={2} />
                </div>
                <div>
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" autoComplete="tel" />
                </div>
                <div>
                  <Label htmlFor="subject" required>
                    Subject
                  </Label>
                  <Input id="subject" name="subject" required minLength={3} maxLength={160} />
                </div>
              </div>
              <div>
                <Label htmlFor="message" required>
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  placeholder="Include your order number, product SKU or the specification you are checking."
                  className="min-h-36"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SubmitButton pendingText="Sending…">
                  <Send /> Send message
                </SubmitButton>
                <p className="text-[11px] text-muted">
                  By sending a message you agree to the{" "}
                  <Link href="/privacy" className="font-semibold text-violet hover:underline">
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </ActionForm>
          </div>

          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.label}
                className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mist text-violet">
                  <channel.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {channel.label}
                  </p>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="mt-0.5 block break-words text-[13px] font-semibold text-ink hover:text-violet"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 break-words text-[13px] font-semibold text-ink">
                      {channel.value}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-line bg-mist/60 p-4">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-violet" />
                <p className="text-[13px] font-semibold">Before you write</p>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-[12px] leading-relaxed text-muted">
                <li>Check the order status and tracking on the track order page.</li>
                <li>Warranty terms are shown on each product and copied onto your order.</li>
                <li>For compatibility, open the build in the PC Builder for a live check.</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/track-order" className="text-[12px] font-semibold text-violet hover:underline">
                  Track an order
                </Link>
                <span className="text-muted/40">·</span>
                <Link href="/warranty" className="text-[12px] font-semibold text-violet hover:underline">
                  Warranty policy
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-4 text-[12px] text-muted">
              <Clock className="size-4 shrink-0 text-violet" />
              Support hours follow the published store settings.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
