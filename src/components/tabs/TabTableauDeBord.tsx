"use client";

import React from "react";
import { useAlerts } from "@/lib/hooks/useAlerts";
import { useSmqScore } from "@/lib/hooks/useSmqScore";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import {
  ScoreGauge,
  KpiCard,
  AlertLine,
  Badge,
} from "@/components/ui";
import {
  DocIcon,
  ZapIcon,
  UsersIcon,
  ToolIcon,
  SearchIcon,
  MsgIcon,
} from "@/components/icons";
import { TABS } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Domain {
  id: string;
  name: string;
  process_type: string;
}

interface SOP {
  id: string;
  status: string;
  domain_id: string;
}

interface CAPA {
  id: string;
  status: string;
  due_date: string | null;
}

interface Qualification {
  id: string;
  status: string;
  expires_at: string | null;
}

interface Equipment {
  id: string;
  status: string;
}

interface Maintenance {
  id: string;
  equipment_id: string;
  next_due_at: string | null;
  status: string;
}

interface Audit {
  id: string;
  status: string;
}

interface Complaint {
  id: string;
  status: string;
  created_at: string;
}

export const TabTableauDeBord: React.FC = () => {
  const { alerts, loading: alertsLoading } = useAlerts();
  const { score, loading: scoreLoading } = useSmqScore();
  const { data: domains } = useSupabaseCrud<Domain>("domains");
  const { data: sops } = useSupabaseCrud<SOP>("sops");
  const { data: capas } = useSupabaseCrud<CAPA>("capas");
  const { data: qualifications } = useSupabaseCrud<Qualification>("qualifications");
  const { data: equipment } = useSupabaseCrud<Equipment>("equipment");
  const { data: maintenance } = useSupabaseCrud<Maintenance>("maintenance");
  const { data: audits } = useSupabaseCrud<Audit>("audits");
  const { data: complaints } = useSupabaseCrud<Complaint>("complaints");

  // Calculs KPI
  const sopsValides = sops.filter((s) => s.status === "Validé").length;
  const sopsEnCours = sops.filter((s) => s.status === "En cours").length;
  const sopsPlanifiees = sops.filter((s) => s.status === "Planifié").length;

  const capasOuvertes = capas.filter((c) => c.status !== "Clôturée").length;
  const capasEnRetard = capas.filter(
    (c) =>
      c.status !== "Clôturée" &&
      c.due_date &&
      new Date(c.due_date) < new Date()
  ).length;

  const habilitationsValides = qualifications.filter(
    (q) => q.status === "Valide"
  ).length;
  const habilitationsPct =
    qualifications.length > 0
      ? Math.round((habilitationsValides / qualifications.length) * 100)
      : 0;
  const habilitationsExpiring = qualifications.filter((q) => {
    if (!q.expires_at) return false;
    const days =
      (new Date(q.expires_at).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24);
    return days > 0 && days <= 30;
  }).length;

  const equipementsConformes = equipment.filter((e) => e.status === "Conforme")
    .length;
  const equipementsPct =
    equipment.length > 0
      ? Math.round((equipementsConformes / equipment.length) * 100)
      : 0;
  const maintenanceDue = maintenance.filter((m) => {
    if (!m.next_due_at) return false;
    return new Date(m.next_due_at) < new Date();
  }).length;

  const auditsRealises = audits.filter((a) => a.status === "Réalisé").length;
  const auditsPlanifies = audits.length;
  const auditsTaux =
    auditsPlanifies > 0
      ? Math.round((auditsRealises / auditsPlanifies) * 100)
      : 0;

  const reclamationsOuvertes = complaints.filter((c) => c.status !== "Clôturée")
    .length;
  const reclamationsPlus48h = complaints.filter((c) => {
    if (c.status === "Clôturée" || !c.created_at) return false;
    const hours =
      (new Date().getTime() - new Date(c.created_at).getTime()) /
      (1000 * 60 * 60);
    return hours > 48;
  }).length;

  // Matrice santé par domaine (calcul simplifié basé sur SOPs du domaine)
  const getDomaineHealth = (domainId: string): "ok" | "wip" | "crit" | "plan" => {
    const domainSops = sops.filter((s) => s.domain_id === domainId);
    if (domainSops.length === 0) return "plan";

    const validPct =
      (domainSops.filter((s) => s.status === "Validé").length /
        domainSops.length) *
      100;

    if (validPct >= 70) return "ok";
    if (validPct >= 40) return "wip";
    return "crit";
  };

  // Données graphique tendance (placeholder avec données statiques)
  const trendData = [
    { month: "Oct", score: 65 },
    { month: "Nov", score: 68 },
    { month: "Déc", score: 72 },
    { month: "Jan", score: 75 },
    { month: "Fév", score: score.total || 78 },
  ];

  // Mapping alertes vers onglets
  const getAlertHref = (alert: any): string => {
    const sourceMap: Record<string, string> = {
      capas: "/dashboard/capa",
      sops: "/dashboard/documents",
      qualifications: "/dashboard/formations",
      maintenance: "/dashboard/equipements",
      complaints: "/dashboard/reclamations",
      vigilances: "/dashboard/vigilances",
    };
    return sourceMap[alert.source_table] || "/dashboard/tableau-de-bord";
  };

  return (
    <div className="space-y-8">
      {/* Section Score SMQ + Breakdown */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut mb-4">
          SCORE GLOBAL SMQ
        </h2>
        <div className="bg-card border border-brd rounded-md p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Score principal */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={score.total} size={80} />
              <div className="text-[11px] text-mut mt-2">Score global</div>
            </div>

            {/* Breakdown 7 composantes */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <ScoreGauge score={(score.sops / 25) * 100} size={56} />
                <div className="text-[11px] text-mut mt-1 text-center">
                  SOPs (25%)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <ScoreGauge score={(score.capa / 20) * 100} size={56} />
                <div className="text-[11px] text-mut mt-1 text-center">
                  CAPA (20%)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <ScoreGauge
                  score={(score.habilitations / 15) * 100}
                  size={56}
                />
                <div className="text-[11px] text-mut mt-1 text-center">
                  Habilit. (15%)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <ScoreGauge score={(score.equipements / 15) * 100} size={56} />
                <div className="text-[11px] text-mut mt-1 text-center">
                  Équip. (15%)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <ScoreGauge score={(score.audits / 10) * 100} size={56} />
                <div className="text-[11px] text-mut mt-1 text-center">
                  Audits (10%)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <ScoreGauge
                  score={(score.reclamations / 10) * 100}
                  size={56}
                />
                <div className="text-[11px] text-mut mt-1 text-center">
                  Réclam. (10%)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <ScoreGauge score={(score.risques / 5) * 100} size={56} />
                <div className="text-[11px] text-mut mt-1 text-center">
                  Risques (5%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 KPI Cards */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut mb-4">
          INDICATEURS CLÉS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            icon={<DocIcon size={20} />}
            label="SOPs validées"
            value={`${sopsValides}/${sops.length}`}
            subtitle={`${sopsEnCours} en cours - ${sopsPlanifiees} planifiées`}
          />
          <KpiCard
            icon={<ZapIcon size={20} />}
            label="CAPA ouvertes"
            value={capasOuvertes}
            subtitle={`${capasEnRetard} en retard`}
            accent={capasEnRetard > 0 ? "amber" : "default"}
          />
          <KpiCard
            icon={<UsersIcon size={20} />}
            label="Habilitations"
            value={`${habilitationsPct}%`}
            subtitle={`${habilitationsExpiring} expirent sous 30j`}
          />
          <KpiCard
            icon={<ToolIcon size={20} />}
            label="Équipements conformes"
            value={`${equipementsPct}%`}
            subtitle={`${maintenanceDue} maintenance due`}
            accent={maintenanceDue > 0 ? "amber" : "default"}
          />
          <KpiCard
            icon={<SearchIcon size={20} />}
            label="Audits réalisés"
            value={`${auditsRealises}/${auditsPlanifies}`}
            subtitle={`Taux réalisation ${auditsTaux}%`}
          />
          <KpiCard
            icon={<MsgIcon size={20} />}
            label="Réclamations ouvertes"
            value={reclamationsOuvertes}
            subtitle={`${reclamationsPlus48h} > 48h`}
            accent={reclamationsPlus48h > 0 ? "amber" : "default"}
          />
        </div>
      </section>

      {/* Section Alertes actives */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut mb-4">
          ALERTES ACTIVES
        </h2>
        <div className="space-y-2">
          {alertsLoading ? (
            <div className="text-[12px] text-mut">Chargement...</div>
          ) : alerts.length === 0 ? (
            <div className="bg-card border border-brd rounded-md p-4 text-center text-[12px] text-mut">
              Aucune alerte active
            </div>
          ) : (
            alerts.slice(0, 5).map((alert) => (
              <AlertLine
                key={alert.id}
                severity={alert.severity === "error" ? "red" : "amber"}
                message={alert.message}
                href={getAlertHref(alert)}
              />
            ))
          )}
        </div>
      </section>

      {/* Section Matrice santé 16 processus */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut mb-4">
          SANTÉ PAR PROCESSUS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.slice(0, 16).map((domain) => {
            const health = getDomaineHealth(domain.id);
            const barColor =
              health === "ok"
                ? "bg-green-500"
                : health === "wip"
                ? "bg-amber-500"
                : health === "crit"
                ? "bg-red-500"
                : "bg-gray-400";
            return (
              <div
                key={domain.id}
                className="bg-card border border-brd rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Colored indicator bar at top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] ${barColor}`}
                />
                <div>
                  <div className="text-[14px] font-semibold text-text leading-tight">
                    {domain.name}
                  </div>
                  <div className="text-[11px] text-mut mt-1">
                    {domain.process_type}
                  </div>
                </div>
                <div className="mb-1">
                  <Badge variant={health}>
                    {health === "ok"
                      ? "Conforme"
                      : health === "wip"
                      ? "Attention"
                      : "Action"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Graphique tendance */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut mb-4">
          TENDANCE SCORE SMQ
        </h2>
        <div className="bg-card border border-brd rounded-md p-6">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="var(--mut)"
                style={{ fontSize: "11px" }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--mut)"
                style={{ fontSize: "11px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--brd)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
