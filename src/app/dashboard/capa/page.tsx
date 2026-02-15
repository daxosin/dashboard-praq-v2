"use client";

import React from "react";
import { TabCapa } from "@/components/tabs/TabCapa";
import { ZapIcon } from "@/components/icons";

export default function CapaPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ZapIcon size={28} className="text-[var(--accent)]" />
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">
          CAPA & Non-conformités
        </h1>
      </div>

      {/* Tab Content */}
      <TabCapa />
    </div>
  );
}
