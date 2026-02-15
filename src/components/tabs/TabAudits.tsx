"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Audit, AuditFinding, Domain, AuditInsert, AuditFindingInsert, Capa } from "@/lib/database.types";
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
import { ClipboardIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/icons";
import {
  BarChart,
  Bar,
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

const AUDIT_TYPES = [
  "Audit interne",
  "Audit processus",
  "Audit système",
  "Audit fournisseur",
  "Audit client",
] as const;

const STATUSES = ["Planifié", "En cours", "Réalisé", "Reporté", "Annulé"] as const;

const FINDING_TYPES = ["Majeur", "Mineur", "Observation", "Point fort"] as const;

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF"];

export function TabAudits() {
  const { data: audits, loading: loadingAudits, create, update, remove } = useSupabaseCrud<Audit>("audits", {
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: findings, loading: loadingFindings, create: createFinding, remove: removeFinding } = useSupabaseCrud<AuditFinding>("audit_findings", {
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: domains, loading: loadingDomains } = useSupabaseCrud<Domain>("domains", {
    orderBy: { column: "name", ascending: true },
  });

  const { data: capas } = useSupabaseCrud<Capa>("capas");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [selectedAuditForFinding, setSelectedAuditForFinding] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterAuditor, setFilterAuditor] = useState<string>("all");

  const [newAudit, setNewAudit] = useState<Partial<AuditInsert>>({
    type: "Audit interne",
    status: "Planifié",
    reference: "",
    major_findings: 0,
    minor_findings: 0,
    observations: 0,
  });

  const [newFinding, setNewFinding] = useState<Partial<AuditFindingInsert>>({
    audit_id: "",
    type: "Observation",
    description: "",
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const auditsThisYear = audits.filter((a) => {
      const year = a.planned_at ? new Date(a.planned_at).getFullYear() : currentYear;
      return year === currentYear;
    });

    const plannedCount = auditsThisYear.filter((a) => a.status === "Planifié" || a.status === "En cours").length;
    const realizedCount = auditsThisYear.filter((a) => a.status === "Réalisé").length;
    const postponedCount = auditsThisYear.filter((a) => a.status === "Reporté").length;

    const totalScheduled = plannedCount + realizedCount + postponedCount;
    const realizationRate = totalScheduled > 0 ? Math.round((realizedCount / totalScheduled) * 100) : 0;

    return {
      planned: plannedCount,
      realized: realizedCount,
      postponed: postponedCount,
      realizationRate,
    };
  }, [audits]);

  // Filter audits
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterDomain !== "all" && a.domain_id !== filterDomain) return false;
      if (filterAuditor !== "all" && a.auditor !== filterAuditor) return false;
      return true;
    });
  }, [audits, filterStatus, filterDomain, filterAuditor]);

  // Timeline data: audits by month
  const timelineData = useMemo(() => {
    const monthlyData: Record<string, { month: string; Planifié: number; Réalisé: number; Reporté: number }> = {};

    audits.forEach((a) => {
      const month = a.planned_at ? a.planned_at.substring(0, 7) : "";
      if (!month) return;

      if (!monthlyData[month]) {
        monthlyData[month] = { month, Planifié: 0, Réalisé: 0, Reporté: 0 };
      }

      if (a.status === "Planifié" || a.status === "En cours") {
        monthlyData[month].Planifié += 1;
      } else if (a.status === "Réalisé") {
        monthlyData[month].Réalisé += 1;
      } else if (a.status === "Reporté") {
        monthlyData[month].Reporté += 1;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }, [audits]);

  // Findings by type
  const findingsByType = useMemo(() => {
    const counts: Record<string, number> = {
      Majeur: 0,
      Mineur: 0,
      Observation: 0,
      "Point fort": 0,
    };

    findings.forEach((f) => {
      if (counts[f.type] !== undefined) {
        counts[f.type] += 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [findings]);

  // Audits by domain
  const auditsByDomain = useMemo(() => {
    const counts: Record<string, number> = {};
    const domainMap: Record<string, string> = {};

    domains.forEach((d) => {
      domainMap[d.id] = d.name;
      counts[d.name] = 0;
    });

    audits.forEach((a) => {
      if (a.domain_id && domainMap[a.domain_id]) {
        counts[domainMap[a.domain_id]] += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  }, [audits, domains]);

  const domainMap = useMemo(() => {
    const map: Record<string, string> = {};
    domains.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [domains]);

  const auditorList = useMemo(() => {
    const auditors = new Set<string>();
    audits.forEach((a) => {
      if (a.auditor) auditors.add(a.auditor);
    });
    return Array.from(auditors).sort();
  }, [audits]);

  const handleAdd = async () => {
    try {
      await create(newAudit as AuditInsert);
      setShowAddModal(false);
      setNewAudit({
        type: "Audit interne",
        status: "Planifié",
        reference: "",
        major_findings: 0,
        minor_findings: 0,
        observations: 0,
      });
    } catch (error) {
      console.error("Error creating audit:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting audit:", error);
    }
  };

  const handleAddFinding = async () => {
    if (!selectedAuditForFinding) return;
    try {
      await createFinding({ ...newFinding, audit_id: selectedAuditForFinding } as AuditFindingInsert);
      setShowFindingModal(false);
      setNewFinding({
        audit_id: "",
        type: "Observation",
        description: "",
      });
      setSelectedAuditForFinding(null);
    } catch (error) {
      console.error("Error creating finding:", error);
    }
  };

  const openFindingModal = (auditId: string) => {
    setSelectedAuditForFinding(auditId);
    setShowFindingModal(true);
  };

  const getStatusBadgeVariant = (status: string): "ok" | "wip" | "plan" | "crit" => {
    switch (status) {
      case "Réalisé":
        return "ok";
      case "En cours":
        return "wip";
      case "Planifié":
        return "plan";
      case "Reporté":
      case "Annulé":
        return "crit";
      default:
        return "plan";
    }
  };

  const getFindingBadgeVariant = (type: string): "ok" | "wip" | "plan" | "crit" => {
    switch (type) {
      case "Point fort":
        return "ok";
      case "Observation":
        return "plan";
      case "Mineur":
        return "wip";
      case "Majeur":
        return "crit";
      default:
        return "plan";
    }
  };

  const columns: ColumnDef<Audit>[] = [
    {
      key: "expand",
      label: "",
      render: (audit) => {
        const auditFindings = findings.filter((f) => f.audit_id === audit.id);
        if (auditFindings.length === 0) return null;

        return (
          <button
            onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {expandedAudit === audit.id ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
          </button>
        );
      },
    },
    {
      key: "reference",
      label: "Référence",
      render: (audit) => (
        <EditableCell
          value={audit.reference}
          type="text"
          onSave={async (value) => {
            await update(audit.id, { reference: String(value) });
          }}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (audit) => (
        <EditableCell
          value={audit.type}
          type="select"
          options={AUDIT_TYPES.map((t) => ({ value: t, label: t }))}
          onSave={async (value) => {
            await update(audit.id, { type: String(value) });
          }}
        />
      ),
    },
    {
      key: "domain_id",
      label: "Domaine",
      render: (audit) => (
        <EditableCell
          value={audit.domain_id || ""}
          type="select"
          options={domains.map((d) => ({ value: d.id, label: d.name }))}
          onSave={async (value) => {
            await update(audit.id, { domain_id: String(value) });
          }}
        />
      ),
    },
    {
      key: "auditor",
      label: "Auditeur",
      render: (audit) => (
        <EditableCell
          value={audit.auditor || ""}
          type="text"
          onSave={async (value) => {
            await update(audit.id, { auditor: String(value) });
          }}
        />
      ),
    },
    {
      key: "planned_at",
      label: "Date planifiée",
      render: (audit) => (
        <EditableCell
          value={audit.planned_at || ""}
          type="date"
          onSave={async (value) => {
            await update(audit.id, { planned_at: String(value) });
          }}
        />
      ),
    },
    {
      key: "completed_at",
      label: "Date réalisée",
      render: (audit) => (
        <EditableCell
          value={audit.completed_at || ""}
          type="date"
          onSave={async (value) => {
            await update(audit.id, { completed_at: String(value) });
          }}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (audit) => (
        <EditableCell
          value={audit.status}
          type="select"
          options={STATUSES.map((s) => ({ value: s, label: s }))}
          onSave={async (value) => {
            const updates: any = { status: value };
            if (value === "Réalisé" && !audit.completed_at) {
              updates.completed_at = new Date().toISOString().split("T")[0];
            }
            await update(audit.id, updates);
          }}
        />
      ),
    },
    {
      key: "findings",
      label: "Constats",
      render: (audit) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--red)] font-semibold">{audit.major_findings}</span>
          <span className="text-xs text-[var(--text-muted)]">/</span>
          <span className="text-xs text-[var(--amb)] font-semibold">{audit.minor_findings}</span>
          <span className="text-xs text-[var(--text-muted)]">/</span>
          <span className="text-xs text-[var(--text-secondary)] font-semibold">{audit.observations}</span>
        </div>
      ),
    },
    {
      key: "summary",
      label: "Résumé",
      render: (audit) => (
        <EditableCell
          value={audit.summary || ""}
          type="text"
          onSave={async (value) => {
            await update(audit.id, { summary: String(value) });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (audit) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openFindingModal(audit.id)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            title="Ajouter un constat"
          >
            <ClipboardIcon size={14} />
          </button>
          <button
            onClick={() => setDeleteId(audit.id)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
            title="Supprimer"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (loadingAudits || loadingDomains || loadingFindings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--text-muted)]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Audits planifiés"
          value={kpis.planned.toString()}
          subtitle="À venir ou en cours"
        />
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Réalisés"
          value={kpis.realized.toString()}
          subtitle="Audits terminés"
        />
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Reportés"
          value={kpis.postponed.toString()}
          subtitle="À replanifier"
          accent={kpis.postponed > 0 ? "amber" : "default"}
        />
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Taux réalisation"
          value={`${kpis.realizationRate}%`}
          subtitle="Réalisés / Planifiés"
          accent={kpis.realizationRate >= 80 ? "default" : "amber"}
        />
      </div>

      {/* Timeline Chart */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Programme annuel - Timeline audits par mois
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timelineData} layout="horizontal">
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
            <Bar dataKey="Planifié" stackId="a" fill={THEME_COLORS.muted} />
            <Bar dataKey="Réalisé" stackId="a" fill={THEME_COLORS.grn} />
            <Bar dataKey="Reporté" stackId="a" fill={THEME_COLORS.amb} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
        >
          <option value="all">Tous statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="px-3 py-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
        >
          <option value="all">Tous domaines</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filterAuditor}
          onChange={(e) => setFilterAuditor(e.target.value)}
          className="px-3 py-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
        >
          <option value="all">Tous auditeurs</option>
          {auditorList.map((auditor) => (
            <option key={auditor} value={auditor}>
              {auditor}
            </option>
          ))}
        </select>

        <div className="ml-auto">
          <AddButton onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      {/* Data Table with Expandable Findings */}
      <div className="space-y-2">
        {filteredAudits.map((audit) => (
          <div key={audit.id} className="space-y-0">
            {/* Main audit row - using custom row instead of DataTable for expandability */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-3">
              <div className="grid grid-cols-12 gap-3 items-center text-sm">
                <div className="col-span-1 flex items-center">
                  {findings.filter((f) => f.audit_id === audit.id).length > 0 && (
                    <button
                      onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {expandedAudit === audit.id ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
                    </button>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-mono text-[var(--accent)]">{audit.reference}</span>
                </div>
                <div className="col-span-2">
                  <Badge variant="plan">{audit.type}</Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {audit.domain_id ? domainMap[audit.domain_id] : "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[var(--text-secondary)]">{audit.auditor || "-"}</span>
                </div>
                <div className="col-span-2">
                  <Badge variant={getStatusBadgeVariant(audit.status)}>{audit.status}</Badge>
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    onClick={() => openFindingModal(audit.id)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                    title="Ajouter un constat"
                  >
                    <ClipboardIcon size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(audit.id)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                    title="Supprimer"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded findings section */}
            {expandedAudit === audit.id && (
              <div className="ml-8 bg-[var(--elevation-bg)] border border-[var(--border)] rounded p-4">
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                  Constats de l'audit
                </h4>
                <div className="space-y-2">
                  {findings
                    .filter((f) => f.audit_id === audit.id)
                    .map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-start gap-3 p-3 bg-[var(--card-bg)] border border-[var(--border)] rounded"
                      >
                        <div className="flex-shrink-0">
                          <Badge variant={getFindingBadgeVariant(finding.type)}>{finding.type}</Badge>
                        </div>
                        <div className="flex-1 space-y-1">
                          {finding.clause_ref && (
                            <span className="text-xs text-[var(--text-muted)] font-mono">
                              Clause {finding.clause_ref}
                            </span>
                          )}
                          <p className="text-sm text-[var(--text-primary)]">{finding.description}</p>
                          {finding.capa_id && (
                            <a
                              href={`/dashboard/capa#capa-${finding.capa_id}`}
                              className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                            >
                              Lien CAPA {capas.find((c) => c.id === finding.capa_id)?.id.substring(0, 4).toUpperCase()}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => removeFinding(finding.id)}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                          title="Supprimer constat"
                        >
                          <TrashIcon size={12} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings by Type */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Constats par type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={findingsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => (percent > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : "")}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {findingsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Audits by Domain */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Audits par domaine</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={auditsByDomain}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
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

      {/* Add Audit Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          title="Nouvel audit"
          onClose={() => setShowAddModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Référence *
              </label>
              <input
                type="text"
                value={newAudit.reference}
                onChange={(e) => setNewAudit({ ...newAudit, reference: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                placeholder="AUD-2026-001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Type</label>
              <select
                value={newAudit.type}
                onChange={(e) => setNewAudit({ ...newAudit, type: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
              >
                {AUDIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Domaine</label>
              <select
                value={newAudit.domain_id || ""}
                onChange={(e) => setNewAudit({ ...newAudit, domain_id: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Auditeur</label>
              <input
                type="text"
                value={newAudit.auditor || ""}
                onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                placeholder="Nom de l'auditeur"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Date planifiée
                </label>
                <input
                  type="date"
                  value={newAudit.planned_at || ""}
                  onChange={(e) => setNewAudit({ ...newAudit, planned_at: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Statut</label>
                <select
                  value={newAudit.status}
                  onChange={(e) => setNewAudit({ ...newAudit, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Résumé</label>
              <textarea
                value={newAudit.summary || ""}
                onChange={(e) => setNewAudit({ ...newAudit, summary: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] resize-none"
                placeholder="Résumé de l'audit..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!newAudit.reference}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Finding Modal */}
      {showFindingModal && selectedAuditForFinding && (
        <Modal
          isOpen={showFindingModal}
          title="Nouveau constat"
          onClose={() => {
            setShowFindingModal(false);
            setSelectedAuditForFinding(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Type</label>
              <select
                value={newFinding.type}
                onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
              >
                {FINDING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Clause ISO (optionnel)
              </label>
              <input
                type="text"
                value={newFinding.clause_ref || ""}
                onChange={(e) => setNewFinding({ ...newFinding, clause_ref: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                placeholder="9.2.2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Description *
              </label>
              <textarea
                value={newFinding.description}
                onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] resize-none"
                placeholder="Description détaillée du constat..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Lien CAPA (optionnel)
              </label>
              <select
                value={newFinding.capa_id || ""}
                onChange={(e) => setNewFinding({ ...newFinding, capa_id: e.target.value || null })}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
              >
                <option value="">Aucune CAPA</option>
                {capas.map((c) => (
                  <option key={c.id} value={c.id}>
                    CAPA-{c.id.substring(0, 4).toUpperCase()} - {c.description.substring(0, 50)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowFindingModal(false);
                  setSelectedAuditForFinding(null);
                }}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddFinding}
                disabled={!newFinding.description}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmDelete
          isOpen={!!deleteId}
          itemName="cet audit"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
