"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Equipment, Maintenance, EquipmentInsert, MaintenanceInsert } from "@/lib/database.types";
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

const EQUIPMENT_STATUSES = [
  "Opérationnel",
  "En panne",
  "En maintenance",
  "Décommissionné",
] as const;

const CRITICALITIES = ["Critique", "Important", "Standard"] as const;

const EQUIPMENT_CATEGORIES = [
  "Balance",
  "Automate",
  "Groupe froid",
  "Sonde température",
  "Ordinateur",
  "Imprimante",
  "Scanner",
  "Thermomètre",
  "pH-mètre",
  "Autre",
] as const;

const MAINTENANCE_TYPES = ["Préventive", "Curative", "Étalonnage"] as const;

const MAINTENANCE_STATUSES = ["Planifiée", "Réalisée", "En retard"] as const;

const FREQUENCIES = [
  "Annuelle",
  "Semestrielle",
  "Trimestrielle",
  "Mensuelle",
  "Autre",
] as const;

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

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF", "#CC88FF", "#FF8844"];

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

export function TabEquipements() {
  const {
    data: equipments,
    loading: loadingEquipments,
    create: createEquipment,
    update: updateEquipment,
    remove: removeEquipment,
  } = useSupabaseCrud<Equipment>("equipment", {
    orderBy: { column: "created_at", ascending: false },
  });

  const {
    data: maintenances,
    loading: loadingMaintenances,
    create: createMaintenance,
    update: updateMaintenance,
    remove: removeMaintenance,
  } = useSupabaseCrud<Maintenance>("maintenance", {
    orderBy: { column: "next_due_at", ascending: true },
  });

  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<string | null>(null);
  const [deleteMaintenanceId, setDeleteMaintenanceId] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCriticality, setFilterCriticality] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");

  const [newEquipment, setNewEquipment] = useState<Partial<EquipmentInsert>>({
    name: "",
    category: "Autre",
    status: "Opérationnel",
    criticality: "Standard",
  });

  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceInsert>>({
    equipment_id: "",
    type: "Préventive",
    frequency: "Annuelle",
    next_due_at: "",
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const operational = equipments.filter((e) => e.status === "Opérationnel");
    const conformRate = equipments.length > 0 ? (operational.length / equipments.length) * 100 : 0;

    const criticalEquipments = equipments.filter((e) => e.criticality === "Critique");

    const overdueMaintenance = maintenances.filter((m) => {
      const dueDate = new Date(m.next_due_at);
      return dueDate < today && m.status !== "Réalisée";
    });

    const calibrations = maintenances.filter((m) => m.type === "Étalonnage");
    const calibrationsUpToDate = calibrations.filter((m) => {
      const dueDate = new Date(m.next_due_at);
      return dueDate >= today || m.status === "Réalisée";
    });
    const calibrationRate =
      calibrations.length > 0 ? (calibrationsUpToDate.length / calibrations.length) * 100 : 0;

    return {
      conformRate: Math.round(conformRate),
      maintenanceDue: overdueMaintenance.length,
      criticalCount: criticalEquipments.length,
      calibrationRate: Math.round(calibrationRate),
      overdueList: overdueMaintenance,
    };
  }, [equipments, maintenances]);

  // Filter equipments
  const filteredEquipments = useMemo(() => {
    return equipments.filter((e) => {
      if (filterCategory !== "all" && e.category !== filterCategory) return false;
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      if (filterCriticality !== "all" && e.criticality !== filterCriticality) return false;
      if (filterLocation !== "all" && e.location !== filterLocation) return false;
      return true;
    });
  }, [equipments, filterCategory, filterStatus, filterCriticality, filterLocation]);

  // Chaîne du froid equipments
  const coldChainEquipments = useMemo(() => {
    return equipments.filter(
      (e) => e.category === "Groupe froid" || e.category === "Sonde température"
    );
  }, [equipments]);

  // Equipment lookup map
  const equipmentMap = useMemo(() => {
    const map: Record<string, Equipment> = {};
    equipments.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [equipments]);

  // Maintenances with overdue highlighting
  const maintenancesWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return maintenances.map((m) => {
      const dueDate = new Date(m.next_due_at);
      const isOverdue = dueDate < today && m.status !== "Réalisée";
      return { ...m, isOverdue };
    });
  }, [maintenances]);

  // Chart data: maintenances by month
  const maintenancesByMonth = useMemo(() => {
    const monthlyData: Record<
      string,
      { month: string; Préventive: number; Curative: number; Étalonnage: number }
    > = {};

    maintenances.forEach((m) => {
      const month = m.last_done_at ? m.last_done_at.substring(0, 7) : m.created_at.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month, Préventive: 0, Curative: 0, Étalonnage: 0 };
      }
      if (m.type === "Préventive") monthlyData[month].Préventive += 1;
      if (m.type === "Curative") monthlyData[month].Curative += 1;
      if (m.type === "Étalonnage") monthlyData[month].Étalonnage += 1;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [maintenances]);

  // Chart data: equipments by category
  const equipmentsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    equipments.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [equipments]);

  const handleAddEquipment = async () => {
    try {
      await createEquipment(newEquipment as EquipmentInsert);
      setShowAddEquipmentModal(false);
      setNewEquipment({
        name: "",
        category: "Autre",
        status: "Opérationnel",
        criticality: "Standard",
      });
    } catch (error) {
      console.error("Error creating equipment:", error);
    }
  };

  const handleAddMaintenance = async () => {
    try {
      await createMaintenance(newMaintenance as MaintenanceInsert);
      setShowAddMaintenanceModal(false);
      setNewMaintenance({
        equipment_id: "",
        type: "Préventive",
        frequency: "Annuelle",
        next_due_at: "",
      });
    } catch (error) {
      console.error("Error creating maintenance:", error);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!deleteEquipmentId) return;
    try {
      await removeEquipment(deleteEquipmentId);
      setDeleteEquipmentId(null);
    } catch (error) {
      console.error("Error deleting equipment:", error);
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

  const equipmentColumns: ColumnDef<Equipment>[] = [
    {
      key: "name",
      label: "Nom",
      render: (eq) => (
        <EditableCell
          value={eq.name}
          type="text"
          onSave={async (value) => {
            await updateEquipment(eq.id, { name: String(value) });
          }}
        />
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (eq) => (
        <EditableCell
          value={eq.category}
          type="select"
          options={EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          onSave={async (value) => {
            await updateEquipment(eq.id, { category: String(value) });
          }}
        />
      ),
    },
    {
      key: "brand_model",
      label: "Marque / Modèle",
      render: (eq) => (
        <EditableCell
          value={eq.brand_model || ""}
          type="text"
          onSave={async (value) => {
            await updateEquipment(eq.id, { brand_model: String(value) });
          }}
        />
      ),
    },
    {
      key: "serial_no",
      label: "N° série",
      render: (eq) => (
        <EditableCell
          value={eq.serial_no || ""}
          type="text"
          onSave={async (value) => {
            await updateEquipment(eq.id, { serial_no: String(value) });
          }}
        />
      ),
    },
    {
      key: "location",
      label: "Localisation",
      render: (eq) => (
        <EditableCell
          value={eq.location || ""}
          type="select"
          options={LOCATIONS.map((l) => ({ value: l, label: l }))}
          onSave={async (value) => {
            await updateEquipment(eq.id, { location: String(value) });
          }}
        />
      ),
    },
    {
      key: "commissioned_at",
      label: "Mise en service",
      render: (eq) => (
        <EditableCell
          value={eq.commissioned_at || ""}
          type="date"
          onSave={async (value) => {
            await updateEquipment(eq.id, { commissioned_at: String(value) });
          }}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (eq) => (
        <EditableCell
          value={eq.status}
          type="select"
          options={EQUIPMENT_STATUSES.map((s) => ({ value: s, label: s }))}
          onSave={async (value) => {
            await updateEquipment(eq.id, { status: String(value) });
          }}
        />
      ),
    },
    {
      key: "criticality",
      label: "Criticité",
      render: (eq) => (
        <EditableCell
          value={eq.criticality}
          type="select"
          options={CRITICALITIES.map((c) => ({ value: c, label: c }))}
          onSave={async (value) => {
            await updateEquipment(eq.id, { criticality: String(value) });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (eq) => (
        <button
          onClick={() => setDeleteEquipmentId(eq.id)}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const maintenanceColumns: ColumnDef<Maintenance & { isOverdue?: boolean }>[] = [
    {
      key: "equipment_id",
      label: "Équipement",
      render: (m) => {
        const equipment = equipmentMap[m.equipment_id];
        return (
          <EditableCell
            value={m.equipment_id}
            type="select"
            options={equipments.map((e) => ({ value: e.id, label: e.name }))}
            onSave={async (value) => {
              await updateMaintenance(m.id, { equipment_id: String(value) });
            }}
          />
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (m) => (
        <EditableCell
          value={m.type}
          type="select"
          options={MAINTENANCE_TYPES.map((t) => ({ value: t, label: t }))}
          onSave={async (value) => {
            await updateMaintenance(m.id, { type: String(value) });
          }}
        />
      ),
    },
    {
      key: "frequency",
      label: "Fréquence",
      render: (m) => (
        <EditableCell
          value={m.frequency || ""}
          type="select"
          options={FREQUENCIES.map((f) => ({ value: f, label: f }))}
          onSave={async (value) => {
            await updateMaintenance(m.id, { frequency: String(value) });
          }}
        />
      ),
    },
    {
      key: "last_done_at",
      label: "Dernière réalisation",
      render: (m) => (
        <EditableCell
          value={m.last_done_at || ""}
          type="date"
          onSave={async (value) => {
            await updateMaintenance(m.id, { last_done_at: String(value) });
          }}
        />
      ),
    },
    {
      key: "next_due_at",
      label: "Prochaine échéance",
      render: (m) => (
        <EditableCell
          value={m.next_due_at}
          type="date"
          onSave={async (value) => {
            await updateMaintenance(m.id, { next_due_at: String(value) });
          }}
        />
      ),
    },
    {
      key: "provider",
      label: "Prestataire",
      render: (m) => (
        <EditableCell
          value={m.provider || ""}
          type="text"
          onSave={async (value) => {
            await updateMaintenance(m.id, { provider: String(value) });
          }}
        />
      ),
    },
    {
      key: "result",
      label: "Résultat",
      render: (m) => (
        <EditableCell
          value={m.result || ""}
          type="text"
          onSave={async (value) => {
            await updateMaintenance(m.id, { result: String(value) });
          }}
        />
      ),
    },
    {
      key: "certificate_ref",
      label: "Référence certificat",
      render: (m) => (
        <EditableCell
          value={m.certificate_ref || ""}
          type="text"
          onSave={async (value) => {
            await updateMaintenance(m.id, { certificate_ref: String(value) });
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
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const coldChainColumns: ColumnDef<Equipment>[] = [
    {
      key: "name",
      label: "Nom",
      render: (eq) => <span className="text-sm text-[var(--text-primary)]">{eq.name}</span>,
    },
    {
      key: "category",
      label: "Catégorie",
      render: (eq) => <Badge variant="plan">{eq.category}</Badge>,
    },
    {
      key: "location",
      label: "Localisation",
      render: (eq) => <span className="text-sm text-[var(--text-secondary)]">{eq.location || "-"}</span>,
    },
    {
      key: "status",
      label: "Statut",
      render: (eq) => {
        let variant: "ok" | "wip" | "crit" | "plan" = "plan";
        if (eq.status === "Opérationnel") variant = "ok";
        else if (eq.status === "En maintenance") variant = "wip";
        else if (eq.status === "En panne" || eq.status === "Décommissionné") variant = "crit";

        return <Badge variant={variant}>{eq.status}</Badge>;
      },
    },
  ];

  if (loadingEquipments || loadingMaintenances) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--text-muted)]">Chargement...</p>
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
          subtitle="Opérationnels / Total"
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
          label="Critiques"
          value={kpis.criticalCount.toString()}
          subtitle="Équipements critiques"
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
            const equipment = equipmentMap[maint.equipment_id];
            return (
              <AlertLine
                key={maint.id}
                severity="red"
                message={`Maintenance en retard — ${equipment?.name || "Équipement inconnu"} — ${maint.type} échéance ${maint.next_due_at}`}
                href={`#maintenance-${maint.id}`}
              />
            );
          })}
        </div>
      )}

      {/* Section: Registre Équipements */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Registre Équipements</h2>
          <AddButton onClick={() => setShowAddEquipmentModal(true)} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
          >
            <option value="all">Toutes catégories</option>
            {EQUIPMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
          >
            <option value="all">Tous statuts</option>
            {EQUIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
            className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
          >
            <option value="all">Toutes criticités</option>
            {CRITICALITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
          >
            <option value="all">Toutes localisations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <DataTable columns={equipmentColumns} data={filteredEquipments} />
      </div>

      {/* Section: Calendrier Maintenance */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Calendrier Maintenance</h2>
          <AddButton onClick={() => setShowAddMaintenanceModal(true)} />
        </div>

        <DataTable
          columns={maintenanceColumns}
          data={maintenancesWithStatus}
        />
      </div>

      {/* Section: Chaîne du froid */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Chaîne du froid</h2>
        <DataTable columns={coldChainColumns} data={coldChainEquipments} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenances par mois */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
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
              <Bar dataKey="Préventive" fill={THEME_COLORS.grn} />
              <Bar dataKey="Curative" fill={THEME_COLORS.red} />
              <Bar dataKey="Étalonnage" fill={THEME_COLORS.amb} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Équipements par catégorie */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Équipements par catégorie
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={equipmentsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {equipmentsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddEquipmentModal && (
        <Modal
          isOpen={showAddEquipmentModal}
          title="Nouvel Équipement"
          onClose={() => setShowAddEquipmentModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Nom *
              </label>
              <input
                type="text"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                placeholder="Nom de l'équipement"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Catégorie
                </label>
                <select
                  value={newEquipment.category}
                  onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                >
                  {EQUIPMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Criticité
                </label>
                <select
                  value={newEquipment.criticality}
                  onChange={(e) => setNewEquipment({ ...newEquipment, criticality: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                >
                  {CRITICALITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Marque / Modèle
                </label>
                <input
                  type="text"
                  value={newEquipment.brand_model || ""}
                  onChange={(e) => setNewEquipment({ ...newEquipment, brand_model: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                  placeholder="Fabricant et modèle"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  N° série
                </label>
                <input
                  type="text"
                  value={newEquipment.serial_no || ""}
                  onChange={(e) => setNewEquipment({ ...newEquipment, serial_no: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                  placeholder="Numéro de série"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Localisation
                </label>
                <select
                  value={newEquipment.location || ""}
                  onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                >
                  <option value="">Sélectionner</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Mise en service
                </label>
                <input
                  type="date"
                  value={newEquipment.commissioned_at || ""}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, commissioned_at: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Statut
              </label>
              <select
                value={newEquipment.status}
                onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
              >
                {EQUIPMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddEquipment}
                disabled={!newEquipment.name}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Équipement *
              </label>
              <select
                value={newMaintenance.equipment_id}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, equipment_id: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
              >
                <option value="">Sélectionner un équipement</option>
                {equipments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Type
                </label>
                <select
                  value={newMaintenance.type}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                >
                  {MAINTENANCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Fréquence
                </label>
                <select
                  value={newMaintenance.frequency || ""}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, frequency: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Dernière réalisation
                </label>
                <input
                  type="date"
                  value={newMaintenance.last_done_at || ""}
                  onChange={(e) =>
                    setNewMaintenance({ ...newMaintenance, last_done_at: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Prochaine échéance *
                </label>
                <input
                  type="date"
                  value={newMaintenance.next_due_at}
                  onChange={(e) =>
                    setNewMaintenance({ ...newMaintenance, next_due_at: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Prestataire
              </label>
              <input
                type="text"
                value={newMaintenance.provider || ""}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, provider: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                placeholder="Nom du prestataire"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Résultat
              </label>
              <input
                type="text"
                value={newMaintenance.result || ""}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, result: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                placeholder="Résultat de la maintenance"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Référence certificat
              </label>
              <input
                type="text"
                value={newMaintenance.certificate_ref || ""}
                onChange={(e) =>
                  setNewMaintenance({ ...newMaintenance, certificate_ref: e.target.value })
                }
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                placeholder="Numéro certificat"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddMaintenanceModal(false)}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMaintenance}
                disabled={!newMaintenance.equipment_id || !newMaintenance.next_due_at}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Equipment Confirmation */}
      {deleteEquipmentId && (
        <ConfirmDelete
          isOpen={!!deleteEquipmentId}
          itemName="cet équipement"
          onConfirm={handleDeleteEquipment}
          onCancel={() => setDeleteEquipmentId(null)}
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
