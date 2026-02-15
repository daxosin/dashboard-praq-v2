"use client";

import React from "react";
import { PlusIcon } from "../icons";

export interface AddButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  label = "Ajouter",
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`bg-accent text-[#000] border-none rounded-xl px-7 py-3.5 cursor-pointer flex items-center gap-2.5 text-[15px] font-bold shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 ${className}`}
    >
      <PlusIcon size={18} />
      <span>{label}</span>
    </button>
  );
};
