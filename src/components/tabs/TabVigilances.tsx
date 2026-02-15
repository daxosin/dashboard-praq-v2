"use client";

import React, { useState, useMemo } from "react";
import {
  KpiCard,
  DataTable,
  EditableCell,
  AddButton,
  Modal,
  ConfirmDelete,
  AlertLine,
  Badge,
  type ColumnDef,
  type EditableCellType,
} from "@/components/ui";
import { ShieldIcon, TriangleIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Vigilance, Recall, Domain } from "@/lib/database.types";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

type VigilanceWithDomain = Vigilance & { domain?: Domain };
type RecallExtended = Recall;

const VIGILANCE_TYPES = ["Pharmacovigilance", "Matériovigilance", "Cosmétovigilance", "Nutrivigilance"];
const SEVERITY_OPTIONS = ["Mineure", "Modérée", "Grave"];
const STATUS_OPTIONS = ["Ouverte", "En cours", "Clôturée"];
const RECALL_STATUS_OPTIONS = ["Ouvert", "En cours", "Clôturé"];

export default function TabVigilances() {
  const { data: vigilances, loading: loadingVigilances, create: createVigilance, update: updateVigilance, remove: removeVigilance } = useSupabaseCrud<VigilanceWithDomain>("vigilances", {
    select: "*, domain:domains(*)",
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: recalls, loading: loadingRecalls, create: createRecall, update: updateRecall, remove: removeRecall } = useSupabaseCrud<RecallExtended>("recalls", {
    orderBy: { column: "created_at", ascending: false },
  });

  const { data: domains } = useSupabaseCrud<Domain>("domains");

  const [showVigilanceModal, setShowVigilanceModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [deleteVigilanceId, setDeleteVigilanceId] = useState<string | null>(null);
  const [deleteRecallId, setDeleteRecallId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDeclaredAnsm, setFilterDeclaredAnsm] = useState<string>("all");

  const [newVigilance, setNewVigilance] = useState({
    type: "Pharmacovigilance",
    product: "",
    lot: "",
    severity: "Mineure",
    declared_ansm: false,
    ansm_ref: "",
    measures: "",
    status: "Ouverte",
  });

  const [newRecall, setNewRecall] = useState({
    source: "",
    product: "",
    lots: "",
    action: "",
    quantity: "",
    status: "Ouvert",
  });

  // KPI calculations
  const totalVigilances = vigilances.length;
  const graveCount = vigilances.filter((v) => v.severity === "Grave").length;
  const declaredAnsmPercentage = graveCount > 0 ? Math.round((vigilances.filter((v) => v.severity === "Grave" && v.declared_ansm).length / graveCount) * 100) : 0;
  const activeRecalls = recalls.filter((r) => r.status !== "Clôturé").length;

  // Filtered vigilances
  const filteredVigilances = useMemo(() => {
    return vigilances.filter((v) => {
      if (filterType !== "all" && v.type !== filterType) return false;
      if (filterSeverity !== "all" && v.severity !== filterSeverity) return false;
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      if (filterDeclaredAnsm === "yes" && !v.declared_ansm) return false;
      if (filterDeclaredAnsm === "no" && v.declared_ansm) return false;
      return true;
    });
  }, [vigilances, filterType, filterSeverity, filterStatus, filterDeclaredAnsm]);

  // Alerts: grave vigilances not declared to ANSM
  const undeclaredGrave = vigilances.filter((v) => v.severity === "Grave" && !v.declared_ansm);

  // Chart data
  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    vigilances.forEach((v) => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vigilances]);

  const severityChartData = useMemo(() => {
    const counts: Record<string, number> = { Mineure: 0, Modérée: 0, Grave: 0 };
    vigilances.forEach((v) => {
      if (v.severity) counts[v.severity] = (counts[v.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vigilances]);

  const COLORS = ["var(--color-accent)", "var(--color-text-secondary)", "var(--color-border)", "var(--color-muted)"];

  // Vigilance columns
  const vigilanceColumns: ColumnDef<VigilanceWithDomain>[] = [
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <EditableCell
          value={row.type}
          type="select"
          options={VIGILANCE_TYPES.map(v => ({ value: v, label: v }))}
          onSave={(value) => updateVigilance(row.id, { type: String(value) })}
        />
      ),
    },
    {
      key: "product",
      label: "Produit",
      render: (row) => (
        <EditableCell
          value={row.product || ""}
          type="text"
          onSave={(value) => updateVigilance(row.id, { product: String(value) })}
        />
      ),
    },
    {
      key: "lot",
      label: "Lot",
      render: (row) => (
        <EditableCell
          value={row.lot || ""}
          type="text"
          onSave={(value) => updateVigilance(row.id, { lot: String(value) })}
        />
      ),
    },
    {
      key: "severity",
      label: "Gravité",
      render: (row) => (
        <EditableCell
          value={row.severity || "Mineure"}
          type="select"
          options={SEVERITY_OPTIONS.map(v => ({ value: v, label: v }))}
          onSave={(value) => updateVigilance(row.id, { severity: String(value) })}
        />
      ),
    },
    {
      key: "declared_ansm",
      label: "Déclaré ANSM",
      render: (row) => (
        <EditableCell
          value={row.declared_ansm ? "Oui" : "Non"}
          type="select"
          options={["Oui", "Non"].map(v => ({ value: v, label: v }))}
          onSave={(value) => updateVigilance(row.id, { declared_ansm: value === "Oui" })}
        />
      ),
    },
    {
      key: "ansm_ref",
      label: "Référence ANSM",
      render: (row) => (
        <EditableCell
          value={row.ansm_ref || ""}
          type="text"
          onSave={(value) => updateVigilance(row.id, { ansm_ref: String(value) })}
        />
      ),
    },
    {
      key: "measures",
      label: "Mesures prises",
      render: (row) => (
        <EditableCell
          value={row.measures || ""}
          type="text"
          onSave={(value) => updateVigilance(row.id, { measures: String(value) })}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (row) => (
        <EditableCell
          value={row.status}
          type="select"
          options={STATUS_OPTIONS.map(v => ({ value: v, label: v }))}
          onSave={(value) => updateVigilance(row.id, { status: String(value) })}
        />
      ),
    },
    {
      key: "capa_id",
      label: "CAPA",
      render: (row) =>
        row.capa_id ? (
          <Link href="/dashboard/capa" className="text-xs" style={{ color: "var(--color-accent)" }}>
            Voir CAPA
          </Link>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            -
          </span>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={() => setDeleteVigilanceId(row.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-red)" }}
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  // Recall columns
  const recallColumns: ColumnDef<RecallExtended>[] = [
    {
      key: "source",
      label: "Source",
      render: (row) => (
        <EditableCell
          value={row.source}
          type="text"
          onSave={(value) => updateRecall(row.id, { source: String(value) })}
        />
      ),
    },
    {
      key: "product",
      label: "Produit",
      render: (row) => (
        <EditableCell
          value={row.product}
          type="text"
          onSave={(value) => updateRecall(row.id, { product: String(value) })}
        />
      ),
    },
    {
      key: "lots",
      label: "Lots",
      render: (row) => (
        <EditableCell
          value={row.lots || ""}
          type="text"
          onSave={(value) => updateRecall(row.id, { lots: String(value) })}
        />
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <EditableCell
          value={row.action}
          type="text"
          onSave={(value) => updateRecall(row.id, { action: String(value) })}
        />
      ),
    },
    {
      key: "quantity",
      label: "Quantité",
      render: (row) => (
        <EditableCell
          value={row.quantity || ""}
          type="text"
          onSave={(value) => updateRecall(row.id, { quantity: String(value) })}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (row) => (
        <EditableCell
          value={row.status}
          type="select"
          options={RECALL_STATUS_OPTIONS.map(v => ({ value: v, label: v }))}
          onSave={(value) => updateRecall(row.id, { status: String(value) })}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={() => setDeleteRecallId(row.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-red)" }}
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const handleCreateVigilance = async () => {
    try {
      await createVigilance(newVigilance);
      setShowVigilanceModal(false);
      setNewVigilance({
        type: "Pharmacovigilance",
        product: "",
        lot: "",
        severity: "Mineure",
        declared_ansm: false,
        ansm_ref: "",
        measures: "",
        status: "Ouverte",
      });
    } catch (error) {
      console.error("Error creating vigilance:", error);
    }
  };

  const handleCreateRecall = async () => {
    try {
      await createRecall(newRecall);
      setShowRecallModal(false);
      setNewRecall({
        source: "",
        product: "",
        lots: "",
        action: "",
        quantity: "",
        status: "Ouvert",
      });
    } catch (error) {
      console.error("Error creating recall:", error);
    }
  };

  const handleDeleteVigilance = async () => {
    if (deleteVigilanceId) {
      try {
        await removeVigilance(deleteVigilanceId);
        setDeleteVigilanceId(null);
      } catch (error) {
        console.error("Error deleting vigilance:", error);
      }
    }
  };

  const handleDeleteRecall = async () => {
    if (deleteRecallId) {
      try {
        await removeRecall(deleteRecallId);
        setDeleteRecallId(null);
      } catch (error) {
        console.error("Error deleting recall:", error);
      }
    }
  };

  return (
    <div className="p-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          icon={<ShieldIcon size={20} />}
          label="Total signalements"
          value={totalVigilances.toString()}
          subtitle="Toutes vigilances confondues"
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Graves"
          value={graveCount.toString()}
          subtitle="Gravité élevée"
          accent="amber"
        />
        <KpiCard
          icon={<ShieldIcon size={20} />}
          label="Déclarés ANSM"
          value={`${declaredAnsmPercentage}%`}
          subtitle={`Sur ${graveCount} graves`}
        />
        <KpiCard
          icon={<TriangleIcon size={20} />}
          label="Rappels actifs"
          value={activeRecalls.toString()}
          subtitle="Non clôturés"
        />
      </div>

      {/* Alerts */}
      {undeclaredGrave.length > 0 && (
        <div className="mb-6 space-y-2">
          {undeclaredGrave.map((v) => (
            <AlertLine
              key={v.id}
              severity="red"
              message={`Vigilance grave non déclarée ANSM: ${v.product || "Produit inconnu"} (${v.type})`}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
            Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded text-sm border"
            style={{
              backgroundColor: "var(--color-card)",
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
            }}
          >
            <option value="all">Tous</option>
            {VIGILANCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
            Gravité
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 rounded text-sm border"
            style={{
              backgroundColor: "var(--color-card)",
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
            }}
          >
            <option value="all">Toutes</option>
            {SEVERITY_OPTIONS.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
            Statut
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded text-sm border"
            style={{
              backgroundColor: "var(--color-card)",
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
            }}
          >
            <option value="all">Tous</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
            Déclaré ANSM
          </label>
          <select
            value={filterDeclaredAnsm}
            onChange={(e) => setFilterDeclaredAnsm(e.target.value)}
            className="px-3 py-2 rounded text-sm border"
            style={{
              backgroundColor: "var(--color-card)",
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
            }}
          >
            <option value="all">Tous</option>
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </div>
      </div>

      {/* Vigilances Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            Signalements de vigilance
          </h2>
          <AddButton onClick={() => setShowVigilanceModal(true)} label="Nouveau signalement" />
        </div>
        <DataTable columns={vigilanceColumns} data={filteredVigilances} />
      </div>

      {/* Recalls Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            Retraits et Rappels
          </h2>
          <AddButton onClick={() => setShowRecallModal(true)} label="Nouveau rappel" />
        </div>
        <DataTable columns={recallColumns} data={recalls} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            Répartition par type
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {typeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            Répartition par gravité
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityChartData}>
              <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }} />
              <Bar dataKey="value" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vigilance Modal */}
      <Modal isOpen={showVigilanceModal} onClose={() => setShowVigilanceModal(false)} title="Nouveau signalement de vigilance">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Type
            </label>
            <select
              value={newVigilance.type}
              onChange={(e) => setNewVigilance({ ...newVigilance, type: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              {VIGILANCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Produit
            </label>
            <input
              type="text"
              value={newVigilance.product}
              onChange={(e) => setNewVigilance({ ...newVigilance, product: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Lot
            </label>
            <input
              type="text"
              value={newVigilance.lot}
              onChange={(e) => setNewVigilance({ ...newVigilance, lot: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Gravité
            </label>
            <select
              value={newVigilance.severity}
              onChange={(e) => setNewVigilance({ ...newVigilance, severity: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              {SEVERITY_OPTIONS.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Déclaré ANSM
            </label>
            <select
              value={newVigilance.declared_ansm ? "Oui" : "Non"}
              onChange={(e) => setNewVigilance({ ...newVigilance, declared_ansm: e.target.value === "Oui" })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              <option value="Non">Non</option>
              <option value="Oui">Oui</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Référence ANSM
            </label>
            <input
              type="text"
              value={newVigilance.ansm_ref}
              onChange={(e) => setNewVigilance({ ...newVigilance, ansm_ref: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Mesures prises
            </label>
            <textarea
              value={newVigilance.measures}
              onChange={(e) => setNewVigilance({ ...newVigilance, measures: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowVigilanceModal(false)}
              className="px-4 py-2 rounded text-sm"
              style={{
                backgroundColor: "var(--color-elevation)",
                color: "var(--color-text)",
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleCreateVigilance}
              className="px-4 py-2 rounded text-sm font-semibold"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Recall Modal */}
      <Modal isOpen={showRecallModal} onClose={() => setShowRecallModal(false)} title="Nouveau retrait/rappel">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Source
            </label>
            <input
              type="text"
              value={newRecall.source}
              onChange={(e) => setNewRecall({ ...newRecall, source: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Produit
            </label>
            <input
              type="text"
              value={newRecall.product}
              onChange={(e) => setNewRecall({ ...newRecall, product: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Lots
            </label>
            <input
              type="text"
              value={newRecall.lots}
              onChange={(e) => setNewRecall({ ...newRecall, lots: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Action
            </label>
            <input
              type="text"
              value={newRecall.action}
              onChange={(e) => setNewRecall({ ...newRecall, action: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Quantité
            </label>
            <input
              type="text"
              value={newRecall.quantity}
              onChange={(e) => setNewRecall({ ...newRecall, quantity: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: "var(--color-text-secondary)", letterSpacing: "1.8px" }}>
              Statut
            </label>
            <select
              value={newRecall.status}
              onChange={(e) => setNewRecall({ ...newRecall, status: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm border"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              {RECALL_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowRecallModal(false)}
              className="px-4 py-2 rounded text-sm"
              style={{
                backgroundColor: "var(--color-elevation)",
                color: "var(--color-text)",
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleCreateRecall}
              className="px-4 py-2 rounded text-sm font-semibold"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Vigilance */}
      <ConfirmDelete
        isOpen={deleteVigilanceId !== null}
        onCancel={() => setDeleteVigilanceId(null)}
        onConfirm={handleDeleteVigilance}
        itemName="ce signalement de vigilance"
      />

      {/* Confirm Delete Recall */}
      <ConfirmDelete
        isOpen={deleteRecallId !== null}
        onCancel={() => setDeleteRecallId(null)}
        onConfirm={handleDeleteRecall}
        itemName="ce retrait/rappel"
      />
    </div>
  );
}
