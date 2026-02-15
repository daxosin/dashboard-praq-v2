"use client";

import { TabDocuments } from "@/components/tabs/TabDocuments";
import { DocIcon } from "@/components/icons";

export default function DocumentsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <DocIcon size={28} className="text-accent" />
        <h1 className="text-[28px] font-bold text-text tracking-tight">
          Documents & SOPs
        </h1>
      </div>
      <TabDocuments />
    </div>
  );
}
