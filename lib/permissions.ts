import type { UserRole } from "@/types/domain";

export type Permission =
  | "admin.access"
  | "catalog.read"
  | "catalog.write"
  | "inventory.write"
  | "orders.read"
  | "orders.write"
  | "customers.read"
  | "customers.write"
  | "roles.write"
  | "promotions.write"
  | "vouchers.write"
  | "reviews.moderate"
  | "components.write"
  | "reports.read"
  | "settings.write";

const staffPermissions: Permission[] = [
  "admin.access",
  "catalog.read",
  "catalog.write",
  "inventory.write",
  "orders.read",
  "orders.write",
  "customers.read",
  "promotions.write",
  "vouchers.write",
  "reviews.moderate",
  "components.write",
  "reports.read",
];

const adminPermissions: Permission[] = [
  ...staffPermissions,
  "customers.write",
  "roles.write",
  "settings.write",
];

export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: adminPermissions,
  staff: staffPermissions,
  customer: [],
};

export function can(role: UserRole | null | undefined, permission: Permission) {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function isAdmin(role: UserRole | null | undefined) {
  return role === "admin";
}

export function isStaff(role: UserRole | null | undefined) {
  return role === "admin" || role === "staff";
}
