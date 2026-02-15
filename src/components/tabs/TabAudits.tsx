"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Audit, AuditFinding, Domain, AuditInsert, AuditFindingInsert, Capa } from "@/lib/database.types";
import {
  KpiCard,
  Badge,
  AddButton,
  Modal,
  ConfirmDelete,
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
  muted: "var(--mut)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF"];

/* ------------------------------------------------------------------ */
/*  Shared style constants for form fields                            */
/* ------------------------------------------------------------------ */
const inputCls =
  "w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all";

const labelCls = "block text-[13px] font-semibold text-sec mb-2";

const btnPrimary =
  "px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const btnCancel =
  "px-6 py-3 text-sec hover:text-text rounded-xl text-[15px] transition-colors";

const filterCls =
  "px-4 py-2.5 rounded-xl text-[14px] bg-card text-text border border-brd focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all";

/* ================================================================== */
/*  TabAudits                                                         */
/* ================================================================== */
export function TabAudits() {
  /* ---- data hooks ------------------------------------------------ */
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

  /* ---- local state ----------------------------------------------- */
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

  /* ---- KPIs ------------------------------------------------------ */
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

  /* ---- filtered list --------------------------------------------- */
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterDomain !== "all" && a.domain_id !== filterDomain) return false;
      if (filterAuditor !== "all" && a.auditor !== filterAuditor) return false;
      return true;
    });
  }, [audits, filterStatus, filterDomain, filterAuditor]);

  /* ---- chart data: timeline -------------------------------------- */
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

  /* ---- chart data: findings by type ------------------------------ */
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

  /* ---- chart data: audits by domain ------------------------------ */
  const auditsByDomain = useMemo(() => {
    const counts: Record<string, number> = {};
    const dMap: Record<string, string> = {};

    domains.forEach((d) => {
      dMap[d.id] = d.name;
      counts[d.name] = 0;
    });

    audits.forEach((a) => {
      if (a.domain_id && dMap[a.domain_id]) {
        counts[dMap[a.domain_id]] += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  }, [audits, domains]);

  /* ---- domain lookup map ----------------------------------------- */
  const domainMap = useMemo(() => {
    const map: Record<string, string> = {};
    domains.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [domains]);

  /* ---- auditor list for filter ----------------------------------- */
  const auditorList = useMemo(() => {
    const auditors = new Set<string>();
    audits.forEach((a) => {
      if (a.auditor) auditors.add(a.auditor);
    });
    return Array.from(auditors).sort();
  }, [audits]);

  /* ---- handlers -------------------------------------------------- */
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

  /* ---- loading state --------------------------------------------- */
  if (loadingAudits || loadingDomains || loadingFindings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-mut">Chargement...</p>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="space-y-6">
      {/* ---- KPI Cards -------------------------------------------- */}
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

      {/* ---- Timeline Chart --------------------------------------- */}
      <div className="bg-card border border-brd rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text mb-4">
          Programme annuel - Timeline audits par mois
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timelineData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
            <XAxis dataKey="month" tick={{ fill: "var(--mut)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--mut)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--brd)",
                borderRadius: "12px",
              }}
            />
            <Legend />
            <Bar dataKey="Planifié" stackId="a" fill={THEME_COLORS.muted} />
            <Bar dataKey="Réalisé" stackId="a" fill={THEME_COLORS.grn} />
            <Bar dataKey="Reporté" stackId="a" fill={THEME_COLORS.amb} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ---- Filters ---------------------------------------------- */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={filterCls}
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
          className={filterCls}
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
          className={filterCls}
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

      {/* ---- Audit Cards ------------------------------------------ */}
      <div className="space-y-3">
        {filteredAudits.length === 0 && (
          <p className="text-center py-12 text-mut text-[15px]">Aucun audit trouvé.</p>
        )}

        {filteredAudits.map((audit) => {
          const auditFindings = findings.filter((f) => f.audit_id === audit.id);
          const isExpanded = expandedAudit === audit.id;

          return (
            <div key={audit.id} className="space-y-0">
              {/* --- card ------------------------------------------ */}
              <div className="bg-card border border-brd rounded-xl p-5 hover:border-accent/30 transition-colors">
                {/* row 1: reference + type + actions */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* expand toggle */}
                    {auditFindings.length > 0 && (
                      <button
                        onClick={() => setExpandedAudit(isExpanded ? null : audit.id)}
                        className="flex-shrink-0 p-1 text-mut hover:text-text transition-colors"
                      >
                        {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                      </button>
                    )}

                    <span className="text-[14px] font-mono font-semibold text-accent truncate">
                      {audit.reference}
                    </span>
                    <Badge variant="plan">{audit.type}</Badge>
                  </div>

                  {/* action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openFindingModal(audit.id)}
                      className="p-2 text-mut hover:text-accent rounded-lg hover:bg-accent/10 transition-all"
                      title="Ajouter un constat"
                    >
                      <ClipboardIcon size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteId(audit.id)}
                      className="p-2 text-mut hover:text-red rounded-lg hover:bg-red/10 transition-all"
                      title="Supprimer"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </div>

                {/* row 2: domain + auditor + date */}
                <div className="flex items-center gap-4 mt-2 text-[13px] text-sec">
                  <span>{audit.domain_id ? domainMap[audit.domain_id] : "Aucun domaine"}</span>
                  <span className="text-brd">|</span>
                  <span>{audit.auditor || "Pas d'auditeur"}</span>
                  <span className="text-brd">|</span>
                  <span className="text-mut">
                    {audit.planned_at
                      ? new Date(audit.planned_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Non planifié"}
                  </span>
                </div>

                {/* row 3: status + findings count */}
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant={getStatusBadgeVariant(audit.status)}>{audit.status}</Badge>

                  <div className="flex items-center gap-3 text-[12px]">
                    <span className="text-red font-semibold">{audit.major_findings} maj.</span>
                    <span className="text-amb font-semibold">{audit.minor_findings} min.</span>
                    <span className="text-sec font-semibold">{audit.observations} obs.</span>
                  </div>

                  {auditFindings.length > 0 && (
                    <span className="text-[12px] text-mut">
                      ({auditFindings.length} constat{auditFindings.length > 1 ? "s" : ""} enregistré{auditFindings.length > 1 ? "s" : ""})
                    </span>
                  )}

                  {audit.summary && (
                    <span className="text-[12px] text-mut italic truncate ml-auto max-w-[300px]">
                      {audit.summary}
                    </span>
                  )}
                </div>
              </div>

              {/* --- expanded findings ----------------------------- */}
              {isExpanded && auditFindings.length > 0 && (
                <div className="ml-6 mt-1 bg-elev border border-brd rounded-xl p-5">
                  <h4 className="text-[12px] font-semibold text-sec uppercase tracking-wider mb-3">
                    Constats de l'audit
                  </h4>
                  <div className="space-y-2">
                    {auditFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-start gap-3 p-4 bg-card border border-brd rounded-xl"
                      >
                        <div className="flex-shrink-0 pt-0.5">
                          <Badge variant={getFindingBadgeVariant(finding.type)}>{finding.type}</Badge>
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          {finding.clause_ref && (
                            <span className="text-[12px] text-mut font-mono">
                              Clause {finding.clause_ref}
                            </span>
                          )}
                          <p className="text-[14px] text-text">{finding.description}</p>
                          {finding.capa_id && (
                            <a
                              href={`/dashboard/capa#capa-${finding.capa_id}`}
                              className="text-[12px] text-accent hover:underline inline-flex items-center gap-1"
                            >
                              Lien CAPA {capas.find((c) => c.id === finding.capa_id)?.id.substring(0, 4).toUpperCase()}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => removeFinding(finding.id)}
                          className="flex-shrink-0 p-1.5 text-mut hover:text-red rounded-lg hover:bg-red/10 transition-all"
                          title="Supprimer constat"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Charts Section --------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings by Type */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Constats par type</h3>
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
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Audits par domaine</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={auditsByDomain}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--mut)", fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: "var(--mut)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--brd)",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="value" fill={THEME_COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Add Audit Modal -------------------------------------- */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          title="Nouvel audit"
          onClose={() => setShowAddModal(false)}
        >
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Référence *</label>
              <input
                type="text"
                value={newAudit.reference}
                onChange={(e) => setNewAudit({ ...newAudit, reference: e.target.value })}
                className={inputCls}
                placeholder="AUD-2026-001"
              />
            </div>

            <div>
              <label className={labelCls}>Type</label>
              <select
                value={newAudit.type}
                onChange={(e) => setNewAudit({ ...newAudit, type: e.target.value })}
                className={inputCls}
              >
                {AUDIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Domaine</label>
              <select
                value={newAudit.domain_id || ""}
                onChange={(e) => setNewAudit({ ...newAudit, domain_id: e.target.value })}
                className={inputCls}
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
              <label className={labelCls}>Auditeur</label>
              <input
                type="text"
                value={newAudit.auditor || ""}
                onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                className={inputCls}
                placeholder="Nom de l'auditeur"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date planifiée</label>
                <input
                  type="date"
                  value={newAudit.planned_at || ""}
                  onChange={(e) => setNewAudit({ ...newAudit, planned_at: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Statut</label>
                <select
                  value={newAudit.status}
                  onChange={(e) => setNewAudit({ ...newAudit, status: e.target.value as any })}
                  className={inputCls}
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
              <label className={labelCls}>Résumé</label>
              <textarea
                value={newAudit.summary || ""}
                onChange={(e) => setNewAudit({ ...newAudit, summary: e.target.value })}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Résumé de l'audit..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className={btnCancel}>
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!newAudit.reference}
                className={btnPrimary}
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Add Finding Modal ------------------------------------ */}
      {showFindingModal && selectedAuditForFinding && (
        <Modal
          isOpen={showFindingModal}
          title="Nouveau constat"
          onClose={() => {
            setShowFindingModal(false);
            setSelectedAuditForFinding(null);
          }}
        >
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Type</label>
              <select
                value={newFinding.type}
                onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value })}
                className={inputCls}
              >
                {FINDING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Clause ISO (optionnel)</label>
              <input
                type="text"
                value={newFinding.clause_ref || ""}
                onChange={(e) => setNewFinding({ ...newFinding, clause_ref: e.target.value })}
                className={inputCls}
                placeholder="9.2.2"
              />
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea
                value={newFinding.description}
                onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Description détaillée du constat..."
              />
            </div>

            <div>
              <label className={labelCls}>Lien CAPA (optionnel)</label>
              <select
                value={newFinding.capa_id || ""}
                onChange={(e) => setNewFinding({ ...newFinding, capa_id: e.target.value || null })}
                className={inputCls}
              >
                <option value="">Aucune CAPA</option>
                {capas.map((c) => (
                  <option key={c.id} value={c.id}>
                    CAPA-{c.id.substring(0, 4).toUpperCase()} - {c.description.substring(0, 50)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowFindingModal(false);
                  setSelectedAuditForFinding(null);
                }}
                className={btnCancel}
              >
                Annuler
              </button>
              <button
                onClick={handleAddFinding}
                disabled={!newFinding.description}
                className={btnPrimary}
              >
                Ajouter
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Delete Confirmation ---------------------------------- */}
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
