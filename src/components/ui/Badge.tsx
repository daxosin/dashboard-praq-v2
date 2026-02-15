"use client";

import React from "react";

export type BadgeVariant = "ok" | "wip" | "plan" | "crit";

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = "" }) => {
  const baseClasses = "inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap";

  const variantClasses: Record<BadgeVariant, string> = {
    ok: "bg-grn text-bg",
    wip: "bg-amb text-white",
    plan: "bg-badge-plan-bg text-badge-plan-c",
    crit: "bg-red text-white",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
