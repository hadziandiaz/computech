import { describe, expect, it } from "vitest";

import {
  buildTotal,
  checkCompatibility,
  recommendBuild,
  type PcComponent,
} from "@/lib/pc-builder/compatibility";
import type { PcComponentSpec, PcComponentType } from "@/types/domain";

function component(
  id: string,
  type: PcComponentType,
  spec: Partial<PcComponentSpec> = {},
  price = 1_000_000,
  stock = 5,
): PcComponent {
  return {
    id,
    name: id,
    slug: id,
    sku: id.toUpperCase(),
    price,
    discount_price: null,
    images: [],
    brand: null,
    inventory: {
      product_id: id,
      stock,
      reserved: 0,
      low_stock_threshold: 1,
    },
    pc_spec: {
      product_id: id,
      component_type: type,
      socket: null,
      chipset: null,
      tdp_watt: null,
      cores: null,
      integrated_graphics: null,
      memory_type: null,
      memory_slots: null,
      max_memory_gb: null,
      form_factor: null,
      supported_form_factors: null,
      m2_slots: null,
      sata_ports: null,
      gpu_length_mm: null,
      gpu_tdp: null,
      gpu_power_connectors: null,
      recommended_psu_watt: null,
      wattage: null,
      efficiency: null,
      pcie_8pin_connectors: null,
      pcie_16pin_connectors: null,
      max_gpu_length_mm: null,
      max_cooler_height_mm: null,
      fan_mount_sizes: null,
      cooler_height_mm: null,
      cooler_sockets: null,
      cooler_tdp_rating: null,
      ram_modules: null,
      ram_capacity_gb: null,
      ram_speed_mhz: null,
      storage_interface: null,
      storage_capacity_gb: null,
      performance_score: null,
      notes: null,
      ...spec,
    },
  } as unknown as PcComponent;
}

const cpu = (overrides: Partial<PcComponentSpec> = {}) =>
  component("cpu", "cpu", { socket: "AM5", tdp_watt: 105, cores: 8, ...overrides });
const motherboard = (overrides: Partial<PcComponentSpec> = {}) =>
  component("motherboard", "motherboard", {
    socket: "AM5",
    memory_type: "DDR5",
    memory_slots: 4,
    max_memory_gb: 128,
    form_factor: "ATX",
    m2_slots: 2,
    sata_ports: 4,
    ...overrides,
  });
const ram = (overrides: Partial<PcComponentSpec> = {}) =>
  component("ram", "ram", {
    memory_type: "DDR5",
    ram_modules: 2,
    ram_capacity_gb: 32,
    ...overrides,
  });
const storage = (overrides: Partial<PcComponentSpec> = {}) =>
  component("storage", "storage", { storage_interface: "NVMe PCIe 4.0", ...overrides });
const gpu = (overrides: Partial<PcComponentSpec> = {}) =>
  component("gpu", "gpu", {
    gpu_length_mm: 300,
    gpu_tdp: 300,
    gpu_power_connectors: "2 x 8-pin",
    ...overrides,
  });
const psu = (overrides: Partial<PcComponentSpec> = {}) =>
  component("psu", "psu", {
    wattage: 750,
    pcie_8pin_connectors: 2,
    pcie_16pin_connectors: 1,
    ...overrides,
  });
const pcCase = (overrides: Partial<PcComponentSpec> = {}) =>
  component("case", "case", {
    supported_form_factors: ["ATX", "mATX"],
    max_gpu_length_mm: 360,
    max_cooler_height_mm: 170,
    fan_mount_sizes: ["120mm", "140mm"],
    ...overrides,
  });
const cooler = (overrides: Partial<PcComponentSpec> = {}) =>
  component("cooler", "cooler", {
    cooler_sockets: ["AM5", "AM4"],
    cooler_height_mm: 150,
    cooler_tdp_rating: 200,
    ...overrides,
  });

function findCheck(result: ReturnType<typeof checkCompatibility>, id: string) {
  return result.checks.find((check) => check.id === id);
}

const fullBuild = () => ({
  cpu: cpu(),
  motherboard: motherboard(),
  ram: ram(),
  storage: storage(),
  gpu: gpu(),
  psu: psu(),
  case: pcCase(),
  cooler: cooler(),
});

describe("checkCompatibility", () => {
  it("marks a coherent AM5 build as compatible", () => {
    const result = checkCompatibility(fullBuild());
    expect(result.status).toBe("compatible");
    expect(result.checks.every((check) => check.status === "compatible")).toBe(true);
    expect(findCheck(result, "cpu-mb-socket")?.detail).toContain("AM5");
  });

  it("detects a CPU socket mismatch", () => {
    const result = checkCompatibility({
      ...fullBuild(),
      motherboard: motherboard({ socket: "LGA1700" }),
    });
    expect(result.status).toBe("incompatible");
    expect(findCheck(result, "cpu-mb-socket")?.status).toBe("incompatible");
  });

  it("detects a DDR4/DDR5 memory mismatch", () => {
    const result = checkCompatibility({
      ...fullBuild(),
      ram: ram({ memory_type: "DDR4" }),
    });
    expect(result.status).toBe("incompatible");
    expect(findCheck(result, "mb-ram-type")?.status).toBe("incompatible");
  });

  it("warns when the memory kit exceeds the board's rated capacity", () => {
    const result = checkCompatibility({
      ...fullBuild(),
      motherboard: motherboard({ max_memory_gb: 64 }),
      ram: ram({ ram_capacity_gb: 128 }),
    });
    expect(findCheck(result, "mb-ram-capacity")?.status).toBe("warning");
    expect(result.status).toBe("warning");
  });

  it("detects a graphics card that is too long for the case", () => {
    const result = checkCompatibility({
      ...fullBuild(),
      gpu: gpu({ gpu_length_mm: 420 }),
    });
    expect(result.status).toBe("incompatible");
    expect(findCheck(result, "gpu-case-length")?.status).toBe("incompatible");
  });

  it("flags an underpowered PSU and accepts a PSU with headroom", () => {
    const underpowered = checkCompatibility({
      ...fullBuild(),
      psu: psu({ wattage: 450 }),
    });
    expect(findCheck(underpowered, "psu-wattage")?.status).toBe("incompatible");
    expect(underpowered.status).toBe("incompatible");

    const headroom = checkCompatibility(fullBuild());
    expect(findCheck(headroom, "psu-wattage")?.status).toBe("compatible");
  });

  it("warns when the PSU works but lacks recommended headroom", () => {
    const result = checkCompatibility({
      ...fullBuild(),
      psu: psu({ wattage: 550 }),
    });
    expect(findCheck(result, "psu-wattage")?.status).toBe("warning");
    expect(result.status).toBe("warning");
  });

  it("detects missing GPU power connectors", () => {
    const result = checkCompatibility({
      ...fullBuild(),
      psu: psu({ pcie_8pin_connectors: 1 }),
    });
    expect(findCheck(result, "gpu-psu-connectors")?.status).toBe("incompatible");
  });

  it("detects a cooler that does not support the CPU socket", () => {
    const result = checkCompatibility({
      ...fullBuild(),
      cooler: cooler({ cooler_sockets: ["LGA1700"] }),
    });
    expect(findCheck(result, "cpu-cooler-socket")?.status).toBe("incompatible");
  });

  it("reports incomplete specifications as unknown instead of compatible", () => {
    const result = checkCompatibility({
      cpu: cpu({ socket: null }),
      motherboard: motherboard(),
    });
    expect(findCheck(result, "cpu-mb-socket")?.status).toBe("unknown");
    expect(result.status).toBe("unknown");
  });

  it("lists missing component types in build order", () => {
    const result = checkCompatibility({
      cpu: cpu(),
      motherboard: motherboard(),
    });
    expect(result.missing).toEqual(["gpu", "ram", "storage", "psu", "case", "cooler", "case_fan"]);
  });

  it("estimates wattage and recommended PSU size", () => {
    const result = checkCompatibility(fullBuild());
    expect(result.estimatedWattage).toBe(105 + 300 + 90);
    expect(result.recommendedWattage).toBe(650);
  });
});

describe("buildTotal", () => {
  it("sums effective component prices and uses discounts", () => {
    const a = component("a", "cpu", {}, 2_000_000);
    const b = { ...component("b", "gpu", {}, 5_000_000), discount_price: 4_500_000 };
    expect(buildTotal({ cpu: a, gpu: b })).toBe(6_500_000);
  });

  it("ignores empty slots", () => {
    expect(buildTotal({})).toBe(0);
  });
});

describe("recommendBuild", () => {
  function catalog() {
    return [
      cpu(),
      motherboard(),
      ram(),
      storage(),
      gpu(),
      psu(),
      pcCase(),
      cooler(),
      component("fan", "case_fan", { notes: "120mm PWM fan" }),
    ];
  }

  it("returns a compatible build within budget", () => {
    const result = recommendBuild(catalog(), 10_000_000, "gaming");
    expect(result.total).toBeLessThanOrEqual(10_000_000);
    expect(result.overBudget).toBe(false);
    expect(result.selection.cpu?.id).toBe("cpu");
    expect(result.selection.motherboard?.id).toBe("motherboard");
    expect(checkCompatibility(result.selection).status).not.toBe("incompatible");
  });

  it("respects a tighter budget and reports anything that does not fit", () => {
    const result = recommendBuild(catalog(), 2_500_000, "office");
    expect(result.total).toBeLessThanOrEqual(2_500_000);
    expect(result.overBudget).toBe(false);
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("skips components without stock", () => {
    const result = recommendBuild(
      catalog().map((item) => (item.id === "gpu" ? { ...item, inventory: { ...item.inventory!, stock: 0 } } : item)),
      10_000_000,
      "gaming",
    );
    expect(result.selection.gpu).toBeUndefined();
    expect(result.messages.some((message) => message.includes("Graphics"))).toBe(true);
  });

  it("never selects a component over the remaining budget", () => {
    const result = recommendBuild(catalog(), 3_000_000, "office");
    const total = buildTotal(result.selection);
    expect(total).toBeLessThanOrEqual(3_000_000);
    expect(result.overBudget).toBe(false);
  });
});
