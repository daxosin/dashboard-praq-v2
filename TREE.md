# Structure du projet Dashboard PRAQ v2

```
PRAQ dash/
├── docs/
│   ├── context.json                      Contexte projet
│   └── PRD.md                            Product Requirements Document
│
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── audits/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 4
│   │   │   ├── capa/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 3
│   │   │   ├── documents/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 2
│   │   │   ├── equipements/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 8
│   │   │   ├── formations/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 7
│   │   │   ├── fournisseurs/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 9
│   │   │   ├── indicateurs/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 11
│   │   │   ├── reclamations/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 10
│   │   │   ├── revue-direction/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 12
│   │   │   ├── risques/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 5
│   │   │   ├── tableau-de-bord/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 1
│   │   │   ├── vigilances/
│   │   │   │   └── page.tsx              [CRÉÉ] Placeholder onglet 6
│   │   │   ├── layout.tsx                [CRÉÉ] Auth guard, header, tabs
│   │   │   └── page.tsx                  [CRÉÉ] Redirect → tableau-de-bord
│   │   │
│   │   ├── globals.css                   [CRÉÉ] Tailwind, tokens, styles
│   │   ├── layout.tsx                    [CRÉÉ] RootLayout avec Providers
│   │   ├── page.tsx                      [CRÉÉ] Login Pharma78
│   │   └── providers.tsx                 [CRÉÉ] Supabase, Theme, Auth contexts
│   │
│   ├── components/
│   │   ├── icons/
│   │   │   └── index.tsx                 [EXISTANT] Icônes SVG
│   │   └── ui/
│   │       ├── AddButton.tsx             [EXISTANT] Bouton ajout
│   │       ├── AlertLine.tsx             [EXISTANT] Ligne alerte
│   │       ├── Badge.tsx                 [EXISTANT] Badges colorés
│   │       ├── ConfirmDelete.tsx         [EXISTANT] Confirmation suppression
│   │       ├── DataTable.tsx             [EXISTANT] Tableau données
│   │       ├── EditableCell.tsx          [EXISTANT] Cellule éditable
│   │       ├── KpiCard.tsx               [EXISTANT] Carte KPI
│   │       ├── Modal.tsx                 [EXISTANT] Fenêtre modale
│   │       ├── ProgressBar3.tsx          [EXISTANT] Barre tricolore
│   │       ├── ScoreGauge.tsx            [EXISTANT] Jauge circulaire
│   │       └── ThemeToggle.tsx           [EXISTANT] Toggle thème
│   │
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── useAlerts.ts              [CRÉÉ] Fetch alerts_view
│   │   │   ├── useAuth.ts                [CRÉÉ] Auth Supabase
│   │   │   ├── useEditableField.ts       [CRÉÉ] Édition inline
│   │   │   ├── useRealtime.ts            [CRÉÉ] Realtime subscription
│   │   │   ├── useSmqScore.ts            [CRÉÉ] Calcul score SMQ
│   │   │   └── useSupabaseCrud.ts        [CRÉÉ] CRUD générique
│   │   │
│   │   ├── database.types.ts             [EXISTANT] Types Supabase
│   │   ├── supabase.ts                   [CRÉÉ] Client Supabase SSR
│   │   └── types.ts                      [CRÉÉ] Types app + TABS[]
│   │
│   └── styles/
│       └── tokens.css                    [EXISTANT] Variables CSS thème
│
├── .env.local.example                    [EXISTANT] Template env vars
├── next.config.ts                        [CRÉÉ] Config Next.js 15
├── package.json                          [EXISTANT] Dépendances
├── postcss.config.mjs                    [CRÉÉ] Config PostCSS
├── tsconfig.json                         [CRÉÉ] Config TypeScript
│
└── Documentation/
    ├── CHECK_SCAFFOLD.md                 [CRÉÉ] Checklist validation
    ├── FRONTEND_SCAFFOLD_COMPLETE.md     [CRÉÉ] Récapitulatif complet
    ├── SCAFFOLD.md                       [CRÉÉ] Documentation technique
    ├── TREE.md                           [CRÉÉ] Ce fichier
    └── VALIDATION.md                     [CRÉÉ] Procédure validation
```

## Légende

- `[CRÉÉ]` : Fichier créé par frontend-architect
- `[EXISTANT]` : Fichier déjà présent dans le projet

## Statistiques

### Fichiers créés par frontend-architect
- Configuration : 3 (tsconfig.json, next.config.ts, postcss.config.mjs)
- Styles : 1 (globals.css)
- Lib : 2 (supabase.ts, types.ts)
- Hooks : 6 (useAlerts, useAuth, useEditableField, useRealtime, useSmqScore, useSupabaseCrud)
- Providers : 1 (providers.tsx)
- Layouts : 2 (app/layout.tsx, dashboard/layout.tsx)
- Pages : 14 (login + dashboard redirect + 12 onglets)
- Documentation : 5 (CHECK_SCAFFOLD, COMPLETE, SCAFFOLD, TREE, VALIDATION)

**TOTAL : 34 fichiers créés**

### Fichiers existants réutilisés
- Composants UI : 11 (Badge, KpiCard, DataTable, etc.)
- Composants Icons : 1 (index.tsx)
- Styles : 1 (tokens.css)
- Database : 1 (database.types.ts)
- Config : 2 (package.json, .env.local.example)
- Docs : 2 (context.json, PRD.md)

**TOTAL : 18 fichiers existants**

## Routes créées

### Publiques
- `/` - Login email/password

### Protégées (auth required)
- `/dashboard` - Redirect → `/dashboard/tableau-de-bord`
- `/dashboard/tableau-de-bord` - Onglet 1 (Score SMQ, alertes, KPI)
- `/dashboard/documents` - Onglet 2 (SOPs)
- `/dashboard/capa` - Onglet 3 (CAPA & NC)
- `/dashboard/audits` - Onglet 4 (Audits)
- `/dashboard/risques` - Onglet 5 (Risques AMDEC)
- `/dashboard/vigilances` - Onglet 6 (Vigilances)
- `/dashboard/formations` - Onglet 7 (Habilitations)
- `/dashboard/equipements` - Onglet 8 (Maintenance)
- `/dashboard/fournisseurs` - Onglet 9 (Évaluations)
- `/dashboard/reclamations` - Onglet 10 (Satisfaction)
- `/dashboard/indicateurs` - Onglet 11 (Tendances)
- `/dashboard/revue-direction` - Onglet 12 (§9.3)

## Hooks disponibles

### CRUD & Data
- `useSupabaseCrud(tableName, options)` - CRUD générique avec optimistic updates
- `useRealtime(tableName, initialData)` - Subscription Realtime

### Auth
- `useAuth()` - signIn, signOut, user, session, loading

### Business Logic
- `useAlerts()` - Fetch alerts_view triées par severity
- `useSmqScore()` - Calcul score SMQ pondéré (7 sources)

### UI
- `useEditableField(initialValue, onSave)` - Édition inline optimiste

## Contexts disponibles

### Providers.tsx exports
- `useSupabase()` - Client Supabase Browser
- `useAuthContext()` - user, session, loading
- `useTheme()` - theme, toggleTheme

## Prochaine étape

L'agent **tab-builder** implémentera le contenu réel des 12 pages onglets en utilisant :
- Les hooks créés (useSupabaseCrud, useAlerts, useSmqScore, etc.)
- Les composants UI existants (Badge, KpiCard, DataTable, etc.)
- Les types définis (database.types.ts, types.ts)
- La charte graphique (tokens.css)

Chaque page placeholder sera remplacée par :
- Fetch data depuis Supabase
- Affichage KPI cards
- DataTable CRUD
- Graphiques Recharts
- Alertes spécifiques
- Liens inter-onglets

---

Frontend Architect : Claude Sonnet 4.5
Scaffold complet et validé
15 février 2026
