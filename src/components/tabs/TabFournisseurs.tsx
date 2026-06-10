"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Fournisseur, FournisseurInsert } from "@/lib/db-rows";
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
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping (aligned on real DB CHECKs)  */
/* ------------------------------------------------------------------ */
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "LABO", label: "Laboratoire" },
  { value: "GROSSISTE", label: "Grossiste" },
  { value: "MATERIEL", label: "Matériel" },
  { value: "SERVICE", label: "Service" },
  { value: "AUTRE", label: "Autre" },
];

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
];

const labelFor = (opts: { value: string; label: string }[], v: string | null): string =>
  opts.find((o) => o.value === v)?.label ?? String(v ?? "");

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF", "#CC88FF"];

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
    data: fournisseurs,
    loading: loadingFournisseurs,
    create: createFournisseur,
    update: updateFournisseur,
    remove: removeFournisseur,
  } = useSupabaseCrud<Fournisseur>("fournisseurs", {
    orderBy: { column: "nom", ascending: true },
  });

  const [showAddFournisseurModal, setShowAddFournisseurModal] = useState(false);
  const [deleteFournisseurId, setDeleteFournisseurId] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>("all");
  const [filterScoreMin, setFilterScoreMin] = useState<number>(0);
  const [filterScoreMax, setFilterScoreMax] = useState<number>(100);
  const [filterQualifie, setFilterQualifie] = useState<string>("all");

  const [newFournisseur, setNewFournisseur] = useState<Partial<FournisseurInsert>>({
    nom: "",
    type: "GROSSISTE",
    qualifie: false,
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalFournisseurs = fournisseurs.length;

    const scores = fournisseurs
      .filter((f) => f.score_evaluation !== null)
      .map((f) => f.score_evaluation as number);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((acc, s) => acc + s, 0) / scores.length)
      : 0;

    const totalNc = fournisseurs.reduce((acc, f) => acc + (f.nb_nc || 0), 0);

    const qualified = fournisseurs.filter((f) => f.qualifie).length;
    const qualifiedPercent = totalFournisseurs > 0
      ? Math.round((qualified / totalFournisseurs) * 100)
      : 0;

    return {
      totalFournisseurs,
      avgScore,
      totalNc,
      qualifiedPercent,
    };
  }, [fournisseurs]);

  // Filter fournisseurs
  const filteredFournisseurs = useMemo(() => {
    return fournisseurs.filter((f) => {
      if (filterType !== "all" && f.type !== filterType) return false;
      if (f.score_evaluation !== null) {
        if (f.score_evaluation < filterScoreMin || f.score_evaluation > filterScoreMax) return false;
      }
      if (filterQualifie !== "all") {
        const qualifieValue = filterQualifie === "true";
        if ((f.qualifie ?? false) !== qualifieValue) return false;
      }
      return true;
    });
  }, [fournisseurs, filterType, filterScoreMin, filterScoreMax, filterQualifie]);

  // Chart data: fournisseurs by type
  const fournisseursByType = useMemo(() => {
    const counts: Record<string, number> = {};
    fournisseurs.forEach((f) => {
      const lbl = labelFor(TYPE_OPTIONS, f.type);
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [fournisseurs]);

  // Chart data: qualification status
  const qualificationData = useMemo(() => {
    const qualified = fournisseurs.filter((f) => f.qualifie).length;
    const notQualified = fournisseurs.length - qualified;
    return [
      { name: "Qualifiés", value: qualified },
      { name: "Non qualifiés", value: notQualified },
    ];
  }, [fournisseurs]);

  // Chart data: scores by fournisseur (top 10)
  const scoresByFournisseur = useMemo(() => {
    return fournisseurs
      .filter((f) => f.score_evaluation !== null)
      .map((f) => ({
        name: f.nom.length > 20 ? f.nom.substring(0, 20) + "..." : f.nom,
        score: f.score_evaluation,
        color: getScoreColor(f.score_evaluation),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);
  }, [fournisseurs]);

  const handleAddFournisseur = async () => {
    try {
      await createFournisseur(newFournisseur as FournisseurInsert);
      setShowAddFournisseurModal(false);
      setNewFournisseur({
        nom: "",
        type: "GROSSISTE",
        qualifie: false,
      });
    } catch (error) {
      console.error("Error creating fournisseur:", error);
    }
  };

  const handleDeleteFournisseur = async () => {
    if (!deleteFournisseurId) return;
    try {
      await removeFournisseur(deleteFournisseurId);
      setDeleteFournisseurId(null);
    } catch (error) {
      console.error("Error deleting fournisseur:", error);
    }
  };

  const fournisseurColumns: ColumnDef<Fournisseur>[] = [
    {
      key: "nom",
      label: "Nom",
      render: (fournisseur) => (
        <EditableCell
          value={fournisseur.nom}
          type="text"
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, { nom: String(value) });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (fournisseur) => (
        <EditableCell
          value={fournisseur.type || ""}
          type="select"
          options={TYPE_OPTIONS}
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, { type: String(value) });
          }}
        />
      ),
    },
    {
      key: "contact_nom",
      label: "Contact",
      render: (fournisseur) => (
        <EditableCell
          value={fournisseur.contact_nom || ""}
          type="text"
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, { contact_nom: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "contact_email",
      label: "Email",
      render: (fournisseur) => (
        <EditableCell
          value={fournisseur.contact_email || ""}
          type="text"
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, { contact_email: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "date_derniere_evaluation",
      label: "Dernière évaluation",
      render: (fournisseur) => (
        <EditableCell
          value={fournisseur.date_derniere_evaluation || ""}
          type="date"
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, {
              date_derniere_evaluation: String(value) || null,
            });
          }}
        />
      ),
    },
    {
      key: "date_prochaine_evaluation",
      label: "Prochaine évaluation",
      render: (fournisseur) => (
        <EditableCell
          value={fournisseur.date_prochaine_evaluation || ""}
          type="date"
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, {
              date_prochaine_evaluation: String(value) || null,
            });
          }}
        />
      ),
    },
    {
      key: "score_evaluation",
      label: "Score évaluation",
      render: (fournisseur) => (
        <div className="flex items-center gap-2">
          <EditableCell
            value={fournisseur.score_evaluation?.toString() || ""}
            type="number"
            onSave={async (value) => {
              const score = value ? parseInt(String(value), 10) : null;
              await updateFournisseur(fournisseur.id, { score_evaluation: score });
            }}
          />
          {fournisseur.score_evaluation !== null && (
            <Badge variant={getScoreBadgeVariant(fournisseur.score_evaluation)}>
              {fournisseur.score_evaluation}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "qualifie",
      label: "Qualifié",
      render: (fournisseur) => (
        <EditableCell
          value={(fournisseur.qualifie ?? false).toString()}
          type="select"
          options={BOOLEAN_OPTIONS}
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, { qualifie: value === "true" });
          }}
        />
      ),
    },
    {
      key: "nb_nc",
      label: "NC",
      render: (fournisseur) => (
        <EditableCell
          value={(fournisseur.nb_nc ?? 0).toString()}
          type="number"
          onSave={async (value) => {
            await updateFournisseur(fournisseur.id, { nb_nc: parseInt(String(value), 10) || 0 });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (fournisseur) => (
        <button
          onClick={() => setDeleteFournisseurId(fournisseur.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  if (loadingFournisseurs) {
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
          value={kpis.totalFournisseurs.toString()}
          subtitle="Fournisseurs actifs"
        />
        <KpiCard
          icon={<TruckIcon size={20} />}
          label="Score moyen évaluation"
          value={kpis.avgScore.toString()}
          subtitle="Moyenne des scores"
          accent={kpis.avgScore < 70 ? "amber" : "default"}
        />
        <KpiCard
          icon={<TruckIcon size={20} />}
          label="Non-conformités"
          value={kpis.totalNc.toString()}
          subtitle="NC cumulées fournisseurs"
          accent={kpis.totalNc > 0 ? "amber" : "default"}
        />
        <KpiCard
          icon={<TruckIcon size={20} />}
          label="Fournisseurs qualifiés"
          value={`${kpis.qualifiedPercent}%`}
          subtitle="Qualification validée"
          accent={kpis.qualifiedPercent >= 80 ? "default" : "amber"}
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
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
          value={filterQualifie}
          onChange={(e) => setFilterQualifie(e.target.value)}
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
        >
          <option value="all">Qualifié: Tous</option>
          <option value="true">Qualifié: Oui</option>
          <option value="false">Qualifié: Non</option>
        </select>

        <div className="ml-auto">
          <AddButton onClick={() => setShowAddFournisseurModal(true)} />
        </div>
      </div>

      {/* Fournisseurs Data Table */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Registre fournisseurs</h2>
        <DataTable columns={fournisseurColumns} data={filteredFournisseurs} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scores by Fournisseur */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Scores par fournisseur (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scoresByFournisseur} layout="vertical">
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
                {scoresByFournisseur.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fournisseurs by Type */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Fournisseurs par type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={fournisseursByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {fournisseursByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Qualification */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Qualification fournisseurs</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={qualificationData}
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

      {/* Add Fournisseur Modal */}
      {showAddFournisseurModal && (
        <Modal
          isOpen={showAddFournisseurModal}
          title="Nouveau fournisseur"
          onClose={() => setShowAddFournisseurModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Nom *</label>
              <input
                type="text"
                value={newFournisseur.nom}
                onChange={(e) => setNewFournisseur({ ...newFournisseur, nom: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Nom du fournisseur"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">Type</label>
                <select
                  value={newFournisseur.type || "GROSSISTE"}
                  onChange={(e) => setNewFournisseur({ ...newFournisseur, type: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">Qualifié</label>
                <select
                  value={(newFournisseur.qualifie ?? false).toString()}
                  onChange={(e) =>
                    setNewFournisseur({ ...newFournisseur, qualifie: e.target.value === "true" })
                  }
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

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Nom du contact</label>
              <input
                type="text"
                value={newFournisseur.contact_nom || ""}
                onChange={(e) => setNewFournisseur({ ...newFournisseur, contact_nom: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Interlocuteur principal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">Email</label>
                <input
                  type="email"
                  value={newFournisseur.contact_email || ""}
                  onChange={(e) =>
                    setNewFournisseur({ ...newFournisseur, contact_email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="contact@fournisseur.fr"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={newFournisseur.contact_tel || ""}
                  onChange={(e) =>
                    setNewFournisseur({ ...newFournisseur, contact_tel: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Notes</label>
              <textarea
                value={newFournisseur.notes || ""}
                onChange={(e) => setNewFournisseur({ ...newFournisseur, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Notes complémentaires..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddFournisseurModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddFournisseur}
                disabled={!newFournisseur.nom}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Fournisseur Confirmation */}
      {deleteFournisseurId && (
        <ConfirmDelete
          isOpen={!!deleteFournisseurId}
          itemName="ce fournisseur"
          onConfirm={handleDeleteFournisseur}
          onCancel={() => setDeleteFournisseurId(null)}
        />
      )}
    </div>
  );
}
