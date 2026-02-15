"use client";

import React from "react";
import { TabRisques } from "@/components/tabs/TabRisques";
import { TriangleIcon } from "@/components/icons";

export default function RisquesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <TriangleIcon size={28} className="text-accent" />
        <h1 className="text-[28px] font-bold tracking-tight text-primary">Risques</h1>
      </div>
      <TabRisques />
    </div>
  );
}
