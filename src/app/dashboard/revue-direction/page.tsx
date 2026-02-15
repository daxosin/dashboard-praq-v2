"use client";

import React from "react";
import { TabRevueDirection } from "@/components/tabs/TabRevueDirection";
import { ClipboardIcon } from "@/components/icons";

export default function RevueDirectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardIcon size={28} className="text-[var(--accent)]" />
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-[-0.02em]">
          Revue de direction
        </h1>
      </div>

      <TabRevueDirection />
    </div>
  );
}
