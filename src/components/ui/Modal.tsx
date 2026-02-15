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
      <div className="absolute inset-0 bg-black bg-opacity-60 transition-opacity" />
      <div
        className={`relative bg-card border border-brd rounded-md shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-brd">
            <h3 className="text-[14px] font-semibold text-text">{title}</h3>
            <button
              onClick={onClose}
              className="text-mut hover:text-text transition-colors"
              aria-label="Fermer"
            >
              <XMarkIcon size={18} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-mut hover:text-text transition-colors z-10"
            aria-label="Fermer"
          >
            <XMarkIcon size={18} />
          </button>
        )}
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};
