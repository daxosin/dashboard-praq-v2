"use client";

import React, { useState, useMemo } from "react";
import {
  KpiCard,
  Badge,
  DataTable,
  EditableCell,
  AddButton,
  Modal,
  ConfirmDelete,
  type BadgeVariant,
  type ColumnDef,
} from "@/components/ui";
import { UsersIcon, TrashIcon } from "@/components/icons";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type {
  StaffLite,
  Habilitation,
  HabilitationInsert,
  Formation,
  FormationInsert,
} from "@/lib/db-rows";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping (valeurs DB UPPERCASE)       */
/* ------------------------------------------------------------------ */
const HABILITATION_STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "VALIDE", label: "Valide" },
  { value: "A_RENOUVELER", label: "À renouveler" },
  { value: "EN_COURS", label: "En cours" },
  { value: "EXPIREE", label: "Expirée" },
];

const FORMATION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "INTERNE", label: "Interne" },
  { value: "EXTERNE", label: "Externe" },
  { value: "DPC", label: "DPC" },
  { value: "E_LEARNING", label: "E-learning" },
];

const FORMATION_STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "PLANIFIEE", label: "Planifiée" },
  { value: "REALISEE", label: "Réalisée" },
  { value: "REPORTEE", label: "Reportée" },
  { value: "ANNULEE", label: "Annulée" },
];

const ROLE_LABELS: Record<string, string> = {
  TITULAIRE: "Titulaire",
  PRAQ_ADJOINT: "PRAQ adjoint",
  PHARMACIEN: "Pharmacien",
  PREPARATEUR: "Préparateur",
  VENDEUR: "Vendeur",
  CAISSIER: "Caissier",
  LIVREUR: "Livreur",
  APPRENTI: "Apprenti",
  TECHNICIEN: "Technicien",
  RESPONSABLE: "Responsable",
};

const habilitationStatutVariant = (statut: string): BadgeVariant => {
  switch (statut) {
    case "VALIDE":
      return "ok";
    case "A_RENOUVELER":
      return "wip";
    case "EN_COURS":
      return "plan";
    case "EXPIREE":
      return "crit";
    default:
      return "plan";
  }
};

const TabFormations: React.FC = () => {
  const [showAddFormationModal, setShowAddFormationModal] = useState(false);
  const [showAddHabilitationModal, setShowAddHabilitationModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "formation" | "habilitation" } | null>(null);
  const [filterStaff, setFilterStaff] = useState<string>("");
  const [filterSkill, setFilterSkill] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // staff_lite : référentiel minimal des collaborateurs (prenom_nom, role, actif)
  const { data: staff, loading: staffLoading } = useSupabaseCrud<StaffLite>("staff_lite", {
    orderBy: { column: "prenom_nom", ascending: true },
    filters: { actif: true },
  });

  // habilitations : `collaborateur` est un texte (nom en clair), pas une FK
  const {
    data: habilitations,
    loading: habilitationsLoading,
    create: createHabilitation,
    update: updateHabilitation,
    remove: removeHabilitation,
    refresh: refreshHabilitations,
  } = useSupabaseCrud<Habilitation>("habilitations", {
    orderBy: { column: "created_at", ascending: false },
  });

  // formations : sessions collectives, `participants` = array de noms
  const {
    data: formations,
    loading: formationsLoading,
    create: createFormation,
    update: updateFormation,
    remove: removeFormation,
    refresh: refreshFormations,
  } = useSupabaseCrud<Formation>("formations", {
    orderBy: { column: "created_at", ascending: false },
  });

  const [newFormation, setNewFormation] = useState<Partial<FormationInsert>>({
    titre: "",
    type: "INTERNE",
    statut: "PLANIFIEE",
    date_formation: "",
    formateur: "",
    participants: [],
  });

  const [newHabilitation, setNewHabilitation] = useState<Partial<HabilitationInsert>>({
    collaborateur: "",
    competence: "",
    poste: "",
    date_obtention: "",
    date_expiration: null,
    statut: "VALIDE",
  });

  // KPI calculations
  const kpis = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringHabilitations = habilitations.filter((h) => {
      if (!h.date_expiration) return false;
      const expiryDate = new Date(h.date_expiration);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    });

    const plannedFormations = formations.filter((f) => f.statut === "PLANIFIEE");

    const staffNames = new Set(staff.map((s) => s.prenom_nom));
    const totalStaff = staff.length;
    const staffWithHabilitations = new Set(
      habilitations.filter((h) => staffNames.has(h.collaborateur)).map((h) => h.collaborateur)
    ).size;
    const habilitePercent = totalStaff > 0 ? Math.round((staffWithHabilitations / totalStaff) * 100) : 0;

    const totalSkills = new Set(habilitations.map((h) => h.competence)).size;
    const totalPossibleHabilitations = totalStaff * totalSkills;
    const coveragePercent =
      totalPossibleHabilitations > 0
        ? Math.round((habilitations.length / totalPossibleHabilitations) * 100)
        : 0;

    return {
      habilitePercent,
      staffWithHabilitations,
      plannedFormationsCount: plannedFormations.length,
      expiringCount: expiringHabilitations.length,
      coveragePercent,
    };
  }, [staff, habilitations, formations]);

  // Skill matrix data — jointure par nom en clair (collaborateur === prenom_nom)
  const skillMatrix = useMemo(() => {
    const skills = Array.from(new Set(habilitations.map((h) => h.competence))).sort();

    return staff.map((s) => {
      const staffHabs = habilitations.filter((h) => h.collaborateur === s.prenom_nom);
      const skillStatut: Record<string, string | null> = {};

      skills.forEach((skill) => {
        const hab = staffHabs.find((h) => h.competence === skill);
        skillStatut[skill] = hab ? hab.statut : null;
      });

      return { staff: s, skills, skillStatut };
    });
  }, [staff, habilitations]);

  // Chart data - Habilitations par rôle (staff_lite n'a pas de cluster)
  const habilitationsByRole = useMemo(() => {
    const roleByName = new Map(staff.map((s) => [s.prenom_nom, s.role]));
    const roleMap: Record<string, number> = {};
    habilitations.forEach((h) => {
      const role = roleByName.get(h.collaborateur);
      const label = role ? ROLE_LABELS[role] ?? role : "Hors effectif";
      roleMap[label] = (roleMap[label] || 0) + 1;
    });
    return Object.entries(roleMap).map(([name, value]) => ({ name, value }));
  }, [staff, habilitations]);

  // Chart data - Statut formations (enum DB)
  const formationStatusData = useMemo(() => {
    return FORMATION_STATUT_OPTIONS.map((opt) => ({
      name: opt.label,
      value: formations.filter((f) => f.statut === opt.value).length,
    }));
  }, [formations]);

  const COLORS = ["var(--color-muted)", "var(--color-ok)", "var(--color-wip)", "var(--color-crit)"];

  // Filtered habilitations
  const filteredHabilitations = useMemo(() => {
    return habilitations.filter((h) => {
      if (filterStaff && h.collaborateur !== filterStaff) return false;
      if (filterSkill && !h.competence.toLowerCase().includes(filterSkill.toLowerCase())) return false;
      if (filterStatus && h.statut !== filterStatus) return false;
      return true;
    });
  }, [habilitations, filterStaff, filterSkill, filterStatus]);

  // Filtered formations (par participant)
  const filteredFormations = useMemo(() => {
    return formations.filter((f) => {
      if (filterStaff && !(f.participants || []).includes(filterStaff)) return false;
      return true;
    });
  }, [formations, filterStaff]);

  // Habilitation columns
  const habilitationColumns: ColumnDef<Habilitation>[] = [
    {
      key: "collaborateur",
      label: "Collaborateur",
      render: (h) => (
        <EditableCell
          value={h.collaborateur}
          type="select"
          options={staff.map((s) => ({ value: s.prenom_nom, label: s.prenom_nom }))}
          onSave={(value) => {
            const v = String(value).trim();
            if (v) updateHabilitation(h.id, { collaborateur: v });
          }}
        />
      ),
    },
    {
      key: "competence",
      label: "Compétence",
      render: (h) => (
        <EditableCell
          value={h.competence}
          type="text"
          onSave={(value) => {
            const v = String(value).trim();
            if (v) updateHabilitation(h.id, { competence: v });
          }}
        />
      ),
    },
    {
      key: "poste",
      label: "Poste",
      render: (h) => (
        <EditableCell
          value={h.poste || ""}
          type="text"
          onSave={(value) => updateHabilitation(h.id, { poste: String(value).trim() || null })}
        />
      ),
    },
    {
      key: "date_obtention",
      label: "Date obtention",
      render: (h) => (
        <EditableCell
          value={h.date_obtention || ""}
          type="date"
          onSave={(value) => updateHabilitation(h.id, { date_obtention: String(value) || null })}
        />
      ),
    },
    {
      key: "date_expiration",
      label: "Date expiration",
      render: (h) => (
        <EditableCell
          value={h.date_expiration || ""}
          type="date"
          onSave={(value) => updateHabilitation(h.id, { date_expiration: String(value) || null })}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (h) => (
        <EditableCell
          value={h.statut}
          type="select"
          options={HABILITATION_STATUT_OPTIONS}
          onSave={(value) => updateHabilitation(h.id, { statut: String(value) })}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (h) => (
        <button
          onClick={() => setDeleteTarget({ id: h.id, type: "habilitation" })}
          className="text-crit hover:opacity-70 transition-opacity"
          aria-label="Supprimer"
        >
          <TrashIcon size={16} />
        </button>
      ),
    },
  ];

  // Formation columns
  const formationColumns: ColumnDef<Formation>[] = [
    {
      key: "titre",
      label: "Titre formation",
      render: (f) => (
        <EditableCell
          value={f.titre}
          type="text"
          onSave={(value) => {
            const v = String(value).trim();
            if (v) updateFormation(f.id, { titre: v });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (f) => (
        <EditableCell
          value={f.type}
          type="select"
          options={FORMATION_TYPE_OPTIONS}
          onSave={(value) => updateFormation(f.id, { type: String(value) })}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (f) => (
        <EditableCell
          value={f.statut}
          type="select"
          options={FORMATION_STATUT_OPTIONS}
          onSave={(value) => updateFormation(f.id, { statut: String(value) })}
        />
      ),
    },
    {
      key: "date_formation",
      label: "Date formation",
      render: (f) => (
        <EditableCell
          value={f.date_formation || ""}
          type="date"
          onSave={(value) => updateFormation(f.id, { date_formation: String(value) || null })}
        />
      ),
    },
    {
      key: "duree_heures",
      label: "Durée (h)",
      render: (f) => (
        <EditableCell
          value={f.duree_heures ?? ""}
          type="number"
          onSave={(value) =>
            updateFormation(f.id, { duree_heures: Number(value) > 0 ? Number(value) : null })
          }
        />
      ),
    },
    {
      key: "formateur",
      label: "Formateur",
      render: (f) => (
        <EditableCell
          value={f.formateur || ""}
          type="text"
          onSave={(value) => updateFormation(f.id, { formateur: String(value).trim() || null })}
        />
      ),
    },
    {
      key: "participants",
      label: "Participants",
      render: (f) => (
        <EditableCell
          value={(f.participants || []).join(", ")}
          type="text"
          onSave={(value) => {
            const names = String(value)
              .split(",")
              .map((n) => n.trim())
              .filter(Boolean);
            updateFormation(f.id, {
              participants: names.length > 0 ? names : null,
              nb_participants: names.length > 0 ? names.length : null,
            });
          }}
        />
      ),
    },
    {
      key: "attestation",
      label: "Attestation",
      render: (f) => (
        <button
          onClick={() => updateFormation(f.id, { attestation: !f.attestation })}
          aria-label="Basculer attestation"
        >
          <Badge variant={f.attestation ? "ok" : "plan"}>{f.attestation ? "Oui" : "Non"}</Badge>
        </button>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (f) => (
        <button
          onClick={() => setDeleteTarget({ id: f.id, type: "formation" })}
          className="text-crit hover:opacity-70 transition-opacity"
          aria-label="Supprimer"
        >
          <TrashIcon size={16} />
        </button>
      ),
    },
  ];

  const handleAddFormation = async () => {
    const titre = newFormation.titre?.trim();
    const type = newFormation.type;
    if (!titre || !type) return;
    try {
      const participants = (newFormation.participants || []).filter(Boolean);
      await createFormation({
        titre,
        type,
        statut: newFormation.statut || "PLANIFIEE",
        date_formation: newFormation.date_formation || null,
        formateur: newFormation.formateur?.trim() || null,
        participants: participants.length > 0 ? participants : null,
        nb_participants: participants.length > 0 ? participants.length : null,
      });
      setShowAddFormationModal(false);
      setNewFormation({
        titre: "",
        type: "INTERNE",
        statut: "PLANIFIEE",
        date_formation: "",
        formateur: "",
        participants: [],
      });
      refreshFormations();
    } catch (error) {
      console.error("Error creating formation:", error);
    }
  };

  const handleAddHabilitation = async () => {
    const collaborateur = newHabilitation.collaborateur;
    const competence = newHabilitation.competence?.trim();
    if (!collaborateur || !competence) return;
    try {
      await createHabilitation({
        collaborateur,
        competence,
        poste: newHabilitation.poste?.trim() || null,
        date_obtention: newHabilitation.date_obtention || null,
        date_expiration: newHabilitation.date_expiration || null,
        statut: newHabilitation.statut || "VALIDE",
      });
      setShowAddHabilitationModal(false);
      setNewHabilitation({
        collaborateur: "",
        competence: "",
        poste: "",
        date_obtention: "",
        date_expiration: null,
        statut: "VALIDE",
      });
      refreshHabilitations();
    } catch (error) {
      console.error("Error creating habilitation:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "formation") {
        await removeFormation(deleteTarget.id);
        refreshFormations();
      } else {
        await removeHabilitation(deleteTarget.id);
        refreshHabilitations();
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const loading = staffLoading || habilitationsLoading || formationsLoading;

  if (loading) {
    return <div className="p-6 text-sec">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="PERSONNEL HABILITÉ"
          value={`${kpis.habilitePercent}%`}
          subtitle={`${kpis.staffWithHabilitations} / ${staff.length} collaborateurs`}
        />
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="FORMATIONS PLANIFIÉES"
          value={kpis.plannedFormationsCount.toString()}
          subtitle="À réaliser"
        />
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="EXPIRATIONS <30J"
          value={kpis.expiringCount.toString()}
          subtitle="Habilitations à renouveler"
          accent="amber"
        />
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="TAUX COUVERTURE"
          value={`${kpis.coveragePercent}%`}
          subtitle="Compétences vs personnel"
        />
      </div>

      {/* Skill Matrix */}
      <div className="card">
        <h2 className="text-h2 mb-4">Matrice de compétences</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brd">
                <th className="text-left p-3 text-tag sticky left-0 bg-card z-10">COLLABORATEUR</th>
                {skillMatrix[0]?.skills.map((skill) => (
                  <th key={skill} className="text-left p-3 text-tag whitespace-nowrap">
                    {skill.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skillMatrix.map((row) => (
                <tr key={row.staff.id} className="border-b border-brd hover:bg-elev transition-colors">
                  <td className="p-3 font-medium sticky left-0 bg-card">{row.staff.prenom_nom}</td>
                  {row.skills.map((skill) => {
                    const statut = row.skillStatut[skill];
                    return (
                      <td key={skill} className="p-3">
                        <Badge variant={statut ? habilitationStatutVariant(statut) : "plan"}>
                          {statut === "VALIDE" && "OK"}
                          {statut === "A_RENOUVELER" && "Ren"}
                          {statut === "EN_COURS" && "EC"}
                          {statut === "EXPIREE" && "Exp"}
                          {!statut && "-"}
                        </Badge>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-h2 mb-4">Habilitations par rôle</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={habilitationsByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-secondary)" style={{ fontSize: 11 }} />
              <YAxis stroke="var(--color-secondary)" style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                }}
                labelStyle={{ color: "var(--color-text)" }}
              />
              <Bar dataKey="value" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-h2 mb-4">Statut formations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formationStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-h3 mb-3">Filtres</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-semibold text-sec mb-2">COLLABORATEUR</label>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="">Tous</option>
              {staff.map((s) => (
                <option key={s.id} value={s.prenom_nom}>
                  {s.prenom_nom}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-semibold text-sec mb-2">COMPÉTENCE</label>
            <input
              type="text"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-semibold text-sec mb-2">STATUT</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="">Tous</option>
              {HABILITATION_STATUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Habilitations Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2">Habilitations</h2>
          <AddButton onClick={() => setShowAddHabilitationModal(true)} label="Nouvelle habilitation" />
        </div>
        <DataTable columns={habilitationColumns} data={filteredHabilitations} />
      </div>

      {/* Plan de formation Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2">Plan de formation</h2>
          <AddButton onClick={() => setShowAddFormationModal(true)} label="Nouvelle formation" />
        </div>
        <DataTable columns={formationColumns} data={filteredFormations} />
      </div>

      {/* Add Formation Modal */}
      <Modal
        isOpen={showAddFormationModal}
        onClose={() => setShowAddFormationModal(false)}
        title="Nouvelle formation"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">TITRE *</label>
            <input
              type="text"
              value={newFormation.titre || ""}
              onChange={(e) => setNewFormation({ ...newFormation, titre: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">TYPE *</label>
            <select
              value={newFormation.type || "INTERNE"}
              onChange={(e) => setNewFormation({ ...newFormation, type: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              {FORMATION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">STATUT</label>
            <select
              value={newFormation.statut || "PLANIFIEE"}
              onChange={(e) => setNewFormation({ ...newFormation, statut: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              {FORMATION_STATUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">DATE FORMATION</label>
            <input
              type="date"
              value={newFormation.date_formation || ""}
              onChange={(e) => setNewFormation({ ...newFormation, date_formation: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">FORMATEUR</label>
            <input
              type="text"
              value={newFormation.formateur || ""}
              onChange={(e) => setNewFormation({ ...newFormation, formateur: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">PARTICIPANTS</label>
            <select
              multiple
              size={6}
              value={newFormation.participants || []}
              onChange={(e) =>
                setNewFormation({
                  ...newFormation,
                  participants: Array.from(e.target.selectedOptions).map((o) => o.value),
                })
              }
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.prenom_nom}>
                  {s.prenom_nom}
                </option>
              ))}
            </select>
            <p className="text-[12px] text-mut mt-1.5">
              Maintenir Ctrl (ou Cmd) pour sélectionner plusieurs collaborateurs.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddFormationModal(false)}
              className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
            >
              Annuler
            </button>
            <button
              onClick={handleAddFormation}
              disabled={!newFormation.titre?.trim() || !newFormation.type}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Habilitation Modal */}
      <Modal
        isOpen={showAddHabilitationModal}
        onClose={() => setShowAddHabilitationModal(false)}
        title="Nouvelle habilitation"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">COLLABORATEUR *</label>
            <select
              value={newHabilitation.collaborateur || ""}
              onChange={(e) => setNewHabilitation({ ...newHabilitation, collaborateur: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="">Sélectionner</option>
              {staff.map((s) => (
                <option key={s.id} value={s.prenom_nom}>
                  {s.prenom_nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">COMPÉTENCE *</label>
            <input
              type="text"
              value={newHabilitation.competence || ""}
              onChange={(e) => setNewHabilitation({ ...newHabilitation, competence: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">POSTE</label>
            <input
              type="text"
              value={newHabilitation.poste || ""}
              onChange={(e) => setNewHabilitation({ ...newHabilitation, poste: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">DATE OBTENTION</label>
            <input
              type="date"
              value={newHabilitation.date_obtention || ""}
              onChange={(e) => setNewHabilitation({ ...newHabilitation, date_obtention: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">DATE EXPIRATION</label>
            <input
              type="date"
              value={newHabilitation.date_expiration || ""}
              onChange={(e) =>
                setNewHabilitation({ ...newHabilitation, date_expiration: e.target.value || null })
              }
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">STATUT</label>
            <select
              value={newHabilitation.statut || "VALIDE"}
              onChange={(e) => setNewHabilitation({ ...newHabilitation, statut: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              {HABILITATION_STATUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddHabilitationModal(false)}
              className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
            >
              Annuler
            </button>
            <button
              onClick={handleAddHabilitation}
              disabled={!newHabilitation.collaborateur || !newHabilitation.competence?.trim()}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDelete
          isOpen={!!deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          itemName={deleteTarget.type === "formation" ? "cette formation" : "cette habilitation"}
        />
      )}
    </div>
  );
};

export default TabFormations;
