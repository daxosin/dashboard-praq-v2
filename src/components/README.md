# Design System - Dashboard PRAQ v2 Pharma78

## Vue d'ensemble

Système de design complet pour le Dashboard PRAQ v2, conforme ISO 9001:2015.
Mode nuit (défaut) et mode jour.

## Structure

```
src/
├── styles/
│   └── tokens.css          # Variables CSS (source de vérité)
├── components/
│   ├── icons/
│   │   └── index.tsx       # 23 icônes SVG
│   └── ui/
│       ├── Badge.tsx
│       ├── KpiCard.tsx
│       ├── ProgressBar3.tsx
│       ├── AlertLine.tsx
│       ├── EditableCell.tsx
│       ├── DataTable.tsx
│       ├── ThemeToggle.tsx
│       ├── ScoreGauge.tsx
│       ├── AddButton.tsx
│       ├── Modal.tsx
│       ├── ConfirmDelete.tsx
│       └── index.tsx       # Exports
```

## Tokens CSS

### Couleurs

**Mode nuit (défaut)**
- `--bg: #1A1A1A` - Fond principal
- `--card: #242424` - Fond de carte
- `--elev: #2A2A2A` - Fond élevé
- `--accent: #00FF88` - Accent
- `--text: #FFFFFF` - Texte principal
- `--sec: #C8C8C8` - Texte secondaire
- `--mut: #888888` - Texte muté
- `--brd: #505050` - Bordures
- `--grn: #00FF88` - Vert (OK)
- `--amb: #FFB800` - Ambre (Attention)
- `--red: #FF4444` - Rouge (Critique)

**Mode jour**
- `--bg: #FAFBFC`
- `--card: #FFFFFF`
- `--elev: #F0F2F4`
- `--accent: #C4A35A`
- `--text: #1A1A1A`
- `--sec: #5A6570`
- `--mut: #8A929A`
- `--brd: #E5E7EB`
- `--grn: #2E7D5A`
- `--amb: #D4860B`
- `--red: #C0392B`

## Composants

### Icons

23 icônes SVG avec props uniformes:
- `size?: number` (défaut varie selon l'icône)
- `className?: string`

**Liste des icônes:**
GridIcon, DocIcon, ZapIcon, SearchIcon, TriangleIcon, ShieldIcon, UsersIcon, ToolIcon, TruckIcon, MsgIcon, BarChartIcon, ClipboardIcon, PlusIcon, TrashIcon, EditIcon, DownloadIcon, UploadIcon, ChevronDownIcon, ChevronRightIcon, CheckIcon, XMarkIcon, BellIcon, SunIcon, MoonIcon

### Badge

Variantes: `ok`, `wip`, `plan`, `crit`

```tsx
<Badge variant="ok">Validé</Badge>
<Badge variant="wip">En cours</Badge>
<Badge variant="plan">Planifié</Badge>
<Badge variant="crit">Critique</Badge>
```

### KpiCard

Carte indicateur avec bordure gauche colorée.

```tsx
<KpiCard
  icon={<DocIcon size={16} />}
  label="SOPs"
  value="18/90"
  subtitle="33 en cours · 39 planifiées"
  accent="default"
/>
```

### ProgressBar3

Barre de progression à 3 segments (vert, ambre, gris).

```tsx
<ProgressBar3 green={18} amber={33} total={90} />
```

### AlertLine

Ligne d'alerte avec dot et bordure gauche.

```tsx
<AlertLine
  severity="red"
  message="CAPA-004 : échéance dépassée"
  href="/capa/004"
/>
```

### EditableCell

Cellule éditable au clic avec sauvegarde optimiste.

```tsx
<EditableCell
  value="SOP-PDA-001"
  onSave={(newValue) => console.log(newValue)}
  type="text"
/>

<EditableCell
  value="wip"
  onSave={(newValue) => console.log(newValue)}
  type="select"
  options={[
    { value: "ok", label: "Validé" },
    { value: "wip", label: "En cours" },
  ]}
/>
```

### DataTable

Table complète avec tri, filtre, et hover.

```tsx
<DataTable
  columns={[
    { key: "code", label: "Code", sortable: true },
    { key: "title", label: "Titre", sortable: true },
    {
      key: "status",
      label: "Statut",
      render: (row) => <Badge variant={row.status}>{row.statusLabel}</Badge>,
    },
  ]}
  data={[
    { code: "SOP-001", title: "...", status: "ok", statusLabel: "Validé" },
  ]}
  onRowClick={(row) => console.log(row)}
/>
```

### ThemeToggle

Bouton de bascule mode nuit/jour avec sauvegarde cookie.

```tsx
<ThemeToggle />
```

### ScoreGauge

Jauge circulaire SVG avec couleur auto selon score.

```tsx
<ScoreGauge score={57} label="Score SMQ" />
```

### AddButton

Bouton dashed avec icône Plus.

```tsx
<AddButton onClick={() => console.log("Add")} label="Ajouter un élément" />
```

### Modal

Modal overlay générique.

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Titre">
  <p>Contenu du modal</p>
</Modal>
```

### ConfirmDelete

Modal de confirmation avant suppression.

```tsx
<ConfirmDelete
  isOpen={isOpen}
  onConfirm={() => console.log("Delete")}
  onCancel={() => setIsOpen(false)}
  itemName="SOP-001"
/>
```

## Utilisation

```tsx
import { Badge, KpiCard, DataTable } from "@/components/ui";
import { DocIcon, ZapIcon } from "@/components/icons";

export default function Page() {
  return (
    <div>
      <KpiCard
        icon={<DocIcon size={16} />}
        label="SOPs"
        value="18/90"
        subtitle="33 en cours"
      />
      <Badge variant="ok">Validé</Badge>
    </div>
  );
}
```

## Conventions

- Tous les composants sont "use client"
- TypeScript strict avec exports nommés
- ZERO emoji
- Styles via Tailwind + variables CSS custom
- Transitions 0.2s
- Responsive (flex/grid)
