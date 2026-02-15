"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Supplier, SupplierEvent, SupplierInsert, SupplierEventInsert } from "@/lib/database.types";
import {
  KpiCard,
  DataTable,
  EditableCell,
  Badge,
  AddButton,
  Modal,
  ConfirmDelete,
  type ColumnDef,
} from "@/components/ui";
import { TruckIcon, TrashIcon } from "@/components/icons";
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

const SUPPLIER_TYPES = ["Grossiste", "Fabricant", "Prestataire", "Sous-traitant"] as const;

const EVENT_TYPES = ["Rupture", "Qualité", "Délai", "Conformité"] as const;

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
];

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF"];

function getScoreBadgeVariant(score: number | null): "ok" | "wip" | "crit" {
  if (score === null) return "wip";
  if (score >= 70) return "ok";
  if (score >= 50) return "wip";
  return "crit";
}

function getScoreColor(score: number | null): string {
  if (score === null) return THEME_COLORS.muted;
  if (score >= 70) return THEME_COLORS.grn;
  if (score >= 50) return THEME_COLORS.amb;
  return THEME_COLORS.red;
}

export function TabFournisseurs() {
  const {
    data: suppliers,
    loading: loadingSuppliers,
    create: createSupplier,
    update: updateSupplier,
    remove: removeSupplier,
  } = useSupabaseCrud<Supplier>("suppliers", {
    orderBy: { column: "name", ascending: true },
  });

  const {
    data: supplierEvents,
    loading: loadingEvents,
    create: createEvent,
    update: updateEvent,
    remove: removeEvent,
  } = useSupabaseCrud<SupplierEvent>("supplier_events", {
    orderBy: { column: "created_at", ascending: false },
  });

  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterScoreMin, setFilterScoreMin] = useState<number>(0);
  const [filterScoreMax, setFilterScoreMax] = useState<number>(100);
  const [filterRgpd, setFilterRgpd] = useState<string>("all");
  const [filterHds, setFilterHds] = useState<string>("all");

  const [newSupplier, setNewSupplier] = useState<Partial<SupplierInsert>>({
    name: "",
    type: "Grossiste",
    rgpd_clause: false,
    hds_compliant: false,
  });

  const [newEvent, setNewEvent] = useState<Partial<SupplierEventInsert>>({
    supplier_id: "",
    type: "Rupture",
    description: "",
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalSuppliers = suppliers.length;

    const scores = suppliers
      .filter((s) => s.eval_score !== null)
      .map((s) => s.eval_score as number);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((acc, s) => acc + s, 0) / scores.length)
      : 0;

    const incidentsOpen = supplierEvents.length;

    const rgpdCompliant = suppliers.filter((s) => s.rgpd_clause).length;
    const rgpdCompliantPercent = totalSuppliers > 0
      ? Math.round((rgpdCompliant / totalSuppliers) * 100)
      : 0;

    return {
      totalSuppliers,
      avgScore,
      incidentsOpen,
      rgpdCompliantPercent,
    };
  }, [suppliers, supplierEvents]);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (filterType !== "all" && s.type !== filterType) return false;
      if (filterCategory !== "all" && s.category !== filterCategory) return false;
      if (s.eval_score !== null) {
        if (s.eval_score < filterScoreMin || s.eval_score > filterScoreMax) return false;
      }
      if (filterRgpd !== "all") {
        const rgpdValue = filterRgpd === "true";
        if (s.rgpd_clause !== rgpdValue) return false;
      }
      if (filterHds !== "all") {
        const hdsValue = filterHds === "true";
        if (s.hds_compliant !== hdsValue) return false;
      }
      return true;
    });
  }, [suppliers, filterType, filterCategory, filterScoreMin, filterScoreMax, filterRgpd, filterHds]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(suppliers.map((s) => s.category).filter((c) => c !== null));
    return Array.from(cats);
  }, [suppliers]);

  // Chart data: suppliers by type
  const suppliersByType = useMemo(() => {
    const counts: Record<string, number> = {};
    suppliers.forEach((s) => {
      counts[s.type] = (counts[s.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [suppliers]);

  // Chart data: RGPD compliance
  const rgpdData = useMemo(() => {
    const compliant = suppliers.filter((s) => s.rgpd_clause).length;
    const nonCompliant = suppliers.length - compliant;
    return [
      { name: "Conforme RGPD", value: compliant },
      { name: "Non conforme", value: nonCompliant },
    ];
  }, [suppliers]);

  // Chart data: scores by supplier (top 10)
  const scoresBySupplier = useMemo(() => {
    return suppliers
      .filter((s) => s.eval_score !== null)
      .map((s) => ({
        name: s.name.length > 20 ? s.name.substring(0, 20) + "..." : s.name,
        score: s.eval_score,
        color: getScoreColor(s.eval_score),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);
  }, [suppliers]);

  // Supplier map for events
  const supplierMap = useMemo(() => {
    const map: Record<string, string> = {};
    suppliers.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [suppliers]);

  const handleAddSupplier = async () => {
    try {
      await createSupplier(newSupplier as SupplierInsert);
      setShowAddSupplierModal(false);
      setNewSupplier({
        name: "",
        type: "Grossiste",
        rgpd_clause: false,
        hds_compliant: false,
      });
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  const handleAddEvent = async () => {
    try {
      await createEvent(newEvent as SupplierEventInsert);
      setShowAddEventModal(false);
      setNewEvent({
        supplier_id: "",
        type: "Rupture",
        description: "",
      });
    } catch (error) {
      console.error("Error creating supplier event:", error);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteSupplierId) return;
    try {
      await removeSupplier(deleteSupplierId);
      setDeleteSupplierId(null);
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    try {
      await removeEvent(deleteEventId);
      setDeleteEventId(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const supplierColumns: ColumnDef<Supplier>[] = [
    {
      key: "name",
      label: "Nom",
      render: (supplier) => (
        <EditableCell
          value={supplier.name}
          type="text"
          onSave={async (value) => {
            await updateSupplier(supplier.id, { name: String(value) });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (supplier) => (
        <EditableCell
          value={supplier.type}
          type="select"
          options={SUPPLIER_TYPES.map((t) => ({ value: t, label: t }))}
          onSave={async (value) => {
            await updateSupplier(supplier.id, { type: String(value) });
          }}
        />
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (supplier) => (
        <EditableCell
          value={supplier.category || ""}
          type="text"
          onSave={async (value) => {
            await updateSupplier(supplier.id, { category: String(value) });
          }}
        />
      ),
    },
    {
      key: "contract",
      label: "Contrat",
      render: (supplier) => (
        <EditableCell
          value={supplier.contract || ""}
          type="text"
          onSave={async (value) => {
            await updateSupplier(supplier.id, { contract: String(value) });
          }}
        />
      ),
    },
    {
      key: "last_eval_at",
      label: "Dernière évaluation",
      render: (supplier) => (
        <EditableCell
          value={supplier.last_eval_at || ""}
          type="date"
          onSave={async (value) => {
            await updateSupplier(supplier.id, { last_eval_at: String(value) });
          }}
        />
      ),
    },
    {
      key: "eval_score",
      label: "Score évaluation",
      render: (supplier) => (
        <div className="flex items-center gap-2">
          <EditableCell
            value={supplier.eval_score?.toString() || ""}
            type="number"
            onSave={async (value) => {
              const score = value ? parseFloat(String(value)) : null;
              await updateSupplier(supplier.id, { eval_score: score });
            }}
          />
          {supplier.eval_score !== null && (
            <Badge variant={getScoreBadgeVariant(supplier.eval_score)}>
              {supplier.eval_score}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "rgpd_clause",
      label: "Clause RGPD",
      render: (supplier) => (
        <EditableCell
          value={supplier.rgpd_clause.toString()}
          type="select"
          options={BOOLEAN_OPTIONS}
          onSave={async (value) => {
            await updateSupplier(supplier.id, { rgpd_clause: value === "true" });
          }}
        />
      ),
    },
    {
      key: "hds_compliant",
      label: "Conformité HDS",
      render: (supplier) => (
        <EditableCell
          value={supplier.hds_compliant.toString()}
          type="select"
          options={BOOLEAN_OPTIONS}
          onSave={async (value) => {
            await updateSupplier(supplier.id, { hds_compliant: value === "true" });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (supplier) => (
        <button
          onClick={() => setDeleteSupplierId(supplier.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const eventColumns: ColumnDef<SupplierEvent>[] = [
    {
      key: "supplier_id",
      label: "Fournisseur",
      render: (event) => (
        <EditableCell
          value={event.supplier_id}
          type="select"
          options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          onSave={async (value) => {
            await updateEvent(event.id, { supplier_id: String(value) });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (event) => (
        <EditableCell
          value={event.type}
          type="select"
          options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
          onSave={async (value) => {
            await updateEvent(event.id, { type: String(value) });
          }}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (event) => (
        <EditableCell
          value={event.description}
          type="text"
          onSave={async (value) => {
            await updateEvent(event.id, { description: String(value) });
          }}
        />
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (event) => (
        <EditableCell
          value={event.action || ""}
          type="text"
          onSave={async (value) => {
            await updateEvent(event.id, { action: String(value) });
          }}
        />
      ),
    },
    {
      key: "capa_id",
      label: "Lien CAPA",
      render: (event) => (
        <div>
          {event.capa_id ? (
            <a
              href={`/dashboard/capa#capa-${event.capa_id}`}
              className="text-xs font-mono text-accent hover:underline"
            >
              CAPA-{event.capa_id.substring(0, 4).toUpperCase()}
            </a>
          ) : (
            <span className="text-xs text-mut">Aucun</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (event) => (
        <button
          onClick={() => setDeleteEventId(event.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  if (loadingSuppliers || loadingEvents) {
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
          icon={<TruckIcon size={20} />}
          label="Total fournisseurs"
          value={kpis.totalSuppliers.toString()}
          subtitle="Fournisseurs actifs"
        />
        <KpiCard
          icon={<TruckIcon size={20} />}
          label="Score moyen évaluation"
          value={kpis.avgScore.toString()}
          subtitle="Moyenne des scores"
          accent={kpis.avgScore < 7 ? "amber" : "default"}
        />
        <KpiCard
          icon={<TruckIcon size={20} />}
          label="Incidents ouverts"
          value={kpis.incidentsOpen.toString()}
          subtitle="Événements enregistrés"
          accent={kpis.incidentsOpen > 0 ? "amber" : "default"}
        />
        <KpiCard
          icon={<TruckIcon size={20} />}
          label="RGPD conformes"
          value={`${kpis.rgpdCompliantPercent}%`}
          subtitle="Clause RGPD signée"
          accent={kpis.rgpdCompliantPercent >= 80 ? "default" : "amber"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
        >
          <option value="all">Tous types</option>
          {SUPPLIER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-sec">Score:</span>
          <input
            type="number"
            min="0"
            max="100"
            value={filterScoreMin}
            onChange={(e) => setFilterScoreMin(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text"
          />
          <span className="text-xs text-sec">-</span>
          <input
            type="number"
            min="0"
            max="100"
            value={filterScoreMax}
            onChange={(e) => setFilterScoreMax(parseInt(e.target.value) || 100)}
            className="w-16 px-2 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text"
          />
        </div>

        <select
          value={filterRgpd}
          onChange={(e) => setFilterRgpd(e.target.value)}
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
        >
          <option value="all">RGPD: Tous</option>
          <option value="true">RGPD: Oui</option>
          <option value="false">RGPD: Non</option>
        </select>

        <select
          value={filterHds}
          onChange={(e) => setFilterHds(e.target.value)}
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
        >
          <option value="all">HDS: Tous</option>
          <option value="true">HDS: Oui</option>
          <option value="false">HDS: Non</option>
        </select>

        <div className="ml-auto">
          <AddButton onClick={() => setShowAddSupplierModal(true)} />
        </div>
      </div>

      {/* Suppliers Data Table */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Registre fournisseurs</h2>
        <DataTable columns={supplierColumns} data={filteredSuppliers} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scores by Supplier */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Scores par fournisseur (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scoresBySupplier} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {scoresBySupplier.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Suppliers by Type */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Fournisseurs par type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={suppliersByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {suppliersByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* RGPD Compliance */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Conformité RGPD</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={rgpdData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill={THEME_COLORS.grn} />
                <Cell fill={THEME_COLORS.red} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Events Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Incidents fournisseurs</h2>
          <AddButton onClick={() => setShowAddEventModal(true)} />
        </div>
        <DataTable columns={eventColumns} data={supplierEvents} />
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <Modal
          isOpen={showAddSupplierModal}
          title="Nouveau fournisseur"
          onClose={() => setShowAddSupplierModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Nom *</label>
              <input
                type="text"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Nom du fournisseur"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Type</label>
              <select
                value={newSupplier.type}
                onChange={(e) => setNewSupplier({ ...newSupplier, type: e.target.value as any })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {SUPPLIER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Catégorie</label>
              <input
                type="text"
                value={newSupplier.category || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Médicaments, Dispositifs médicaux, Services..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Contrat</label>
              <input
                type="text"
                value={newSupplier.contract || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, contract: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Référence du contrat"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Clause RGPD
                </label>
                <select
                  value={newSupplier.rgpd_clause?.toString() || "false"}
                  onChange={(e) => setNewSupplier({ ...newSupplier, rgpd_clause: e.target.value === "true" })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {BOOLEAN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Conformité HDS
                </label>
                <select
                  value={newSupplier.hds_compliant?.toString() || "false"}
                  onChange={(e) => setNewSupplier({ ...newSupplier, hds_compliant: e.target.value === "true" })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {BOOLEAN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSupplier}
                disabled={!newSupplier.name}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <Modal
          isOpen={showAddEventModal}
          title="Nouvel incident fournisseur"
          onClose={() => setShowAddEventModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Fournisseur *
              </label>
              <select
                value={newEvent.supplier_id}
                onChange={(e) => setNewEvent({ ...newEvent, supplier_id: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Description *
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Description de l'incident..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Action</label>
              <textarea
                value={newEvent.action || ""}
                onChange={(e) => setNewEvent({ ...newEvent, action: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Action prise ou planifiée..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddEventModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.supplier_id || !newEvent.description}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Supplier Confirmation */}
      {deleteSupplierId && (
        <ConfirmDelete
          isOpen={!!deleteSupplierId}
          itemName="ce fournisseur"
          onConfirm={handleDeleteSupplier}
          onCancel={() => setDeleteSupplierId(null)}
        />
      )}

      {/* Delete Event Confirmation */}
      {deleteEventId && (
        <ConfirmDelete
          isOpen={!!deleteEventId}
          itemName="cet incident fournisseur"
          onConfirm={handleDeleteEvent}
          onCancel={() => setDeleteEventId(null)}
        />
      )}
    </div>
  );
}
