"use client";

import React from "react";

export interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: "default" | "amber";
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  subtitle,
  accent = "default",
  className = "",
}) => {
  const borderColorClass = accent === "amber" ? "border-l-amb" : "border-l-accent";

  return (
    <div
      className={`bg-card border border-brd rounded-md p-4 pl-5 border-l-[3px] ${borderColorClass} min-w-[140px] flex-1 transition-colors duration-200 ${className}`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="text-mut">{icon}</div>
        <span className="text-[10px] text-mut uppercase tracking-[1.2px] font-semibold">
          {label}
        </span>
      </div>
      <div className="text-[30px] font-bold text-text leading-none">
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] text-sec mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};
