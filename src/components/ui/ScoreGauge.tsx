"use client";

import React from "react";

export interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 44,
  label,
  className = "",
}) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashArray = (normalizedScore / 100) * circumference;

  let strokeColor = "var(--grn)";
  if (normalizedScore < 50) {
    strokeColor = "var(--red)";
  } else if (normalizedScore < 75) {
    strokeColor = "var(--amb)";
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--elev)"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeDasharray={`${dashArray} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition: "stroke-dasharray 0.4s" }}
        />
        <text
          x="22"
          y="26"
          textAnchor="middle"
          fill="var(--text)"
          fontSize="12"
          fontWeight="700"
          fontFamily="var(--font)"
        >
          {Math.round(normalizedScore)}
        </text>
      </svg>
      {label && (
        <div className="text-[9px] text-mut mt-1">
          {label}
        </div>
      )}
    </div>
  );
};
