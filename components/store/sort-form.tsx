"use client";

import { useRouter } from "next/navigation";

import { Select } from "@/components/ui/input";

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "popular", label: "Best selling" },
];

export function SortForm({
  basePath,
  current,
  value,
}: {
  basePath: string;
  current: Record<string, string | string[] | undefined>;
  value: string;
}) {
  const router = useRouter();

  function update(next: string) {
    const params = new URLSearchParams();
    for (const [key, raw] of Object.entries(current)) {
      if (key === "sort" || key === "page" || raw == null) continue;
      if (Array.isArray(raw)) raw.forEach((item) => params.append(key, item));
      else params.set(key, raw);
    }
    if (next && next !== "featured") params.set("sort", next);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <Select
      aria-label="Sort products"
      value={value}
      onChange={(event) => update(event.target.value)}
      className="h-10 w-auto min-w-44 text-[13px]"
    >
      {sorts.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
