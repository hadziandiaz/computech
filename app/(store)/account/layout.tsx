import { AccountNav } from "@/components/layout/account-nav";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

// Account data is per-user and must never be cached across requests.
export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  const name = user.profile?.full_name?.trim() || user.email.split("@")[0] || "Customer";

  return (
    <div className="bg-mist/50">
      <div className="container-page py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start">
          <AccountNav name={name} email={user.email} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
