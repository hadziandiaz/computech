-- =====================================================================
-- COMPUTECH — Demo seed 0009: PC Builder specifications and rules
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
  70, 'Intel Core i5-14400F — 10 cores, 65 W base power.'),
('10000000-0000-4000-8000-000000000014', 'cpu', 'LGA1700', null, 125, 20, true,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  92, 'Intel Core i7-14700K — 20 cores, 125 W base power.'),
('10000000-0000-4000-8000-000000000015', 'cpu', 'AM5', null, 65, 6, true,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  72, 'AMD Ryzen 5 7600 — 6 cores, 65 W TDP, integrated Radeon graphics.'),
('10000000-0000-4000-8000-000000000016', 'cpu', 'AM5', null, 120, 8, true,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  88, 'AMD Ryzen 7 7800X3D — 8 cores, 120 W TDP, 3D V-Cache.'),

-- Motherboards
('10000000-0000-4000-8000-000000000017', 'motherboard', 'LGA1700', 'Intel B760', null, null, null,
  'DDR4', 2, 64, 'Micro-ATX', array['Micro-ATX','Mini-ITX'], 2, 4, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  58, 'ASUS Prime B760M-K DDR4 — two DDR4 slots, dual M.2.'),
('10000000-0000-4000-8000-000000000018', 'motherboard', 'AM5', 'AMD B650', null, null, null,
  'DDR5', 4, 128, 'Micro-ATX', array['Micro-ATX','Mini-ITX'], 2, 4, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  68, 'MSI PRO B650M-A WIFI — four DDR5 slots, Wi-Fi 6E.'),
('10000000-0000-4000-8000-000000000019', 'motherboard', 'LGA1700', 'Intel Z790', null, null, null,
  'DDR5', 4, 192, 'ATX', array['ATX','Micro-ATX','Mini-ITX'], 4, 6, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  84, 'Gigabyte Z790 AORUS ELITE AX DDR5 — four M.2 slots, strong VRM.'),
('10000000-0000-4000-8000-000000000020', 'motherboard', 'AM5', 'AMD A620', null, null, null,
  'DDR5', 2, 96, 'Micro-ATX', array['Micro-ATX','Mini-ITX'], 1, 2, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  48, 'ASRock A620M-HDV/M.2+ — entry AM5 board with one M.2 slot.'),

-- Graphics cards
('10000000-0000-4000-8000-000000000021', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 240, 115, '1x 8-pin',
  450, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  55, 'ASUS Dual RTX 4060 OC — 240 mm card, 115 W board power.'),
('10000000-0000-4000-8000-000000000022', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 308, 220, '1x 16-pin',
  650, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  78, 'MSI RTX 4070 SUPER Ventus 3X — 308 mm card, 220 W board power.'),
('10000000-0000-4000-8000-000000000023', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 240, 165, '1x 8-pin',
  500, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  50, 'Gigabyte Radeon RX 7600 Gaming OC — 240 mm card, 165 W board power.'),
('10000000-0000-4000-8000-000000000024', 'gpu', null, null, null, null, null,
  null, null, null, null, null, null, null, 301, 170, '1x 8-pin',
  550, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  42, 'ASUS TUF RTX 3060 V2 — 301 mm card, 170 W board power.'),

-- Memory kits
('10000000-0000-4000-8000-000000000025', 'ram', null, null, null, null, null,
  'DDR4', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 2, 16, 3200, null, null,
  30, 'Corsair Vengeance LPX 16 GB DDR4-3200 — two 8 GB modules.'),
('10000000-0000-4000-8000-000000000026', 'ram', null, null, null, null, null,
  'DDR5', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 2, 32, 6000, null, null,
  45, 'Kingston Fury Beast 32 GB DDR5-6000 — two 16 GB modules.'),
('10000000-0000-4000-8000-000000000027', 'ram', null, null, null, null, null,
  'DDR4', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 1, 8, 3200, null, null,
  18, 'TeamGroup Elite 8 GB DDR4-3200 — single module.'),
('10000000-0000-4000-8000-000000000028', 'ram', null, null, null, null, null,
  'DDR5', null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 1, 16, 5600, null, null,
  26, 'Samsung 16 GB DDR5-5600 — single module.'),

-- Storage
('10000000-0000-4000-8000-000000000029', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'M.2 NVMe PCIe 4.0', 1000, 60, 'Samsung 990 PRO 1 TB — PCIe 4.0 NVMe.'),
('10000000-0000-4000-8000-000000000030', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'M.2 NVMe PCIe 3.0', 500, 38, 'Kingston NV3 500 GB — PCIe 3.0 NVMe.'),
('10000000-0000-4000-8000-000000000031', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'SATA III 2.5-inch', 1000, 30, 'Samsung 870 EVO 1 TB — SATA III 2.5-inch.'),
('10000000-0000-4000-8000-000000000032', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'M.2 NVMe PCIe 4.0', 2000, 72, 'WD Black SN850X 2 TB — PCIe 4.0 NVMe.'),
('10000000-0000-4000-8000-000000000033', 'storage', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
  'SATA III 3.5-inch', 2000, 14, 'Seagate Barracuda 2 TB — 7200 RPM hard drive.'),

-- Power supplies
('10000000-0000-4000-8000-000000000034', 'psu', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  550, '80+ Gold', 2, 0, null, null, null, null, null, null, null, null, null, null,
  null, 45, 'Seasonic Focus GX-550 — 550 W, two 8-pin PCIe outputs.'),
('10000000-0000-4000-8000-000000000035', 'psu', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  650, '80+ Gold', 3, 1, null, null, null, null, null, null, null, null, null, null,
  null, 60, 'Corsair RM650e — 650 W, three 8-pin and one 16-pin PCIe output.'),
('10000000-0000-4000-8000-000000000036', 'psu', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  750, '80+ Gold', 4, 1, null, null, null, null, null, null, null, null, null, null,
  null, 72, 'Cooler Master MWE 750 V2 — 750 W, four 8-pin and one 16-pin output.'),

-- Cases
('10000000-0000-4000-8000-000000000037', 'case', null, null, null, null, null,
  null, null, null, null, array['Micro-ATX','Mini-ITX'], null, null, null, null, null,
  null, null, null, null, null, 320, 165, array['120mm','140mm'], null, null, null, null, null, null,
  null, null, 50, 'DeepCool CH370 — micro-ATX case, 320 mm GPU, 165 mm cooler.'),
('10000000-0000-4000-8000-000000000038', 'case', null, null, null, null, null,
  null, null, null, null, array['ATX','Micro-ATX','Mini-ITX'], null, null, null, null, null,
  null, null, null, null, null, 360, 170, array['120mm','140mm'], null, null, null, null, null, null,
  null, null, 65, 'Corsair 4000D Airflow — ATX mid-tower, 360 mm GPU, 170 mm cooler.'),
('10000000-0000-4000-8000-000000000039', 'case', null, null, null, null, null,
  null, null, null, null, array['ATX','Micro-ATX','Mini-ITX'], null, null, null, null, null,
  null, null, null, null, null, 410, 165, array['120mm','140mm'], null, null, null, null, null, null,
  null, null, 68, 'Cooler Master TD500 Mesh — ATX tower, 410 mm GPU, 165 mm cooler.'),

-- CPU coolers
('10000000-0000-4000-8000-000000000040', 'cooler', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  165, null, 155, array['LGA1700','AM5','AM4'], 180, null, null, null, null, null, null,
  48, 'DeepCool AK400 — 155 mm tall, rated to 180 W.'),
('10000000-0000-4000-8000-000000000041', 'cooler', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, 55, array['LGA1700','AM5','AM4'], 250, null, null, null, null, null, null,
  66, 'Cooler Master ML240L Core — 240 mm liquid cooler, rated to 250 W.'),

-- Case fans
('10000000-0000-4000-8000-000000000042', 'case_fan', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  22, '3 × 120mm PWM fans with daisy-chain cables.'),
('10000000-0000-4000-8000-000000000043', 'case_fan', null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null,
  20, '1 × 140mm PWM pressure-optimised fan.')
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
