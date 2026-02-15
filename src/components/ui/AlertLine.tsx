"use client";

import React from "react";

export type AlertSeverity = "red" | "amber";

export interface AlertLineProps {
  severity: AlertSeverity;
  message: string;
  href?: string;
  className?: string;
}

export const AlertLine: React.FC<AlertLineProps> = ({
  severity,
  message,
  href,
  className = "",
}) => {
  const borderColor = severity === "red" ? "border-l-red" : "border-l-amb";
  const dotColor = severity === "red" ? "bg-red" : "bg-amb";

  const content = (
    <div
      className={`bg-card border border-brd rounded-md border-l-[3px] ${borderColor} p-2.5 px-3.5 flex items-center gap-2.5 transition-colors duration-200 ${
        href ? "cursor-pointer hover:bg-elev" : ""
      } ${className}`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
      <span className="text-[12px] flex-1">{message}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="no-underline">
        {content}
      </a>
    );
  }

  return content;
};
