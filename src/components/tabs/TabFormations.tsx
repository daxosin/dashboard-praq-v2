"use client";

import React, { useState, useMemo } from "react";
import {
  KpiCard,
  Badge,
  DataTable,
  EditableCell,
  AddButton,
  Modal,
  ConfirmDelete,
  type BadgeVariant,
  type ColumnDef,
} from "@/components/ui";
import { UsersIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useSupabaseCrud } from "@/lib/hooks/useSupabaseCrud";
import type { Staff, Qualification, Training } from "@/lib/database.types";
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

interface StaffWithDetails extends Staff {
  qualifications?: Qualification[];
  trainings?: Training[];
}

interface QualificationWithStaff extends Qualification {
  staff?: Staff;
}

interface TrainingWithStaff extends Training {
  staff?: Staff;
}

const TabFormations: React.FC = () => {
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [showAddQualificationModal, setShowAddQualificationModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "training" | "qualification" } | null>(null);
  const [filterStaff, setFilterStaff] = useState<string>("");
  const [filterSkill, setFilterSkill] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { data: staff, loading: staffLoading } = useSupabaseCrud<Staff>("staff", {
    orderBy: { column: "name", ascending: true },
    filters: { active: true },
  });

  const {
    data: qualifications,
    loading: qualificationsLoading,
    create: createQualification,
    update: updateQualification,
    remove: removeQualification,
    refresh: refreshQualifications,
  } = useSupabaseCrud<Qualification>("qualifications", {
    select: "*, staff(*)",
    orderBy: { column: "created_at", ascending: false },
  });

  const {
    data: trainings,
    loading: trainingsLoading,
    create: createTraining,
    update: updateTraining,
    remove: removeTraining,
    refresh: refreshTrainings,
  } = useSupabaseCrud<Training>("trainings", {
    select: "*, staff(*)",
    orderBy: { column: "created_at", ascending: false },
  });

  const [newTraining, setNewTraining] = useState<Partial<Training>>({
    staff_id: "",
    title: "",
    type: "",
    planned_at: "",
    completed_at: null,
    evaluation: null,
    next_due: null,
  });

  const [newQualification, setNewQualification] = useState<Partial<Qualification>>({
    staff_id: "",
    skill_name: "",
    obtained_at: "",
    expires_at: null,
    status: "Valide",
  });

  // KPI calculations
  const kpis = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const validQualifications = qualifications.filter((q) => {
      if (!q.expires_at) return true;
      return new Date(q.expires_at) > today;
    });

    const expiringQualifications = qualifications.filter((q) => {
      if (!q.expires_at) return false;
      const expiryDate = new Date(q.expires_at);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    });

    const plannedTrainings = trainings.filter(
      (t) => t.planned_at && !t.completed_at
    );

    const totalStaff = staff.length;
    const staffWithQualifications = new Set(qualifications.map((q) => q.staff_id)).size;
    const habilitePercent = totalStaff > 0 ? Math.round((staffWithQualifications / totalStaff) * 100) : 0;

    const totalSkills = new Set(qualifications.map((q) => q.skill_name)).size;
    const totalPossibleQualifications = totalStaff * totalSkills;
    const coveragePercent =
      totalPossibleQualifications > 0
        ? Math.round((qualifications.length / totalPossibleQualifications) * 100)
        : 0;

    return {
      habilitePercent,
      plannedTrainingsCount: plannedTrainings.length,
      expiringCount: expiringQualifications.length,
      coveragePercent,
    };
  }, [staff, qualifications, trainings]);

  // Skill matrix data
  const skillMatrix = useMemo(() => {
    const skills = Array.from(new Set(qualifications.map((q) => q.skill_name))).sort();
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return staff.map((s) => {
      const staffQuals = qualifications.filter((q) => q.staff_id === s.id);
      const skillStatus: Record<string, BadgeVariant> = {};

      skills.forEach((skill) => {
        const qual = staffQuals.find((q) => q.skill_name === skill);
        if (!qual) {
          skillStatus[skill] = "plan";
        } else if (!qual.expires_at) {
          skillStatus[skill] = "ok";
        } else {
          const expiryDate = new Date(qual.expires_at);
          if (expiryDate < today) {
            skillStatus[skill] = "crit";
          } else if (expiryDate <= thirtyDaysFromNow) {
            skillStatus[skill] = "wip";
          } else {
            skillStatus[skill] = "ok";
          }
        }
      });

      return { staff: s, skills, skillStatus };
    });
  }, [staff, qualifications]);

  // Chart data - Habilitations by cluster
  const habilitationsByCluster = useMemo(() => {
    const clusterMap: Record<string, number> = {};
    staff.forEach((s) => {
      const cluster = s.cluster || "Non défini";
      const count = qualifications.filter((q) => q.staff_id === s.id).length;
      clusterMap[cluster] = (clusterMap[cluster] || 0) + count;
    });
    return Object.entries(clusterMap).map(([name, value]) => ({ name, value }));
  }, [staff, qualifications]);

  // Chart data - Training status
  const trainingStatusData = useMemo(() => {
    const completed = trainings.filter((t) => t.completed_at).length;
    const planned = trainings.filter((t) => t.planned_at && !t.completed_at).length;
    const noDate = trainings.filter((t) => !t.planned_at && !t.completed_at).length;

    return [
      { name: "Réalisées", value: completed },
      { name: "Planifiées", value: planned },
      { name: "À planifier", value: noDate },
    ];
  }, [trainings]);

  const COLORS = ["var(--color-ok)", "var(--color-wip)", "var(--color-muted)"];

  // Filtered qualifications
  const filteredQualifications = useMemo(() => {
    return (qualifications as QualificationWithStaff[]).filter((q) => {
      if (filterStaff && q.staff_id !== filterStaff) return false;
      if (filterSkill && !q.skill_name.toLowerCase().includes(filterSkill.toLowerCase())) return false;
      if (filterStatus) {
        const today = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(today.getDate() + 30);
        const expiryDate = q.expires_at ? new Date(q.expires_at) : null;

        if (filterStatus === "valide" && expiryDate && expiryDate < today) return false;
        if (filterStatus === "expiring" && (!expiryDate || expiryDate < today || expiryDate > thirtyDays))
          return false;
        if (filterStatus === "expired" && (!expiryDate || expiryDate >= today)) return false;
      }
      return true;
    });
  }, [qualifications, filterStaff, filterSkill, filterStatus]);

  // Filtered trainings
  const filteredTrainings = useMemo(() => {
    return (trainings as TrainingWithStaff[]).filter((t) => {
      if (filterStaff && t.staff_id !== filterStaff) return false;
      return true;
    });
  }, [trainings, filterStaff]);

  // Qualification columns
  const qualificationColumns: ColumnDef<QualificationWithStaff>[] = [
    {
      key: "staff_name",
      label: "Collaborateur",
      render: (q) => (q.staff as Staff)?.name || "N/A",
    },
    {
      key: "skill_name",
      label: "Compétence",
      render: (q) => (
        <EditableCell
          value={q.skill_name}
          type="text"
          onSave={(value) => updateQualification(q.id, { skill_name: value as string })}
        />
      ),
    },
    {
      key: "obtained_at",
      label: "Date obtention",
      render: (q) => (
        <EditableCell
          value={q.obtained_at}
          type="date"
          onSave={(value) => updateQualification(q.id, { obtained_at: value as string })}
        />
      ),
    },
    {
      key: "expires_at",
      label: "Date expiration",
      render: (q) => (
        <EditableCell
          value={q.expires_at || ""}
          type="date"
          onSave={(value) => updateQualification(q.id, { expires_at: value as string || null })}
        />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (q) => {
        const today = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(today.getDate() + 30);
        const expiryDate = q.expires_at ? new Date(q.expires_at) : null;

        let variant: BadgeVariant = "ok";
        let label = "Valide";

        if (!expiryDate) {
          variant = "ok";
          label = "Valide";
        } else if (expiryDate < today) {
          variant = "crit";
          label = "Expirée";
        } else if (expiryDate <= thirtyDays) {
          variant = "wip";
          label = "Expire <30j";
        }

        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: "actions",
      label: "",
      render: (q) => (
        <button
          onClick={() => setDeleteTarget({ id: q.id, type: "qualification" })}
          className="text-crit hover:opacity-70 transition-opacity"
          aria-label="Supprimer"
        >
          <TrashIcon size={16} />
        </button>
      ),
    },
  ];

  // Training columns
  const trainingColumns: ColumnDef<TrainingWithStaff>[] = [
    {
      key: "staff_name",
      label: "Collaborateur",
      render: (t) => (t.staff as Staff)?.name || "N/A",
    },
    {
      key: "title",
      label: "Titre formation",
      render: (t) => (
        <EditableCell
          value={t.title}
          type="text"
          onSave={(value) => updateTraining(t.id, { title: value as string })}
        />
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (t) => (
        <EditableCell
          value={t.type}
          type="text"
          onSave={(value) => updateTraining(t.id, { type: value as string })}
        />
      ),
    },
    {
      key: "planned_at",
      label: "Date planifiée",
      render: (t) => (
        <EditableCell
          value={t.planned_at || ""}
          type="date"
          onSave={(value) => updateTraining(t.id, { planned_at: value as string || null })}
        />
      ),
    },
    {
      key: "completed_at",
      label: "Date réalisée",
      render: (t) => (
        <EditableCell
          value={t.completed_at || ""}
          type="date"
          onSave={(value) => updateTraining(t.id, { completed_at: value as string || null })}
        />
      ),
    },
    {
      key: "evaluation",
      label: "Évaluation",
      render: (t) => (
        <EditableCell
          value={t.evaluation || ""}
          type="text"
          onSave={(value) => updateTraining(t.id, { evaluation: value as string || null })}
        />
      ),
    },
    {
      key: "next_due",
      label: "Prochaine échéance",
      render: (t) => (
        <EditableCell
          value={t.next_due || ""}
          type="date"
          onSave={(value) => updateTraining(t.id, { next_due: value as string || null })}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (t) => (
        <button
          onClick={() => setDeleteTarget({ id: t.id, type: "training" })}
          className="text-crit hover:opacity-70 transition-opacity"
          aria-label="Supprimer"
        >
          <TrashIcon size={16} />
        </button>
      ),
    },
  ];

  const handleAddTraining = async () => {
    if (!newTraining.staff_id || !newTraining.title || !newTraining.type) return;
    try {
      await createTraining(newTraining);
      setShowAddTrainingModal(false);
      setNewTraining({
        staff_id: "",
        title: "",
        type: "",
        planned_at: "",
        completed_at: null,
        evaluation: null,
        next_due: null,
      });
      refreshTrainings();
    } catch (error) {
      console.error("Error creating training:", error);
    }
  };

  const handleAddQualification = async () => {
    if (!newQualification.staff_id || !newQualification.skill_name || !newQualification.obtained_at) return;
    try {
      await createQualification(newQualification);
      setShowAddQualificationModal(false);
      setNewQualification({
        staff_id: "",
        skill_name: "",
        obtained_at: "",
        expires_at: null,
        status: "Valide",
      });
      refreshQualifications();
    } catch (error) {
      console.error("Error creating qualification:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "training") {
        await removeTraining(deleteTarget.id);
        refreshTrainings();
      } else {
        await removeQualification(deleteTarget.id);
        refreshQualifications();
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const loading = staffLoading || qualificationsLoading || trainingsLoading;

  if (loading) {
    return <div className="p-6 text-sec">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="PERSONNEL HABILITÉ"
          value={`${kpis.habilitePercent}%`}
          subtitle={`${new Set(qualifications.map((q) => q.staff_id)).size} / ${staff.length} collaborateurs`}
        />
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="FORMATIONS PLANIFIÉES"
          value={kpis.plannedTrainingsCount.toString()}
          subtitle="À réaliser"
        />
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="EXPIRATIONS <30J"
          value={kpis.expiringCount.toString()}
          subtitle="Habilitations à renouveler"
          accent="amber"
        />
        <KpiCard
          icon={<UsersIcon size={20} />}
          label="TAUX COUVERTURE"
          value={`${kpis.coveragePercent}%`}
          subtitle="Compétences vs personnel"
        />
      </div>

      {/* Skill Matrix */}
      <div className="card">
        <h2 className="text-h2 mb-4">Matrice de compétences</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brd">
                <th className="text-left p-3 text-tag sticky left-0 bg-card z-10">COLLABORATEUR</th>
                {skillMatrix[0]?.skills.map((skill) => (
                  <th key={skill} className="text-left p-3 text-tag whitespace-nowrap">
                    {skill.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skillMatrix.map((row) => (
                <tr key={row.staff.id} className="border-b border-brd hover:bg-elev transition-colors">
                  <td className="p-3 font-medium sticky left-0 bg-card">{row.staff.name}</td>
                  {row.skills.map((skill) => (
                    <td key={skill} className="p-3">
                      <Badge variant={row.skillStatus[skill]}>
                        {row.skillStatus[skill] === "ok" && "OK"}
                        {row.skillStatus[skill] === "wip" && "<30j"}
                        {row.skillStatus[skill] === "crit" && "Exp"}
                        {row.skillStatus[skill] === "plan" && "-"}
                      </Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-h2 mb-4">Habilitations par cluster</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={habilitationsByCluster}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-secondary)" style={{ fontSize: 11 }} />
              <YAxis stroke="var(--color-secondary)" style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                }}
                labelStyle={{ color: "var(--color-text)" }}
              />
              <Bar dataKey="value" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-h2 mb-4">Statut formations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trainingStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {trainingStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-h3 mb-3">Filtres</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-semibold text-sec mb-2">COLLABORATEUR</label>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="">Tous</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-semibold text-sec mb-2">COMPÉTENCE</label>
            <input
              type="text"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-semibold text-sec mb-2">STATUT</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="">Tous</option>
              <option value="valide">Valide</option>
              <option value="expiring">Expire &lt;30j</option>
              <option value="expired">Expirée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Habilitations Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2">Habilitations</h2>
          <AddButton onClick={() => setShowAddQualificationModal(true)} label="Nouvelle habilitation" />
        </div>
        <DataTable columns={qualificationColumns} data={filteredQualifications} />
      </div>

      {/* Plan de formation Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2">Plan de formation</h2>
          <AddButton onClick={() => setShowAddTrainingModal(true)} label="Nouvelle formation" />
        </div>
        <DataTable columns={trainingColumns} data={filteredTrainings} />
      </div>

      {/* Add Training Modal */}
      <Modal
        isOpen={showAddTrainingModal}
        onClose={() => setShowAddTrainingModal(false)}
        title="Nouvelle formation"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">COLLABORATEUR *</label>
            <select
              value={newTraining.staff_id}
              onChange={(e) => setNewTraining({ ...newTraining, staff_id: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="">Sélectionner</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">TITRE *</label>
            <input
              type="text"
              value={newTraining.title}
              onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">TYPE *</label>
            <input
              type="text"
              value={newTraining.type}
              onChange={(e) => setNewTraining({ ...newTraining, type: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">DATE PLANIFIÉE</label>
            <input
              type="date"
              value={newTraining.planned_at || ""}
              onChange={(e) => setNewTraining({ ...newTraining, planned_at: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddTrainingModal(false)}
              className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
            >
              Annuler
            </button>
            <button
              onClick={handleAddTraining}
              disabled={!newTraining.staff_id || !newTraining.title || !newTraining.type}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Qualification Modal */}
      <Modal
        isOpen={showAddQualificationModal}
        onClose={() => setShowAddQualificationModal(false)}
        title="Nouvelle habilitation"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">COLLABORATEUR *</label>
            <select
              value={newQualification.staff_id}
              onChange={(e) => setNewQualification({ ...newQualification, staff_id: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="">Sélectionner</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">COMPÉTENCE *</label>
            <input
              type="text"
              value={newQualification.skill_name}
              onChange={(e) => setNewQualification({ ...newQualification, skill_name: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">DATE OBTENTION *</label>
            <input
              type="date"
              value={newQualification.obtained_at}
              onChange={(e) => setNewQualification({ ...newQualification, obtained_at: e.target.value })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-sec mb-2">DATE EXPIRATION</label>
            <input
              type="date"
              value={newQualification.expires_at || ""}
              onChange={(e) => setNewQualification({ ...newQualification, expires_at: e.target.value || null })}
              className="w-full px-4 py-3 bg-bg border border-brd rounded-xl text-[15px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddQualificationModal(false)}
              className="px-6 py-3 text-sec hover:text-text rounded-xl text-[15px]"
            >
              Annuler
            </button>
            <button
              onClick={handleAddQualification}
              disabled={!newQualification.staff_id || !newQualification.skill_name || !newQualification.obtained_at}
              className="px-6 py-3 bg-accent text-[#000] rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDelete
          isOpen={!!deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          itemName={deleteTarget.type === "training" ? "cette formation" : "cette habilitation"}
        />
      )}
    </div>
  );
};

export default TabFormations;
