"use client";

import React, { useState } from "react";
import {
  Badge,
  KpiCard,
  ProgressBar3,
  AlertLine,
  EditableCell,
  DataTable,
  ThemeToggle,
  ScoreGauge,
  AddButton,
  Modal,
  ConfirmDelete,
} from "@/components/ui";
import {
  GridIcon,
  DocIcon,
  ZapIcon,
  SearchIcon,
  TriangleIcon,
  ShieldIcon,
  UsersIcon,
  ToolIcon,
  TruckIcon,
  MsgIcon,
  BarChartIcon,
  ClipboardIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  DownloadIcon,
  UploadIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const columns = [
    { key: "code", label: "Code", sortable: true },
    { key: "title", label: "Titre", sortable: true },
    { key: "domain", label: "Domaine", sortable: false },
    {
      key: "status",
      label: "Statut",
      render: (row: any) => <Badge variant={row.status}>{row.statusLabel}</Badge>,
    },
  ];

  const data = [
    {
      code: "SOP-PDA-2025-001",
      title: "Préparation automatisée des doses",
      domain: "PDA",
      status: "ok",
      statusLabel: "Validé",
    },
    {
      code: "SOP-QMS-006",
      title: "Gestion des risques (AMDEC)",
      domain: "Gouvernance Qualité",
      status: "wip",
      statusLabel: "En cours",
    },
    {
      code: "SOP-CYBER-002",
      title: "Réponse à incident cyber",
      domain: "Cybersécurité",
      status: "plan",
      statusLabel: "Planifié",
    },
    {
      code: "SOP-EHPAD-004",
      title: "Gestion réclamations établissements",
      domain: "Relation EHPAD",
      status: "ok",
      statusLabel: "Validé",
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="tag mb-3">Design System</div>
            <h1 className="text-h1">
              Pharm<span className="text-accent">a</span>78
            </h1>
            <div className="w-12 h-[2.5px] bg-accent rounded-sm my-2" />
            <div className="text-[11px] text-mut">
              Dashboard PRAQ v2 — ISO 9001:2015
            </div>
          </div>
          <div className="flex gap-2.5 items-center">
            <ScoreGauge score={57} label="Score SMQ" />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Bibliothèque d'icônes
          </div>
          <div className="bg-card border border-brd rounded-md p-5 flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <GridIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Tableau de bord</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <DocIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Documents</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <ZapIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">CAPA</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <SearchIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Audits</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <TriangleIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Risques</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <ShieldIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Vigilances</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <UsersIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Formations</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <ToolIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Équipements</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <TruckIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Fournisseurs</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <MsgIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Réclamations</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <BarChartIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Indicateurs</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-elev rounded-md flex items-center justify-center">
                <ClipboardIcon className="text-accent" />
              </div>
              <span className="text-[11px] text-mut">Revue direction</span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Cartes KPI
          </div>
          <div className="flex flex-wrap gap-2.5">
            <KpiCard
              icon={<DocIcon size={16} className="text-mut" />}
              label="SOPs"
              value="18/90"
              subtitle="33 en cours · 39 planifiées"
            />
            <KpiCard
              icon={<ZapIcon size={16} className="text-mut" />}
              label="CAPA"
              value="3"
              subtitle="1 en retard"
              accent="amber"
            />
            <KpiCard
              icon={<UsersIcon size={16} className="text-mut" />}
              label="Habilitations"
              value="75%"
              subtitle="2 expirent sous 30j"
            />
            <KpiCard
              icon={<ToolIcon size={16} className="text-mut" />}
              label="Équipements"
              value="92%"
              subtitle="1 maintenance due"
            />
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Badges
          </div>
          <div className="flex gap-2.5 items-center">
            <Badge variant="ok">Validé</Badge>
            <Badge variant="wip">En cours</Badge>
            <Badge variant="plan">Planifié</Badge>
            <Badge variant="crit">Critique</Badge>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Barres de progression
          </div>
          <div className="bg-card border border-brd rounded-md p-4 space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-text font-semibold">
                  PDA — 3/3 validées
                </span>
                <span className="text-[11px] text-mut">100%</span>
              </div>
              <ProgressBar3 green={3} amber={0} total={3} />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-text font-semibold">
                  Conformité réglementaire — 7/10
                </span>
                <span className="text-[11px] text-mut">70%</span>
              </div>
              <ProgressBar3 green={5} amber={2} total={10} />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-text font-semibold">
                  Orthopédie — 0/5
                </span>
                <span className="text-[11px] text-mut">0%</span>
              </div>
              <ProgressBar3 green={0} amber={0} total={5} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Alertes
          </div>
          <div className="flex flex-col gap-1.5">
            <AlertLine
              severity="red"
              message="CAPA-004 : Qualification sonde T° PDA — échéance dépassée"
            />
            <AlertLine
              severity="amber"
              message="SOP-RH-004 : Matrice habilitations — en cours depuis 90 jours"
            />
            <AlertLine
              severity="amber"
              message="2 habilitations expirent sous 30 jours (PDA, stupéfiants)"
            />
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Tableau de données
          </div>
          <DataTable columns={columns} data={data} />
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Cellules éditables
          </div>
          <div className="bg-card border border-brd rounded-md p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-mut w-24">Texte:</span>
              <EditableCell
                value="SOP-PDA-001"
                onSave={(v) => console.log("Saved:", v)}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-mut w-24">Nombre:</span>
              <EditableCell
                value={42}
                onSave={(v) => console.log("Saved:", v)}
                type="number"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-mut w-24">Date:</span>
              <EditableCell
                value="2026-03-15"
                onSave={(v) => console.log("Saved:", v)}
                type="date"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-mut w-24">Select:</span>
              <EditableCell
                value="wip"
                onSave={(v) => console.log("Saved:", v)}
                type="select"
                options={[
                  { value: "ok", label: "Validé" },
                  { value: "wip", label: "En cours" },
                  { value: "plan", label: "Planifié" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Boutons d'action
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <AddButton onClick={() => console.log("Add")} label="Ajouter un élément" />
            <button
              onClick={() => setModalOpen(true)}
              className="bg-card border border-brd rounded-md px-3 py-1.5 text-[12px] text-text hover:bg-elev transition-colors"
            >
              Ouvrir modal
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="bg-card border border-brd rounded-md px-3 py-1.5 text-[12px] text-text hover:bg-elev transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-[9px] font-bold uppercase tracking-[2.5px] text-mut mb-5 pb-2 border-b border-brd">
            Icônes d'action
          </div>
          <div className="bg-card border border-brd rounded-md p-4 flex flex-wrap gap-3">
            <PlusIcon className="text-accent" />
            <TrashIcon className="text-red" />
            <EditIcon className="text-sec" />
            <DownloadIcon className="text-sec" />
            <UploadIcon className="text-sec" />
            <ChevronDownIcon className="text-sec" />
            <ChevronRightIcon className="text-sec" />
            <CheckIcon className="text-grn" />
            <XMarkIcon className="text-red" />
            <BellIcon className="text-amb" />
          </div>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Exemple de modal">
          <div className="space-y-3">
            <p className="text-[14px] text-sec">
              Ceci est un exemple de modal générique. Il peut contenir n'importe quel
              contenu React.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-accent text-bg rounded-md px-4 py-2 text-[12px] font-semibold hover:opacity-90 transition-opacity"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmDelete
          isOpen={deleteOpen}
          onConfirm={() => console.log("Deleted")}
          onCancel={() => setDeleteOpen(false)}
          itemName="SOP-PDA-001"
        />

        <div className="mt-12 pt-3 border-t border-brd text-center">
          <span className="text-[10px] text-mut">
            Design System — Dashboard PRAQ v2 — Pharma78 — Classification L1
          </span>
        </div>
      </div>
    </div>
  );
}
