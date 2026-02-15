"use client";

import React from "react";
import { TabTableauDeBord } from "@/components/tabs/TabTableauDeBord";
import { GridIcon } from "@/components/icons";

export default function TableauDeBordPage() {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <GridIcon size={24} className="text-accent" />
        <h1 className="text-[28px] font-bold tracking-tight">
          Tableau de bord
        </h1>
      </div>
      <TabTableauDeBord />
    </div>
  );
}
