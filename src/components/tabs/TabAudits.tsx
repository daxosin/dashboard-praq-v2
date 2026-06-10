"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Audit, AuditInsert, AuditFinding, AuditFindingInsert, Capa, Processus } from "@/lib/db-rows";
import {
  KpiCard,
  Badge,
  AddButton,
  Modal,
  ConfirmDelete,
} from "@/components/ui";
import { ClipboardIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, DownloadIcon } from "@/components/icons";
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

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping (valeurs DB en UPPERCASE)     */
/* ------------------------------------------------------------------ */
const AUDIT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "INTERNE", label: "Interne" },
  { value: "EXTERNE", label: "Externe" },
  { value: "FOURNISSEUR", label: "Fournisseur" },
];

const STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "PLANIFIE", label: "Planifié" },
  { value: "EN_COURS", label: "En cours" },
  { value: "REALISE", label: "Réalisé" },
  { value: "ANNULE", label: "Annulé" },
];

const FINDING_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "MAJEUR", label: "Majeur" },
  { value: "MINEUR", label: "Mineur" },
  { value: "OBSERVATION", label: "Observation" },
];

const labelFor = (opts: { value: string; label: string }[], v: string | null | undefined): string =>
  opts.find((o) => o.value === v)?.label ?? String(v ?? "");

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--mut)",
};

const CHART_COLORS = ["#FF4444", "#FFB800", "#00CCFF"];

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
  const { data: audits, loading: loadingAudits, create, remove } = useSupabaseCrud<Audit>("audits", {
    orderBy: { column: "date_planifiee", ascending: false },
  });

  const { data: findings, loading: loadingFindings, create: createFinding, remove: removeFinding } = useSupabaseCrud<AuditFinding>("audit_findings", {
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: processus, loading: loadingProcessus } = useSupabaseCrud<Processus>("processus", {
    orderBy: { column: "nom", ascending: true },
  });

  const { data: capas } = useSupabaseCrud<Capa>("capa");

  /* ---- local state ----------------------------------------------- */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [selectedAuditForFinding, setSelectedAuditForFinding] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterProcessus, setFilterProcessus] = useState<string>("all");
  const [filterAuditeur, setFilterAuditeur] = useState<string>("all");

  const [newAudit, setNewAudit] = useState<Partial<AuditInsert>>({
    type: "INTERNE",
    statut: "PLANIFIE",
    titre: "",
    date_planifiee: "",
    nb_constats_majeurs: 0,
    nb_constats_mineurs: 0,
    nb_observations: 0,
  });

  const [newFinding, setNewFinding] = useState<Partial<AuditFindingInsert>>({
    audit_id: "",
    code: "",
    objet: "",
    type: "OBSERVATION",
    description: "",
  });

  /* ---- KPIs ------------------------------------------------------ */
  const kpis = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const auditsThisYear = audits.filter((a) => {
      const year = a.date_planifiee ? new Date(a.date_planifiee).getFullYear() : currentYear;
      return year === currentYear;
    });

    const plannedCount = auditsThisYear.filter((a) => a.statut === "PLANIFIE" || a.statut === "EN_COURS").length;
    const realizedCount = auditsThisYear.filter((a) => a.statut === "REALISE").length;
    const cancelledCount = auditsThisYear.filter((a) => a.statut === "ANNULE").length;

    const totalScheduled = plannedCount + realizedCount + cancelledCount;
    const realizationRate = totalScheduled > 0 ? Math.round((realizedCount / totalScheduled) * 100) : 0;

    return {
      planned: plannedCount,
      realized: realizedCount,
      cancelled: cancelledCount,
      realizationRate,
    };
  }, [audits]);

  /* ---- filtered list --------------------------------------------- */
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      if (filterStatut !== "all" && a.statut !== filterStatut) return false;
      if (filterProcessus !== "all" && a.processus_id !== filterProcessus) return false;
      if (filterAuditeur !== "all" && a.auditeur !== filterAuditeur) return false;
      return true;
    });
  }, [audits, filterStatut, filterProcessus, filterAuditeur]);

  /* ---- chart data: timeline -------------------------------------- */
  const timelineData = useMemo(() => {
    const monthlyData: Record<string, { month: string; Planifié: number; Réalisé: number; Annulé: number }> = {};

    audits.forEach((a) => {
      const month = a.date_planifiee ? a.date_planifiee.substring(0, 7) : "";
      if (!month) return;

      if (!monthlyData[month]) {
        monthlyData[month] = { month, Planifié: 0, Réalisé: 0, Annulé: 0 };
      }

      if (a.statut === "PLANIFIE" || a.statut === "EN_COURS") {
        monthlyData[month].Planifié += 1;
      } else if (a.statut === "REALISE") {
        monthlyData[month].Réalisé += 1;
      } else if (a.statut === "ANNULE") {
        monthlyData[month].Annulé += 1;
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
    };

    findings.forEach((f) => {
      const lbl = labelFor(FINDING_TYPE_OPTIONS, f.type);
      if (counts[lbl] !== undefined) {
        counts[lbl] += 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [findings]);

  /* ---- chart data: audits by processus --------------------------- */
  const auditsByProcessus = useMemo(() => {
    const counts: Record<string, number> = {};
    const pMap: Record<string, string> = {};

    processus.forEach((p) => {
      pMap[p.id] = p.nom;
      counts[p.nom] = 0;
    });

    audits.forEach((a) => {
      if (a.processus_id && pMap[a.processus_id]) {
        counts[pMap[a.processus_id]] += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  }, [audits, processus]);

  /* ---- processus lookup map --------------------------------------- */
  const processusMap = useMemo(() => {
    const map: Record<string, string> = {};
    processus.forEach((p) => {
      map[p.id] = p.nom;
    });
    return map;
  }, [processus]);

  /* ---- auditeur list for filter ----------------------------------- */
  const auditeurList = useMemo(() => {
    const auditeurs = new Set<string>();
    audits.forEach((a) => {
      if (a.auditeur) auditeurs.add(a.auditeur);
    });
    return Array.from(auditeurs).sort();
  }, [audits]);

  /* ---- handlers -------------------------------------------------- */
  const handleAdd = async () => {
    try {
      await create(newAudit as AuditInsert);
      setShowAddModal(false);
      setNewAudit({
        type: "INTERNE",
        statut: "PLANIFIE",
        titre: "",
        date_planifiee: "",
        nb_constats_majeurs: 0,
        nb_constats_mineurs: 0,
        nb_observations: 0,
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
        code: "",
        objet: "",
        type: "OBSERVATION",
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

  const handleExportPDF = (audit: Audit) => {
    const esc = (s: unknown) =>
      String(s ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
      );

    const auditFindings = findings.filter((f) => f.audit_id === audit.id);
    const processusName = audit.processus_id ? processusMap[audit.processus_id] : "Aucun processus";
    const plannedFr = audit.date_planifiee
      ? new Date(audit.date_planifiee).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : "Non planifié";
    const realizedFr = audit.date_realisee
      ? new Date(audit.date_realisee).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : "—";
    const exportFr = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

    const findingTone: Record<string, string> = {
      MAJEUR: "#C0392B",
      MINEUR: "#D4860B",
      OBSERVATION: "#5A6373",
    };

    const findingsHtml = auditFindings.length
      ? auditFindings
          .map((f) => {
            const capa = f.capa_id ? capas.find((c) => c.id === f.capa_id) : null;
            const capaRef = capa ? capa.reference || `CAPA-${capa.id.substring(0, 4).toUpperCase()}` : "";
            return `
              <div class="finding">
                <div class="finding-head">
                  <span class="tag" style="background:${findingTone[f.type] ?? "#5A6373"}">${esc(labelFor(FINDING_TYPE_OPTIONS, f.type))}</span>
                  <span class="clause">${esc(f.code)}</span>
                  ${f.norme_concernee ? `<span class="clause">Norme ${esc(f.norme_concernee)}</span>` : ""}
                  ${capaRef ? `<span class="capa">Lien ${esc(capaRef)}</span>` : ""}
                </div>
                <p class="finding-desc"><strong>${esc(f.objet)}</strong> — ${esc(f.description)}</p>
              </div>`;
          })
          .join("")
      : `<p class="empty">Aucun constat enregistré pour cet audit.</p>`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Audit ${esc(audit.titre)} — Pharma78</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 11pt; line-height: 1.5; margin: 0; background: #fff; }
  header { border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 18pt; font-weight: 700; letter-spacing: -0.01em; }
  .brand small { display: block; font-size: 9pt; font-weight: 400; color: #5A6373; letter-spacing: 0.04em; text-transform: uppercase; margin-top: 2px; }
  .doc-meta { text-align: right; font-size: 9pt; color: #5A6373; }
  h1 { font-size: 16pt; margin: 0 0 4px 0; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.06em; color: #5A6373; border-bottom: 1px solid #d0d4dc; padding-bottom: 4px; margin: 24px 0 12px 0; }
  .ref { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12pt; color: #2E7D5A; font-weight: 600; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-top: 6px; }
  .grid div { font-size: 10pt; }
  .grid .lbl { color: #5A6373; font-weight: 600; text-transform: uppercase; font-size: 8.5pt; letter-spacing: 0.05em; }
  .summary { background: #f5f7fa; border-left: 3px solid #2E7D5A; padding: 10px 14px; font-size: 10.5pt; border-radius: 0 4px 4px 0; }
  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
  .kpi { border: 1px solid #d0d4dc; border-radius: 6px; padding: 10px 12px; }
  .kpi .v { font-size: 18pt; font-weight: 700; }
  .kpi .l { font-size: 8.5pt; color: #5A6373; text-transform: uppercase; letter-spacing: 0.05em; }
  .kpi.maj .v { color: #C0392B; }
  .kpi.min .v { color: #D4860B; }
  .kpi.obs .v { color: #5A6373; }
  .finding { border: 1px solid #d0d4dc; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; page-break-inside: avoid; }
  .finding-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
  .tag { color: #fff; font-size: 8.5pt; font-weight: 700; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
  .clause { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 9pt; color: #5A6373; }
  .capa { font-size: 9pt; color: #2E7D5A; font-weight: 600; }
  .finding-desc { margin: 0; font-size: 10.5pt; color: #1a1a1a; }
  .empty { color: #5A6373; font-style: italic; font-size: 10pt; }
  footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #d0d4dc; font-size: 8.5pt; color: #5A6373; display: flex; justify-content: space-between; }
  @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  .toolbar { position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; }
  .toolbar button { padding: 8px 14px; border-radius: 6px; border: 1px solid #1a1a1a; background: #1a1a1a; color: #fff; font-size: 11pt; cursor: pointer; }
  .toolbar button.alt { background: #fff; color: #1a1a1a; }
</style>
</head>
<body>
  <div class="toolbar no-print">
    <button onclick="window.print()">Enregistrer en PDF</button>
    <button class="alt" onclick="window.close()">Fermer</button>
  </div>

  <header>
    <div class="brand">Pharma78<small>Rapport d'audit qualité</small></div>
    <div class="doc-meta">
      Exporté le ${esc(exportFr)}<br/>
      Dashboard PRAQ v2
    </div>
  </header>

  <h1><span class="ref">${esc(audit.titre)}</span> — ${esc(labelFor(AUDIT_TYPE_OPTIONS, audit.type))}</h1>

  <div class="grid">
    <div><div class="lbl">Statut</div>${esc(labelFor(STATUT_OPTIONS, audit.statut))}</div>
    <div><div class="lbl">Auditeur</div>${esc(audit.auditeur || "—")}</div>
    <div><div class="lbl">Processus</div>${esc(processusName)}</div>
    <div><div class="lbl">Date planifiée</div>${esc(plannedFr)}</div>
    <div><div class="lbl">Date réalisée</div>${esc(realizedFr)}</div>
    <div><div class="lbl">Type d'audit</div>${esc(labelFor(AUDIT_TYPE_OPTIONS, audit.type))}</div>
  </div>

  <h2>Notes</h2>
  <div class="summary">${audit.notes ? esc(audit.notes) : "<em>Aucune note renseignée.</em>"}</div>

  <h2>Bilan des constats</h2>
  <div class="kpis">
    <div class="kpi maj"><div class="v">${audit.nb_constats_majeurs ?? 0}</div><div class="l">Constats majeurs</div></div>
    <div class="kpi min"><div class="v">${audit.nb_constats_mineurs ?? 0}</div><div class="l">Constats mineurs</div></div>
    <div class="kpi obs"><div class="v">${audit.nb_observations ?? 0}</div><div class="l">Observations</div></div>
  </div>

  <h2>Détail des constats (${auditFindings.length})</h2>
  ${findingsHtml}

  <footer>
    <span>Pharma78 — Bois-d'Arcy (78) — Document interne qualité</span>
    <span>Audit ${esc(audit.titre)}</span>
  </footer>

  <script>
    window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 200); });
  </script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=1100");
    if (!win) {
      alert("Le navigateur a bloqué l'ouverture de la fenêtre d'export. Autorisez les pop-ups pour ce site.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const getStatutBadgeVariant = (statut: string): "ok" | "wip" | "plan" | "crit" => {
    switch (statut) {
      case "REALISE":
        return "ok";
      case "EN_COURS":
        return "wip";
      case "PLANIFIE":
        return "plan";
      case "ANNULE":
        return "crit";
      default:
        return "plan";
    }
  };

  const getFindingBadgeVariant = (type: string): "ok" | "wip" | "plan" | "crit" => {
    switch (type) {
      case "OBSERVATION":
        return "plan";
      case "MINEUR":
        return "wip";
      case "MAJEUR":
        return "crit";
      default:
        return "plan";
    }
  };

  /* ---- loading state --------------------------------------------- */
  if (loadingAudits || loadingProcessus || loadingFindings) {
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
          label="Annulés"
          value={kpis.cancelled.toString()}
          subtitle="À replanifier"
          accent={kpis.cancelled > 0 ? "amber" : "default"}
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
            <Bar dataKey="Annulé" stackId="a" fill={THEME_COLORS.amb} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ---- Filters ---------------------------------------------- */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className={filterCls}
        >
          <option value="all">Tous statuts</option>
          {STATUT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filterProcessus}
          onChange={(e) => setFilterProcessus(e.target.value)}
          className={filterCls}
        >
          <option value="all">Tous processus</option>
          {processus.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>

        <select
          value={filterAuditeur}
          onChange={(e) => setFilterAuditeur(e.target.value)}
          className={filterCls}
        >
          <option value="all">Tous auditeurs</option>
          {auditeurList.map((auditeur) => (
            <option key={auditeur} value={auditeur}>
              {auditeur}
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
                {/* row 1: titre + type + actions */}
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

                    <span className="text-[14px] font-semibold text-accent truncate">
                      {audit.titre}
                    </span>
                    <Badge variant="plan">{labelFor(AUDIT_TYPE_OPTIONS, audit.type)}</Badge>
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
                      onClick={() => handleExportPDF(audit)}
                      className="p-2 text-mut hover:text-accent rounded-lg hover:bg-accent/10 transition-all"
                      title="Exporter le rapport en PDF"
                    >
                      <DownloadIcon size={15} />
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

                {/* row 2: processus + auditeur + date */}
                <div className="flex items-center gap-4 mt-2 text-[13px] text-sec">
                  <span>{audit.processus_id ? processusMap[audit.processus_id] : "Aucun processus"}</span>
                  <span className="text-brd">|</span>
                  <span>{audit.auditeur || "Pas d'auditeur"}</span>
                  <span className="text-brd">|</span>
                  <span className="text-mut">
                    {audit.date_planifiee
                      ? new Date(audit.date_planifiee).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Non planifié"}
                  </span>
                </div>

                {/* row 3: statut + findings count */}
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant={getStatutBadgeVariant(audit.statut)}>
                    {labelFor(STATUT_OPTIONS, audit.statut)}
                  </Badge>

                  <div className="flex items-center gap-3 text-[12px]">
                    <span className="text-red font-semibold">{audit.nb_constats_majeurs ?? 0} maj.</span>
                    <span className="text-amb font-semibold">{audit.nb_constats_mineurs ?? 0} min.</span>
                    <span className="text-sec font-semibold">{audit.nb_observations ?? 0} obs.</span>
                  </div>

                  {auditFindings.length > 0 && (
                    <span className="text-[12px] text-mut">
                      ({auditFindings.length} constat{auditFindings.length > 1 ? "s" : ""} enregistré{auditFindings.length > 1 ? "s" : ""})
                    </span>
                  )}

                  {audit.notes && (
                    <span className="text-[12px] text-mut italic truncate ml-auto max-w-[300px]">
                      {audit.notes}
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
                    {auditFindings.map((finding) => {
                      const linkedCapa = finding.capa_id
                        ? capas.find((c) => c.id === finding.capa_id)
                        : null;
                      return (
                        <div
                          key={finding.id}
                          className="flex items-start gap-3 p-4 bg-card border border-brd rounded-xl"
                        >
                          <div className="flex-shrink-0 pt-0.5">
                            <Badge variant={getFindingBadgeVariant(finding.type)}>
                              {labelFor(FINDING_TYPE_OPTIONS, finding.type)}
                            </Badge>
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] text-mut font-mono">{finding.code}</span>
                              {finding.norme_concernee && (
                                <span className="text-[12px] text-mut font-mono">
                                  Norme {finding.norme_concernee}
                                </span>
                              )}
                            </div>
                            <p className="text-[14px] font-semibold text-text">{finding.objet}</p>
                            <p className="text-[14px] text-text">{finding.description}</p>
                            {finding.capa_id && (
                              <a
                                href={`/dashboard/capa#capa-${finding.capa_id}`}
                                className="text-[12px] text-accent hover:underline inline-flex items-center gap-1"
                              >
                                Lien CAPA {linkedCapa?.reference || finding.capa_id.substring(0, 4).toUpperCase()}
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
                      );
                    })}
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

        {/* Audits by Processus */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Audits par processus</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={auditsByProcessus}>
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
              <label className={labelCls}>Titre *</label>
              <input
                type="text"
                value={newAudit.titre || ""}
                onChange={(e) => setNewAudit({ ...newAudit, titre: e.target.value })}
                className={inputCls}
                placeholder="Ex : Audit interne PDA 2026"
              />
            </div>

            <div>
              <label className={labelCls}>Type</label>
              <select
                value={newAudit.type}
                onChange={(e) => setNewAudit({ ...newAudit, type: e.target.value })}
                className={inputCls}
              >
                {AUDIT_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Processus</label>
              <select
                value={newAudit.processus_id || ""}
                onChange={(e) => setNewAudit({ ...newAudit, processus_id: e.target.value || null })}
                className={inputCls}
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
              <label className={labelCls}>Auditeur</label>
              <input
                type="text"
                value={newAudit.auditeur || ""}
                onChange={(e) => setNewAudit({ ...newAudit, auditeur: e.target.value })}
                className={inputCls}
                placeholder="Nom de l'auditeur"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date planifiée *</label>
                <input
                  type="date"
                  value={newAudit.date_planifiee || ""}
                  onChange={(e) => setNewAudit({ ...newAudit, date_planifiee: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Statut</label>
                <select
                  value={newAudit.statut}
                  onChange={(e) => setNewAudit({ ...newAudit, statut: e.target.value })}
                  className={inputCls}
                >
                  {STATUT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={newAudit.notes || ""}
                onChange={(e) => setNewAudit({ ...newAudit, notes: e.target.value })}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Notes sur l'audit..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className={btnCancel}>
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!newAudit.titre || !newAudit.date_planifiee}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Code *</label>
                <input
                  type="text"
                  value={newFinding.code || ""}
                  onChange={(e) => setNewFinding({ ...newFinding, code: e.target.value })}
                  className={inputCls}
                  placeholder="CST-2026-001"
                />
              </div>

              <div>
                <label className={labelCls}>Type</label>
                <select
                  value={newFinding.type}
                  onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value })}
                  className={inputCls}
                >
                  {FINDING_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Objet *</label>
              <input
                type="text"
                value={newFinding.objet || ""}
                onChange={(e) => setNewFinding({ ...newFinding, objet: e.target.value })}
                className={inputCls}
                placeholder="Objet du constat"
              />
            </div>

            <div>
              <label className={labelCls}>Norme concernée (optionnel)</label>
              <input
                type="text"
                value={newFinding.norme_concernee || ""}
                onChange={(e) => setNewFinding({ ...newFinding, norme_concernee: e.target.value || null })}
                className={inputCls}
                placeholder="ISO 9001 - 9.2.2"
              />
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea
                value={newFinding.description || ""}
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
                    {c.reference || `CAPA-${c.id.substring(0, 4).toUpperCase()}`} - {c.titre.substring(0, 50)}
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
                disabled={!newFinding.code || !newFinding.objet || !newFinding.description}
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
