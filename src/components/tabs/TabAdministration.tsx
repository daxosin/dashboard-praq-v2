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
  MailIcon,
  PhoneIcon,
  UsersIcon,
  CheckIcon,
  XMarkIcon,
} from "@/components/icons";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Staff, Domain, ProcessType } from "@/lib/database.types";

// ─── Role helpers ────────────────────────────────────────────
const STAFF_ROLES = ["PRAQ", "Préparateur", "Pharmacien", "Stagiaire", "Autre"] as const;

type BadgeVariantForRole = "ok" | "wip" | "plan" | "crit";

const roleBadgeVariant = (role: string): BadgeVariantForRole => {
  switch (role) {
    case "PRAQ":
      return "ok";
    case "Pharmacien":
      return "wip";
    case "Préparateur":
      return "plan";
    case "Stagiaire":
      return "crit";
    default:
      return "plan";
  }
};

// ─── Process type helpers ────────────────────────────────────
const PROCESS_TYPES: ProcessType[] = ["Management", "Réalisation", "Support"];

const processTypeBadgeVariant = (pt: ProcessType): BadgeVariantForRole => {
  switch (pt) {
    case "Management":
      return "ok";
    case "Réalisation":
      return "wip";
    case "Support":
      return "plan";
    default:
      return "plan";
  }
};

// ─── Component ───────────────────────────────────────────────
const TabAdministration: React.FC = () => {
  // ── Staff CRUD ──────────────────────────────────────
  const {
    data: staffList,
    loading: staffLoading,
    create: createStaff,
    update: updateStaff,
    remove: removeStaff,
    refresh: refreshStaff,
  } = useSupabaseCrud<Staff>("staff", {
    orderBy: { column: "name", ascending: true },
  });

  // ── Domains CRUD ────────────────────────────────────
  const {
    data: domains,
    loading: domainsLoading,
    create: createDomain,
    update: updateDomain,
    remove: removeDomain,
    refresh: refreshDomains,
  } = useSupabaseCrud<Domain>("domains", {
    orderBy: { column: "name", ascending: true },
  });

  // ── Staff modal state ───────────────────────────────
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    role: "PRAQ" as string,
    cluster: "",
  });

  // ── Staff delete state ──────────────────────────────
  const [deleteStaffTarget, setDeleteStaffTarget] = useState<Staff | null>(null);

  // ── Domain modal state ──────────────────────────────
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [domainForm, setDomainForm] = useState({
    name: "",
    process_type: "Réalisation" as ProcessType,
  });

  // ── Domain delete state ─────────────────────────────
  const [deleteDomainTarget, setDeleteDomainTarget] = useState<Domain | null>(null);

  // ── Responsable inline editing state ────────────────
  const [editingResponsable, setEditingResponsable] = useState<string | null>(null);
  const [responsableInput, setResponsableInput] = useState("");

  // ── Staff handlers ──────────────────────────────────
  const openAddStaffModal = () => {
    setEditingStaff(null);
    setStaffForm({ name: "", email: "", role: "PRAQ", cluster: "" });
    setShowStaffModal(true);
  };

  const openEditStaffModal = (s: Staff) => {
    setEditingStaff(s);
    setStaffForm({
      name: s.name,
      email: s.email || "",
      role: s.role,
      cluster: s.cluster || "",
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async () => {
    if (!staffForm.name.trim()) return;

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, {
          name: staffForm.name.trim(),
          email: staffForm.email.trim() || null,
          role: staffForm.role,
          cluster: staffForm.cluster.trim() || null,
        });
      } else {
        await createStaff({
          name: staffForm.name.trim(),
          email: staffForm.email.trim() || null,
          role: staffForm.role,
          cluster: staffForm.cluster.trim() || null,
          active: true,
          created_by: null,
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

  // ── Domain handlers ─────────────────────────────────
  const openAddDomainModal = () => {
    setEditingDomain(null);
    setDomainForm({ name: "", process_type: "Réalisation" });
    setShowDomainModal(true);
  };

  const openEditDomainModal = (d: Domain) => {
    setEditingDomain(d);
    setDomainForm({ name: d.name, process_type: d.process_type });
    setShowDomainModal(true);
  };

  const handleSaveDomain = async () => {
    if (!domainForm.name.trim()) return;

    try {
      if (editingDomain) {
        await updateDomain(editingDomain.id, {
          name: domainForm.name.trim(),
          process_type: domainForm.process_type,
        });
      } else {
        await createDomain({
          name: domainForm.name.trim(),
          process_type: domainForm.process_type,
          created_by: null,
        });
      }
      setShowDomainModal(false);
      refreshDomains();
    } catch (error) {
      console.error("Error saving domain:", error);
    }
  };

  const handleDeleteDomain = async () => {
    if (!deleteDomainTarget) return;
    try {
      await removeDomain(deleteDomainTarget.id);
      setDeleteDomainTarget(null);
      refreshDomains();
    } catch (error) {
      console.error("Error deleting domain:", error);
    }
  };

  // ── Responsable inline save ─────────────────────────
  // We store the responsible name in the domain's `created_by` field
  // as a simple convention (or you could add a `responsible` column).
  // For now, we keep it simple with an inline edit approach.
  // NOTE: Domains don't have a dedicated "responsible" field in the schema,
  // so we use inline text stored via a lookup approach.
  // We'll keep a local map for demonstration; in production you'd add a column.

  const handleSaveResponsable = async (domainId: string) => {
    try {
      await updateDomain(domainId, { created_by: responsableInput.trim() || null });
      setEditingResponsable(null);
      setResponsableInput("");
      refreshDomains();
    } catch (error) {
      console.error("Error saving responsable:", error);
    }
  };

  const loading = staffLoading || domainsLoading;

  if (loading) {
    return <div className="p-6 text-sec">Chargement...</div>;
  }

  return (
    <div className="space-y-10">

      {/* ════════════════════════════════════════════════════════
          SECTION 1 — Staff Members (Employés)
          ════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut">
            Employés
          </h2>
          <AddButton onClick={openAddStaffModal} label="Nouvel employé" />
        </div>

        {staffList.length === 0 ? (
          <div className="bg-card border border-brd rounded-xl p-10 text-center">
            <UsersIcon size={40} className="text-mut mx-auto mb-3" />
            <p className="text-[15px] text-mut">Aucun employé enregistré.</p>
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
                      {s.name}
                    </h3>
                    <div className="mt-1">
                      <Badge variant={roleBadgeVariant(s.role)}>{s.role}</Badge>
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

                {/* Details */}
                <div className="space-y-1.5">
                  {s.email && (
                    <div className="flex items-center gap-2 text-[14px] text-sec">
                      <MailIcon size={14} className="text-mut shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.cluster && (
                    <div className="flex items-center gap-2 text-[14px] text-sec">
                      <PhoneIcon size={14} className="text-mut shrink-0" />
                      <span className="truncate">{s.cluster}</span>
                    </div>
                  )}
                  {!s.email && !s.cluster && (
                    <div className="text-[13px] text-mut italic">Aucune info de contact</div>
                  )}
                </div>

                {/* Active indicator */}
                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-brd">
                  <span
                    className={`w-2 h-2 rounded-full ${s.active ? "bg-grn" : "bg-mut"}`}
                  />
                  <span className="text-[12px] text-mut">
                    {s.active ? "Actif" : "Inactif"}
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

        {domains.length === 0 ? (
          <div className="bg-card border border-brd rounded-xl p-10 text-center">
            <p className="text-[15px] text-mut">Aucun domaine enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {domains.map((d) => (
              <div
                key={d.id}
                className="bg-card border border-brd rounded-xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-text">{d.name}</h3>
                  <Badge variant={processTypeBadgeVariant(d.process_type)}>
                    {d.process_type}
                  </Badge>
                </div>

                <div className="mt-1">
                  <label className="text-[12px] text-mut uppercase tracking-wide block mb-1.5">
                    Responsable
                  </label>

                  {editingResponsable === d.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={responsableInput}
                        onChange={(e) => setResponsableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveResponsable(d.id);
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
                        onClick={() => handleSaveResponsable(d.id)}
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
                        setEditingResponsable(d.id);
                        setResponsableInput(d.created_by || "");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg border border-transparent hover:border-brd hover:bg-elev transition-all text-[14px] group"
                    >
                      {d.created_by ? (
                        <span className="text-text">{d.created_by}</span>
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
          SECTION 3 — Domaines / Processus
          ════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut">
            Domaines / Processus
          </h2>
          <AddButton onClick={openAddDomainModal} label="Nouveau domaine" />
        </div>

        {domains.length === 0 ? (
          <div className="bg-card border border-brd rounded-xl p-10 text-center">
            <p className="text-[15px] text-mut">Aucun domaine enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {domains.map((d) => (
              <div
                key={d.id}
                className="bg-card border border-brd rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-text truncate">{d.name}</h3>
                    <div className="mt-1.5">
                      <Badge variant={processTypeBadgeVariant(d.process_type)}>
                        {d.process_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => openEditDomainModal(d)}
                      className="p-2 rounded-lg text-mut hover:text-accent hover:bg-elev transition-colors"
                      aria-label="Modifier"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteDomainTarget(d)}
                      className="p-2 rounded-lg text-mut hover:text-red hover:bg-elev transition-colors"
                      aria-label="Supprimer"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>

                {d.created_by && (
                  <div className="text-[13px] text-sec">
                    Responsable : <span className="font-medium text-text">{d.created_by}</span>
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
        title={editingStaff ? "Modifier l'employé" : "Nouvel employé"}
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Nom *
            </label>
            <input
              type="text"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              placeholder="Nom complet"
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              placeholder="exemple@pharma78.fr"
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Cluster (used as phone placeholder) */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Téléphone / Cluster
            </label>
            <input
              type="text"
              value={staffForm.cluster}
              onChange={(e) => setStaffForm({ ...staffForm, cluster: e.target.value })}
              placeholder="06 12 34 56 78"
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
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
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
              disabled={!staffForm.name.trim()}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingStaff ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          MODAL — Add / Edit Domain
          ════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        title={editingDomain ? "Modifier le domaine" : "Nouveau domaine"}
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Nom du domaine *
            </label>
            <input
              type="text"
              value={domainForm.name}
              onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })}
              placeholder="Ex : Dispensation, Réception, Stockage..."
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Process type */}
          <div>
            <label className="text-[13px] font-semibold text-sec mb-2 block">
              Type de processus *
            </label>
            <select
              value={domainForm.process_type}
              onChange={(e) => setDomainForm({ ...domainForm, process_type: e.target.value as ProcessType })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              {PROCESS_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDomainModal(false)}
              className="bg-card border border-brd rounded-xl px-6 py-3 text-[14px] font-medium text-text hover:bg-elev transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveDomain}
              disabled={!domainForm.name.trim()}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingDomain ? "Enregistrer" : "Créer"}
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
          itemName={deleteStaffTarget.name}
        />
      )}

      {deleteDomainTarget && (
        <ConfirmDelete
          isOpen={!!deleteDomainTarget}
          onConfirm={handleDeleteDomain}
          onCancel={() => setDeleteDomainTarget(null)}
          itemName={deleteDomainTarget.name}
        />
      )}
    </div>
  );
};

export default TabAdministration;
