"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Complaint } from "@/lib/database.types";
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
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "var(--accent)",
  "#FFB800",
  "#FF4444",
  "#00B4D8",
  "#90E0EF",
];

export function TabReclamations() {
  const { data, loading, error, create, update, remove } =
    useSupabaseCrud<Complaint>("complaints", {
      orderBy: { column: "created_at", ascending: false },
    });

  const [filters, setFilters] = useState({
    source: "",
    ehpad_name: "",
    category: "",
    status: "",
    severity: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtres
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.source && item.source !== filters.source) return false;
      if (
        filters.ehpad_name &&
        item.ehpad_name?.toLowerCase().indexOf(filters.ehpad_name.toLowerCase()) === -1
      )
        return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.severity && item.severity !== filters.severity) return false;
      return true;
    });
  }, [data, filters]);

  // KPIs
  const totalOpen = useMemo(
    () => filteredData.filter((c) => c.status === "Ouverte").length,
    [filteredData]
  );

  const avgResponseDelay = useMemo(() => {
    const responded = filteredData.filter((c) => c.responded_at);
    if (responded.length === 0) return 0;
    const totalDays = responded.reduce((sum, c) => {
      const created = new Date(c.created_at);
      const responded = new Date(c.responded_at!);
      const diff = Math.floor(
        (responded.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + diff;
    }, 0);
    return Math.round(totalDays / responded.length);
  }, [filteredData]);

  const avgSatisfaction = useMemo(() => {
    const withSat = filteredData.filter((c) => c.satisfaction);
    if (withSat.length === 0) return 0;
    const total = withSat.reduce(
      (sum, c) => sum + parseFloat(c.satisfaction!),
      0
    );
    return (total / withSat.length).toFixed(1);
  }, [filteredData]);

  const over48h = useMemo(() => {
    const now = new Date();
    return filteredData.filter((c) => {
      if (c.status !== "Ouverte") return false;
      const created = new Date(c.created_at);
      const hoursDiff =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 48;
    }).length;
  }, [filteredData]);

  // Alertes > 48h
  const alertsOver48 = useMemo(() => {
    const now = new Date();
    return filteredData.filter((c) => {
      if (c.status !== "Ouverte") return false;
      const created = new Date(c.created_at);
      const hoursDiff =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 48;
    });
  }, [filteredData]);

  // Suivi EHPAD
  const ehpadSummary = useMemo(() => {
    const map = new Map<
      string,
      { count: number; totalDelay: number; totalSat: number; satCount: number }
    >();

    filteredData.forEach((c) => {
      const ehpad = c.ehpad_name || "Non spécifié";
      if (!map.has(ehpad)) {
        map.set(ehpad, { count: 0, totalDelay: 0, totalSat: 0, satCount: 0 });
      }
      const entry = map.get(ehpad)!;
      entry.count++;

      if (c.responded_at) {
        const created = new Date(c.created_at);
        const responded = new Date(c.responded_at);
        const diff = Math.floor(
          (responded.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
        entry.totalDelay += diff;
      }

      if (c.satisfaction) {
        entry.totalSat += parseFloat(c.satisfaction);
        entry.satCount++;
      }
    });

    return Array.from(map.entries()).map(([ehpad, stats]) => ({
      ehpad,
      count: stats.count,
      avgDelay:
        stats.totalDelay > 0
          ? Math.round(stats.totalDelay / stats.count)
          : 0,
      avgSat:
        stats.satCount > 0
          ? (stats.totalSat / stats.satCount).toFixed(1)
          : "-",
    }));
  }, [filteredData]);

  // Graphiques
  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      map.set(c.source, (map.get(c.source) || 0) + 1);
    });
    return Array.from(map.entries()).map(([source, count]) => ({
      source,
      count,
    }));
  }, [filteredData]);

  const byEhpad = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      const ehpad = c.ehpad_name || "Non spécifié";
      map.set(ehpad, (map.get(ehpad) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([ehpad, count]) => ({ ehpad, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      const month = c.created_at.substring(0, 7);
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((c) => {
      map.set(c.category, (map.get(c.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([category, value]) => ({
      name: category,
      value,
    }));
  }, [filteredData]);

  // Colonnes DataTable
  const columns: ColumnDef<Complaint>[] = [
    {
      key: "source",
      label: "Source",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.source}
          options={["EHPAD", "Officine", "Patient", "Autre"].map(v => ({ value: v, label: v }))}
          onSave={(val) => update(row.id, { source: val as string })}
        />
      ),
    },
    {
      key: "ehpad_name",
      label: "Nom EHPAD",
      render: (row) => (
        <EditableCell
          type="text"
          value={row.ehpad_name || ""}
          onSave={(val) => update(row.id, { ehpad_name: val as string })}
        />
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.category}
          options={[
            "Erreur dispensation",
            "Retard livraison",
            "Qualité produit",
            "Conditionnement",
            "Autre",
          ].map(v => ({ value: v, label: v }))}
          onSave={(val) => update(row.id, { category: val as string })}
        />
      ),
    },
    {
      key: "severity",
      label: "Gravité",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.severity || ""}
          options={["Faible", "Moyenne", "Élevée"].map(v => ({ value: v, label: v }))}
          onSave={(val) => update(row.id, { severity: val as string })}
        />
      ),
    },
    {
      key: "owner",
      label: "Responsable",
      render: (row) => (
        <EditableCell
          type="text"
          value={row.owner || ""}
          onSave={(val) => update(row.id, { owner: val as string })}
        />
      ),
    },
    {
      key: "responded_at",
      label: "Date réponse",
      render: (row) => (
        <EditableCell
          type="date"
          value={row.responded_at || ""}
          onSave={(val) => update(row.id, { responded_at: val as string })}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (row) => (
        <EditableCell
          type="select"
          value={row.status}
          options={["Ouverte", "En traitement", "Clôturée"].map(v => ({ value: v, label: v }))}
          onSave={(val) => update(row.id, { status: val as string })}
        />
      ),
    },
    {
      key: "satisfaction",
      label: "Satisfaction",
      render: (row) => (
        <EditableCell
          type="number"
          value={row.satisfaction || ""}
          onSave={(val) => update(row.id, { satisfaction: val as string })}
        />
      ),
    },
    {
      key: "capa_id",
      label: "Lien CAPA",
      render: (row) => (
        <EditableCell
          type="text"
          value={row.capa_id || ""}
          onSave={(val) => update(row.id, { capa_id: val as string })}
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
    await create({
      source: "EHPAD",
      category: "Autre",
      status: "Ouverte",
      created_by: null,
    });
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
          label="Délai moyen réponse"
          value={avgResponseDelay.toString()}
          subtitle="jours"
        />
        <KpiCard
          icon={<MsgIcon />}
          label="Satisfaction moyenne"
          value={avgSatisfaction}
          subtitle="sur 5"
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
                message={`Réclamation ouverte depuis > 48h : ${c.source} - ${c.category}`}
                href={`#complaint-${c.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card">
        <h3 className="text-h3 mb-3">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
              <option value="EHPAD">EHPAD</option>
              <option value="Officine">Officine</option>
              <option value="Patient">Patient</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="text-tag block mb-1">EHPAD</label>
            <input
              type="text"
              value={filters.ehpad_name}
              onChange={(e) =>
                setFilters({ ...filters, ehpad_name: e.target.value })
              }
              placeholder="Rechercher..."
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            />
          </div>
          <div>
            <label className="text-tag block mb-1">Catégorie</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="">Toutes</option>
              <option value="Erreur dispensation">Erreur dispensation</option>
              <option value="Retard livraison">Retard livraison</option>
              <option value="Qualité produit">Qualité produit</option>
              <option value="Conditionnement">Conditionnement</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="text-tag block mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="">Tous</option>
              <option value="Ouverte">Ouverte</option>
              <option value="En traitement">En traitement</option>
              <option value="Clôturée">Clôturée</option>
            </select>
          </div>
          <div>
            <label className="text-tag block mb-1">Gravité</label>
            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters({ ...filters, severity: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="">Toutes</option>
              <option value="Faible">Faible</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Élevée">Élevée</option>
            </select>
          </div>
        </div>
        <button
          onClick={() =>
            setFilters({
              source: "",
              ehpad_name: "",
              category: "",
              status: "",
              severity: "",
            })
          }
          className="mt-3 text-accent text-sm underline"
        >
          Réinitialiser les filtres
        </button>
      </div>

      {/* Suivi EHPAD */}
      <div className="card">
        <h3 className="text-h3 mb-3">Suivi EHPAD</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brd">
                <th className="text-tag text-left py-2">EHPAD</th>
                <th className="text-tag text-left py-2">Réclamations</th>
                <th className="text-tag text-left py-2">Délai moyen</th>
                <th className="text-tag text-left py-2">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {ehpadSummary.map((row, idx) => (
                <tr key={idx} className="border-b border-brd hover:bg-elev">
                  <td className="py-2 text-text">{row.ehpad}</td>
                  <td className="py-2 text-text">{row.count}</td>
                  <td className="py-2 text-text">{row.avgDelay} jours</td>
                  <td className="py-2 text-text">{row.avgSat}</td>
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

        {/* Par EHPAD */}
        <div className="card">
          <h3 className="text-h3 mb-4">Répartition par EHPAD (Top 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byEhpad}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="ehpad"
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

        {/* Par catégorie */}
        <div className="card">
          <h3 className="text-h3 mb-4">Répartition par catégorie</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={byCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="var(--accent)"
                dataKey="value"
              >
                {byCategory.map((entry, index) => (
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
