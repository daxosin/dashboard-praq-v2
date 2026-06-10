"use client";

import React, { useState, useMemo } from "react";
import {
  KpiCard,
  DataTable,
  EditableCell,
  AddButton,
  Modal,
  ConfirmDelete,
  AlertLine,
  type ColumnDef,
} from "@/components/ui";
import { ShieldIcon, TriangleIcon, TrashIcon } from "@/components/icons";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Vigilance, VigilanceInsert } from "@/lib/db-rows";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Valeurs DB (UPPERCASE) <-> libellés français                      */
/* ------------------------------------------------------------------ */
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "PHARMACOVIGILANCE", label: "Pharmacovigilance" },
  { value: "MATERIOVIGILANCE", label: "Matériovigilance" },
  { value: "COSMETOVIGILANCE", label: "Cosmétovigilance" },
  { value: "NUTRIVIGILANCE", label: "Nutrivigilance" },
];

const RETRAIT_LOT = "RETRAIT_LOT";

const STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "OUVERT", label: "Ouvert" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TRAITE", label: "Traité" },
  { value: "CLOS", label: "Clos" },
];

const labelFor = (
  opts: { value: string; label: string }[],
  v: string | null
): string => opts.find((o) => o.value === v)?.label ?? String(v ?? "");

const today = () => new Date().toISOString().substring(0, 10);

const inputCls =
  "w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all";
const labelCls = "block text-[13px] font-semibold text-sec mb-2";

export default function TabVigilances() {
  const {
    data: vigilances,
    loading: loadingVigilances,
    create: createVigilance,
    update: updateVigilance,
    remove: removeVigilance,
  } = useSupabaseCrud<Vigilance>("vigilances", {
    orderBy: { column: "date_signal", ascending: false },
  });

  const [showVigilanceModal, setShowVigilanceModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [deleteVigilanceId, setDeleteVigilanceId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterDeclaredAnsm, setFilterDeclaredAnsm] = useState<string>("all");

  const [newVigilance, setNewVigilance] = useState({
    type: "PHARMACOVIGILANCE",
    titre: "",
    date_signal: today(),
    description: "",
    actions_prises: "",
    ref_declaration_ansm: "",
    statut: "OUVERT",
  });

  const [newRecall, setNewRecall] = useState({
    titre: "",
    date_signal: today(),
    etape_courante: "",
    nb_unites_concernees: "",
    nb_unites_isolees: "",
    ref_declaration_ansm: "",
    statut: "OUVERT",
  });

  /* ---- Séparation signalements / rappels de lots ----------------- */
  // Les rappels de lots sont des vigilances de type RETRAIT_LOT (pas de table `recalls`)
  const signalements = useMemo(
    () => vigilances.filter((v) => v.type !== RETRAIT_LOT),
    [vigilances]
  );
  const rappels = useMemo(
    () => vigilances.filter((v) => v.type === RETRAIT_LOT),
    [vigilances]
  );

  /* ---- KPIs ------------------------------------------------------ */
  const totalVigilances = vigilances.length;
  const enCoursCount = vigilances.filter(
    (v) => v.statut === "OUVERT" || v.statut === "EN_COURS"
  ).length;
  const declaredAnsmPercentage =
    totalVigilances > 0
      ? Math.round(
          (vigilances.filter((v) => v.declare_ansm_at).length /
            totalVigilances) *
            100
        )
      : 0;
  const activeRecalls = rappels.filter((r) => r.statut !== "CLOS").length;

  /* ---- Filtres (table signalements) ------------------------------ */
  const filteredSignalements = useMemo(() => {
    return signalements.filter((v) => {
      if (filterType !== "all" && v.type !== filterType) return false;
      if (filterStatut !== "all" && v.statut !== filterStatut) return false;
      if (filterDeclaredAnsm === "yes" && !v.declare_ansm_at) return false;
      if (filterDeclaredAnsm === "no" && v.declare_ansm_at) return false;
      return true;
    });
  }, [signalements, filterType, filterStatut, filterDeclaredAnsm]);

  /* ---- Alertes : rappels de lots actifs non déclarés ANSM --------- */
  const undeclaredRecalls = rappels.filter(
    (r) => r.statut !== "CLOS" && !r.declare_ansm_at
  );

  /* ---- Données graphiques ----------------------------------------- */
  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    vigilances.forEach((v) => {
      const lbl =
        v.type === RETRAIT_LOT
          ? "Retrait de lot"
          : labelFor(TYPE_OPTIONS, v.type);
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vigilances]);

  const statutChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUT_OPTIONS.forEach((o) => {
      counts[o.label] = 0;
    });
    vigilances.forEach((v) => {
      const lbl = labelFor(STATUT_OPTIONS, v.statut);
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vigilances]);

  const COLORS = [
    "var(--accent)",
    "var(--text-secondary)",
    "var(--border)",
    "var(--text-muted)",
    "var(--amb)",
  ];

  /* ---- Statut éditable : pose date_traitement à la clôture -------- */
  const saveStatut = async (row: Vigilance, value: string) => {
    const updates: Partial<Vigilance> = { statut: value };
    if ((value === "TRAITE" || value === "CLOS") && !row.date_traitement) {
      updates.date_traitement = today();
    }
    await updateVigilance(row.id, updates);
  };

  /* ---- Colonnes signalements -------------------------------------- */
  const vigilanceColumns: ColumnDef<Vigilance>[] = [
    {
      key: "reference",
      label: "Réf.",
      render: (row) => (
        <span className="text-xs font-mono text-accent">
          {row.reference || `VIG-${row.id.substring(0, 4).toUpperCase()}`}
        </span>
      ),
    },
    {
      key: "titre",
      label: "Titre",
      render: (row) => (
        <EditableCell
          value={row.titre}
          type="text"
          onSave={async (value) => {
            const s = String(value).trim();
            if (s) await updateVigilance(row.id, { titre: s });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <EditableCell
          value={row.type}
          type="select"
          options={TYPE_OPTIONS}
          onSave={(value) => updateVigilance(row.id, { type: String(value) })}
        />
      ),
    },
    {
      key: "date_signal",
      label: "Date signalement",
      render: (row) => (
        <EditableCell
          value={row.date_signal}
          type="date"
          onSave={async (value) => {
            const s = String(value);
            if (s) await updateVigilance(row.id, { date_signal: s });
          }}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <EditableCell
          value={row.description || ""}
          type="text"
          onSave={(value) =>
            updateVigilance(row.id, { description: String(value) || null })
          }
        />
      ),
    },
    {
      key: "actions_prises",
      label: "Actions prises",
      render: (row) => (
        <EditableCell
          value={row.actions_prises || ""}
          type="text"
          onSave={(value) =>
            updateVigilance(row.id, { actions_prises: String(value) || null })
          }
        />
      ),
    },
    {
      key: "declare_ansm_at",
      label: "Déclaré ANSM le",
      render: (row) => (
        <EditableCell
          value={row.declare_ansm_at || ""}
          type="date"
          onSave={(value) =>
            updateVigilance(row.id, { declare_ansm_at: String(value) || null })
          }
        />
      ),
    },
    {
      key: "ref_declaration_ansm",
      label: "Réf. ANSM",
      render: (row) => (
        <EditableCell
          value={row.ref_declaration_ansm || ""}
          type="text"
          onSave={(value) =>
            updateVigilance(row.id, {
              ref_declaration_ansm: String(value) || null,
            })
          }
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (row) => (
        <EditableCell
          value={row.statut}
          type="select"
          options={STATUT_OPTIONS}
          onSave={(value) => saveStatut(row, String(value))}
        />
      ),
    },
    {
      key: "id",
      label: "",
      render: (row) => (
        <button
          onClick={() => setDeleteVigilanceId(row.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  /* ---- Colonnes rappels de lots (vigilances type RETRAIT_LOT) ----- */
  const numberCell = (
    row: Vigilance,
    field:
      | "nb_unites_concernees"
      | "nb_unites_isolees"
      | "nb_patients_concernes"
      | "nb_patients_rappeles"
  ) => (
    <EditableCell
      value={row[field] ?? ""}
      type="number"
      onSave={(value) =>
        updateVigilance(row.id, {
          [field]: value === "" ? null : Number(value),
        } as Partial<Vigilance>)
      }
    />
  );

  const recallColumns: ColumnDef<Vigilance>[] = [
    {
      key: "reference",
      label: "Réf.",
      render: (row) => (
        <span className="text-xs font-mono text-accent">
          {row.reference || `RAP-${row.id.substring(0, 4).toUpperCase()}`}
        </span>
      ),
    },
    {
      key: "titre",
      label: "Produit / lot",
      render: (row) => (
        <EditableCell
          value={row.titre}
          type="text"
          onSave={async (value) => {
            const s = String(value).trim();
            if (s) await updateVigilance(row.id, { titre: s });
          }}
        />
      ),
    },
    {
      key: "date_signal",
      label: "Date signalement",
      render: (row) => (
        <EditableCell
          value={row.date_signal}
          type="date"
          onSave={async (value) => {
            const s = String(value);
            if (s) await updateVigilance(row.id, { date_signal: s });
          }}
        />
      ),
    },
    {
      key: "etape_courante",
      label: "Étape en cours",
      render: (row) => (
        <EditableCell
          value={row.etape_courante || ""}
          type="text"
          onSave={(value) =>
            updateVigilance(row.id, { etape_courante: String(value) || null })
          }
        />
      ),
    },
    {
      key: "nb_unites_concernees",
      label: "Unités concernées",
      render: (row) => numberCell(row, "nb_unites_concernees"),
    },
    {
      key: "nb_unites_isolees",
      label: "Unités isolées",
      render: (row) => numberCell(row, "nb_unites_isolees"),
    },
    {
      key: "nb_patients_concernes",
      label: "Patients concernés",
      render: (row) => numberCell(row, "nb_patients_concernes"),
    },
    {
      key: "nb_patients_rappeles",
      label: "Patients rappelés",
      render: (row) => numberCell(row, "nb_patients_rappeles"),
    },
    {
      key: "declare_ansm_at",
      label: "Déclaré ANSM le",
      render: (row) => (
        <EditableCell
          value={row.declare_ansm_at || ""}
          type="date"
          onSave={(value) =>
            updateVigilance(row.id, { declare_ansm_at: String(value) || null })
          }
        />
      ),
    },
    {
      key: "ref_declaration_ansm",
      label: "Réf. ANSM",
      render: (row) => (
        <EditableCell
          value={row.ref_declaration_ansm || ""}
          type="text"
          onSave={(value) =>
            updateVigilance(row.id, {
              ref_declaration_ansm: String(value) || null,
            })
          }
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (row) => (
        <EditableCell
          value={row.statut}
          type="select"
          options={STATUT_OPTIONS}
          onSave={(value) => saveStatut(row, String(value))}
        />
      ),
    },
    {
      key: "id",
      label: "",
      render: (row) => (
        <button
          onClick={() => setDeleteVigilanceId(row.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  /* ---- Handlers ---------------------------------------------------- */
  const handleCreateVigilance = async () => {
    if (!newVigilance.titre.trim()) return;
    try {
      const payload: VigilanceInsert = {
        titre: newVigilance.titre.trim(),
        type: newVigilance.type,
        statut: newVigilance.statut,
        date_signal: newVigilance.date_signal || today(),
        description: newVigilance.description.trim() || null,
        actions_prises: newVigilance.actions_prises.trim() || null,
        ref_declaration_ansm: newVigilance.ref_declaration_ansm.trim() || null,
      };
      await createVigilance(payload as Partial<Vigilance>);
      setShowVigilanceModal(false);
      setNewVigilance({
        type: "PHARMACOVIGILANCE",
        titre: "",
        date_signal: today(),
        description: "",
        actions_prises: "",
        ref_declaration_ansm: "",
        statut: "OUVERT",
      });
    } catch (error) {
      console.error("Error creating vigilance:", error);
    }
  };

  const handleCreateRecall = async () => {
    if (!newRecall.titre.trim()) return;
    try {
      const payload: VigilanceInsert = {
        titre: newRecall.titre.trim(),
        type: RETRAIT_LOT,
        statut: newRecall.statut,
        date_signal: newRecall.date_signal || today(),
        etape_courante: newRecall.etape_courante.trim() || null,
        nb_unites_concernees: newRecall.nb_unites_concernees
          ? Number(newRecall.nb_unites_concernees)
          : null,
        nb_unites_isolees: newRecall.nb_unites_isolees
          ? Number(newRecall.nb_unites_isolees)
          : null,
        ref_declaration_ansm: newRecall.ref_declaration_ansm.trim() || null,
      };
      await createVigilance(payload as Partial<Vigilance>);
      setShowRecallModal(false);
      setNewRecall({
        titre: "",
        date_signal: today(),
        etape_courante: "",
        nb_unites_concernees: "",
        nb_unites_isolees: "",
        ref_declaration_ansm: "",
        statut: "OUVERT",
      });
    } catch (error) {
      console.error("Error creating recall:", error);
    }
  };

  const handleDeleteVigilance = async () => {
    if (deleteVigilanceId) {
      try {
        await removeVigilance(deleteVigilanceId);
        setDeleteVigilanceId(null);
      } catch (error) {
        console.error("Error deleting vigilance:", error);
      }
    }
  };

  if (loadingVigilances) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-mut">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          icon={<ShieldIcon size={20} />}
          label="Total signalements"
          value={totalVigilances.toString()}
          subtitle="Toutes vigilances confondues"
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="En cours"
          value={enCoursCount.toString()}
          subtitle="Ouverts ou en cours de traitement"
          accent="amber"
        />
        <KpiCard
          icon={<ShieldIcon size={20} />}
          label="Déclarés ANSM"
          value={`${declaredAnsmPercentage}%`}
          subtitle={`Sur ${totalVigilances} signalements`}
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Rappels actifs"
          value={activeRecalls.toString()}
          subtitle="Retraits de lots non clos"
        />
      </div>

      {/* Alertes */}
      {undeclaredRecalls.length > 0 && (
        <div className="mb-6 space-y-2">
          {undeclaredRecalls.map((v) => (
            <AlertLine
              key={v.id}
              severity="red"
              message={`Rappel de lot actif non déclaré ANSM : ${v.titre}`}
            />
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className={labelCls}>Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Tous</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Statut</label>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Tous</option>
            {STATUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Déclaré ANSM</label>
          <select
            value={filterDeclaredAnsm}
            onChange={(e) => setFilterDeclaredAnsm(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Tous</option>
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </div>
      </div>

      {/* Table signalements */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">
            Signalements de vigilance
          </h2>
          <AddButton
            onClick={() => setShowVigilanceModal(true)}
            label="Nouveau signalement"
          />
        </div>
        <DataTable columns={vigilanceColumns} data={filteredSignalements} />
      </div>

      {/* Table retraits / rappels de lots (vigilances type RETRAIT_LOT) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">
            Retraits et rappels de lots
          </h2>
          <AddButton
            onClick={() => setShowRecallModal(true)}
            label="Nouveau rappel"
          />
        </div>
        <DataTable columns={recallColumns} data={rappels} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Répartition par type
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {typeChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Répartition par statut
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statutChartData}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border)",
                }}
              />
              <Bar dataKey="value" fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal nouveau signalement */}
      <Modal
        isOpen={showVigilanceModal}
        onClose={() => setShowVigilanceModal(false)}
        title="Nouveau signalement de vigilance"
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Titre *</label>
            <input
              type="text"
              value={newVigilance.titre}
              onChange={(e) =>
                setNewVigilance({ ...newVigilance, titre: e.target.value })
              }
              className={inputCls}
              placeholder="Ex : Effet indésirable suspecté — produit X"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type</label>
              <select
                value={newVigilance.type}
                onChange={(e) =>
                  setNewVigilance({ ...newVigilance, type: e.target.value })
                }
                className={inputCls}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date du signal</label>
              <input
                type="date"
                value={newVigilance.date_signal}
                onChange={(e) =>
                  setNewVigilance({
                    ...newVigilance,
                    date_signal: e.target.value,
                  })
                }
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={newVigilance.description}
              onChange={(e) =>
                setNewVigilance({
                  ...newVigilance,
                  description: e.target.value,
                })
              }
              className={`${inputCls} resize-none`}
              rows={3}
            />
          </div>

          <div>
            <label className={labelCls}>Actions prises</label>
            <textarea
              value={newVigilance.actions_prises}
              onChange={(e) =>
                setNewVigilance({
                  ...newVigilance,
                  actions_prises: e.target.value,
                })
              }
              className={`${inputCls} resize-none`}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Référence ANSM</label>
              <input
                type="text"
                value={newVigilance.ref_declaration_ansm}
                onChange={(e) =>
                  setNewVigilance({
                    ...newVigilance,
                    ref_declaration_ansm: e.target.value,
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select
                value={newVigilance.statut}
                onChange={(e) =>
                  setNewVigilance({ ...newVigilance, statut: e.target.value })
                }
                className={inputCls}
              >
                {STATUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowVigilanceModal(false)}
              className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateVigilance}
              disabled={!newVigilance.titre.trim()}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal nouveau rappel de lot */}
      <Modal
        isOpen={showRecallModal}
        onClose={() => setShowRecallModal(false)}
        title="Nouveau retrait / rappel de lot"
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Produit / lot concerné *</label>
            <input
              type="text"
              value={newRecall.titre}
              onChange={(e) =>
                setNewRecall({ ...newRecall, titre: e.target.value })
              }
              className={inputCls}
              placeholder="Ex : Retrait lot 24A107 — produit Y"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date du signal</label>
              <input
                type="date"
                value={newRecall.date_signal}
                onChange={(e) =>
                  setNewRecall({ ...newRecall, date_signal: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select
                value={newRecall.statut}
                onChange={(e) =>
                  setNewRecall({ ...newRecall, statut: e.target.value })
                }
                className={inputCls}
              >
                {STATUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Étape en cours</label>
            <input
              type="text"
              value={newRecall.etape_courante}
              onChange={(e) =>
                setNewRecall({ ...newRecall, etape_courante: e.target.value })
              }
              className={inputCls}
              placeholder="Ex : Isolement des unités en stock"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Unités concernées</label>
              <input
                type="number"
                min="0"
                value={newRecall.nb_unites_concernees}
                onChange={(e) =>
                  setNewRecall({
                    ...newRecall,
                    nb_unites_concernees: e.target.value,
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unités isolées</label>
              <input
                type="number"
                min="0"
                value={newRecall.nb_unites_isolees}
                onChange={(e) =>
                  setNewRecall({
                    ...newRecall,
                    nb_unites_isolees: e.target.value,
                  })
                }
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Référence déclaration ANSM</label>
            <input
              type="text"
              value={newRecall.ref_declaration_ansm}
              onChange={(e) =>
                setNewRecall({
                  ...newRecall,
                  ref_declaration_ansm: e.target.value,
                })
              }
              className={inputCls}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowRecallModal(false)}
              className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateRecall}
              disabled={!newRecall.titre.trim()}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation suppression */}
      <ConfirmDelete
        isOpen={deleteVigilanceId !== null}
        onCancel={() => setDeleteVigilanceId(null)}
        onConfirm={handleDeleteVigilance}
        itemName="ce signalement de vigilance"
      />
    </div>
  );
}
