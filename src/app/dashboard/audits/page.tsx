"use client";

import React from "react";
import { TabAudits } from "@/components/tabs/TabAudits";
import { SearchIcon } from "@/components/icons";

export default function AuditsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SearchIcon size={28} className="text-[var(--accent)]" />
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-[-0.02em]">Audits</h1>
      </div>
      <TabAudits />
    </div>
  );
}
