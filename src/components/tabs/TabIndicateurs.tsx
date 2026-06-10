"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type {
  Indicateur,
  IndicateurInsert,
  IndicateurValeur,
  IndicateurValeurInsert,
} from "@/lib/db-rows";
import {
  KpiCard,
  Badge,
  DataTable,
  EditableCell,
  AddButton,
  Modal,
} from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import { BarChartIcon } from "@/components/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type IndicateurEnrichi = Indicateur & {
  values?: IndicateurValeur[];
  currentValue?: number;
  lastDate?: string;
  trend?: "up" | "down" | "stable";
  meetsTarget?: boolean;
};

const DIRECTION_OPTIONS: { value: Indicateur["direction"]; label: string }[] = [
  { value: "above", label: "Au-dessus de la cible" },
  { value: "below", label: "En dessous de la cible" },
  { value: "between", label: "Entre les bornes" },
];

const FREQUENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "QUOT", label: "Quotidienne" },
  { value: "HEBDO", label: "Hebdomadaire" },
  { value: "MENS", label: "Mensuelle" },
  { value: "TRIM", label: "Trimestrielle" },
  { value: "ANNU", label: "Annuelle" },
];

const directionArrow = (direction: string): string =>
  direction === "above" ? "↑" : direction === "below" ? "↓" : "↔";

/** Une valeur atteint-elle la cible de son indicateur ? */
const computeAtteint = (
  ind: Indicateur,
  valeur: number
): boolean | undefined => {
  if (ind.direction === "above")
    return ind.cible != null ? valeur >= ind.cible : undefined;
  if (ind.direction === "below")
    return ind.cible != null ? valeur <= ind.cible : undefined;
  if (ind.direction === "between")
    return ind.borne_basse != null && ind.borne_haute != null
      ? valeur >= ind.borne_basse && valeur <= ind.borne_haute
      : undefined;
  return undefined;
};

/** Cible affichable selon la direction. */
const cibleLabel = (ind: Indicateur): string => {
  if (ind.direction === "between") {
    if (ind.borne_basse != null && ind.borne_haute != null) {
      return `${ind.borne_basse} – ${ind.borne_haute} ${ind.unite || ""}`.trim();
    }
    return "-";
  }
  return ind.cible != null ? `${ind.cible} ${ind.unite || ""}`.trim() : "-";
};

export function TabIndicateurs() {
  const [selectedIndicateur, setSelectedIndicateur] = useState<string | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [newIndicateur, setNewIndicateur] = useState({
    code: "",
    libelle: "",
    cible: 0,
    borne_basse: 0,
    borne_haute: 0,
    unite: "%",
    direction: "above" as "above" | "below" | "between",
    frequence: "MENS",
  });
  const [newValue, setNewValue] = useState({
    indicateur_id: "",
    date_calcul: "",
    valeur: 0,
    commentaire: "",
  });

  const {
    data: indicateurs,
    loading: loadingIndicateurs,
    create: createIndicateur,
  } = useSupabaseCrud<Indicateur>("indicateurs", {
    orderBy: { column: "ordre", ascending: true },
  });

  const {
    data: indicateurValeurs,
    loading: loadingValeurs,
    create: createValeur,
    update: updateValeur,
  } = useSupabaseCrud<IndicateurValeur>("indicateurs_valeurs", {
    orderBy: { column: "date_calcul", ascending: false },
  });

  // Enrichir les indicateurs avec leurs valeurs
  const enrichedIndicateurs: IndicateurEnrichi[] = useMemo(() => {
    return indicateurs.map((ind) => {
      const values = indicateurValeurs.filter(
        (v) => v.indicateur_id === ind.id
      );
      const sortedValues = [...values].sort(
        (a, b) =>
          new Date(b.date_calcul).getTime() -
          new Date(a.date_calcul).getTime()
      );
      const latest = sortedValues[0];
      const previous = sortedValues[1];

      let trend: "up" | "down" | "stable" = "stable";
      if (latest && previous) {
        if (latest.valeur > previous.valeur) trend = "up";
        else if (latest.valeur < previous.valeur) trend = "down";
      }

      const meetsTarget = latest
        ? latest.atteint ?? computeAtteint(ind, latest.valeur)
        : undefined;

      return {
        ...ind,
        values,
        currentValue: latest?.valeur,
        lastDate: latest?.date_calcul,
        trend,
        meetsTarget: meetsTarget ?? false,
      };
    });
  }, [indicateurs, indicateurValeurs]);

  // KPI: Indicateurs conformes %
  const conformeCount = enrichedIndicateurs.filter(
    (i) => i.meetsTarget
  ).length;
  const conformePercent =
    indicateurs.length > 0
      ? ((conformeCount / indicateurs.length) * 100).toFixed(0)
      : "0";

  // KPI: Tendance globale
  const trendUp = enrichedIndicateurs.filter((i) => i.trend === "up").length;
  const trendDown = enrichedIndicateurs.filter(
    (i) => i.trend === "down"
  ).length;
  const globalTrend =
    trendUp > trendDown
      ? "Amélioration"
      : trendUp < trendDown
      ? "Dégradation"
      : "Stable";

  // Filtres
  const filteredIndicateurs = enrichedIndicateurs.filter((ind) => {
    if (selectedIndicateur && ind.id !== selectedIndicateur) return false;
    return true;
  });

  // Générer les 12 derniers mois pour les graphiques
  const getLast12Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      months.push(period);
    }
    return months;
  };

  const last12Months = getLast12Months();

  // Valeur d'un indicateur pour un mois donné (date_calcul = date ISO)
  const findValueForMonth = (
    indicateurId: string,
    month: string
  ): IndicateurValeur | undefined =>
    indicateurValeurs.find(
      (v) =>
        v.indicateur_id === indicateurId && v.date_calcul.startsWith(month)
    );

  // DataTable pour saisie mensuelle
  const monthColumns: ColumnDef<IndicateurEnrichi>[] = [
    {
      key: "libelle",
      label: "Indicateur",
      render: (row) => (
        <span className="font-medium text-text">{row.libelle}</span>
      ),
    },
    ...last12Months.map((month) => ({
      key: month,
      label: month,
      render: (row: IndicateurEnrichi) => {
        const valueRecord = findValueForMonth(row.id, month);
        return (
          <EditableCell
            type="number"
            value={valueRecord?.valeur ?? ""}
            onSave={async (newVal) => {
              const numVal = Number(newVal);
              if (valueRecord) {
                await updateValeur(valueRecord.id, { valeur: numVal });
              } else {
                const payload: IndicateurValeurInsert = {
                  indicateur_id: row.id,
                  date_calcul: `${month}-01`,
                  valeur: numVal,
                };
                await createValeur(payload as Partial<IndicateurValeur>);
              }
            }}
          />
        );
      },
    })),
  ];

  // DataTable récapitulative
  const summaryColumns: ColumnDef<IndicateurEnrichi>[] = [
    {
      key: "libelle",
      label: "Indicateur",
      render: (row) => (
        <span className="font-medium text-text">{row.libelle}</span>
      ),
    },
    {
      key: "currentValue",
      label: "Valeur actuelle",
      render: (row) => (
        <span className="text-text">
          {row.currentValue !== undefined
            ? `${row.currentValue.toFixed(2)} ${row.unite || ""}`.trim()
            : "-"}
        </span>
      ),
    },
    {
      key: "cible",
      label: "Objectif",
      render: (row) => <span className="text-mut">{cibleLabel(row)}</span>,
    },
    {
      key: "ecart",
      label: "Écart",
      render: (row) => {
        if (row.currentValue === undefined || row.cible == null)
          return <span>-</span>;
        const ecart = row.currentValue - row.cible;
        const isGood =
          (row.direction === "above" && ecart >= 0) ||
          (row.direction === "below" && ecart <= 0) ||
          (row.direction === "between" && row.meetsTarget);
        return (
          <span className={isGood ? "text-grn" : "text-red"}>
            {ecart > 0 ? "+" : ""}
            {ecart.toFixed(2)} {row.unite || ""}
          </span>
        );
      },
    },
    {
      key: "trend",
      label: "Tendance",
      render: (row) => {
        const trendLabel =
          row.trend === "up"
            ? "↗ Hausse"
            : row.trend === "down"
            ? "↘ Baisse"
            : "→ Stable";
        return <span className="text-sec">{trendLabel}</span>;
      },
    },
    {
      key: "meetsTarget",
      label: "Statut",
      render: (row) => (
        <Badge variant={row.meetsTarget ? "ok" : "crit"}>
          {row.meetsTarget ? "Conforme" : "Non conforme"}
        </Badge>
      ),
    },
  ];

  const handleAddIndicateur = async () => {
    if (!newIndicateur.code.trim() || !newIndicateur.libelle.trim()) return;
    try {
      const payload: IndicateurInsert = {
        code: newIndicateur.code.trim().toUpperCase(),
        libelle: newIndicateur.libelle.trim(),
        direction: newIndicateur.direction,
        frequence: newIndicateur.frequence,
        unite: newIndicateur.unite || null,
        cible:
          newIndicateur.direction === "between" ? null : newIndicateur.cible,
        borne_basse:
          newIndicateur.direction === "between"
            ? newIndicateur.borne_basse
            : null,
        borne_haute:
          newIndicateur.direction === "between"
            ? newIndicateur.borne_haute
            : null,
      };
      await createIndicateur(payload as Partial<Indicateur>);
      setShowAddModal(false);
      setNewIndicateur({
        code: "",
        libelle: "",
        cible: 0,
        borne_basse: 0,
        borne_haute: 0,
        unite: "%",
        direction: "above",
        frequence: "MENS",
      });
    } catch (err) {
      console.error("Erreur création indicateur:", err);
    }
  };

  const handleAddValue = async () => {
    if (!newValue.indicateur_id || !newValue.date_calcul) return;
    try {
      const payload: IndicateurValeurInsert = {
        indicateur_id: newValue.indicateur_id,
        date_calcul: newValue.date_calcul,
        valeur: newValue.valeur,
        commentaire: newValue.commentaire.trim() || null,
      };
      await createValeur(payload as Partial<IndicateurValeur>);
      setShowValueModal(false);
      setNewValue({
        indicateur_id: "",
        date_calcul: "",
        valeur: 0,
        commentaire: "",
      });
    } catch (err) {
      console.error("Erreur ajout valeur:", err);
    }
  };

  if (loadingIndicateurs || loadingValeurs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-mut">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          icon={<BarChartIcon size={20} />}
          label="Indicateurs conformes"
          value={`${conformePercent}%`}
          subtitle={`${conformeCount} / ${indicateurs.length} atteignent leur objectif`}
        />
        <KpiCard
          icon={<BarChartIcon size={20} />}
          label="Tendance globale"
          value={globalTrend}
          subtitle={`↗ ${trendUp} en amélioration • ↘ ${trendDown} en dégradation`}
        />
      </div>

      {/* Cartes des 8 premiers indicateurs qualité */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {enrichedIndicateurs.slice(0, 8).map((ind) => {
          const sparklineData = last12Months
            .map((month) => {
              const val = findValueForMonth(ind.id, month);
              return { month, value: val?.valeur || 0 };
            })
            .filter((d) => d.value > 0);

          return (
            <div
              key={ind.id}
              className="bg-card border border-brd rounded-xl p-6 hover:bg-elev transition-colors duration-200"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-mut mb-2">
                {ind.libelle}
              </p>
              <p className="text-[24px] font-bold text-text mb-1">
                {ind.currentValue !== undefined
                  ? `${ind.currentValue.toFixed(2)} ${ind.unite || ""}`.trim()
                  : "-"}
              </p>
              <p className="text-[11px] text-sec mb-2">
                Objectif: {cibleLabel(ind)} ({directionArrow(ind.direction)})
              </p>
              <Badge variant={ind.meetsTarget ? "ok" : "crit"}>
                {ind.meetsTarget ? "Conforme" : "Non conforme"}
              </Badge>
              {sparklineData.length > 1 && (
                <div className="mt-3 h-[40px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--accent)"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="flex gap-4 flex-wrap">
        <select
          className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          value={selectedIndicateur || ""}
          onChange={(e) => setSelectedIndicateur(e.target.value || null)}
        >
          <option value="">Tous les indicateurs</option>
          {indicateurs.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.libelle}
            </option>
          ))}
        </select>
      </div>

      {/* Saisie mensuelle */}
      <div>
        <h3 className="text-[18px] font-semibold text-text mb-3">
          Saisie mensuelle
        </h3>
        <div className="overflow-x-auto">
          <DataTable data={filteredIndicateurs} columns={monthColumns} />
        </div>
      </div>

      {/* Graphiques tendance */}
      <div>
        <h3 className="text-[18px] font-semibold text-text mb-3">
          Graphiques de tendance
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIndicateurs.map((ind) => {
            const chartData = last12Months.map((month) => {
              const val = findValueForMonth(ind.id, month);
              return {
                month: month.substring(5),
                value: val?.valeur ?? null,
                cible: ind.cible,
              };
            });

            const hasData = chartData.some((d) => d.value !== null);

            return (
              <div
                key={ind.id}
                className="bg-card border border-brd rounded-xl p-6"
              >
                <h4 className="text-[14px] font-semibold text-text mb-3">
                  {ind.libelle}
                </h4>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="var(--muted)"
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis
                        stroke="var(--muted)"
                        style={{ fontSize: "11px" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px" }}
                        iconSize={10}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={
                          ind.meetsTarget
                            ? "var(--success)"
                            : "var(--danger)"
                        }
                        strokeWidth={2}
                        name="Valeur"
                        dot={{ r: 3 }}
                      />
                      {ind.cible != null && (
                        <Line
                          type="monotone"
                          dataKey="cible"
                          stroke="var(--muted)"
                          strokeWidth={1.5}
                          strokeDasharray="5 5"
                          name="Objectif"
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-mut text-[12px]">
                      Aucune donnée disponible
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vue tableau récapitulative */}
      <div>
        <h3 className="text-[18px] font-semibold text-text mb-3">
          Vue récapitulative
        </h3>
        <DataTable data={filteredIndicateurs} columns={summaryColumns} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <AddButton
          onClick={() => setShowAddModal(true)}
          label="Nouvel indicateur"
        />
        <AddButton
          onClick={() => setShowValueModal(true)}
          label="Saisir valeur"
        />
      </div>

      {/* Modal ajout indicateur */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          title="Nouvel indicateur"
          onClose={() => setShowAddModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Code *
              </label>
              <input
                type="text"
                placeholder="Ex : TAUX-CONFORMITE-PDA"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicateur.code}
                onChange={(e) =>
                  setNewIndicateur({ ...newIndicateur, code: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Libellé *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicateur.libelle}
                onChange={(e) =>
                  setNewIndicateur({
                    ...newIndicateur,
                    libelle: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Direction
              </label>
              <select
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicateur.direction}
                onChange={(e) =>
                  setNewIndicateur({
                    ...newIndicateur,
                    direction: e.target.value as
                      | "above"
                      | "below"
                      | "between",
                  })
                }
              >
                {DIRECTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {newIndicateur.direction === "between" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-sec mb-2">
                    Borne basse
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    value={newIndicateur.borne_basse}
                    onChange={(e) =>
                      setNewIndicateur({
                        ...newIndicateur,
                        borne_basse: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-sec mb-2">
                    Borne haute
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    value={newIndicateur.borne_haute}
                    onChange={(e) =>
                      setNewIndicateur({
                        ...newIndicateur,
                        borne_haute: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Cible
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  value={newIndicateur.cible}
                  onChange={(e) =>
                    setNewIndicateur({
                      ...newIndicateur,
                      cible: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Unité
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  value={newIndicateur.unite}
                  onChange={(e) =>
                    setNewIndicateur({
                      ...newIndicateur,
                      unite: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-sec mb-2">
                  Fréquence
                </label>
                <select
                  className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  value={newIndicateur.frequence}
                  onChange={(e) =>
                    setNewIndicateur({
                      ...newIndicateur,
                      frequence: e.target.value,
                    })
                  }
                >
                  {FREQUENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddIndicateur}
                disabled={
                  !newIndicateur.code.trim() || !newIndicateur.libelle.trim()
                }
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal saisie valeur */}
      {showValueModal && (
        <Modal
          isOpen={showValueModal}
          title="Saisir valeur"
          onClose={() => setShowValueModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Indicateur
              </label>
              <select
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newValue.indicateur_id}
                onChange={(e) =>
                  setNewValue({ ...newValue, indicateur_id: e.target.value })
                }
              >
                <option value="">Sélectionner...</option>
                {indicateurs.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.libelle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Date de calcul
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newValue.date_calcul}
                onChange={(e) =>
                  setNewValue({ ...newValue, date_calcul: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Valeur
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newValue.valeur}
                onChange={(e) =>
                  setNewValue({ ...newValue, valeur: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Commentaire (optionnel)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newValue.commentaire}
                onChange={(e) =>
                  setNewValue({ ...newValue, commentaire: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
                onClick={() => setShowValueModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddValue}
                disabled={!newValue.indicateur_id || !newValue.date_calcul}
              >
                Ajouter
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
