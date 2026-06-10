"use client";

import React, { useState, useMemo } from "react";
import type { Risque, RisqueInsert, Processus } from "@/lib/db-rows";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import {
  KpiCard,
  DataTable,
  EditableCell,
  Badge,
  AddButton,
  Modal,
  ConfirmDelete,
} from "@/components/ui";
import { TriangleIcon } from "@/components/icons";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping (DB values UPPERCASE)        */
/* ------------------------------------------------------------------ */
const STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "IDENTIFIE", label: "Identifié" },
  { value: "EN_TRAITEMENT", label: "En traitement" },
  { value: "MAITRISE", label: "Maîtrisé" },
  { value: "CLOS", label: "Clos" },
];

const labelFor = (opts: { value: string; label: string }[], v: string | null): string =>
  opts.find((o) => o.value === v)?.label ?? (v ?? "—");

/** Criticité affichée : valeur DB si présente, sinon P × G × D. */
const criticiteOf = (r: Risque): number =>
  r.criticite ?? r.probabilite * r.gravite * r.detectabilite;

export const TabRisques: React.FC = () => {
  const { data: risques, loading: loadingRisques, update, create, remove } = useSupabaseCrud<Risque>("risques", {
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: processus, loading: loadingProcessus } = useSupabaseCrud<Processus>("processus", {
    orderBy: { column: "nom", ascending: true },
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"matrice" | "amdec" | "processus">("matrice");
  const [filterProcessus, setFilterProcessus] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  // Form state for new risk
  const [formData, setFormData] = useState({
    titre: "",
    processus_id: "",
    description: "",
    source: "",
    probabilite: 1,
    gravite: 1,
    detectabilite: 1,
    action_prevue: "",
    statut: "IDENTIFIE",
  });

  const processusMap = useMemo(() => {
    const m: Record<string, string> = {};
    processus.forEach((p) => {
      m[p.id] = p.nom;
    });
    return m;
  }, [processus]);

  // KPIs calculation (basés sur le statut réel en DB)
  const kpis = useMemo(() => {
    const total = risques.length;
    const identifies = risques.filter((r) => r.statut === "IDENTIFIE").length;
    const enTraitement = risques.filter((r) => r.statut === "EN_TRAITEMENT").length;
    const maitrises = risques.filter((r) => r.statut === "MAITRISE" || r.statut === "CLOS").length;

    return { total, identifies, enTraitement, maitrises };
  }, [risques]);

  // Filter risks
  const filteredRisques = useMemo(() => {
    return risques.filter((risque) => {
      if (filterProcessus !== "all" && risque.processus_id !== filterProcessus) return false;
      if (filterStatut !== "all" && risque.statut !== filterStatut) return false;
      if (filterSource !== "all" && risque.source !== filterSource) return false;
      return true;
    });
  }, [risques, filterProcessus, filterStatut, filterSource]);

  // Unique sources for filter
  const sources = useMemo(() => {
    const uniqueSources = new Set<string>();
    risques.forEach((r) => {
      if (r.source) uniqueSources.add(r.source);
    });
    return Array.from(uniqueSources).sort();
  }, [risques]);

  // Data for PieChart (répartition par statut)
  const pieData = useMemo(() => {
    return [
      { name: "Identifié", value: risques.filter((r) => r.statut === "IDENTIFIE").length, color: "var(--risk-red)" },
      { name: "En traitement", value: risques.filter((r) => r.statut === "EN_TRAITEMENT").length, color: "var(--risk-amb)" },
      { name: "Maîtrisé", value: risques.filter((r) => r.statut === "MAITRISE").length, color: "var(--risk-grn)" },
      { name: "Clos", value: risques.filter((r) => r.statut === "CLOS").length, color: "var(--accent)" },
    ];
  }, [risques]);

  // Data for BarChart by processus (criticité cumulée par statut)
  const barData = useMemo(() => {
    const byProcessus: Record<string, { identifie: number; enTraitement: number; maitrise: number }> = {};

    risques.forEach((risque) => {
      const nom = (risque.processus_id && processusMap[risque.processus_id]) || "Sans processus";
      if (!byProcessus[nom]) {
        byProcessus[nom] = { identifie: 0, enTraitement: 0, maitrise: 0 };
      }
      const crit = criticiteOf(risque);

      if (risque.statut === "IDENTIFIE") byProcessus[nom].identifie += crit;
      else if (risque.statut === "EN_TRAITEMENT") byProcessus[nom].enTraitement += crit;
      else byProcessus[nom].maitrise += crit;
    });

    return Object.entries(byProcessus).map(([name, values]) => ({
      name,
      ...values,
    }));
  }, [risques, processusMap]);

  const handleCreate = async () => {
    try {
      const payload: RisqueInsert = {
        titre: formData.titre.trim(),
        processus_id: formData.processus_id || null,
        description: formData.description.trim() || null,
        source: formData.source.trim() || null,
        probabilite: formData.probabilite,
        gravite: formData.gravite,
        detectabilite: formData.detectabilite,
        action_prevue: formData.action_prevue.trim() || null,
        statut: formData.statut,
      };
      await create(payload as Partial<Risque>);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating risque:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await remove(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error("Error deleting risque:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titre: "",
      processus_id: "",
      description: "",
      source: "",
      probabilite: 1,
      gravite: 1,
      detectabilite: 1,
      action_prevue: "",
      statut: "IDENTIFIE",
    });
  };

  const getStatutBadgeVariant = (statut: string): "ok" | "wip" | "crit" => {
    if (statut === "MAITRISE" || statut === "CLOS") return "ok";
    if (statut === "EN_TRAITEMENT") return "wip";
    return "crit";
  };

  const columns = [
    {
      label: "Titre",
      key: "titre",
      render: (row: Risque) => (
        <EditableCell
          value={row.titre}
          type="text"
          onSave={async (value) => {
            const s = String(value).trim();
            if (s) await update(row.id, { titre: s });
          }}
        />
      ),
    },
    {
      label: "Processus",
      key: "processus_id",
      render: (row: Risque) => (
        <EditableCell
          value={row.processus_id || ""}
          type="select"
          options={processus.map((p) => ({ value: p.id, label: p.nom }))}
          onSave={(value) => update(row.id, { processus_id: String(value) || null })}
        />
      ),
    },
    {
      label: "Description",
      key: "description",
      render: (row: Risque) => (
        <EditableCell
          value={row.description || ""}
          type="text"
          onSave={(value) => update(row.id, { description: String(value) || null })}
        />
      ),
    },
    {
      label: "Source",
      key: "source",
      render: (row: Risque) => (
        <EditableCell
          value={row.source || ""}
          type="text"
          onSave={(value) => update(row.id, { source: String(value) || null })}
        />
      ),
    },
    {
      label: "P",
      key: "probabilite",
      render: (row: Risque) => (
        <EditableCell
          value={row.probabilite.toString()}
          type="select"
          options={["1", "2", "3", "4", "5"].map(v => ({ value: v, label: v }))}
          onSave={(value) => update(row.id, { probabilite: parseInt(String(value)) })}
        />
      ),
    },
    {
      label: "G",
      key: "gravite",
      render: (row: Risque) => (
        <EditableCell
          value={row.gravite.toString()}
          type="select"
          options={["1", "2", "3", "4", "5"].map(v => ({ value: v, label: v }))}
          onSave={(value) => update(row.id, { gravite: parseInt(String(value)) })}
        />
      ),
    },
    {
      label: "D",
      key: "detectabilite",
      render: (row: Risque) => (
        <EditableCell
          value={row.detectabilite.toString()}
          type="select"
          options={["1", "2", "3", "4", "5"].map(v => ({ value: v, label: v }))}
          onSave={(value) => update(row.id, { detectabilite: parseInt(String(value)) })}
        />
      ),
    },
    {
      label: "Criticité",
      key: "criticite",
      render: (row: Risque) => (
        <span className="font-mono text-accent">{criticiteOf(row)}</span>
      ),
    },
    {
      label: "Niveau",
      key: "niveau",
      render: (row: Risque) => (
        <span className="text-sm text-sec">{row.niveau || "—"}</span>
      ),
    },
    {
      label: "Statut",
      key: "statut",
      render: (row: Risque) => (
        <EditableCell
          value={row.statut}
          type="select"
          options={STATUT_OPTIONS}
          onSave={(value) => update(row.id, { statut: String(value) })}
        />
      ),
    },
    {
      label: "Action prévue",
      key: "action_prevue",
      render: (row: Risque) => (
        <EditableCell
          value={row.action_prevue || ""}
          type="text"
          onSave={(value) => update(row.id, { action_prevue: String(value) || null })}
        />
      ),
    },
    {
      label: "",
      key: "actions",
      render: (row: Risque) => (
        <button
          onClick={() => setDeleteId(row.id)}
          className="text-mut hover:text-accent transition-colors"
        >
          Supprimer
        </button>
      ),
    },
  ];

  const getCellColor = (p: number, g: number): string => {
    const criticite = p * g;
    if (criticite >= 15) return "var(--risk-red)";
    if (criticite >= 6) return "var(--risk-amb)";
    return "var(--risk-grn)";
  };

  if (loadingRisques || loadingProcessus) {
    return <div className="p-8 text-sec">Chargement des risques...</div>;
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Total risques"
          value={kpis.total.toString()}
          subtitle="Risques identifiés"
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Identifiés"
          value={kpis.identifies.toString()}
          subtitle="Traitement à engager"
          accent="amber"
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="En traitement"
          value={kpis.enTraitement.toString()}
          subtitle="Suivi nécessaire"
          accent="amber"
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Maîtrisés / clos"
          value={kpis.maitrises.toString()}
          subtitle="Niveau acceptable"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <select
            value={filterProcessus}
            onChange={(e) => setFilterProcessus(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">Tous les processus</option>
            {processus.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">Tous statuts</option>
            {STATUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">Toutes sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <AddButton onClick={() => setShowAddModal(true)} label="Nouveau risque" />
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-4 border-b border-brd">
        <button
          onClick={() => setViewMode("matrice")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            viewMode === "matrice"
              ? "text-accent border-b-2 border-accent"
              : "text-sec hover:text-text"
          }`}
        >
          Matrice 5x5
        </button>
        <button
          onClick={() => setViewMode("amdec")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            viewMode === "amdec"
              ? "text-accent border-b-2 border-accent"
              : "text-sec hover:text-text"
          }`}
        >
          Vue AMDEC
        </button>
        <button
          onClick={() => setViewMode("processus")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            viewMode === "processus"
              ? "text-accent border-b-2 border-accent"
              : "text-sec hover:text-text"
          }`}
        >
          Par processus
        </button>
      </div>

      {/* Matrice View */}
      {viewMode === "matrice" && (
        <div className="space-y-6">
          <div className="bg-card border border-brd rounded-xl p-6">
            <h3 className="text-sm font-semibold text-sec mb-4 uppercase tracking-wider">
              Matrice Probabilité × Gravité
            </h3>
            <div className="grid gap-4">
              {/* Grid */}
              <div className="grid grid-cols-6 gap-2">
                {/* Empty corner */}
                <div className="h-10 flex items-center justify-center text-xs font-semibold text-mut"></div>
                {/* Gravity headers */}
                {[1, 2, 3, 4, 5].map((g) => (
                  <div key={g} className="h-10 flex items-center justify-center text-xs font-semibold text-sec">
                    G{g}
                  </div>
                ))}
                {/* Probability rows */}
                {[5, 4, 3, 2, 1].map((p) => (
                  <React.Fragment key={p}>
                    <div className="h-12 flex items-center justify-center text-xs font-semibold text-sec">
                      P{p}
                    </div>
                    {[1, 2, 3, 4, 5].map((g) => {
                      const cellRisques = filteredRisques.filter(
                        (r) => r.probabilite === p && r.gravite === g
                      );
                      return (
                        <div
                          key={`${p}-${g}`}
                          className="h-12 rounded border border-brd flex items-center justify-center relative"
                          style={{ backgroundColor: getCellColor(p, g) }}
                        >
                          {cellRisques.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center gap-1">
                              {cellRisques.map((risque) => (
                                <div
                                  key={risque.id}
                                  className="w-3 h-3 rounded-full bg-card border-2 border-text"
                                  title={risque.titre}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-6 items-center justify-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--risk-grn)" }}></div>
                  <span className="text-secondary">Acceptable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--risk-amb)" }}></div>
                  <span className="text-secondary">Surveillance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--risk-red)" }}></div>
                  <span className="text-secondary">Inacceptable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-brd rounded-xl p-6">
              <h3 className="text-sm font-semibold text-sec mb-4 uppercase tracking-wider">
                Répartition par statut
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-brd rounded-xl p-6">
              <h3 className="text-sm font-semibold text-sec mb-4 uppercase tracking-wider">
                Criticité par processus
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="maitrise" stackId="a" fill="var(--risk-grn)" name="Maîtrisé / clos" />
                  <Bar dataKey="enTraitement" stackId="a" fill="var(--risk-amb)" name="En traitement" />
                  <Bar dataKey="identifie" stackId="a" fill="var(--risk-red)" name="Identifié" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AMDEC View */}
      {viewMode === "amdec" && (
        <div className="bg-card rounded-xl border border-brd overflow-hidden">
          <DataTable columns={columns} data={filteredRisques} />
        </div>
      )}

      {/* Processus View */}
      {viewMode === "processus" && (
        <div className="space-y-6">
          {processus.map((proc) => {
            const procRisques = filteredRisques.filter((r) => r.processus_id === proc.id);
            if (procRisques.length === 0) return null;

            return (
              <div key={proc.id} className="bg-card border border-brd rounded-xl p-6">
                <h3 className="text-sm font-semibold text-sec mb-4 uppercase tracking-wider">
                  {proc.nom}
                </h3>
                <div className="space-y-3">
                  {procRisques.map((risque) => (
                    <div key={risque.id} className="flex items-center justify-between p-3 bg-elev rounded border border-brd">
                      <div className="flex-1">
                        <p className="text-sm text-text font-medium">{risque.titre}</p>
                        <p className="text-xs text-mut mt-1">
                          P{risque.probabilite} × G{risque.gravite} × D{risque.detectabilite} = {criticiteOf(risque)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatutBadgeVariant(risque.statut)}>
                          {labelFor(STATUT_OPTIONS, risque.statut)}
                        </Badge>
                        {risque.niveau && <span className="text-xs text-sec">{risque.niveau}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        title="Nouveau risque"
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Titre
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Ex : Rupture de la chaîne du froid en livraison EHPAD"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Processus
              </label>
              <select
                value={formData.processus_id}
                onChange={(e) => setFormData({ ...formData, processus_id: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                <option value="">Sélectionner un processus</option>
                {processus.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Ex : Audit interne, AMDEC initiale..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Probabilité (1-5)
                </label>
                <select
                  value={formData.probabilite}
                  onChange={(e) => setFormData({ ...formData, probabilite: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Gravité (1-5)
                </label>
                <select
                  value={formData.gravite}
                  onChange={(e) => setFormData({ ...formData, gravite: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Détectabilité (1-5)
                </label>
                <select
                  value={formData.detectabilite}
                  onChange={(e) => setFormData({ ...formData, detectabilite: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Action prévue
              </label>
              <textarea
                value={formData.action_prevue}
                onChange={(e) => setFormData({ ...formData, action_prevue: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {STATUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brd">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.titre.trim()}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDelete
        isOpen={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        itemName="ce risque"
      />
    </div>
  );
};
