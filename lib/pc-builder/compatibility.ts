import {
  pcComponentLabels,
  pcComponentOrder,
} from "@/lib/constants";
import { productUnitPrice } from "@/lib/pricing";
import type {
  CompatibilityStatus,
  PcComponentSpec,
  PcComponentType,
  PcUsage,
  Product,
} from "@/types/domain";

export type PcComponent = Pick<Product, "id" | "name" | "price" | "discount_price" | "images" | "brand" | "inventory" | "pc_spec" | "slug" | "sku">;

export type BuilderSelection = Partial<Record<PcComponentType, PcComponent>>;

export interface CompatibilityCheck {
  id: string;
  label: string;
  status: CompatibilityStatus;
  detail: string;
  components: PcComponentType[];
}

export interface CompatibilityResult {
  status: CompatibilityStatus;
  checks: CompatibilityCheck[];
  missing: PcComponentType[];
  estimatedWattage: number;
  recommendedWattage: number;
}

function specOf(component: PcComponent | undefined): PcComponentSpec | null {
  return component?.pc_spec ?? null;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function includesNormalized(list: string[] | null | undefined, value: string | null | undefined) {
  if (!list || !value) return false;
  return list.map(normalize).includes(normalize(value));
}

function parsePcieNeeds(connector: string | null | undefined) {
  const value = normalize(connector);
  const countMatch = value.match(/(\d+)\s*x/);
  const count = countMatch ? Number(countMatch[1]) : 1;
  if (value.includes("16")) return { type: "16pin" as const, count };
  if (value.includes("8")) return { type: "8pin" as const, count };
  return null;
}

export function checkCompatibility(selection: BuilderSelection): CompatibilityResult {
  const checks: CompatibilityCheck[] = [];

  const cpu = selection.cpu;
  const motherboard = selection.motherboard;
  const ram = selection.ram;
  const storage = selection.storage;
  const gpu = selection.gpu;
  const psu = selection.psu;
  const pcCase = selection.case;
  const cooler = selection.cooler;
  const caseFan = selection.case_fan;

  const cpuSpec = specOf(cpu);
  const mbSpec = specOf(motherboard);
  const ramSpec = specOf(ram);
  const storageSpec = specOf(storage);
  const gpuSpec = specOf(gpu);
  const psuSpec = specOf(psu);
  const caseSpec = specOf(pcCase);
  const coolerSpec = specOf(cooler);
  const fanSpec = specOf(caseFan);

  if (cpu && motherboard) {
    if (!cpuSpec?.socket || !mbSpec?.socket) {
      checks.push({
        id: "cpu-mb-socket",
        label: "CPU socket ↔ motherboard",
        status: "unknown",
        detail: "Socket data is incomplete for one of these components.",
        components: ["cpu", "motherboard"],
      });
    } else if (normalize(cpuSpec.socket) !== normalize(mbSpec.socket)) {
      checks.push({
        id: "cpu-mb-socket",
        label: "CPU socket ↔ motherboard",
        status: "incompatible",
        detail: `${cpu.name} uses ${cpuSpec.socket}, but ${motherboard.name} has a ${mbSpec.socket} socket.`,
        components: ["cpu", "motherboard"],
      });
    } else {
      checks.push({
        id: "cpu-mb-socket",
        label: "CPU socket ↔ motherboard",
        status: "compatible",
        detail: `Both components use the ${cpuSpec.socket} socket.`,
        components: ["cpu", "motherboard"],
      });
    }
  }

  if (motherboard && ram) {
    if (!mbSpec?.memory_type || !ramSpec?.memory_type) {
      checks.push({
        id: "mb-ram-type",
        label: "Memory generation",
        status: "unknown",
        detail: "Memory type data is incomplete.",
        components: ["motherboard", "ram"],
      });
    } else if (normalize(mbSpec.memory_type) !== normalize(ramSpec.memory_type)) {
      checks.push({
        id: "mb-ram-type",
        label: "Memory generation",
        status: "incompatible",
        detail: `Motherboard supports ${mbSpec.memory_type}, but this memory kit is ${ramSpec.memory_type}.`,
        components: ["motherboard", "ram"],
      });
    } else {
      checks.push({
        id: "mb-ram-type",
        label: "Memory generation",
        status: "compatible",
        detail: `Both support ${mbSpec.memory_type}.`,
        components: ["motherboard", "ram"],
      });
    }

    if (mbSpec?.memory_slots != null && ramSpec?.ram_modules != null) {
      if (ramSpec.ram_modules > mbSpec.memory_slots) {
        checks.push({
          id: "mb-ram-slots",
          label: "Memory slots",
          status: "incompatible",
          detail: `This kit needs ${ramSpec.ram_modules} slots, but the motherboard has ${mbSpec.memory_slots}.`,
          components: ["motherboard", "ram"],
        });
      } else {
        checks.push({
          id: "mb-ram-slots",
          label: "Memory slots",
          status: "compatible",
          detail: `${ramSpec.ram_modules} of ${mbSpec.memory_slots} slots used.`,
          components: ["motherboard", "ram"],
        });
      }
    }

    if (
      mbSpec?.max_memory_gb != null &&
      ramSpec?.ram_capacity_gb != null &&
      ramSpec.ram_capacity_gb > mbSpec.max_memory_gb
    ) {
      checks.push({
        id: "mb-ram-capacity",
        label: "Memory capacity",
        status: "warning",
        detail: `The kit's ${ramSpec.ram_capacity_gb} GB exceeds the board's rated ${mbSpec.max_memory_gb} GB.`,
        components: ["motherboard", "ram"],
      });
    }
  }

  if (motherboard && storage) {
    const iface = normalize(storageSpec?.storage_interface);
    if (!iface || !mbSpec) {
      checks.push({
        id: "mb-storage",
        label: "Storage interface",
        status: "unknown",
        detail: "Storage interface data is incomplete.",
        components: ["motherboard", "storage"],
      });
    } else if (iface.includes("m.2") || iface.includes("nvme")) {
      if (mbSpec.m2_slots == null) {
        checks.push({
          id: "mb-storage",
          label: "Storage interface",
          status: "unknown",
          detail: "Motherboard M.2 slot count is not recorded.",
          components: ["motherboard", "storage"],
        });
      } else if (mbSpec.m2_slots < 1) {
        checks.push({
          id: "mb-storage",
          label: "Storage interface",
          status: "incompatible",
          detail: "This motherboard does not expose an M.2 slot.",
          components: ["motherboard", "storage"],
        });
      } else {
        checks.push({
          id: "mb-storage",
          label: "Storage interface",
          status: "compatible",
          detail: `M.2 NVMe supported (${mbSpec.m2_slots} slot${mbSpec.m2_slots > 1 ? "s" : ""}).`,
          components: ["motherboard", "storage"],
        });
      }
    } else if (iface.includes("sata")) {
      if (mbSpec.sata_ports == null) {
        checks.push({
          id: "mb-storage",
          label: "Storage interface",
          status: "unknown",
          detail: "Motherboard SATA port count is not recorded.",
          components: ["motherboard", "storage"],
        });
      } else if (mbSpec.sata_ports < 1) {
        checks.push({
          id: "mb-storage",
          label: "Storage interface",
          status: "incompatible",
          detail: "This motherboard has no free SATA ports.",
          components: ["motherboard", "storage"],
        });
      } else {
        checks.push({
          id: "mb-storage",
          label: "Storage interface",
          status: "compatible",
          detail: `SATA supported (${mbSpec.sata_ports} ports).`,
          components: ["motherboard", "storage"],
        });
      }
    } else {
      checks.push({
        id: "mb-storage",
        label: "Storage interface",
        status: "unknown",
        detail: "Unrecognised storage interface.",
        components: ["motherboard", "storage"],
      });
    }
  }

  if (motherboard && pcCase) {
    if (!mbSpec?.form_factor || !caseSpec?.supported_form_factors?.length) {
      checks.push({
        id: "mb-case-form",
        label: "Motherboard form factor ↔ case",
        status: "unknown",
        detail: "Form factor support data is incomplete.",
        components: ["motherboard", "case"],
      });
    } else if (!includesNormalized(caseSpec.supported_form_factors, mbSpec.form_factor)) {
      checks.push({
        id: "mb-case-form",
        label: "Motherboard form factor ↔ case",
        status: "incompatible",
        detail: `${pcCase.name} does not list ${mbSpec.form_factor} support.`,
        components: ["motherboard", "case"],
      });
    } else {
      checks.push({
        id: "mb-case-form",
        label: "Motherboard form factor ↔ case",
        status: "compatible",
        detail: `${mbSpec.form_factor} is supported by the case.`,
        components: ["motherboard", "case"],
      });
    }
  }

  if (gpu && pcCase) {
    if (gpuSpec?.gpu_length_mm == null || caseSpec?.max_gpu_length_mm == null) {
      checks.push({
        id: "gpu-case-length",
        label: "Graphics card clearance",
        status: "unknown",
        detail: "GPU length or case clearance is not recorded.",
        components: ["gpu", "case"],
      });
    } else if (gpuSpec.gpu_length_mm > caseSpec.max_gpu_length_mm) {
      checks.push({
        id: "gpu-case-length",
        label: "Graphics card clearance",
        status: "incompatible",
        detail: `GPU is ${gpuSpec.gpu_length_mm} mm; the case fits up to ${caseSpec.max_gpu_length_mm} mm.`,
        components: ["gpu", "case"],
      });
    } else {
      checks.push({
        id: "gpu-case-length",
        label: "Graphics card clearance",
        status: "compatible",
        detail: `${gpuSpec.gpu_length_mm} mm GPU fits the case (${caseSpec.max_gpu_length_mm} mm max).`,
        components: ["gpu", "case"],
      });
    }
  }

  if (psu) {
    const estimated =
      (cpuSpec?.tdp_watt ?? 0) + (gpuSpec?.gpu_tdp ?? 0) + 90;
    if (psuSpec?.wattage == null) {
      checks.push({
        id: "psu-wattage",
        label: "Power supply capacity",
        status: "unknown",
        detail: "PSU wattage is not recorded.",
        components: ["psu"],
      });
    } else {
      const recommended = Math.ceil((estimated * 1.25) / 50) * 50;
      if (psuSpec.wattage < estimated) {
        checks.push({
          id: "psu-wattage",
          label: "Power supply capacity",
          status: "incompatible",
          detail: `${psuSpec.wattage} W is below the estimated ${estimated} W system load.`,
          components: ["psu"],
        });
      } else if (psuSpec.wattage < recommended) {
        checks.push({
          id: "psu-wattage",
          label: "Power supply capacity",
          status: "warning",
          detail: `${psuSpec.wattage} W works, but ${recommended} W is recommended for headroom.`,
          components: ["psu"],
        });
      } else {
        checks.push({
          id: "psu-wattage",
          label: "Power supply capacity",
          status: "compatible",
          detail: `${psuSpec.wattage} W covers the estimated ${estimated} W load with headroom.`,
          components: ["psu"],
        });
      }
    }
  }

  if (gpu && psu) {
    const need = parsePcieNeeds(gpuSpec?.gpu_power_connectors);
    const available8 = psuSpec?.pcie_8pin_connectors ?? 0;
    const available16 = psuSpec?.pcie_16pin_connectors ?? 0;
    if (!need) {
      checks.push({
        id: "gpu-psu-connectors",
        label: "GPU power connectors",
        status: "unknown",
        detail: "GPU power connector data is incomplete.",
        components: ["gpu", "psu"],
      });
    } else {
      const available = need.type === "16pin" ? available16 : available8;
      if (available < need.count) {
        checks.push({
          id: "gpu-psu-connectors",
          label: "GPU power connectors",
          status: "incompatible",
          detail: `GPU needs ${need.count}× ${need.type}; PSU provides ${available}.`,
          components: ["gpu", "psu"],
        });
      } else {
        checks.push({
          id: "gpu-psu-connectors",
          label: "GPU power connectors",
          status: "compatible",
          detail: `${available}× ${need.type} available.`,
          components: ["gpu", "psu"],
        });
      }
    }
  }

  if (cpu && cooler) {
    if (!cpuSpec?.socket || !coolerSpec?.cooler_sockets?.length) {
      checks.push({
        id: "cpu-cooler-socket",
        label: "Cooler socket support",
        status: "unknown",
        detail: "Cooler socket support is not recorded.",
        components: ["cpu", "cooler"],
      });
    } else if (!includesNormalized(coolerSpec.cooler_sockets, cpuSpec.socket)) {
      checks.push({
        id: "cpu-cooler-socket",
        label: "Cooler socket support",
        status: "incompatible",
        detail: `The cooler does not list ${cpuSpec.socket} support.`,
        components: ["cpu", "cooler"],
      });
    } else {
      checks.push({
        id: "cpu-cooler-socket",
        label: "Cooler socket support",
        status: "compatible",
        detail: `Cooler mounts on ${cpuSpec.socket}.`,
        components: ["cpu", "cooler"],
      });
    }

    if (
      cpuSpec?.tdp_watt != null &&
      coolerSpec?.cooler_tdp_rating != null &&
      coolerSpec.cooler_tdp_rating < cpuSpec.tdp_watt
    ) {
      checks.push({
        id: "cooler-capacity",
        label: "Cooler thermal capacity",
        status: "warning",
        detail: `Cooler is rated for ${coolerSpec.cooler_tdp_rating} W; CPU TDP is ${cpuSpec.tdp_watt} W.`,
        components: ["cpu", "cooler"],
      });
    }
  }

  if (cooler && pcCase) {
    if (coolerSpec?.cooler_height_mm == null || caseSpec?.max_cooler_height_mm == null) {
      checks.push({
        id: "cooler-case-clearance",
        label: "Cooler clearance",
        status: "unknown",
        detail: "Cooler height or case clearance is not recorded.",
        components: ["cooler", "case"],
      });
    } else if (coolerSpec.cooler_height_mm > caseSpec.max_cooler_height_mm) {
      checks.push({
        id: "cooler-case-clearance",
        label: "Cooler clearance",
        status: "incompatible",
        detail: `Cooler is ${coolerSpec.cooler_height_mm} mm; the case fits ${caseSpec.max_cooler_height_mm} mm.`,
        components: ["cooler", "case"],
      });
    } else {
      checks.push({
        id: "cooler-case-clearance",
        label: "Cooler clearance",
        status: "compatible",
        detail: `Cooler height fits the case.`,
        components: ["cooler", "case"],
      });
    }
  }

  if (caseFan && pcCase) {
    const supported = caseSpec?.fan_mount_sizes;
    if (!fanSpec || !supported?.length) {
      checks.push({
        id: "fan-case-size",
        label: "Case fan mounts",
        status: "unknown",
        detail: "Fan mount sizes are not recorded.",
        components: ["case_fan", "case"],
      });
    } else {
      const fanSize = fanSpec.notes?.match(/\d{3}/)?.[0];
      if (!fanSize) {
        checks.push({
          id: "fan-case-size",
          label: "Case fan mounts",
          status: "unknown",
          detail: "Fan size is not recorded in its specifications.",
          components: ["case_fan", "case"],
        });
      } else if (!supported.map(normalize).includes(`${fanSize}mm`)) {
        checks.push({
          id: "fan-case-size",
          label: "Case fan mounts",
          status: "warning",
          detail: `Case lists ${supported.join(", ")} mounts; verify ${fanSize} mm support.`,
          components: ["case_fan", "case"],
        });
      } else {
        checks.push({
          id: "fan-case-size",
          label: "Case fan mounts",
          status: "compatible",
          detail: `${fanSize} mm mounts available.`,
          components: ["case_fan", "case"],
        });
      }
    }
  }

  const missing = pcComponentOrder.filter((type) => !selection[type]);
  const hasIncompatible = checks.some((c) => c.status === "incompatible");
  const hasWarning = checks.some((c) => c.status === "warning");
  const hasUnknown = checks.some((c) => c.status === "unknown");

  const status: CompatibilityStatus = hasIncompatible
    ? "incompatible"
    : hasWarning
      ? "warning"
      : hasUnknown
        ? "unknown"
        : "compatible";

  const estimatedWattage =
    (cpuSpec?.tdp_watt ?? 0) + (gpuSpec?.gpu_tdp ?? 0) + 90;
  const recommendedWattage = Math.ceil((estimatedWattage * 1.25) / 50) * 50;

  return {
    status,
    checks,
    missing,
    estimatedWattage,
    recommendedWattage,
  };
}

export function buildTotal(selection: BuilderSelection) {
  return Object.values(selection).reduce(
    (sum, component) => sum + (component ? productUnitPrice(component) : 0),
    0,
  );
}

const usageAllocations: Record<PcUsage, Partial<Record<PcComponentType, number>>> = {
  office: {
    cpu: 0.24,
    motherboard: 0.16,
    gpu: 0.04,
    ram: 0.1,
    storage: 0.12,
    psu: 0.1,
    case: 0.12,
    cooler: 0.07,
    case_fan: 0.05,
  },
  programming: {
    cpu: 0.27,
    motherboard: 0.14,
    gpu: 0.1,
    ram: 0.15,
    storage: 0.14,
    psu: 0.08,
    case: 0.07,
    cooler: 0.05,
  },
  gaming: {
    cpu: 0.2,
    motherboard: 0.11,
    gpu: 0.37,
    ram: 0.09,
    storage: 0.09,
    psu: 0.07,
    case: 0.04,
    cooler: 0.03,
  },
  video_editing: {
    cpu: 0.24,
    motherboard: 0.1,
    gpu: 0.28,
    ram: 0.12,
    storage: 0.14,
    psu: 0.06,
    case: 0.03,
    cooler: 0.03,
  },
  graphic_design: {
    cpu: 0.2,
    motherboard: 0.1,
    gpu: 0.3,
    ram: 0.1,
    storage: 0.1,
    psu: 0.07,
    case: 0.07,
    cooler: 0.06,
  },
  rendering: {
    cpu: 0.32,
    motherboard: 0.11,
    gpu: 0.26,
    ram: 0.14,
    storage: 0.08,
    psu: 0.05,
    cooler: 0.04,
  },
  streaming: {
    cpu: 0.24,
    motherboard: 0.1,
    gpu: 0.3,
    ram: 0.1,
    storage: 0.09,
    psu: 0.06,
    case: 0.05,
    cooler: 0.03,
    case_fan: 0.03,
  },
};

function performanceScore(component: PcComponent) {
  return (
    component.pc_spec?.performance_score ??
    (component.pc_spec?.cores ?? 0) * 10 +
      (component.pc_spec?.wattage ?? 0) / 10
  );
}

export interface RecommendationResult {
  selection: BuilderSelection;
  total: number;
  overBudget: boolean;
  messages: string[];
}

export function recommendBuild(
  components: PcComponent[],
  budget: number,
  usage: PcUsage,
): RecommendationResult {
  const available = components.filter(
    (component) =>
      component.pc_spec &&
      (component.inventory?.stock ?? 0) > 0 &&
      productUnitPrice(component) > 0,
  );
  const allocation = usageAllocations[usage] ?? usageAllocations.gaming;
  const selection: BuilderSelection = {};
  const messages: string[] = [];

  const byType = new Map<PcComponentType, PcComponent[]>();
  for (const component of available) {
    const type = component.pc_spec?.component_type;
    if (!type) continue;
    const list = byType.get(type) ?? [];
    list.push(component);
    byType.set(type, list);
  }
  for (const list of byType.values()) {
    list.sort((a, b) => {
      const scoreDiff = performanceScore(b) - performanceScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return productUnitPrice(a) - productUnitPrice(b);
    });
  }

  let spent = 0;
  for (const type of pcComponentOrder) {
    const candidates = byType.get(type);
    if (!candidates?.length) {
      messages.push(
        `${pcComponentLabels[type]} is not available in the live catalog.`,
      );
      continue;
    }
    const share = allocation[type] ?? 0;
    const cap = Math.max(0, budget * share);
    const remaining = budget - spent;
    let chosen: PcComponent | null = null;

    for (const candidate of candidates) {
      const price = productUnitPrice(candidate);
      if (price > remaining) continue;
      if (share === 0) continue;
      if (price <= cap * 1.18) {
        const trial: BuilderSelection = { ...selection, [type]: candidate };
        const compatibility = checkCompatibility(trial);
        if (compatibility.status !== "incompatible") {
          chosen = candidate;
          break;
        }
      }
    }

    if (!chosen) {
      for (const candidate of candidates) {
        const price = productUnitPrice(candidate);
        if (price > remaining) continue;
        const trial: BuilderSelection = { ...selection, [type]: candidate };
        if (checkCompatibility(trial).status !== "incompatible") {
          chosen = candidate;
          break;
        }
      }
    }

    if (chosen) {
      selection[type] = chosen;
      spent += productUnitPrice(chosen);
    } else {
      messages.push(`No ${pcComponentLabels[type]} fits the remaining budget.`);
    }
  }

  const total = buildTotal(selection);
  return {
    selection,
    total,
    overBudget: total > budget,
    messages,
  };
}
