"use client";

import React from "react";
import TabFormations from "@/components/tabs/TabFormations";
import { UsersIcon } from "@/components/icons";

export default function FormationsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <UsersIcon size={28} className="text-accent" />
        <h1 className="text-h1">Formations & Habilitations</h1>
      </div>
      <TabFormations />
    </div>
  );
}
