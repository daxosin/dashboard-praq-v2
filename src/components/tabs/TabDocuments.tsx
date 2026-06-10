"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import {
  KpiCard,
  ProgressBar3,
  DataTable,
  Badge,
  EditableCell,
  AddButton,
  Modal,
  AlertLine,
  ConfirmDelete,
} from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import { DocIcon, TrashIcon } from "@/components/icons";
import type { Sop, SopInsert, Processus } from "@/lib/db-rows";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Statuts réels de la table `sops` (valeurs DB en UPPERCASE)         */
/* ------------------------------------------------------------------ */
type SopStatut = "BROUILLON" | "EN_VIGUEUR" | "A_REVISER" | "EXPIREE" | "ARCHIVEE";

const STATUT_OPTIONS: { value: SopStatut; label: string }[] = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "EN_VIGUEUR", label: "En vigueur" },
  { value: "A_REVISER", label: "À réviser" },
  { value: "EXPIREE", label: "Expirée" },
  { value: "ARCHIVEE", label: "Archivée" },
];

const statutLabel = (v: string | null | undefined): string =>
  STATUT_OPTIONS.find((o) => o.value === v)?.label ?? String(v ?? "");

export const TabDocuments: React.FC = () => {
  const { data: sops, loading: loadingSops, update: updateSop, create: createSop, remove: removeSop } = useSupabaseCrud<Sop>("sops", {
    select: "*",
    orderBy: { column: "code", ascending: true },
  });

  const { data: processus, loading: loadingProcessus } = useSupabaseCrud<Processus>("processus", {
    select: "*",
    orderBy: { column: "nom", ascending: true },
  });

  const [selectedSop, setSelectedSop] = useState<Sop | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sopToDelete, setSopToDelete] = useState<Sop | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterProcessus, setFilterProcessus] = useState<string>("all");

  const [newSop, setNewSop] = useState<Partial<SopInsert>>({
    code: "",
    titre: "",
    processus_id: null,
    responsable: "",
    statut: "BROUILLON",
    version: "1.0",
    categorie: "",
    notes: "",
  });

  const loading = loadingSops || loadingProcessus;

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = sops.length;
    const enVigueur = sops.filter((s) => s.statut === "EN_VIGUEUR").length;
    const brouillons = sops.filter((s) => s.statut === "BROUILLON").length;
    const maturityRate = total > 0 ? Math.round((enVigueur / total) * 100) : 0;

    return { total, enVigueur, brouillons, maturityRate };
  }, [sops]);

  // Group SOPs by processus
  const sopsByProcessus = useMemo(() => {
    const grouped: Record<string, { enVigueur: number; aReviser: number; brouillons: number; total: number }> = {};

    processus.forEach((p) => {
      grouped[p.id] = { enVigueur: 0, aReviser: 0, brouillons: 0, total: 0 };
    });

    sops.forEach((sop) => {
      if (sop.processus_id && grouped[sop.processus_id]) {
        grouped[sop.processus_id].total += 1;
        if (sop.statut === "EN_VIGUEUR") grouped[sop.processus_id].enVigueur += 1;
        else if (sop.statut === "A_REVISER") grouped[sop.processus_id].aReviser += 1;
        else if (sop.statut === "BROUILLON") grouped[sop.processus_id].brouillons += 1;
      }
    });

    return grouped;
  }, [sops, processus]);

  // Alerts - SOPs needing revision
  const alerts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return sops.filter(
      (sop) =>
        (sop.statut === "A_REVISER" || sop.statut === "EXPIREE") ||
        (sop.statut === "EN_VIGUEUR" && sop.date_revision && sop.date_revision < today),
    );
  }, [sops]);

  // Chart data - by statut
  const statutChartData = useMemo(() => {
    return STATUT_OPTIONS.map((o) => ({
      name: o.label,
      count: sops.filter((s) => s.statut === o.value).length,
      fill:
        o.value === "EN_VIGUEUR"
          ? "var(--color-grn)"
          : o.value === "A_REVISER" || o.value === "EXPIREE"
            ? "var(--color-amb)"
            : "var(--color-mut)",
    }));
  }, [sops]);

  // Chart data - by processus
  const processusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    sops.forEach((sop) => {
      if (sop.processus_id) {
        counts[sop.processus_id] = (counts[sop.processus_id] || 0) + 1;
      }
    });

    return processus.map((p, idx) => ({
      name: p.nom,
      count: counts[p.id] || 0,
      fill: `hsl(${(idx * 360) / Math.max(processus.length, 1)}, 60%, 50%)`,
    }));
  }, [sops, processus]);

  // Filtered SOPs
  const filteredSops = useMemo(() => {
    let result = sops;

    if (filterStatut !== "all") {
      result = result.filter((s) => s.statut === filterStatut);
    }

    if (filterProcessus !== "all") {
      result = result.filter((s) => s.processus_id === filterProcessus);
    }

    return result;
  }, [sops, filterStatut, filterProcessus]);

  // Handlers
  const handleUpdateSop = async (id: string, updates: Partial<Sop>) => {
    try {
      await updateSop(id, updates);
    } catch (error) {
      console.error("Error updating SOP:", error);
    }
  };

  const handleCreateSop = async () => {
    try {
      const payload: Partial<SopInsert> = {
        code: (newSop.code || "").trim(),
        titre: (newSop.titre || "").trim(),
        processus_id: newSop.processus_id || null,
        responsable: newSop.responsable?.trim() || null,
        statut: newSop.statut || "BROUILLON",
        version: newSop.version || "1.0",
        notes: newSop.notes?.trim() || null,
      };
      if (newSop.categorie && newSop.categorie.trim()) {
        payload.categorie = newSop.categorie.trim();
      }
      await createSop(payload);
      setShowAddModal(false);
      setNewSop({
        code: "",
        titre: "",
        processus_id: null,
        responsable: "",
        statut: "BROUILLON",
        version: "1.0",
        categorie: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating SOP:", error);
    }
  };

  const handleDeleteSop = async () => {
    if (!sopToDelete) return;
    try {
      await removeSop(sopToDelete.id);
      setSopToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting SOP:", error);
    }
  };

  const getProcessusName = (processusId: string | null): string => {
    if (!processusId) return "N/A";
    return processus.find((p) => p.id === processusId)?.nom || "N/A";
  };

  const getBadgeVariant = (statut: string): "ok" | "wip" | "plan" | "crit" => {
    if (statut === "EN_VIGUEUR") return "ok";
    if (statut === "A_REVISER") return "wip";
    if (statut === "EXPIREE") return "crit";
    return "plan";
  };

  // DataTable columns
  const columns: ColumnDef<Sop>[] = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (sop) => (
        <span className="font-mono text-[11px] font-semibold text-accent">{sop.code}</span>
      ),
    },
    {
      key: "titre",
      label: "Titre",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.titre}
          onSave={(newValue) => handleUpdateSop(sop.id, { titre: String(newValue) })}
        />
      ),
    },
    {
      key: "processus_id",
      label: "Processus",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.processus_id || ""}
          type="select"
          options={processus.map((p) => ({ value: p.id, label: p.nom }))}
          onSave={(newValue) => handleUpdateSop(sop.id, { processus_id: String(newValue) || null })}
        />
      ),
    },
    {
      key: "responsable",
      label: "Responsable",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.responsable || ""}
          onSave={(newValue) => handleUpdateSop(sop.id, { responsable: String(newValue) || null })}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.statut}
          type="select"
          options={STATUT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onSave={(newValue) => handleUpdateSop(sop.id, { statut: String(newValue) })}
        />
      ),
    },
    {
      key: "version",
      label: "Version",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.version}
          onSave={(newValue) => handleUpdateSop(sop.id, { version: String(newValue) })}
        />
      ),
    },
    {
      key: "date_derniere_revision",
      label: "Dernière révision",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.date_derniere_revision || ""}
          type="date"
          onSave={(newValue) => handleUpdateSop(sop.id, { date_derniere_revision: String(newValue) || null })}
        />
      ),
    },
    {
      key: "date_revision",
      label: "Prochaine révision",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.date_revision || ""}
          type="date"
          onSave={(newValue) => handleUpdateSop(sop.id, { date_revision: String(newValue) || null })}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (sop) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSopToDelete(sop);
            setShowDeleteConfirm(true);
          }}
          className="text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-mut text-[14px]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<DocIcon size={16} />}
          label="Total SOPs"
          value={kpis.total}
          subtitle={`${processus.length} processus`}
        />
        <KpiCard
          icon={<DocIcon size={16} />}
          label="En vigueur"
          value={kpis.enVigueur}
          subtitle="Statut en vigueur"
        />
        <KpiCard
          icon={<DocIcon size={16} />}
          label="Brouillons"
          value={kpis.brouillons}
          subtitle="Rédaction en cours"
          accent="amber"
        />
        <KpiCard
          icon={<DocIcon size={16} />}
          label="Taux maturité"
          value={`${kpis.maturityRate}%`}
          subtitle={`${kpis.enVigueur}/${kpis.total} en vigueur`}
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[14px] font-semibold text-text">Alertes</h3>
          {alerts.map((sop) => (
            <AlertLine
              key={sop.id}
              severity="amber"
              message={`SOP ${sop.code} "${sop.titre}" - ${
                sop.statut === "EN_VIGUEUR"
                  ? `Révision échue (${sop.date_revision})`
                  : statutLabel(sop.statut)
              }`}
            />
          ))}
        </div>
      )}

      {/* Vue par processus */}
      <div>
        <h3 className="text-[14px] font-semibold text-text mb-3">Vue par processus</h3>
        <div className="space-y-3">
          {processus.map((p) => {
            const stats = sopsByProcessus[p.id];
            if (!stats || stats.total === 0) return null;

            return (
              <div key={p.id} className="bg-card border border-brd rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium text-text">{p.nom}</span>
                  <span className="text-[11px] text-sec">
                    {stats.enVigueur}/{stats.total} en vigueur
                  </span>
                </div>
                <ProgressBar3
                  green={stats.enVigueur}
                  amber={stats.aReviser + stats.brouillons}
                  total={stats.total}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-[14px] font-semibold text-text mb-4">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statutChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brd)" />
              <XAxis dataKey="name" tick={{ fill: "var(--color-sec)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-sec)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-brd)",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par processus */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-[14px] font-semibold text-text mb-4">Répartition par processus</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={processusChartData.filter((d) => d.count > 0)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.count}`}
              >
                {processusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-brd)",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] outline-none focus:border-accent transition-colors"
        >
          <option value="all">Tous les statuts</option>
          {STATUT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filterProcessus}
          onChange={(e) => setFilterProcessus(e.target.value)}
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] outline-none focus:border-accent transition-colors"
        >
          <option value="all">Tous les processus</option>
          {processus.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>

        <div className="ml-auto">
          <AddButton label="Nouvelle SOP" onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      {/* DataTable */}
      <DataTable columns={columns} data={filteredSops} onRowClick={setSelectedSop} />

      {/* Modal - Detail SOP */}
      {selectedSop && (
        <Modal isOpen={!!selectedSop} onClose={() => setSelectedSop(null)} title={`SOP ${selectedSop.code}`}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Titre</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.titre}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Processus</label>
              <p className="text-[14px] text-text mt-1">{getProcessusName(selectedSop.processus_id)}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Catégorie</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.categorie}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Statut</label>
              <div className="mt-1">
                <Badge variant={getBadgeVariant(selectedSop.statut)}>{statutLabel(selectedSop.statut)}</Badge>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Version</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.version}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Responsable</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.responsable || "Non défini"}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Dernière révision</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.date_derniere_revision || "Aucune"}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Prochaine révision</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.date_revision || "Non définie"}</p>
            </div>
            {selectedSop.notes && (
              <div>
                <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Notes</label>
                <p className="text-[14px] text-text mt-1">{selectedSop.notes}</p>
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Cycle de vie</label>
              <div className="mt-2 space-y-1 text-[12px] text-sec">
                <p>
                  Créée le:{" "}
                  {selectedSop.date_creation || selectedSop.created_at
                    ? new Date((selectedSop.date_creation || selectedSop.created_at) as string).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
                <p>
                  Dernière mise à jour:{" "}
                  {selectedSop.updated_at ? new Date(selectedSop.updated_at).toLocaleDateString("fr-FR") : "—"}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal - Add SOP */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouvelle SOP">
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Code
            </label>
            <input
              type="text"
              value={newSop.code || ""}
              onChange={(e) => setNewSop({ ...newSop, code: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              placeholder="Ex: SOP-001"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Titre
            </label>
            <input
              type="text"
              value={newSop.titre || ""}
              onChange={(e) => setNewSop({ ...newSop, titre: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              placeholder="Titre de la SOP"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Processus
            </label>
            <select
              value={newSop.processus_id || ""}
              onChange={(e) => setNewSop({ ...newSop, processus_id: e.target.value || null })}
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
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Catégorie
            </label>
            <input
              type="text"
              value={newSop.categorie || ""}
              onChange={(e) => setNewSop({ ...newSop, categorie: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              placeholder="Ex: PDA, Officine..."
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Responsable
            </label>
            <input
              type="text"
              value={newSop.responsable || ""}
              onChange={(e) => setNewSop({ ...newSop, responsable: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              placeholder="Nom du responsable"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Statut
            </label>
            <select
              value={newSop.statut || "BROUILLON"}
              onChange={(e) => setNewSop({ ...newSop, statut: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              {STATUT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Version
            </label>
            <input
              type="text"
              value={newSop.version || ""}
              onChange={(e) => setNewSop({ ...newSop, version: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              placeholder="Ex: 1.0"
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-sec block mb-2">
              Notes
            </label>
            <textarea
              value={newSop.notes || ""}
              onChange={(e) => setNewSop({ ...newSop, notes: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              rows={3}
              placeholder="Notes optionnelles"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateSop}
              disabled={!newSop.code || !newSop.titre}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* ConfirmDelete */}
      <ConfirmDelete
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteSop}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSopToDelete(null);
        }}
        itemName={sopToDelete ? `${sopToDelete.code} - ${sopToDelete.titre}` : undefined}
      />
    </div>
  );
};
