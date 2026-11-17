-- =====================================================================
-- COMPUTECH - combined database setup
-- Generated from supabase/migrations/0001..0010, run once on a fresh
-- Supabase project (SQL Editor -> paste -> Run).
-- =====================================================================


-- >>> 0001_init.sql >>>

-- =====================================================================
-- COMPUTECH â€” Core schema
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
    'promotions','vouchers','shipping_methods','orders','payments','shipments',
    'product_reviews','support_messages'
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

  select count(*) into used_by_user
  from public.voucher_redemptions
  where voucher_id = v.id and user_id = auth.uid();

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
  v_voucher_result record;
  v_order_id uuid;
  v_order_number text;
  v_item_id uuid;
  v_stock integer;
  v_free_shipping boolean := false;
  v_free_shipping_min integer := 0;
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
    select * into v_voucher_result from public.voucher_quote(p_voucher_code, v_subtotal);
    if not v_voucher_result.valid then
      raise exception '%', v_voucher_result.message;
    end if;
    v_discount := v_voucher_result.discount;
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

  v_shipping_cost := case when v_free_shipping then 0 else v_ship.cost end;
  v_total := greatest(v_subtotal - v_discount + v_shipping_cost, 0);
  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, user_id, status, subtotal, discount, shipping_cost, total,
    voucher_id, voucher_code, customer_name, customer_email, customer_phone,
    shipping_address, notes
  ) values (
    v_order_number, v_user, 'pending', v_subtotal, v_discount, v_shipping_cost, v_total,
    case when v_voucher_result.valid then v_voucher_result.voucher_id else null end,
    case when v_voucher_result.valid then upper(trim(p_voucher_code)) else null end,
    coalesce(nullif(trim(v_profile.full_name), ''), v_address_name),
    coalesce(v_profile.email, v_email, ''),
    coalesce(nullif(trim(v_profile.phone), ''), v_address_phone),
    p_shipping_address,
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

  if v_voucher_result.valid then
    update public.vouchers set used_count = used_count + 1 where id = v_voucher_result.voucher_id;
    insert into public.voucher_redemptions (voucher_id, user_id, order_id, discount)
    values (v_voucher_result.voucher_id, v_user, v_order_id, v_discount);
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
    'payment_provider', coalesce(nullif(p_payment_provider, ''), 'manual')
  );
end;
$$;

revoke all on function public.place_order(jsonb, uuid, text, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, uuid, text, text, text, text) to authenticated;

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


-- >>> 0002_seed_categories_brands.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0002: categories and brands
-- Run after 0001_init.sql.
-- =====================================================================

begin;

insert into public.categories (id, parent_id, name, slug, description, image_url, icon, sort_order) values
  ('01000000-0000-4000-8000-000000000001', null, 'Computer & Laptop', 'computer-laptop', 'Laptops, desktops, mini PCs, all-in-ones and monitors for work and play.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80', 'Laptop', 1),
  ('01000000-0000-4000-8000-000000000002', null, 'PC Components', 'pc-components', 'Processors, motherboards, graphics cards, memory, storage and more.', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1400&q=80', 'Cpu', 2),
  ('01000000-0000-4000-8000-000000000003', null, 'Networking Equipment', 'networking', 'Routers, switches, access points, ONTs and network appliances.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Network', 3),
  ('01000000-0000-4000-8000-000000000004', null, 'Networking Tools & Materials', 'networking-tools', 'Cabling, connectors, testers and installation materials.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Cable', 4),
  ('01000000-0000-4000-8000-000000000005', null, 'Accessories & Peripherals', 'accessories', 'Keyboards, mice, headsets, hubs and desk essentials.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80', 'Keyboard', 5),

  ('01000000-0000-4000-8000-000000000101', '01000000-0000-4000-8000-000000000001', 'Laptop', 'laptop', 'Portable performance for study, work, gaming and creation.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80', 'Laptop', 1),
  ('01000000-0000-4000-8000-000000000102', '01000000-0000-4000-8000-000000000001', 'Desktop PC', 'desktop-pc', 'Pre-built and custom desktop systems.', 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1400&q=80', 'PcCase', 2),
  ('01000000-0000-4000-8000-000000000103', '01000000-0000-4000-8000-000000000001', 'Mini PC', 'mini-pc', 'Compact systems for desks and digital signage.', 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1400&q=80', 'Box', 3),
  ('01000000-0000-4000-8000-000000000104', '01000000-0000-4000-8000-000000000001', 'All-in-One PC', 'all-in-one-pc', 'Space-saving computers with integrated displays.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80', 'Monitor', 4),
  ('01000000-0000-4000-8000-000000000105', '01000000-0000-4000-8000-000000000001', 'Monitor', 'monitor', 'High-refresh and colour-accurate displays.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1400&q=80', 'Monitor', 5),

  ('01000000-0000-4000-8000-000000000201', '01000000-0000-4000-8000-000000000002', 'Processor', 'processor', 'Desktop CPUs from Intel and AMD.', 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=1400&q=80', 'Cpu', 1),
  ('01000000-0000-4000-8000-000000000202', '01000000-0000-4000-8000-000000000002', 'Motherboard', 'motherboard', 'AM5 and LGA1700 boards in multiple form factors.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80', 'CircuitBoard', 2),
  ('01000000-0000-4000-8000-000000000203', '01000000-0000-4000-8000-000000000002', 'Graphics Card', 'graphics-card', 'Gaming and creator GPUs with verified clearance data.', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1400&q=80', 'Gpu', 3),
  ('01000000-0000-4000-8000-000000000204', '01000000-0000-4000-8000-000000000002', 'RAM', 'ram', 'DDR4 and DDR5 memory kits.', 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=1400&q=80', 'MemoryStick', 4),
  ('01000000-0000-4000-8000-000000000205', '01000000-0000-4000-8000-000000000002', 'SSD', 'ssd', 'NVMe and SATA solid-state storage.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1400&q=80', 'HardDrive', 5),
  ('01000000-0000-4000-8000-000000000206', '01000000-0000-4000-8000-000000000002', 'HDD', 'hdd', 'High-capacity hard drives for archives.', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=1400&q=80', 'HardDrive', 6),
  ('01000000-0000-4000-8000-000000000207', '01000000-0000-4000-8000-000000000002', 'Power Supply', 'power-supply', 'Efficient PSUs with modern GPU connectors.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1400&q=80', 'PlugZap', 7),
  ('01000000-0000-4000-8000-000000000208', '01000000-0000-4000-8000-000000000002', 'PC Case', 'pc-case', 'Airflow-focused cases with clearance specifications.', 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1400&q=80', 'PcCase', 8),
  ('01000000-0000-4000-8000-000000000209', '01000000-0000-4000-8000-000000000002', 'CPU Cooler', 'cpu-cooler', 'Air and liquid coolers with socket support.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80', 'Fan', 9),
  ('01000000-0000-4000-8000-00000000020a', '01000000-0000-4000-8000-000000000002', 'Case Fan', 'case-fan', 'Quiet airflow for every build.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80', 'Fan', 10),

  ('01000000-0000-4000-8000-000000000301', '01000000-0000-4000-8000-000000000003', 'Router', 'router', 'Home and business routing platforms.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Router', 1),
  ('01000000-0000-4000-8000-000000000302', '01000000-0000-4000-8000-000000000003', 'Switch', 'switch', 'Managed, unmanaged and PoE switches.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80', 'Network', 2),
  ('01000000-0000-4000-8000-000000000303', '01000000-0000-4000-8000-000000000003', 'Access Point', 'access-point', 'Wi-Fi 6 access points for reliable coverage.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Wifi', 3),
  ('01000000-0000-4000-8000-000000000304', '01000000-0000-4000-8000-000000000003', 'Modem', 'modem', 'Broadband modems and gateways.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Router', 4),
  ('01000000-0000-4000-8000-000000000305', '01000000-0000-4000-8000-000000000003', 'ONT / ONU', 'ont-onu', 'GPON terminals for fibre installations.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Network', 5),
  ('01000000-0000-4000-8000-000000000306', '01000000-0000-4000-8000-000000000003', 'Network Adapter', 'network-adapter', 'Wired adapters for laptops and desktops.', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1400&q=80', 'Cable', 6),
  ('01000000-0000-4000-8000-000000000307', '01000000-0000-4000-8000-000000000003', 'Wireless Adapter', 'wireless-adapter', 'Wi-Fi adapters for systems without radios.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Wifi', 7),
  ('01000000-0000-4000-8000-000000000308', '01000000-0000-4000-8000-000000000003', 'Firewall Appliance', 'firewall-appliance', 'RouterOS and purpose-built network appliances.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80', 'ShieldCheck', 8),

  ('01000000-0000-4000-8000-000000000401', '01000000-0000-4000-8000-000000000004', 'Crimping Tool', 'crimping-tool', 'RJ45 crimping tools for field and bench work.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Wrench', 1),
  ('01000000-0000-4000-8000-000000000402', '01000000-0000-4000-8000-000000000004', 'LAN Tester', 'lan-tester', 'Cable testers for installation verification.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Activity', 2),
  ('01000000-0000-4000-8000-000000000403', '01000000-0000-4000-8000-000000000004', 'Punch Down Tool', 'punch-down-tool', '110/keystone termination tools.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Wrench', 3),
  ('01000000-0000-4000-8000-000000000404', '01000000-0000-4000-8000-000000000004', 'Cable Stripper', 'cable-stripper', 'Precision stripping for copper and fibre.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Scissors', 4),
  ('01000000-0000-4000-8000-000000000405', '01000000-0000-4000-8000-000000000004', 'UTP Cable', 'utp-cable', 'Cat5e/Cat6 copper cable reels.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Cable', 5),
  ('01000000-0000-4000-8000-000000000406', '01000000-0000-4000-8000-000000000004', 'Fiber Optic Cable', 'fiber-optic-cable', 'Fibre patch and distribution cable.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Cable', 6),
  ('01000000-0000-4000-8000-000000000407', '01000000-0000-4000-8000-000000000004', 'RJ45 Connector', 'rj45-connector', 'Cat6 connectors and strain-relief boots.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Plug', 7),
  ('01000000-0000-4000-8000-000000000408', '01000000-0000-4000-8000-000000000004', 'Keystone Jack', 'keystone-jack', 'Cat6 keystone modules for wall outlets.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Grid2x2', 8),
  ('01000000-0000-4000-8000-000000000409', '01000000-0000-4000-8000-000000000004', 'Faceplate', 'faceplate', 'Wall faceplates and adapters.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Square', 9),
  ('01000000-0000-4000-8000-00000000040a', '01000000-0000-4000-8000-000000000004', 'Patch Panel', 'patch-panel', 'Rack-mount termination panels.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80', 'Server', 10),
  ('01000000-0000-4000-8000-00000000040b', '01000000-0000-4000-8000-000000000004', 'Fiber Optic Connector', 'fiber-optic-connector', 'SC, LC and field-termination connectors.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Cable', 11),
  ('01000000-0000-4000-8000-00000000040c', '01000000-0000-4000-8000-000000000004', 'Patch Cord', 'patch-cord', 'Ready-made copper and fibre patch cords.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'Cable', 12),
  ('01000000-0000-4000-8000-00000000040d', '01000000-0000-4000-8000-000000000004', 'Network Rack', 'network-rack', 'Wall-mount and floor-standing racks.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80', 'Server', 13),
  ('01000000-0000-4000-8000-00000000040e', '01000000-0000-4000-8000-000000000004', 'Cable Management', 'cable-management', 'Organise racks and desks cleanly.', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80', 'Cable', 14),

  ('01000000-0000-4000-8000-000000000501', '01000000-0000-4000-8000-000000000005', 'Keyboard', 'keyboard', 'Mechanical and wireless keyboards.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80', 'Keyboard', 1),
  ('01000000-0000-4000-8000-000000000502', '01000000-0000-4000-8000-000000000005', 'Mouse', 'mouse', 'Precision gaming and productivity mice.', 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1400&q=80', 'Mouse', 2),
  ('01000000-0000-4000-8000-000000000503', '01000000-0000-4000-8000-000000000005', 'Headset', 'headset', 'Headsets for gaming, calls and focus.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80', 'Headphones', 3),
  ('01000000-0000-4000-8000-000000000504', '01000000-0000-4000-8000-000000000005', 'Webcam', 'webcam', 'Full HD and 4K cameras for streaming.', 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=1400&q=80', 'Video', 4),
  ('01000000-0000-4000-8000-000000000505', '01000000-0000-4000-8000-000000000005', 'USB Hub', 'usb-hub', 'Docks and multi-port adapters.', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1400&q=80', 'Usb', 5),
  ('01000000-0000-4000-8000-000000000506', '01000000-0000-4000-8000-000000000005', 'HDMI Cable', 'hdmi-cable', 'Certified display cables.', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1400&q=80', 'Cable', 6),
  ('01000000-0000-4000-8000-000000000507', '01000000-0000-4000-8000-000000000005', 'Adapter', 'adapter', 'USB-C, DisplayPort and video adapters.', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1400&q=80', 'Cable', 7),
  ('01000000-0000-4000-8000-000000000508', '01000000-0000-4000-8000-000000000005', 'Laptop Stand', 'laptop-stand', 'Ergonomic stands and risers.', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1400&q=80', 'Laptop', 8),
  ('01000000-0000-4000-8000-000000000509', '01000000-0000-4000-8000-000000000005', 'Cooling Pad', 'cooling-pad', 'Notebook cooling and lap comfort.', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1400&q=80', 'Fan', 9)
on conflict (id) do nothing;

insert into public.brands (id, name, slug, description) values
  ('02000000-0000-4000-8000-000000000001', 'ASUS', 'asus', 'Laptops, motherboards, graphics cards and networking hardware.'),
  ('02000000-0000-4000-8000-000000000002', 'Acer', 'acer', 'Everyday laptops, monitors and desktops.'),
  ('02000000-0000-4000-8000-000000000003', 'Lenovo', 'lenovo', 'Business and consumer computing.'),
  ('02000000-0000-4000-8000-000000000004', 'Dell', 'dell', 'Professional laptops and displays.'),
  ('02000000-0000-4000-8000-000000000005', 'Apple', 'apple', 'Mac laptops and accessories.'),
  ('02000000-0000-4000-8000-000000000006', 'MSI', 'msi', 'Gaming hardware and creator systems.'),
  ('02000000-0000-4000-8000-000000000007', 'Gigabyte', 'gigabyte', 'Motherboards, graphics cards and laptops.'),
  ('02000000-0000-4000-8000-000000000008', 'ASRock', 'asrock', 'Value-focused motherboards and small-form systems.'),
  ('02000000-0000-4000-8000-000000000009', 'Intel', 'intel', 'Processors and platform technology.'),
  ('02000000-0000-4000-8000-00000000000a', 'AMD', 'amd', 'Ryzen processors and Radeon graphics.'),
  ('02000000-0000-4000-8000-00000000000b', 'NVIDIA', 'nvidia', 'GeForce graphics platforms.'),
  ('02000000-0000-4000-8000-00000000000c', 'Corsair', 'corsair', 'Memory, power, cases and peripherals.'),
  ('02000000-0000-4000-8000-00000000000d', 'Kingston', 'kingston', 'Memory and storage.'),
  ('02000000-0000-4000-8000-00000000000e', 'Samsung', 'samsung', 'Memory, storage and displays.'),
  ('02000000-0000-4000-8000-00000000000f', 'Western Digital', 'western-digital', 'Storage for creators and enterprises.'),
  ('02000000-0000-4000-8000-000000000010', 'Seagate', 'seagate', 'High-capacity storage.'),
  ('02000000-0000-4000-8000-000000000011', 'TP-Link', 'tp-link', 'Networking and smart home connectivity.'),
  ('02000000-0000-4000-8000-000000000012', 'MikroTik', 'mikrotik', 'RouterOS networking platforms.'),
  ('02000000-0000-4000-8000-000000000013', 'Ubiquiti', 'ubiquiti', 'UniFi networking and access points.'),
  ('02000000-0000-4000-8000-000000000014', 'Cisco', 'cisco', 'Enterprise networking.'),
  ('02000000-0000-4000-8000-000000000015', 'ZTE', 'zte', 'Broadband and optical network terminals.'),
  ('02000000-0000-4000-8000-000000000016', 'Huawei', 'huawei', 'Optical and enterprise networking.'),
  ('02000000-0000-4000-8000-000000000017', 'Logitech', 'logitech', 'Productivity and gaming peripherals.'),
  ('02000000-0000-4000-8000-000000000018', 'Razer', 'razer', 'Gaming peripherals and systems.'),
  ('02000000-0000-4000-8000-000000000019', 'Anker', 'anker', 'Charging, hubs and accessories.'),
  ('02000000-0000-4000-8000-00000000001a', 'Ugreen', 'ugreen', 'Connectivity and desk accessories.'),
  ('02000000-0000-4000-8000-00000000001b', 'Baseus', 'baseus', 'Mobile and desk accessories.'),
  ('02000000-0000-4000-8000-00000000001c', 'DeepCool', 'deepcool', 'Cooling, cases and power.'),
  ('02000000-0000-4000-8000-00000000001d', 'Cooler Master', 'cooler-master', 'Cases, cooling and power.'),
  ('02000000-0000-4000-8000-00000000001e', 'Seasonic', 'seasonic', 'Premium power supplies.'),
  ('02000000-0000-4000-8000-00000000001f', 'TeamGroup', 'teamgroup', 'Memory and storage.'),
  ('02000000-0000-4000-8000-000000000020', 'COMPUTECH', 'computech', 'COMPUTECH in-house systems, tools and materials.'),
  ('02000000-0000-4000-8000-000000000021', 'Beelink', 'beelink', 'Compact mini PCs.'),
  ('02000000-0000-4000-8000-000000000022', 'LG', 'lg', 'Displays and consumer electronics.'),
  ('02000000-0000-4000-8000-000000000023', 'Arctic', 'arctic', 'PC cooling specialists.'),
  ('02000000-0000-4000-8000-000000000024', 'Belden', 'belden', 'Professional cabling.'),
  ('02000000-0000-4000-8000-000000000025', 'FiberHome', 'fiberhome', 'Fibre optic network equipment.'),
  ('02000000-0000-4000-8000-000000000026', 'Keychron', 'keychron', 'Mechanical keyboards.')
on conflict (id) do nothing;

commit;


-- >>> 0003_seed_products_computers.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0003: computers, laptops and monitors
-- =====================================================================

begin;

insert into public.products (id, name, slug, sku, brand_id, category_id, short_description, description, price, discount_price, warranty_months, warranty_type, warranty_provider, weight_grams, status, is_featured, is_demo, sold_count) values
('10000000-0000-4000-8000-000000000001', 'Lenovo LOQ 15IRX9', 'lenovo-loq-15irx9', 'CT-LAP-001', '02000000-0000-4000-8000-000000000003', '01000000-0000-4000-8000-000000000101',
 'A 15-inch gaming laptop with Intel Core i5 and RTX 4060 graphics.',
 'The Lenovo LOQ 15IRX9 balances gaming performance and everyday productivity. A 144 Hz display, RTX 4060 graphics and dual-fan cooling make it a practical first gaming laptop. Demo specification data is provided for evaluation.',
 15499000, 14299000, 12, 'manufacturer', 'Lenovo Indonesia', 2350, 'active', true, true, 84),
('10000000-0000-4000-8000-000000000002', 'ASUS ROG Zephyrus G14', 'asus-rog-zephyrus-g14', 'CT-LAP-002', '02000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000101',
 'Compact 14-inch gaming and creator laptop with OLED display.',
 'The ROG Zephyrus G14 pairs a compact aluminium chassis with a high-refresh OLED panel. Designed for gamers and creators who need serious portable performance without a large footprint.',
 27999000, null, 24, 'manufacturer', 'ASUS Indonesia', 1730, 'active', true, true, 42),
('10000000-0000-4000-8000-000000000003', 'Acer Aspire 5 Slim', 'acer-aspire-5-slim', 'CT-LAP-003', '02000000-0000-4000-8000-000000000002', '01000000-0000-4000-8000-000000000101',
 'Everyday 15-inch laptop for study, office and browsing.',
 'A thin and light notebook for students and office users. The Aspire 5 Slim covers documents, video calls and browser-heavy work with a familiar Windows experience.',
 8999000, 8299000, 12, 'manufacturer', 'Acer Indonesia', 1780, 'active', false, true, 120),
('10000000-0000-4000-8000-000000000004', 'Dell XPS 13 Plus', 'dell-xps-13-plus', 'CT-LAP-004', '02000000-0000-4000-8000-000000000004', '01000000-0000-4000-8000-000000000101',
 'Premium 13-inch ultrabook with an edge-to-edge keyboard.',
 'A compact premium ultrabook for professionals who travel. The XPS 13 Plus focuses on a clean design, a bright display and a responsive keyboard deck.',
 21999000, null, 24, 'manufacturer', 'Dell Indonesia', 1270, 'active', true, true, 18),
('10000000-0000-4000-8000-000000000005', 'Apple MacBook Air 13 M3', 'apple-macbook-air-13-m3', 'CT-LAP-005', '02000000-0000-4000-8000-000000000005', '01000000-0000-4000-8000-000000000101',
 'Silent, fanless laptop with Apple M3 performance and all-day battery.',
 'The MacBook Air 13 with M3 is built for portable productivity, creative apps and long working sessions. Its fanless design keeps it silent under everyday workloads.',
 16999000, 15999000, 12, 'manufacturer', 'Apple Authorized Reseller', 1240, 'active', true, true, 61),
('10000000-0000-4000-8000-000000000006', 'COMPUTECH Starter Office PC', 'computech-starter-office-pc', 'CT-PC-001', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000102',
 'Pre-built office desktop for documents, calls and everyday multitasking.',
 'A quiet, serviceable office system assembled by COMPUTECH. The Starter Office PC is intended for documents, browsing, video calls and light multitasking. Demo unit specification only.',
 5499000, 4999000, 12, 'store', 'COMPUTECH', 7500, 'active', true, true, 55),
('10000000-0000-4000-8000-000000000007', 'COMPUTECH Creator Ryzen Studio PC', 'computech-creator-ryzen-studio-pc', 'CT-PC-002', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000102',
 'Creator desktop tuned for editing, design and streaming workloads.',
 'The Creator Ryzen Studio PC is configured around multi-core CPU performance, high-speed memory and fast NVMe storage. A balanced starting point for video editing and design work.',
 18999000, null, 24, 'store', 'COMPUTECH', 11000, 'active', true, true, 22),
('10000000-0000-4000-8000-000000000008', 'COMPUTECH Vortex Gaming PC RTX 4070', 'computech-vortex-gaming-pc-rtx-4070', 'CT-PC-003', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000102',
 'High-refresh gaming tower with RTX 4070 SUPER graphics.',
 'A performance-first gaming desktop with a modern airflow case, high-refresh GPU and upgrade-friendly platform. Exact build configuration can be adjusted with our PC Builder.',
 24999000, 23499000, 24, 'store', 'COMPUTECH', 12500, 'active', true, true, 31),
('10000000-0000-4000-8000-000000000009', 'Beelink SER5 Mini PC', 'beelink-ser5-mini-pc', 'CT-MINI-001', '02000000-0000-4000-8000-000000000021', '01000000-0000-4000-8000-000000000103',
 'Compact Ryzen mini PC for light office and home use.',
 'A small-form computer for desks with limited space. Suitable for browsing, documents and light media work, with VESA mounting for monitors.',
 5299000, null, 12, 'manufacturer', 'Beelink', 500, 'active', false, true, 44),
('10000000-0000-4000-8000-000000000010', 'Lenovo IdeaCentre AIO 24', 'lenovo-ideacentre-aio-24', 'CT-AIO-001', '02000000-0000-4000-8000-000000000003', '01000000-0000-4000-8000-000000000104',
 'All-in-one desktop with a 23.8-inch display and tidy cable setup.',
 'An all-in-one system for reception desks, study rooms and home offices. The display, computer and speakers are integrated into one footprint.',
 11999000, 10999000, 12, 'manufacturer', 'Lenovo Indonesia', 8200, 'active', false, true, 26),
('10000000-0000-4000-8000-000000000011', 'LG UltraGear 27GS65Q', 'lg-ultragear-27gs65q', 'CT-MON-001', '02000000-0000-4000-8000-000000000022', '01000000-0000-4000-8000-000000000105',
 '27-inch QHD gaming monitor with a 180 Hz refresh rate.',
 'A fast QHD gaming display with wide viewing angles and a compact stand. Ideal for competitive play and mixed productivity.',
 5499000, 4799000, 12, 'manufacturer', 'LG Indonesia', 6100, 'active', true, true, 73),
('10000000-0000-4000-8000-000000000012', 'Dell UltraSharp U2724D', 'dell-ultrasharp-u2724d', 'CT-MON-002', '02000000-0000-4000-8000-000000000004', '01000000-0000-4000-8000-000000000105',
 '27-inch QHD professional monitor with accurate colour and USB-C.',
 'A colour-focused QHD display for design, photography and office work. The UltraSharp family is built around ergonomic stands and dependable connectivity.',
 7499000, null, 36, 'manufacturer', 'Dell Indonesia', 6800, 'active', false, true, 29)
on conflict (id) do nothing;

commit;


-- >>> 0004_seed_products_components.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0004: PC components
-- =====================================================================

begin;

insert into public.products (id, name, slug, sku, brand_id, category_id, short_description, description, price, discount_price, warranty_months, warranty_type, warranty_provider, weight_grams, status, is_featured, is_demo, sold_count) values
('10000000-0000-4000-8000-000000000013', 'Intel Core i5-14400F', 'intel-core-i5-14400f', 'CT-CPU-001', '02000000-0000-4000-8000-000000000009', '01000000-0000-4000-8000-000000000201',
 '10-core LGA1700 processor for balanced gaming and productivity builds.',
 'A mainstream 14th-generation Intel desktop processor. Ten cores handle games, streaming and everyday multitasking without integrated graphics, so a discrete GPU is required.',
 3199000, 2949000, 36, 'manufacturer', 'Intel Indonesia', 100, 'active', true, true, 150),
('10000000-0000-4000-8000-000000000014', 'Intel Core i7-14700K', 'intel-core-i7-14700k', 'CT-CPU-002', '02000000-0000-4000-8000-000000000009', '01000000-0000-4000-8000-000000000201',
 '20-core unlocked processor for heavy multitasking and creation.',
 'A high-performance LGA1700 processor for render, compile and streaming workloads. Requires a capable cooler and a motherboard with adequate power delivery.',
 6299000, null, 36, 'manufacturer', 'Intel Indonesia', 180, 'active', true, true, 64),
('10000000-0000-4000-8000-000000000015', 'AMD Ryzen 5 7600', 'amd-ryzen-5-7600', 'CT-CPU-003', '02000000-0000-4000-8000-00000000000a', '01000000-0000-4000-8000-000000000201',
 '6-core AM5 processor with integrated graphics.',
 'A six-core Ryzen processor on the AM5 platform. Integrated Radeon graphics make it useful for office builds and troubleshooting before a GPU is installed.',
 3099000, 2849000, 36, 'manufacturer', 'AMD Indonesia', 100, 'active', true, true, 132),
('10000000-0000-4000-8000-000000000016', 'AMD Ryzen 7 7800X3D', 'amd-ryzen-7-7800x3d', 'CT-CPU-004', '02000000-0000-4000-8000-00000000000a', '01000000-0000-4000-8000-000000000201',
 '8-core gaming processor with 3D V-Cache.',
 'A gaming-focused AM5 processor with stacked cache. A strong choice for high-refresh gaming, though heavy productivity workloads may prefer more cores.',
 6499000, 5999000, 36, 'manufacturer', 'AMD Indonesia', 120, 'active', true, true, 71),
('10000000-0000-4000-8000-000000000017', 'ASUS Prime B760M-K DDR4', 'asus-prime-b760m-k-ddr4', 'CT-MB-001', '02000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000202',
 'Micro-ATX LGA1700 board with DDR4 memory and dual M.2.',
 'A compact Intel B760 motherboard for budget-conscious builds. DDR4 support keeps memory costs down while dual M.2 slots cover fast storage.',
 1899000, null, 36, 'manufacturer', 'ASUS Indonesia', 800, 'active', false, true, 95),
('10000000-0000-4000-8000-000000000018', 'MSI PRO B650M-A WIFI', 'msi-pro-b650m-a-wifi', 'CT-MB-002', '02000000-0000-4000-8000-000000000006', '01000000-0000-4000-8000-000000000202',
 'AM5 micro-ATX board with DDR5, Wi-Fi 6E and four memory slots.',
 'A well-rounded AM5 motherboard for Ryzen 7000 and 8000 processors. Four DDR5 slots, dual M.2 and integrated wireless networking simplify the build.',
 2399000, 2199000, 36, 'manufacturer', 'MSI Indonesia', 900, 'active', true, true, 88),
('10000000-0000-4000-8000-000000000019', 'Gigabyte Z790 AORUS ELITE AX DDR5', 'gigabyte-z790-aorus-elite-ax-ddr5', 'CT-MB-003', '02000000-0000-4000-8000-000000000007', '01000000-0000-4000-8000-000000000202',
 'ATX LGA1700 board with DDR5, four M.2 slots and Wi-Fi 6E.',
 'An enthusiast Intel board with strong power delivery and expansion. Suited to unlocked K-series processors and multi-drive storage setups.',
 4199000, null, 36, 'manufacturer', 'Gigabyte Indonesia', 1200, 'active', false, true, 30),
('10000000-0000-4000-8000-000000000020', 'ASRock A620M-HDV/M.2+', 'asrock-a620m-hdv-m2-plus', 'CT-MB-004', '02000000-0000-4000-8000-000000000008', '01000000-0000-4000-8000-000000000202',
 'Entry AM5 micro-ATX board with DDR5 and one M.2 slot.',
 'A straightforward AM5 board for budget Ryzen builds. Two memory slots and a single M.2 slot keep the platform simple and affordable.',
 1499000, 1349000, 36, 'manufacturer', 'ASRock Indonesia', 700, 'active', false, true, 110),
('10000000-0000-4000-8000-000000000021', 'ASUS Dual GeForce RTX 4060 OC', 'asus-dual-geforce-rtx-4060-oc', 'CT-GPU-001', '02000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000203',
 'Dual-fan 1080p gaming GPU with DLSS 3 and 8 GB memory.',
 'A compact RTX 4060 for 1080p high-refresh gaming. The dual-fan cooler fits smaller cases and requires a single 8-pin power connector.',
 5699000, 5299000, 36, 'manufacturer', 'ASUS Indonesia', 900, 'active', true, true, 77),
('10000000-0000-4000-8000-000000000022', 'MSI GeForce RTX 4070 SUPER Ventus 3X', 'msi-geforce-rtx-4070-super-ventus-3x', 'CT-GPU-002', '02000000-0000-4000-8000-000000000006', '01000000-0000-4000-8000-000000000203',
 'Triple-fan RTX 4070 SUPER for high-refresh QHD gaming.',
 'A powerful QHD gaming and creator GPU. The triple-fan cooler is longer than compact models, so case clearance should be checked in the PC Builder.',
 12299000, 11699000, 36, 'manufacturer', 'MSI Indonesia', 1650, 'active', true, true, 38),
('10000000-0000-4000-8000-000000000023', 'Gigabyte Radeon RX 7600 Gaming OC', 'gigabyte-radeon-rx-7600-gaming-oc', 'CT-GPU-003', '02000000-0000-4000-8000-000000000007', '01000000-0000-4000-8000-000000000203',
 '1080p Radeon GPU with 8 GB memory and triple-fan cooling.',
 'A value-focused 1080p graphics card for modern titles. Radeon software and FSR support make it a competitive option at this price point.',
 4499000, 3999000, 36, 'manufacturer', 'Gigabyte Indonesia', 850, 'active', false, true, 66),
('10000000-0000-4000-8000-000000000024', 'ASUS TUF GeForce RTX 3060 V2', 'asus-tuf-geforce-rtx-3060-v2', 'CT-GPU-004', '02000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000203',
 'Durable 12 GB RTX 3060 for 1080p gaming and creative work.',
 'A proven 1080p GPU with a heavy-duty cooler. The 12 GB frame buffer is helpful for texture-heavy games and entry-level creative workloads.',
 4799000, null, 36, 'manufacturer', 'ASUS Indonesia', 1100, 'active', false, true, 51),
('10000000-0000-4000-8000-000000000025', 'Corsair Vengeance LPX 16GB DDR4-3200', 'corsair-vengeance-lpx-16gb-ddr4-3200', 'CT-RAM-001', '02000000-0000-4000-8000-00000000000c', '01000000-0000-4000-8000-000000000204',
 '16 GB (2Ã—8 GB) low-profile DDR4 memory kit.',
 'A dual-channel DDR4 kit for Intel B760 and older platforms. The low-profile heat spreaders fit under large air coolers.',
 749000, 699000, 60, 'manufacturer', 'Corsair Indonesia', 100, 'active', true, true, 200),
('10000000-0000-4000-8000-000000000026', 'Kingston Fury Beast 32GB DDR5-6000', 'kingston-fury-beast-32gb-ddr5-6000', 'CT-RAM-002', '02000000-0000-4000-8000-00000000000d', '01000000-0000-4000-8000-000000000204',
 '32 GB (2Ã—16 GB) DDR5-6000 memory kit for AM5 and LGA1700.',
 'A high-capacity DDR5 kit for gaming, editing and virtual machines. EXPO/XMP profiles simplify reaching rated speeds on supported boards.',
 1649000, 1499000, 60, 'manufacturer', 'Kingston Indonesia', 120, 'active', true, true, 160),
('10000000-0000-4000-8000-000000000027', 'TeamGroup Elite 8GB DDR4-3200', 'teamgroup-elite-8gb-ddr4-3200', 'CT-RAM-003', '02000000-0000-4000-8000-00000000001f', '01000000-0000-4000-8000-000000000204',
 'Single 8 GB DDR4 module for basic office systems.',
 'A single-module DDR4 upgrade for basic desktops. Pair with an identical module for dual-channel performance where supported.',
 249000, null, 60, 'manufacturer', 'TeamGroup', 60, 'active', false, true, 240),
('10000000-0000-4000-8000-000000000028', 'Samsung 16GB DDR5-5600', 'samsung-16gb-ddr5-5600', 'CT-RAM-004', '02000000-0000-4000-8000-00000000000e', '01000000-0000-4000-8000-000000000204',
 'Single 16 GB DDR5-5600 module for modern desktops.',
 'A single DDR5 module for compact or incremental builds. Add a matching module where the motherboard supports dual-channel operation.',
 749000, 699000, 60, 'manufacturer', 'Samsung Indonesia', 60, 'active', false, true, 90),
('10000000-0000-4000-8000-000000000029', 'Samsung 990 PRO 1TB NVMe Gen4', 'samsung-990-pro-1tb-nvme-gen4', 'CT-SSD-001', '02000000-0000-4000-8000-00000000000e', '01000000-0000-4000-8000-000000000205',
 'High-performance 1 TB PCIe 4.0 NVMe SSD.',
 'A fast Gen4 NVMe drive for operating systems, games and editing caches. Ideal as a primary drive in modern builds.',
 1799000, 1599000, 60, 'manufacturer', 'Samsung Indonesia', 80, 'active', true, true, 190),
('10000000-0000-4000-8000-000000000030', 'Kingston NV3 500GB NVMe Gen3', 'kingston-nv3-500gb-nvme-gen3', 'CT-SSD-002', '02000000-0000-4000-8000-00000000000d', '01000000-0000-4000-8000-000000000205',
 'Affordable 500 GB NVMe storage for everyday systems.',
 'A compact Gen3 NVMe drive for office and family PCs. Enough capacity for an operating system and core applications.',
 549000, 499000, 36, 'manufacturer', 'Kingston Indonesia', 30, 'active', false, true, 210),
('10000000-0000-4000-8000-000000000031', 'Samsung 870 EVO 1TB SATA SSD', 'samsung-870-evo-1tb-sata-ssd', 'CT-SSD-003', '02000000-0000-4000-8000-00000000000e', '01000000-0000-4000-8000-000000000205',
 'Reliable 1 TB SATA SSD for upgrades and secondary storage.',
 'A 2.5-inch SATA SSD for systems without free M.2 slots. Useful as a game or project drive alongside NVMe storage.',
 1199000, 1099000, 60, 'manufacturer', 'Samsung Indonesia', 90, 'active', false, true, 140),
('10000000-0000-4000-8000-000000000032', 'WD Black SN850X 2TB NVMe', 'wd-black-sn850x-2tb-nvme', 'CT-SSD-004', '02000000-0000-4000-8000-00000000000f', '01000000-0000-4000-8000-000000000205',
 '2 TB PCIe 4.0 NVMe drive for large game and media libraries.',
 'A high-capacity Gen4 drive for creators and gamers. The 2 TB capacity reduces the need for multiple drives in a new build.',
 2799000, 2499000, 60, 'manufacturer', 'Western Digital Indonesia', 80, 'active', true, true, 75),
('10000000-0000-4000-8000-000000000033', 'Seagate Barracuda 2TB HDD', 'seagate-barracuda-2tb-hdd', 'CT-HDD-001', '02000000-0000-4000-8000-000000000010', '01000000-0000-4000-8000-000000000206',
 '2 TB 7200 RPM hard drive for bulk storage.',
 'A conventional hard drive for archives, backups and large media libraries. Not recommended as a primary operating-system drive.',
 899000, 849000, 24, 'manufacturer', 'Seagate Indonesia', 450, 'active', false, true, 100),
('10000000-0000-4000-8000-000000000034', 'Seasonic Focus GX-550 550W Gold', 'seasonic-focus-gx-550-550w-gold', 'CT-PSU-001', '02000000-0000-4000-8000-00000000001e', '01000000-0000-4000-8000-000000000207',
 '550 W 80+ Gold fully modular power supply.',
 'A compact modular PSU for mainstream systems. Two 8-pin PCIe connectors support efficient mid-range graphics cards.',
 1299000, 1199000, 84, 'manufacturer', 'Seasonic Indonesia', 1900, 'active', false, true, 60),
('10000000-0000-4000-8000-000000000035', 'Corsair RM650e 650W Gold', 'corsair-rm650e-650w-gold', 'CT-PSU-002', '02000000-0000-4000-8000-00000000000c', '01000000-0000-4000-8000-000000000207',
 '650 W 80+ Gold modular PSU with modern GPU connectors.',
 'A quiet modular PSU for gaming and creator builds. Includes a 12V-2x6 connector alongside traditional 8-pin PCIe outputs.',
 1549000, null, 84, 'manufacturer', 'Corsair Indonesia', 2000, 'active', true, true, 48),
('10000000-0000-4000-8000-000000000036', 'Cooler Master MWE 750 V2 Gold', 'cooler-master-mwe-750-v2-gold', 'CT-PSU-003', '02000000-0000-4000-8000-00000000001d', '01000000-0000-4000-8000-000000000207',
 '750 W 80+ Gold PSU for high-end graphics cards.',
 'A higher-capacity PSU for RTX 4070-class systems. Multiple PCIe outputs and a 12V-2x6 connector cover current GPU requirements.',
 1799000, 1649000, 60, 'manufacturer', 'Cooler Master Indonesia', 2100, 'active', false, true, 37),
('10000000-0000-4000-8000-000000000037', 'DeepCool CH370 mATX Case', 'deepcool-ch370-matx-case', 'CT-CASE-001', '02000000-0000-4000-8000-00000000001c', '01000000-0000-4000-8000-000000000208',
 'Compact micro-ATX case with mesh airflow and 320 mm GPU clearance.',
 'A space-efficient case for micro-ATX builds. Supports tall air coolers, long graphics cards and multiple fan sizes.',
 749000, 699000, 12, 'manufacturer', 'DeepCool Indonesia', 5200, 'active', false, true, 70),
('10000000-0000-4000-8000-000000000038', 'Corsair 4000D Airflow ATX', 'corsair-4000d-airflow-atx', 'CT-CASE-002', '02000000-0000-4000-8000-00000000000c', '01000000-0000-4000-8000-000000000208',
 'Airflow-focused ATX mid-tower with 360 mm GPU clearance.',
 'A popular mid-tower with a high-airflow front panel and straightforward cable management. Supports ATX, micro-ATX and mini-ITX boards.',
 1299000, 1199000, 24, 'manufacturer', 'Corsair Indonesia', 7800, 'active', true, true, 82),
('10000000-0000-4000-8000-000000000039', 'Cooler Master MasterBox TD500 Mesh', 'cooler-master-masterbox-td500-mesh', 'CT-CASE-003', '02000000-0000-4000-8000-00000000001d', '01000000-0000-4000-8000-000000000208',
 'Mesh-front ATX tower with 410 mm GPU clearance.',
 'A spacious airflow case for large graphics cards and tall coolers. The mesh front supports high-airflow fan configurations.',
 1499000, null, 24, 'manufacturer', 'Cooler Master Indonesia', 8000, 'active', false, true, 45),
('10000000-0000-4000-8000-000000000040', 'DeepCool AK400 CPU Cooler', 'deepcool-ak400-cpu-cooler', 'CT-COOL-001', '02000000-0000-4000-8000-00000000001c', '01000000-0000-4000-8000-000000000209',
 '155 mm single-tower air cooler for mainstream CPUs.',
 'A quiet four-heatpipe air cooler for Intel and AMD sockets. Check case clearance before installing in compact chassis.',
 449000, 399000, 12, 'manufacturer', 'DeepCool Indonesia', 900, 'active', false, true, 130),
('10000000-0000-4000-8000-000000000041', 'Cooler Master ML240L Core AIO', 'cooler-master-ml240l-core-aio', 'CT-COOL-002', '02000000-0000-4000-8000-00000000001d', '01000000-0000-4000-8000-000000000209',
 '240 mm liquid cooler for higher-TDP processors.',
 'A closed-loop 240 mm AIO for gaming and creator builds. Supports current Intel and AMD desktop sockets with included mounting hardware.',
 899000, 799000, 24, 'manufacturer', 'Cooler Master Indonesia', 1800, 'active', false, true, 55),
('10000000-0000-4000-8000-000000000042', 'DeepCool FC120 3-in-1 Case Fans', 'deepcool-fc120-3-in-1-case-fans', 'CT-FAN-001', '02000000-0000-4000-8000-00000000001c', '01000000-0000-4000-8000-00000000020a',
 'Three 120 mm PWM case fans with daisy-chain cables.',
 'A three-pack of 120 mm PWM fans for airflow-focused builds. Daisy-chained connectors reduce cable clutter.',
 399000, 349000, 12, 'manufacturer', 'DeepCool Indonesia', 500, 'active', false, true, 90),
('10000000-0000-4000-8000-000000000043', 'Arctic P14 PWM 140mm Fan', 'arctic-p14-pwm-140mm-fan', 'CT-FAN-002', '02000000-0000-4000-8000-000000000023', '01000000-0000-4000-8000-00000000020a',
 'Pressure-optimised 140 mm PWM fan.',
 'A quiet 140 mm fan for cases and radiators. Pressure-optimised blades work well on restrictive front panels.',
 199000, null, 24, 'manufacturer', 'Arctic', 300, 'active', false, true, 120)
on conflict (id) do nothing;

commit;


-- >>> 0005_seed_products_networking.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0005: networking equipment, tools and materials
-- =====================================================================

begin;

insert into public.products (id, name, slug, sku, brand_id, category_id, short_description, description, price, discount_price, warranty_months, warranty_type, warranty_provider, weight_grams, status, is_featured, is_demo, sold_count) values
('10000000-0000-4000-8000-000000000044', 'TP-Link Archer AX55', 'tp-link-archer-ax55', 'CT-NET-001', '02000000-0000-4000-8000-000000000011', '01000000-0000-4000-8000-000000000301',
 'AX3000 Wi-Fi 6 router with OneMesh and easy app setup.',
 'A dual-band Wi-Fi 6 router for homes and small offices. OFDMA and MU-MIMO improve efficiency when many devices are connected.',
 1299000, 1149000, 36, 'manufacturer', 'TP-Link Indonesia', 600, 'active', true, true, 145),
('10000000-0000-4000-8000-000000000045', 'MikroTik hAP ax2', 'mikrotik-hap-ax2', 'CT-NET-002', '02000000-0000-4000-8000-000000000012', '01000000-0000-4000-8000-000000000301',
 'RouterOS Wi-Fi 6 router for labs and small businesses.',
 'A compact RouterOS device with Wi-Fi 6 and gigabit ports. Offers deep configuration for network engineers and lab environments.',
 1449000, null, 12, 'distributor', 'MikroTik Distributor', 500, 'active', true, true, 85),
('10000000-0000-4000-8000-000000000046', 'ASUS RT-AX58U', 'asus-rt-ax58u', 'CT-NET-003', '02000000-0000-4000-8000-000000000001', '01000000-0000-4000-8000-000000000301',
 'AX3000 dual-band router with AiMesh support.',
 'A Wi-Fi 6 router for households that need broad coverage and mesh expansion. AiProtection features are available through the ASUS interface.',
 1699000, 1549000, 36, 'manufacturer', 'ASUS Indonesia', 700, 'active', false, true, 60),
('10000000-0000-4000-8000-000000000047', 'TP-Link TL-SG108 8-Port Gigabit Switch', 'tp-link-tl-sg108-8-port-gigabit-switch', 'CT-NET-004', '02000000-0000-4000-8000-000000000011', '01000000-0000-4000-8000-000000000302',
 'Plug-and-play 8-port gigabit unmanaged switch.',
 'A fanless metal switch for desks and small racks. Eight gigabit ports provide a simple way to expand a wired network.',
 349000, 299000, 36, 'manufacturer', 'TP-Link Indonesia', 500, 'active', true, true, 180),
('10000000-0000-4000-8000-000000000048', 'MikroTik CRS326-24G-2S+RM', 'mikrotik-crs326-24g-2s-plus-rm', 'CT-NET-005', '02000000-0000-4000-8000-000000000012', '01000000-0000-4000-8000-000000000302',
 '24-port gigabit switch with two 10G SFP+ ports.',
 'A rack-mount managed switch running RouterOS or SwitchOS. Suitable for labs, small ISPs and businesses needing 10G uplinks.',
 2999000, null, 12, 'distributor', 'MikroTik Distributor', 1800, 'active', false, true, 24),
('10000000-0000-4000-8000-000000000049', 'TP-Link TL-SG1218MP 16-Port PoE Switch', 'tp-link-tl-sg1218mp-16-port-poe-switch', 'CT-NET-006', '02000000-0000-4000-8000-000000000011', '01000000-0000-4000-8000-000000000302',
 '16-port PoE+ switch for access points and cameras.',
 'A rack-mount PoE switch with 16 gigabit ports and two SFP uplinks. PoE budgets must be checked against connected access points.',
 2499000, 2299000, 36, 'manufacturer', 'TP-Link Indonesia', 2600, 'active', false, true, 33),
('10000000-0000-4000-8000-000000000050', 'Ubiquiti UniFi U6+', 'ubiquiti-unifi-u6-plus', 'CT-NET-007', '02000000-0000-4000-8000-000000000013', '01000000-0000-4000-8000-000000000303',
 'Wi-Fi 6 ceiling access point managed by UniFi.',
 'A dual-band Wi-Fi 6 access point for UniFi deployments. Requires a PoE switch or injector and a UniFi controller for management.',
 1899000, 1749000, 12, 'distributor', 'Ubiquiti Distributor', 500, 'active', true, true, 95),
('10000000-0000-4000-8000-000000000051', 'TP-Link EAP610 AX1800', 'tp-link-eap610-ax1800', 'CT-NET-008', '02000000-0000-4000-8000-000000000011', '01000000-0000-4000-8000-000000000303',
 'Ceiling-mount AX1800 access point with PoE.',
 'A Wi-Fi 6 access point for small business coverage. Omada controller integration provides centralised configuration and roaming.',
 1399000, null, 36, 'manufacturer', 'TP-Link Indonesia', 400, 'active', false, true, 72),
('10000000-0000-4000-8000-000000000052', 'ZTE F609 V5 GPON ONT', 'zte-f609-v5-gpon-ont', 'CT-NET-009', '02000000-0000-4000-8000-000000000015', '01000000-0000-4000-8000-000000000305',
 'GPON optical network terminal with gigabit Ethernet and Wi-Fi.',
 'An ONT for fibre-to-the-home installations. Configuration depends on the ISP and may be locked to provider profiles.',
 349000, 299000, 12, 'distributor', 'ZTE Distributor', 300, 'active', false, true, 160),
('10000000-0000-4000-8000-000000000053', 'Huawei HG8245H5 GPON ONT', 'huawei-hg8245h5-gpon-ont', 'CT-NET-010', '02000000-0000-4000-8000-000000000016', '01000000-0000-4000-8000-000000000305',
 'GPON terminal with four LAN ports and dual-band Wi-Fi.',
 'A fibre terminal for ISP deployments requiring multiple wired clients. ISP compatibility must be confirmed before purchase.',
 499000, null, 12, 'distributor', 'Huawei Distributor', 350, 'active', false, true, 90),
('10000000-0000-4000-8000-000000000054', 'TP-Link UE330 USB 3.0 Gigabit Adapter', 'tp-link-ue330-usb-3-gigabit-adapter', 'CT-NET-011', '02000000-0000-4000-8000-000000000011', '01000000-0000-4000-8000-000000000306',
 'USB 3.0 to gigabit Ethernet adapter with a three-port hub.',
 'Adds a wired network port to laptops without Ethernet. The integrated USB hub is useful for connecting accessories.',
 249000, 199000, 24, 'manufacturer', 'TP-Link Indonesia', 60, 'active', false, true, 130),
('10000000-0000-4000-8000-000000000055', 'TP-Link Archer T3U Plus', 'tp-link-archer-t3u-plus', 'CT-NET-012', '02000000-0000-4000-8000-000000000011', '01000000-0000-4000-8000-000000000307',
 'High-gain AC1300 USB Wi-Fi adapter.',
 'A compact USB Wi-Fi adapter for desktops and laptops. The external antenna improves reception in weaker signal areas.',
 229000, 189000, 24, 'manufacturer', 'TP-Link Indonesia', 50, 'active', false, true, 110),
('10000000-0000-4000-8000-000000000056', 'MikroTik RB5009UG+S+IN', 'mikrotik-rb5009ug-s-in', 'CT-NET-013', '02000000-0000-4000-8000-000000000012', '01000000-0000-4000-8000-000000000308',
 'RouterOS firewall appliance with 10G SFP+ and PoE out.',
 'A compact RouterOS appliance for routing, firewalling and lab work. Multiple gigabit ports, 10G SFP+ and a PoE output port.',
 4999000, null, 12, 'distributor', 'MikroTik Distributor', 1200, 'active', true, true, 19),
('10000000-0000-4000-8000-000000000057', 'RJ45 Crimping Tool Pro', 'rj45-crimping-tool-pro', 'CT-TOOL-001', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000401',
 'Ratchet crimping tool for RJ45 and RJ11 connectors.',
 'A field-ready ratchet crimper with interchangeable dies. Suitable for Cat5e and Cat6 modular plugs.',
 129000, 99000, 6, 'store', 'COMPUTECH', 450, 'active', true, true, 300),
('10000000-0000-4000-8000-000000000058', 'Network LAN Tester', 'network-lan-tester', 'CT-TOOL-002', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000402',
 'Handheld tester for patch cords and installed cable runs.',
 'A two-piece cable tester for continuity, short and miswiring checks. The remote terminator allows testing installed runs solo.',
 149000, null, 6, 'store', 'COMPUTECH', 200, 'active', false, true, 220),
('10000000-0000-4000-8000-000000000059', 'Punch Down Tool 110', 'punch-down-tool-110', 'CT-TOOL-003', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000403',
 '110-style punch down tool with adjustable impact.',
 'For terminating keystone jacks and patch panels. The adjustable impact setting helps avoid damaged conductors.',
 119000, 99000, 6, 'store', 'COMPUTECH', 180, 'active', false, true, 140),
('10000000-0000-4000-8000-000000000060', 'Cat6 UTP Cable 305m', 'cat6-utp-cable-305m', 'CT-TOOL-004', '02000000-0000-4000-8000-000000000024', '01000000-0000-4000-8000-000000000405',
 '305-metre Cat6 UTP cable reel for structured cabling.',
 'Solid-copper Cat6 cable for permanent horizontal runs. Supplied on a 305 m reel for installation projects.',
 1299000, 1199000, 12, 'manufacturer', 'Belden Indonesia', 11500, 'active', true, true, 58),
('10000000-0000-4000-8000-000000000061', 'SC-LC Fiber Patch Cord 3m', 'sc-lc-fiber-patch-cord-3m', 'CT-TOOL-005', '02000000-0000-4000-8000-000000000025', '01000000-0000-4000-8000-00000000040c',
 'Single-mode SC-LC duplex fibre patch cord, 3 metres.',
 'A factory-terminated fibre patch lead for rack and ONT connections. Verify connector polish and mode before ordering.',
 89000, null, 3, 'distributor', 'FiberHome Distributor', 40, 'active', false, true, 100),
('10000000-0000-4000-8000-000000000062', 'RJ45 Cat6 Connector 100pcs', 'rj45-cat6-connector-100pcs', 'CT-TOOL-006', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000407',
 'Box of 100 Cat6 RJ45 plugs with strain relief boots.',
 'Three-prong contacts for solid and stranded Cat6 cable. Include boots for tidy terminations.',
 99000, 79000, 3, 'store', 'COMPUTECH', 320, 'active', false, true, 260),
('10000000-0000-4000-8000-000000000063', 'Cat6 Keystone Jack', 'cat6-keystone-jack', 'CT-TOOL-007', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000408',
 'Toolless Cat6 keystone module for wall outlets.',
 'A single Cat6 keystone jack with colour-coded termination. Snaps into standard faceplates and patch panels.',
 45000, null, 3, 'store', 'COMPUTECH', 25, 'active', false, true, 320),
('10000000-0000-4000-8000-000000000064', 'Faceplate 2-Port', 'faceplate-2-port', 'CT-TOOL-008', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-000000000409',
 'Two-port wall faceplate for keystone modules.',
 'A clean wall outlet plate for two keystone jacks. Mounting screws included.',
 29000, null, 3, 'store', 'COMPUTECH', 40, 'active', false, true, 210),
('10000000-0000-4000-8000-000000000065', '24-Port Patch Panel Cat6', '24-port-patch-panel-cat6', 'CT-TOOL-009', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-00000000040a',
 '1U 24-port Cat6 patch panel for network racks.',
 'A rack-mount termination panel for structured cabling. Rear cable management bars are recommended for larger installations.',
 649000, 599000, 12, 'store', 'COMPUTECH', 1200, 'active', false, true, 55),
('10000000-0000-4000-8000-000000000066', '12U Wall Mount Network Rack', '12u-wall-mount-network-rack', 'CT-TOOL-010', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-00000000040d',
 '12U wall-mount rack with glass door and fan vent.',
 'A compact rack for switches, patch panels and small servers. Wall-mount hardware is included; professional installation is recommended.',
 1299000, null, 12, 'store', 'COMPUTECH', 8500, 'active', false, true, 28),
('10000000-0000-4000-8000-000000000067', 'Cable Management Kit', 'cable-management-kit', 'CT-TOOL-011', '02000000-0000-4000-8000-000000000020', '01000000-0000-4000-8000-00000000040e',
 'Velcro straps, cable ties and labels for rack or desk organisation.',
 'A practical mix of reusable straps, ties and labels. Helps keep rack cabling serviceable and identifiable.',
 89000, null, 3, 'store', 'COMPUTECH', 250, 'active', false, true, 150),
('10000000-0000-4000-8000-000000000068', 'Fiber Optic Cable 2 Core 100m', 'fiber-optic-cable-2-core-100m', 'CT-TOOL-012', '02000000-0000-4000-8000-000000000025', '01000000-0000-4000-8000-000000000406',
 '100-metre two-core single-mode fibre cable for outdoor runs.',
 'A rugged fibre cable for extending an optical link. Terminations and splicing are not included.',
 649000, 599000, 6, 'distributor', 'FiberHome Distributor', 3200, 'active', false, true, 40)
on conflict (id) do nothing;

commit;


-- >>> 0006_seed_products_accessories.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0006: accessories and peripherals
-- =====================================================================

begin;

insert into public.products (id, name, slug, sku, brand_id, category_id, short_description, description, price, discount_price, warranty_months, warranty_type, warranty_provider, weight_grams, status, is_featured, is_demo, sold_count) values
('10000000-0000-4000-8000-000000000069', 'Keychron K2 Pro Wireless Keyboard', 'keychron-k2-pro-wireless-keyboard', 'CT-ACC-001', '02000000-0000-4000-8000-000000000026', '01000000-0000-4000-8000-000000000501',
 '75% hot-swappable mechanical keyboard with Bluetooth and USB-C.',
 'A compact wireless mechanical keyboard for programming and writing. Hot-swap sockets allow switch changes without soldering.',
 1499000, 1349000, 12, 'manufacturer', 'Keychron', 900, 'active', true, true, 90),
('10000000-0000-4000-8000-000000000070', 'Logitech G Pro X Superlight 2', 'logitech-g-pro-x-superlight-2', 'CT-ACC-002', '02000000-0000-4000-8000-000000000017', '01000000-0000-4000-8000-000000000502',
 'Ultra-light wireless gaming mouse with HERO 2 sensor.',
 'A competitive wireless mouse with a low weight and high-precision sensor. Designed for long sessions and fast movement.',
 1699000, 1599000, 24, 'manufacturer', 'Logitech Indonesia', 60, 'active', true, true, 110),
('10000000-0000-4000-8000-000000000071', 'Razer BlackShark V2 X', 'razer-blackshark-v2-x', 'CT-ACC-003', '02000000-0000-4000-8000-000000000018', '01000000-0000-4000-8000-000000000503',
 'Lightweight wired gaming headset with a cardioid microphone.',
 'A comfortable wired headset for gaming and calls. The closed-back design helps block room noise during long sessions.',
 899000, 799000, 24, 'manufacturer', 'Razer Indonesia', 240, 'active', false, true, 130),
('10000000-0000-4000-8000-000000000072', 'Logitech C920 HD Pro Webcam', 'logitech-c920-hd-pro-webcam', 'CT-ACC-004', '02000000-0000-4000-8000-000000000017', '01000000-0000-4000-8000-000000000504',
 '1080p webcam with stereo microphones and auto light correction.',
 'A dependable webcam for meetings, classes and streaming. The clip mounts on monitors and laptops without tools.',
 999000, 899000, 24, 'manufacturer', 'Logitech Indonesia', 170, 'active', false, true, 85),
('10000000-0000-4000-8000-000000000073', 'Anker 555 USB-C Hub 8-in-1', 'anker-555-usb-c-hub-8-in-1', 'CT-ACC-005', '02000000-0000-4000-8000-000000000019', '01000000-0000-4000-8000-000000000505',
 'USB-C hub with HDMI, Ethernet, SD card and USB ports.',
 'A travel-friendly hub for laptop docks. Adds display output, wired networking and card readers through one USB-C connection.',
 799000, 699000, 18, 'manufacturer', 'Anker Indonesia', 120, 'active', false, true, 100),
('10000000-0000-4000-8000-000000000074', 'Ugreen HDMI 2.1 Cable 2m', 'ugreen-hdmi-2-1-cable-2m', 'CT-ACC-006', '02000000-0000-4000-8000-00000000001a', '01000000-0000-4000-8000-000000000506',
 'Certified 8K HDMI 2.1 cable with braided jacket.',
 'A durable HDMI 2.1 cable for high-refresh monitors and TVs. Supports 8K60 and 4K120 signal formats when both devices support them.',
 179000, 149000, 12, 'manufacturer', 'Ugreen Indonesia', 100, 'active', false, true, 200),
('10000000-0000-4000-8000-000000000075', 'Baseus Laptop Stand', 'baseus-laptop-stand', 'CT-ACC-007', '02000000-0000-4000-8000-00000000001b', '01000000-0000-4000-8000-000000000508',
 'Adjustable aluminium laptop stand for better ergonomics.',
 'An aluminium stand with adjustable height and angle. Improves airflow under the laptop and raises the screen to a comfortable level.',
 299000, 249000, 12, 'manufacturer', 'Baseus Indonesia', 700, 'active', false, true, 120),
('10000000-0000-4000-8000-000000000076', 'DeepCool N8 Cooling Pad', 'deepcool-n8-cooling-pad', 'CT-ACC-008', '02000000-0000-4000-8000-00000000001c', '01000000-0000-4000-8000-000000000509',
 'Cooling pad with three adjustable fans for 15â€“17-inch laptops.',
 'A USB-powered cooling pad for warmer laptops. Fan speed and tilt are adjustable for different desk setups.',
 349000, null, 12, 'manufacturer', 'DeepCool Indonesia', 900, 'active', false, true, 60),
('10000000-0000-4000-8000-000000000077', 'Ugreen USB-C to DisplayPort Adapter', 'ugreen-usb-c-to-displayport-adapter', 'CT-ACC-009', '02000000-0000-4000-8000-00000000001a', '01000000-0000-4000-8000-000000000507',
 'USB-C to DisplayPort 1.4 adapter for 4K displays.',
 'Connects a USB-C laptop to a DisplayPort monitor. Display output depends on the laptop port supporting DisplayPort Alt Mode.',
 199000, 169000, 12, 'manufacturer', 'Ugreen Indonesia', 50, 'active', false, true, 140),
('10000000-0000-4000-8000-000000000078', 'TP-Link Archer TX50E WiFi 6 PCIe', 'tp-link-archer-tx50e-wifi-6-pcie', 'CT-ACC-010', '02000000-0000-4000-8000-000000000011', '01000000-0000-4000-8000-000000000507',
 'PCIe Wi-Fi 6 adapter with Bluetooth 5.0.',
 'Adds Wi-Fi 6 and Bluetooth to a desktop system. Requires a free PCIe x1 slot and an available USB header for Bluetooth.',
 549000, 499000, 24, 'manufacturer', 'TP-Link Indonesia', 150, 'active', false, true, 50)
on conflict (id) do nothing;

commit;


-- >>> 0007_seed_images_inventory.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0007: product images and inventory
-- =====================================================================

begin;

insert into public.product_images (product_id, url, alt, sort_order, is_primary)
select
  p.id,
  coalesce(
    img.url,
    case c.slug
      when 'laptop' then 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80'
      when 'desktop-pc' then 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1400&q=80'
      when 'mini-pc' then 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1400&q=80'
      when 'all-in-one-pc' then 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80'
      when 'monitor' then 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1400&q=80'
      when 'processor' then 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=1400&q=80'
      when 'motherboard' then 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'
      when 'graphics-card' then 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1400&q=80'
      when 'ram' then 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=1400&q=80'
      when 'ssd' then 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1400&q=80'
      when 'hdd' then 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=1400&q=80'
      when 'power-supply' then 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1400&q=80'
      when 'pc-case' then 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1400&q=80'
      when 'cpu-cooler' then 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'
      when 'case-fan' then 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'
      when 'router' then 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80'
      when 'switch' then 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80'
      when 'access-point' then 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80'
      when 'modem' then 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80'
      when 'ont-onu' then 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80'
      when 'network-adapter' then 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1400&q=80'
      when 'wireless-adapter' then 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80'
      when 'firewall-appliance' then 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80'
      when 'network-rack' then 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80'
      when 'patch-panel' then 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80'
      when 'keyboard' then 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80'
      when 'mouse' then 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1400&q=80'
      when 'headset' then 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80'
      when 'webcam' then 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=1400&q=80'
      when 'usb-hub' then 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1400&q=80'
      when 'laptop-stand' then 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1400&q=80'
      when 'cooling-pad' then 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1400&q=80'
      else 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80'
    end
  ),
  p.name || ' â€” demo product image',
  0,
  true
from public.products p
join public.categories c on c.id = p.category_id
left join (values
  ('CT-LAP-002', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80'),
  ('CT-LAP-004', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1400&q=80'),
  ('CT-LAP-005', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80'),
  ('CT-PC-002', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1400&q=80'),
  ('CT-PC-003', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1400&q=80'),
  ('CT-GPU-001', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1400&q=80'),
  ('CT-GPU-002', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1400&q=80'),
  ('CT-RAM-001', 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=1400&q=80'),
  ('CT-SSD-001', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1400&q=80'),
  ('CT-NET-001', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80'),
  ('CT-NET-005', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80'),
  ('CT-TOOL-001', 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1400&q=80'),
  ('CT-TOOL-004', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80'),
  ('CT-ACC-001', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80'),
  ('CT-ACC-002', 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1400&q=80'),
  ('CT-ACC-003', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80'),
  ('CT-ACC-004', 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=1400&q=80')
) as img(sku, url) on img.sku = p.sku
where p.is_demo
  and not exists (select 1 from public.product_images pi where pi.product_id = p.id);

insert into public.product_inventory (product_id, stock, reserved, low_stock_threshold)
select
  p.id,
  case p.sku
    when 'CT-LAP-001' then 12
    when 'CT-LAP-002' then 4
    when 'CT-LAP-003' then 20
    when 'CT-LAP-004' then 3
    when 'CT-LAP-005' then 9
    when 'CT-PC-001' then 8
    when 'CT-PC-002' then 5
    when 'CT-PC-003' then 3
    when 'CT-MINI-001' then 14
    when 'CT-AIO-001' then 6
    when 'CT-MON-001' then 11
    when 'CT-MON-002' then 7
    when 'CT-CPU-001' then 18
    when 'CT-CPU-002' then 12
    when 'CT-CPU-003' then 15
    when 'CT-CPU-004' then 8
    when 'CT-MB-001' then 20
    when 'CT-MB-002' then 15
    when 'CT-MB-003' then 10
    when 'CT-MB-004' then 25
    when 'CT-GPU-001' then 10
    when 'CT-GPU-002' then 2
    when 'CT-GPU-003' then 8
    when 'CT-GPU-004' then 0
    when 'CT-RAM-001' then 30
    when 'CT-RAM-002' then 22
    when 'CT-RAM-003' then 40
    when 'CT-RAM-004' then 25
    when 'CT-SSD-001' then 35
    when 'CT-SSD-002' then 40
    when 'CT-SSD-003' then 20
    when 'CT-SSD-004' then 18
    when 'CT-HDD-001' then 30
    when 'CT-PSU-001' then 20
    when 'CT-PSU-002' then 16
    when 'CT-PSU-003' then 12
    when 'CT-CASE-001' then 14
    when 'CT-CASE-002' then 18
    when 'CT-CASE-003' then 10
    when 'CT-COOL-001' then 25
    when 'CT-COOL-002' then 12
    when 'CT-FAN-001' then 30
    when 'CT-FAN-002' then 28
    when 'CT-NET-001' then 24
    when 'CT-NET-002' then 16
    when 'CT-NET-003' then 12
    when 'CT-NET-004' then 35
    when 'CT-NET-005' then 6
    when 'CT-NET-006' then 8
    when 'CT-NET-007' then 15
    when 'CT-NET-008' then 18
    when 'CT-NET-009' then 30
    when 'CT-NET-010' then 22
    when 'CT-NET-011' then 40
    when 'CT-NET-012' then 38
    when 'CT-NET-013' then 5
    when 'CT-TOOL-001' then 60
    when 'CT-TOOL-002' then 45
    when 'CT-TOOL-003' then 50
    when 'CT-TOOL-004' then 10
    when 'CT-TOOL-005' then 70
    when 'CT-TOOL-006' then 80
    when 'CT-TOOL-007' then 90
    when 'CT-TOOL-008' then 75
    when 'CT-TOOL-009' then 12
    when 'CT-TOOL-010' then 6
    when 'CT-TOOL-011' then 55
    when 'CT-TOOL-012' then 9
    when 'CT-ACC-001' then 20
    when 'CT-ACC-002' then 24
    when 'CT-ACC-003' then 30
    when 'CT-ACC-004' then 18
    when 'CT-ACC-005' then 26
    when 'CT-ACC-006' then 60
    when 'CT-ACC-007' then 35
    when 'CT-ACC-008' then 22
    when 'CT-ACC-009' then 45
    when 'CT-ACC-010' then 14
    else 12
  end,
  0,
  5
from public.products p
where p.is_demo
  and not exists (select 1 from public.product_inventory i where i.product_id = p.id);

commit;


-- >>> 0008_seed_specifications.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0008: product specifications
-- =====================================================================

begin;

-- Generic specifications present on every demo product.
insert into public.product_specifications (product_id, group_name, name, value, sort_order)
select p.id, 'General', 'Brand', coalesce(b.name, 'COMPUTECH'), 1
from public.products p
left join public.brands b on b.id = p.brand_id
where p.is_demo
  and not exists (
    select 1 from public.product_specifications s
    where s.product_id = p.id and s.name = 'Brand'
  );

insert into public.product_specifications (product_id, group_name, name, value, sort_order)
select p.id, 'General', 'SKU', p.sku, 2
from public.products p
where p.is_demo
  and not exists (
    select 1 from public.product_specifications s
    where s.product_id = p.id and s.name = 'SKU'
  );

insert into public.product_specifications (product_id, group_name, name, value, sort_order)
select p.id, 'General', 'Warranty', p.warranty_months || ' months (' || p.warranty_type || ')', 3
from public.products p
where p.is_demo
  and not exists (
    select 1 from public.product_specifications s
    where s.product_id = p.id and s.name = 'Warranty'
  );

insert into public.product_specifications (product_id, group_name, name, value, sort_order)
select p.id, 'Details', v.name, v.value, v.sort_order
from (values
  ('CT-LAP-001', 'Processor', 'Intel Core i5-13450HX', 10),
  ('CT-LAP-001', 'Graphics', 'NVIDIA GeForce RTX 4060 8GB', 11),
  ('CT-LAP-001', 'Memory', '16GB DDR5-4800', 12),
  ('CT-LAP-001', 'Storage', '512GB NVMe SSD', 13),
  ('CT-LAP-001', 'Display', '15.6" FHD 144Hz', 14),
  ('CT-LAP-001', 'Operating system', 'Windows 11 Home', 15),
  ('CT-LAP-002', 'Processor', 'AMD Ryzen 9 8945HS', 10),
  ('CT-LAP-002', 'Graphics', 'NVIDIA GeForce RTX 4070 8GB', 11),
  ('CT-LAP-002', 'Memory', '32GB LPDDR5X', 12),
  ('CT-LAP-002', 'Storage', '1TB NVMe SSD', 13),
  ('CT-LAP-002', 'Display', '14" 3K OLED 120Hz', 14),
  ('CT-LAP-003', 'Processor', 'AMD Ryzen 5 7530U', 10),
  ('CT-LAP-003', 'Graphics', 'AMD Radeon integrated', 11),
  ('CT-LAP-003', 'Memory', '16GB DDR4', 12),
  ('CT-LAP-003', 'Storage', '512GB NVMe SSD', 13),
  ('CT-LAP-003', 'Display', '15.6" FHD IPS', 14),
  ('CT-LAP-004', 'Processor', 'Intel Core Ultra 7 155H', 10),
  ('CT-LAP-004', 'Graphics', 'Intel Arc integrated', 11),
  ('CT-LAP-004', 'Memory', '16GB LPDDR5X', 12),
  ('CT-LAP-004', 'Storage', '512GB NVMe SSD', 13),
  ('CT-LAP-004', 'Display', '13.4" FHD+', 14),
  ('CT-LAP-005', 'Chip', 'Apple M3', 10),
  ('CT-LAP-005', 'Graphics', '8-core integrated GPU', 11),
  ('CT-LAP-005', 'Memory', '8GB unified memory', 12),
  ('CT-LAP-005', 'Storage', '256GB SSD', 13),
  ('CT-LAP-005', 'Display', '13.6" Liquid Retina', 14),
  ('CT-PC-001', 'Processor', 'AMD Ryzen 5 5600G', 10),
  ('CT-PC-001', 'Graphics', 'AMD Radeon Vega 7 integrated', 11),
  ('CT-PC-001', 'Memory', '16GB DDR4-3200', 12),
  ('CT-PC-001', 'Storage', '512GB NVMe SSD', 13),
  ('CT-PC-001', 'Operating system', 'Windows 11 Pro', 14),
  ('CT-PC-002', 'Processor', 'AMD Ryzen 7 7700', 10),
  ('CT-PC-002', 'Graphics', 'NVIDIA GeForce RTX 4060 8GB', 11),
  ('CT-PC-002', 'Memory', '32GB DDR5-6000', 12),
  ('CT-PC-002', 'Storage', '1TB NVMe SSD', 13),
  ('CT-PC-002', 'Cooling', '240mm liquid cooler', 14),
  ('CT-PC-003', 'Processor', 'Intel Core i5-14400F', 10),
  ('CT-PC-003', 'Graphics', 'NVIDIA GeForce RTX 4070 SUPER 12GB', 11),
  ('CT-PC-003', 'Memory', '32GB DDR5-6000', 12),
  ('CT-PC-003', 'Storage', '1TB NVMe SSD', 13),
  ('CT-PC-003', 'Cooling', 'Air tower cooler', 14),
  ('CT-MINI-001', 'Processor', 'AMD Ryzen 5 5560U', 10),
  ('CT-MINI-001', 'Memory', '16GB DDR4', 11),
  ('CT-MINI-001', 'Storage', '512GB NVMe SSD', 12),
  ('CT-MINI-001', 'Ports', '2Ã— HDMI, 4Ã— USB, RJ45', 13),
  ('CT-AIO-001', 'Processor', 'AMD Ryzen 5 7520U', 10),
  ('CT-AIO-001', 'Memory', '16GB LPDDR5', 11),
  ('CT-AIO-001', 'Storage', '512GB NVMe SSD', 12),
  ('CT-AIO-001', 'Display', '23.8" FHD IPS', 13),
  ('CT-MON-001', 'Panel', '27" QHD IPS', 10),
  ('CT-MON-001', 'Resolution', '2560 Ã— 1440', 11),
  ('CT-MON-001', 'Refresh rate', '180Hz', 12),
  ('CT-MON-001', 'Ports', '2Ã— HDMI, 1Ã— DisplayPort', 13),
  ('CT-MON-002', 'Panel', '27" QHD IPS Black', 10),
  ('CT-MON-002', 'Resolution', '2560 Ã— 1440', 11),
  ('CT-MON-002', 'Colour coverage', '98% DCI-P3', 12),
  ('CT-MON-002', 'USB-C', '90W power delivery', 13),
  ('CT-CPU-001', 'Socket', 'LGA1700', 10),
  ('CT-CPU-001', 'Cores / threads', '10 / 16', 11),
  ('CT-CPU-001', 'Base power', '65W', 12),
  ('CT-CPU-001', 'Integrated graphics', 'No', 13),
  ('CT-CPU-002', 'Socket', 'LGA1700', 10),
  ('CT-CPU-002', 'Cores / threads', '20 / 28', 11),
  ('CT-CPU-002', 'Base power', '125W', 12),
  ('CT-CPU-002', 'Integrated graphics', 'Yes', 13),
  ('CT-CPU-003', 'Socket', 'AM5', 10),
  ('CT-CPU-003', 'Cores / threads', '6 / 12', 11),
  ('CT-CPU-003', 'Base power', '65W', 12),
  ('CT-CPU-003', 'Integrated graphics', 'Yes', 13),
  ('CT-CPU-004', 'Socket', 'AM5', 10),
  ('CT-CPU-004', 'Cores / threads', '8 / 16', 11),
  ('CT-CPU-004', 'Base power', '120W', 12),
  ('CT-CPU-004', 'Integrated graphics', 'Yes', 13),
  ('CT-MB-001', 'Socket', 'LGA1700', 10),
  ('CT-MB-001', 'Chipset', 'Intel B760', 11),
  ('CT-MB-001', 'Memory', 'DDR4, 2 slots, up to 64GB', 12),
  ('CT-MB-001', 'Form factor', 'Micro-ATX', 13),
  ('CT-MB-001', 'Storage', '2Ã— M.2, 4Ã— SATA', 14),
  ('CT-MB-002', 'Socket', 'AM5', 10),
  ('CT-MB-002', 'Chipset', 'AMD B650', 11),
  ('CT-MB-002', 'Memory', 'DDR5, 4 slots, up to 128GB', 12),
  ('CT-MB-002', 'Form factor', 'Micro-ATX', 13),
  ('CT-MB-002', 'Storage', '2Ã— M.2, 4Ã— SATA', 14),
  ('CT-MB-003', 'Socket', 'LGA1700', 10),
  ('CT-MB-003', 'Chipset', 'Intel Z790', 11),
  ('CT-MB-003', 'Memory', 'DDR5, 4 slots, up to 192GB', 12),
  ('CT-MB-003', 'Form factor', 'ATX', 13),
  ('CT-MB-003', 'Storage', '4Ã— M.2, 6Ã— SATA', 14),
  ('CT-MB-004', 'Socket', 'AM5', 10),
  ('CT-MB-004', 'Chipset', 'AMD A620', 11),
  ('CT-MB-004', 'Memory', 'DDR5, 2 slots, up to 96GB', 12),
  ('CT-MB-004', 'Form factor', 'Micro-ATX', 13),
  ('CT-MB-004', 'Storage', '1Ã— M.2, 2Ã— SATA', 14),
  ('CT-GPU-001', 'Memory', '8GB GDDR6', 10),
  ('CT-GPU-001', 'Card length', '240mm', 11),
  ('CT-GPU-001', 'Power draw', '115W', 12),
  ('CT-GPU-001', 'Power connector', '1Ã— 8-pin', 13),
  ('CT-GPU-002', 'Memory', '12GB GDDR6X', 10),
  ('CT-GPU-002', 'Card length', '308mm', 11),
  ('CT-GPU-002', 'Power draw', '220W', 12),
  ('CT-GPU-002', 'Power connector', '1Ã— 16-pin', 13),
  ('CT-GPU-003', 'Memory', '8GB GDDR6', 10),
  ('CT-GPU-003', 'Card length', '240mm', 11),
  ('CT-GPU-003', 'Power draw', '165W', 12),
  ('CT-GPU-003', 'Power connector', '1Ã— 8-pin', 13),
  ('CT-GPU-004', 'Memory', '12GB GDDR6', 10),
  ('CT-GPU-004', 'Card length', '301mm', 11),
  ('CT-GPU-004', 'Power draw', '170W', 12),
  ('CT-GPU-004', 'Power connector', '1Ã— 8-pin', 13),
  ('CT-RAM-001', 'Memory type', 'DDR4', 10),
  ('CT-RAM-001', 'Capacity', '16GB (2Ã— 8GB)', 11),
  ('CT-RAM-001', 'Speed', '3200 MHz', 12),
  ('CT-RAM-002', 'Memory type', 'DDR5', 10),
  ('CT-RAM-002', 'Capacity', '32GB (2Ã— 16GB)', 11),
  ('CT-RAM-002', 'Speed', '6000 MHz', 12),
  ('CT-RAM-003', 'Memory type', 'DDR4', 10),
  ('CT-RAM-003', 'Capacity', '8GB (1Ã— 8GB)', 11),
  ('CT-RAM-003', 'Speed', '3200 MHz', 12),
  ('CT-RAM-004', 'Memory type', 'DDR5', 10),
  ('CT-RAM-004', 'Capacity', '16GB (1Ã— 16GB)', 11),
  ('CT-RAM-004', 'Speed', '5600 MHz', 12),
  ('CT-SSD-001', 'Interface', 'PCIe 4.0 NVMe', 10),
  ('CT-SSD-001', 'Capacity', '1TB', 11),
  ('CT-SSD-001', 'Form factor', 'M.2 2280', 12),
  ('CT-SSD-002', 'Interface', 'PCIe 3.0 NVMe', 10),
  ('CT-SSD-002', 'Capacity', '500GB', 11),
  ('CT-SSD-002', 'Form factor', 'M.2 2280', 12),
  ('CT-SSD-003', 'Interface', 'SATA III', 10),
  ('CT-SSD-003', 'Capacity', '1TB', 11),
  ('CT-SSD-003', 'Form factor', '2.5-inch', 12),
  ('CT-SSD-004', 'Interface', 'PCIe 4.0 NVMe', 10),
  ('CT-SSD-004', 'Capacity', '2TB', 11),
  ('CT-SSD-004', 'Form factor', 'M.2 2280', 12),
  ('CT-HDD-001', 'Capacity', '2TB', 10),
  ('CT-HDD-001', 'Interface', 'SATA III', 11),
  ('CT-HDD-001', 'Speed', '7200 RPM', 12),
  ('CT-PSU-001', 'Wattage', '550W', 10),
  ('CT-PSU-001', 'Efficiency', '80+ Gold', 11),
  ('CT-PSU-001', 'Modularity', 'Fully modular', 12),
  ('CT-PSU-001', 'PCIe connectors', '2Ã— 8-pin', 13),
  ('CT-PSU-002', 'Wattage', '650W', 10),
  ('CT-PSU-002', 'Efficiency', '80+ Gold', 11),
  ('CT-PSU-002', 'Modularity', 'Fully modular', 12),
  ('CT-PSU-002', 'PCIe connectors', '3Ã— 8-pin, 1Ã— 16-pin', 13),
  ('CT-PSU-003', 'Wattage', '750W', 10),
  ('CT-PSU-003', 'Efficiency', '80+ Gold', 11),
  ('CT-PSU-003', 'Modularity', 'Semi-modular', 12),
  ('CT-PSU-003', 'PCIe connectors', '4Ã— 8-pin, 1Ã— 16-pin', 13),
  ('CT-CASE-001', 'Form factors', 'Micro-ATX, Mini-ITX', 10),
  ('CT-CASE-001', 'Max GPU length', '320mm', 11),
  ('CT-CASE-001', 'Max cooler height', '165mm', 12),
  ('CT-CASE-001', 'Fan mounts', '120mm, 140mm', 13),
  ('CT-CASE-002', 'Form factors', 'ATX, Micro-ATX, Mini-ITX', 10),
  ('CT-CASE-002', 'Max GPU length', '360mm', 11),
  ('CT-CASE-002', 'Max cooler height', '170mm', 12),
  ('CT-CASE-002', 'Fan mounts', '120mm, 140mm', 13),
  ('CT-CASE-003', 'Form factors', 'ATX, Micro-ATX, Mini-ITX', 10),
  ('CT-CASE-003', 'Max GPU length', '410mm', 11),
  ('CT-CASE-003', 'Max cooler height', '165mm', 12),
  ('CT-CASE-003', 'Fan mounts', '120mm, 140mm', 13),
  ('CT-COOL-001', 'Type', 'Single-tower air cooler', 10),
  ('CT-COOL-001', 'Height', '155mm', 11),
  ('CT-COOL-001', 'Socket support', 'LGA1700, AM5, AM4', 12),
  ('CT-COOL-001', 'Thermal rating', '180W', 13),
  ('CT-COOL-002', 'Type', '240mm liquid AIO', 10),
  ('CT-COOL-002', 'Height', '55mm pump', 11),
  ('CT-COOL-002', 'Socket support', 'LGA1700, AM5, AM4', 12),
  ('CT-COOL-002', 'Thermal rating', '250W', 13),
  ('CT-FAN-001', 'Size', '120mm', 10),
  ('CT-FAN-001', 'Pack', '3 fans', 11),
  ('CT-FAN-001', 'Connector', '4-pin PWM', 12),
  ('CT-FAN-002', 'Size', '140mm', 10),
  ('CT-FAN-002', 'Pack', '1 fan', 11),
  ('CT-FAN-002', 'Connector', '4-pin PWM', 12),
  ('CT-NET-001', 'Wi-Fi standard', 'Wi-Fi 6 (AX3000)', 10),
  ('CT-NET-001', 'Ports', '1Ã— WAN, 4Ã— LAN gigabit', 11),
  ('CT-NET-001', 'Features', 'OneMesh, OFDMA, MU-MIMO', 12),
  ('CT-NET-002', 'Wi-Fi standard', 'Wi-Fi 6', 10),
  ('CT-NET-002', 'Ports', '5Ã— gigabit Ethernet', 11),
  ('CT-NET-002', 'Management', 'RouterOS', 12),
  ('CT-NET-003', 'Wi-Fi standard', 'Wi-Fi 6 (AX3000)', 10),
  ('CT-NET-003', 'Ports', '1Ã— WAN, 4Ã— LAN gigabit', 11),
  ('CT-NET-003', 'Features', 'AiMesh, AiProtection', 12),
  ('CT-NET-004', 'Ports', '8Ã— gigabit', 10),
  ('CT-NET-004', 'Management', 'Unmanaged', 11),
  ('CT-NET-004', 'Case', 'Fanless metal', 12),
  ('CT-NET-005', 'Ports', '24Ã— gigabit + 2Ã— 10G SFP+', 10),
  ('CT-NET-005', 'Management', 'SwOS / RouterOS', 11),
  ('CT-NET-005', 'Form factor', '1U rackmount', 12),
  ('CT-NET-006', 'Ports', '16Ã— gigabit PoE+', 10),
  ('CT-NET-006', 'Uplinks', '2Ã— SFP', 11),
  ('CT-NET-006', 'PoE budget', '192W', 12),
  ('CT-NET-007', 'Wi-Fi standard', 'Wi-Fi 6', 10),
  ('CT-NET-007', 'Management', 'UniFi controller', 11),
  ('CT-NET-007', 'Power', '802.3af PoE', 12),
  ('CT-NET-008', 'Wi-Fi standard', 'Wi-Fi 6 (AX1800)', 10),
  ('CT-NET-008', 'Management', 'Omada controller', 11),
  ('CT-NET-008', 'Power', '802.3af/at PoE', 12),
  ('CT-NET-009', 'Type', 'GPON ONT', 10),
  ('CT-NET-009', 'Ports', '1Ã— GPON, 1Ã— LAN, Wi-Fi', 11),
  ('CT-NET-009', 'ISP profile', 'Provider-dependent', 12),
  ('CT-NET-010', 'Type', 'GPON ONT', 10),
  ('CT-NET-010', 'Ports', '1Ã— GPON, 4Ã— LAN, dual-band Wi-Fi', 11),
  ('CT-NET-010', 'ISP profile', 'Provider-dependent', 12),
  ('CT-NET-011', 'Interface', 'USB 3.0 to gigabit Ethernet', 10),
  ('CT-NET-011', 'Extras', '3-port USB hub', 11),
  ('CT-NET-011', 'Compatibility', 'Windows, macOS, Linux', 12),
  ('CT-NET-012', 'Wi-Fi standard', 'AC1300', 10),
  ('CT-NET-012', 'Interface', 'USB 3.0', 11),
  ('CT-NET-012', 'Antenna', 'High-gain external', 12),
  ('CT-NET-013', 'Ports', '7Ã— gigabit, 1Ã— 2.5G, 1Ã— 10G SFP+', 10),
  ('CT-NET-013', 'Management', 'RouterOS', 11),
  ('CT-NET-013', 'Power', 'PoE out on one port', 12),
  ('CT-TOOL-001', 'Type', 'Ratchet crimping tool', 10),
  ('CT-TOOL-001', 'Connectors', 'RJ45, RJ11', 11),
  ('CT-TOOL-001', 'Dies', 'Interchangeable', 12),
  ('CT-TOOL-002', 'Type', 'LAN cable tester', 10),
  ('CT-TOOL-002', 'Tests', 'Continuity, short, miswire', 11),
  ('CT-TOOL-002', 'Remote unit', 'Included', 12),
  ('CT-TOOL-003', 'Type', '110 punch down tool', 10),
  ('CT-TOOL-003', 'Impact', 'Adjustable', 11),
  ('CT-TOOL-003', 'Blade', 'Replaceable', 12),
  ('CT-TOOL-004', 'Category', 'Cat6 UTP', 10),
  ('CT-TOOL-004', 'Length', '305 metres', 11),
  ('CT-TOOL-004', 'Conductor', 'Solid copper', 12),
  ('CT-TOOL-005', 'Type', 'SC-LC single-mode duplex', 10),
  ('CT-TOOL-005', 'Length', '3 metres', 11),
  ('CT-TOOL-005', 'Polish', 'UPC', 12),
  ('CT-TOOL-006', 'Type', 'Cat6 RJ45 plugs', 10),
  ('CT-TOOL-006', 'Pack', '100 pieces', 11),
  ('CT-TOOL-006', 'Boots', 'Included', 12),
  ('CT-TOOL-007', 'Type', 'Cat6 keystone jack', 10),
  ('CT-TOOL-007', 'Termination', 'Toolless', 11),
  ('CT-TOOL-007', 'Standard', 'T568A/T568B', 12),
  ('CT-TOOL-008', 'Type', 'Wall faceplate', 10),
  ('CT-TOOL-008', 'Ports', '2 keystone ports', 11),
  ('CT-TOOL-008', 'Hardware', 'Screws included', 12),
  ('CT-TOOL-009', 'Type', 'Cat6 patch panel', 10),
  ('CT-TOOL-009', 'Ports', '24', 11),
  ('CT-TOOL-009', 'Form factor', '1U rackmount', 12),
  ('CT-TOOL-010', 'Type', 'Wall-mount network rack', 10),
  ('CT-TOOL-010', 'Capacity', '12U', 11),
  ('CT-TOOL-010', 'Door', 'Glass with vent', 12),
  ('CT-TOOL-011', 'Contents', 'Velcro straps, ties, labels', 10),
  ('CT-TOOL-011', 'Use', 'Rack and desk cable management', 11),
  ('CT-TOOL-012', 'Type', 'Single-mode fibre cable', 10),
  ('CT-TOOL-012', 'Cores', '2', 11),
  ('CT-TOOL-012', 'Length', '100 metres', 12),
  ('CT-ACC-001', 'Layout', '75%', 10),
  ('CT-ACC-001', 'Connection', 'Bluetooth 5.1, USB-C', 11),
  ('CT-ACC-001', 'Switches', 'Hot-swappable', 12),
  ('CT-ACC-002', 'Sensor', 'HERO 2', 10),
  ('CT-ACC-002', 'Weight', '60g', 11),
  ('CT-ACC-002', 'Connection', 'Lightspeed wireless', 12),
  ('CT-ACC-003', 'Connection', '3.5mm wired', 10),
  ('CT-ACC-003', 'Microphone', 'Cardioid', 11),
  ('CT-ACC-003', 'Compatibility', 'PC, console, mobile', 12),
  ('CT-ACC-004', 'Resolution', '1080p 30fps', 10),
  ('CT-ACC-004', 'Microphones', 'Dual stereo', 11),
  ('CT-ACC-004', 'Mount', 'Monitor clip', 12),
  ('CT-ACC-005', 'Ports', 'HDMI, Ethernet, USB-A, USB-C, SD/microSD', 10),
  ('CT-ACC-005', 'Power', '85W pass-through', 11),
  ('CT-ACC-005', 'Compatibility', 'USB-C laptops', 12),
  ('CT-ACC-006', 'Standard', 'HDMI 2.1', 10),
  ('CT-ACC-006', 'Length', '2 metres', 11),
  ('CT-ACC-006', 'Resolution', '8K60 / 4K120', 12),
  ('CT-ACC-007', 'Material', 'Aluminium', 10),
  ('CT-ACC-007', 'Adjustable', 'Height and angle', 11),
  ('CT-ACC-007', 'Compatibility', 'Up to 17-inch laptops', 12),
  ('CT-ACC-008', 'Fans', '3 adjustable', 10),
  ('CT-ACC-008', 'Size support', '15â€“17-inch laptops', 11),
  ('CT-ACC-008', 'Power', 'USB powered', 12),
  ('CT-ACC-009', 'Input', 'USB-C', 10),
  ('CT-ACC-009', 'Output', 'DisplayPort 1.4', 11),
  ('CT-ACC-009', 'Max resolution', '4K60', 12),
  ('CT-ACC-010', 'Interface', 'PCIe x1', 10),
  ('CT-ACC-010', 'Wi-Fi standard', 'Wi-Fi 6', 11),
  ('CT-ACC-010', 'Bluetooth', '5.0', 12)
) as v(sku, name, value, sort_order)
join public.products p on p.sku = v.sku
where not exists (
  select 1 from public.product_specifications s
  where s.product_id = p.id and s.name = v.name
);

commit;


-- >>> 0009_seed_pc_components.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0009: PC Builder specifications and rules
-- Populates pc_component_specs for every demo PC component and stores
-- a few explicit compatibility rules for demonstration and moderation.
-- =====================================================================

begin;

insert into public.pc_component_specs (
  product_id, component_type, socket, chipset, tdp_watt, cores, integrated_graphics,
  memory_type, memory_slots, max_memory_gb, form_factor, supported_form_factors,
  m2_slots, sata_ports, gpu_length_mm, gpu_tdp, gpu_power_connectors,
  recommended_psu_watt, wattage, efficiency, pcie_8pin_connectors,
  pcie_16pin_connectors, max_gpu_length_mm, max_cooler_height_mm,
  fan_mount_sizes, cooler_height_mm, cooler_sockets, cooler_tdp_rating,
  ram_modules, ram_capacity_gb, ram_speed_mhz, storage_interface,
  storage_capacity_gb, performance_score, notes
) values
-- Processors
('10000000-0000-4000-8000-000000000013', 'cpu', 'LGA1700', null, 65, 10, false,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  70, 'Intel Core i5-14400F â€” 10 cores, 65 W base power.'),
('10000000-0000-4000-8000-000000000014', 'cpu', 'LGA1700', null, 125, 20, true,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  92, 'Intel Core i7-14700K â€” 20 cores, 125 W base power.'),
('10000000-0000-4000-8000-000000000015', 'cpu', 'AM5', null, 65, 6, true,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  72, 'AMD Ryzen 5 7600 â€” 6 cores, 65 W TDP, integrated Radeon graphics.'),
('10000000-0000-4000-8000-000000000016', 'cpu', 'AM5', null, 120, 8, true,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  88, 'AMD Ryzen 7 7800X3D â€” 8 cores, 120 W TDP, 3D V-Cache.'),

-- Motherboards
('10000000-0000-4000-8000-000000000017', 'motherboard', 'LGA1700', 'Intel B760', null, null, null,
  'DDR4', 2, 64, 'Micro-ATX', array['Micro-ATX','Mini-ITX'], 2, 4, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  58, 'ASUS Prime B760M-K DDR4 â€” two DDR4 slots, dual M.2.'),
('10000000-0000-4000-8000-000000000018', 'motherboard', 'AM5', 'AMD B650', null, null, null,
  'DDR5', 4, 128, 'Micro-ATX', array['Micro-ATX','Mini-ITX'], 2, 4, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  68, 'MSI PRO B650M-A WIFI â€” four DDR5 slots, Wi-Fi 6E.'),
('10000000-0000-4000-8000-000000000019', 'motherboard', 'LGA1700', 'Intel Z790', null, null, null,
  'DDR5', 4, 192, 'ATX', array['ATX','Micro-ATX','Mini-ITX'], 4, 6, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  84, 'Gigabyte Z790 AORUS ELITE AX DDR5 â€” four M.2 slots, strong VRM.'),
('10000000-0000-4000-8000-000000000020', 'motherboard', 'AM5', 'AMD A620', null, null, null,
  'DDR5', 2, 96, 'Micro-ATX', array['Micro-ATX','Mini-ITX'], 1, 2, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  48, 'ASRock A620M-HDV/M.2+ â€” entry AM5 board with one M.2 slot.'),

-- Graphics cards
('10000000-0000-4000-8000-000000000021', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 240, 115, '1x 8-pin',
  450, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  55, 'ASUS Dual RTX 4060 OC â€” 240 mm card, 115 W board power.'),
('10000000-0000-4000-8000-000000000022', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 308, 220, '1x 16-pin',
  650, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  78, 'MSI RTX 4070 SUPER Ventus 3X â€” 308 mm card, 220 W board power.'),
('10000000-0000-4000-8000-000000000023', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 240, 165, '1x 8-pin',
  500, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  50, 'Gigabyte Radeon RX 7600 Gaming OC â€” 240 mm card, 165 W board power.'),
('10000000-0000-4000-8000-000000000024', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 301, 170, '1x 8-pin',
  550, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  42, 'ASUS TUF RTX 3060 V2 â€” 301 mm card, 170 W board power.'),

-- Memory kits
('10000000-0000-4000-8000-000000000025', 'ram', null, null, null, null, null,
  'DDR4', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 2, 16, 3200, null, null,
  30, 'Corsair Vengeance LPX 16 GB DDR4-3200 â€” two 8 GB modules.'),
('10000000-0000-4000-8000-000000000026', 'ram', null, null, null, null, null,
  'DDR5', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 2, 32, 6000, null, null,
  45, 'Kingston Fury Beast 32 GB DDR5-6000 â€” two 16 GB modules.'),
('10000000-0000-4000-8000-000000000027', 'ram', null, null, null, null, null,
  'DDR4', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 1, 8, 3200, null, null,
  18, 'TeamGroup Elite 8 GB DDR4-3200 â€” single module.'),
('10000000-0000-4000-8000-000000000028', 'ram', null, null, null, null, null,
  'DDR5', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 1, 16, 5600, null, null,
  26, 'Samsung 16 GB DDR5-5600 â€” single module.'),

-- Storage
('10000000-0000-4000-8000-000000000029', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'M.2 NVMe PCIe 4.0', 1000, 60, 'Samsung 990 PRO 1 TB â€” PCIe 4.0 NVMe.'),
('10000000-0000-4000-8000-000000000030', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'M.2 NVMe PCIe 3.0', 500, 38, 'Kingston NV3 500 GB â€” PCIe 3.0 NVMe.'),
('10000000-0000-4000-8000-000000000031', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'SATA III 2.5-inch', 1000, 30, 'Samsung 870 EVO 1 TB â€” SATA III 2.5-inch.'),
('10000000-0000-4000-8000-000000000032', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'M.2 NVMe PCIe 4.0', 2000, 72, 'WD Black SN850X 2 TB â€” PCIe 4.0 NVMe.'),
('10000000-0000-4000-8000-000000000033', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'SATA III 3.5-inch', 2000, 14, 'Seagate Barracuda 2 TB â€” 7200 RPM hard drive.'),

-- Power supplies
('10000000-0000-4000-8000-000000000034', 'psu', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  550, '80+ Gold', 2, 0, null, null, null, null, null, null, null, null, null, null,
  null, 45, 'Seasonic Focus GX-550 â€” 550 W, two 8-pin PCIe outputs.'),
('10000000-0000-4000-8000-000000000035', 'psu', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  650, '80+ Gold', 3, 1, null, null, null, null, null, null, null, null, null, null,
  null, 60, 'Corsair RM650e â€” 650 W, three 8-pin and one 16-pin PCIe output.'),
('10000000-0000-4000-8000-000000000036', 'psu', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  750, '80+ Gold', 4, 1, null, null, null, null, null, null, null, null, null, null,
  null, 72, 'Cooler Master MWE 750 V2 â€” 750 W, four 8-pin and one 16-pin output.'),

-- Cases
('10000000-0000-4000-8000-000000000037', 'case', null, null, null, null, null,
  null, null, null, null, array['Micro-ATX','Mini-ITX'], null, null, null, null, null,
  null, null, null, null, null, 320, 165, array['120mm','140mm'], null, null, null, null, null, null,
  null, null, 50, 'DeepCool CH370 â€” micro-ATX case, 320 mm GPU, 165 mm cooler.'),
('10000000-0000-4000-8000-000000000038', 'case', null, null, null, null, null,
  null, null, null, null, array['ATX','Micro-ATX','Mini-ITX'], null, null, null, null, null,
  null, null, null, null, null, 360, 170, array['120mm','140mm'], null, null, null, null, null, null,
  null, null, 65, 'Corsair 4000D Airflow â€” ATX mid-tower, 360 mm GPU, 170 mm cooler.'),
('10000000-0000-4000-8000-000000000039', 'case', null, null, null, null, null,
  null, null, null, null, array['ATX','Micro-ATX','Mini-ITX'], null, null, null, null, null,
  null, null, null, null, null, 410, 165, array['120mm','140mm'], null, null, null, null, null, null,
  null, null, 68, 'Cooler Master TD500 Mesh â€” ATX tower, 410 mm GPU, 165 mm cooler.'),

-- CPU coolers
('10000000-0000-4000-8000-000000000040', 'cooler', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  165, null, 155, array['LGA1700','AM5','AM4'], 180, null, null, null, null, null, null,
  48, 'DeepCool AK400 â€” 155 mm tall, rated to 180 W.'),
('10000000-0000-4000-8000-000000000041', 'cooler', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, 55, array['LGA1700','AM5','AM4'], 250, null, null, null, null, null, null,
  66, 'Cooler Master ML240L Core â€” 240 mm liquid cooler, rated to 250 W.'),

-- Case fans
('10000000-0000-4000-8000-000000000042', 'case_fan', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  22, '3 Ã— 120mm PWM fans with daisy-chain cables.'),
('10000000-0000-4000-8000-000000000043', 'case_fan', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  20, '1 Ã— 140mm PWM pressure-optimised fan.')
on conflict (product_id) do nothing;

-- Explicit compatibility rules. The runtime engine derives most checks from
-- pc_component_specs; these records provide auditable overrides for staff.
insert into public.pc_component_compatibility (
  component_a_product_id, component_b_product_id, status, reason
) values
('10000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000019', 'compatible',
  'Intel Core i5-14400F and Gigabyte Z790 share the LGA1700 socket.'),
('10000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000020', 'incompatible',
  'Intel Core i5-14400F is LGA1700, but the ASRock A620M is an AM5 board.'),
('10000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000020', 'compatible',
  'AMD Ryzen 5 7600 and ASRock A620M share the AM5 socket.'),
('10000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000017', 'incompatible',
  'AMD Ryzen 7 7800X3D is AM5, but the ASUS Prime B760M-K is LGA1700.'),
('10000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000018', 'incompatible',
  'Corsair Vengeance LPX is DDR4, but the MSI PRO B650M-A WIFI requires DDR5.'),
('10000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000017', 'incompatible',
  'Kingston Fury Beast is DDR5, but the ASUS Prime B760M-K DDR4 accepts DDR4 only.'),
('10000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000037', 'warning',
  'The RTX 4070 SUPER is 308 mm; the CH370 lists 320 mm clearance, so front fan and cable routing must be checked.'),
('10000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000034', 'warning',
  'A 550 W PSU powers an RTX 4070 SUPER system, but 650 W is recommended for transient headroom.'),
('10000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000040', 'compatible',
  'DeepCool AK400 ships with AM5 mounting hardware and is rated above the 7800X3D TDP.'),
('10000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000040', 'warning',
  'The AK400 can cool the i7-14700K at stock settings, but sustained all-core loads benefit from a 240 mm AIO.')
on conflict (component_a_product_id, component_b_product_id) do nothing;

commit;


-- >>> 0010_seed_merchandising.sql >>>

-- =====================================================================
-- COMPUTECH â€” Demo seed 0010: merchandising, shipping and reviews
-- Promotions, vouchers, shipping methods, site settings and a set of
-- clearly labelled demo reviews. Contact details are intentionally empty:
-- configure them in Admin â†’ Settings or via environment variables.
-- =====================================================================

begin;

insert into public.promotions (
  id, name, slug, description, type, discount_type, discount_value,
  start_date, end_date, usage_limit, used_count, min_purchase, max_discount,
  is_active
) values
('30000000-0000-4000-8000-000000000001', 'Midnight Flash Sale', 'midnight-flash-sale',
  'Limited-time price drops on selected graphics cards, SSDs and displays. Demo campaign data.',
  'flash_sale', 'percentage', 12, now() - interval '1 day', now() + interval '7 days',
  200, 0, 0, 2500000, true),
('30000000-0000-4000-8000-000000000002', 'Creator Week', 'creator-week',
  'Eight percent off selected creator laptops, displays and peripherals. Demo campaign data.',
  'seasonal', 'percentage', 8, now() - interval '2 days', now() + interval '14 days',
  150, 0, 0, 2000000, true),
('30000000-0000-4000-8000-000000000003', 'Networking Starter Bundle', 'networking-starter-bundle',
  'Save on routers, switches and access points when building a small-network kit. Demo campaign data.',
  'bundle', 'fixed', 150000, now() - interval '3 days', now() + interval '21 days',
  100, 0, 1500000, null, true),
('30000000-0000-4000-8000-000000000004', 'Free Shipping Weekend', 'free-shipping-weekend',
  'Free shipping on carts above Rp 500.000 while the campaign runs. Demo campaign data.',
  'free_shipping', 'percentage', 0, now() - interval '1 day', now() + interval '5 days',
  500, 0, 500000, null, true),
('30000000-0000-4000-8000-000000000005', 'Member Special', 'member-special',
  'Five percent member pricing on selected PC components. Demo campaign data.',
  'member_discount', 'percentage', 5, now() - interval '1 day', now() + interval '30 days',
  300, 0, 0, 1000000, true)
on conflict (id) do nothing;

insert into public.promotion_products (promotion_id, product_id, discount_type, discount_value) values
('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000021', null, null),
('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000023', null, null),
('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000029', null, null),
('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000030', null, null),
('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000011', null, null),
('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', null, null),
('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', null, null),
('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', null, null),
('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000012', null, null),
('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000069', null, null),
('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000070', null, null),
('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000044', null, null),
('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000047', null, null),
('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000050', null, null),
('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000051', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000013', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000015', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000017', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000018', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000025', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000026', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000034', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000035', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000037', null, null),
('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000038', null, null)
on conflict (promotion_id, product_id) do nothing;

insert into public.vouchers (
  id, code, name, description, discount_type, discount_value, min_purchase,
  max_discount, starts_at, expires_at, usage_limit, used_count, per_user_limit, is_active
) values
('40000000-0000-4000-8000-000000000001', 'WELCOME50', 'New Customer Rp 50.000',
  'Rp 50.000 off your first order above Rp 300.000. Demo voucher.',
  'fixed', 50000, 300000, null, now() - interval '1 day', now() + interval '90 days',
  500, 0, 1, true),
('40000000-0000-4000-8000-000000000002', 'TECH10', 'Tech Ten Percent',
  '10% off orders above Rp 1.000.000, capped at Rp 300.000. Demo voucher.',
  'percentage', 10, 1000000, 300000, now() - interval '1 day', now() + interval '60 days',
  300, 0, 2, true),
('40000000-0000-4000-8000-000000000003', 'NETWORK25', 'Network Starter Rp 25.000',
  'Rp 25.000 off networking orders above Rp 250.000. Demo voucher.',
  'fixed', 25000, 250000, null, now() - interval '1 day', now() + interval '45 days',
  200, 0, 1, true),
('40000000-0000-4000-8000-000000000004', 'CREATOR500', 'Creator Setup Rp 500.000',
  'Rp 500.000 off creator laptops and workstations above Rp 10.000.000. Demo voucher.',
  'fixed', 500000, 10000000, null, now() - interval '1 day', now() + interval '30 days',
  50, 0, 1, true)
on conflict (id) do nothing;

insert into public.shipping_methods (id, name, courier, description, cost, estimated_days, is_active, sort_order) values
('50000000-0000-4000-8000-000000000001', 'JNE Regular', 'JNE', 'Economical courier for most Indonesian cities.', 18000, '2-4 business days', true, 1),
('50000000-0000-4000-8000-000000000002', 'JNE YES', 'JNE', 'Next-day delivery where the service is available.', 32000, '1 business day', true, 2),
('50000000-0000-4000-8000-000000000003', 'J&T Express', 'J&T', 'Nationwide express courier service.', 17000, '2-4 business days', true, 3),
('50000000-0000-4000-8000-000000000004', 'SiCepat Halu', 'SiCepat', 'Budget-friendly delivery for non-urgent orders.', 15000, '3-5 business days', true, 4),
('50000000-0000-4000-8000-000000000005', 'AnterAja Regular', 'AnterAja', 'Reliable standard delivery across Indonesia.', 19000, '2-4 business days', true, 5),
('50000000-0000-4000-8000-000000000006', 'Same-Day Courier', 'COMPUTECH', 'Local same-day delivery in supported service areas. Confirm availability before ordering.', 45000, 'Same day', false, 6)
on conflict (id) do nothing;

insert into public.site_settings (key, value) values
('store_name', 'COMPUTECH'),
('store_tagline', 'Build Your Setup. Define Your Performance.'),
('store_email', ''),
('store_whatsapp', ''),
('store_address', ''),
('store_hours', 'Monday to Saturday, 09:00â€“18:00 WIB'),
('announcement_text', 'Demo storefront: catalog and stock data are seeded examples. Configure credentials and contact details before going live.'),
('announcement_link', '/about'),
('free_shipping_min', '500000'),
('bank_transfer_instructions', 'Transfer the exact order total to the store account shown on your order page. Include your order number in the transfer description. Your order is marked paid after staff verification.')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.product_reviews (
  id, product_id, user_id, order_item_id, reviewer_name, rating, title, body,
  is_approved, is_demo, created_at
) values
('60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null, null, 'Rizky A.', 5, 'Solid first gaming laptop',
  'The 144 Hz panel and RTX 4060 handle the games I play comfortably. Fan noise is noticeable under load but acceptable with a headset.', true, true, now() - interval '18 days'),
('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', null, null, 'Dewi P.', 4, 'Good value, upgrade the RAM',
  'Runs well for coursework and light gaming. I added another 16 GB of memory and it handles my virtual machines much better now.', true, true, now() - interval '9 days'),
('60000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', null, null, 'Bagas S.', 5, 'Excellent portable creator machine',
  'The OLED display is the highlight. It stays quiet in normal use and only spins up during exports. Pricey, but it replaced two devices for me.', true, true, now() - interval '21 days'),
('60000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', null, null, 'Nadia R.', 4, 'Clean office build',
  'Arrived with tidy cable management and no bloatware. Fine for documents and video calls. I would add a larger SSD for photo storage.', true, true, now() - interval '12 days'),
('60000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000008', null, null, 'Fajar H.', 5, 'Quiet and fast',
  'Runs 1440p games at high settings without sounding like a jet engine. The case has room for another drive and the build is easy to service.', true, true, now() - interval '6 days'),
('60000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000011', null, null, 'Yoga T.', 5, 'Great QHD gaming monitor',
  'Colours are good for the price and the 180 Hz refresh rate is a clear step up. The stand is basic but the VESA mount works well.', true, true, now() - interval '30 days'),
('60000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000013', null, null, 'Arif M.', 5, 'Efficient mid-range CPU',
  'Pairs well with a B760 board and stays cool with a modest tower cooler. Handles gaming and light editing without becoming a space heater.', true, true, now() - interval '25 days'),
('60000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000013', null, null, 'Sinta L.', 4, 'Needs a GPU, as expected',
  'No integrated graphics, so plan the build accordingly. Performance is strong for the price once paired with a discrete card.', true, true, now() - interval '11 days'),
('60000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000015', null, null, 'Kevin W.', 5, 'Easy AM5 starting point',
  'The integrated graphics were useful while I waited for a GPU. Runs cool and the platform has a clear upgrade path.', true, true, now() - interval '15 days'),
('60000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000016', null, null, 'Melati D.', 5, 'Gaming performance is real',
  'Frame times are noticeably smoother in the titles I play. It does run warm under sustained loads, so budget for a good cooler.', true, true, now() - interval '4 days'),
('60000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000018', null, null, 'Hendra K.', 4, 'Good board, Wi-Fi is handy',
  'Four memory slots and two M.2 sockets cover my needs. The Wi-Fi antenna is larger than expected but reception is stable.', true, true, now() - interval '19 days'),
('60000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000021', null, null, 'Tomi S.', 5, 'Perfect for 1080p high refresh',
  'Quiet at idle and stays reasonable under load. DLSS helps in newer titles. The single 8-pin connector keeps cabling simple.', true, true, now() - interval '8 days'),
('60000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000022', null, null, 'Rina F.', 5, 'Strong 1440p card',
  'Runs my QHD games at high settings with room to spare. It is long, so check case clearance before ordering.', true, true, now() - interval '13 days'),
('60000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000026', null, null, 'Andre Y.', 5, 'EXPO worked first time',
  'Reached the rated speed on a B650 board after enabling EXPO. Stability has been fine during long editing sessions.', true, true, now() - interval '16 days'),
('60000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000029', null, null, 'Vina C.', 5, 'Fast, consistent NVMe',
  'Large project files open quickly and sustained writes stay high. Runs a little warm without a heatsink, so use the board cover.', true, true, now() - interval '27 days'),
('60000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000034', null, null, 'Bayu N.', 4, 'Quiet and modular',
  'Cables are easy to route and the fan is quiet at normal loads. 550 W is enough for my mid-range build but limits future GPU upgrades.', true, true, now() - interval '22 days'),
('60000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000038', null, null, 'Ika P.', 5, 'Easy case to build in',
  'Plenty of room for a long GPU and a tall cooler. The front panel keeps temperatures down and cable routing is straightforward.', true, true, now() - interval '14 days'),
('60000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000044', null, null, 'Dimas A.', 5, 'Reliable home router',
  'Coverage is good across a two-floor house and the app setup is simple. It has been stable for several weeks.', true, true, now() - interval '10 days'),
('60000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000047', null, null, 'Wulan E.', 5, 'Simple and does the job',
  'Plugged it in and it worked. Fanless design is silent and the metal body feels sturdy. Good value for an unmanaged switch.', true, true, now() - interval '24 days'),
('60000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000050', null, null, 'Galih R.', 4, 'Good AP, plan the controller',
  'Coverage and throughput are solid. Remember that you need PoE and a UniFi controller to get the most from it.', true, true, now() - interval '5 days'),
('60000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000057', null, null, 'Sari W.', 5, 'Crimps cleanly',
  'The ratchet action makes consistent terminations much easier. Dies swap without tools and the handle is comfortable.', true, true, now() - interval '17 days'),
('60000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000060', null, null, 'Eko B.', 4, 'Good cable for the price',
  'The reel is easy to pull and the jacket strips cleanly. I used it for a small office run and all tests passed.', true, true, now() - interval '20 days'),
('60000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000069', null, null, 'Putri M.', 5, 'Great typing feel',
  'The 75% layout saves desk space without losing the arrow keys. Bluetooth switching between laptop and desktop works well.', true, true, now() - interval '7 days'),
('60000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000070', null, null, 'Joni K.', 5, 'Light and precise',
  'Battery life is excellent and the sensor tracks well on a cloth pad. It is expensive, but competitive players will notice the weight.', true, true, now() - interval '29 days'),
('60000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000073', null, null, 'Laras S.', 4, 'Useful travel dock',
  'Adds Ethernet and HDMI to my laptop with one cable. It warms up during long meetings but has been reliable.', true, true, now() - interval '3 days')
on conflict (id) do nothing;

commit;

