export type UserRole = "admin" | "staff" | "customer";

export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

export type ShipmentStatus =
  | "pending"
  | "ready"
  | "in_transit"
  | "delivered"
  | "returned";

export type PromotionType =
  | "flash_sale"
  | "product_discount"
  | "bundle"
  | "voucher"
  | "free_shipping"
  | "seasonal"
  | "special_offer"
  | "member_discount";

export type DiscountType = "percentage" | "fixed";

export type WarrantyType = "manufacturer" | "distributor" | "store" | "none";

export type NotificationType =
  | "registration"
  | "order_created"
  | "payment_confirmed"
  | "order_processed"
  | "order_shipped"
  | "order_completed"
  | "promotion"
  | "voucher"
  | "stock";

export type PcComponentType =
  | "cpu"
  | "motherboard"
  | "gpu"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooler"
  | "case_fan";

export type CompatibilityStatus =
  | "compatible"
  | "warning"
  | "incompatible"
  | "unknown";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_suspended: boolean;
  marketing_opt_in: boolean;
  order_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  role: UserRole;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  product_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  group_name: string | null;
  name: string;
  value: string;
  sort_order: number;
}

export interface ProductInventory {
  product_id: string;
  stock: number;
  reserved: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand_id: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  warranty_months: number;
  warranty_type: WarrantyType;
  warranty_provider: string | null;
  weight_grams: number;
  status: ProductStatus;
  is_featured: boolean;
  is_demo: boolean;
  sold_count: number;
  rating: number;
  review_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  brand?: Brand | null;
  category?: Category | null;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  inventory?: ProductInventory | null;
  pc_spec?: PcComponentSpec | null;
  effective_price?: number;
  promotion?: PromotionSummary | null;
}

export interface PcComponentSpec {
  product_id: string;
  component_type: PcComponentType;
  socket: string | null;
  chipset: string | null;
  tdp_watt: number | null;
  cores: number | null;
  integrated_graphics: boolean | null;
  memory_type: string | null;
  memory_slots: number | null;
  max_memory_gb: number | null;
  form_factor: string | null;
  supported_form_factors: string[] | null;
  m2_slots: number | null;
  sata_ports: number | null;
  gpu_length_mm: number | null;
  gpu_tdp: number | null;
  gpu_power_connectors: string | null;
  recommended_psu_watt: number | null;
  wattage: number | null;
  efficiency: string | null;
  pcie_8pin_connectors: number | null;
  pcie_16pin_connectors: number | null;
  max_gpu_length_mm: number | null;
  max_cooler_height_mm: number | null;
  fan_mount_sizes: string[] | null;
  cooler_height_mm: number | null;
  cooler_sockets: string[] | null;
  cooler_tdp_rating: number | null;
  ram_modules: number | null;
  ram_capacity_gb: number | null;
  ram_speed_mhz: number | null;
  storage_interface: string | null;
  storage_capacity_gb: number | null;
  performance_score: number | null;
  notes: string | null;
}

export interface PromotionSummary {
  id: string;
  name: string;
  slug: string;
  type: PromotionType;
}

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: PromotionType;
  discount_type: DiscountType;
  discount_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  min_purchase: number;
  max_discount: number | null;
  banner_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_ids?: string[];
  products?: Product[];
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase: number;
  max_discount: number | null;
  starts_at: string;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  street: string;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
  unit_price: number;
  line_total: number;
  stock: number;
}

export interface CartSummary {
  lines: CartLine[];
  item_count: number;
  subtotal: number;
  savings: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  product_slug: string | null;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  warranty_months: number;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  method: string | null;
  status: PaymentStatus;
  amount: number;
  external_id: string | null;
  payment_url: string | null;
  paid_at: string | null;
  expires_at: string | null;
  raw_response: PaymentInstruction | null;
  created_at: string;
  updated_at: string;
}

/** Snapshot stored on payments.raw_response so later settings edits cannot
 * change the instructions shown for an existing order. */
export interface PaymentInstruction {
  kind: "bank_transfer" | "qris" | "cod" | "gateway";
  instructions: string;
  uniqueCode?: number;
  amountDue?: number;
  bank?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  qris?: {
    merchantName: string;
    value: string;
  };
}

export interface Shipment {
  id: string;
  order_id: string;
  courier: string;
  service: string;
  tracking_number: string | null;
  status: ShipmentStatus;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  voucher_code: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddressSnapshot;
  shipping_zone_name: string | null;
  shipping_zone_code: string | null;
  notes: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment | null;
  shipment?: Shipment | null;
}

export interface ShippingAddressSnapshot {
  label?: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  street: string;
  notes?: string | null;
}

export interface ShippingMethod {
  id: string;
  name: string;
  courier: string;
  description: string | null;
  cost: number;
  estimated_days: string;
  is_active: boolean;
  sort_order: number;
}

export interface ShippingZone {
  id: string;
  code: string;
  name: string;
  description: string | null;
  matchers: string[];
  is_active: boolean;
  sort_order: number;
}

export interface ShippingZoneRate {
  id: string;
  zone_id: string;
  method_id: string;
  cost: number;
}

export interface ShippingQuote {
  method_id: string;
  cost: number;
  zone_id: string | null;
  zone_code: string | null;
  zone_name: string | null;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  order_item_id: string | null;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string;
  is_approved: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  product?: Pick<Product, "id" | "name" | "slug"> | null;
  profile?: Pick<Profile, "full_name" | "avatar_url"> | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Warranty {
  id: string;
  user_id: string;
  order_id: string;
  order_item_id: string;
  product_id: string | null;
  product_name: string;
  warranty_type: WarrantyType;
  provider: string | null;
  duration_months: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface PcBuild {
  id: string;
  user_id: string;
  name: string;
  budget: number;
  usage: PcUsage;
  share_slug: string;
  is_public: boolean;
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: PcBuildItem[];
}

export interface PcBuildItem {
  id: string;
  build_id: string;
  product_id: string;
  component_type: PcComponentType;
  created_at: string;
  product?: Product;
}

export type PcUsage =
  | "office"
  | "programming"
  | "gaming"
  | "video_editing"
  | "graphic_design"
  | "rendering"
  | "streaming";

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface VoucherRedemption {
  id: string;
  voucher_id: string;
  user_id: string;
  order_id: string;
  discount: number;
  created_at: string;
  voucher?: Voucher;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  store_name: string;
  store_email: string;
  store_whatsapp: string;
  store_address: string;
  store_hours: string;
  store_tagline: string;
  announcement_text: string;
  announcement_link: string;
  free_shipping_min: number;
  bank_transfer_instructions: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  qris_merchant_name: string;
  qris_string: string;
  cod_instructions: string;
}

export interface AdminStats {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  low_stock: number;
  pending_orders: number;
  paid_orders: number;
  avg_order_value: number;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}
