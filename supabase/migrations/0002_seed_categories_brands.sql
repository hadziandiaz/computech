-- =====================================================================
-- COMPUTECH — Demo seed 0002: categories and brands
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
