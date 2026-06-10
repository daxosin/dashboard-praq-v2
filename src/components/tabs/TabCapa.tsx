"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
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

/* ------------------------------------------------------------------ */
/*  DB row shape (aligned on real Supabase `capa` table)              */
/* ------------------------------------------------------------------ */
type CapaRow = {
  id: string;
  reference: string | null;
  titre: string;
  type: "CORRECTIVE" | "PREVENTIVE";
  source: "AUDIT" | "RECLAMATION" | "VIGILANCE" | "DYSFONCTIONNEMENT" | "REVUE" | "AUTRE" | null;
  description: string | null;
  responsable: string | null;
  date_ouverture: string;
  date_echeance: string | null;
  date_cloture: string | null;
  statut: "OUVERTE" | "EN_COURS" | "VERIFICATION" | "CLOSE";
  priorite: "HAUTE" | "MOYENNE" | "BASSE" | null;
  processus_id: string | null;
  actions: string | null;
  verification_efficacite: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ProcessusRow = {
  id: string;
  code: string | null;
  nom: string;
};

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping                              */
/* ------------------------------------------------------------------ */
const SOURCE_OPTIONS: { value: CapaRow["source"]; label: string }[] = [
  { value: "AUDIT", label: "Audit" },
  { value: "RECLAMATION", label: "Réclamation" },
  { value: "VIGILANCE", label: "Vigilance" },
  { value: "DYSFONCTIONNEMENT", label: "Dysfonctionnement" },
  { value: "REVUE", label: "Revue direction" },
  { value: "AUTRE", label: "Autre" },
];

const TYPE_OPTIONS: { value: CapaRow["type"]; label: string }[] = [
  { value: "CORRECTIVE", label: "Corrective" },
  { value: "PREVENTIVE", label: "Préventive" },
];

const STATUT_OPTIONS: { value: CapaRow["statut"]; label: string }[] = [
  { value: "OUVERTE", label: "Ouverte" },
  { value: "EN_COURS", label: "En cours" },
  { value: "VERIFICATION", label: "Vérification efficacité" },
  { value: "CLOSE", label: "Clôturée" },
];

const PRIORITE_OPTIONS: { value: CapaRow["priorite"]; label: string }[] = [
  { value: "HAUTE", label: "Haute" },
  { value: "MOYENNE", label: "Moyenne" },
  { value: "BASSE", label: "Basse" },
];

const labelFor = <T extends string | null>(
  opts: { value: T; label: string }[],
  v: T,
): string => opts.find((o) => o.value === v)?.label ?? String(v ?? "");

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF", "#CC88FF", "#FF8844"];

const inputCls =
  "w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all";
const labelCls = "block text-[13px] font-semibold text-sec mb-2";

/* ================================================================== */
export function TabCapa() {
  const { data: capas, loading: loadingCapas, create, update, remove } = useSupabaseCrud<CapaRow>("capa", {
    orderBy: { column: "date_ouverture", ascending: false },
  });

  const { data: processus, loading: loadingProcessus } = useSupabaseCrud<ProcessusRow>("processus", {
    orderBy: { column: "nom", ascending: true },
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterProcessus, setFilterProcessus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const [newCapa, setNewCapa] = useState<Partial<CapaRow>>({
    titre: "",
    source: "AUTRE",
    type: "CORRECTIVE",
    statut: "OUVERTE",
    priorite: "MOYENNE",
    description: "",
  });

  /* ---- KPIs ----------------------------------------------------- */
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const open = capas.filter((c) => c.statut !== "CLOSE");
    const overdue = open.filter((c) => {
      if (!c.date_echeance) return false;
      return new Date(c.date_echeance) < today;
    });
    const closed = capas.filter((c) => c.statut === "CLOSE");
    const closureRate = capas.length > 0 ? (closed.length / capas.length) * 100 : 0;
    const avgDelay =
      closed.length > 0
        ? closed.reduce((acc, c) => {
            if (!c.date_ouverture || !c.date_cloture) return acc;
            const op = new Date(c.date_ouverture);
            const cl = new Date(c.date_cloture);
            return acc + Math.floor((cl.getTime() - op.getTime()) / 86400000);
          }, 0) / closed.length
        : 0;

    return {
      totalOpen: open.length,
      overdue: overdue.length,
      closureRate: Math.round(closureRate),
      avgDelay: Math.round(avgDelay),
      overdueList: overdue,
    };
  }, [capas]);

  /* ---- filters -------------------------------------------------- */
  const filteredCapas = useMemo(() => {
    return capas.filter((c) => {
      if (filterStatus !== "all" && c.statut !== filterStatus) return false;
      if (filterSource !== "all" && c.source !== filterSource) return false;
      if (filterProcessus !== "all" && c.processus_id !== filterProcessus) return false;
      if (filterType !== "all" && c.type !== filterType) return false;
      return true;
    });
  }, [capas, filterStatus, filterSource, filterProcessus, filterType]);

  /* ---- chart data ----------------------------------------------- */
  const analysisBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    capas.forEach((c) => {
      const lbl = labelFor(SOURCE_OPTIONS, c.source);
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [capas]);

  const analysisByType = useMemo(() => {
    const counts: Record<string, number> = {};
    capas.forEach((c) => {
      const lbl = labelFor(TYPE_OPTIONS, c.type);
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [capas]);

  const trendData = useMemo(() => {
    const monthly: Record<string, { month: string; opened: number; closed: number }> = {};
    capas.forEach((c) => {
      if (c.date_ouverture) {
        const m = c.date_ouverture.substring(0, 7);
        monthly[m] = monthly[m] || { month: m, opened: 0, closed: 0 };
        monthly[m].opened += 1;
      }
      if (c.date_cloture) {
        const m = c.date_cloture.substring(0, 7);
        monthly[m] = monthly[m] || { month: m, opened: 0, closed: 0 };
        monthly[m].closed += 1;
      }
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [capas]);

  const processusMap = useMemo(() => {
    const m: Record<string, string> = {};
    processus.forEach((p) => {
      m[p.id] = p.nom;
    });
    return m;
  }, [processus]);

  /* ---- handlers ------------------------------------------------- */
  const handleAdd = async () => {
    setCreateError(null);
    if (!newCapa.titre || !newCapa.titre.trim()) {
      setCreateError("L'objet (titre) est obligatoire.");
      return;
    }
    try {
      const payload: Partial<CapaRow> = {
        titre: newCapa.titre.trim(),
        type: newCapa.type ?? "CORRECTIVE",
        source: newCapa.source ?? "AUTRE",
        statut: newCapa.statut ?? "OUVERTE",
        priorite: newCapa.priorite ?? "MOYENNE",
        description: newCapa.description?.trim() || null,
        responsable: newCapa.responsable?.trim() || null,
        date_echeance: newCapa.date_echeance || null,
        processus_id: newCapa.processus_id || null,
        actions: newCapa.actions?.trim() || null,
        notes: newCapa.notes?.trim() || null,
      };
      await create(payload);
      setShowAddModal(false);
      setNewCapa({
        titre: "",
        source: "AUTRE",
        type: "CORRECTIVE",
        statut: "OUVERTE",
        priorite: "MOYENNE",
        description: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue lors de la création.";
      setCreateError(msg);
      console.error("Error creating CAPA:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting CAPA:", err);
    }
  };

  /* ---- columns -------------------------------------------------- */
  const columns: ColumnDef<CapaRow>[] = [
    {
      key: "reference",
      label: "Réf.",
      render: (c) => (
        <span className="text-xs font-mono text-accent">
          {c.reference || `CAPA-${c.id.substring(0, 4).toUpperCase()}`}
        </span>
      ),
    },
    {
      key: "titre",
      label: "Objet",
      render: (c) => (
        <EditableCell
          value={c.titre}
          type="text"
          onSave={async (v) => {
            const s = String(v).trim();
            if (s) await update(c.id, { titre: s });
          }}
        />
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (c) => <Badge variant="plan">{labelFor(SOURCE_OPTIONS, c.source)}</Badge>,
    },
    {
      key: "type",
      label: "Type",
      render: (c) => (
        <Badge variant={c.type === "CORRECTIVE" ? "crit" : "wip"}>
          {labelFor(TYPE_OPTIONS, c.type)}
        </Badge>
      ),
    },
    {
      key: "processus_id",
      label: "Processus",
      render: (c) => (
        <EditableCell
          value={c.processus_id || ""}
          type="select"
          options={processus.map((p) => ({ value: p.id, label: p.nom }))}
          onSave={async (v) => {
            await update(c.id, { processus_id: String(v) || null });
          }}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (c) => (
        <EditableCell
          value={c.description || ""}
          type="text"
          onSave={async (v) => {
            await update(c.id, { description: String(v) || null });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions correctives",
      render: (c) => (
        <EditableCell
          value={c.actions || ""}
          type="text"
          onSave={async (v) => {
            await update(c.id, { actions: String(v) || null });
          }}
        />
      ),
    },
    {
      key: "responsable",
      label: "Responsable",
      render: (c) => (
        <EditableCell
          value={c.responsable || ""}
          type="text"
          onSave={async (v) => {
            await update(c.id, { responsable: String(v) || null });
          }}
        />
      ),
    },
    {
      key: "date_echeance",
      label: "Échéance",
      render: (c) => (
        <EditableCell
          value={c.date_echeance || ""}
          type="date"
          onSave={async (v) => {
            await update(c.id, { date_echeance: String(v) || null });
          }}
        />
      ),
    },
    {
      key: "priorite",
      label: "Priorité",
      render: (c) => (
        <EditableCell
          value={c.priorite || ""}
          type="select"
          options={PRIORITE_OPTIONS.map((o) => ({ value: o.value as string, label: o.label }))}
          onSave={async (v) => {
            await update(c.id, { priorite: (String(v) || null) as CapaRow["priorite"] });
          }}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (c) => (
        <EditableCell
          value={c.statut}
          type="select"
          options={STATUT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onSave={async (v) => {
            const newStatut = String(v) as CapaRow["statut"];
            const updates: Partial<CapaRow> = { statut: newStatut };
            if (newStatut === "CLOSE" && !c.date_cloture) {
              updates.date_cloture = new Date().toISOString().substring(0, 10);
            }
            await update(c.id, updates);
          }}
        />
      ),
    },
    {
      key: "verification_efficacite",
      label: "Vérif. efficacité",
      render: (c) => (
        <EditableCell
          value={c.verification_efficacite || ""}
          type="text"
          onSave={async (v) => {
            await update(c.id, { verification_efficacite: String(v) || null });
          }}
        />
      ),
    },
    {
      key: "id",
      label: "",
      render: (c) => (
        <button
          onClick={() => setDeleteId(c.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  if (loadingCapas || loadingProcessus) {
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
        <KpiCard icon={<ZapIcon size={20} />} label="Total ouvertes" value={kpis.totalOpen.toString()} subtitle="CAPA non clôturées" />
        <KpiCard icon={<ZapIcon size={20} />} label="En retard" value={kpis.overdue.toString()} subtitle="Action requise" accent="amber" />
        <KpiCard icon={<ZapIcon size={20} />} label="Taux clôture" value={`${kpis.closureRate}%`} subtitle="Clôturées / Total" />
        <KpiCard icon={<ZapIcon size={20} />} label="Délai moyen" value={`${kpis.avgDelay}j`} subtitle="Ouverture → Clôture" />
      </div>

      {/* Overdue alerts */}
      {kpis.overdueList.length > 0 && (
        <div className="space-y-2">
          {kpis.overdueList.map((c) => (
            <AlertLine
              key={c.id}
              severity="red"
              message={`CAPA ${c.reference || c.id.substring(0, 4).toUpperCase()} en retard — ${c.titre.substring(0, 80)}`}
              href={`#capa-${c.id}`}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text">
          <option value="all">Tous statuts</option>
          {STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text">
          <option value="all">Toutes sources</option>
          {SOURCE_OPTIONS.map((o) => <option key={o.value as string} value={o.value as string}>{o.label}</option>)}
        </select>
        <select value={filterProcessus} onChange={(e) => setFilterProcessus(e.target.value)} className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text">
          <option value="all">Tous processus</option>
          {processus.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 bg-card border border-brd rounded-xl text-[14px] text-text">
          <option value="all">Tous types</option>
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="ml-auto">
          <AddButton onClick={() => { setCreateError(null); setShowAddModal(true); }} />
        </div>
      </div>

      <DataTable columns={columns} data={filteredCapas} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Analyse par source</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={analysisBySource} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={80} dataKey="value">
                {analysisBySource.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Analyse par type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analysisByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
              <XAxis dataKey="name" tick={{ fill: "var(--mut)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--mut)", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--brd)", borderRadius: "12px" }} />
              <Bar dataKey="value" fill={THEME_COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-brd rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text mb-4">Tendance mensuelle</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
            <XAxis dataKey="month" tick={{ fill: "var(--mut)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--mut)", fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--brd)", borderRadius: "12px" }} />
            <Legend />
            <Line type="monotone" dataKey="opened" stroke={THEME_COLORS.grn} name="Ouvertes" strokeWidth={2} />
            <Line type="monotone" dataKey="closed" stroke={THEME_COLORS.amb} name="Clôturées" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} title="Nouvelle CAPA" onClose={() => setShowAddModal(false)}>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Objet (titre) *</label>
              <input
                type="text"
                value={newCapa.titre || ""}
                onChange={(e) => setNewCapa({ ...newCapa, titre: e.target.value })}
                className={inputCls}
                placeholder="Ex : Sécurisation procédure retrait de lot"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Source</label>
                <select value={newCapa.source ?? "AUTRE"} onChange={(e) => setNewCapa({ ...newCapa, source: e.target.value as CapaRow["source"] })} className={inputCls}>
                  {SOURCE_OPTIONS.map((o) => <option key={o.value as string} value={o.value as string}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select value={newCapa.type ?? "CORRECTIVE"} onChange={(e) => setNewCapa({ ...newCapa, type: e.target.value as CapaRow["type"] })} className={inputCls}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Priorité</label>
                <select value={newCapa.priorite ?? "MOYENNE"} onChange={(e) => setNewCapa({ ...newCapa, priorite: e.target.value as CapaRow["priorite"] })} className={inputCls}>
                  {PRIORITE_OPTIONS.map((o) => <option key={o.value as string} value={o.value as string}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Statut</label>
                <select value={newCapa.statut ?? "OUVERTE"} onChange={(e) => setNewCapa({ ...newCapa, statut: e.target.value as CapaRow["statut"] })} className={inputCls}>
                  {STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Processus</label>
              <select value={newCapa.processus_id || ""} onChange={(e) => setNewCapa({ ...newCapa, processus_id: e.target.value || null })} className={inputCls}>
                <option value="">Aucun processus rattaché</option>
                {processus.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={newCapa.description || ""}
                onChange={(e) => setNewCapa({ ...newCapa, description: e.target.value })}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Contexte, faits constatés, impact..."
              />
            </div>

            <div>
              <label className={labelCls}>Actions correctives</label>
              <textarea
                value={newCapa.actions || ""}
                onChange={(e) => setNewCapa({ ...newCapa, actions: e.target.value })}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Plan d'action prévu..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Responsable</label>
                <input
                  type="text"
                  value={newCapa.responsable || ""}
                  onChange={(e) => setNewCapa({ ...newCapa, responsable: e.target.value })}
                  className={inputCls}
                  placeholder="Nom du responsable"
                />
              </div>
              <div>
                <label className={labelCls}>Échéance</label>
                <input
                  type="date"
                  value={newCapa.date_echeance || ""}
                  onChange={(e) => setNewCapa({ ...newCapa, date_echeance: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={newCapa.notes || ""}
                onChange={(e) => setNewCapa({ ...newCapa, notes: e.target.value })}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Notes complémentaires..."
              />
            </div>

            {createError && (
              <div className="px-4 py-3 bg-red/10 border border-red/40 rounded-xl text-[13px] text-red">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]">
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!newCapa.titre || !newCapa.titre.trim()}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

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
