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
      className={`bg-transparent border border-dashed border-brd rounded-md px-5 py-2 cursor-pointer flex items-center gap-1.5 text-mut text-[11px] font-inherit hover:border-accent hover:text-accent transition-colors ${className}`}
    >
      <PlusIcon size={14} />
      <span>{label}</span>
    </button>
  );
};
