"use client";

import React from "react";
import { TabEquipements } from "@/components/tabs/TabEquipements";
import { ToolIcon } from "@/components/icons";

export default function EquipementsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ToolIcon size={28} className="text-[var(--accent)]" />
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">
          Équipements & Métrologie
        </h1>
      </div>

      {/* Tab Component */}
      <TabEquipements />
    </div>
  );
}
