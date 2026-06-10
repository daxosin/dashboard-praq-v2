"use client";

import React, { useState, useMemo } from "react";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import { useSupabase } from "@/app/providers";
import type {
  RevueDirection,
  RevueDirectionInsert,
  RevueAction,
  RevueActionInsert,
  StaffLite,
  Capa,
  Sop,
  Audit,
  Risque,
  Reclamation,
  Habilitation,
  Equipement,
  Indicateur,
  IndicateurValeur,
  Maintenance,
} from "@/lib/db-rows";
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
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Enum value <-> display label mapping (valeurs DB en UPPERCASE)    */
/* ------------------------------------------------------------------ */
const REVUE_STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "PLANIFIEE", label: "Planifiée" },
  { value: "EN_PREPARATION", label: "En préparation" },
  { value: "REALISEE", label: "Réalisée" },
  { value: "REPORTEE", label: "Reportée" },
  { value: "ANNULEE", label: "Annulée" },
];

const PERIMETRE_OPTIONS: { value: string; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "OFFICINE", label: "Officine" },
  { value: "PDA", label: "PDA" },
];

const ACTION_STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "PLANIFIE", label: "Planifiée" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINE", label: "Terminée" },
  { value: "EN_RETARD", label: "En retard" },
  { value: "ABANDONNE", label: "Abandonnée" },
];

const OPEN_ACTION_STATUTS = ["PLANIFIE", "EN_COURS", "EN_RETARD"];

const labelFor = (opts: { value: string; label: string }[], v: string | null): string =>
  opts.find((o) => o.value === v)?.label ?? String(v ?? "");

/** Forme du JSON snapshot_smq produit par kpi_smq_current_scoped(). */
type SmqSnapshot = {
  score_global?: number;
  active_components?: number;
  total_components?: number;
  calculated_at?: string;
};

const THEME_COLORS = {
  primary: "var(--accent)",
  grn: "var(--grn)",
  amb: "var(--amb)",
  red: "var(--red)",
  muted: "var(--text-muted)",
};

const CHART_COLORS = ["#00FF88", "#FFB800", "#FF4444", "#00CCFF", "#CC88FF", "#FF8844"];

const inputCls =
  "w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all";
const labelCls = "block text-[13px] font-semibold text-sec mb-2";

const fmtDate = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR");
};

const revueLabel = (r: RevueDirection): string =>
  `T${r.trimestre ?? "?"} ${r.annee} — ${labelFor(PERIMETRE_OPTIONS, r.perimetre)}`;

/* ================================================================== */
export function TabRevueDirection() {
  const supabase = useSupabase();

  // Revues de direction CRUD
  const {
    data: revues,
    loading: loadingRevues,
    create: createRevue,
    update: updateRevue,
    remove: removeRevue,
    refresh: refreshRevues,
  } = useSupabaseCrud<RevueDirection>("revue_direction", {
    orderBy: { column: "annee", ascending: false },
  });

  // Actions de revue CRUD
  const {
    data: revueActions,
    loading: loadingActions,
    create: createAction,
    update: updateAction,
    remove: removeAction,
  } = useSupabaseCrud<RevueAction>("revue_actions", {
    orderBy: { column: "created_at", ascending: false },
  });

  // Données agrégées des autres onglets (état courant / vivant)
  const { data: capas } = useSupabaseCrud<Capa>("capa");
  const { data: sops } = useSupabaseCrud<Sop>("sops");
  const { data: audits } = useSupabaseCrud<Audit>("audits");
  const { data: risques } = useSupabaseCrud<Risque>("risques");
  const { data: reclamations } = useSupabaseCrud<Reclamation>("reclamations");
  const { data: habilitations } = useSupabaseCrud<Habilitation>("habilitations");
  const { data: equipements } = useSupabaseCrud<Equipement>("equipements");
  const { data: indicateurs } = useSupabaseCrud<Indicateur>("indicateurs");
  const { data: indicateursValeurs } = useSupabaseCrud<IndicateurValeur>("indicateurs_valeurs");
  const { data: maintenance } = useSupabaseCrud<Maintenance>("maintenance");
  const { data: staff } = useSupabaseCrud<StaffLite>("staff_lite", {
    orderBy: { column: "prenom_nom", ascending: true },
  });

  const [showAddRevueModal, setShowAddRevueModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [deleteRevueId, setDeleteRevueId] = useState<string | null>(null);
  const [deleteActionId, setDeleteActionId] = useState<string | null>(null);
  const [filterRevue, setFilterRevue] = useState<string>("all");
  const [filterActionStatut, setFilterActionStatut] = useState<string>("all");
  // "live" = état courant des tables vivantes, sinon id d'une revue figée
  const [snapshotSource, setSnapshotSource] = useState<string>("live");
  const [freezeError, setFreezeError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentTrimestre = Math.floor(new Date().getMonth() / 3) + 1;

  const [newRevue, setNewRevue] = useState<Partial<RevueDirectionInsert>>({
    annee: currentYear,
    trimestre: currentTrimestre,
    perimetre: "GLOBAL",
    statut: "PLANIFIEE",
    date_planifiee: new Date().toISOString().split("T")[0],
  });

  const [newAction, setNewAction] = useState<Partial<RevueActionInsert>>({
    revue_id: "",
    titre: "",
    statut: "PLANIFIE",
  });

  // Tri annee desc puis trimestre desc
  const sortedRevues = useMemo(() => {
    return [...revues].sort(
      (a, b) => b.annee - a.annee || (b.trimestre ?? 0) - (a.trimestre ?? 0)
    );
  }, [revues]);

  const staffMap = useMemo(() => {
    const m: Record<string, string> = {};
    staff.forEach((s) => {
      m[s.id] = s.prenom_nom;
    });
    return m;
  }, [staff]);

  /* ---- Mécanisme de freeze ---------------------------------------- */
  const frozenRevues = useMemo(() => sortedRevues.filter((r) => r.snapshot_at), [sortedRevues]);

  const selectedFrozen = useMemo(
    () => (snapshotSource === "live" ? null : frozenRevues.find((r) => r.id === snapshotSource) ?? null),
    [snapshotSource, frozenRevues]
  );

  const handleFreeze = async (id: string) => {
    setFreezeError(null);
    const { error } = await supabase.rpc("freeze_rdd", { p_rdd_id: id });
    if (error) {
      setFreezeError(`Échec du gel de la revue : ${error.message}`);
      return;
    }
    refreshRevues();
  };

  /* ---- KPIs -------------------------------------------------------- */
  const kpis = useMemo(() => {
    const openActions = revueActions.filter((a) => OPEN_ACTION_STATUTS.includes(a.statut));
    const totalActions = revueActions.filter((a) => a.statut !== "ABANDONNE").length;
    const completedActions = revueActions.filter((a) => a.statut === "TERMINE");
    const completionRate =
      totalActions > 0 ? Math.round((completedActions.length / totalActions) * 100) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureRevues = revues
      .filter(
        (r) =>
          (r.statut === "PLANIFIEE" || r.statut === "EN_PREPARATION") &&
          r.date_planifiee &&
          new Date(r.date_planifiee) >= today
      )
      .sort(
        (a, b) => new Date(a.date_planifiee!).getTime() - new Date(b.date_planifiee!).getTime()
      );
    const nextRevue = futureRevues[0];

    return {
      openActions: openActions.length,
      completionRate,
      nextRevueDate: nextRevue?.date_planifiee ? fmtDate(nextRevue.date_planifiee) : "Non planifiée",
    };
  }, [revueActions, revues]);

  /* ---- Données d'entrée ISO 9.3 ------------------------------------ */
  // Si une revue figée est sélectionnée, on lit les snapshots JSONB ;
  // sinon l'état courant des tables vivantes.
  const isoData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const srcCapas: Capa[] = selectedFrozen
      ? ((selectedFrozen.snapshot_capa ?? []) as unknown as Capa[])
      : capas;
    const srcAudits: Audit[] = selectedFrozen
      ? ((selectedFrozen.snapshot_audits ?? []) as unknown as Audit[])
      : audits;
    const srcRisques: Risque[] = selectedFrozen
      ? ((selectedFrozen.snapshot_risques ?? []) as unknown as Risque[])
      : risques;
    const srcReclamations: Reclamation[] = selectedFrozen
      ? ((selectedFrozen.snapshot_reclamations ?? []) as unknown as Reclamation[])
      : reclamations;

    // 1. Statut des actions (scopé à la revue si figée)
    const scopedActions = selectedFrozen
      ? revueActions.filter((a) => a.revue_id === selectedFrozen.id)
      : revueActions;
    const actionsByStatus = scopedActions.reduce(
      (acc, action) => {
        const lbl = labelFor(ACTION_STATUT_OPTIONS, action.statut);
        acc[lbl] = (acc[lbl] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 2. Évolution indicateurs qualité (live uniquement — non snapshotés)
    const indicatorPerformance = indicateurs
      .filter((ind) => ind.actif)
      .map((ind) => {
        const values = indicateursValeurs
          .filter((v) => v.indicateur_id === ind.id)
          .sort((a, b) => b.date_calcul.localeCompare(a.date_calcul));
        const latest = values[0];
        // direction réelle : 'above' (≥ cible) | 'below' (≤ cible) | 'between' (bornes)
        const onTarget =
          latest?.atteint ??
          (latest == null
            ? true
            : ind.direction === "between"
              ? (ind.borne_basse == null || latest.valeur >= ind.borne_basse) &&
                (ind.borne_haute == null || latest.valeur <= ind.borne_haute)
              : ind.cible == null
                ? true
                : ind.direction === "below"
                  ? latest.valeur <= ind.cible
                  : latest.valeur >= ind.cible);
        return {
          label: ind.libelle,
          value: latest?.valeur ?? 0,
          target: ind.cible,
          unit: ind.unite ?? "",
          onTarget,
        };
      });

    // 3. Résultats audits
    const completedAudits = srcAudits.filter((a) => a.statut === "REALISE");
    const majorFindings = completedAudits.reduce((acc, a) => acc + (a.nb_constats_majeurs ?? 0), 0);
    const totalFindings = completedAudits.reduce(
      (acc, a) => acc + (a.nb_constats_majeurs ?? 0) + (a.nb_constats_mineurs ?? 0),
      0
    );

    // 4. Performance processus (simplifiée via statut SOPs — live uniquement)
    const processHealth = {
      green: sops.filter((s) => s.statut === "EN_VIGUEUR").length,
      amber: sops.filter((s) => s.statut === "A_REVISER" || s.statut === "BROUILLON").length,
      red: sops.filter((s) => s.statut === "EXPIREE").length,
    };

    // 5. NC et CAPA
    const openCapas = srcCapas.filter((c) => c.statut !== "CLOSE");
    const overdueCapas = openCapas.filter((c) => {
      if (!c.date_echeance) return false;
      return new Date(c.date_echeance) < today;
    });
    const closedCapas = srcCapas.filter((c) => c.statut === "CLOSE");
    const closureRate =
      srcCapas.length > 0 ? Math.round((closedCapas.length / srcCapas.length) * 100) : 0;

    // 6. Satisfaction parties intéressées
    const openComplaints = srcReclamations.filter(
      (c) => c.statut === "OUVERTE" || c.statut === "EN_COURS"
    );
    const withSatisfaction = srcReclamations.filter((c) => c.satisfaction);
    const avgSatisfaction =
      withSatisfaction.length > 0
        ? withSatisfaction.reduce((acc, c) => acc + (parseFloat(c.satisfaction || "0") || 0), 0) /
          withSatisfaction.length
        : 0;

    // 7. Risques et opportunités
    const uncontrolledRisks = srcRisques.filter(
      (r) => r.statut === "IDENTIFIE" || r.statut === "EN_TRAITEMENT"
    ).length;
    const riskActions = srcRisques.filter((r) => r.action_prevue).length;

    // 8. Ressources (live uniquement — non snapshotées)
    const validHabilitations = habilitations.filter((h) => h.statut === "VALIDE").length;
    const habilitationRate =
      habilitations.length > 0 ? Math.round((validHabilitations / habilitations.length) * 100) : 0;
    const conformEquipements = equipements.filter((e) => e.statut === "CONFORME").length;
    const equipementRate =
      equipements.length > 0 ? Math.round((conformEquipements / equipements.length) * 100) : 0;
    const maintenancesRealisees = maintenance.filter((m) => m.date_realisee);
    const maintenancesConformes = maintenancesRealisees.filter((m) => m.conforme === true).length;

    // Données figées uniquement
    const smq = selectedFrozen
      ? ((selectedFrozen.snapshot_smq ?? null) as unknown as SmqSnapshot | null)
      : null;
    const fournisseursCount =
      selectedFrozen && Array.isArray(selectedFrozen.snapshot_fournisseurs)
        ? (selectedFrozen.snapshot_fournisseurs as unknown[]).length
        : null;

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
      risques: {
        total: srcRisques.length,
        uncontrolled: uncontrolledRisks,
        actions: riskActions,
      },
      resources: {
        habilitationRate,
        equipementRate,
        maintenancesConformes,
        maintenancesRealisees: maintenancesRealisees.length,
      },
      smq,
      fournisseursCount,
    };
  }, [
    selectedFrozen,
    revueActions,
    capas,
    sops,
    audits,
    risques,
    reclamations,
    habilitations,
    equipements,
    indicateurs,
    indicateursValeurs,
    maintenance,
  ]);

  /* ---- Filtres actions --------------------------------------------- */
  const filteredActions = useMemo(() => {
    return revueActions.filter((a) => {
      if (filterRevue !== "all" && a.revue_id !== filterRevue) return false;
      if (filterActionStatut !== "all" && a.statut !== filterActionStatut) return false;
      return true;
    });
  }, [revueActions, filterRevue, filterActionStatut]);

  /* ---- Données graphiques ------------------------------------------ */
  const actionsByStatutChart = useMemo(() => {
    const counts: Record<string, number> = {};
    revueActions.forEach((a) => {
      const lbl = labelFor(ACTION_STATUT_OPTIONS, a.statut);
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [revueActions]);

  const responsableChart = useMemo(() => {
    const counts: Record<string, number> = {};
    revueActions.forEach((a) => {
      const name = (a.responsable_id && staffMap[a.responsable_id]) || "Non assigné";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [revueActions, staffMap]);

  /* ---- Handlers ----------------------------------------------------- */
  const handleAddRevue = async () => {
    setCreateError(null);
    if (!newRevue.annee) {
      setCreateError("L'année est obligatoire.");
      return;
    }
    try {
      const payload: Partial<RevueDirectionInsert> = {
        annee: Number(newRevue.annee),
        trimestre: newRevue.trimestre ? Number(newRevue.trimestre) : null,
        perimetre: newRevue.perimetre ?? "GLOBAL",
        statut: newRevue.statut ?? "PLANIFIEE",
        date_planifiee: newRevue.date_planifiee || null,
        presents: newRevue.presents?.trim() || null,
        ordre_du_jour: newRevue.ordre_du_jour?.trim() || null,
      };
      await createRevue(payload);
      setShowAddRevueModal(false);
      setNewRevue({
        annee: currentYear,
        trimestre: currentTrimestre,
        perimetre: "GLOBAL",
        statut: "PLANIFIEE",
        date_planifiee: new Date().toISOString().split("T")[0],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue lors de la création.";
      setCreateError(msg);
      console.error("Error creating revue de direction:", err);
    }
  };

  const handleAddAction = async () => {
    setCreateError(null);
    if (!newAction.revue_id || !newAction.titre?.trim()) {
      setCreateError("La revue liée et le titre sont obligatoires.");
      return;
    }
    try {
      // num séquentiel par revue
      const nums = revueActions
        .filter((a) => a.revue_id === newAction.revue_id)
        .map((a) => a.num);
      const num = nums.length > 0 ? Math.max(...nums) + 1 : 1;

      const payload: Partial<RevueActionInsert> = {
        revue_id: newAction.revue_id,
        num,
        titre: newAction.titre.trim(),
        description: newAction.description?.trim() || null,
        responsable_id: newAction.responsable_id || null,
        date_echeance: newAction.date_echeance || null,
        statut: newAction.statut ?? "PLANIFIE",
      };
      await createAction(payload);
      setShowAddActionModal(false);
      setNewAction({ revue_id: "", titre: "", statut: "PLANIFIE" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue lors de la création.";
      setCreateError(msg);
      console.error("Error creating action de revue:", err);
    }
  };

  const handleDeleteRevue = async () => {
    if (!deleteRevueId) return;
    try {
      await removeRevue(deleteRevueId);
      setDeleteRevueId(null);
    } catch (error) {
      console.error("Error deleting revue de direction:", error);
    }
  };

  const handleDeleteAction = async () => {
    if (!deleteActionId) return;
    try {
      await removeAction(deleteActionId);
      setDeleteActionId(null);
    } catch (error) {
      console.error("Error deleting action de revue:", error);
    }
  };

  const handleExport = () => {
    const exportData = {
      revues: sortedRevues,
      revueActions,
      isoData,
      source: selectedFrozen
        ? { type: "snapshot", revue: revueLabel(selectedFrozen), snapshot_at: selectedFrozen.snapshot_at }
        : { type: "live" },
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

  /* ---- Colonnes ------------------------------------------------------ */
  const revueColumns: ColumnDef<RevueDirection>[] = [
    {
      key: "annee",
      label: "Période",
      render: (revue) => (
        <span className="text-xs font-mono text-accent">
          T{revue.trimestre ?? "?"} {revue.annee}
        </span>
      ),
    },
    {
      key: "perimetre",
      label: "Périmètre",
      render: (revue) => (
        <EditableCell
          value={revue.perimetre}
          type="select"
          options={PERIMETRE_OPTIONS}
          onSave={async (value) => {
            await updateRevue(revue.id, { perimetre: String(value) });
          }}
        />
      ),
    },
    {
      key: "date_planifiee",
      label: "Date planifiée",
      render: (revue) => (
        <EditableCell
          value={revue.date_planifiee || ""}
          type="date"
          onSave={async (value) => {
            await updateRevue(revue.id, { date_planifiee: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "date_realisee",
      label: "Date réalisée",
      render: (revue) => (
        <EditableCell
          value={revue.date_realisee || ""}
          type="date"
          onSave={async (value) => {
            await updateRevue(revue.id, { date_realisee: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (revue) => (
        <EditableCell
          value={revue.statut}
          type="select"
          options={REVUE_STATUT_OPTIONS}
          onSave={async (value) => {
            const newStatut = String(value);
            const updates: Partial<RevueDirection> = { statut: newStatut };
            if (newStatut === "REALISEE" && !revue.date_realisee) {
              updates.date_realisee = new Date().toISOString().split("T")[0];
            }
            await updateRevue(revue.id, updates);
            // Le trigger fn_auto_freeze_rdd fige les snapshots côté DB :
            // recharger pour récupérer snapshot_* et snapshot_at.
            if (newStatut === "REALISEE") {
              refreshRevues();
            }
          }}
        />
      ),
    },
    {
      key: "presents",
      label: "Présents",
      render: (revue) => (
        <EditableCell
          value={revue.presents || ""}
          type="text"
          onSave={async (value) => {
            await updateRevue(revue.id, { presents: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "ordre_du_jour",
      label: "Ordre du jour",
      render: (revue) => (
        <EditableCell
          value={revue.ordre_du_jour || ""}
          type="text"
          onSave={async (value) => {
            await updateRevue(revue.id, { ordre_du_jour: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "conclusions",
      label: "Conclusions",
      render: (revue) => (
        <EditableCell
          value={revue.conclusions || ""}
          type="text"
          onSave={async (value) => {
            await updateRevue(revue.id, { conclusions: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "snapshot_at",
      label: "Snapshot",
      render: (revue) =>
        revue.snapshot_at ? (
          <Badge variant="ok">Figée le {fmtDate(revue.snapshot_at)}</Badge>
        ) : revue.statut === "REALISEE" ? (
          <button
            onClick={() => handleFreeze(revue.id)}
            className="px-2.5 py-1 text-[11px] font-semibold text-accent border border-accent/40 rounded-lg hover:bg-accent/10 transition-colors"
            title="Figer l'état qualité de cette revue (RPC freeze_rdd)"
          >
            Figer
          </button>
        ) : (
          <span className="text-xs text-mut">—</span>
        ),
    },
    {
      key: "id",
      label: "",
      render: (revue) => (
        <button
          onClick={() => setDeleteRevueId(revue.id)}
          className="p-1.5 text-mut hover:text-red transition-colors"
          title="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  const actionColumns: ColumnDef<RevueAction>[] = [
    {
      key: "revue_id",
      label: "Revue liée",
      render: (action) => {
        const revue = revues.find((r) => r.id === action.revue_id);
        return (
          <span className="text-xs text-sec">{revue ? revueLabel(revue) : "Non spécifiée"}</span>
        );
      },
    },
    {
      key: "num",
      label: "N°",
      render: (action) => <span className="text-xs font-mono text-accent">#{action.num}</span>,
    },
    {
      key: "titre",
      label: "Titre",
      render: (action) => (
        <EditableCell
          value={action.titre}
          type="text"
          onSave={async (value) => {
            const s = String(value).trim();
            if (s) await updateAction(action.id, { titre: s });
          }}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (action) => (
        <EditableCell
          value={action.description || ""}
          type="text"
          onSave={async (value) => {
            await updateAction(action.id, { description: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "responsable_id",
      label: "Responsable",
      render: (action) => (
        <EditableCell
          value={action.responsable_id || ""}
          type="select"
          options={[
            { value: "", label: "Non assigné" },
            ...staff.filter((s) => s.actif).map((s) => ({ value: s.id, label: s.prenom_nom })),
          ]}
          onSave={async (value) => {
            await updateAction(action.id, { responsable_id: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "date_echeance",
      label: "Échéance",
      render: (action) => (
        <EditableCell
          value={action.date_echeance || ""}
          type="date"
          onSave={async (value) => {
            await updateAction(action.id, { date_echeance: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (action) => (
        <EditableCell
          value={action.statut}
          type="select"
          options={ACTION_STATUT_OPTIONS}
          onSave={async (value) => {
            await updateAction(action.id, { statut: String(value) });
          }}
        />
      ),
    },
    {
      key: "capa_id",
      label: "CAPA liée",
      render: (action) => (
        <EditableCell
          value={action.capa_id || ""}
          type="select"
          options={[
            { value: "", label: "Aucune" },
            ...capas.map((c) => ({
              value: c.id,
              label: c.reference || c.titre.substring(0, 40),
            })),
          ]}
          onSave={async (value) => {
            await updateAction(action.id, { capa_id: String(value) || null });
          }}
        />
      ),
    },
    {
      key: "id",
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

  if (loadingRevues || loadingActions) {
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
          subtitle="Actions non terminées"
          accent={kpis.openActions > 0 ? "amber" : "default"}
        />
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Taux réalisation"
          value={`${kpis.completionRate}%`}
          subtitle="Terminées / Total"
          accent={kpis.completionRate >= 80 ? "default" : "amber"}
        />
        <KpiCard
          icon={<ClipboardIcon size={20} />}
          label="Prochaine revue"
          value={kpis.nextRevueDate === "Non planifiée" ? "N/A" : kpis.nextRevueDate}
          subtitle={kpis.nextRevueDate === "Non planifiée" ? "Aucune planifiée" : "Date planifiée"}
        />
      </div>

      {/* Données d'entrée ISO 9.3 — état courant ou snapshot figé */}
      <div className="bg-card border border-brd rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-text">
              Données d'entrée § 9.3 ISO {selectedFrozen ? "(snapshot figé)" : "(auto-agrégées)"}
            </h2>
            {selectedFrozen && (
              <Badge variant="ok">Figée le {fmtDate(selectedFrozen.snapshot_at)}</Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={snapshotSource}
              onChange={(e) => setSnapshotSource(e.target.value)}
              className="px-4 py-2.5 bg-bg text-text border border-brd rounded-xl text-[14px]"
            >
              <option value="live">État courant (live)</option>
              {frozenRevues.map((r) => (
                <option key={r.id} value={r.id}>
                  {revueLabel(r)} — figée le {fmtDate(r.snapshot_at)}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-[#000] rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <DownloadIcon size={14} />
              Export rapport
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Statut des actions */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">
              1. Statut actions {selectedFrozen ? "de la revue" : "revue précédente"}
            </h3>
            <div className="space-y-2">
              {Object.entries(isoData.actionsByStatus).length === 0 && (
                <p className="text-xs text-mut">Aucune action</p>
              )}
              {Object.entries(isoData.actionsByStatus).map(([statut, count]) => (
                <div key={statut} className="flex justify-between text-xs">
                  <span className="text-sec">{statut}</span>
                  <span className="font-semibold text-text">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Indicateurs qualité (live) OU Score SMQ figé */}
          {selectedFrozen ? (
            <div className="bg-bg border border-brd rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text mb-3">2. Score SMQ figé</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-sec">Score global</span>
                  <span className="font-semibold text-text">
                    {isoData.smq?.score_global != null
                      ? `${Math.round(isoData.smq.score_global)}/100`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sec">Composantes actives</span>
                  <span className="font-semibold text-text">
                    {isoData.smq?.active_components ?? "—"}
                    {isoData.smq?.total_components != null
                      ? ` / ${isoData.smq.total_components}`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sec">Fournisseurs (figés)</span>
                  <span className="font-semibold text-text">{isoData.fournisseursCount ?? "—"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg border border-brd rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text mb-3">
                2. Évolution indicateurs qualité
              </h3>
              <div className="space-y-2">
                {isoData.indicatorPerformance.length === 0 && (
                  <p className="text-xs text-mut">Aucun indicateur actif</p>
                )}
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
          )}

          {/* 3. Résultats audits */}
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

          {/* 4. Performance processus (live uniquement — non snapshotée) */}
          {!selectedFrozen && (
            <div className="bg-bg border border-brd rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text mb-3">4. Performance processus</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-sec">SOPs en vigueur</span>
                  <span className="font-semibold" style={{ color: THEME_COLORS.grn }}>
                    {isoData.processHealth.green}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sec">À réviser / brouillon</span>
                  <span className="font-semibold" style={{ color: THEME_COLORS.amb }}>
                    {isoData.processHealth.amber}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sec">Expirées</span>
                  <span className="font-semibold" style={{ color: THEME_COLORS.red }}>
                    {isoData.processHealth.red}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. NC et CAPA */}
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

          {/* 6. Satisfaction parties intéressées */}
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

          {/* 7. Risques et opportunités */}
          <div className="bg-bg border border-brd rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text mb-3">7. Risques et opportunités</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sec">Total risques</span>
                <span className="font-semibold text-text">{isoData.risques.total}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Non maîtrisés</span>
                <span className="font-semibold text-red">{isoData.risques.uncontrolled}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sec">Actions prévues</span>
                <span className="font-semibold text-text">{isoData.risques.actions}</span>
              </div>
            </div>
          </div>

          {/* 8. Ressources (live uniquement — non snapshotées) */}
          {!selectedFrozen && (
            <div className="bg-bg border border-brd rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text mb-3">8. Ressources</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-sec">Habilitations valides</span>
                  <span className="font-semibold text-text">
                    {isoData.resources.habilitationRate}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sec">Équipements conformes</span>
                  <span className="font-semibold text-text">
                    {isoData.resources.equipementRate}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sec">Maintenances conformes</span>
                  <span className="font-semibold text-text">
                    {isoData.resources.maintenancesConformes}/
                    {isoData.resources.maintenancesRealisees}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedFrozen && (
          <p className="mt-4 text-xs text-mut">
            État qualité figé au {fmtDate(selectedFrozen.snapshot_at)} pour le périmètre{" "}
            {labelFor(PERIMETRE_OPTIONS, selectedFrozen.perimetre)}. Les sections indicateurs,
            processus et ressources ne sont pas snapshotées et ne sont affichées qu'en mode
            état courant.
          </p>
        )}
      </div>

      {/* Erreur freeze RPC */}
      {freezeError && (
        <div className="px-4 py-3 bg-red/10 border border-red/40 rounded-xl text-[13px] text-red">
          {freezeError}
        </div>
      )}

      {/* Tableau des revues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Revues de direction</h2>
          <AddButton onClick={() => { setCreateError(null); setShowAddRevueModal(true); }} />
        </div>
        <DataTable columns={revueColumns} data={sortedRevues} />
      </div>

      {/* Tableau des actions de revue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Actions de revue</h2>
          <AddButton onClick={() => { setCreateError(null); setShowAddActionModal(true); }} />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterRevue}
            onChange={(e) => setFilterRevue(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Toutes revues</option>
            {sortedRevues.map((r) => (
              <option key={r.id} value={r.id}>
                {revueLabel(r)}
              </option>
            ))}
          </select>

          <select
            value={filterActionStatut}
            onChange={(e) => setFilterActionStatut(e.target.value)}
            className="px-4 py-2.5 bg-card text-text border border-brd rounded-xl text-[14px]"
          >
            <option value="all">Tous statuts</option>
            {ACTION_STATUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <DataTable columns={actionColumns} data={filteredActions} />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions par statut */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Actions par statut</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={actionsByStatutChart}>
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

        {/* Répartition par responsable */}
        <div className="bg-card border border-brd rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">Actions par responsable</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={responsableChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${String(name).substring(0, 20)} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {responsableChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal nouvelle revue */}
      {showAddRevueModal && (
        <Modal
          isOpen={showAddRevueModal}
          title="Nouvelle revue de direction"
          onClose={() => setShowAddRevueModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Année *</label>
                <input
                  type="number"
                  value={newRevue.annee ?? currentYear}
                  onChange={(e) => setNewRevue({ ...newRevue, annee: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Trimestre</label>
                <select
                  value={newRevue.trimestre ?? ""}
                  onChange={(e) =>
                    setNewRevue({
                      ...newRevue,
                      trimestre: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className={inputCls}
                >
                  <option value="">Non précisé</option>
                  {[1, 2, 3, 4].map((t) => (
                    <option key={t} value={t}>
                      T{t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Périmètre</label>
                <select
                  value={newRevue.perimetre ?? "GLOBAL"}
                  onChange={(e) => setNewRevue({ ...newRevue, perimetre: e.target.value })}
                  className={inputCls}
                >
                  {PERIMETRE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Statut</label>
                <select
                  value={newRevue.statut ?? "PLANIFIEE"}
                  onChange={(e) => setNewRevue({ ...newRevue, statut: e.target.value })}
                  className={inputCls}
                >
                  {REVUE_STATUT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Date planifiée</label>
              <input
                type="date"
                value={newRevue.date_planifiee || ""}
                onChange={(e) => setNewRevue({ ...newRevue, date_planifiee: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Présents</label>
              <input
                type="text"
                value={newRevue.presents || ""}
                onChange={(e) => setNewRevue({ ...newRevue, presents: e.target.value })}
                className={inputCls}
                placeholder="Liste des participants"
              />
            </div>

            <div>
              <label className={labelCls}>Ordre du jour</label>
              <textarea
                value={newRevue.ordre_du_jour || ""}
                onChange={(e) => setNewRevue({ ...newRevue, ordre_du_jour: e.target.value })}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Points à aborder lors de la revue..."
              />
            </div>

            {createError && (
              <div className="px-4 py-3 bg-red/10 border border-red/40 rounded-xl text-[13px] text-red">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddRevueModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddRevue}
                disabled={!newRevue.annee}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal nouvelle action */}
      {showAddActionModal && (
        <Modal
          isOpen={showAddActionModal}
          title="Nouvelle action de revue"
          onClose={() => setShowAddActionModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Revue liée *</label>
              <select
                value={newAction.revue_id || ""}
                onChange={(e) => setNewAction({ ...newAction, revue_id: e.target.value })}
                className={inputCls}
              >
                <option value="">Sélectionner une revue</option>
                {sortedRevues.map((r) => (
                  <option key={r.id} value={r.id}>
                    {revueLabel(r)} — {labelFor(REVUE_STATUT_OPTIONS, r.statut)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Titre *</label>
              <input
                type="text"
                value={newAction.titre || ""}
                onChange={(e) => setNewAction({ ...newAction, titre: e.target.value })}
                className={inputCls}
                placeholder="Décision / action issue de la revue"
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={newAction.description || ""}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Détail de l'action à réaliser..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Responsable</label>
                <select
                  value={newAction.responsable_id || ""}
                  onChange={(e) =>
                    setNewAction({ ...newAction, responsable_id: e.target.value || null })
                  }
                  className={inputCls}
                >
                  <option value="">Non assigné</option>
                  {staff
                    .filter((s) => s.actif)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.prenom_nom}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Échéance</label>
                <input
                  type="date"
                  value={newAction.date_echeance || ""}
                  onChange={(e) => setNewAction({ ...newAction, date_echeance: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Statut</label>
              <select
                value={newAction.statut ?? "PLANIFIE"}
                onChange={(e) => setNewAction({ ...newAction, statut: e.target.value })}
                className={inputCls}
              >
                {ACTION_STATUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {createError && (
              <div className="px-4 py-3 bg-red/10 border border-red/40 rounded-xl text-[13px] text-red">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddActionModal(false)}
                className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
              >
                Annuler
              </button>
              <button
                onClick={handleAddAction}
                disabled={!newAction.revue_id || !newAction.titre?.trim()}
                className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation suppression revue */}
      {deleteRevueId && (
        <ConfirmDelete
          isOpen={!!deleteRevueId}
          itemName="cette revue de direction"
          onConfirm={handleDeleteRevue}
          onCancel={() => setDeleteRevueId(null)}
        />
      )}

      {/* Confirmation suppression action */}
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
