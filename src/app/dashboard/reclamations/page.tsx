"use client";

import React from "react";
import { TabReclamations } from "@/components/tabs/TabReclamations";
import { MsgIcon } from "@/components/icons";

export default function ReclamationsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <MsgIcon size={28} className="text-accent" />
        <h1 className="text-h1">Réclamations & Satisfaction</h1>
      </div>
      <TabReclamations />
    </div>
  );
}
