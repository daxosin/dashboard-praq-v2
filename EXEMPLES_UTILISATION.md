# Exemples d'utilisation - Design System PRAQ

## Import de base

```tsx
"use client";

import {
  Badge,
  KpiCard,
  DataTable,
  ProgressBar3,
  AlertLine,
  ThemeToggle,
  ScoreGauge,
  AddButton,
  Modal,
  ConfirmDelete,
  EditableCell
} from "@/components/ui";

import {
  DocIcon,
  ZapIcon,
  ToolIcon,
  UsersIcon,
  GridIcon,
  TriangleIcon,
  SearchIcon,
  ShieldIcon,
  TruckIcon,
  MsgIcon,
  BarChartIcon,
  ClipboardIcon
} from "@/components/icons";
```

## 1. Badge - Statuts

```tsx
// Statuts de documents
<Badge variant="ok">Validé</Badge>
<Badge variant="wip">En cours</Badge>
<Badge variant="plan">Planifié</Badge>
<Badge variant="crit">Critique</Badge>

// Dans un tableau
<td>
  <Badge variant={sop.status === 'validated' ? 'ok' : 'wip'}>
    {sop.statusLabel}
  </Badge>
</td>
```

## 2. KpiCard - Indicateurs

```tsx
// Page dashboard
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
    value={`${(stats.validated / stats.total * 100).toFixed(0)}%`}
    subtitle={`${stats.expiringSoon} expirent sous 30j`}
  />
</div>
```

## 3. ProgressBar3 - Avancement

```tsx
// Module Documents
const stats = {
  validated: 18,
  inProgress: 33,
  total: 90
};

<div className="bg-card border border-brd rounded-md p-4">
  <div className="flex justify-between mb-1.5">
    <span className="text-[12px] text-text font-semibold">
      SOPs — {stats.validated}/{stats.total}
    </span>
    <span className="text-[11px] text-mut">
      {Math.round((stats.validated + stats.inProgress) / stats.total * 100)}%
    </span>
  </div>
  <ProgressBar3
    green={stats.validated}
    amber={stats.inProgress}
    total={stats.total}
  />
</div>
```

## 4. AlertLine - Notifications

```tsx
// Liste des alertes prioritaires
<div className="flex flex-col gap-1.5">
  {alerts.map(alert => (
    <AlertLine
      key={alert.id}
      severity={alert.severity}
      message={alert.message}
      href={`/capa/${alert.id}`}
    />
  ))}
</div>

// Exemple de données
const alerts = [
  {
    id: 'CAPA-004',
    severity: 'red',
    message: 'CAPA-004 : Qualification sonde T° PDA — échéance dépassée'
  },
  {
    id: 'SOP-RH-004',
    severity: 'amber',
    message: 'SOP-RH-004 : Matrice habilitations — en cours depuis 90 jours'
  }
];
```

## 5. DataTable - Tableaux complets

```tsx
// Page Documents/SOPs
const columns = [
  {
    key: "code",
    label: "Code",
    sortable: true,
    render: (row) => <span className="mono">{row.code}</span>
  },
  {
    key: "title",
    label: "Titre",
    sortable: true,
    render: (row) => <span className="text-sec">{row.title}</span>
  },
  {
    key: "domain",
    label: "Domaine",
    sortable: true
  },
  {
    key: "responsible",
    label: "Responsable",
    sortable: false
  },
  {
    key: "status",
    label: "Statut",
    render: (row) => (
      <Badge variant={row.status}>
        {row.statusLabel}
      </Badge>
    )
  }
];

const data = sops.map(sop => ({
  code: sop.code,
  title: sop.title,
  domain: sop.domain,
  responsible: sop.responsible,
  status: sop.status,
  statusLabel: sop.statusLabel
}));

<DataTable
  columns={columns}
  data={data}
  onRowClick={(row) => router.push(`/documents/${row.code}`)}
/>
```

## 6. EditableCell - Édition inline

```tsx
// Table éditable
<table className="w-full">
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>
          <EditableCell
            value={item.code}
            onSave={(newValue) => updateItem(item.id, { code: newValue })}
          />
        </td>
        <td>
          <EditableCell
            value={item.deadline}
            onSave={(newValue) => updateItem(item.id, { deadline: newValue })}
            type="date"
          />
        </td>
        <td>
          <EditableCell
            value={item.status}
            onSave={(newValue) => updateItem(item.id, { status: newValue })}
            type="select"
            options={[
              { value: "ok", label: "Validé" },
              { value: "wip", label: "En cours" },
              { value: "plan", label: "Planifié" }
            ]}
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

## 7. ThemeToggle - Bascule mode

```tsx
// Header de l'application
<header className="flex justify-between items-center p-6">
  <div>
    <h1 className="text-h1">Dashboard PRAQ</h1>
  </div>
  <div className="flex gap-2.5 items-center">
    <ScoreGauge score={smqScore} label="Score SMQ" />
    <ThemeToggle />
  </div>
</header>
```

## 8. ScoreGauge - Jauge circulaire

```tsx
// Dashboard principal
<ScoreGauge
  score={smqScore}
  size={44}
  label="Score SMQ"
/>

// Indicateur plus grand
<ScoreGauge
  score={conformityScore}
  size={80}
  label="Conformité"
/>
```

## 9. AddButton - Ajout d'éléments

```tsx
// En-tête de section
<div className="flex justify-between items-center mb-4">
  <h2 className="text-h2">Documents</h2>
  <AddButton
    onClick={() => setShowCreateModal(true)}
    label="Nouvelle SOP"
  />
</div>

// Liste vide
{items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-mut mb-4">Aucun élément</p>
    <AddButton
      onClick={() => setShowCreateModal(true)}
      label="Ajouter le premier"
    />
  </div>
)}
```

## 10. Modal - Formulaires et détails

```tsx
// Modal de création
const [isOpen, setIsOpen] = useState(false);

<>
  <AddButton onClick={() => setIsOpen(true)} label="Nouvelle SOP" />

  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Créer une SOP"
  >
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[12px] text-mut">Code</label>
        <input
          type="text"
          className="w-full bg-card border border-brd rounded px-3 py-2 text-text"
        />
      </div>
      <div>
        <label className="text-[12px] text-mut">Titre</label>
        <input
          type="text"
          className="w-full bg-card border border-brd rounded px-3 py-2 text-text"
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="bg-card border border-brd rounded px-4 py-2 text-[12px]"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-accent text-bg rounded px-4 py-2 text-[12px] font-semibold"
        >
          Créer
        </button>
      </div>
    </form>
  </Modal>
</>
```

## 11. ConfirmDelete - Confirmation suppression

```tsx
// Action de suppression
const [deleteId, setDeleteId] = useState<string | null>(null);

<>
  <button
    onClick={() => setDeleteId(item.id)}
    className="text-red hover:opacity-80"
  >
    <TrashIcon size={16} />
  </button>

  <ConfirmDelete
    isOpen={deleteId !== null}
    onConfirm={async () => {
      await deleteItem(deleteId);
      setDeleteId(null);
    }}
    onCancel={() => setDeleteId(null)}
    itemName={items.find(i => i.id === deleteId)?.code}
  />
</>
```

## Exemple de page complète

```tsx
"use client";

import { useState } from "react";
import {
  KpiCard,
  DataTable,
  AlertLine,
  ThemeToggle,
  AddButton,
  Modal
} from "@/components/ui";
import { DocIcon, ZapIcon } from "@/components/icons";

export default function DocumentsPage() {
  const [showCreate, setShowCreate] = useState(false);

  const stats = {
    validated: 18,
    inProgress: 33,
    planned: 39,
    total: 90
  };

  const urgentAlerts = [
    {
      id: 1,
      severity: 'red' as const,
      message: 'SOP-PDA-001 : Révision annuelle échue depuis 15 jours'
    }
  ];

  return (
    <div className="min-h-screen bg-bg p-6">
      <header className="max-w-[1200px] mx-auto mb-8 flex justify-between items-center">
        <div>
          <div className="tag mb-2">Module Documents</div>
          <h1 className="text-h1">Procédures et SOPs</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* KPIs */}
        <div className="flex flex-wrap gap-2.5">
          <KpiCard
            icon={<DocIcon size={16} className="text-mut" />}
            label="Validées"
            value={`${stats.validated}/${stats.total}`}
            subtitle={`${Math.round(stats.validated/stats.total*100)}% conformité`}
          />
          <KpiCard
            icon={<ZapIcon size={16} className="text-mut" />}
            label="En cours"
            value={stats.inProgress}
            subtitle="Révision en cours"
            accent="amber"
          />
        </div>

        {/* Alertes */}
        {urgentAlerts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {urgentAlerts.map(alert => (
              <AlertLine key={alert.id} {...alert} />
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-brd rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-h2">Liste des SOPs</h2>
            <AddButton
              onClick={() => setShowCreate(true)}
              label="Nouvelle SOP"
            />
          </div>

          <DataTable
            columns={[
              { key: "code", label: "Code", sortable: true },
              { key: "title", label: "Titre", sortable: true },
              { key: "status", label: "Statut" }
            ]}
            data={[]}
            onRowClick={(row) => console.log(row)}
          />
        </div>
      </div>

      {/* Modal création */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Créer une SOP"
      >
        <div className="text-sec">Formulaire de création...</div>
      </Modal>
    </div>
  );
}
```

## Classes Tailwind utiles

```tsx
// Conteneurs
className="max-w-[1200px] mx-auto"
className="bg-card border border-brd rounded-md p-4"

// Texte
className="text-text text-[14px]"
className="text-sec text-[12px]"
className="text-mut text-[11px]"
className="mono text-accent"

// Spacing
className="space-y-4"  // gap vertical
className="flex gap-2.5"  // gap horizontal
className="mb-4 mt-6"

// Hover
className="hover:bg-elev transition-colors"
className="hover:text-accent"

// Layout
className="flex justify-between items-center"
className="grid grid-cols-2 gap-4"
```
