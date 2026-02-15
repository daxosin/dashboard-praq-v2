"use client";

import React from "react";
import TabVigilances from "@/components/tabs/TabVigilances";
import { ShieldIcon } from "@/components/icons";

export default function VigilancesPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 px-8 pt-6">
        <ShieldIcon size={28} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}>
          Vigilances
        </h1>
      </div>
      <TabVigilances />
    </div>
  );
}
