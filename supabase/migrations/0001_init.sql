-- =====================================================================
-- COMPUTECH — Core schema
-- Migration 0001: enums, tables, constraints, indexes, triggers,
-- helper functions, order RPCs, Row Level Security, storage policies.
--
-- Run after creating a Supabase project, before 0002_seed.sql.
-- All tables live in the public schema and use auth.users as identity.
-- =====================================================================

begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('admin', 'staff', 'customer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_status as enum ('draft', 'active', 'archived', 'out_of_stock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'expired', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.shipment_status as enum ('pending', 'ready', 'in_transit', 'delivered', 'returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.promotion_type as enum (
    'flash_sale', 'product_discount', 'bundle', 'voucher', 'free_shipping',
    'seasonal', 'special_offer', 'member_discount'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.warranty_type as enum ('manufacturer', 'distributor', 'store', 'none');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_type as enum (
    'registration', 'order_created', 'payment_confirmed', 'order_processed',
    'order_shipped', 'order_completed', 'promotion', 'voucher', 'stock'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inventory_movement_type as enum ('in', 'out', 'adjustment', 'reservation', 'release', 'return');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.support_status as enum ('new', 'in_progress', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pc_component_type as enum (
    'cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu', 'case', 'cooler', 'case_fan'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.compatibility_status as enum ('compatible', 'warning', 'incompatible');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pc_usage as enum (
    'office', 'programming', 'gaming', 'video_editing', 'graphic_design', 'rendering', 'streaming'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Core identity tables
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text check (full_name is null or char_length(full_name) between 1 and 100),
  phone text check (phone is null or char_length(phone) <= 30),
  avatar_url text,
  is_suspended boolean not null default false,
  marketing_opt_in boolean not null default false,
  order_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  image_url text,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku text not null unique check (char_length(sku) between 2 and 60),
  brand_id uuid references public.brands (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  short_description text,
  description text,
  price integer not null check (price >= 0),
  discount_price integer check (discount_price is null or (discount_price >= 0 and discount_price <= price)),
  warranty_months integer not null default 0 check (warranty_months between 0 and 120),
  warranty_type public.warranty_type not null default 'manufacturer',
  warranty_provider text,
  weight_grams integer not null default 0 check (weight_grams >= 0),
  status public.product_status not null default 'active',
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  sold_count integer not null default 0 check (sold_count >= 0),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  group_name text,
  name text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_inventory (
  product_id uuid primary key references public.products (id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  movement_type public.inventory_movement_type not null,
  quantity integer not null check (quantity <> 0),
  stock_after integer not null check (stock_after >= 0),
  note text,
  reference_id uuid,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PC Builder
-- ---------------------------------------------------------------------

create table if not exists public.pc_component_specs (
  product_id uuid primary key references public.products (id) on delete cascade,
  component_type public.pc_component_type not null,
  socket text,
  chipset text,
  tdp_watt integer check (tdp_watt is null or tdp_watt >= 0),
  cores integer check (cores is null or cores > 0),
  integrated_graphics boolean,
  memory_type text,
  memory_slots integer check (memory_slots is null or memory_slots >= 0),
  max_memory_gb integer check (max_memory_gb is null or max_memory_gb > 0),
  form_factor text,
  supported_form_factors text[],
  m2_slots integer check (m2_slots is null or m2_slots >= 0),
  sata_ports integer check (sata_ports is null or sata_ports >= 0),
  gpu_length_mm integer check (gpu_length_mm is null or gpu_length_mm >= 0),
  gpu_tdp integer check (gpu_tdp is null or gpu_tdp >= 0),
  gpu_power_connectors text,
  recommended_psu_watt integer check (recommended_psu_watt is null or recommended_psu_watt >= 0),
  wattage integer check (wattage is null or wattage >= 0),
  efficiency text,
  pcie_8pin_connectors integer check (pcie_8pin_connectors is null or pcie_8pin_connectors >= 0),
  pcie_16pin_connectors integer check (pcie_16pin_connectors is null or pcie_16pin_connectors >= 0),
  max_gpu_length_mm integer check (max_gpu_length_mm is null or max_gpu_length_mm >= 0),
  max_cooler_height_mm integer check (max_cooler_height_mm is null or max_cooler_height_mm >= 0),
  fan_mount_sizes text[],
  cooler_height_mm integer check (cooler_height_mm is null or cooler_height_mm >= 0),
  cooler_sockets text[],
  cooler_tdp_rating integer check (cooler_tdp_rating is null or cooler_tdp_rating >= 0),
  ram_modules integer check (ram_modules is null or ram_modules >= 0),
  ram_capacity_gb integer check (ram_capacity_gb is null or ram_capacity_gb >= 0),
  ram_speed_mhz integer check (ram_speed_mhz is null or ram_speed_mhz >= 0),
  storage_interface text,
  storage_capacity_gb integer check (storage_capacity_gb is null or storage_capacity_gb >= 0),
  performance_score numeric(10,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pc_component_compatibility (
  id uuid primary key default gen_random_uuid(),
  component_a_product_id uuid not null references public.products (id) on delete cascade,
  component_b_product_id uuid not null references public.products (id) on delete cascade,
  status public.compatibility_status not null,
  reason text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (component_a_product_id <> component_b_product_id),
  unique (component_a_product_id, component_b_product_id)
);

create table if not exists public.pc_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My COMPUTECH Build' check (char_length(name) between 1 and 120),
  budget integer not null default 0 check (budget >= 0),
  usage public.pc_usage not null default 'gaming',
  share_slug text not null unique default replace(gen_random_uuid()::text, '-', ''),
  is_public boolean not null default false,
  total_price integer not null default 0 check (total_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pc_build_items (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.pc_builds (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  component_type public.pc_component_type not null,
  created_at timestamptz not null default now(),
  unique (build_id, component_type)
);

-- ---------------------------------------------------------------------
-- Customer engagement
-- ---------------------------------------------------------------------

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null default 1 check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Home' check (char_length(label) between 1 and 40),
  recipient_name text not null check (char_length(recipient_name) between 2 and 100),
  phone text not null check (char_length(phone) between 8 and 30),
  province text not null,
  city text not null,
  district text not null,
  postal_code text not null check (postal_code ~ '^[0-9]{4,6}$'),
  street text not null,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists addresses_one_default_per_user
  on public.addresses (user_id) where is_default;

-- ---------------------------------------------------------------------
-- Catalog merchandising
-- ---------------------------------------------------------------------

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  type public.promotion_type not null,
  discount_type public.discount_type not null default 'percentage',
  discount_value integer not null default 0 check (discount_value >= 0),
  start_date timestamptz not null default now(),
  end_date timestamptz not null default now() + interval '30 days',
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  min_purchase integer not null default 0 check (min_purchase >= 0),
  max_discount integer check (max_discount is null or max_discount >= 0),
  banner_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date > start_date),
  check (discount_type <> 'percentage' or discount_value <= 100)
);

create table if not exists public.promotion_products (
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  discount_type public.discount_type,
  discount_value integer check (discount_value is null or discount_value >= 0),
  primary key (promotion_id, product_id)
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and char_length(code) between 3 and 40),
  name text not null,
  description text,
  discount_type public.discount_type not null default 'fixed',
  discount_value integer not null check (discount_value > 0),
  min_purchase integer not null default 0 check (min_purchase >= 0),
  max_discount integer check (max_discount is null or max_discount >= 0),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  per_user_limit integer not null default 1 check (per_user_limit > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at),
  check (discount_type <> 'percentage' or discount_value <= 100)
);

create table if not exists public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  courier text not null,
  description text,
  cost integer not null default 0 check (cost >= 0),
  estimated_days text not null default '2-4 days',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Example zone-based shipping rates. A zone matches when any of its lowercase
-- tokens appears in the destination province / city / district. A zone with
-- no tokens is the catch-all fallback, so every destination gets a quote.
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  matchers text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_zone_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.shipping_zones (id) on delete cascade,
  method_id uuid not null references public.shipping_methods (id) on delete cascade,
  cost integer not null default 0 check (cost >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (zone_id, method_id)
);

create index if not exists shipping_zone_rates_zone_idx on public.shipping_zone_rates (zone_id);

-- ---------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users (id) on delete restrict,
  status public.order_status not null default 'pending',
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  total integer not null check (total >= 0),
  voucher_id uuid references public.vouchers (id) on delete set null,
  voucher_code text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  shipping_zone_name text,
  shipping_zone_code text,
  notes text,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount <= subtotal)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_sku text not null,
  product_slug text,
  image_url text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0),
  warranty_months integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'manual',
  method text,
  status public.payment_status not null default 'pending',
  amount integer not null check (amount >= 0),
  external_id text,
  payment_url text,
  paid_at timestamptz,
  expires_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  courier text not null default '',
  service text not null default '',
  tracking_number text,
  status public.shipment_status not null default 'pending',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references public.vouchers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  discount integer not null check (discount >= 0),
  created_at timestamptz not null default now(),
  unique (voucher_id, order_id)
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  order_item_id uuid references public.order_items (id) on delete set null,
  reviewer_name text not null check (char_length(reviewer_name) between 1 and 80),
  rating integer not null check (rating between 1 and 5),
  title text check (title is null or char_length(title) <= 120),
  body text not null check (char_length(body) between 3 and 2000),
  is_approved boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_reviews_one_per_user
  on public.product_reviews (product_id, user_id) where user_id is not null;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  order_item_id uuid not null unique references public.order_items (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  warranty_type public.warranty_type not null,
  provider text,
  duration_months integer not null check (duration_months >= 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (position('@' in email) > 1),
  phone text,
  subject text not null check (char_length(subject) between 3 and 160),
  message text not null check (char_length(message) between 10 and 5000),
  status public.support_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (position('@' in email) > 1),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;
create index if not exists products_sold_idx on public.products (sold_count desc);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_name_trgm_idx on public.products using gin (name extensions.gin_trgm_ops);
create index if not exists products_sku_trgm_idx on public.products using gin (sku extensions.gin_trgm_ops);
create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);
create index if not exists product_specs_product_idx on public.product_specifications (product_id, sort_order);
create index if not exists inventory_movements_product_idx on public.inventory_movements (product_id, created_at desc);
create index if not exists pc_specs_type_idx on public.pc_component_specs (component_type);
create index if not exists pc_builds_user_idx on public.pc_builds (user_id, updated_at desc);
create index if not exists cart_items_cart_idx on public.cart_items (cart_id);
create index if not exists wishlist_items_wishlist_idx on public.wishlist_items (wishlist_id);
create index if not exists addresses_user_idx on public.addresses (user_id);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists orders_number_idx on public.orders (order_number);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);
create index if not exists payments_order_idx on public.payments (order_id);
create index if not exists shipments_order_idx on public.shipments (order_id);
create index if not exists promotion_products_product_idx on public.promotion_products (product_id);
create index if not exists promotions_dates_idx on public.promotions (is_active, start_date, end_date);
create index if not exists vouchers_active_idx on public.vouchers (is_active, expires_at);
create index if not exists voucher_redemptions_user_idx on public.voucher_redemptions (user_id, created_at desc);
create index if not exists reviews_product_idx on public.product_reviews (product_id, is_approved, created_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, is_read, created_at desc);
create index if not exists warranties_user_idx on public.warranties (user_id, ends_at desc);
create index if not exists support_messages_status_idx on public.support_messages (status, created_at desc);

-- ---------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','user_roles','categories','brands','products','product_inventory',
    'pc_component_specs','pc_builds','wishlists','carts','cart_items','addresses',
    'promotions','vouchers','shipping_methods','shipping_zones','shipping_zone_rates',
    'orders','payments','shipments','product_reviews','support_messages'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- Protect fields that must never be self-modified through the API.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.is_suspended is distinct from old.is_suspended then
      raise exception 'You are not allowed to change account status.';
    end if;
    if lower(new.email) is distinct from lower(old.email) then
      raise exception 'Email can only be changed through authentication.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- New auth users always receive a customer profile. Never admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := nullif(new.raw_user_meta_data ->> 'full_name', '');

  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), display_name)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id) do nothing;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.id,
    'registration',
    'Welcome to COMPUTECH',
    'Your account is ready. Build your setup and define your performance.',
    '/account'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin bootstrap: only executable by postgres/service_role.
create or replace function public.bootstrap_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where lower(email) = lower(target_email);
  if target_id is null then
    raise exception 'No auth user exists with email %', target_email;
  end if;
  insert into public.user_roles (user_id, role)
  values (target_id, 'admin')
  on conflict (user_id) do update set role = 'admin', updated_at = now();
end;
$$;

revoke all on function public.bootstrap_admin(text) from public, anon, authenticated;
grant execute on function public.bootstrap_admin(text) to service_role;

-- ---------------------------------------------------------------------
-- Effective price: product sale price + active promotion pricing
-- ---------------------------------------------------------------------

create or replace function public.effective_price(p_product_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(
    0,
    least(
      p.price,
      coalesce(p.discount_price, p.price),
      coalesce(
        (
          select min(
            case
              when coalesce(pp.discount_type, pr.discount_type) = 'percentage'
                then round(p.price * (1 - coalesce(pp.discount_value, pr.discount_value) / 100.0))::integer
              else greatest(p.price - coalesce(pp.discount_value, pr.discount_value), 0)
            end
          )
          from public.promotion_products pp
          join public.promotions pr on pr.id = pp.promotion_id
          where pp.product_id = p.id
            and pr.is_active
            and now() between pr.start_date and pr.end_date
            and (pr.usage_limit is null or pr.used_count < pr.usage_limit)
        ),
        p.price
      )
    )
  )
  from public.products p
  where p.id = p_product_id;
$$;

-- ---------------------------------------------------------------------
-- Voucher quote (server-authoritative)
-- ---------------------------------------------------------------------

create or replace function public.voucher_quote(p_code text, p_subtotal integer)
returns table (valid boolean, voucher_id uuid, discount integer, message text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v public.vouchers%rowtype;
  used_by_user integer;
  raw_discount integer;
  final_discount integer;
begin
  if auth.uid() is null then
    return query select false, null::uuid, 0, 'Please sign in to use a voucher.';
    return;
  end if;

  select * into v from public.vouchers where code = upper(trim(p_code));
  if not found then
    return query select false, null::uuid, 0, 'Voucher code not found.';
    return;
  end if;
  if not v.is_active then
    return query select false, v.id, 0, 'This voucher is inactive.';
    return;
  end if;
  if v.starts_at > now() then
    return query select false, v.id, 0, 'This voucher is not active yet.';
    return;
  end if;
  if v.expires_at is not null and v.expires_at < now() then
    return query select false, v.id, 0, 'This voucher has expired.';
    return;
  end if;
  if v.usage_limit is not null and v.used_count >= v.usage_limit then
    return query select false, v.id, 0, 'This voucher has reached its usage limit.';
    return;
  end if;
  if p_subtotal < v.min_purchase then
    return query select false, v.id, 0, 'Minimum purchase for this voucher has not been met.';
    return;
  end if;

  -- Qualify with an alias: voucher_id is also an OUT parameter of this
  -- function, and an unqualified reference raises 42702 at runtime.
  select count(*) into used_by_user
  from public.voucher_redemptions vr
  where vr.voucher_id = v.id and vr.user_id = auth.uid();

  if used_by_user >= v.per_user_limit then
    return query select false, v.id, 0, 'You have already used this voucher.';
    return;
  end if;

  raw_discount := case
    when v.discount_type = 'percentage' then round(p_subtotal * v.discount_value / 100.0)::integer
    else v.discount_value
  end;
  final_discount := least(coalesce(v.max_discount, raw_discount), raw_discount, p_subtotal);

  return query select true, v.id, greatest(final_discount, 0), 'Voucher applied.';
end;
$$;

revoke all on function public.voucher_quote(text, integer) from public, anon;
grant execute on function public.voucher_quote(text, integer) to authenticated;

-- ---------------------------------------------------------------------
-- Order number + place order RPC
-- ---------------------------------------------------------------------

create or replace function public.generate_order_number()
returns text
language sql
volatile
as $$
  select 'CT-' || to_char(now(), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 5));
$$;

-- Resolve the example shipping zone from a checkout address snapshot.
create or replace function public.resolve_shipping_zone(p_address jsonb)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_haystack text;
  v_zone_id uuid;
begin
  v_haystack := lower(concat_ws(
    ' ',
    coalesce(p_address ->> 'province', ''),
    coalesce(p_address ->> 'city', ''),
    coalesce(p_address ->> 'district', '')
  ));

  select z.id into v_zone_id
  from public.shipping_zones z
  where z.is_active
    and (
      cardinality(z.matchers) = 0
      or exists (
        select 1 from unnest(z.matchers) as token
        where position(lower(token) in v_haystack) > 0
      )
    )
  order by case when cardinality(z.matchers) = 0 then 1 else 0 end, z.sort_order
  limit 1;

  return v_zone_id;
end;
$$;

-- Authoritative quotes shared by the checkout preview and place_order().
create or replace function public.shipping_quotes(p_address jsonb)
returns table (
  method_id uuid,
  cost integer,
  zone_id uuid,
  zone_code text,
  zone_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_zone_id uuid;
  v_zone_code text;
  v_zone_name text;
  v_method record;
  v_cost integer;
begin
  v_zone_id := public.resolve_shipping_zone(p_address);
  if v_zone_id is not null then
    select code, name into v_zone_code, v_zone_name
    from public.shipping_zones where id = v_zone_id;
  end if;

  for v_method in
    select * from public.shipping_methods where is_active order by sort_order
  loop
    v_cost := v_method.cost;
    if v_zone_id is not null then
      select coalesce(max(r.cost), v_method.cost) into v_cost
      from public.shipping_zone_rates r
      where r.zone_id = v_zone_id and r.method_id = v_method.id;
    end if;

    method_id := v_method.id;
    cost := greatest(coalesce(v_cost, v_method.cost, 0), 0);
    zone_id := v_zone_id;
    zone_code := v_zone_code;
    zone_name := v_zone_name;
    return next;
  end loop;
end;
$$;

create or replace function public.place_order(
  p_shipping_address jsonb,
  p_shipping_method_id uuid,
  p_voucher_code text default null,
  p_payment_method text default 'bank_transfer',
  p_payment_provider text default 'manual',
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cart_id uuid;
  v_item record;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_shipping_cost integer := 0;
  v_total integer := 0;
  v_ship public.shipping_methods%rowtype;
  v_voucher_valid boolean := false;
  v_voucher_id uuid;
  v_voucher_discount integer := 0;
  v_voucher_message text;
  v_order_id uuid;
  v_order_number text;
  v_item_id uuid;
  v_stock integer;
  v_free_shipping boolean := false;
  v_free_shipping_min integer := 0;
  v_zone_id uuid;
  v_zone_code text;
  v_zone_name text;
  v_zone_cost integer;
  v_email text;
  v_profile public.profiles%rowtype;
  v_primary_image text;
  v_address_name text;
  v_address_phone text;
  v_items_count integer := 0;
begin
  if v_user is null then
    raise exception 'Authentication required.';
  end if;

  select * into v_profile from public.profiles where id = v_user;
  select email into v_email from auth.users where id = v_user;

  v_address_name := nullif(trim(p_shipping_address ->> 'recipient_name'), '');
  v_address_phone := nullif(trim(p_shipping_address ->> 'phone'), '');
  if v_address_name is null or v_address_phone is null
     or nullif(trim(p_shipping_address ->> 'street'), '') is null
     or nullif(trim(p_shipping_address ->> 'city'), '') is null then
    raise exception 'Shipping address is incomplete.';
  end if;

  select * into v_ship from public.shipping_methods
  where id = p_shipping_method_id and is_active;
  if not found then
    raise exception 'Shipping method is unavailable.';
  end if;

  select id into v_cart_id from public.carts where user_id = v_user;
  if v_cart_id is null then
    raise exception 'Your cart is empty.';
  end if;

  -- Lock cart rows, then check and lock inventory before calculating totals.
  for v_item in
    select ci.product_id, ci.quantity, p.price, p.discount_price, p.name, p.sku, p.slug,
           p.status, p.warranty_months, p.warranty_type, p.warranty_provider
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart_id
    order by ci.created_at
  loop
    if v_item.status <> 'active' then
      raise exception 'Product % is no longer available.', v_item.name;
    end if;
    select stock into v_stock from public.product_inventory
      where product_id = v_item.product_id for update;
    if v_stock is null or v_stock < v_item.quantity then
      raise exception 'Insufficient stock for %.', v_item.name;
    end if;
    v_subtotal := v_subtotal + (public.effective_price(v_item.product_id) * v_item.quantity);
    v_items_count := v_items_count + v_item.quantity;
  end loop;

  if v_items_count = 0 then
    raise exception 'Your cart is empty.';
  end if;

  if p_voucher_code is not null and trim(p_voucher_code) <> '' then
    select q.valid, q.voucher_id, q.discount, q.message
      into v_voucher_valid, v_voucher_id, v_voucher_discount, v_voucher_message
    from public.voucher_quote(p_voucher_code, v_subtotal) q;
    if not v_voucher_valid then
      raise exception '%', v_voucher_message;
    end if;
    v_discount := v_voucher_discount;
  end if;

  -- Free shipping applies when a free-shipping promotion qualifies or when the
  -- subtotal meets the store-wide threshold from site_settings. Both paths are
  -- authoritative so the checkout preview and the placed order always agree.
  select exists (
    select 1 from public.promotions
    where is_active and type = 'free_shipping'
      and now() between start_date and end_date
      and v_subtotal >= min_purchase
      and (usage_limit is null or used_count < usage_limit)
  ) into v_free_shipping;

  select coalesce(
    (
      select case
        when trim(value) ~ '^[0-9]+$' then trim(value)::integer
        else 0
      end
      from public.site_settings
      where key = 'free_shipping_min'
    ),
    0
  ) into v_free_shipping_min;

  if v_free_shipping_min > 0 and v_subtotal >= v_free_shipping_min then
    v_free_shipping := true;
  end if;

  -- Zone rates are authoritative here, so a shopper cannot pick a cheaper
  -- zone than the address actually resolves to at checkout.
  v_zone_id := public.resolve_shipping_zone(p_shipping_address);
  if v_zone_id is not null then
    select code, name into v_zone_code, v_zone_name
    from public.shipping_zones where id = v_zone_id;
    select coalesce(max(r.cost), v_ship.cost) into v_zone_cost
    from public.shipping_zone_rates r
    where r.zone_id = v_zone_id and r.method_id = v_ship.id;
  end if;
  v_zone_cost := coalesce(v_zone_cost, v_ship.cost);

  v_shipping_cost := case when v_free_shipping then 0 else greatest(v_zone_cost, 0) end;
  v_total := greatest(v_subtotal - v_discount + v_shipping_cost, 0);
  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, user_id, status, subtotal, discount, shipping_cost, total,
    voucher_id, voucher_code, customer_name, customer_email, customer_phone,
    shipping_address, shipping_zone_name, shipping_zone_code, notes
  ) values (
    v_order_number, v_user, 'pending', v_subtotal, v_discount, v_shipping_cost, v_total,
    case when v_voucher_valid then v_voucher_id else null end,
    case when v_voucher_valid then upper(trim(p_voucher_code)) else null end,
    coalesce(nullif(trim(v_profile.full_name), ''), v_address_name),
    coalesce(v_profile.email, v_email, ''),
    coalesce(nullif(trim(v_profile.phone), ''), v_address_phone),
    p_shipping_address, v_zone_name, v_zone_code,
    nullif(trim(p_notes), '')
  ) returning id into v_order_id;

  for v_item in
    select ci.product_id, ci.quantity, p.name, p.sku, p.slug, p.warranty_months,
           p.warranty_type, p.warranty_provider
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart_id
    order by ci.created_at
  loop
    select url into v_primary_image
    from public.product_images
    where product_id = v_item.product_id
    order by is_primary desc, sort_order asc
    limit 1;

    insert into public.order_items (
      order_id, product_id, product_name, product_sku, product_slug, image_url,
      unit_price, quantity, line_total, warranty_months
    ) values (
      v_order_id, v_item.product_id, v_item.name, v_item.sku, v_item.slug,
      v_primary_image, public.effective_price(v_item.product_id), v_item.quantity,
      public.effective_price(v_item.product_id) * v_item.quantity, v_item.warranty_months
    ) returning id into v_item_id;

    update public.product_inventory
      set stock = stock - v_item.quantity, updated_at = now()
      where product_id = v_item.product_id
      returning stock into v_stock;

    insert into public.inventory_movements (
      product_id, movement_type, quantity, stock_after, note, reference_id, created_by
    ) values (
      v_item.product_id, 'out', -v_item.quantity, v_stock,
      'Order ' || v_order_number, v_order_id, v_user
    );

    update public.products
      set sold_count = sold_count + v_item.quantity
      where id = v_item.product_id;

    if v_item.warranty_months > 0 then
      insert into public.warranties (
        user_id, order_id, order_item_id, product_id, product_name,
        warranty_type, provider, duration_months, starts_at, ends_at
      ) values (
        v_user, v_order_id, v_item_id, v_item.product_id, v_item.name,
        v_item.warranty_type, v_item.warranty_provider, v_item.warranty_months,
        now(), now() + (v_item.warranty_months || ' months')::interval
      );
    end if;
  end loop;

  insert into public.payments (order_id, provider, method, status, amount)
  values (v_order_id, coalesce(nullif(p_payment_provider, ''), 'manual'),
          nullif(p_payment_method, ''), 'pending', v_total);

  insert into public.shipments (order_id, courier, service, status)
  values (v_order_id, v_ship.courier, v_ship.name, 'pending');

  if v_voucher_valid then
    update public.vouchers set used_count = used_count + 1 where id = v_voucher_id;
    insert into public.voucher_redemptions (voucher_id, user_id, order_id, discount)
    values (v_voucher_id, v_user, v_order_id, v_discount);
  end if;

  update public.promotions pr
    set used_count = pr.used_count + 1
    where pr.is_active
      and now() between pr.start_date and pr.end_date
      and exists (
        select 1 from public.promotion_products pp
        join public.cart_items ci on ci.product_id = pp.product_id
        where pp.promotion_id = pr.id and ci.cart_id = v_cart_id
      );

  delete from public.cart_items where cart_id = v_cart_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_user, 'order_created', 'Order created',
    'Order ' || v_order_number || ' has been created. Complete payment to start processing.',
    '/account/orders/' || v_order_id::text
  );

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping_cost', v_shipping_cost,
    'total', v_total,
    'shipping_zone_code', v_zone_code,
    'shipping_zone_name', v_zone_name,
    'payment_provider', coalesce(nullif(p_payment_provider, ''), 'manual')
  );
end;
$$;

revoke all on function public.place_order(jsonb, uuid, text, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, uuid, text, text, text, text) to authenticated;

revoke all on function public.resolve_shipping_zone(jsonb) from public;
grant execute on function public.resolve_shipping_zone(jsonb) to anon, authenticated;
revoke all on function public.shipping_quotes(jsonb) from public;
grant execute on function public.shipping_quotes(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Order lifecycle RPCs
-- ---------------------------------------------------------------------

create or replace function public.cancel_order(p_order_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if v_order.user_id <> auth.uid() and not public.is_staff() then
    raise exception 'Not authorized.';
  end if;
  if v_order.status not in ('pending', 'confirmed', 'processing') then
    raise exception 'This order can no longer be cancelled.';
  end if;

  for v_item in select product_id, quantity from public.order_items where order_id = p_order_id loop
    if v_item.product_id is not null then
      update public.product_inventory
        set stock = stock + v_item.quantity, updated_at = now()
        where product_id = v_item.product_id;
      insert into public.inventory_movements (
        product_id, movement_type, quantity, stock_after, note, reference_id, created_by
      )
      select v_item.product_id, 'return', v_item.quantity, stock,
             'Cancellation ' || v_order.order_number, p_order_id, auth.uid()
      from public.product_inventory where product_id = v_item.product_id;
    end if;
  end loop;

  update public.orders
    set status = 'cancelled', cancelled_reason = nullif(trim(p_reason), ''), updated_at = now()
    where id = p_order_id;
  update public.payments set status = 'failed', updated_at = now()
    where order_id = p_order_id and status = 'pending';
  update public.shipments set status = 'returned', updated_at = now()
    where order_id = p_order_id;
  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_order.user_id, 'order_created', 'Order cancelled',
    'Order ' || v_order.order_number || ' has been cancelled.',
    '/account/orders/' || p_order_id::text
  );
end;
$$;

revoke all on function public.cancel_order(uuid, text) from public, anon;
grant execute on function public.cancel_order(uuid, text) to authenticated;

create or replace function public.staff_update_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_tracking_number text default null,
  p_courier text default null,
  p_service text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_payment public.payment_status;
begin
  if not public.is_staff() then raise exception 'Not authorized.'; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;

  if p_status = 'cancelled' and v_order.status <> 'cancelled' then
    perform public.cancel_order(p_order_id, 'Cancelled by staff');
    return;
  end if;

  update public.orders set status = p_status, updated_at = now() where id = p_order_id;

  if p_status = 'processing' then
    update public.payments set status = 'paid', paid_at = coalesce(paid_at, now()), updated_at = now()
      where order_id = p_order_id and status = 'pending' and provider = 'manual'
      returning status into v_payment;
    insert into public.notifications (user_id, type, title, body, link)
    values (v_order.user_id, 'order_processed', 'Order is being processed',
      'Order ' || v_order.order_number || ' is now being prepared.', '/account/orders/' || p_order_id);
  elsif p_status = 'shipped' then
    update public.shipments
      set status = 'in_transit',
          courier = coalesce(nullif(trim(p_courier), ''), courier),
          service = coalesce(nullif(trim(p_service), ''), service),
          tracking_number = coalesce(nullif(trim(p_tracking_number), ''), tracking_number),
          shipped_at = coalesce(shipped_at, now()), updated_at = now()
      where order_id = p_order_id;
    insert into public.notifications (user_id, type, title, body, link)
    values (v_order.user_id, 'order_shipped', 'Order shipped',
      'Order ' || v_order.order_number || ' is on the way.', '/account/orders/' || p_order_id);
  elsif p_status in ('delivered', 'completed') then
    update public.shipments
      set status = 'delivered', delivered_at = coalesce(delivered_at, now()), updated_at = now()
      where order_id = p_order_id;
    insert into public.notifications (user_id, type, title, body, link)
    values (v_order.user_id, 'order_completed', 'Order completed',
      'Order ' || v_order.order_number || ' has been delivered.', '/account/orders/' || p_order_id);
  end if;
end;
$$;

revoke all on function public.staff_update_order_status(uuid, public.order_status, text, text, text) from public, anon;
grant execute on function public.staff_update_order_status(uuid, public.order_status, text, text, text) to authenticated;

create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_quantity integer,
  p_movement_type public.inventory_movement_type,
  p_note text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock integer;
  v_delta integer;
begin
  if not public.is_staff() then raise exception 'Not authorized.'; end if;
  if p_quantity <= 0 then raise exception 'Quantity must be greater than zero.'; end if;
  if p_movement_type not in ('in', 'out', 'adjustment') then
    raise exception 'Unsupported manual movement type.';
  end if;

  select stock into v_stock from public.product_inventory
    where product_id = p_product_id for update;
  if v_stock is null then raise exception 'Inventory record not found.'; end if;

  v_delta := case when p_movement_type = 'in' then p_quantity
                  when p_movement_type = 'out' then -p_quantity
                  else p_quantity - v_stock end;
  v_stock := v_stock + v_delta;
  if v_stock < 0 then raise exception 'Stock cannot be negative.'; end if;

  update public.product_inventory
    set stock = v_stock, updated_at = now()
    where product_id = p_product_id;

  insert into public.inventory_movements (
    product_id, movement_type, quantity, stock_after, note, created_by
  ) values (
    p_product_id, p_movement_type, case when v_delta = 0 then 1 else v_delta end,
    v_stock, nullif(trim(p_note), ''), auth.uid()
  );

  if v_stock <= (select low_stock_threshold from public.product_inventory where product_id = p_product_id) then
    insert into public.notifications (user_id, type, title, body, link)
    select ur.user_id, 'stock', 'Low stock alert',
      'A product is at or below its low-stock threshold (' || v_stock || ' left).',
      '/admin/inventory'
    from public.user_roles ur where ur.role in ('admin', 'staff');
  end if;

  return v_stock;
end;
$$;

revoke all on function public.adjust_inventory(uuid, integer, public.inventory_movement_type, text) from public, anon;
grant execute on function public.adjust_inventory(uuid, integer, public.inventory_movement_type, text) to authenticated;

-- Public tracking only returns data when the email matches the order.
create or replace function public.track_order(p_order_number text, p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_items jsonb;
  v_shipment jsonb;
begin
  select * into v_order from public.orders
  where order_number = upper(trim(p_order_number))
    and lower(customer_email) = lower(trim(p_email));
  if not found then return null; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'name', oi.product_name, 'quantity', oi.quantity, 'image_url', oi.image_url
  )), '[]'::jsonb) into v_items
  from public.order_items oi where oi.order_id = v_order.id;

  select to_jsonb(s) into v_shipment from (
    select courier, service, tracking_number, status, shipped_at, delivered_at
    from public.shipments where order_id = v_order.id
  ) s;

  return jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'created_at', v_order.created_at,
    'total', v_order.total,
    'items', v_items,
    'shipment', v_shipment
  );
end;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- Recalculate public rating after review changes.
create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.product_id, old.product_id);
  update public.products p
  set rating = coalesce((
        select round(avg(r.rating)::numeric, 1) from public.product_reviews r
        where r.product_id = target and r.is_approved
      ), 0),
      review_count = (
        select count(*) from public.product_reviews r
        where r.product_id = target and r.is_approved
      )
  where p.id = target;
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_product_rating on public.product_reviews;
create trigger refresh_product_rating
  after insert or update of rating, is_approved or delete on public.product_reviews
  for each row execute function public.refresh_product_rating();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.pc_component_specs enable row level security;
alter table public.pc_component_compatibility enable row level security;
alter table public.pc_builds enable row level security;
alter table public.pc_build_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
alter table public.vouchers enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.voucher_redemptions enable row level security;
alter table public.product_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.warranties enable row level security;
alter table public.support_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Roles: users can read their own role; only admins can write.
drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists user_roles_admin_all on public.user_roles;
create policy user_roles_admin_all on public.user_roles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Public catalog
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated
  using (is_active or public.is_staff());
drop policy if exists categories_staff_all on public.categories;
create policy categories_staff_all on public.categories for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands for select to anon, authenticated
  using (is_active or public.is_staff());
drop policy if exists brands_staff_all on public.brands;
create policy brands_staff_all on public.brands for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated
  using (status = 'active' or public.is_staff());
drop policy if exists products_staff_all on public.products;
create policy products_staff_all on public.products for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.status = 'active' or public.is_staff())
  ));
drop policy if exists product_images_staff_all on public.product_images;
create policy product_images_staff_all on public.product_images for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists product_specs_public_read on public.product_specifications;
create policy product_specs_public_read on public.product_specifications for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.status = 'active' or public.is_staff())
  ));
drop policy if exists product_specs_staff_all on public.product_specifications;
create policy product_specs_staff_all on public.product_specifications for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists inventory_public_read on public.product_inventory;
create policy inventory_public_read on public.product_inventory for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.status = 'active' or public.is_staff())
  ));
drop policy if exists inventory_staff_all on public.product_inventory;
create policy inventory_staff_all on public.product_inventory for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists inventory_movements_staff on public.inventory_movements;
create policy inventory_movements_staff on public.inventory_movements for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- PC Builder catalog
drop policy if exists pc_specs_public_read on public.pc_component_specs;
create policy pc_specs_public_read on public.pc_component_specs for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.status = 'active' or public.is_staff())
  ));
drop policy if exists pc_specs_staff_all on public.pc_component_specs;
create policy pc_specs_staff_all on public.pc_component_specs for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists pc_compat_public_read on public.pc_component_compatibility;
create policy pc_compat_public_read on public.pc_component_compatibility for select to anon, authenticated
  using (true);
drop policy if exists pc_compat_staff_all on public.pc_component_compatibility;
create policy pc_compat_staff_all on public.pc_component_compatibility for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists pc_builds_select on public.pc_builds;
create policy pc_builds_select on public.pc_builds for select to anon, authenticated
  using (is_public or user_id = auth.uid() or public.is_staff());
drop policy if exists pc_builds_insert on public.pc_builds;
create policy pc_builds_insert on public.pc_builds for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists pc_builds_update on public.pc_builds;
create policy pc_builds_update on public.pc_builds for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists pc_builds_delete on public.pc_builds;
create policy pc_builds_delete on public.pc_builds for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists pc_build_items_select on public.pc_build_items;
create policy pc_build_items_select on public.pc_build_items for select to anon, authenticated
  using (exists (
    select 1 from public.pc_builds b
    where b.id = build_id and (b.is_public or b.user_id = auth.uid() or public.is_staff())
  ));
drop policy if exists pc_build_items_write on public.pc_build_items;
create policy pc_build_items_write on public.pc_build_items for all to authenticated
  using (exists (select 1 from public.pc_builds b where b.id = build_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.pc_builds b where b.id = build_id and b.user_id = auth.uid()));

-- Wishlist
drop policy if exists wishlists_own on public.wishlists;
create policy wishlists_own on public.wishlists for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists wishlist_items_own on public.wishlist_items;
create policy wishlist_items_own on public.wishlist_items for all to authenticated
  using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));

-- Cart
drop policy if exists carts_own on public.carts;
create policy carts_own on public.carts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists cart_items_own on public.cart_items;
create policy cart_items_own on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- Addresses
drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Merchandising
drop policy if exists promotions_public_read on public.promotions;
create policy promotions_public_read on public.promotions for select to anon, authenticated
  using ((is_active and now() between start_date and end_date) or public.is_staff());
drop policy if exists promotions_staff_all on public.promotions;
create policy promotions_staff_all on public.promotions for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists promotion_products_public_read on public.promotion_products;
create policy promotion_products_public_read on public.promotion_products for select to anon, authenticated
  using (exists (select 1 from public.promotions pr where pr.id = promotion_id and pr.is_active));
drop policy if exists promotion_products_staff_all on public.promotion_products;
create policy promotion_products_staff_all on public.promotion_products for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists vouchers_authenticated_read on public.vouchers;
create policy vouchers_authenticated_read on public.vouchers for select to authenticated
  using (is_active or public.is_staff());
drop policy if exists vouchers_staff_all on public.vouchers;
create policy vouchers_staff_all on public.vouchers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists shipping_methods_public_read on public.shipping_methods;
create policy shipping_methods_public_read on public.shipping_methods for select to anon, authenticated
  using (is_active or public.is_staff());
drop policy if exists shipping_methods_staff_all on public.shipping_methods;
create policy shipping_methods_staff_all on public.shipping_methods for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists shipping_zones_public_read on public.shipping_zones;
create policy shipping_zones_public_read on public.shipping_zones for select to anon, authenticated
  using (is_active or public.is_staff());
drop policy if exists shipping_zones_staff_all on public.shipping_zones;
create policy shipping_zones_staff_all on public.shipping_zones for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists shipping_zone_rates_public_read on public.shipping_zone_rates;
create policy shipping_zone_rates_public_read on public.shipping_zone_rates for select to anon, authenticated
  using (true);
drop policy if exists shipping_zone_rates_staff_all on public.shipping_zone_rates;
create policy shipping_zone_rates_staff_all on public.shipping_zone_rates for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Orders are inserted only through place_order().
drop policy if exists orders_own_select on public.orders;
create policy orders_own_select on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
drop policy if exists orders_staff_update on public.orders;
create policy orders_staff_update on public.orders for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
  ));

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
  ));
drop policy if exists payments_staff_update on public.payments;
create policy payments_staff_update on public.payments for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists shipments_select on public.shipments;
create policy shipments_select on public.shipments for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
  ));
drop policy if exists shipments_staff_update on public.shipments;
create policy shipments_staff_update on public.shipments for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists voucher_redemptions_own on public.voucher_redemptions;
create policy voucher_redemptions_own on public.voucher_redemptions for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

-- Reviews
drop policy if exists reviews_public_read on public.product_reviews;
create policy reviews_public_read on public.product_reviews for select to anon, authenticated
  using (is_approved or user_id = auth.uid() or public.is_staff());
drop policy if exists reviews_insert_verified on public.product_reviews;
create policy reviews_insert_verified on public.product_reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and is_approved = false
    and is_demo = false
    and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = product_id
        and o.user_id = auth.uid()
        and o.status in ('delivered', 'completed')
    )
  );
drop policy if exists reviews_update_own on public.product_reviews;
create policy reviews_update_own on public.product_reviews for update to authenticated
  using (user_id = auth.uid() and not is_approved)
  with check (user_id = auth.uid() and not is_approved);
drop policy if exists reviews_staff_all on public.product_reviews;
create policy reviews_staff_all on public.product_reviews for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Notifications
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for all to authenticated
  using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid() or public.is_staff());

-- Warranties
drop policy if exists warranties_own on public.warranties;
create policy warranties_own on public.warranties for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
drop policy if exists warranties_staff_all on public.warranties;
create policy warranties_staff_all on public.warranties for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Support
drop policy if exists support_insert_public on public.support_messages;
create policy support_insert_public on public.support_messages for insert to anon, authenticated
  with check (status = 'new');
drop policy if exists support_staff_read on public.support_messages;
create policy support_staff_read on public.support_messages for select to authenticated
  using (public.is_staff());
drop policy if exists support_staff_update on public.support_messages;
create policy support_staff_update on public.support_messages for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Settings and newsletter
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select to anon, authenticated
  using (true);
drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists newsletter_insert_public on public.newsletter_subscribers;
create policy newsletter_insert_public on public.newsletter_subscribers for insert to anon, authenticated
  with check (is_active);
drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers for select to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------
-- Grants (RLS still restricts every row)
-- ---------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.effective_price(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage buckets & policies
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('promotion-banners', 'promotion-banners', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists computect_storage_public_read on storage.objects;
create policy computect_storage_public_read on storage.objects for select
  using (bucket_id in ('product-images','category-images','avatars','promotion-banners'));

drop policy if exists computect_storage_staff_write on storage.objects;
create policy computect_storage_staff_write on storage.objects for insert to authenticated
  with check (
    bucket_id in ('product-images','category-images','promotion-banners')
    and public.is_staff()
  );

drop policy if exists computect_storage_staff_update on storage.objects;
create policy computect_storage_staff_update on storage.objects for update to authenticated
  using (bucket_id in ('product-images','category-images','promotion-banners') and public.is_staff())
  with check (bucket_id in ('product-images','category-images','promotion-banners') and public.is_staff());

drop policy if exists computect_storage_staff_delete on storage.objects;
create policy computect_storage_staff_delete on storage.objects for delete to authenticated
  using (bucket_id in ('product-images','category-images','promotion-banners') and public.is_staff());

drop policy if exists computect_storage_avatar_write on storage.objects;
create policy computect_storage_avatar_write on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists computect_storage_avatar_update on storage.objects;
create policy computect_storage_avatar_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists computect_storage_avatar_delete on storage.objects;
create policy computect_storage_avatar_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

commit;
