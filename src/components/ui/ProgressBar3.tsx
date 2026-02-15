"use client";

import React from "react";

export interface ProgressBar3Props {
  green?: number;
  amber?: number;
  total: number;
  className?: string;
}

export const ProgressBar3: React.FC<ProgressBar3Props> = ({
  green = 0,
  amber = 0,
  total,
  className = "",
}) => {
  const greenPercent = total > 0 ? (green / total) * 100 : 0;
  const amberPercent = total > 0 ? (amber / total) * 100 : 0;

  return (
    <div className={`flex h-[6px] rounded-sm overflow-hidden bg-elev ${className}`}>
      {greenPercent > 0 && (
        <div
          className="bg-grn transition-all duration-400"
          style={{ width: `${greenPercent}%` }}
        />
      )}
      {amberPercent > 0 && (
        <div
          className="bg-amb transition-all duration-400"
          style={{ width: `${amberPercent}%` }}
        />
      )}
    </div>
  );
};
