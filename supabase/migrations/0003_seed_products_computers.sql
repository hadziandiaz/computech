-- =====================================================================
-- COMPUTECH — Demo seed 0003: computers, laptops and monitors
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
