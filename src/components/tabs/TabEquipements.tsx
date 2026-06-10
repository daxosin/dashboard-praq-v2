"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Equipement, EquipementInsert, Maintenance, MaintenanceInsert } from "@/lib/db-rows";
import {
  KpiCard,
  DataTable,
  EditableCell,
  Badge,
  AddButton,
  Modal,
  ConfirmDelete,
  AlertLine,
  type ColumnDef,
} from "@/components/ui";
import { ToolIcon, TrashIcon } from "@/components/icons";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping (aligned on real DB CHECKs)  */
/* ------------------------------------------------------------------ */
const EQUIPEMENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "MESURE", label: "Mesure" },
  { value: "CONSERVATION", label: "Conservation" },
  { value: "PREPARATION", label: "Préparation" },
  { value: "AUTRE", label: "Autre" },
];

const EQUIPEMENT_STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "CONFORME", label: "Conforme" },
  { value: "A_VERIFIER", label: "À vérifier" },
  { value: "NON_CONFORME", label: "Non conforme" },
  { value: "HORS_SERVICE", label: "Hors service" },
];

const MAINTENANCE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "PREVENTIVE", label: "Préventive" },
  { value: "CURATIVE", label: "Curative" },
  { value: "METROLOGIE", label: "Métrologie" },
  { value: "ETALONNAGE", label: "Étalonnage" },
  { value: "VERIF_REGLEMENTAIRE", label: "Vérification réglementaire" },
];

const MAINTENANCE_STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "PLANIFIEE", label: "Planifiée" },
  { value: "EN_COURS", label: "En cours" },
  { value: "REALISEE", label: "Réalisée" },
  { value: "ECHOUE", label: "Échouée" },
  { value: "ANNULEE", label: "Annulée" },
];

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
];

const LOCATIONS = [
  "PDA Robot 1",
  "PDA Robot 2",
  "Contrôle qualité",
  "Conditionnement",
  "Stock chambre froide",
  "Stock ambiant",
  "Officine",
  "Orthopédie",
  "Locaux techniques",
] as const;

const labelFor = (opts: { value: string; label: string }[], v: string | null): string =>
  opts.find((o) => o.value === v)?.label ?? String(v ?? "");

/** Statuts maintenance encore "actifs" (échéance opposable) */
const isMaintenancePending = (statut: string): boolean =>
  statut === "PLANIFIEE" || statut === "EN_COURS";

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF", "#CC88FF", "#FF8844"];

export function TabEquipements() {
  const {
    data: equipements,
    loading: loadingEquipements,
    create: createEquipement,
    update: updateEquipement,
    remove: removeEquipement,
  } = useSupabaseCrud<Equipement>("equipements", {
    orderBy: { column: "created_at", ascending: false },
  });

  const {
    data: maintenances,
    loading: loadingMaintenances,
    create: createMaintenance,
    update: updateMaintenance,
    remove: removeMaintenance,
  } = useSupabaseCrud<Maintenance>("maintenance", {
    orderBy: { column: "date_planifiee", ascending: true },
  });

  const [showAddEquipementModal, setShowAddEquipementModal] = useState(false);
  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
  const [deleteEquipementId, setDeleteEquipementId] = useState<string | null>(null);
  const [deleteMaintenanceId, setDeleteMaintenanceId] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterLocalisation, setFilterLocalisation] = useState<string>("all");

  const [newEquipement, setNewEquipement] = useState<Partial<EquipementInsert>>({
    nom: "",
    type: "AUTRE",
    statut: "CONFORME",
  });

  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceInsert>>({
    equipement_id: "",
    type: "PREVENTIVE",
    statut: "PLANIFIEE",
    date_planifiee: "",
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const conformes = equipements.filter((e) => e.statut === "CONFORME");
    const conformRate = equipements.length > 0 ? (conformes.length / equipements.length) * 100 : 0;

    const nonConformes = equipements.filter(
      (e) => e.statut === "NON_CONFORME" || e.statut === "HORS_SERVICE"
    );

    const overdueMaintenance = maintenances.filter((m) => {
      if (!m.date_planifiee) return false;
      const dueDate = new Date(m.date_planifiee);
      return dueDate < today && isMaintenancePending(m.statut);
    });

    const calibrations = maintenances.filter(
      (m) => m.type === "ETALONNAGE" || m.type === "METROLOGIE"
    );
    const calibrationsUpToDate = calibrations.filter((m) => {
      if (m.statut === "REALISEE") return true;
      if (!m.date_planifiee) return false;
      return new Date(m.date_planifiee) >= today;
    });
    const calibrationRate =
      calibrations.length > 0 ? (calibrationsUpToDate.length / calibrations.length) * 100 : 0;

    return {
      conformRate: Math.round(conformRate),
      maintenanceDue: overdueMaintenance.length,
      nonConformesCount: nonConformes.length,
      calibrationRate: Math.round(calibrationRate),
      overdueList: overdueMaintenance,
    };
  }, [equipements, maintenances]);

  // Filter equipements
  const filteredEquipements = useMemo(() => {
    return equipements.filter((e) => {
      if (filterType !== "all" && e.type !== filterType) return false;
      if (filterStatut !== "all" && e.statut !== filterStatut) return false;
      if (filterLocalisation !== "all" && e.localisation !== filterLocalisation) return false;
      return true;
    });
  }, [equipements, filterType, filterStatut, filterLocalisation]);

  // Chaîne du froid : équipements de conservation
  const coldChainEquipements = useMemo(() => {
    return equipements.filter((e) => e.type === "CONSERVATION");
  }, [equipements]);

  // Equipement lookup map
  const equipementMap = useMemo(() => {
    const map: Record<string, Equipement> = {};
    equipements.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [equipements]);

  // Maintenances with overdue highlighting
  const maintenancesWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return maintenances.map((m) => {
      const isOverdue =
        !!m.date_planifiee &&
        new Date(m.date_planifiee) < today &&
        isMaintenancePending(m.statut);
      return { ...m, isOverdue };
    });
  }, [maintenances]);

  // Chart data: maintenances by month (par type)
  const maintenancesByMonth = useMemo(() => {
    const monthlyData: Record<string, Record<string, string | number>> = {};

    maintenances.forEach((m) => {
      const refDate = m.date_realisee || m.date_planifiee || m.created_at;
      if (!refDate) return;
      const month = refDate.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month };
        MAINTENANCE_TYPE_OPTIONS.forEach((o) => {
          monthlyData[month][o.label] = 0;
        });
      }
      const lbl = labelFor(MAINTENANCE_TYPE_OPTIONS, m.type);
      monthlyData[month][lbl] = (Number(monthlyData[month][lbl]) || 0) + 1;
    });

    return Object.values(monthlyData).sort((a, b) =>
      String(a.month).localeCompare(String(b.month))
    );
  }, [maintenances]);

  // Chart data: equipements by type
  const equipementsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    equipements.forEach((e) => {
      const lbl = labelFor(EQUIPEMENT_TYPE_OPTIONS, e.type);
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [equipements]);

  const handleAddEquipement = async () => {
    try {
      await createEquipement(newEquipement as EquipementInsert);
      setShowAddEquipementModal(false);
      setNewEquipement({
        nom: "",
        type: "AUTRE",
        statut: "CONFORME",
      });
    } catch (error) {
      console.error("Error creating equipement:", error);
    }
  };

  const handleAddMaintenance = async () => {
    try {
      await createMaintenance(newMaintenance as MaintenanceInsert);
      setShowAddMaintenanceModal(false);
      setNewMaintenance({
        equipement_id: "",
        type: "PREVENTIVE",
        statut: "PLANIFIEE",
        date_planifiee: "",
      });
    } catch (error) {
      console.error("Error creating maintenance:", error);
    }
  };

  const handleDeleteEquipement = async () => {
    if (!deleteEquipementId) return;
    try {
      await removeEquipement(deleteEquipementId);
      setDeleteEquipementId(null);
    } catch (error) {
      console.error("Error deleting equipement:", error);
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!deleteMaintenanceId) return;
    try {
      await removeMaintenance(deleteMaintenanceId);
      setDeleteMaintenanceId(null);
    } catch (error) {
      console.error("Error deleting maintenance:", error);
    }
  };

  const equipementColumns: ColumnDef<Equipement>[] = [
    {
      key: "nom",
      label: "Nom",
      render: (eq) => (
        <EditableCell
          value={eq.nom}
          type="text"
          onSave={async (value) => {
            await updateEquipement(eq.id, { nom: String(value) });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (eq) => (
        <EditableCell
          value={eq.type || ""}
          type="select"
          options={EQUIPEMENT_TYPE_OPTIONS}
          onSave={async (value) => {
            await updateEquipement(eq.id, { type: String(value) });
          }}
        />
      ),
    },
    {
      key: "fournisseur",
      label: "Fournisseur",
      render: (eq) => (
        <EditableCell
          value={eq.fournisseur || ""}
          type="text"
          onSave={async (value) => {
            await updateEquipement(eq.id, { fournisseur: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "numero_serie",
      label: "N° série",
      render: (eq) => (
        <EditableCell
          value={eq.numero_serie || ""}
          type="text"
          onSave={async (value) => {
            await updateEquipement(eq.id, { numero_serie: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "localisation",
      label: "Localisation",
      render: (eq) => (
        <EditableCell
          value={eq.localisation || ""}
          type="select"
          options={LOCATIONS.map((l) => ({ value: l, label: l }))}
          onSave={async (value) => {
            await updateEquipement(eq.id, { localisation: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "date_prochain_etalonnage",
      label: "Prochain étalonnage",
      render: (eq) => (
        <EditableCell
          value={eq.date_prochain_etalonnage || ""}
          type="date"
          onSave={async (value) => {
            await updateEquipement(eq.id, { date_prochain_etalonnage: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "date_prochaine_maintenance",
      label: "Prochaine maintenance",
      render: (eq) => (
        <EditableCell
          value={eq.date_prochaine_maintenance || ""}
          type="date"
          onSave={async (value) => {
            await updateEquipement(eq.id, { date_prochaine_maintenance: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (eq) => (
        <EditableCell
          value={eq.statut}
          type="select"
          options={EQUIPEMENT_STATUT_OPTIONS}
          onSave={async (value) => {
            await updateEquipement(eq.id, { statut: String(value) });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (eq) => (
        <button
          onClick={() => setDeleteEquipementId(eq.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const maintenanceColumns: ColumnDef<Maintenance & { isOverdue?: boolean }>[] = [
    {
      key: "equipement_id",
      label: "Équipement",
      render: (m) => (
        <EditableCell
          value={m.equipement_id || ""}
          type="select"
          options={equipements.map((e) => ({ value: e.id, label: e.nom }))}
          onSave={async (value) => {
            await updateMaintenance(m.id, { equipement_id: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (m) => (
        <EditableCell
          value={m.type}
          type="select"
          options={MAINTENANCE_TYPE_OPTIONS}
          onSave={async (value) => {
            await updateMaintenance(m.id, { type: String(value) });
          }}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (m) => (
        <EditableCell
          value={m.statut}
          type="select"
          options={MAINTENANCE_STATUT_OPTIONS}
          onSave={async (value) => {
            await updateMaintenance(m.id, { statut: String(value) });
          }}
        />
      ),
    },
    {
      key: "date_planifiee",
      label: "Date planifiée",
      render: (m) => (
        <EditableCell
          value={m.date_planifiee || ""}
          type="date"
          onSave={async (value) => {
            await updateMaintenance(m.id, { date_planifiee: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "date_realisee",
      label: "Date réalisée",
      render: (m) => (
        <EditableCell
          value={m.date_realisee || ""}
          type="date"
          onSave={async (value) => {
            await updateMaintenance(m.id, { date_realisee: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "prestataire",
      label: "Prestataire",
      render: (m) => (
        <EditableCell
          value={m.prestataire || ""}
          type="text"
          onSave={async (value) => {
            await updateMaintenance(m.id, { prestataire: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "resultats",
      label: "Résultats",
      render: (m) => (
        <EditableCell
          value={m.resultats || ""}
          type="text"
          onSave={async (value) => {
            await updateMaintenance(m.id, { resultats: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "conforme",
      label: "Conforme",
      render: (m) => (
        <EditableCell
          value={m.conforme === null ? "" : String(m.conforme)}
          type="select"
          options={BOOLEAN_OPTIONS}
          onSave={async (value) => {
            await updateMaintenance(m.id, { conforme: value === "true" });
          }}
        />
      ),
    },
    {
      key: "rapport_url",
      label: "Rapport",
      render: (m) => (
        <EditableCell
          value={m.rapport_url || ""}
          type="text"
          onSave={async (value) => {
            await updateMaintenance(m.id, { rapport_url: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (m) => (
        <button
          onClick={() => setDeleteMaintenanceId(m.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const coldChainColumns: ColumnDef<Equipement>[] = [
    {
      key: "nom",
      label: "Nom",
      render: (eq) => <span className="text-sm text-text">{eq.nom}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (eq) => <Badge variant="plan">{labelFor(EQUIPEMENT_TYPE_OPTIONS, eq.type)}</Badge>,
    },
    {
      key: "localisation",
      label: "Localisation",
      render: (eq) => <span className="text-sm text-sec">{eq.localisation || "-"}</span>,
    },
    {
      key: "statut",
      label: "Statut",
      render: (eq) => {
        let variant: "ok" | "wip" | "crit" | "plan" = "plan";
        if (eq.statut === "CONFORME") variant = "ok";
        else if (eq.statut === "A_VERIFIER") variant = "wip";
        else if (eq.statut === "NON_CONFORME" || eq.statut === "HORS_SERVICE") variant = "crit";

        return <Badge variant={variant}>{labelFor(EQUIPEMENT_STATUT_OPTIONS, eq.statut)}</Badge>;
      },
    },
  ];

  if (loadingEquipements || loadingMaintenances) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-mut">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<ToolIcon size={20} />}
          label="Équipements conformes"
          value={`${kpis.conformRate}%`}
          subtitle="Conformes / Total"
        />
        <KpiCard
          icon={<ToolIcon size={20} />}
          label="Maintenances dues"
          value={kpis.maintenanceDue.toString()}
          subtitle="Action requise"
          accent="amber"
        />
        <KpiCard
          icon={<ToolIcon size={20} />}
          label="Non conformes"
          value={kpis.nonConformesCount.toString()}
          subtitle="Non conformes + hors service"
        />
        <KpiCard
          icon={<ToolIcon size={20} />}
          label="Étalonnages à jour"
          value={`${kpis.calibrationRate}%`}
          subtitle="À jour / Total"
        />
      </div>

      {/* Overdue Maintenance Alerts */}
      {kpis.overdueList.length > 0 && (
        <div className="space-y-2">
          {kpis.overdueList.map((maint) => {
            const equipement = maint.equipement_id ? equipementMap[maint.equipement_id] : undefined;
            return (
              <AlertLine
                key={maint.id}
                severity="red"
                message={`Maintenance en retard — ${equipement?.nom || "Équipement inconnu"} — ${labelFor(MAINTENANCE_TYPE_OPTIONS, maint.type)} échéance ${maint.date_planifiee}`}
                href={`#maintenance-${maint.id}`}
              />
            );
          })}
        </div>
      )}

      {/* Section: Registre Équipements */}
      <div className="bg-card border border-brd rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Registre Équipements</h2>
          <AddButton onClick={() => setShowAddEquipementModal(true)} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Tous types</option>
            {EQUIPEMENT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Tous statuts</option>
            {EQUIPEMENT_STATUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={filterLocalisation}
            onChange={(e) => setFilterLocalisation(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Toutes localisations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <DataTable columns={equipementColumns} data={filteredEquipements} />
      </div>

      {/* Section: Calendrier Maintenance */}
      <div className="bg-card border border-brd rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Calendrier Maintenance</h2>
          <AddButton onClick={() => setShowAddMaintenanceModal(true)} />
        </div>

        <DataTable
          columns={maintenanceColumns}
          data={maintenancesWithStatus}
        />
      </div>

      {/* Section: Chaîne du froid */}
      <div className="bg-card border border-brd rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Chaîne du froid</h2>
        <DataTable columns={coldChainColumns} data={coldChainEquipements} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenances par mois */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Maintenances par mois
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={maintenancesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              {MAINTENANCE_TYPE_OPTIONS.map((o, i) => (
                <Bar key={o.value} dataKey={o.label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Équipements par type */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Équipements par type
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={equipementsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {equipementsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Equipement Modal */}
      {showAddEquipementModal && (
        <Modal
          isOpen={showAddEquipementModal}
          title="Nouvel Équipement"
          onClose={() => setShowAddEquipementModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={newEquipement.nom}
                onChange={(e) => setNewEquipement({ ...newEquipement, nom: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Nom de l'équipement"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Type
                </label>
                <select
                  value={newEquipement.type || "AUTRE"}
                  onChange={(e) => setNewEquipement({ ...newEquipement, type: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {EQUIPEMENT_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Statut
                </label>
                <select
                  value={newEquipement.statut || "CONFORME"}
                  onChange={(e) => setNewEquipement({ ...newEquipement, statut: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {EQUIPEMENT_STATUT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Fournisseur
                </label>
                <input
                  type="text"
                  value={newEquipement.fournisseur || ""}
                  onChange={(e) => setNewEquipement({ ...newEquipement, fournisseur: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="Fournisseur de l'équipement"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  N° série
                </label>
                <input
                  type="text"
                  value={newEquipement.numero_serie || ""}
                  onChange={(e) => setNewEquipement({ ...newEquipement, numero_serie: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="Numéro de série"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Localisation
              </label>
              <select
                value={newEquipement.localisation || ""}
                onChange={(e) => setNewEquipement({ ...newEquipement, localisation: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                <option value="">Sélectionner</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Prochain étalonnage
                </label>
                <input
                  type="date"
                  value={newEquipement.date_prochain_etalonnage || ""}
                  onChange={(e) =>
                    setNewEquipement({ ...newEquipement, date_prochain_etalonnage: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Prochaine maintenance
                </label>
                <input
                  type="date"
                  value={newEquipement.date_prochaine_maintenance || ""}
                  onChange={(e) =>
                    setNewEquipement({ ...newEquipement, date_prochaine_maintenance: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Notes
              </label>
              <textarea
                value={newEquipement.notes || ""}
                onChange={(e) => setNewEquipement({ ...newEquipement, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Notes complémentaires..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddEquipementModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddEquipement}
                disabled={!newEquipement.nom}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Maintenance Modal */}
      {showAddMaintenanceModal && (
        <Modal
          isOpen={showAddMaintenanceModal}
          title="Nouvelle Maintenance"
          onClose={() => setShowAddMaintenanceModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Équipement *
              </label>
              <select
                value={newMaintenance.equipement_id || ""}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, equipement_id: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                <option value="">Sélectionner un équipement</option>
                {equipements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Type
                </label>
                <select
                  value={newMaintenance.type || "PREVENTIVE"}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {MAINTENANCE_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Statut
                </label>
                <select
                  value={newMaintenance.statut || "PLANIFIEE"}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, statut: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {MAINTENANCE_STATUT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Date planifiée *
                </label>
                <input
                  type="date"
                  value={newMaintenance.date_planifiee || ""}
                  onChange={(e) =>
                    setNewMaintenance({ ...newMaintenance, date_planifiee: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Date réalisée
                </label>
                <input
                  type="date"
                  value={newMaintenance.date_realisee || ""}
                  onChange={(e) =>
                    setNewMaintenance({ ...newMaintenance, date_realisee: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Prestataire
              </label>
              <input
                type="text"
                value={newMaintenance.prestataire || ""}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, prestataire: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Nom du prestataire"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Description
              </label>
              <input
                type="text"
                value={newMaintenance.description || ""}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Description de l'intervention"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Résultats
              </label>
              <input
                type="text"
                value={newMaintenance.resultats || ""}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, resultats: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Résultats de la maintenance"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Rapport (URL)
              </label>
              <input
                type="text"
                value={newMaintenance.rapport_url || ""}
                onChange={(e) =>
                  setNewMaintenance({ ...newMaintenance, rapport_url: e.target.value })
                }
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Lien vers le rapport ou certificat"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddMaintenanceModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMaintenance}
                disabled={!newMaintenance.equipement_id || !newMaintenance.date_planifiee}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Equipement Confirmation */}
      {deleteEquipementId && (
        <ConfirmDelete
          isOpen={!!deleteEquipementId}
          itemName="cet équipement"
          onConfirm={handleDeleteEquipement}
          onCancel={() => setDeleteEquipementId(null)}
        />
      )}

      {/* Delete Maintenance Confirmation */}
      {deleteMaintenanceId && (
        <ConfirmDelete
          isOpen={!!deleteMaintenanceId}
          itemName="cette maintenance"
          onConfirm={handleDeleteMaintenance}
          onCancel={() => setDeleteMaintenanceId(null)}
        />
      )}
    </div>
  );
}
