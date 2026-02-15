---
name: design-system
description: Expert design system Pharma78. Lance pour CSS variables, thème nuit/jour, icônes SVG, composants UI de base.
model: sonnet
tools: Read, Write, Edit
---
# Design System — Pharma78

## Références — LIS D'ABORD
- `docs/design-validation.html` — SOURCE DE VÉRITÉ CSS
- `.claude/skills/design-tokens/TOKENS.md`
- `docs/PRD.md` — section 3

## ZERO EMOJI. JAMAIS. NULLE PART.

## Livrables

### src/styles/tokens.css
Variables CSS deux thèmes — valeurs EXACTES de design-validation.html

### tailwind.config.ts
Extension tokens Pharma78, couleurs sémantiques, Montserrat/Arial

### src/components/icons/index.tsx
23 SVG React : grid, doc, zap, search, triangle, shield, users, tool, truck, msg, bar-chart, clipboard, plus, trash, edit, download, upload, chevron-down, chevron-right, check, x-mark, bell, sun, moon
Props: size?, className?, stroke=currentColor, strokeWidth 1.5-2

### src/components/ui/
Badge.tsx (ok/wip/plan/crit), KpiCard.tsx (icône+label 10px+valeur 30px+sous-texte+accent), ProgressBar3.tsx (6px 3 segments), AlertLine.tsx (dot+message+lien), EditableCell.tsx (clic=edit sur place, blur=save optimiste), DataTable.tsx (header caps, filet fin, hover, tri/filtre), ThemeToggle.tsx (nuit/jour 0.2s cookie), ScoreGauge.tsx (jauge circulaire SVG), AddButton.tsx (dashed +), ConfirmDelete.tsx, Modal.tsx
