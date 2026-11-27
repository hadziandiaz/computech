-- =====================================================================
-- COMPUTECH — Demo seed 0010: merchandising, shipping and reviews
-- Promotions, vouchers, shipping methods, site settings and a set of
-- clearly labelled demo reviews. Contact details are intentionally empty:
-- configure them in Admin → Settings or via environment variables.
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

-- Example ongkir zones. Matchers are lowercase tokens checked against the
-- destination province / city / district. The empty-token zone is the
-- catch-all fallback. All values are examples and editable in Admin → Settings.
insert into public.shipping_zones (id, code, name, description, matchers, is_active, sort_order) values
('70000000-0000-4000-8000-000000000001', 'jabodetabek', 'Jabodetabek',
  'Jakarta, Bogor, Depok, Tangerang and South Tangerang.',
  array['dki jakarta','jakarta','bogor','depok','tangerang','tangsel'], true, 1),
('70000000-0000-4000-8000-000000000002', 'jawa', 'Jawa (luar Jabodetabek)',
  'Other destinations across Java.',
  array['jawa barat','jawa tengah','jawa timur','yogyakarta','jawa'], true, 2),
('70000000-0000-4000-8000-000000000003', 'luar_jawa', 'Luar Jawa',
  'All destinations outside Java. Also used when no token matches.',
  array[]::text[], true, 3)
on conflict (id) do nothing;

insert into public.shipping_zone_rates (zone_id, method_id, cost) values
('70000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 12000),
('70000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 25000),
('70000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003', 11000),
('70000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000004', 10000),
('70000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000005', 13000),
('70000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000006', 25000),
('70000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', 20000),
('70000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', 35000),
('70000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000003', 19000),
('70000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000004', 17000),
('70000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000005', 21000),
('70000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000006', 40000),
('70000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000001', 32000),
('70000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000002', 48000),
('70000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', 30000),
('70000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000004', 28000),
('70000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000005', 33000),
('70000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000006', 52000)
on conflict (zone_id, method_id) do update set cost = excluded.cost, updated_at = now();

insert into public.site_settings (key, value) values
('store_name', 'COMPUTECH'),
('store_tagline', 'Build Your Setup. Define Your Performance.'),
('store_email', ''),
('store_whatsapp', ''),
('store_address', ''),
('store_hours', 'Monday to Saturday, 09:00–18:00 WIB'),
('announcement_text', 'Demo storefront: catalog and stock data are seeded examples. Configure credentials and contact details before going live.'),
('announcement_link', '/about'),
('free_shipping_min', '500000'),
('bank_transfer_instructions', 'Transfer ke rekening contoh di bawah ini. Gunakan kode unik pada nominal transfer agar pembayaran mudah dicocokkan. Pembayaran dikonfirmasi oleh staf setelah dana diterima.'),
('bank_name', 'Bank Contoh'),
('bank_account_name', 'COMPUTECH Demo'),
('bank_account_number', '1234567890'),
('qris_merchant_name', 'COMPUTECH Demo'),
('qris_string', '00020101021126610014ID.CO.QRIS.WWW0215ID1024000000000000000000000000000520301620302ID5912COMPUTECHDEMO6007Jakarta6304ABCD'),
('cod_instructions', 'Bayar tunai kepada kurir saat paket diterima. Periksa barang sebelum membayar dan simpan bukti pembayaran.')
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
