"use client";

import { TabFournisseurs } from "@/components/tabs/TabFournisseurs";
import { TruckIcon } from "@/components/icons";

export default function FournisseursPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <TruckIcon size={28} className="text-[var(--accent)]" />
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">
          Fournisseurs
        </h1>
      </div>
      <TabFournisseurs />
    </div>
  );
}
