"use client";

import React, { useState } from "react";
import {
  Badge,
  AddButton,
  Modal,
  ConfirmDelete,
} from "@/components/ui";
import {
  EditIcon,
  TrashIcon,
  UsersIcon,
  CheckIcon,
  XMarkIcon,
} from "@/components/icons";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { StaffLite, Processus } from "@/lib/db-rows";

// ─── Role helpers (valeurs DB UPPERCASE <-> labels français) ─
const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "TITULAIRE", label: "Titulaire" },
  { value: "PRAQ_ADJOINT", label: "PRAQ adjoint" },
  { value: "PHARMACIEN", label: "Pharmacien" },
  { value: "PREPARATEUR", label: "Préparateur" },
  { value: "VENDEUR", label: "Vendeur" },
  { value: "CAISSIER", label: "Caissier" },
  { value: "LIVREUR", label: "Livreur" },
  { value: "APPRENTI", label: "Apprenti" },
  { value: "TECHNICIEN", label: "Technicien" },
  { value: "RESPONSABLE", label: "Responsable" },
];

const roleLabel = (role: string): string =>
  ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;

type BadgeVariantForRole = "ok" | "wip" | "plan" | "crit";

const roleBadgeVariant = (role: string): BadgeVariantForRole => {
  switch (role) {
    case "TITULAIRE":
    case "PRAQ_ADJOINT":
      return "ok";
    case "PHARMACIEN":
    case "RESPONSABLE":
      return "wip";
    case "APPRENTI":
      return "crit";
    default:
      return "plan";
  }
};

// ─── Component ───────────────────────────────────────────────
const TabAdministration: React.FC = () => {
  // ── Staff CRUD (staff_lite : référentiel minimal) ───
  const {
    data: staffList,
    loading: staffLoading,
    create: createStaff,
    update: updateStaff,
    remove: removeStaff,
    refresh: refreshStaff,
  } = useSupabaseCrud<StaffLite>("staff_lite", {
    orderBy: { column: "prenom_nom", ascending: true },
  });

  // ── Processus CRUD ──────────────────────────────────
  const {
    data: processusList,
    loading: processusLoading,
    create: createProcessus,
    update: updateProcessus,
    remove: removeProcessus,
    refresh: refreshProcessus,
  } = useSupabaseCrud<Processus>("processus", {
    orderBy: { column: "code", ascending: true },
  });

  // ── Staff modal state ───────────────────────────────
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffLite | null>(null);
  const [staffForm, setStaffForm] = useState({
    prenom_nom: "",
    role: "PREPARATEUR" as string,
    actif: true,
  });

  // ── Staff delete state ──────────────────────────────
  const [deleteStaffTarget, setDeleteStaffTarget] = useState<StaffLite | null>(null);

  // ── Processus modal state ───────────────────────────
  const [showProcessusModal, setShowProcessusModal] = useState(false);
  const [editingProcessus, setEditingProcessus] = useState<Processus | null>(null);
  const [processusForm, setProcessusForm] = useState({
    code: "",
    nom: "",
    description: "",
  });

  // ── Processus delete state ──────────────────────────
  const [deleteProcessusTarget, setDeleteProcessusTarget] = useState<Processus | null>(null);

  // ── Responsable inline editing state ────────────────
  const [editingResponsable, setEditingResponsable] = useState<string | null>(null);
  const [responsableInput, setResponsableInput] = useState("");

  // ── Staff handlers ──────────────────────────────────
  const openAddStaffModal = () => {
    setEditingStaff(null);
    setStaffForm({ prenom_nom: "", role: "PREPARATEUR", actif: true });
    setShowStaffModal(true);
  };

  const openEditStaffModal = (s: StaffLite) => {
    setEditingStaff(s);
    setStaffForm({
      prenom_nom: s.prenom_nom,
      role: s.role,
      actif: s.actif,
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async () => {
    if (!staffForm.prenom_nom.trim()) return;

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, {
          prenom_nom: staffForm.prenom_nom.trim(),
          role: staffForm.role,
          actif: staffForm.actif,
        });
      } else {
        await createStaff({
          prenom_nom: staffForm.prenom_nom.trim(),
          role: staffForm.role,
          actif: staffForm.actif,
        });
      }
      setShowStaffModal(false);
      refreshStaff();
    } catch (error) {
      console.error("Error saving staff:", error);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteStaffTarget) return;
    try {
      await removeStaff(deleteStaffTarget.id);
      setDeleteStaffTarget(null);
      refreshStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  // ── Processus handlers ──────────────────────────────
  const openAddProcessusModal = () => {
    setEditingProcessus(null);
    setProcessusForm({ code: "", nom: "", description: "" });
    setShowProcessusModal(true);
  };

  const openEditProcessusModal = (p: Processus) => {
    setEditingProcessus(p);
    setProcessusForm({
      code: p.code,
      nom: p.nom,
      description: p.description || "",
    });
    setShowProcessusModal(true);
  };

  const handleSaveProcessus = async () => {
    if (!processusForm.code.trim() || !processusForm.nom.trim()) return;

    try {
      if (editingProcessus) {
        await updateProcessus(editingProcessus.id, {
          code: processusForm.code.trim(),
          nom: processusForm.nom.trim(),
          description: processusForm.description.trim() || null,
        });
      } else {
        await createProcessus({
          code: processusForm.code.trim(),
          nom: processusForm.nom.trim(),
          description: processusForm.description.trim() || null,
          actif: true,
        });
      }
      setShowProcessusModal(false);
      refreshProcessus();
    } catch (error) {
      console.error("Error saving processus:", error);
    }
  };

  const handleDeleteProcessus = async () => {
    if (!deleteProcessusTarget) return;
    try {
      await removeProcessus(deleteProcessusTarget.id);
      setDeleteProcessusTarget(null);
      refreshProcessus();
    } catch (error) {
      console.error("Error deleting processus:", error);
    }
  };

  // ── Responsable inline save ─────────────────────────
  // La table `processus` n'a pas de colonne dédiée "responsable" :
  // on conserve la convention historique (nom stocké dans `created_by`).
  const handleSaveResponsable = async (processusId: string) => {
    try {
      await updateProcessus(processusId, { created_by: responsableInput.trim() || null });
      setEditingResponsable(null);
      setResponsableInput("");
      refreshProcessus();
    } catch (error) {
      console.error("Error saving responsable:", error);
    }
  };

  const loading = staffLoading || processusLoading;

  if (loading) {
    return <div className="p-6 text-sec">Chargement...</div>;
  }

  return (
    <div className="space-y-10">

      {/* ════════════════════════════════════════════════════════
          SECTION 1 — Collaborateurs (staff_lite)
          ════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut">
            Collaborateurs
          </h2>
          <AddButton onClick={openAddStaffModal} label="Nouveau collaborateur" />
        </div>

        {staffList.length === 0 ? (
          <div className="bg-card border border-brd rounded-xl p-10 text-center">
            <UsersIcon size={40} className="text-mut mx-auto mb-3" />
            <p className="text-[15px] text-mut">Aucun collaborateur enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {staffList.map((s) => (
              <div
                key={s.id}
                className="bg-card border border-brd rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors"
              >
                {/* Top row: name + actions */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold text-text truncate">
                      {s.prenom_nom}
                    </h3>
                    <div className="mt-1">
                      <Badge variant={roleBadgeVariant(s.role)}>{roleLabel(s.role)}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => openEditStaffModal(s)}
                      className="p-2 rounded-lg text-mut hover:text-accent hover:bg-elev transition-colors"
                      aria-label="Modifier"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteStaffTarget(s)}
                      className="p-2 rounded-lg text-mut hover:text-red hover:bg-elev transition-colors"
                      aria-label="Supprimer"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>

                {/* Active indicator */}
                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-brd">
                  <span
                    className={`w-2 h-2 rounded-full ${s.actif ? "bg-grn" : "bg-mut"}`}
                  />
                  <span className="text-[12px] text-mut">
                    {s.actif ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 2 — Responsables par processus
          ════════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut mb-5">
          Responsables par processus
        </h2>

        {processusList.length === 0 ? (
          <div className="bg-card border border-brd rounded-xl p-10 text-center">
            <p className="text-[15px] text-mut">Aucun processus enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {processusList.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-brd rounded-xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-text">{p.nom}</h3>
                  <Badge variant="plan">{p.code}</Badge>
                </div>

                <div className="mt-1">
                  <label className="text-[12px] text-mut uppercase tracking-wide block mb-1.5">
                    Responsable
                  </label>

                  {editingResponsable === p.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={responsableInput}
                        onChange={(e) => setResponsableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveResponsable(p.id);
                          if (e.key === "Escape") {
                            setEditingResponsable(null);
                            setResponsableInput("");
                          }
                        }}
                        autoFocus
                        placeholder="Nom du responsable"
                        className="flex-1 px-3 py-2 bg-bg border border-brd rounded-lg text-[14px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                      />
                      <button
                        onClick={() => handleSaveResponsable(p.id)}
                        className="p-1.5 rounded-lg text-grn hover:bg-elev transition-colors"
                        aria-label="Confirmer"
                      >
                        <CheckIcon size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingResponsable(null);
                          setResponsableInput("");
                        }}
                        className="p-1.5 rounded-lg text-mut hover:bg-elev transition-colors"
                        aria-label="Annuler"
                      >
                        <XMarkIcon size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingResponsable(p.id);
                        setResponsableInput(p.created_by || "");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg border border-transparent hover:border-brd hover:bg-elev transition-all text-[14px] group"
                    >
                      {p.created_by ? (
                        <span className="text-text">{p.created_by}</span>
                      ) : (
                        <span className="text-mut italic">Cliquer pour assigner</span>
                      )}
                      <EditIcon
                        size={13}
                        className="inline-block ml-2 text-mut opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 3 — Processus
          ════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut">
            Processus
          </h2>
          <AddButton onClick={openAddProcessusModal} label="Nouveau processus" />
        </div>

        {processusList.length === 0 ? (
          <div className="bg-card border border-brd rounded-xl p-10 text-center">
            <p className="text-[15px] text-mut">Aucun processus enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {processusList.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-brd rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-text truncate">{p.nom}</h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant="plan">{p.code}</Badge>
                      {p.actif === false && <Badge variant="crit">Inactif</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => openEditProcessusModal(p)}
                      className="p-2 rounded-lg text-mut hover:text-accent hover:bg-elev transition-colors"
                      aria-label="Modifier"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteProcessusTarget(p)}
                      className="p-2 rounded-lg text-mut hover:text-red hover:bg-elev transition-colors"
                      aria-label="Supprimer"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>

                {p.description && (
                  <div className="text-[13px] text-sec">{p.description}</div>
                )}

                {p.created_by && (
                  <div className="text-[13px] text-sec">
                    Responsable : <span className="font-medium text-text">{p.created_by}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════
          MODAL — Add / Edit Staff
          ════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        title={editingStaff ? "Modifier le collaborateur" : "Nouveau collaborateur"}
      >
        <div className="space-y-5">
          {/* Prénom Nom */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Prénom Nom *
            </label>
            <input
              type="text"
              value={staffForm.prenom_nom}
              onChange={(e) => setStaffForm({ ...staffForm, prenom_nom: e.target.value })}
              placeholder="Prénom Nom"
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Rôle *
            </label>
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actif */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={staffForm.actif}
                onChange={(e) => setStaffForm({ ...staffForm, actif: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              <span className="text-[14px] text-text">Collaborateur actif</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowStaffModal(false)}
              className="bg-card border border-brd rounded-xl px-6 py-3 text-[14px] font-medium text-text hover:bg-elev transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveStaff}
              disabled={!staffForm.prenom_nom.trim()}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingStaff ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          MODAL — Add / Edit Processus
          ════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showProcessusModal}
        onClose={() => setShowProcessusModal(false)}
        title={editingProcessus ? "Modifier le processus" : "Nouveau processus"}
      >
        <div className="space-y-5">
          {/* Code */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Code *
            </label>
            <input
              type="text"
              value={processusForm.code}
              onChange={(e) => setProcessusForm({ ...processusForm, code: e.target.value })}
              placeholder="Ex : PR-01"
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Nom du processus *
            </label>
            <input
              type="text"
              value={processusForm.nom}
              onChange={(e) => setProcessusForm({ ...processusForm, nom: e.target.value })}
              placeholder="Ex : Dispensation, Réception, Stockage..."
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Description
            </label>
            <input
              type="text"
              value={processusForm.description}
              onChange={(e) => setProcessusForm({ ...processusForm, description: e.target.value })}
              placeholder="Description courte du processus"
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowProcessusModal(false)}
              className="bg-card border border-brd rounded-xl px-6 py-3 text-[14px] font-medium text-text hover:bg-elev transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveProcessus}
              disabled={!processusForm.code.trim() || !processusForm.nom.trim()}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingProcessus ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          DELETE CONFIRMATIONS
          ════════════════════════════════════════════════════════ */}
      {deleteStaffTarget && (
        <ConfirmDelete
          isOpen={!!deleteStaffTarget}
          onConfirm={handleDeleteStaff}
          onCancel={() => setDeleteStaffTarget(null)}
          itemName={deleteStaffTarget.prenom_nom}
        />
      )}

      {deleteProcessusTarget && (
        <ConfirmDelete
          isOpen={!!deleteProcessusTarget}
          onConfirm={handleDeleteProcessus}
          onCancel={() => setDeleteProcessusTarget(null)}
          itemName={deleteProcessusTarget.nom}
        />
      )}
    </div>
  );
};

export default TabAdministration;
