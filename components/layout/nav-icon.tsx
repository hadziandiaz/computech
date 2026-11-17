import {
  Activity,
  BadgeCheck,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  Cpu,
  Heart,
  Layers,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Ticket,
  TicketPercent,
  User,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Activity,
  BadgeCheck,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  Cpu,
  Heart,
  Layers,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Ticket,
  TicketPercent,
  User,
  Users,
  Warehouse,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
