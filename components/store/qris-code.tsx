"use client";

import { QRCodeSVG } from "qrcode.react";

import { cn } from "@/lib/utils";

export function QrisCode({
  value,
  size = 160,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  if (!value.trim()) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-line bg-white text-[10px] text-muted",
          className,
        )}
        style={{ width: size, height: size }}
      >
        QRIS belum tersedia
      </div>
    );
  }

  return (
    <div
      className={cn("inline-flex shrink-0 rounded-lg border border-line bg-white p-2", className)}
    >
      <QRCodeSVG value={value} size={size} level="M" bgColor="#ffffff" fgColor="#111126" />
    </div>
  );
}
