"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Capa, Domain, CapaInsert } from "@/lib/database.types";
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
import { ZapIcon, TrashIcon } from "@/components/icons";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SOURCES = [
  "Audit",
  "Réclamation",
  "Vigilance",
  "Terrain",
  "Auto-évaluation",
  "Revue direction",
] as const;

const TYPES = [
  "Non-conformité",
  "Action corrective",
  "Action préventive",
  "Amélioration",
  "Anomalie",
  "Near miss",
] as const;

const STATUSES = [
  "Ouverte",
  "En cours",
  "Vérification efficacité",
  "Clôturée",
] as const;

const ZONES = [
  "PDA Robot 1",
  "PDA Robot 2",
  "Contrôle qualité",
  "Conditionnement",
  "Stock chambre froide",
  "Stock ambiant",
  "Stock stupéfiants",
  "Officine comptoir",
  "Officine back-office",
  "Orthopédie",
  "Luxe L'Écrin",
  "Nature",
  "Livraison véhicule 1",
  "Livraison véhicule 2",
  "Livraison véhicule 3",
  "Cabine téléconsultation",
  "Locaux techniques",
  "Salle pause",
] as const;

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF", "#CC88FF", "#FF8844"];

export function TabCapa() {
  const { data: capas, loading: loadingCapas, create, update, remove } = useSupabaseCrud<Capa>("capas", {
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: domains, loading: loadingDomains } = useSupabaseCrud<Domain>("domains", {
    orderBy: { column: "name", ascending: true },
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const [newCapa, setNewCapa] = useState<Partial<CapaInsert>>({
    source: "Auto-évaluation",
    type: "Non-conformité",
    status: "Ouverte",
    description: "",
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openCapas = capas.filter((c) => c.status !== "Clôturée");
    const overdueCapas = openCapas.filter((c) => {
      if (!c.due_date) return false;
      const dueDate = new Date(c.due_date);
      return dueDate < today;
    });

    const closedCapas = capas.filter((c) => c.status === "Clôturée");
    const closureRate = capas.length > 0 ? (closedCapas.length / capas.length) * 100 : 0;

    const avgDelay =
      closedCapas.length > 0
        ? closedCapas.reduce((acc, c) => {
            if (!c.created_at || !c.closed_at) return acc;
            const created = new Date(c.created_at);
            const closed = new Date(c.closed_at);
            const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return acc + days;
          }, 0) / closedCapas.length
        : 0;

    return {
      totalOpen: openCapas.length,
      overdue: overdueCapas.length,
      closureRate: Math.round(closureRate),
      avgDelay: Math.round(avgDelay),
      overdueList: overdueCapas,
    };
  }, [capas]);

  // Filter capas
  const filteredCapas = useMemo(() => {
    return capas.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterSource !== "all" && c.source !== filterSource) return false;
      if (filterDomain !== "all" && c.domain_id !== filterDomain) return false;
      if (filterType !== "all" && c.type !== filterType) return false;
      return true;
    });
  }, [capas, filterStatus, filterSource, filterDomain, filterType]);

  // Analysis data: by source
  const analysisBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    capas.forEach((c) => {
      counts[c.source] = (counts[c.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [capas]);

  // Analysis data: by type
  const analysisByType = useMemo(() => {
    const counts: Record<string, number> = {};
    capas.forEach((c) => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [capas]);

  // Trend data: CAPA opened vs closed per month
  const trendData = useMemo(() => {
    const monthlyData: Record<string, { month: string; opened: number; closed: number }> = {};

    capas.forEach((c) => {
      const createdMonth = c.created_at ? c.created_at.substring(0, 7) : "";
      if (createdMonth) {
        if (!monthlyData[createdMonth]) {
          monthlyData[createdMonth] = { month: createdMonth, opened: 0, closed: 0 };
        }
        monthlyData[createdMonth].opened += 1;
      }

      if (c.closed_at) {
        const closedMonth = c.closed_at.substring(0, 7);
        if (!monthlyData[closedMonth]) {
          monthlyData[closedMonth] = { month: closedMonth, opened: 0, closed: 0 };
        }
        monthlyData[closedMonth].closed += 1;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [capas]);

  const domainMap = useMemo(() => {
    const map: Record<string, string> = {};
    domains.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [domains]);

  const handleAdd = async () => {
    try {
      await create(newCapa as CapaInsert);
      setShowAddModal(false);
      setNewCapa({
        source: "Auto-évaluation",
        type: "Non-conformité",
        status: "Ouverte",
        description: "",
      });
    } catch (error) {
      console.error("Error creating CAPA:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting CAPA:", error);
    }
  };

  const columns: ColumnDef<Capa>[] = [
    {
      key: "id",
      label: "ID",
      render: (capa) => (
        <span className="text-xs font-mono text-accent">
          CAPA-{capa.id.substring(0, 4).toUpperCase()}
        </span>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (capa) => <Badge variant="plan">{capa.source}</Badge>,
    },
    {
      key: "type",
      label: "Type",
      render: (capa) => <Badge variant={capa.type === "Non-conformité" ? "crit" : "wip"}>{capa.type}</Badge>,
    },
    {
      key: "domain_id",
      label: "Domaine",
      render: (capa) => (
        <EditableCell
          value={capa.domain_id || ""}
          type="select"
          options={domains.map((d) => ({ value: d.id, label: d.name }))}
          onSave={async (value) => {
            await update(capa.id, { domain_id: String(value) });
          }}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (capa) => (
        <EditableCell
          value={capa.description}
          type="text"
          onSave={async (value) => {
            await update(capa.id, { description: String(value) });
          }}
        />
      ),
    },
    {
      key: "root_cause",
      label: "Cause racine",
      render: (capa) => (
        <EditableCell
          value={capa.root_cause || ""}
          type="text"
          onSave={async (value) => {
            await update(capa.id, { root_cause: String(value) });
          }}
        />
      ),
    },
    {
      key: "action",
      label: "Action corrective",
      render: (capa) => (
        <EditableCell
          value={capa.action || ""}
          type="text"
          onSave={async (value) => {
            await update(capa.id, { action: String(value) });
          }}
        />
      ),
    },
    {
      key: "owner",
      label: "Responsable",
      render: (capa) => (
        <EditableCell
          value={capa.owner || ""}
          type="text"
          onSave={async (value) => {
            await update(capa.id, { owner: String(value) });
          }}
        />
      ),
    },
    {
      key: "due_date",
      label: "Échéance",
      render: (capa) => (
        <EditableCell
          value={capa.due_date || ""}
          type="date"
          onSave={async (value) => {
            await update(capa.id, { due_date: String(value) });
          }}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (capa) => (
        <EditableCell
          value={capa.status}
          type="select"
          options={STATUSES.map((s) => ({ value: s, label: s }))}
          onSave={async (value) => {
            const updates: any = { status: value };
            if (value === "Clôturée" && !capa.closed_at) {
              updates.closed_at = new Date().toISOString();
            }
            await update(capa.id, updates);
          }}
        />
      ),
    },
    {
      key: "efficacy_result",
      label: "Efficacité",
      render: (capa) => (
        <EditableCell
          value={capa.efficacy_result || ""}
          type="text"
          onSave={async (value) => {
            await update(capa.id, { efficacy_result: String(value) });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (capa) => (
        <button
          onClick={() => setDeleteId(capa.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  if (loadingCapas || loadingDomains) {
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
          icon={<ZapIcon size={20} />}
          label="Total ouvertes"
          value={kpis.totalOpen.toString()}
          subtitle="CAPA non clôturées"
        />
        <KpiCard
          icon={<ZapIcon size={20} />}
          label="En retard"
          value={kpis.overdue.toString()}
          subtitle="Action requise"
          accent="amber"
        />
        <KpiCard
          icon={<ZapIcon size={20} />}
          label="Taux clôture"
          value={`${kpis.closureRate}%`}
          subtitle="Clôturées / Total"
        />
        <KpiCard
          icon={<ZapIcon size={20} />}
          label="Délai moyen"
          value={`${kpis.avgDelay}j`}
          subtitle="Ouverture → Clôture"
        />
      </div>

      {/* Overdue Alerts */}
      {kpis.overdueList.length > 0 && (
        <div className="space-y-2">
          {kpis.overdueList.map((capa) => (
            <AlertLine
              key={capa.id}
              severity="red"
              message={`CAPA ${capa.id.substring(0, 4).toUpperCase()} en retard — ${capa.description.substring(0, 80)}...`}
              href={`#capa-${capa.id}`}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text"
        >
          <option value="all">Tous statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text"
        >
          <option value="all">Toutes sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text"
        >
          <option value="all">Tous domaines</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text"
        >
          <option value="all">Tous types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="ml-auto">
          <AddButton onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={filteredCapas} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis by Source */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Analyse par source</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={analysisBySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analysisBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis by Type */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Analyse par type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analysisByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                }}
              />
              <Bar dataKey="value" fill={THEME_COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-card border border-brd rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text mb-4">Tendance mensuelle</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
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
            <Line type="monotone" dataKey="opened" stroke={THEME_COLORS.grn} name="Ouvertes" strokeWidth={2} />
            <Line type="monotone" dataKey="closed" stroke={THEME_COLORS.amb} name="Clôturées" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          title="Nouvelle CAPA"
          onClose={() => setShowAddModal(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Source</label>
              <select
                value={newCapa.source}
                onChange={(e) => setNewCapa({ ...newCapa, source: e.target.value as any })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Type</label>
              <select
                value={newCapa.type}
                onChange={(e) => setNewCapa({ ...newCapa, type: e.target.value as any })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Domaine</label>
              <select
                value={newCapa.domain_id || ""}
                onChange={(e) => setNewCapa({ ...newCapa, domain_id: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                <option value="">Sélectionner un domaine</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Description *
              </label>
              <textarea
                value={newCapa.description}
                onChange={(e) => setNewCapa({ ...newCapa, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Description détaillée de la non-conformité ou action..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Cause racine
              </label>
              <textarea
                value={newCapa.root_cause || ""}
                onChange={(e) => setNewCapa({ ...newCapa, root_cause: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Analyse 5 pourquoi, ishikawa..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Action corrective
              </label>
              <textarea
                value={newCapa.action || ""}
                onChange={(e) => setNewCapa({ ...newCapa, action: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Plan d'action pour traiter la cause..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Responsable
                </label>
                <input
                  type="text"
                  value={newCapa.owner || ""}
                  onChange={(e) => setNewCapa({ ...newCapa, owner: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="Nom du responsable"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">Échéance</label>
                <input
                  type="date"
                  value={newCapa.due_date || ""}
                  onChange={(e) => setNewCapa({ ...newCapa, due_date: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            {newCapa.source === "Terrain" && (
              <>
                <div>
                  <label className="block text-[13px] font-semibold text-sec mb-2">Zone</label>
                  <select
                    value={newCapa.terrain_zone || ""}
                    onChange={(e) => setNewCapa({ ...newCapa, terrain_zone: e.target.value })}
                    className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  >
                    <option value="">Sélectionner une zone</option>
                    {ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-sec mb-2">
                    Gravité ressentie
                  </label>
                  <select
                    value={newCapa.terrain_severity || ""}
                    onChange={(e) => setNewCapa({ ...newCapa, terrain_severity: e.target.value })}
                    className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  >
                    <option value="">Non renseignée</option>
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!newCapa.description}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmDelete
          isOpen={!!deleteId}
          itemName="cette CAPA"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
