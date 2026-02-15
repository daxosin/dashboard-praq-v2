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
import type { Sop, Domain, SopStatus } from "@/lib/database.types";
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

export const TabDocuments: React.FC = () => {
  const { data: sops, loading: loadingSops, update: updateSop, create: createSop, remove: removeSop } = useSupabaseCrud<Sop>("sops", {
    select: "*",
    orderBy: { column: "code", ascending: true },
  });

  const { data: domains, loading: loadingDomains } = useSupabaseCrud<Domain>("domains", {
    select: "*",
    orderBy: { column: "name", ascending: true },
  });

  const [selectedSop, setSelectedSop] = useState<Sop | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sopToDelete, setSopToDelete] = useState<Sop | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");

  const [newSop, setNewSop] = useState({
    code: "",
    title: "",
    domain_id: "",
    owner: "",
    status: "Planifié" as SopStatus,
    version: "1.0",
    validated_at: null as string | null,
    next_revision: null as string | null,
    notes: "",
  });

  const loading = loadingSops || loadingDomains;

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = sops.length;
    const validated = sops.filter((s) => s.status === "Validé").length;
    const inProgress = sops.filter((s) => s.status === "En cours").length;
    const maturityRate = total > 0 ? Math.round((validated / total) * 100) : 0;

    return { total, validated, inProgress, maturityRate };
  }, [sops]);

  // Group SOPs by domain
  const sopsByDomain = useMemo(() => {
    const grouped: Record<string, { validated: number; inProgress: number; planned: number; total: number }> = {};

    domains.forEach((domain) => {
      grouped[domain.id] = { validated: 0, inProgress: 0, planned: 0, total: 0 };
    });

    sops.forEach((sop) => {
      if (sop.domain_id && grouped[sop.domain_id]) {
        grouped[sop.domain_id].total += 1;
        if (sop.status === "Validé") grouped[sop.domain_id].validated += 1;
        else if (sop.status === "En cours") grouped[sop.domain_id].inProgress += 1;
        else if (sop.status === "Planifié") grouped[sop.domain_id].planned += 1;
      }
    });

    return grouped;
  }, [sops, domains]);

  // Alerts - SOPs needing revision
  const alerts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return sops.filter((sop) => sop.status === "Validé" && sop.next_revision && sop.next_revision < today);
  }, [sops]);

  // Chart data - by status
  const statusChartData = useMemo(() => {
    const validated = sops.filter((s) => s.status === "Validé").length;
    const inProgress = sops.filter((s) => s.status === "En cours").length;
    const planned = sops.filter((s) => s.status === "Planifié").length;

    return [
      { name: "Validé", count: validated, fill: "var(--color-grn)" },
      { name: "En cours", count: inProgress, fill: "var(--color-amb)" },
      { name: "Planifié", count: planned, fill: "var(--color-mut)" },
    ];
  }, [sops]);

  // Chart data - by domain
  const domainChartData = useMemo(() => {
    const domainCounts: Record<string, number> = {};
    sops.forEach((sop) => {
      if (sop.domain_id) {
        domainCounts[sop.domain_id] = (domainCounts[sop.domain_id] || 0) + 1;
      }
    });

    return domains.map((domain, idx) => ({
      name: domain.name,
      count: domainCounts[domain.id] || 0,
      fill: `hsl(${(idx * 360) / domains.length}, 60%, 50%)`,
    }));
  }, [sops, domains]);

  // Filtered SOPs
  const filteredSops = useMemo(() => {
    let result = sops;

    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    if (filterDomain !== "all") {
      result = result.filter((s) => s.domain_id === filterDomain);
    }

    return result;
  }, [sops, filterStatus, filterDomain]);

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
      await createSop(newSop);
      setShowAddModal(false);
      setNewSop({
        code: "",
        title: "",
        domain_id: "",
        owner: "",
        status: "Planifié",
        version: "1.0",
        validated_at: null,
        next_revision: null,
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

  const getDomainName = (domainId: string): string => {
    return domains.find((d) => d.id === domainId)?.name || "N/A";
  };

  const getBadgeVariant = (status: SopStatus): "ok" | "wip" | "plan" | "crit" => {
    if (status === "Validé") return "ok";
    if (status === "En cours") return "wip";
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
      key: "title",
      label: "Titre",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.title}
          onSave={(newValue) => handleUpdateSop(sop.id, { title: String(newValue) })}
        />
      ),
    },
    {
      key: "domain_id",
      label: "Domaine",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.domain_id || ""}
          type="select"
          options={domains.map((d) => ({ value: d.id, label: d.name }))}
          onSave={(newValue) => handleUpdateSop(sop.id, { domain_id: String(newValue) })}
        />
      ),
    },
    {
      key: "owner",
      label: "Responsable",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.owner || ""}
          onSave={(newValue) => handleUpdateSop(sop.id, { owner: String(newValue) })}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.status}
          type="select"
          options={[
            { value: "Planifié", label: "Planifié" },
            { value: "En cours", label: "En cours" },
            { value: "Validé", label: "Validé" },
            { value: "En révision", label: "En révision" },
            { value: "Archivé", label: "Archivé" },
          ]}
          onSave={(newValue) => handleUpdateSop(sop.id, { status: String(newValue) as SopStatus })}
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
      key: "validated_at",
      label: "Date validation",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.validated_at || ""}
          type="date"
          onSave={(newValue) => handleUpdateSop(sop.id, { validated_at: String(newValue) || null })}
        />
      ),
    },
    {
      key: "next_revision",
      label: "Prochaine révision",
      sortable: true,
      render: (sop) => (
        <EditableCell
          value={sop.next_revision || ""}
          type="date"
          onSave={(newValue) => handleUpdateSop(sop.id, { next_revision: String(newValue) || null })}
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
          subtitle={`${domains.length} domaines`}
        />
        <KpiCard
          icon={<DocIcon size={16} />}
          label="Validées"
          value={kpis.validated}
          subtitle="Statut validé"
        />
        <KpiCard
          icon={<DocIcon size={16} />}
          label="En cours"
          value={kpis.inProgress}
          subtitle="Rédaction en cours"
          accent="amber"
        />
        <KpiCard
          icon={<DocIcon size={16} />}
          label="Taux maturité"
          value={`${kpis.maturityRate}%`}
          subtitle={`${kpis.validated}/${kpis.total} validées`}
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
              message={`SOP ${sop.code} "${sop.title}" - Révision échue (${sop.next_revision})`}
            />
          ))}
        </div>
      )}

      {/* Vue par domaine */}
      <div>
        <h3 className="text-[14px] font-semibold text-text mb-3">Vue par domaine</h3>
        <div className="space-y-3">
          {domains.map((domain) => {
            const stats = sopsByDomain[domain.id];
            if (!stats || stats.total === 0) return null;

            return (
              <div key={domain.id} className="bg-card border border-brd rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium text-text">{domain.name}</span>
                  <span className="text-[11px] text-sec">
                    {stats.validated}/{stats.total} validées
                  </span>
                </div>
                <ProgressBar3 green={stats.validated} amber={stats.inProgress} total={stats.total} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <div className="bg-card border border-brd rounded-md p-4">
          <h3 className="text-[14px] font-semibold text-text mb-4">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData}>
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

        {/* Répartition par domaine */}
        <div className="bg-card border border-brd rounded-md p-4">
          <h3 className="text-[14px] font-semibold text-text mb-4">Répartition par domaine</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={domainChartData.filter((d) => d.count > 0)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.count}`}
              >
                {domainChartData.map((entry, index) => (
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-card text-text border border-brd rounded px-3 py-1.5 text-[12px] outline-none focus:border-accent transition-colors"
        >
          <option value="all">Tous les statuts</option>
          <option value="Planifié">Planifié</option>
          <option value="En cours">En cours</option>
          <option value="Validé">Validé</option>
          <option value="En révision">En révision</option>
          <option value="Archivé">Archivé</option>
        </select>

        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="bg-card text-text border border-brd rounded px-3 py-1.5 text-[12px] outline-none focus:border-accent transition-colors"
        >
          <option value="all">Tous les domaines</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
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
              <p className="text-[14px] text-text mt-1">{selectedSop.title}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Domaine</label>
              <p className="text-[14px] text-text mt-1">{getDomainName(selectedSop.domain_id)}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Statut</label>
              <div className="mt-1">
                <Badge variant={getBadgeVariant(selectedSop.status)}>{selectedSop.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Version</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.version}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Responsable</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.owner || "Non défini"}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Date validation</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.validated_at || "Non validé"}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold">Prochaine révision</label>
              <p className="text-[14px] text-text mt-1">{selectedSop.next_revision || "Non définie"}</p>
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
                <p>Créée le: {new Date(selectedSop.created_at).toLocaleDateString()}</p>
                <p>Dernière mise à jour: {new Date(selectedSop.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal - Add SOP */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouvelle SOP">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold block mb-1">
              Code
            </label>
            <input
              type="text"
              value={newSop.code}
              onChange={(e) => setNewSop({ ...newSop, code: e.target.value })}
              className="w-full bg-card text-text border border-brd rounded px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors"
              placeholder="Ex: SOP-001"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold block mb-1">
              Titre
            </label>
            <input
              type="text"
              value={newSop.title}
              onChange={(e) => setNewSop({ ...newSop, title: e.target.value })}
              className="w-full bg-card text-text border border-brd rounded px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors"
              placeholder="Titre de la SOP"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold block mb-1">
              Domaine
            </label>
            <select
              value={newSop.domain_id}
              onChange={(e) => setNewSop({ ...newSop, domain_id: e.target.value })}
              className="w-full bg-card text-text border border-brd rounded px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors"
            >
              <option value="">Sélectionner un domaine</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold block mb-1">
              Responsable
            </label>
            <input
              type="text"
              value={newSop.owner}
              onChange={(e) => setNewSop({ ...newSop, owner: e.target.value })}
              className="w-full bg-card text-text border border-brd rounded px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors"
              placeholder="Nom du responsable"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold block mb-1">
              Statut
            </label>
            <select
              value={newSop.status}
              onChange={(e) => setNewSop({ ...newSop, status: e.target.value as SopStatus })}
              className="w-full bg-card text-text border border-brd rounded px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors"
            >
              <option value="Planifié">Planifié</option>
              <option value="En cours">En cours</option>
              <option value="Validé">Validé</option>
              <option value="En révision">En révision</option>
              <option value="Archivé">Archivé</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold block mb-1">
              Version
            </label>
            <input
              type="text"
              value={newSop.version}
              onChange={(e) => setNewSop({ ...newSop, version: e.target.value })}
              className="w-full bg-card text-text border border-brd rounded px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors"
              placeholder="Ex: 1.0"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.8px] text-mut font-semibold block mb-1">
              Notes
            </label>
            <textarea
              value={newSop.notes}
              onChange={(e) => setNewSop({ ...newSop, notes: e.target.value })}
              className="w-full bg-card text-text border border-brd rounded px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors"
              rows={3}
              placeholder="Notes optionnelles"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="bg-card border border-brd rounded-md px-4 py-2 text-[12px] font-medium text-text hover:bg-elev transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateSop}
              disabled={!newSop.code || !newSop.title || !newSop.domain_id}
              className="bg-accent border border-accent rounded-md px-4 py-2 text-[12px] font-semibold text-bg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
        itemName={sopToDelete ? `${sopToDelete.code} - ${sopToDelete.title}` : undefined}
      />
    </div>
  );
};
