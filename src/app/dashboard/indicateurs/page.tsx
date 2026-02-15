"use client";

import React from "react";
import { TabIndicateurs } from "@/components/tabs/TabIndicateurs";
import { BarChartIcon } from "@/components/icons";

export default function IndicateursPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChartIcon size={28} className="text-[var(--accent)]" />
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-tight">
          Indicateurs & Tendances
        </h1>
      </div>
      <TabIndicateurs />
    </div>
  );
}
