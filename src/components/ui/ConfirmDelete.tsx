"use client";

import React from "react";
import { Modal } from "./Modal";

export interface ConfirmDeleteProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemName?: string;
  className?: string;
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  itemName,
  className = "",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirmation" className={className}>
      <div className="space-y-4">
        <p className="text-[14px] text-sec">
          {itemName
            ? `Voulez-vous vraiment supprimer "${itemName}" ?`
            : "Voulez-vous vraiment supprimer cet élément ?"}
        </p>
        <p className="text-[12px] text-mut">
          Cette action est irréversible.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="bg-card border border-brd rounded-md px-4 py-2 text-[12px] font-medium text-text hover:bg-elev transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="bg-red border border-red rounded-md px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  );
};
