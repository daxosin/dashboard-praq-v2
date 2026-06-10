"use client";

import React from "react";
import { useAlerts } from "@/lib/hooks/useAlerts";
import { useSmqScore } from "@/lib/hooks/useSmqScore";
import { usePhsqLatest } from "@/lib/hooks/usePhsqLatest";
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
import type {
  Processus,
  Sop,
  Capa,
  Habilitation,
  Equipement,
  Maintenance,
  Audit,
  Reclamation,
  KpiHistory,
} from "@/lib/db-rows";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DAY_MS = 1000 * 60 * 60 * 24;

export const TabTableauDeBord: React.FC = () => {
  const { alerts, loading: alertsLoading } = useAlerts();
  const { score, loading: scoreLoading } = useSmqScore("GLOBAL");
  const { snapshot: phsq } = usePhsqLatest();
  const { data: processus } = useSupabaseCrud<Processus>("processus", {
    orderBy: { column: "code", ascending: true },
  });
  const { data: sops } = useSupabaseCrud<Sop>("sops");
  const { data: capas } = useSupabaseCrud<Capa>("capa");
  const { data: habilitations } = useSupabaseCrud<Habilitation>("habilitations");
  const { data: equipements } = useSupabaseCrud<Equipement>("equipements");
  const { data: maintenance } = useSupabaseCrud<Maintenance>("maintenance");
  const { data: audits } = useSupabaseCrud<Audit>("audits");
  const { data: reclamations } = useSupabaseCrud<Reclamation>("reclamations");
  const { data: kpiHistory } = useSupabaseCrud<KpiHistory>("kpi_history", {
    filters: { perimetre: "GLOBAL" },
    orderBy: { column: "date_calcul", ascending: true },
  });

  // Calculs KPI (enums réels du schéma prod)
  const sopsEnVigueur = sops.filter((s) => s.statut === "EN_VIGUEUR").length;
  const sopsBrouillon = sops.filter((s) => s.statut === "BROUILLON").length;
  const sopsAReviser = sops.filter(
    (s) => s.statut === "A_REVISER" || s.statut === "EXPIREE"
  ).length;

  const capasOuvertes = capas.filter((c) => c.statut !== "CLOSE").length;
  const capasEnRetard = capas.filter(
    (c) =>
      c.statut !== "CLOSE" &&
      c.date_echeance &&
      new Date(c.date_echeance) < new Date()
  ).length;

  const habilitationsValides = habilitations.filter(
    (h) => h.statut === "VALIDE"
  ).length;
  const habilitationsPct =
    habilitations.length > 0
      ? Math.round((habilitationsValides / habilitations.length) * 100)
      : 0;
  const habilitationsExpiring = habilitations.filter((h) => {
    if (!h.date_expiration) return false;
    const days = (new Date(h.date_expiration).getTime() - Date.now()) / DAY_MS;
    return days > 0 && days <= 30;
  }).length;

  const equipementsConformes = equipements.filter(
    (e) => e.statut === "CONFORME"
  ).length;
  const equipementsPct =
    equipements.length > 0
      ? Math.round((equipementsConformes / equipements.length) * 100)
      : 0;
  const maintenanceDue = maintenance.filter(
    (m) =>
      m.statut === "PLANIFIEE" &&
      m.date_planifiee &&
      new Date(m.date_planifiee) < new Date()
  ).length;

  const auditsRealises = audits.filter((a) => a.statut === "REALISE").length;
  const auditsTotal = audits.filter((a) => a.statut !== "ANNULE").length;
  const auditsTaux =
    auditsTotal > 0 ? Math.round((auditsRealises / auditsTotal) * 100) : 0;

  const reclamationsOuvertes = reclamations.filter(
    (r) => r.statut === "OUVERTE" || r.statut === "EN_COURS"
  ).length;
  const reclamationsPlus48h = reclamations.filter((r) => {
    if (r.statut === "CLOSE" || r.statut === "TRAITEE") return false;
    const ref = r.date_reception ?? r.created_at;
    if (!ref) return false;
    return (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60) > 48;
  }).length;

  // Matrice santé par processus (basée sur les SOPs rattachées)
  const getProcessusHealth = (
    processusId: string
  ): "ok" | "wip" | "crit" | "plan" => {
    const procSops = sops.filter((s) => s.processus_id === processusId);
    if (procSops.length === 0) return "plan";

    const validPct =
      (procSops.filter((s) => s.statut === "EN_VIGUEUR").length /
        procSops.length) *
      100;

    if (validPct >= 70) return "ok";
    if (validPct >= 40) return "wip";
    return "crit";
  };

  // Tendance réelle du score SMQ depuis kpi_history
  const trendData = kpiHistory
    .filter((k) => k.score_global !== null)
    .map((k) => ({
      date: new Date(k.date_calcul).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      score: k.score_global as number,
    }));
  if (
    trendData.length === 0 ||
    (score.scoreGlobal > 0 &&
      trendData[trendData.length - 1]?.score !== score.scoreGlobal)
  ) {
    trendData.push({ date: "Auj.", score: score.scoreGlobal });
  }

  // Mapping alertes vers onglets
  const getAlertHref = (alert: { source_table: string }): string => {
    const sourceMap: Record<string, string> = {
      capa: "/dashboard/capa",
      sops: "/dashboard/documents",
      habilitations: "/dashboard/formations",
      equipements: "/dashboard/equipements",
      reclamations: "/dashboard/reclamations",
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
            {/* Score principal (calculé côté base — kpi_smq_current_scoped) */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={score.scoreGlobal} size={80} />
              <div className="text-[11px] text-mut mt-2">
                {scoreLoading ? "Calcul..." : "Score global"}
              </div>
            </div>

            {/* Breakdown dynamique (pondérations smq_config) */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              {score.breakdown.map((c) => (
                <div key={c.code} className="flex flex-col items-center">
                  <ScoreGauge score={c.value ?? 0} size={56} />
                  <div className="text-[11px] text-mut mt-1 text-center">
                    {c.label} ({Math.round(c.weight * 100)}%)
                  </div>
                </div>
              ))}
              {!scoreLoading && score.breakdown.length === 0 && (
                <div className="text-[12px] text-mut col-span-full">
                  Aucune composante active
                </div>
              )}
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
            label="SOPs en vigueur"
            value={`${sopsEnVigueur}/${sops.length}`}
            subtitle={`${sopsBrouillon} brouillons - ${sopsAReviser} à réviser`}
            accent={sopsAReviser > 0 ? "amber" : "default"}
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
            label="Habilitations valides"
            value={`${habilitationsPct}%`}
            subtitle={`${habilitationsExpiring} expirent sous 30j`}
            accent={habilitationsExpiring > 0 ? "amber" : "default"}
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
            value={`${auditsRealises}/${auditsTotal}`}
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

      {/* Section PHSQ (pharma-systeme-qualite.fr — dernier scraping) */}
      {phsq && (
        <section>
          <h2 className="text-[12px] uppercase tracking-[1.8px] font-semibold text-mut mb-4">
            PHSQ — DERNIER RELEVÉ (
            {new Date(phsq.date_scraping).toLocaleDateString("fr-FR")})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={<ZapIcon size={20} />}
              label="CAPA PHSQ ouvertes"
              value={phsq.capa_ouvertes ?? 0}
              subtitle={`${phsq.capa_en_retard ?? 0} en retard${
                phsq.capa_delai_moyen_jours
                  ? ` - délai moyen ${phsq.capa_delai_moyen_jours}j`
                  : ""
              }`}
              accent={(phsq.capa_en_retard ?? 0) > 0 ? "amber" : "default"}
            />
            <KpiCard
              icon={<MsgIcon size={20} />}
              label="Dysfonctionnements"
              value={phsq.dysfonctionnements_ouverts ?? 0}
              subtitle={`${phsq.dysfonctionnements_clos ?? 0} clos`}
              accent={
                (phsq.dysfonctionnements_ouverts ?? 0) > 0 ? "amber" : "default"
              }
            />
            <KpiCard
              icon={<DocIcon size={20} />}
              label="Fiches progrès"
              value={phsq.fiches_progres_ouvertes ?? 0}
              subtitle="ouvertes"
            />
            <KpiCard
              icon={<UsersIcon size={20} />}
              label="Formations PHSQ"
              value={`${phsq.formations_a_jour ?? 0}/${phsq.formations_total ?? 0}`}
              subtitle="à jour"
            />
          </div>
        </section>
      )}

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
            alerts.slice(0, 8).map((alert) => (
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
          {processus.slice(0, 16).map((proc) => {
            const health = getProcessusHealth(proc.id);
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
                key={proc.id}
                className="bg-card border border-brd rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Colored indicator bar at top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] ${barColor}`}
                />
                <div>
                  <div className="text-[14px] font-semibold text-text leading-tight">
                    {proc.nom}
                  </div>
                  <div className="text-[11px] text-mut mt-1">{proc.code}</div>
                </div>
                <div className="mb-1">
                  <Badge variant={health}>
                    {health === "ok"
                      ? "Conforme"
                      : health === "wip"
                      ? "Attention"
                      : health === "crit"
                      ? "Action"
                      : "À documenter"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Graphique tendance (kpi_history réel) */}
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
                dataKey="date"
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
