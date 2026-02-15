# Dashboard PRAQ v2 — Pharma78 — Cockpit Qualité ISO 9001:2015

## Contexte

- **Entité** : Pharma78 — Pharmacie 2500m² Bois-d'Arcy (78), ouverture mars 2026
- **9 EHPAD**, PDA robotisée, officine, orthopédie, luxe, téléconsultation
- **Utilisateur** : PRAQ (Pharmacien Responsable Assurance Qualité)
- **Branding** : "Pharma78" UNIQUEMENT — JAMAIS "H8 Pharma"
- **Classification** : L1 — Données métier qualité, zéro donnée patient

## Docs de référence — LIRE AVANT DE CODER

- `docs/PRD.md` — PRD complet (12 onglets, schema BDD, critères acceptance)
- `docs/context.json` — Contexte structuré (21 tables, tabs, roles)
- `docs/design-validation.html` — Charte CSS validée (tokens, composants)

## Stack

Next.js 15 (App Router) + Supabase (PostgreSQL) + Tailwind CSS + Recharts
Auth : Supabase Auth (email/pwd dashboard) + PIN 4 chiffres (terrain)
Icônes : SVG inline monochromes UNIQUEMENT — **ZERO EMOJI NULLE PART**

## Règles absolues

1. ZERO EMOJI — SVG trait 1.5-2px monochrome uniquement
2. Branding "Pharma78" — aucune référence H8 Pharma
3. Édition en ligne — clic sur donnée = édition sur place, sauvegarde silencieuse
4. Signalétique 3 feux — vert (#00FF88/#2E7D5A) ambre (#FFB800/#D4860B) rouge (#FF4444/#C0392B)
5. Mode nuit (défaut) / jour avec toggle, transition 0.2s
6. 90 SOPs pré-chargées (18 validées, 33 en cours, 39 planifiées)
7. 12 onglets tous navigables avec CRUD complet
8. Supabase pour TOUTE persistance

## Routing agents

| Tâche | Agent |
|-------|-------|
| Schema SQL, migrations, RLS, triggers, seed, types TS | db-architect |
| Tokens CSS nuit/jour, SVG icons, composants UI base | design-system |
| Scaffold Next.js, layout, routing, hooks, providers, auth | frontend-architect |
| Implémentation onglet N (CRUD + graphiques + alertes) | tab-builder |
| Route /declare, PIN pad, formulaire terrain | terrain-builder |
| Revue conformité PRD + charte + 30 critères acceptance | qa-reviewer |

## Parallélisation

**Phase A** — 3 subagents EN PARALLÈLE (db-architect + design-system + frontend-architect)
**Phase B** — 4 batches de 3 tab-builders EN PARALLÈLE
**Phase C** — terrain-builder séquentiel
**Phase D** — intégration + qa-reviewer

## Conventions

TypeScript strict, PascalCase composants, kebab-case fichiers
src/lib/supabase.ts, src/lib/types.ts, src/lib/hooks/, src/components/ui/, src/components/tabs/, src/components/icons/

## Routing

```
src/app/
├── page.tsx                         (login)
├── dashboard/
│   ├── layout.tsx                   (header + tab bar + auth guard)
│   ├── page.tsx                     (redirect → tableau-de-bord)
│   ├── tableau-de-bord/page.tsx     (onglet 1)
│   ├── documents/page.tsx           (onglet 2)
│   ├── capa/page.tsx                (onglet 3)
│   ├── audits/page.tsx              (onglet 4)
│   ├── risques/page.tsx             (onglet 5)
│   ├── vigilances/page.tsx          (onglet 6)
│   ├── formations/page.tsx          (onglet 7)
│   ├── equipements/page.tsx         (onglet 8)
│   ├── fournisseurs/page.tsx        (onglet 9)
│   ├── reclamations/page.tsx        (onglet 10)
│   ├── indicateurs/page.tsx         (onglet 11)
│   ├── revue-direction/page.tsx     (onglet 12)
├── declare/
    ├── page.tsx                     (PIN pad)
    └── form/page.tsx                (formulaire terrain)
```
