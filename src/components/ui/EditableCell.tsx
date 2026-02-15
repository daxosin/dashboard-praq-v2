"use client";

import React, { useState, useRef, useEffect } from "react";

export type EditableCellType = "text" | "number" | "date" | "select";

export interface EditableCellProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  type?: EditableCellType;
  options?: Array<{ value: string | number; label: string }>;
  className?: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = "text",
  options = [],
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const finalValue = type === "number" ? Number(editValue) : editValue;
    if (finalValue !== value) {
      onSave(finalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(String(value));
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`cursor-pointer hover:bg-elev px-3 py-1.5 rounded-lg transition-colors ${className}`}
      >
        {type === "select" && options.length > 0
          ? options.find((opt) => opt.value === value)?.label || value
          : value}
      </div>
    );
  }

  if (type === "select" && options.length > 0) {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-card text-text border border-brd rounded-lg px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={type === "number" ? "number" : type === "date" ? "date" : "text"}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`bg-card text-text border border-brd rounded-lg px-3 py-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all ${className}`}
    />
  );
};
