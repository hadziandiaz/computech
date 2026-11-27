"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()} size="sm" className="print:hidden">
      <Printer /> Cetak / Simpan PDF
    </Button>
  );
}
