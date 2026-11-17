import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { savePcSpecAction } from "@/lib/actions/admin/catalog";
import { pcComponentLabels, pcComponentOrder } from "@/lib/constants";
import type { PcComponentSpec, PcComponentType } from "@/types/domain";

const numericFields: Array<{ name: keyof PcComponentSpec; label: string; hint?: string }> = [
  { name: "tdp_watt", label: "CPU TDP (W)" },
  { name: "cores", label: "CPU cores" },
  { name: "memory_slots", label: "Memory slots" },
  { name: "max_memory_gb", label: "Max memory (GB)" },
  { name: "m2_slots", label: "M.2 slots" },
  { name: "sata_ports", label: "SATA ports" },
  { name: "gpu_length_mm", label: "GPU length (mm)" },
  { name: "gpu_tdp", label: "GPU TDP (W)" },
  { name: "recommended_psu_watt", label: "Recommended PSU (W)" },
  { name: "wattage", label: "PSU wattage (W)" },
  { name: "pcie_8pin_connectors", label: "PCIe 8-pin connectors" },
  { name: "pcie_16pin_connectors", label: "PCIe 16-pin connectors" },
  { name: "max_gpu_length_mm", label: "Case max GPU length (mm)" },
  { name: "max_cooler_height_mm", label: "Case max cooler height (mm)" },
  { name: "cooler_height_mm", label: "Cooler height (mm)" },
  { name: "cooler_tdp_rating", label: "Cooler TDP rating (W)" },
  { name: "ram_modules", label: "RAM modules" },
  { name: "ram_capacity_gb", label: "RAM capacity (GB)" },
  { name: "ram_speed_mhz", label: "RAM speed (MHz)" },
  { name: "storage_capacity_gb", label: "Storage capacity (GB)" },
  {
    name: "performance_score",
    label: "Performance score",
    hint: "0–100, used by PC Builder recommendations.",
  },
];

const arrayFields: Array<{ name: keyof PcComponentSpec; label: string }> = [
  { name: "supported_form_factors", label: "Supported form factors" },
  { name: "fan_mount_sizes", label: "Fan mount sizes" },
  { name: "cooler_sockets", label: "Supported sockets" },
];

export function PcSpecForm({
  productId,
  productName,
  spec,
}: {
  productId: string;
  productName: string;
  spec?: PcComponentSpec | null;
}) {
  return (
    <ActionForm action={savePcSpecAction} className="space-y-4">
      <input type="hidden" name="product_id" value={productId} />
      <p className="text-[11px] text-muted">
        {productName} <span className="font-mono">({productId.slice(0, 8)})</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Component type" htmlFor={`type-${productId}`} required>
          <Select
            id={`type-${productId}`}
            name="component_type"
            defaultValue={spec?.component_type ?? ("cpu" as PcComponentType)}
          >
            {pcComponentOrder.map((type) => (
              <option key={type} value={type}>
                {pcComponentLabels[type]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Socket" htmlFor={`socket-${productId}`} hint="CPU and motherboard.">
          <Input id={`socket-${productId}`} name="socket" defaultValue={spec?.socket ?? ""} />
        </Field>
        <Field label="Chipset" htmlFor={`chipset-${productId}`}>
          <Input id={`chipset-${productId}`} name="chipset" defaultValue={spec?.chipset ?? ""} />
        </Field>
        <Field label="Memory type" htmlFor={`memory-${productId}`} hint="DDR4, DDR5…">
          <Input
            id={`memory-${productId}`}
            name="memory_type"
            defaultValue={spec?.memory_type ?? ""}
          />
        </Field>
        <Field label="Form factor" htmlFor={`form-${productId}`}>
          <Input
            id={`form-${productId}`}
            name="form_factor"
            defaultValue={spec?.form_factor ?? ""}
          />
        </Field>
        <Field label="GPU power connectors" htmlFor={`gpuconn-${productId}`}>
          <Input
            id={`gpuconn-${productId}`}
            name="gpu_power_connectors"
            defaultValue={spec?.gpu_power_connectors ?? ""}
            placeholder="2 x 8-pin"
          />
        </Field>
        <Field label="PSU efficiency" htmlFor={`efficiency-${productId}`}>
          <Input
            id={`efficiency-${productId}`}
            name="efficiency"
            defaultValue={spec?.efficiency ?? ""}
            placeholder="80+ Gold"
          />
        </Field>
        <Field label="Storage interface" htmlFor={`storage-${productId}`}>
          <Input
            id={`storage-${productId}`}
            name="storage_interface"
            defaultValue={spec?.storage_interface ?? ""}
            placeholder="NVMe PCIe 4.0"
          />
        </Field>
        {numericFields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            htmlFor={`${field.name}-${productId}`}
            hint={field.hint}
          >
            <Input
              id={`${field.name}-${productId}`}
              name={field.name}
              type="number"
              min={0}
              step={field.name === "performance_score" ? 0.1 : 1}
              defaultValue={(spec?.[field.name] as number | null | undefined) ?? ""}
            />
          </Field>
        ))}
        {arrayFields.map((field) => {
          const value = spec?.[field.name];
          return (
            <Field
              key={field.name}
              label={field.label}
              htmlFor={`${field.name}-${productId}`}
              hint="Comma separated."
            >
              <Input
                id={`${field.name}-${productId}`}
                name={field.name}
                defaultValue={Array.isArray(value) ? value.join(", ") : ""}
              />
            </Field>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-[12px]">
        <Checkbox name="integrated_graphics" defaultChecked={spec?.integrated_graphics ?? false} />
        Has integrated graphics
      </label>

      <Field label="Notes" htmlFor={`notes-${productId}`}>
        <Textarea
          id={`notes-${productId}`}
          name="notes"
          rows={2}
          defaultValue={spec?.notes ?? ""}
        />
      </Field>

      <SubmitButton size="sm" pendingText="Saving…">
        Save component specs
      </SubmitButton>
    </ActionForm>
  );
}
