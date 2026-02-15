"use client";

import React, { useEffect } from "react";
import { XMarkIcon } from "../icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
      <div
        className={`relative bg-card border border-brd rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-7 py-5 border-b border-brd shrink-0">
            <h3 className="text-[18px] font-semibold text-text">{title}</h3>
            <button
              onClick={onClose}
              className="text-mut hover:text-text transition-colors p-1.5 rounded-lg hover:bg-elev"
              aria-label="Fermer"
            >
              <XMarkIcon size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-mut hover:text-text transition-colors p-1.5 rounded-lg hover:bg-elev z-10"
            aria-label="Fermer"
          >
            <XMarkIcon size={20} />
          </button>
        )}
        <div className="px-7 py-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
