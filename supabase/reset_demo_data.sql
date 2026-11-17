-- =====================================================================
-- COMPUTECH - reset demo data
--
-- Only needed if you already ran an older version of the seed files (for
-- example one with broken UTF-8 characters) or you simply want a clean
-- catalogue. This wipes DEMO data and every table that depends on it
-- (orders, carts, wishlists, reviews, inventory, builds, ...).
--
-- Do NOT run this on a store with real customers or real orders.
--
-- After running it, re-run supabase/all_in_one.sql to reload the demo
-- catalogue with correct text.
-- =====================================================================

begin;

truncate table
  public.product_reviews,
  public.promotion_products,
  public.promotions,
  public.vouchers,
  public.shipping_methods,
  public.site_settings,
  public.pc_component_compatibility,
  public.pc_component_specs,
  public.products,
  public.categories,
  public.brands
restart identity cascade;

commit;
