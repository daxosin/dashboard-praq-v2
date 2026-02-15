"use client";

import React, { useState, useMemo } from "react";
import { Risk, Domain, RiskLevel } from "@/lib/database.types";
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

type RiskWithDomain = Risk & {
  domain?: Domain;
};

export const TabRisques: React.FC = () => {
  const { data: risks, loading: loadingRisks, update, create, remove } = useSupabaseCrud<RiskWithDomain>("risks", {
    select: "*, domain:domains(*)",
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: domains, loading: loadingDomains } = useSupabaseCrud<Domain>("domains", {
    orderBy: { column: "name", ascending: true },
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"matrice" | "amdec" | "domaine">("matrice");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");

  // Form state for new risk
  const [formData, setFormData] = useState({
    domain_id: "",
    description: "",
    causes: "",
    consequences: "",
    probability: 1,
    gravity: 1,
    detectability: 1,
    mitigation: "",
    owner: "",
    review_due: "",
    residual_p: null as number | null,
    residual_g: null as number | null,
    residual_d: null as number | null,
  });

  // KPIs calculation
  const kpis = useMemo(() => {
    const total = risks.length;
    const inacceptable = risks.filter((r) => r.level === "Inacceptable").length;
    const surveillance = risks.filter((r) => r.level === "Surveillance").length;
    const acceptable = risks.filter((r) => r.level === "Acceptable").length;

    return { total, inacceptable, surveillance, acceptable };
  }, [risks]);

  // Filter risks
  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      if (filterDomain !== "all" && risk.domain_id !== filterDomain) return false;
      if (filterLevel !== "all" && risk.level !== filterLevel) return false;
      if (filterOwner !== "all" && risk.owner !== filterOwner) return false;
      return true;
    });
  }, [risks, filterDomain, filterLevel, filterOwner]);

  // Unique owners for filter
  const owners = useMemo(() => {
    const uniqueOwners = new Set<string>();
    risks.forEach((r) => {
      if (r.owner) uniqueOwners.add(r.owner);
    });
    return Array.from(uniqueOwners).sort();
  }, [risks]);

  // Data for PieChart
  const pieData = useMemo(() => {
    return [
      { name: "Acceptable", value: kpis.acceptable, color: "var(--risk-grn)" },
      { name: "Surveillance", value: kpis.surveillance, color: "var(--risk-amb)" },
      { name: "Inacceptable", value: kpis.inacceptable, color: "var(--risk-red)" },
    ];
  }, [kpis]);

  // Data for BarChart by domain
  const barData = useMemo(() => {
    const byDomain: Record<string, { acceptable: number; surveillance: number; inacceptable: number }> = {};

    risks.forEach((risk) => {
      const domainName = risk.domain?.name || "Sans domaine";
      if (!byDomain[domainName]) {
        byDomain[domainName] = { acceptable: 0, surveillance: 0, inacceptable: 0 };
      }

      if (risk.level === "Acceptable") byDomain[domainName].acceptable += risk.criticality;
      else if (risk.level === "Surveillance") byDomain[domainName].surveillance += risk.criticality;
      else if (risk.level === "Inacceptable") byDomain[domainName].inacceptable += risk.criticality;
    });

    return Object.entries(byDomain).map(([name, values]) => ({
      name,
      ...values,
    }));
  }, [risks]);

  const handleCreate = async () => {
    try {
      await create(formData);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating risk:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await remove(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error("Error deleting risk:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      domain_id: "",
      description: "",
      causes: "",
      consequences: "",
      probability: 1,
      gravity: 1,
      detectability: 1,
      mitigation: "",
      owner: "",
      review_due: "",
      residual_p: null,
      residual_g: null,
      residual_d: null,
    });
  };

  const getLevelBadgeVariant = (level: RiskLevel | null): "ok" | "wip" | "crit" => {
    if (level === "Acceptable") return "ok";
    if (level === "Surveillance") return "wip";
    if (level === "Inacceptable") return "crit";
    return "wip";
  };

  const columns = [
    {
      label: "Domaine",
      key: "domain_id",
      render: (row: RiskWithDomain) => row.domain?.name || "—",
    },
    {
      label: "Description",
      key: "description",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.description}
          type="text"
          onSave={(value) => update(row.id, { description: String(value) })}
        />
      ),
    },
    {
      label: "Causes",
      key: "causes",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.causes || ""}
          type="text"
          onSave={(value) => update(row.id, { causes: String(value) })}
        />
      ),
    },
    {
      label: "Conséquences",
      key: "consequences",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.consequences || ""}
          type="text"
          onSave={(value) => update(row.id, { consequences: String(value) })}
        />
      ),
    },
    {
      label: "P",
      key: "probability",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.probability.toString()}
          type="select"
          options={["1", "2", "3", "4", "5"].map(v => ({ value: v, label: v }))}
          onSave={(value) => update(row.id, { probability: parseInt(String(value)) })}
        />
      ),
    },
    {
      label: "G",
      key: "gravity",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.gravity.toString()}
          type="select"
          options={["1", "2", "3", "4", "5"].map(v => ({ value: v, label: v }))}
          onSave={(value) => update(row.id, { gravity: parseInt(String(value)) })}
        />
      ),
    },
    {
      label: "D",
      key: "detectability",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.detectability.toString()}
          type="select"
          options={["1", "2", "3", "4", "5"].map(v => ({ value: v, label: v }))}
          onSave={(value) => update(row.id, { detectability: parseInt(String(value)) })}
        />
      ),
    },
    {
      label: "Criticité",
      key: "criticality",
      render: (row: RiskWithDomain) => (
        <span className="font-mono text-accent">{row.criticality}</span>
      ),
    },
    {
      label: "Niveau",
      key: "level",
      render: (row: RiskWithDomain) => (
        <Badge variant={getLevelBadgeVariant(row.level)}>{row.level || "—"}</Badge>
      ),
    },
    {
      label: "Mitigation",
      key: "mitigation",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.mitigation || ""}
          type="text"
          onSave={(value) => update(row.id, { mitigation: String(value) })}
        />
      ),
    },
    {
      label: "Responsable",
      key: "owner",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.owner || ""}
          type="text"
          onSave={(value) => update(row.id, { owner: String(value) })}
        />
      ),
    },
    {
      label: "Date revue",
      key: "review_due",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.review_due || ""}
          type="date"
          onSave={(value) => update(row.id, { review_due: String(value) })}
        />
      ),
    },
    {
      label: "P rés.",
      key: "residual_p",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.residual_p?.toString() || ""}
          type="select"
          options={["", "1", "2", "3", "4", "5"].map(v => ({ value: v, label: v || "-" }))}
          onSave={(value) => update(row.id, { residual_p: value ? parseInt(String(value)) : null })}
        />
      ),
    },
    {
      label: "G rés.",
      key: "residual_g",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.residual_g?.toString() || ""}
          type="select"
          options={["", "1", "2", "3", "4", "5"].map(v => ({ value: v, label: v || "-" }))}
          onSave={(value) => update(row.id, { residual_g: value ? parseInt(String(value)) : null })}
        />
      ),
    },
    {
      label: "D rés.",
      key: "residual_d",
      render: (row: RiskWithDomain) => (
        <EditableCell
          value={row.residual_d?.toString() || ""}
          type="select"
          options={["", "1", "2", "3", "4", "5"].map(v => ({ value: v, label: v || "-" }))}
          onSave={(value) => update(row.id, { residual_d: value ? parseInt(String(value)) : null })}
        />
      ),
    },
    {
      label: "Crit. rés.",
      key: "residual_crit",
      render: (row: RiskWithDomain) => (
        <span className="font-mono text-accent">{row.residual_crit || "—"}</span>
      ),
    },
    {
      label: "",
      key: "actions",
      render: (row: RiskWithDomain) => (
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
    const criticality = p * g;
    if (criticality >= 15) return "var(--risk-red)";
    if (criticality >= 6) return "var(--risk-amb)";
    return "var(--risk-grn)";
  };

  if (loadingRisks || loadingDomains) {
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
          label="Inacceptables"
          value={kpis.inacceptable.toString()}
          subtitle="Action immédiate requise"
          accent="amber"
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Surveillance"
          value={kpis.surveillance.toString()}
          subtitle="Suivi nécessaire"
          accent="amber"
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Acceptables"
          value={kpis.acceptable.toString()}
          subtitle="Niveau acceptable"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">Tous les domaines</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">Tous niveaux</option>
            <option value="Acceptable">Acceptable</option>
            <option value="Surveillance">Surveillance</option>
            <option value="Inacceptable">Inacceptable</option>
          </select>

          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px] focus:outline-none focus:border-accent transition-colors"
          >
            <option value="all">Tous responsables</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
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
          onClick={() => setViewMode("domaine")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            viewMode === "domaine"
              ? "text-accent border-b-2 border-accent"
              : "text-sec hover:text-text"
          }`}
        >
          Par domaine
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
                      const cellRisks = filteredRisks.filter(
                        (r) => r.probability === p && r.gravity === g
                      );
                      return (
                        <div
                          key={`${p}-${g}`}
                          className="h-12 rounded border border-brd flex items-center justify-center relative"
                          style={{ backgroundColor: getCellColor(p, g) }}
                        >
                          {cellRisks.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center gap-1">
                              {cellRisks.map((risk) => (
                                <div
                                  key={risk.id}
                                  className="w-3 h-3 rounded-full bg-card border-2 border-text"
                                  title={risk.description}
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
                Répartition par niveau
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
                Criticité par domaine
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="acceptable" stackId="a" fill="var(--risk-grn)" name="Acceptable" />
                  <Bar dataKey="surveillance" stackId="a" fill="var(--risk-amb)" name="Surveillance" />
                  <Bar dataKey="inacceptable" stackId="a" fill="var(--risk-red)" name="Inacceptable" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AMDEC View */}
      {viewMode === "amdec" && (
        <div className="bg-card rounded-xl border border-brd overflow-hidden">
          <DataTable columns={columns} data={filteredRisks} />
        </div>
      )}

      {/* Domain View */}
      {viewMode === "domaine" && (
        <div className="space-y-6">
          {domains.map((domain) => {
            const domainRisks = filteredRisks.filter((r) => r.domain_id === domain.id);
            if (domainRisks.length === 0) return null;

            return (
              <div key={domain.id} className="bg-card border border-brd rounded-xl p-6">
                <h3 className="text-sm font-semibold text-sec mb-4 uppercase tracking-wider">
                  {domain.name}
                </h3>
                <div className="space-y-3">
                  {domainRisks.map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between p-3 bg-elev rounded border border-brd">
                      <div className="flex-1">
                        <p className="text-sm text-text font-medium">{risk.description}</p>
                        <p className="text-xs text-mut mt-1">
                          P{risk.probability} × G{risk.gravity} × D{risk.detectability} = {risk.criticality}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getLevelBadgeVariant(risk.level)}>{risk.level}</Badge>
                        {risk.owner && <span className="text-xs text-sec">{risk.owner}</span>}
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
                Domaine
              </label>
              <select
                value={formData.domain_id}
                onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Causes
                </label>
                <textarea
                  value={formData.causes}
                  onChange={(e) => setFormData({ ...formData, causes: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Conséquences
                </label>
                <textarea
                  value={formData.consequences}
                  onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Probabilité (1-5)
                </label>
                <select
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
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
                  value={formData.gravity}
                  onChange={(e) => setFormData({ ...formData, gravity: parseInt(e.target.value) })}
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
                  value={formData.detectability}
                  onChange={(e) => setFormData({ ...formData, detectability: parseInt(e.target.value) })}
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
                Mitigation
              </label>
              <textarea
                value={formData.mitigation}
                onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Responsable
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Date de revue
                </label>
                <input
                  type="date"
                  value={formData.review_due}
                  onChange={(e) => setFormData({ ...formData, review_due: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
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
                disabled={!formData.description || !formData.domain_id}
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
