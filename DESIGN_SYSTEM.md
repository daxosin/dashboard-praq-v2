# Design System Dashboard PRAQ v2 - Pharma78

## Fichiers créés

### Configuration

- **tailwind.config.ts** - Configuration Tailwind avec extensions couleurs et polices
- **src/styles/tokens.css** - Variables CSS source de vérité (mode nuit/jour)
- **src/app/globals.css** - Import des tokens et styles de base

### Icônes (23 composants SVG)

**Fichier:** `src/components/icons/index.tsx`

Navigation et modules:
- GridIcon - Tableau de bord
- DocIcon - Documents
- ZapIcon - CAPA
- SearchIcon - Audits
- TriangleIcon - Risques
- ShieldIcon - Vigilances
- UsersIcon - Formations
- ToolIcon - Équipements
- TruckIcon - Fournisseurs
- MsgIcon - Réclamations
- BarChartIcon - Indicateurs
- ClipboardIcon - Revue direction

Actions:
- PlusIcon - Ajouter
- TrashIcon - Supprimer
- EditIcon - Éditer
- DownloadIcon - Télécharger
- UploadIcon - Importer
- ChevronDownIcon - Déplier
- ChevronRightIcon - Naviguer
- CheckIcon - Valider
- XMarkIcon - Fermer
- BellIcon - Notifications
- SunIcon - Mode jour
- MoonIcon - Mode nuit

### Composants UI (11 composants)

**Répertoire:** `src/components/ui/`

1. **Badge.tsx** - Badges de statut (ok, wip, plan, crit)
2. **KpiCard.tsx** - Cartes indicateurs avec icône et bordure colorée
3. **ProgressBar3.tsx** - Barre de progression 3 segments (vert/ambre/gris)
4. **AlertLine.tsx** - Ligne d'alerte avec dot et bordure (rouge/ambre)
5. **EditableCell.tsx** - Cellule éditable au clic (text/number/date/select)
6. **DataTable.tsx** - Table complète (tri, filtre, hover)
7. **ThemeToggle.tsx** - Bouton bascule mode nuit/jour avec cookie
8. **ScoreGauge.tsx** - Jauge circulaire SVG auto-colorée
9. **AddButton.tsx** - Bouton dashed avec icône Plus
10. **Modal.tsx** - Modal overlay générique
11. **ConfirmDelete.tsx** - Modal de confirmation suppression

**Export centralisé:** `src/components/ui/index.tsx`

### Documentation

- **src/components/README.md** - Documentation complète du design system
- **DESIGN_SYSTEM.md** - Ce fichier (récapitulatif)

### Démo

- **src/app/design-system/page.tsx** - Page de démonstration interactive

## Variables CSS (tokens.css)

### Mode nuit (défaut)
```css
--bg: #1A1A1A
--card: #242424
--elev: #2A2A2A
--accent: #00FF88
--text: #FFFFFF
--sec: #C8C8C8
--mut: #888888
--brd: #505050
--grn: #00FF88
--amb: #FFB800
--red: #FF4444
--font: 'Montserrat', sans-serif
```

### Mode jour
```css
--bg: #FAFBFC
--card: #FFFFFF
--elev: #F0F2F4
--accent: #C4A35A
--text: #1A1A1A
--sec: #5A6570
--mut: #8A929A
--brd: #E5E7EB
--grn: #2E7D5A
--amb: #D4860B
--red: #C0392B
--font: Arial, sans-serif
```

## Import des composants

```tsx
// Icônes
import { DocIcon, ZapIcon, GridIcon } from "@/components/icons";

// Composants UI
import {
  Badge,
  KpiCard,
  DataTable,
  ThemeToggle,
  ScoreGauge,
  Modal
} from "@/components/ui";

// Exemple d'utilisation
<KpiCard
  icon={<DocIcon size={16} className="text-mut" />}
  label="SOPs"
  value="18/90"
  subtitle="33 en cours · 39 planifiées"
/>
```

## Tailwind classes personnalisées

Couleurs:
- `bg-bg`, `bg-card`, `bg-elev`
- `text-text`, `text-sec`, `text-mut`
- `border-brd`, `border-accent`
- `text-grn`, `text-amb`, `text-red`
- `bg-grn`, `bg-amb`, `bg-red`

Polices:
- `font-montserrat`
- `font-arial`
- `font-mono`

## Accès à la démo

Naviguer vers: `/design-system`

Affiche tous les composants dans leur contexte avec exemples interactifs.

## Conventions strictes

- Tous les composants sont "use client"
- TypeScript strict
- ZERO emoji
- Exports nommés
- Styles via Tailwind + variables CSS
- Transitions 0.2s
- Responsive (flex/grid)

## Source de vérité

**docs/design-validation.html** - Référence visuelle et valeurs exactes

## Prochaines étapes

1. Tester les composants dans les pages métier
2. Créer variantes si nécessaire
3. Documenter patterns d'utilisation spécifiques
4. Optimiser performances si besoin
