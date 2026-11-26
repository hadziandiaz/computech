export const siteConfig = {
  name: "COMPUTECH",
  tagline: "Build Your Setup. Define Your Performance.",
  description:
    "COMPUTECH is a technology store for laptops, desktop PCs, PC components, networking equipment, networking tools, and tech accessories.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "id-ID",
};

export const publicNav = [
  { label: "Products", href: "/products" },
  { label: "PC Builder", href: "/pc-builder" },
  { label: "Networking", href: "/networking" },
  { label: "Laptops", href: "/laptops" },
  { label: "Promotions", href: "/promotions" },
  { label: "About", href: "/about" },
];

export const accountNav = [
  { label: "Overview", href: "/account", icon: "LayoutDashboard", group: "Ringkasan" },
  { label: "My Orders", href: "/account/orders", icon: "Package", group: "Belanja" },
  { label: "Wishlist", href: "/account/wishlist", icon: "Heart", group: "Belanja" },
  { label: "My Vouchers", href: "/account/vouchers", icon: "Ticket", group: "Belanja" },
  { label: "Addresses", href: "/account/addresses", icon: "MapPin", group: "Belanja" },
  { label: "Saved Builds", href: "/account/builds", icon: "Cpu", group: "Aktivitas" },
  { label: "Notifications", href: "/account/notifications", icon: "Bell", group: "Aktivitas" },
  { label: "My Reviews", href: "/account/reviews", icon: "Star", group: "Aktivitas" },
  { label: "My Profile", href: "/account/profile", icon: "User", group: "Pengaturan" },
  { label: "Account Settings", href: "/account/settings", icon: "Settings", group: "Pengaturan" },
];

export const adminNav = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Products", href: "/admin/products", icon: "Boxes" },
  { label: "Categories", href: "/admin/categories", icon: "Layers" },
  { label: "Brands", href: "/admin/brands", icon: "BadgeCheck" },
  { label: "Inventory", href: "/admin/inventory", icon: "Warehouse" },
  { label: "Orders", href: "/admin/orders", icon: "ShoppingBag" },
  { label: "Customers", href: "/admin/customers", icon: "Users" },
  { label: "PC Components", href: "/admin/pc-components", icon: "Cpu" },
  { label: "Promotions", href: "/admin/promotions", icon: "Megaphone" },
  { label: "Vouchers", href: "/admin/vouchers", icon: "TicketPercent" },
  { label: "Reviews", href: "/admin/reviews", icon: "Star" },
  { label: "Reports", href: "/admin/reports", icon: "ChartNoAxesCombined" },
  { label: "Support", href: "/admin/support", icon: "MessageSquare" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];

export const orderStatusLabels: Record<string, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const paymentStatusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
  refunded: "Refunded",
};

export const shipmentStatusLabels: Record<string, string> = {
  pending: "Pending",
  ready: "Ready to ship",
  in_transit: "In transit",
  delivered: "Delivered",
  returned: "Returned",
};

export const pcComponentLabels: Record<string, string> = {
  cpu: "Processor",
  motherboard: "Motherboard",
  gpu: "Graphics Card",
  ram: "Memory",
  storage: "Storage",
  psu: "Power Supply",
  case: "PC Case",
  cooler: "CPU Cooler",
  case_fan: "Case Fans",
};

export const pcComponentOrder = [
  "cpu",
  "motherboard",
  "gpu",
  "ram",
  "storage",
  "psu",
  "case",
  "cooler",
  "case_fan",
] as const;

export const pcUsageOptions = [
  {
    value: "office",
    label: "Office",
    description: "Documents, browsing, everyday productivity",
  },
  {
    value: "programming",
    label: "Programming",
    description: "IDEs, containers, multi-tasking",
  },
  {
    value: "gaming",
    label: "Gaming",
    description: "High frame rates and modern titles",
  },
  {
    value: "video_editing",
    label: "Video Editing",
    description: "Timeline editing, colour, export",
  },
  {
    value: "graphic_design",
    label: "Graphic Design",
    description: "Large canvases and creative suites",
  },
  {
    value: "rendering",
    label: "3D Rendering",
    description: "CPU/GPU heavy scene rendering",
  },
  {
    value: "streaming",
    label: "Streaming",
    description: "Game + encode + chat workloads",
  },
] as const;

export const demoDisclaimer =
  "Demo catalog data is provided for evaluation. It does not represent live store stock.";
