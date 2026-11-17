import { getAuthUser } from "@/lib/auth";
import { getCartCount } from "@/lib/cart/service";
import { getCategoryTree } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/settings";
import { isStaff } from "@/lib/permissions";

import { AnnouncementBar } from "./announcement-bar";
import { HeaderClient } from "./header-client";

export async function SiteHeader() {
  const [user, settings, categories] = await Promise.all([
    getAuthUser(),
    getSiteSettings(),
    getCategoryTree(),
  ]);
  const cartCount = await getCartCount(user?.id ?? null);

  return (
    <>
      <AnnouncementBar text={settings.announcement_text} link={settings.announcement_link} />
      <HeaderClient
        user={
          user
            ? {
                name: user.profile?.full_name || user.email.split("@")[0],
                email: user.email,
                staff: isStaff(user.role),
              }
            : null
        }
        cartCount={cartCount}
        categories={categories.map((category) => ({
          name: category.name,
          slug: category.slug,
          children: (category.children ?? []).map((child) => ({
            name: child.name,
            slug: child.slug,
          })),
        }))}
      />
    </>
  );
}
