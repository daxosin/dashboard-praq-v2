"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type {
  Review,
  ReviewAction,
  ReviewInsert,
  ReviewActionInsert,
  Capa,
  Sop,
  Audit,
  Risk,
  Complaint,
  Qualification,
  Equipment,
  Indicator,
  IndicatorValue,
  Maintenance,
} from "@/lib/database.types";
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
import { ClipboardIcon, TrashIcon, DownloadIcon } from "@/components/icons";
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

const REVIEW_STATUSES = ["Planifiée", "En cours", "Réalisée"] as const;
const ACTION_STATUSES = ["Planifiée", "En cours", "Réalisée"] as const;

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF", "#CC88FF", "#FF8844"];

export function TabRevueDirection() {
  // Reviews CRUD
  const {
    data: reviews,
    loading: loadingReviews,
    create: createReview,
    update: updateReview,
    remove: removeReview,
  } = useSupabaseCrud<Review>("reviews", {
    orderBy: { column: "date", ascending: false },
  });

  // Review Actions CRUD
  const {
    data: reviewActions,
    loading: loadingActions,
    create: createAction,
    update: updateAction,
    remove: removeAction,
  } = useSupabaseCrud<ReviewAction>("review_actions", {
    orderBy: { column: "created_at", ascending: false },
  });

  // Aggregated data from all tabs
  const { data: capas } = useSupabaseCrud<Capa>("capas");
  const { data: sops } = useSupabaseCrud<Sop>("sops");
  const { data: audits } = useSupabaseCrud<Audit>("audits");
  const { data: risks } = useSupabaseCrud<Risk>("risks");
  const { data: complaints } = useSupabaseCrud<Complaint>("complaints");
  const { data: qualifications } = useSupabaseCrud<Qualification>("qualifications");
  const { data: equipment } = useSupabaseCrud<Equipment>("equipment");
  const { data: indicators } = useSupabaseCrud<Indicator>("indicators");
  const { data: indicatorValues } = useSupabaseCrud<IndicatorValue>("indicator_values");
  const { data: maintenance } = useSupabaseCrud<Maintenance>("maintenance");

  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [deleteActionId, setDeleteActionId] = useState<string | null>(null);
  const [filterReview, setFilterReview] = useState<string>("all");
  const [filterActionStatus, setFilterActionStatus] = useState<string>("all");

  const [newReview, setNewReview] = useState<Partial<ReviewInsert>>({
    date: new Date().toISOString().split("T")[0],
    status: "Planifiée",
  });

  const [newAction, setNewAction] = useState<Partial<ReviewActionInsert>>({
    review_id: "",
    decision: "",
    status: "Planifiée",
  });

  // KPIs Calculation
  const kpis = useMemo(() => {
    const openActions = reviewActions.filter((a) => a.status !== "Réalisée");
    const totalActions = reviewActions.length;
    const completedActions = reviewActions.filter((a) => a.status === "Réalisée");
    const completionRate = totalActions > 0 ? Math.round((completedActions.length / totalActions) * 100) : 0;

    const futureReviews = reviews.filter((r) => r.status === "Planifiée" && new Date(r.date) >= new Date());
    const nextReview = futureReviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return {
      openActions: openActions.length,
      completionRate,
      nextReviewDate: nextReview?.date || "Non planifiée",
    };
  }, [reviewActions, reviews]);

  // Auto-aggregated ISO 9.3 Input Data
  const isoData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Previous review actions status
    const actionsByStatus = reviewActions.reduce(
      (acc, action) => {
        acc[action.status] = (acc[action.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 2. Quality indicators evolution (latest value vs target)
    const indicatorPerformance = indicators.map((ind) => {
      const values = indicatorValues
        .filter((v) => v.indicator_id === ind.id)
        .sort((a, b) => b.period.localeCompare(a.period));
      const latestValue = values[0]?.value || 0;
      const isOnTarget =
        ind.direction === "up" ? latestValue >= ind.target : latestValue <= ind.target;
      return {
        label: ind.label,
        value: latestValue,
        target: ind.target,
        unit: ind.unit,
        onTarget: isOnTarget,
      };
    });

    // 3. Audit results
    const completedAudits = audits.filter((a) => a.status === "Réalisé");
    const totalFindings = completedAudits.reduce((acc, a) => acc + a.major_findings + a.minor_findings, 0);
    const majorFindings = completedAudits.reduce((acc, a) => acc + a.major_findings, 0);

    // 4. Process performance (health matrix summary)
    const processHealth = {
      green: 0,
      amber: 0,
      red: 0,
    };
    // Simplified: based on SOPs status
    const validatedSops = sops.filter((s) => s.status === "Validé").length;
    const inProgressSops = sops.filter((s) => s.status === "En cours").length;
    const plannedSops = sops.filter((s) => s.status === "Planifié").length;
    processHealth.green = validatedSops;
    processHealth.amber = inProgressSops;
    processHealth.red = plannedSops;

    // 5. NC and CAPA
    const openCapas = capas.filter((c) => c.status !== "Clôturée");
    const overdueCapas = openCapas.filter((c) => {
      if (!c.due_date) return false;
      return new Date(c.due_date) < today;
    });
    const closedCapas = capas.filter((c) => c.status === "Clôturée");
    const closureRate = capas.length > 0 ? Math.round((closedCapas.length / capas.length) * 100) : 0;

    // 6. Stakeholder satisfaction
    const openComplaints = complaints.filter((c) => c.status !== "Clôturée");
    const avgSatisfaction =
      complaints.length > 0
        ? complaints
            .filter((c) => c.satisfaction)
            .reduce((acc, c) => {
              const score = parseFloat(c.satisfaction || "0");
              return acc + score;
            }, 0) / complaints.filter((c) => c.satisfaction).length
        : 0;

    // 7. Risks and opportunities
    const unacceptableRisks = risks.filter((r) => r.level === "Inacceptable").length;
    const riskActions = capas.filter((c) => c.source === "Auto-évaluation").length;

    // 8. Resources
    const activeQualifications = qualifications.filter((q) => q.status === "Valide");
    const totalStaff = new Set(qualifications.map((q) => q.staff_id)).size;
    const qualificationRate = totalStaff > 0 ? Math.round((activeQualifications.length / totalStaff) * 100) : 0;

    const conformEquipment = equipment.filter((e) => e.status === "Conforme").length;
    const equipmentRate = equipment.length > 0 ? Math.round((conformEquipment / equipment.length) * 100) : 0;

    return {
      actionsByStatus,
      indicatorPerformance,
      audits: {
        completed: completedAudits.length,
        majorFindings,
        totalFindings,
      },
      processHealth,
      capas: {
        open: openCapas.length,
        overdue: overdueCapas.length,
        closureRate,
      },
      stakeholders: {
        openComplaints: openComplaints.length,
        avgSatisfaction: avgSatisfaction.toFixed(1),
      },
      risks: {
        total: risks.length,
        unacceptable: unacceptableRisks,
        actions: riskActions,
      },
      resources: {
        qualificationRate,
        totalTrainings: qualifications.length,
        equipmentRate,
      },
    };
  }, [capas, sops, audits, risks, complaints, qualifications, equipment, indicators, indicatorValues]);

  // Filter review actions
  const filteredActions = useMemo(() => {
    return reviewActions.filter((a) => {
      if (filterReview !== "all" && a.review_id !== filterReview) return false;
      if (filterActionStatus !== "all" && a.status !== filterActionStatus) return false;
      return true;
    });
  }, [reviewActions, filterReview, filterActionStatus]);

  // Chart data: Actions by status
  const actionsByStatusChart = useMemo(() => {
    return Object.entries(isoData.actionsByStatus).map(([name, value]) => ({ name, value }));
  }, [isoData.actionsByStatus]);

  // Chart data: Decisions distribution
  const decisionsChart = useMemo(() => {
    const decisions: Record<string, number> = {};
    reviewActions.forEach((a) => {
      const dec = a.decision.substring(0, 30);
      decisions[dec] = (decisions[dec] || 0) + 1;
    });
    return Object.entries(decisions).map(([name, value]) => ({ name, value }));
  }, [reviewActions]);

  const handleAddReview = async () => {
    try {
      await createReview(newReview as ReviewInsert);
      setShowAddReviewModal(false);
      setNewReview({
        date: new Date().toISOString().split("T")[0],
        status: "Planifiée",
      });
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };

  const handleAddAction = async () => {
    try {
      await createAction(newAction as ReviewActionInsert);
      setShowAddActionModal(false);
      setNewAction({
        review_id: "",
        decision: "",
        status: "Planifiée",
      });
    } catch (error) {
      console.error("Error creating action:", error);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    try {
      await removeReview(deleteReviewId);
      setDeleteReviewId(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleDeleteAction = async () => {
    if (!deleteActionId) return;
    try {
      await removeAction(deleteActionId);
      setDeleteActionId(null);
    } catch (error) {
      console.error("Error deleting action:", error);
    }
  };

  const handleExport = () => {
    const exportData = {
      reviews,
      reviewActions,
      isoData,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revue-direction-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reviewColumns: ColumnDef<Review>[] = [
    {
      key: "date",
      label: "Date",
      render: (review) => (
        <EditableCell
          value={review.date}
          type="date"
          onSave={async (value) => {
            await updateReview(review.id, { date: String(value) });
          }}
        />
      ),
    },
    {
      key: "participants",
      label: "Participants",
      render: (review) => (
        <EditableCell
          value={review.participants || ""}
          type="text"
          onSave={async (value) => {
            await updateReview(review.id, { participants: String(value) });
          }}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (review) => (
        <EditableCell
          value={review.status}
          type="select"
          options={REVIEW_STATUSES.map((s) => ({ value: s, label: s }))}
          onSave={async (value) => {
            await updateReview(review.id, { status: String(value) });
          }}
        />
      ),
    },
    {
      key: "context_notes",
      label: "Notes contexte",
      render: (review) => (
        <EditableCell
          value={review.context_notes || ""}
          type="text"
          onSave={async (value) => {
            await updateReview(review.id, { context_notes: String(value) });
          }}
        />
      ),
    },
    {
      key: "resource_notes",
      label: "Notes ressources",
      render: (review) => (
        <EditableCell
          value={review.resource_notes || ""}
          type="text"
          onSave={async (value) => {
            await updateReview(review.id, { resource_notes: String(value) });
          }}
        />
      ),
    },
    {
      key: "improvement",
      label: "Améliorations",
      render: (review) => (
        <EditableCell
          value={review.improvement || ""}
          type="text"
          onSave={async (value) => {
            await updateReview(review.id, { improvement: String(value) });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (review) => (
        <button
          onClick={() => setDeleteReviewId(review.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const actionColumns: ColumnDef<ReviewAction>[] = [
    {
      key: "review_id",
      label: "Revue liée",
      render: (action) => {
        const review = reviews.find((r) => r.id === action.review_id);
        return (
          <span className="text-xs text-sec">
            {review?.date || "Non spécifiée"}
          </span>
        );
      },
    },
    {
      key: "decision",
      label: "Décision",
      render: (action) => (
        <EditableCell
          value={action.decision}
          type="text"
          onSave={async (value) => {
            await updateAction(action.id, { decision: String(value) });
          }}
        />
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (action) => (
        <EditableCell
          value={action.action || ""}
          type="text"
          onSave={async (value) => {
            await updateAction(action.id, { action: String(value) });
          }}
        />
      ),
    },
    {
      key: "owner",
      label: "Responsable",
      render: (action) => (
        <EditableCell
          value={action.owner || ""}
          type="text"
          onSave={async (value) => {
            await updateAction(action.id, { owner: String(value) });
          }}
        />
      ),
    },
    {
      key: "due_date",
      label: "Échéance",
      render: (action) => (
        <EditableCell
          value={action.due_date || ""}
          type="date"
          onSave={async (value) => {
            await updateAction(action.id, { due_date: String(value) });
          }}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (action) => (
        <EditableCell
          value={action.status}
          type="select"
          options={ACTION_STATUSES.map((s) => ({ value: s, label: s }))}
          onSave={async (value) => {
            await updateAction(action.id, { status: String(value) });
          }}
        />
      ),
    },
    {
      key: "followup_notes",
      label: "Notes suivi",
      render: (action) => (
        <EditableCell
          value={action.followup_notes || ""}
          type="text"
          onSave={async (value) => {
            await updateAction(action.id, { followup_notes: String(value) });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (action) => (
        <button
          onClick={() => setDeleteActionId(action.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  if (loadingReviews || loadingActions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-mut">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Actions ouvertes"
          value={kpis.openActions.toString()}
          subtitle="Actions non réalisées"
          accent={kpis.openActions > 0 ? "amber" : "default"}
        />
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Taux réalisation"
          value={`${kpis.completionRate}%`}
          subtitle="Réalisées / Total"
          accent={kpis.completionRate >= 80 ? "default" : "amber"}
        />
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Prochaine revue"
          value={kpis.nextReviewDate === "Non planifiée" ? "N/A" : kpis.nextReviewDate}
          subtitle={kpis.nextReviewDate === "Non planifiée" ? "Aucune planifiée" : "Date planifiée"}
        />
      </div>

      {/* ISO 9.3 Auto-Aggregated Input Data */}
      <div className="bg-card border border-brd rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text">
            Données d'entrée § 9.3 ISO (auto-agrégées)
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-[#000] rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <DownloadIcon size={14} />
            Export rapport
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Previous review actions status */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">
              1. Statut actions revue précédente
            </h3>
            <div className="space-y-2">
              {Object.entries(isoData.actionsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between text-xs">
                  <span className="text-sec">{status}</span>
                  <span className="font-semibold text-text">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Quality indicators evolution */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">
              2. Évolution indicateurs qualité
            </h3>
            <div className="space-y-2">
              {isoData.indicatorPerformance.slice(0, 3).map((ind, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-sec truncate">{ind.label}</span>
                  <span
                    className="font-semibold"
                    style={{ color: ind.onTarget ? THEME_COLORS.grn : THEME_COLORS.red }}
                  >
                    {ind.value} {ind.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Audit results */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">3. Résultats audits</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sec">Réalisés</span>
                <span className="font-semibold text-text">{isoData.audits.completed}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Constats majeurs</span>
                <span className="font-semibold text-red">{isoData.audits.majorFindings}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Total constats</span>
                <span className="font-semibold text-text">{isoData.audits.totalFindings}</span>
              </div>
            </div>
          </div>

          {/* 4. Process performance */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">
              4. Performance processus
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sec">Vert</span>
                <span className="font-semibold" style={{ color: THEME_COLORS.grn }}>
                  {isoData.processHealth.green}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Ambre</span>
                <span className="font-semibold" style={{ color: THEME_COLORS.amb }}>
                  {isoData.processHealth.amber}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Rouge</span>
                <span className="font-semibold" style={{ color: THEME_COLORS.red }}>
                  {isoData.processHealth.red}
                </span>
              </div>
            </div>
          </div>

          {/* 5. NC and CAPA */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">5. NC et CAPA</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sec">Ouvertes</span>
                <span className="font-semibold text-text">{isoData.capas.open}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">En retard</span>
                <span className="font-semibold text-red">{isoData.capas.overdue}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Taux clôture</span>
                <span className="font-semibold text-text">{isoData.capas.closureRate}%</span>
              </div>
            </div>
          </div>

          {/* 6. Stakeholder satisfaction */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">
              6. Satisfaction parties intéressées
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sec">Réclamations ouvertes</span>
                <span className="font-semibold text-text">
                  {isoData.stakeholders.openComplaints}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Satisfaction moyenne</span>
                <span className="font-semibold text-text">
                  {isoData.stakeholders.avgSatisfaction}/5
                </span>
              </div>
            </div>
          </div>

          {/* 7. Risks and opportunities */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">
              7. Risques et opportunités
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sec">Total risques</span>
                <span className="font-semibold text-text">{isoData.risks.total}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Inacceptables</span>
                <span className="font-semibold text-red">{isoData.risks.unacceptable}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Actions</span>
                <span className="font-semibold text-text">{isoData.risks.actions}</span>
              </div>
            </div>
          </div>

          {/* 8. Resources */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">8. Ressources</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sec">Habilitations</span>
                <span className="font-semibold text-text">
                  {isoData.resources.qualificationRate}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Formations</span>
                <span className="font-semibold text-text">
                  {isoData.resources.totalTrainings}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Équipements conformes</span>
                <span className="font-semibold text-text">
                  {isoData.resources.equipmentRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews DataTable */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Revues de direction</h2>
          <AddButton onClick={() => setShowAddReviewModal(true)} />
        </div>
        <DataTable columns={reviewColumns} data={reviews} />
      </div>

      {/* Review Actions DataTable */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Actions de revue</h2>
          <AddButton onClick={() => setShowAddActionModal(true)} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterReview}
            onChange={(e) => setFilterReview(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Toutes revues</option>
            {reviews.map((r) => (
              <option key={r.id} value={r.id}>
                {r.date}
              </option>
            ))}
          </select>

          <select
            value={filterActionStatus}
            onChange={(e) => setFilterActionStatus(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Tous statuts</option>
            {ACTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <DataTable columns={actionColumns} data={filteredActions} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions by status */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Actions par statut</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={actionsByStatusChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
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

        {/* Decisions distribution */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Répartition décisions</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={decisionsChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.substring(0, 20)}... (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {decisionsChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddReviewModal && (
        <Modal
          isOpen={showAddReviewModal}
          title="Nouvelle revue de direction"
          onClose={() => setShowAddReviewModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Date *</label>
              <input
                type="date"
                value={newReview.date}
                onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Participants
              </label>
              <input
                type="text"
                value={newReview.participants || ""}
                onChange={(e) => setNewReview({ ...newReview, participants: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Liste des participants"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Statut</label>
              <select
                value={newReview.status}
                onChange={(e) => setNewReview({ ...newReview, status: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {REVIEW_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Notes contexte
              </label>
              <textarea
                value={newReview.context_notes || ""}
                onChange={(e) => setNewReview({ ...newReview, context_notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Notes sur le contexte de la revue..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddReviewModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddReview}
                disabled={!newReview.date}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Action Modal */}
      {showAddActionModal && (
        <Modal
          isOpen={showAddActionModal}
          title="Nouvelle action de revue"
          onClose={() => setShowAddActionModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Revue liée *
              </label>
              <select
                value={newAction.review_id}
                onChange={(e) => setNewAction({ ...newAction, review_id: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                <option value="">Sélectionner une revue</option>
                {reviews.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.date} - {r.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Décision *
              </label>
              <textarea
                value={newAction.decision}
                onChange={(e) => setNewAction({ ...newAction, decision: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Décision prise lors de la revue..."
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Action</label>
              <textarea
                value={newAction.action || ""}
                onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Action à réaliser..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Responsable
                </label>
                <input
                  type="text"
                  value={newAction.owner || ""}
                  onChange={(e) => setNewAction({ ...newAction, owner: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="Nom du responsable"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">Échéance</label>
                <input
                  type="date"
                  value={newAction.due_date || ""}
                  onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">Statut</label>
              <select
                value={newAction.status}
                onChange={(e) => setNewAction({ ...newAction, status: e.target.value })}
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {ACTION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddActionModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddAction}
                disabled={!newAction.review_id || !newAction.decision}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Review Confirmation */}
      {deleteReviewId && (
        <ConfirmDelete
          isOpen={!!deleteReviewId}
          itemName="cette revue de direction"
          onConfirm={handleDeleteReview}
          onCancel={() => setDeleteReviewId(null)}
        />
      )}

      {/* Delete Action Confirmation */}
      {deleteActionId && (
        <ConfirmDelete
          isOpen={!!deleteActionId}
          itemName="cette action de revue"
          onConfirm={handleDeleteAction}
          onCancel={() => setDeleteActionId(null)}
        />
      )}
    </div>
  );
}
