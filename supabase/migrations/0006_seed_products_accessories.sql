-- =====================================================================
-- COMPUTECH — Demo seed 0006: accessories and peripherals
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
 'Cooling pad with three adjustable fans for 15–17-inch laptops.',
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
