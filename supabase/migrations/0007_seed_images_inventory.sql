-- =====================================================================
-- COMPUTECH — Demo seed 0007: product images and inventory
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
  p.name || ' — demo product image',
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
