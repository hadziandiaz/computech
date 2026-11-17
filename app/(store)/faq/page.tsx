import { ChevronDown, CircleHelp, MessageCircle, Package, ShieldCheck, Truck, Wrench } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about orders, payments, shipping, PC Builder compatibility, warranty and account management at COMPUTECH.",
};

const groups = [
  {
    icon: Package,
    title: "Orders and payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Add products to your cart, open checkout, choose a saved or new shipping address, select a delivery method, apply a voucher if you have one, then confirm. Prices, stock, voucher eligibility and shipping costs are recalculated on the server when the order is created.",
      },
      {
        q: "Which payment methods are supported?",
        a: "Checkout supports bank transfer, e-wallet, card and QRIS. The payment provider configured for the deployment determines which instructions are shown. Manual bank transfer is always available when no online provider is configured.",
      },
      {
        q: "When is my order confirmed?",
        a: "New orders start as awaiting payment. Once payment is verified, the order moves to confirmed and then processing. Stock is reserved when the order is created and released if the order is cancelled.",
      },
      {
        q: "Can I cancel an order?",
        a: "You can cancel an order from the order detail page while it has not shipped. Cancelling releases reserved stock and records the reason on the order.",
      },
    ],
  },
  {
    icon: Truck,
    title: "Shipping and delivery",
    items: [
      {
        q: "How are shipping costs calculated?",
        a: "Shipping methods are managed in the store settings. Each method has a courier, service description, price and estimated delivery window. The selected method's cost is added to the order at checkout.",
      },
      {
        q: "How do I track my order?",
        a: "Open Track order and enter the order number and the email used at checkout. Once staff mark the order as shipped and add a tracking number, it appears in the result.",
      },
      {
        q: "Do you ship outside Indonesia?",
        a: "The seeded shipping methods cover domestic Indonesian delivery. International delivery depends on the methods configured by staff in the admin console.",
      },
    ],
  },
  {
    icon: Wrench,
    title: "Products and PC Builder",
    items: [
      {
        q: "How reliable are the compatibility checks?",
        a: "The PC Builder compares stored specifications: CPU socket, memory generation and slots, storage interfaces, GPU and cooler clearance, case form factors and power connectors. It is a strong guide, but always confirm physical clearance for modified builds.",
      },
      {
        q: "Are the products real?",
        a: "Seeded products are labelled as demo data for evaluation. They are not live store inventory. Staff-created products are labelled separately.",
      },
      {
        q: "Can I compare products?",
        a: "Yes. Select up to four products with the compare button. The comparison page reads live specifications for the selected products and highlights differences.",
      },
      {
        q: "Can I save a build?",
        a: "Signed-in customers can save builds to their account, keep them private, publish a share link, print them, or add available components to the cart.",
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Warranty and returns",
    items: [
      {
        q: "How does warranty work?",
        a: "Each product records a warranty type, duration and provider. When an order is completed, the terms are copied onto the order and tracked with start and end dates. Contact support with your order number to make a claim.",
      },
      {
        q: "What if an item arrives damaged?",
        a: "Contact support with the order number and photos of the packaging and product. Do not attempt a repair before the claim is assessed.",
      },
      {
        q: "How do refunds work?",
        a: "Refunds are processed by staff and recorded against the payment. A refunded order may be cancelled and its reserved stock released depending on the order status.",
      },
    ],
  },
  {
    icon: CircleHelp,
    title: "Account",
    items: [
      {
        q: "Do I need an account to order?",
        a: "You can browse and use the PC Builder without an account. Checkout and order history require signing in so the order and payment can be linked to you.",
      },
      {
        q: "What happens to a guest cart when I sign in?",
        a: "Guest cart items stored in your browser are merged into your account cart after sign-in, capped by current stock.",
      },
      {
        q: "How do I update my details?",
        a: "Use My Profile for your name and phone, Account Settings for notification preferences and password changes, and Addresses for delivery details.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title={
          <>
            Straight answers,
            <br />
            <span className="text-violet">no runaround.</span>
          </>
        }
        description="The questions customers ask most about orders, payments, delivery, builds, warranty and accounts."
        crumbs={[{ label: "FAQ" }]}
        actions={
          <>
            <Link href="/contact" className={buttonVariants({ size: "lg" })}>
              <MessageCircle /> Ask the team
            </Link>
            <Link
              href="/track-order"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-white/20 bg-transparent text-white hover:border-white/50 hover:bg-white/10",
              })}
            >
              Track an order
            </Link>
          </>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-start">
          <nav className="hidden rounded-2xl border border-line bg-white p-2 lg:sticky lg:top-28 lg:block">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Topics
            </p>
            {groups.map((group) => (
              <a
                key={group.title}
                href={`#${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-mist hover:text-ink"
              >
                <group.icon className="size-4" />
                {group.title}
              </a>
            ))}
          </nav>

          <div className="space-y-8">
            {groups.map((group) => (
              <section
                key={group.title}
                id={group.title.toLowerCase().replace(/[^a-z]+/g, "-")}
                className="scroll-mt-28"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-violet-soft text-violet">
                    <group.icon className="size-4" />
                  </span>
                  <h2 className="font-display text-lg font-semibold">{group.title}</h2>
                </div>
                <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                  {group.items.map((item) => (
                    <details key={item.q} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-[13px] font-semibold marker:content-none hover:bg-mist/60">
                        {item.q}
                        <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="px-4 pb-4 text-[13px] leading-relaxed text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <div className="rounded-2xl bg-ink p-6 text-white">
              <h2 className="font-display text-lg font-semibold">Still need help?</h2>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-white/55">
                Send the details and we will reply by email. Include your order number if the
                question is about an existing order.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/contact" className={buttonVariants({ size: "sm" })}>
                  Contact support
                </Link>
                <Link
                  href="/shipping"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10",
                  })}
                >
                  Shipping details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
