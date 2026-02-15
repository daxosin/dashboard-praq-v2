"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Indicator, IndicatorValue } from "@/lib/database.types";
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

type IndicatorWithValues = Indicator & {
  values?: IndicatorValue[];
  currentValue?: number;
  lastPeriod?: string;
  trend?: "up" | "down" | "stable";
  meetsTarget?: boolean;
};

export function TabIndicateurs() {
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(
    null
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [newIndicator, setNewIndicator] = useState({
    label: "",
    target: 0,
    unit: "%",
    direction: "up" as "up" | "down",
    source_tab: "",
  });
  const [newValue, setNewValue] = useState({
    indicator_id: "",
    period: "",
    value: 0,
  });

  const {
    data: indicators,
    loading: loadingIndicators,
    create: createIndicator,
    update: updateIndicator,
    remove: removeIndicator,
  } = useSupabaseCrud<Indicator>("indicators", {
    orderBy: { column: "label", ascending: true },
  });

  const {
    data: indicatorValues,
    loading: loadingValues,
    create: createValue,
    update: updateValue,
    remove: removeValue,
  } = useSupabaseCrud<IndicatorValue>("indicator_values", {
    orderBy: { column: "period", ascending: false },
  });

  // Enrichir les indicateurs avec leurs valeurs
  const enrichedIndicators: IndicatorWithValues[] = useMemo(() => {
    return indicators.map((ind) => {
      const values = indicatorValues.filter(
        (v) => v.indicator_id === ind.id
      );
      const sortedValues = [...values].sort(
        (a, b) =>
          new Date(b.period).getTime() - new Date(a.period).getTime()
      );
      const latest = sortedValues[0];
      const previous = sortedValues[1];

      let trend: "up" | "down" | "stable" = "stable";
      if (latest && previous) {
        if (latest.value > previous.value) trend = "up";
        else if (latest.value < previous.value) trend = "down";
      }

      const meetsTarget =
        latest &&
        ((ind.direction === "up" && latest.value >= ind.target) ||
          (ind.direction === "down" && latest.value <= ind.target));

      return {
        ...ind,
        values,
        currentValue: latest?.value,
        lastPeriod: latest?.period,
        trend,
        meetsTarget,
      };
    });
  }, [indicators, indicatorValues]);

  // KPI: Indicateurs conformes %
  const conformeCount = enrichedIndicators.filter(
    (i) => i.meetsTarget
  ).length;
  const conformePercent =
    indicators.length > 0
      ? ((conformeCount / indicators.length) * 100).toFixed(0)
      : "0";

  // KPI: Tendance globale
  const trendUp = enrichedIndicators.filter((i) => i.trend === "up").length;
  const trendDown = enrichedIndicators.filter(
    (i) => i.trend === "down"
  ).length;
  const globalTrend =
    trendUp > trendDown
      ? "Amélioration"
      : trendUp < trendDown
      ? "Dégradation"
      : "Stable";

  // Filtres
  const filteredIndicators = enrichedIndicators.filter((ind) => {
    if (selectedIndicator && ind.id !== selectedIndicator) return false;
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

  // DataTable pour saisie mensuelle
  const monthColumns: ColumnDef<IndicatorWithValues>[] = [
    {
      key: "label",
      label: "Indicateur",
      render: (row) => (
        <span className="font-medium text-text">{row.label}</span>
      ),
    },
    ...last12Months.map((month) => ({
      key: month,
      label: month,
      render: (row: IndicatorWithValues) => {
        const valueRecord = indicatorValues.find(
          (v) => v.indicator_id === row.id && v.period === month
        );
        return (
          <EditableCell
            type="number"
            value={valueRecord?.value ?? ""}
            onSave={async (newVal) => {
              const numVal = Number(newVal);
              if (valueRecord) {
                await updateValue(valueRecord.id, { value: numVal });
              } else {
                await createValue({
                  indicator_id: row.id,
                  period: month,
                  value: numVal,
                  created_by: null,
                });
              }
            }}
          />
        );
      },
    })),
  ];

  // DataTable récapitulative
  const summaryColumns: ColumnDef<IndicatorWithValues>[] = [
    {
      key: "label",
      label: "Indicateur",
      render: (row) => (
        <span className="font-medium text-text">{row.label}</span>
      ),
    },
    {
      key: "currentValue",
      label: "Valeur actuelle",
      render: (row) => (
        <span className="text-text">
          {row.currentValue !== undefined
            ? `${row.currentValue.toFixed(2)} ${row.unit}`
            : "-"}
        </span>
      ),
    },
    {
      key: "target",
      label: "Objectif",
      render: (row) => (
        <span className="text-mut">
          {row.target} {row.unit}
        </span>
      ),
    },
    {
      key: "ecart",
      label: "Écart",
      render: (row) => {
        if (row.currentValue === undefined) return <span>-</span>;
        const ecart = row.currentValue - row.target;
        const isGood =
          (row.direction === "up" && ecart >= 0) ||
          (row.direction === "down" && ecart <= 0);
        return (
          <span
            className={
              isGood ? "text-grn" : "text-red"
            }
          >
            {ecart > 0 ? "+" : ""}
            {ecart.toFixed(2)} {row.unit}
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
        return (
          <span className="text-sec">{trendLabel}</span>
        );
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

  const handleAddIndicator = async () => {
    try {
      await createIndicator(newIndicator);
      setShowAddModal(false);
      setNewIndicator({
        label: "",
        target: 0,
        unit: "%",
        direction: "up",
        source_tab: "",
      });
    } catch (err) {
      console.error("Erreur création indicateur:", err);
    }
  };

  const handleAddValue = async () => {
    try {
      await createValue(newValue);
      setShowValueModal(false);
      setNewValue({ indicator_id: "", period: "", value: 0 });
    } catch (err) {
      console.error("Erreur ajout valeur:", err);
    }
  };

  if (loadingIndicators || loadingValues) {
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
          subtitle={`${conformeCount} / ${indicators.length} atteignent leur objectif`}
        />
        <KpiCard
          icon={<BarChartIcon size={20} />}
          label="Tendance globale"
          value={globalTrend}
          subtitle={`↗ ${trendUp} en amélioration • ↘ ${trendDown} en dégradation`}
        />
      </div>

      {/* Cartes des 8 indicateurs qualité */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {enrichedIndicators.slice(0, 8).map((ind) => {
          const sparklineData = last12Months
            .map((month) => {
              const val = indicatorValues.find(
                (v) => v.indicator_id === ind.id && v.period === month
              );
              return { month, value: val?.value || 0 };
            })
            .filter((d) => d.value > 0);

          return (
            <div
              key={ind.id}
              className="bg-card border border-brd rounded-xl p-6 hover:bg-elev transition-colors duration-200"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-mut mb-2">
                {ind.label}
              </p>
              <p className="text-[24px] font-bold text-text mb-1">
                {ind.currentValue !== undefined
                  ? `${ind.currentValue.toFixed(2)} ${ind.unit}`
                  : "-"}
              </p>
              <p className="text-[11px] text-sec mb-2">
                Objectif: {ind.target} {ind.unit} ({ind.direction === "up" ? "↑" : "↓"})
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
          value={selectedIndicator || ""}
          onChange={(e) => setSelectedIndicator(e.target.value || null)}
        >
          <option value="">Tous les indicateurs</option>
          {indicators.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.label}
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
          <DataTable
            data={filteredIndicators}
            columns={monthColumns}
          />
        </div>
      </div>

      {/* Graphiques tendance */}
      <div>
        <h3 className="text-[18px] font-semibold text-text mb-3">
          Graphiques de tendance
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIndicators.map((ind) => {
            const chartData = last12Months.map((month) => {
              const val = indicatorValues.find(
                (v) => v.indicator_id === ind.id && v.period === month
              );
              return {
                month: month.substring(5),
                value: val?.value || null,
                target: ind.target,
              };
            });

            const hasData = chartData.some((d) => d.value !== null);

            return (
              <div
                key={ind.id}
                className="bg-card border border-brd rounded-xl p-6"
              >
                <h4 className="text-[14px] font-semibold text-text mb-3">
                  {ind.label}
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
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="var(--muted)"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        name="Objectif"
                        dot={false}
                      />
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
        <DataTable
          data={filteredIndicators}
          columns={summaryColumns}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <AddButton onClick={() => setShowAddModal(true)} label="Nouvel indicateur" />
        <AddButton onClick={() => setShowValueModal(true)} label="Saisir valeur" />
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
                Libellé
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicator.label}
                onChange={(e) =>
                  setNewIndicator({ ...newIndicator, label: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Objectif
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicator.target}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
                    target: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Unité
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicator.unit}
                onChange={(e) =>
                  setNewIndicator({ ...newIndicator, unit: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Direction
              </label>
              <select
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicator.direction}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
                    direction: e.target.value as "up" | "down",
                  })
                }
              >
                <option value="up">Hausse (↑)</option>
                <option value="down">Baisse (↓)</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Source (optionnel)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newIndicator.source_tab || ""}
                onChange={(e) =>
                  setNewIndicator({
                    ...newIndicator,
                    source_tab: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90"
                onClick={handleAddIndicator}
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal saisie valeur */}
      {showValueModal && (
        <Modal isOpen={showValueModal} title="Saisir valeur" onClose={() => setShowValueModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Indicateur
              </label>
              <select
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newValue.indicator_id}
                onChange={(e) =>
                  setNewValue({ ...newValue, indicator_id: e.target.value })
                }
              >
                <option value="">Sélectionner...</option>
                {indicators.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-sec mb-2">
                Période (YYYY-MM)
              </label>
              <input
                type="text"
                placeholder="2026-02"
                className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                value={newValue.period}
                onChange={(e) =>
                  setNewValue({ ...newValue, period: e.target.value })
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
                value={newValue.value}
                onChange={(e) =>
                  setNewValue({ ...newValue, value: Number(e.target.value) })
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
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90"
                onClick={handleAddValue}
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
