import { AdminNav } from "@/components/layout/admin-nav";
import { requireStaff } from "@/lib/auth";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin data (stock, orders, customers, settings) must always be fresh.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff("/admin");
  const name = user.profile?.full_name || user.email.split("@")[0] || "Staff";

  return (
    <div className="min-h-screen bg-mist">
      <AdminNav
        name={name}
        email={user.email}
        role={user.role === "admin" ? "admin" : "staff"}
      />
      <div className="lg:pl-60">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
