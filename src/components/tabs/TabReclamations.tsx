"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Reclamation, ReclamationInsert, Processus } from "@/lib/db-rows";
import {
  KpiCard,
  DataTable,
  type ColumnDef,
  EditableCell,
  AddButton,
  ConfirmDelete,
  AlertLine,
} from "@/components/ui";
import { MsgIcon } from "@/components/icons";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "var(--accent)",
  "#FFB800",
  "#FF4444",
  "#00B4D8",
  "#90E0EF",
];

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping (DB values UPPERCASE)        */
/* ------------------------------------------------------------------ */
const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "CLIENT", label: "Client" },
  { value: "EHPAD", label: "EHPAD" },
  { value: "INTERNE", label: "Interne" },
  { value: "FOURNISSEUR", label: "Fournisseur" },
  { value: "AUTRE", label: "Autre" },
];

const GRAVITE_OPTIONS: { value: string; label: string }[] = [
  { value: "MINEURE", label: "Mineure" },
  { value: "MAJEURE", label: "Majeure" },
  { value: "CRITIQUE", label: "Critique" },
];

const STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "OUVERTE", label: "Ouverte" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TRAITEE", label: "Traitée" },
  { value: "CLOSE", label: "Close" },
];

const SATISFACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "SATISFAIT", label: "Satisfait" },
  { value: "NEUTRE", label: "Neutre" },
  { value: "INSATISFAIT", label: "Insatisfait" },
];

const labelFor = (opts: { value: string; label: string }[], v: string | null): string =>
  opts.find((o) => o.value === v)?.label ?? (v ?? "Non spécifié");

export function TabReclamations() {
  const { data, loading, error, create, update, remove } =
    useSupabaseCrud<Reclamation>("reclamations", {
      orderBy: { column: "date_reception", ascending: false },
    });

  const { data: processus } = useSupabaseCrud<Processus>("processus", {
    orderBy: { column: "nom", ascending: true },
  });

  const [filters, setFilters] = useState({
    source: "",
    processus_id: "",
    statut: "",
    gravite: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const processusMap = useMemo(() => {
    const m: Record<string, string> = {};
    processus.forEach((p) => {
      m[p.id] = p.nom;
    });
    return m;
  }, [processus]);

  // Filtres
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.source && item.source !== filters.source) return false;
      if (filters.processus_id && item.processus_id !== filters.processus_id) return false;
      if (filters.statut && item.statut !== filters.statut) return false;
      if (filters.gravite && item.gravite !== filters.gravite) return false;
      return true;
    });
  }, [data, filters]);

  // KPIs
  const totalOpen = useMemo(
    () =>
      filteredData.filter(
        (c) => c.statut === "OUVERTE" || c.statut === "EN_COURS"
      ).length,
    [filteredData]
  );

  const avgClosureDelay = useMemo(() => {
    const closed = filteredData.filter((c) => c.date_cloture);
    if (closed.length === 0) return 0;
    const totalDays = closed.reduce((sum, c) => {
      const received = new Date(c.date_reception);
      const cloture = new Date(c.date_cloture!);
      const diff = Math.floor(
        (cloture.getTime() - received.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + diff;
    }, 0);
    return Math.round(totalDays / closed.length);
  }, [filteredData]);

  const satisfactionRate = useMemo(() => {
    const withSat = filteredData.filter((c) => c.satisfaction);
    if (withSat.length === 0) return "-";
    const satisfied = withSat.filter(
      (c) => c.satisfaction === "SATISFAIT"
    ).length;
    return `${Math.round((satisfied / withSat.length) * 100)}%`;
  }, [filteredData]);

  // Réclamations ouvertes depuis > 48h
  const alertsOver48 = useMemo(() => {
    const now = new Date();
    return filteredData.filter((c) => {
      if (c.statut !== "OUVERTE") return false;
      const received = new Date(c.date_reception);
      const hoursDiff =
        (now.getTime() - received.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 48;
    });
  }, [filteredData]);

  const over48h = alertsOver48.length;

  // Suivi par processus
  const processusSummary = useMemo(() => {
    const map = new Map<
      string,
      { count: number; totalDelay: number; delayCount: number; satisfied: number; satCount: number }
    >();

    filteredData.forEach((c) => {
      const nom = (c.processus_id && processusMap[c.processus_id]) || "Non spécifié";
      if (!map.has(nom)) {
        map.set(nom, { count: 0, totalDelay: 0, delayCount: 0, satisfied: 0, satCount: 0 });
      }
      const entry = map.get(nom)!;
      entry.count++;

      if (c.date_cloture) {
        const received = new Date(c.date_reception);
        const cloture = new Date(c.date_cloture);
        const diff = Math.floor(
          (cloture.getTime() - received.getTime()) / (1000 * 60 * 60 * 24)
        );
        entry.totalDelay += diff;
        entry.delayCount++;
      }

      if (c.satisfaction) {
        if (c.satisfaction === "SATISFAIT") entry.satisfied++;
        entry.satCount++;
      }
    });

    return Array.from(map.entries()).map(([nom, stats]) => ({
      nom,
      count: stats.count,
      avgDelay:
        stats.delayCount > 0
          ? `${Math.round(stats.totalDelay / stats.delayCount)} jours`
          : "-",
      satRate:
        stats.satCount > 0
          ? `${Math.round((stats.satisfied / stats.satCount) * 100)}%`
          : "-",
    }));
  }, [filteredData, processusMap]);

  // Graphiques
  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      const lbl = labelFor(SOURCE_OPTIONS, c.source);
      map.set(lbl, (map.get(lbl) || 0) + 1);
    });
    return Array.from(map.entries()).map(([source, count]) => ({
      source,
      count,
    }));
  }, [filteredData]);

  const byProcessus = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      const nom = (c.processus_id && processusMap[c.processus_id]) || "Non spécifié";
      map.set(nom, (map.get(nom) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData, processusMap]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      const month = c.date_reception.substring(0, 7);
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const byGravite = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      const lbl = labelFor(GRAVITE_OPTIONS, c.gravite);
      map.set(lbl, (map.get(lbl) || 0) + 1);
    });
    return Array.from(map.entries()).map(([gravite, value]) => ({
      name: gravite,
      value,
    }));
  }, [filteredData]);

  // Colonnes DataTable
  const columns: ColumnDef<Reclamation>[] = [
    {
      key: "reference",
      label: "Réf.",
      render: (row) => (
        <span className="text-xs font-mono text-accent">
          {row.reference || `REC-${row.id.substring(0, 4).toUpperCase()}`}
        </span>
      ),
    },
    {
      key: "date_reception",
      label: "Date réception",
      render: (row) => (
        <EditableCell
          type="date"
          value={row.date_reception}
          onSave={async (val) => {
            const s = String(val);
            if (s) await update(row.id, { date_reception: s });
          }}
        />
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.source || ""}
          options={SOURCE_OPTIONS}
          onSave={(val) => update(row.id, { source: (String(val) || null) as Reclamation["source"] })}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <EditableCell
          type="text"
          value={row.description}
          onSave={async (val) => {
            const s = String(val).trim();
            if (s) await update(row.id, { description: s });
          }}
        />
      ),
    },
    {
      key: "gravite",
      label: "Gravité",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.gravite || ""}
          options={GRAVITE_OPTIONS}
          onSave={(val) => update(row.id, { gravite: (String(val) || null) as Reclamation["gravite"] })}
        />
      ),
    },
    {
      key: "processus_id",
      label: "Processus",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.processus_id || ""}
          options={processus.map((p) => ({ value: p.id, label: p.nom }))}
          onSave={(val) => update(row.id, { processus_id: String(val) || null })}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.statut}
          options={STATUT_OPTIONS}
          onSave={async (val) => {
            const newStatut = String(val);
            const updates: Partial<Reclamation> = { statut: newStatut };
            if ((newStatut === "TRAITEE" || newStatut === "CLOSE") && !row.date_cloture) {
              updates.date_cloture = new Date().toISOString().substring(0, 10);
            }
            await update(row.id, updates);
          }}
        />
      ),
    },
    {
      key: "date_cloture",
      label: "Date clôture",
      render: (row) => (
        <EditableCell
          type="date"
          value={row.date_cloture || ""}
          onSave={(val) => update(row.id, { date_cloture: String(val) || null })}
        />
      ),
    },
    {
      key: "satisfaction",
      label: "Satisfaction",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.satisfaction || ""}
          options={SATISFACTION_OPTIONS}
          onSave={(val) => update(row.id, { satisfaction: (String(val) || null) as Reclamation["satisfaction"] })}
        />
      ),
    },
    {
      key: "action_corrective",
      label: "Action corrective",
      render: (row) => (
        <EditableCell
          type="text"
          value={row.action_corrective || ""}
          onSave={(val) => update(row.id, { action_corrective: String(val) || null })}
        />
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => (
        <EditableCell
          type="text"
          value={row.notes || ""}
          onSave={(val) => update(row.id, { notes: String(val) || null })}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={() => setDeleteId(row.id)}
          className="text-red hover:opacity-80"
        >
          Supprimer
        </button>
      ),
    },
  ];

  const handleAdd = async () => {
    const payload: ReclamationInsert = {
      description: "Nouvelle réclamation — à compléter",
      source: "AUTRE",
      statut: "OUVERTE",
      date_reception: new Date().toISOString().substring(0, 10),
    };
    await create(payload as Partial<Reclamation>);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  if (loading) return <div className="text-muted">Chargement...</div>;
  if (error)
    return <div className="text-red">Erreur : {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<MsgIcon />}
          label="Total ouvertes"
          value={totalOpen.toString()}
          subtitle="réclamations en cours"
        />
        <KpiCard
          icon={<MsgIcon />}
          label="Délai moyen clôture"
          value={avgClosureDelay.toString()}
          subtitle="jours"
        />
        <KpiCard
          icon={<MsgIcon />}
          label="Taux de satisfaction"
          value={satisfactionRate}
          subtitle="réclamants satisfaits"
        />
        <KpiCard
          icon={<MsgIcon />}
          label="> 48h non traitées"
          value={over48h.toString()}
          subtitle="action requise"
          className="border-l-red"
        />
      </div>

      {/* Alertes */}
      {alertsOver48.length > 0 && (
        <div className="card">
          <h3 className="text-h3 mb-3">Alertes</h3>
          <div className="space-y-2">
            {alertsOver48.map((c) => (
              <AlertLine
                key={c.id}
                severity="red"
                message={`Réclamation ouverte depuis > 48h : ${
                  c.reference || labelFor(SOURCE_OPTIONS, c.source)
                } - ${c.description.substring(0, 80)}`}
                href={`#reclamation-${c.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card">
        <h3 className="text-h3 mb-3">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-tag block mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) =>
                setFilters({ ...filters, source: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="">Toutes</option>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-tag block mb-1">Processus</label>
            <select
              value={filters.processus_id}
              onChange={(e) =>
                setFilters({ ...filters, processus_id: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="">Tous</option>
              {processus.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-tag block mb-1">Statut</label>
            <select
              value={filters.statut}
              onChange={(e) =>
                setFilters({ ...filters, statut: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="">Tous</option>
              {STATUT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-tag block mb-1">Gravité</label>
            <select
              value={filters.gravite}
              onChange={(e) =>
                setFilters({ ...filters, gravite: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="">Toutes</option>
              {GRAVITE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() =>
            setFilters({
              source: "",
              processus_id: "",
              statut: "",
              gravite: "",
            })
          }
          className="mt-3 text-accent text-sm underline"
        >
          Réinitialiser les filtres
        </button>
      </div>

      {/* Suivi par processus */}
      <div className="card">
        <h3 className="text-h3 mb-3">Suivi par processus</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brd">
                <th className="text-tag text-left py-2">Processus</th>
                <th className="text-tag text-left py-2">Réclamations</th>
                <th className="text-tag text-left py-2">Délai moyen clôture</th>
                <th className="text-tag text-left py-2">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {processusSummary.map((row, idx) => (
                <tr key={idx} className="border-b border-brd hover:bg-elev">
                  <td className="py-2 text-text">{row.nom}</td>
                  <td className="py-2 text-text">{row.count}</td>
                  <td className="py-2 text-text">{row.avgDelay}</td>
                  <td className="py-2 text-text">{row.satRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DataTable */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-h3">Réclamations</h3>
          <AddButton onClick={handleAdd} />
        </div>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par source */}
        <div className="card">
          <h3 className="text-h3 mb-4">Répartition par source</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="source" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              />
              <Bar dataKey="count" fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Par processus */}
        <div className="card">
          <h3 className="text-h3 mb-4">Répartition par processus (Top 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byProcessus}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="nom"
                stroke="var(--text-secondary)"
                angle={-20}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              />
              <Bar dataKey="count" fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tendance mensuelle */}
        <div className="card">
          <h3 className="text-h3 mb-4">Tendance mensuelle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--accent)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Par gravité */}
        <div className="card">
          <h3 className="text-h3 mb-4">Répartition par gravité</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={byGravite}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="var(--accent)"
                dataKey="value"
              >
                {byGravite.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confirm Delete */}
      {deleteId && (
        <ConfirmDelete
          isOpen={!!deleteId}
          itemName="cette réclamation"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
