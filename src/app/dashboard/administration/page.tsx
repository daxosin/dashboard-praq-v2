"use client";

import React from "react";
import TabAdministration from "@/components/tabs/TabAdministration";
import { SettingsIcon } from "@/components/icons";

export default function AdministrationPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={28} className="text-accent" />
        <h1 className="text-h1">Administration</h1>
      </div>
      <TabAdministration />
    </div>
  );
}
