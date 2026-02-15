"use client";

import React, { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "../icons";

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const storedTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("theme="))
      ?.split("=")[1];

    const initialTheme = (storedTheme as "dark" | "light") || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;
  };

  return (
    <button
      onClick={toggleTheme}
      className={`bg-card border border-brd rounded-md px-3 py-1.5 cursor-pointer text-text font-inherit text-[12px] flex items-center gap-1.5 hover:bg-elev transition-all duration-200 ${className}`}
      aria-label="Basculer le thème"
    >
      {theme === "dark" ? (
        <SunIcon size={18} className="text-sec" />
      ) : (
        <MoonIcon size={18} className="text-sec" />
      )}
      <span>Mode</span>
    </button>
  );
};
