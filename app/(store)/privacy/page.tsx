import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Privacy policy",
  description:
    "What COMPUTECH collects, why it is collected, how it is stored in Supabase and how to exercise your privacy rights.",
};

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  const sections = [
    {
      title: "Information we collect",
      paragraphs: [
        "Account data: your name, email address, phone number, avatar and notification preferences. Authentication credentials are handled by Supabase Auth and are never exposed to other customers.",
        "Order data: the products purchased, amounts, voucher usage, payment status, shipping address snapshot, courier, tracking number and warranty dates.",
        "Support data: the name, email, phone, subject and message you submit through the contact form or newsletter form.",
        "Technical data required to operate the service, such as session cookies used to keep you signed in and to store a guest cart.",
      ],
    },
    {
      title: "How we use it",
      paragraphs: [
        "To create and maintain your account, process orders, verify payments, arrange delivery, administer warranty claims and respond to support requests.",
        "To display reviews you submit after moderation, and to show order status and notifications that belong to your account.",
        "To prevent abuse, enforce rate limits and keep an audit trail of staff actions on orders, inventory and customer roles.",
      ],
    },
    {
      title: "Legal and operational basis",
      paragraphs: [
        "Order and payment records are kept because they are required to fulfil the purchase, handle warranty claims, comply with tax and accounting obligations and resolve disputes.",
        "Marketing preferences are optional and can be changed at any time in Account Settings.",
      ],
    },
    {
      title: "Storage and access",
      paragraphs: [
        "Data is stored in Supabase (Postgres, Auth and Storage). Row Level Security policies restrict customer access to their own profile, addresses, cart, orders, wishlist, builds and notifications.",
        "Staff access is limited by role. Administrator-only actions include changing roles, suspending accounts and changing store settings. Service-role credentials are kept server-side and are never sent to the browser.",
      ],
    },
    {
      title: "Sharing",
      paragraphs: [
        "Payment providers receive the order number and amount required to create a payment. Shipping providers receive the delivery details required to quote or deliver an order.",
        "We do not sell personal data. Data is shared only with the processors needed to operate the store, or where required by law.",
      ],
    },
    {
      title: "Retention",
      paragraphs: [
        "Account data is retained while your account is active. Order, payment and warranty records may be retained for the period required by applicable law and for warranty administration.",
        "Support messages and moderation records are retained while needed to resolve the request and maintain an audit trail.",
      ],
    },
    {
      title: "Your choices",
      paragraphs: [
        "You can update your profile, addresses and notification preferences in your account. You can request access, correction or deletion of your data through support, subject to legal retention requirements.",
        "Deleting your account does not automatically erase order records that must be retained for accounting, warranty or dispute purposes.",
      ],
    },
    {
      title: "Cookies",
      paragraphs: [
        "Session cookies keep you signed in. A guest cart cookie stores the products you add before signing in. Toasts and interface preferences are stored locally in the browser and are not used for advertising.",
      ],
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title={
          <>
            Your data,
            <br />
            <span className="text-violet">on a need-to-know basis.</span>
          </>
        }
        description="What the store collects, why it is needed, who can access it and how to exercise your choices. This policy describes the behaviour of the software in this repository."
        crumbs={[{ label: "Privacy" }]}
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <LockKeyhole className="size-5 text-neon" />
            <p className="mt-2 text-[11px] leading-relaxed text-white/55">
              Customer tables are protected with Row Level Security. Access to another customer&apos;s
              records is denied at the database layer, not only in the interface.
            </p>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs text-muted">
            Last updated: 15 November 2026 · Contact:{" "}
            {settings.store_email || "configure the store email in Admin → Settings"}
          </p>
          <div className="mt-8 space-y-8">
            {sections.map((section, index) => (
              <section key={section.title}>
                <h2 className="font-display text-lg font-semibold">
                  <span className="mr-2 font-mono text-xs font-normal text-violet">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-2 space-y-2.5">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[13px] leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Questions or requests</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Use the contact form to request access, correction or deletion, or to ask how a
              specific record is used.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold text-violet">
              <Link href="/contact" className="hover:underline">
                Contact support
              </Link>
              <span className="text-muted/30">·</span>
              <Link href="/terms" className="hover:underline">
                Terms of service
              </Link>
              <span className="text-muted/30">·</span>
              <Link href="/warranty" className="hover:underline">
                Warranty policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
